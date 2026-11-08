/**
 * Shared zip -> agent extension resolver (v5.2.0).
 * Used by the SIP transfer path so the dialed destination is chosen by the
 * customer's zip code instead of a fixed queue.
 */

import pkg from 'pg';

const { Pool } = pkg;

let pool: InstanceType<typeof Pool> | null = null;

function getPool(): InstanceType<typeof Pool> {
  if (!pool) {
    pool = new Pool({
      host: process.env.FSPBX_DB_HOST,
      user: process.env.FSPBX_DB_USER || 'fusionpbx',
      password: process.env.FSPBX_DB_PASSWORD,
      database: process.env.FSPBX_DB_NAME || 'fusionpbx',
      port: Number(process.env.FSPBX_DB_PORT || 5432),
      max: 3,
      idleTimeoutMillis: 30_000,
    });
    pool.on('error', (err: Error) => console.error('[ZIPRESOLVER_DB_ERROR]', err.message));
  }
  return pool;
}

export interface ResolvedAgent {
  agentId: string;
  agentName: string | null;
}

interface AgentRow {
  agent_id: string;
  agent_name: string | null;
}

/** Return licensed agents for a zip, most-specific match first. */
export async function getLicensedAgentsForZip(zipCode: string): Promise<AgentRow[]> {
  const zip = String(zipCode || '').trim();
  if (!zip) return [];
  const pool = getPool();
  // Most-specific match first: exact 5-digit, then 3-digit prefix, then 2-digit.
  // Returning at the first level that has rows prevents a specific 5-digit zip
  // (e.g. VN 70000 -> 1107) from also picking up a broad prefix (US 700).
  const keys = [zip, zip.slice(0, 3), zip.slice(0, 2)];
  for (const key of keys) {
    if (!key) continue;
    const result = await pool.query<AgentRow>(
      `SELECT DISTINCT ON (agent_id) agent_id, agent_name
       FROM   zip_agent_routing
       WHERE  active = true AND zip_code = $1
       ORDER  BY agent_id`,
      [key]
    );
    if (result.rows.length) return result.rows;
  }
  return [];
}

/** Of the given extensions, which are currently Available in FSPBX. */
async function getAvailableExtensions(extensionList: string[]): Promise<string[]> {
  if (!extensionList.length) return [];
  try {
    const result = await getPool().query<{ agent_id: string }>(
      `SELECT agent_id FROM v_call_center_agents
       WHERE  agent_id = ANY($1) AND agent_status = 'Available'`,
      [extensionList]
    );
    return result.rows.map((r) => String(r.agent_id));
  } catch (err) {
    // Availability view may not exist in every install; don't block routing.
    console.warn('[ZIPRESOLVER] availability check failed:', (err as Error).message);
    return [];
  }
}

/**
 * Resolve the best agent extension for a zip.
 * Prefers an Available agent, otherwise the first licensed agent for the area.
 * Returns null when no configured route serves the ZIP code.
 */
export async function resolveAgentForZip(zipCode: string): Promise<ResolvedAgent | null> {
  const licensed = await getLicensedAgentsForZip(zipCode);
  if (!licensed.length) return null;

  const available = await getAvailableExtensions(licensed.map((a) => a.agent_id));
  const pickedId = available[0] ?? licensed[0]!.agent_id;
  const picked = licensed.find((a) => a.agent_id === pickedId) ?? licensed[0]!;
  return { agentId: picked.agent_id, agentName: picked.agent_name };
}

export interface ResolvedQueue {
  queueExtension: string;
  queueName: string | null;
  stateCode: string | null;
}

/**
 * Resolve the FSPBX call-center QUEUE for a zip, via the routing schema:
 *   zip -> routing.zip_state -> state -> routing.state_queue -> fspbx_extension
 * The SIP transfer dials this queue extension (7001-7050) so the call goes
 * through the call center (greeting, agent distribution, no-answer -> voicemail)
 * instead of dialing a single agent's extension directly.
 * Returns null when the zip is not served (e.g. non-US) => UNSUPPORTED_AREA.
 */
export async function resolveQueueForZip(zipCode: string): Promise<ResolvedQueue | null> {
  const zip = String(zipCode || '').trim();
  if (!/^\d{5}$/.test(zip)) return null;
  const pool = getPool();
  const result = await pool.query<{
    fspbx_extension: string;
    queue_name: string | null;
    state_code: string;
  }>(
    `SELECT sq.fspbx_extension, sq.queue_name, sq.state_code
       FROM routing.zip_state  z
       JOIN routing.state_queue sq ON sq.state_code = z.state_code AND sq.active = true
      WHERE z.zip_code = $1
      LIMIT 1`,
    [zip]
  );
  const row = result.rows[0];
  if (!row) return null;
  return { queueExtension: row.fspbx_extension, queueName: row.queue_name, stateCode: row.state_code };
}
