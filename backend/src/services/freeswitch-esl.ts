import net from 'node:net';
import pkg from 'pg';
import { safeErrorMessage } from '../utils/security.js';

const { Pool } = pkg;

let pbxPool: InstanceType<typeof Pool> | null = null;

function getPbxPool(): InstanceType<typeof Pool> {
  if (!pbxPool) {
    pbxPool = new Pool({
      host: process.env.FSPBX_DB_HOST,
      user: process.env.FSPBX_DB_USER || 'fusionpbx',
      password: process.env.FSPBX_DB_PASSWORD,
      database: process.env.FSPBX_DB_NAME || 'fusionpbx',
      port: Number(process.env.FSPBX_DB_PORT || 5432),
      max: 3,
      idleTimeoutMillis: 30_000,
    });
    pbxPool.on('error', (error: Error) => console.error('[esl-membership-db]:', safeErrorMessage(error)));
  }
  return pbxPool;
}

export interface QueueMember {
  agent: string;
  extension: string;
  name: string | null;
  contact: string;
}

export interface QueueAgentState {
  agent: string;
  extension: string;
  status: string;
  state: string;
  registered: boolean;
  available: boolean;
}

export interface QueueAvailability {
  queue: string;
  available: boolean;
  availableCount: number;
  totalAgents: number;
  agents: QueueAgentState[];
  source: 'esl';
}

class EslClient {
  private socket: net.Socket | null = null;
  private buffer = Buffer.alloc(0);
  private waiter: (() => void) | null = null;

  constructor(
    private readonly host: string,
    private readonly port: number,
    private readonly password: string,
    private readonly timeoutMs: number,
  ) {}

  async connect(): Promise<void> {
    const socket = new net.Socket();
    socket.setNoDelay(true);
    socket.setTimeout(this.timeoutMs);
    socket.on('data', (chunk: Buffer) => {
      this.buffer = Buffer.concat([this.buffer, chunk]);
      this.waiter?.();
    });
    this.socket = socket;

    await new Promise<void>((resolve, reject) => {
      const fail = (error: Error) => reject(error);
      socket.once('error', fail);
      socket.connect(this.port, this.host, () => {
        socket.off('error', fail);
        resolve();
      });
    });

    const greeting = await this.readMessage();
    if (greeting.headers['content-type'] !== 'auth/request') {
      throw new Error('Unexpected ESL greeting');
    }
    await this.write(`auth ${this.password}\n\n`);
    const auth = await this.readMessage();
    if (!String(auth.headers['reply-text'] || '').startsWith('+OK')) {
      throw new Error('ESL authentication failed');
    }
  }

  async api(command: string): Promise<string> {
    if (!/^[A-Za-z0-9_@.()\- ]{1,300}$/.test(command)) {
      throw new Error('Invalid ESL command');
    }
    await this.write(`api ${command}\n\n`);
    const response = await this.readMessage();
    const text = response.body.toString('utf8').trim() || String(response.headers['reply-text'] || '').trim();
    if (text.startsWith('-ERR')) throw new Error(`FreeSWITCH rejected command: ${text.slice(0, 180)}`);
    return text;
  }

  close(): void {
    this.socket?.destroy();
    this.socket = null;
  }

  private async write(value: string): Promise<void> {
    const socket = this.socket;
    if (!socket) throw new Error('ESL connection is closed');
    await new Promise<void>((resolve, reject) => {
      socket.write(value, (error) => error ? reject(error) : resolve());
    });
  }

  private async readMessage(): Promise<{ headers: Record<string, string>; body: Buffer }> {
    const deadline = Date.now() + this.timeoutMs;
    while (true) {
      const separator = this.buffer.indexOf('\n\n');
      const crlfSeparator = this.buffer.indexOf('\r\n\r\n');
      const boundary = separator >= 0 ? separator : crlfSeparator;
      const boundaryLength = separator >= 0 ? 2 : 4;
      if (boundary >= 0) {
        const headerText = this.buffer.subarray(0, boundary).toString('utf8');
        const headers: Record<string, string> = {};
        for (const line of headerText.split(/\r?\n/)) {
          const index = line.indexOf(':');
          if (index > 0) headers[line.slice(0, index).trim().toLowerCase()] = line.slice(index + 1).trim();
        }
        const length = Number(headers['content-length'] || 0);
        const total = boundary + boundaryLength + length;
        if (this.buffer.length >= total) {
          const body = this.buffer.subarray(boundary + boundaryLength, total);
          this.buffer = this.buffer.subarray(total);
          return { headers, body };
        }
      }
      const remaining = deadline - Date.now();
      if (remaining <= 0) throw new Error('ESL response timeout');
      await new Promise<void>((resolve, reject) => {
        const socket = this.socket;
        if (!socket) return reject(new Error('ESL connection closed'));
        const timer = setTimeout(() => reject(new Error('ESL response timeout')), remaining);
        const onClose = () => { clearTimeout(timer); reject(new Error('ESL connection closed')); };
        this.waiter = () => { clearTimeout(timer); socket.off('close', onClose); this.waiter = null; resolve(); };
        socket.once('close', onClose);
      });
    }
  }
}

const cache = new Map<string, { expiresAt: number; value: QueueAvailability }>();

function isAvailable(status: string, state: string): boolean {
  const normalizedStatus = status.trim().toLowerCase();
  const normalizedState = state.trim().toLowerCase();
  const validStatus = normalizedStatus === 'available' || normalizedStatus === 'available (on demand)';
  const validState = normalizedState === 'waiting' || normalizedState === 'idle';
  return validStatus && validState;
}

export function isEslConfigured(): boolean {
  return Boolean(process.env.FS_ESL_HOST && process.env.FS_ESL_PASSWORD);
}

/**
 * PostgreSQL is authoritative for queue membership. mod_callcenter's SQLite
 * runtime can retain deleted tiers, so it must never decide who belongs to a
 * queue on its own.
 */
export async function getQueueMembers(queueExtension: string): Promise<QueueMember[]> {
  if (!/^\d{2,7}$/.test(queueExtension)) throw new Error('Invalid queue extension');
  const result = await getPbxPool().query<{
    agent_uuid: string;
    agent_id: string | null;
    agent_name: string | null;
    agent_contact: string | null;
  }>(
    `SELECT a.call_center_agent_uuid AS agent_uuid,
            a.agent_id,
            a.agent_name,
            a.agent_contact
       FROM v_call_center_tiers t
       JOIN v_call_center_queues q
         ON q.call_center_queue_uuid = t.call_center_queue_uuid
       JOIN v_call_center_agents a
         ON a.call_center_agent_uuid = t.call_center_agent_uuid
      WHERE q.queue_extension = $1
      ORDER BY t.tier_level, t.tier_position, a.agent_name`,
    [queueExtension],
  );
  return result.rows.flatMap((row) => {
    const id = String(row.agent_id || '').trim();
    const contact = String(row.agent_contact || '');
    const match = contact.match(/(?:user\/)?(\d{2,7})@/);
    const extension = /^\d{2,7}$/.test(id) ? id : String(match?.[1] || '');
    if (!extension) return [];
    return [{
      agent: String(row.agent_uuid),
      extension,
      name: row.agent_name,
      contact,
    }];
  });
}

export async function getQueueAvailability(queueExtension: string, forceRefresh = false): Promise<QueueAvailability> {
  if (!/^\d{2,7}$/.test(queueExtension)) throw new Error('Invalid queue extension');
  const domain = process.env.FS_DOMAIN || 'fspbx.convergentai.tech';
  const queue = `${queueExtension}@${domain}`;
  const cached = cache.get(queue);
  if (!forceRefresh && cached && cached.expiresAt > Date.now()) return cached.value;

  const host = process.env.FS_ESL_HOST;
  const password = process.env.FS_ESL_PASSWORD;
  if (!host || !password) throw new Error('ESL_NOT_CONFIGURED');
  const client = new EslClient(
    host,
    Number(process.env.FS_ESL_PORT || 8021),
    password,
    Math.max(500, Math.min(Number(process.env.FS_ESL_TIMEOUT_MS || 3000), 10_000)),
  );

  try {
    await client.connect();
    const members = await getQueueMembers(queueExtension);
    const memberByAgent = new Map(members.map((member) => [member.agent, member]));

    // Reconcile the persistent mod_callcenter runtime before evaluating it.
    // `queue reload` adds newly assigned DB tiers but does not delete removed
    // tiers, so explicitly remove any runtime agent absent from PostgreSQL.
    await client.api(`callcenter_config queue reload ${queue}`);
    const tierOutput = await client.api('callcenter_config tier list');
    const queueTierRows = tierOutput.split(/\r?\n/)
      .map((line) => line.split('|'))
      .filter((parts) => parts.length >= 3 && parts[0] === queue);
    const staleAgentNames = [...new Set(queueTierRows
      .map((parts) => String(parts[1] || '').trim())
      .filter((agent) => agent && !memberByAgent.has(agent)))];
    for (const staleAgent of staleAgentNames) {
      await client.api(`callcenter_config tier del ${queue} ${staleAgent}`);
    }
    if (staleAgentNames.length) {
      console.log(`[esl-reconcile]: queue ${queue} removed stale runtime tiers [${staleAgentNames.join(',')}]`);
    }
    const readyAgentNames = new Set(queueTierRows
      .filter((parts) => String(parts[2]).trim().toLowerCase() === 'ready')
      .map((parts) => String(parts[1] || '').trim())
      .filter((agent) => memberByAgent.has(agent)));

    const agents: QueueAgentState[] = [];
    for (const member of members) {
      const agent = member.agent;
      if (!readyAgentNames.has(agent)) {
        agents.push({ agent, extension: member.extension, status: 'Tier Not Ready', state: 'Unknown', registered: false, available: false });
        continue;
      }
      try {
        // A single inbound ESL connection is an ordered request/response
        // stream. EslClient intentionally has no Job-UUID based response
        // multiplexer, so concurrent api() calls can consume each other's
        // replies and leave one waiter timing out. Keep these reads serial.
        const status = await client.api(`callcenter_config agent get status ${agent}`);
        const state = await client.api(`callcenter_config agent get state ${agent}`);
        let registered = false;
        try {
          const contact = await client.api(`sofia_contact ${member.extension}@${domain}`);
          const normalizedContact = contact.trim().toLowerCase();
          registered = Boolean(
            normalizedContact &&
            !normalizedContact.includes('user_not_registered') &&
            !normalizedContact.includes('_undef_') &&
            !normalizedContact.startsWith('error/')
          );
        } catch (registrationError) {
          console.warn(`[esl-availability]: extension ${member.extension} registration check failed: ${safeErrorMessage(registrationError)}`);
        }
        agents.push({
          agent,
          extension: member.extension,
          status,
          state,
          registered,
          available: registered && isAvailable(status, state),
        });
      } catch (error) {
        console.warn(`[esl-availability]: agent ${agent} check failed: ${safeErrorMessage(error)}`);
        agents.push({ agent, extension: member.extension, status: 'Unknown', state: 'Unknown', registered: false, available: false });
      }
    }

    const result: QueueAvailability = {
      queue,
      available: agents.some((agent) => agent.available),
      availableCount: agents.filter((agent) => agent.available).length,
      totalAgents: agents.length,
      agents,
      source: 'esl',
    };
    console.log(
      `[esl-availability]: queue ${queue} authoritative=[${members.map((member) => member.extension).join(',')}] ` +
      `ready=[${agents.filter((agent) => agent.status !== 'Tier Not Ready').map((agent) => agent.extension).join(',')}] ` +
      `registered=[${agents.filter((agent) => agent.registered).map((agent) => agent.extension).join(',')}] ` +
      `available=[${agents.filter((agent) => agent.available).map((agent) => agent.extension).join(',')}]`,
    );
    cache.set(queue, { expiresAt: Date.now() + Math.max(500, Number(process.env.FS_ESL_CACHE_TTL_MS || 2000)), value: result });
    return result;
  } finally {
    client.close();
  }
}

/** Require two fresh registered Available/Waiting samples before dialing. */
export async function getStableQueueAvailability(
  queueExtension: string,
  settleMs = Number(process.env.MLO_AVAILABILITY_SETTLE_MS || 350),
): Promise<QueueAvailability> {
  const first = await getQueueAvailability(queueExtension, true);
  if (!first.available) return first;
  await new Promise((resolve) => setTimeout(resolve, Math.max(150, Math.min(settleMs, 2000))));
  const second = await getQueueAvailability(queueExtension, true);
  const initiallyAvailable = new Set(
    first.agents.filter((agent) => agent.available).map((agent) => agent.agent),
  );
  const agents = second.agents.map((agent) => ({
    ...agent,
    available: agent.available && initiallyAvailable.has(agent.agent),
  }));
  const result: QueueAvailability = {
    ...second,
    agents,
    available: agents.some((agent) => agent.available),
    availableCount: agents.filter((agent) => agent.available).length,
  };
  console.log(
    `[esl-availability-stable]: queue ${result.queue} available=[${agents
      .filter((agent) => agent.available)
      .map((agent) => agent.extension)
      .join(',')}]`,
  );
  return result;
}

/**
 * A FreeSWITCH call-center queue answers the SIP INVITE before a human agent
 * does. LiveKit's sip.callStatus=active therefore means "queue answered", not
 * "Loan Officer answered". Poll the authoritative mod_callcenter agent state
 * and commit the handoff only when a mapped agent enters a queue call.
 */
export async function waitForQueueAgentAnswer(
  queueExtension: string,
  timeoutSeconds = Number(process.env.MLO_AGENT_ANSWER_TIMEOUT_SECONDS || 15),
): Promise<QueueAgentState | null> {
  if (!/^\d{2,7}$/.test(queueExtension)) throw new Error('Invalid queue extension');
  const host = process.env.FS_ESL_HOST;
  const password = process.env.FS_ESL_PASSWORD;
  if (!host || !password) throw new Error('ESL_NOT_CONFIGURED');
  const client = new EslClient(
    host,
    Number(process.env.FS_ESL_PORT || 8021),
    password,
    Math.max(500, Math.min(Number(process.env.FS_ESL_TIMEOUT_MS || 3000), 10_000)),
  );
  const deadline = Date.now() + Math.max(5, Math.min(timeoutSeconds, 120)) * 1000;
  const answeredStates = new Set(['in a queue call', 'in queue call', 'in a call', 'busy']);
  try {
    await client.connect();
    const members = await getQueueMembers(queueExtension);
    console.log(`[esl-agent-answer]: START queue=${queueExtension} timeout=${timeoutSeconds}s members=${members.map(m => `${m.extension}:${m.agent}`).join(',') || 'none'}`);
    let pollNumber = 0;
    while (Date.now() < deadline) {
      pollNumber += 1;
      for (const member of members) {
        try {
          const status = await client.api(`callcenter_config agent get status ${member.agent}`);
          const state = await client.api(`callcenter_config agent get state ${member.agent}`);
          if (pollNumber === 1 || pollNumber % 7 === 0) {
            console.log(`[esl-agent-answer]: POLL queue=${queueExtension} extension=${member.extension} agent=${member.agent} status=${status.trim()} state=${state.trim()}`);
          }
          if (answeredStates.has(state.trim().toLowerCase())) {
            const result: QueueAgentState = {
              agent: member.agent,
              extension: member.extension,
              status,
              state,
              registered: true,
              available: false,
            };
            console.log(`[esl-agent-answer]: CONNECTED queue=${queueExtension} extension=${member.extension} agent=${member.agent} status=${status.trim()} state=${state.trim()}`);
            return result;
          }
        } catch (error) {
          console.warn(`[esl-agent-answer]: agent ${member.agent} poll failed: ${safeErrorMessage(error)}`);
        }
      }
      const pollMs = Math.max(200, Math.min(Number(process.env.MLO_AGENT_ANSWER_POLL_MS || 350), 2000));
      await new Promise((resolve) => setTimeout(resolve, pollMs));
    }
    console.log(`[esl-agent-answer]: TIMEOUT queue=${queueExtension} timeout=${timeoutSeconds}s members=${members.map(m => m.extension).join(',') || 'none'}`);
    return null;
  } finally {
    client.close();
  }
}
