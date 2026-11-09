/**
 * Loan Officer Call Bridge Routes (v5.2.0)
 * Zip routing + SIP dialing + pre-call alerts.
 *
 * Compatible with strict tsconfig (verbatimModuleSyntax, noUncheckedIndexedAccess,
 * exactOptionalPropertyTypes).
 */

import { Router } from 'express';
import type { Request, Response } from 'express';
import pkg from 'pg';
import { allowRequest, requestKey, safeErrorMessage } from '../utils/security.js';
import { getQueueMembers } from '../services/freeswitch-esl.js';

const { Pool } = pkg;

const router = Router();

const pbxDb = new Pool({
  host: process.env.FSPBX_DB_HOST,
  user: process.env.FSPBX_DB_USER || 'fusionpbx',
  password: process.env.FSPBX_DB_PASSWORD,
  database: process.env.FSPBX_DB_NAME || 'fusionpbx',
  port: Number(process.env.FSPBX_DB_PORT || 5432),
  max: 5,
  idleTimeoutMillis: 30_000,
});

pbxDb.on('error', (err: Error) => console.error('[DB_ERROR]', err.message));

interface AgentRow {
  agent_id: string;
  agent_name: string | null;
  state_code: string | null;
  city: string | null;
}

const US_STATE_NAMES: Record<string, string> = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
  CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia',
  HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa',
  KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland',
  MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri',
  MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey',
  NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio',
  OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina',
  SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont',
  VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
  DC: 'District of Columbia',
};

function locationForAgent(agent: AgentRow | undefined): string | null {
  if (!agent) return null;
  const stateCode = String(agent.state_code || '').toUpperCase();
  const stateName = US_STATE_NAMES[stateCode] || stateCode;
  const city = String(agent.city || '').trim();
  return city ? `${city}, ${stateName}` : stateName || null;
}

const activeCalls = new Map<string, number>();
const sseClients = new Map<string, Set<Response>>();
const zipCache = new Map<string, { expiresAt: number; rows: AgentRow[] }>();

const RINGOTEL_DELAY_MS = Number(process.env.RINGOTEL_DELAY_MS || 10000);
const MAX_CONCURRENT_CALLS = Number(process.env.MAX_CONCURRENT_CALLS || 25);

function asString(v: unknown): string {
  if (Array.isArray(v)) return String(v[0] ?? '');
  return v == null ? '' : String(v);
}

function newRoomName(): string {
  return `loan-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function getLicensedAgentsForZip(zipCode: string): Promise<AgentRow[] | null> {
  if (!zipCode) return null;
  const cached = zipCache.get(zipCode);
  if (cached && cached.expiresAt > Date.now()) return cached.rows;
  try {
    // New model: zip -> state -> queue, agents = officers licensed in that state.
    const result = await pbxDb.query<AgentRow>(
      `SELECT DISTINCT lo.extension AS agent_id, lo.name AS agent_name, z.state_code,
              COALESCE(
                NULLIF(to_jsonb(z)->>'city', ''),
                NULLIF(to_jsonb(z)->>'city_name', ''),
                NULLIF(to_jsonb(z)->>'primary_city', '')
              ) AS city
         FROM   routing.zip_state    z
         JOIN   routing.state_queue  sq ON sq.state_code = z.state_code AND sq.active = true
         JOIN   routing.officer_states os ON os.state_code = z.state_code
         JOIN   routing.loan_officers  lo ON lo.officer_id = os.officer_id AND lo.active = true
        WHERE   z.zip_code = $1
        ORDER   BY lo.extension`,
      [zipCode]
    );
    zipCache.set(zipCode, { expiresAt: Date.now() + 60_000, rows: result.rows });
    if (zipCache.size > 2_000) {
      const now = Date.now();
      for (const [key, value] of zipCache) if (value.expiresAt <= now) zipCache.delete(key);
    }
    return result.rows;
  } catch (err) {
    console.error('[ZIP_LOOKUP_ERROR]', (err as Error).message);
    return null;
  }
}

async function getAvailableExtensions(extensionList: string[]): Promise<string[]> {
  if (!extensionList.length) return [];
  try {
    const result = await pbxDb.query<{ agent_id: string }>(
      `SELECT agent_id FROM v_call_center_agents
       WHERE  agent_id = ANY($1) AND agent_status = 'Available'`,
      [extensionList]
    );
    return result.rows.map((r) => String(r.agent_id));
  } catch (err) {
    console.error('[AVAILABILITY_ERROR]', (err as Error).message);
    return [];
  }
}

router.post('/session', async (req: Request, res: Response): Promise<void> => {
  if (!allowRequest(requestKey(req, 'loan-session'), 6)) {
    res.status(429).json({ error: 'Too many requests' });
    return;
  }

  try {
    if (activeCalls.size >= MAX_CONCURRENT_CALLS) {
      res.status(503).json({ error: 'All agents are busy. Please try again shortly.' });
      return;
    }

    const zipCode = asString(req.body?.zipCode).trim();
    if (!zipCode || zipCode.length !== 5 || !/^\d+$/.test(zipCode)) {
      res.status(422).json({ error: 'Please allow location access or enter your zip code.', routingMode: 'no_zip' });
      return;
    }

    const licensed = await getLicensedAgentsForZip(zipCode);
    if (licensed === null) {
      res.status(500).json({ error: 'Service temporarily unavailable.', routingMode: 'db_error' });
      return;
    }

    if (!licensed.length) {
      res.status(422).json({ error: `We don't currently serve zip code ${zipCode}.`, routingMode: 'no_match' });
      return;
    }

    const available = await getAvailableExtensions(licensed.map((a) => a.agent_id));
    if (!available.length) {
      res.status(422).json({ error: 'All specialists are currently busy. Please try again later.', routingMode: 'no_agent_available' });
      return;
    }

    const pickedId = available[0] as string;
    const picked = licensed.find((a) => a.agent_id === pickedId);
    const roomName = newRoomName();

    res.json({
      ok: true,
      roomName,
      target: pickedId,
      agentName: picked?.agent_name ?? pickedId,
      routingMode: 'direct',
      zipCode,
    });
  } catch (err) {
    console.error('[SESSION_ERROR]', (err as Error).message);
    res.status(500).json({ error: 'Could not start session.' });
  }
});

router.post('/dial', async (req: Request, res: Response): Promise<void> => {
  try {
    if (!allowRequest(requestKey(req, 'dial'), 10)) {
      res.status(429).json({ error: 'Too many requests' });
      return;
    }
    const roomName = asString(req.body?.roomName);
    const target = asString(req.body?.target);
    if (!/^loan-[A-Za-z0-9-]{8,80}$/.test(roomName) || !/^\d{2,7}$/.test(target)) {
      res.status(400).json({ error: 'roomName and target required' });
      return;
    }
    console.log('[DIAL]', { roomName, target });
    activeCalls.set(roomName, Date.now());
    await new Promise((r) => setTimeout(r, RINGOTEL_DELAY_MS));
    res.json({ ok: true });
  } catch (err) {
    console.error('[DIAL_ERROR]', (err as Error).message);
    res.status(500).json({ error: 'Could not dial.' });
  }
});

router.post('/hangup', async (req: Request, res: Response): Promise<void> => {
  try {
    const roomName = asString(req.body?.roomName);
    if (!roomName) {
      res.status(400).json({ error: 'roomName required' });
      return;
    }
    activeCalls.delete(roomName);
    const clients = sseClients.get(roomName);
    if (clients) {
      for (const c of clients) {
        try { c.write(`event: call-ended\ndata: {}\n\n`); } catch { /* noop */ }
      }
      sseClients.delete(roomName);
    }
    res.json({ ok: true });
  } catch (err) {
    console.error('[HANGUP_ERROR]', (err as Error).message);
    res.status(500).json({ error: 'Could not hangup.' });
  }
});

router.get('/call-events/:roomName', (req: Request, res: Response): void => {
  const roomName = asString(req.params.roomName);
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });

  let set = sseClients.get(roomName);
  if (!set) {
    set = new Set<Response>();
    sseClients.set(roomName, set);
  }
  set.add(res);

  const hb = setInterval(() => {
    try { res.write(': ping\n\n'); } catch { /* noop */ }
  }, 25_000);

  req.on('close', () => {
    clearInterval(hb);
    const clients = sseClients.get(roomName);
    if (clients) {
      clients.delete(res);
      if (!clients.size) sseClients.delete(roomName);
    }
  });
});

router.get('/zip-agents', async (req: Request, res: Response): Promise<void> => {
  if (!allowRequest(requestKey(req, 'zip-agents'), 60)) {
    res.status(429).json({ error: 'Too many requests' });
    return;
  }
  const zip = asString(req.query.zip).trim();
  if (!/^\d{5}$/.test(zip)) {
    res.json({ zip, error: 'invalid_zip' });
    return;
  }
  try {
    const licensed = await getLicensedAgentsForZip(zip);
    if (!licensed) {
      res.json({ zip, ready: false });
      return;
    }
    const available = licensed.length
      ? await getAvailableExtensions(licensed.map((a) => a.agent_id))
      : [];
    const state = licensed[0]?.state_code ?? null;
    const location = locationForAgent(licensed[0]);
    res.json({
      zip,
      ready: true,
      state,
      location,
      availableCount: available.length,
      agents: licensed.map((a) => ({
        id: a.agent_id,
        name: a.agent_name,
        available: available.includes(a.agent_id),
      })),
    });
  } catch (err) {
    console.error('[ZIP_AGENTS_ERROR]', safeErrorMessage(err));
    res.status(500).json({ error: 'Service temporarily unavailable' });
  }
});

function clientIpFromReq(req: Request): string {
  // Different proxies use different headers; check the common ones in order.
  const h = req.headers;
  const candidates = [
    String(h["cf-connecting-ip"] || ""),               // Cloudflare
    String(h["x-real-ip"] || ""),                        // Nginx
    (String(h["x-forwarded-for"] || "").split(",")[0] || ""), // generic
    String(h["fly-client-ip"] || ""),                    // Fly.io
    req.socket.remoteAddress || "",
  ];
  for (const c of candidates) {
    const ip = c.trim().replace(/^::ffff:/, "");
    if (ip) return ip;
  }
  return "";
}

function isPrivateIp(ip: string): boolean {
  if (!ip) return true;
  if (ip === "127.0.0.1" || ip === "::1") return true;
  if (/^10\./.test(ip)) return true;
  if (/^192\.168\./.test(ip)) return true;
  if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip)) return true;
  if (/^169\.254\./.test(ip)) return true;
  if (ip.startsWith("fc") || ip.startsWith("fd") || ip.startsWith("fe80")) return true;
  return false;
}

// GET /api/detect-zip — server-side IP geolocation. Reliable on mobile / in-app
// browsers where navigator.geolocation is blocked. Uses the real client IP from
// X-Forwarded-For (set by the HTTPS reverse proxy).
router.get("/detect-zip", async (req: Request, res: Response): Promise<void> => {
  if (!allowRequest(requestKey(req, 'detect-zip'), 20)) {
    res.status(429).json({ ok: false, reason: 'rate_limited' });
    return;
  }
  const ip = clientIpFromReq(req);
  if (isPrivateIp(ip)) {
    res.json({ ok: false, reason: "private_ip" });
    return;
  }

  // Fetch a single provider with a short timeout — never let one slow/dead
  // provider hold up the whole request.
  const fetchProvider = async (
    url: string,
    timeoutMs = 2000
  ): Promise<{ zip: string; city: string; region: string } | null> => {
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const r = await fetch(url, { signal: ctrl.signal });
      const d: any = await r.json();
      const zip = String(d?.postal || "").replace(/\D/g, "").slice(0, 5);
      const city = String(d?.city || "");
      const region = String(d?.region || d?.region_code || "");
      return /^\d{5}$/.test(zip) ? { zip, city, region } : null;
    } catch {
      return null;
    } finally {
      clearTimeout(to);
    }
  };

  // Run both providers IN PARALLEL (previously sequential with a 5s timeout
  // each — up to 10s worst case, which is what was making /api/detect-zip
  // show up as a ~1.3s+ blip on every page load). ipwho.is has proven the
  // faster/more reliable of the two, so prefer its result when both succeed.
  // Return the first valid provider result instead of waiting for the slower
  // request. Failure is reported only after both providers fail.
  const providers = [
    fetchProvider(`https://ipwho.is/${ip}`),
    fetchProvider(`https://ipapi.co/${ip}/json/`),
  ];
  const result = await new Promise<{ zip: string; city: string; region: string } | null>((resolve) => {
    let remaining = providers.length;
    let settled = false;
    for (const provider of providers) {
      provider.then((value) => {
        if (!settled && value) {
          settled = true;
          resolve(value);
          return;
        }
        remaining -= 1;
        if (!settled && remaining === 0) resolve(null);
      }).catch(() => {
        remaining -= 1;
        if (!settled && remaining === 0) resolve(null);
      });
    }
  });

  if (result) {
    res.json({ ok: true, ...result });
    return;
  }
  res.json({ ok: false, reason: "no_zip", ip });
});

// POST /api/early-alert — alert only agents in the state queue selected by ZIP.
// There is intentionally no default queue: an unknown/unmapped ZIP must never
// notify unrelated agents.
// Best-effort: never blocks the caller.
router.post("/early-alert", async (req: Request, res: Response): Promise<void> => {
  if (!allowRequest(requestKey(req, 'early-alert'), 8)) {
    res.status(429).json({ error: 'Too many alert requests' });
    return;
  }
  const zip = String((req.body && req.body.zip) || "").replace(/\D/g, "").slice(0, 5);
  const alertType = req.body?.alertType === "manual_zip_change"
    ? "manual_zip_change"
    : "session_started";
  console.log(`[alert-request]: type=${alertType} zip=${zip || 'none'}`);

  // Respond immediately. This route is fired the instant the customer opens
  // the avatar session and the frontend never reads the response body — it
  // must not hold the connection open while we do PBX/DB lookups + send
  // Ringotel/SIP alerts. (Previously this awaited all of that before
  // responding, which is why the request/preflight could take ~1s+.)
  res.status(202).json({ ok: true, queued: true });

  // Everything below runs in the background, after the response is sent.
  void (async () => {
    let queueExt = "";
    let stateCode = "";
    let zipWasMapped = false;
    if (/^\d{5}$/.test(zip)) {
      try {
        const qz = await pbxDb.query<{ fspbx_extension: string; state_code: string }>(
          `SELECT sq.fspbx_extension, z.state_code
             FROM routing.zip_state  z
             JOIN routing.state_queue sq ON sq.state_code = z.state_code AND sq.active = true
            WHERE z.zip_code = $1 LIMIT 1`,
          [zip]
        );
        if (qz.rows[0]?.fspbx_extension) queueExt = qz.rows[0].fspbx_extension;
        if (qz.rows[0]?.state_code) stateCode = qz.rows[0].state_code;
        zipWasMapped = Boolean(qz.rows[0]?.fspbx_extension && qz.rows[0]?.state_code);
      } catch (e: any) {
        console.warn("[early-alert]: state-queue lookup failed:", safeErrorMessage(e));
      }
    }
    // Both auto-detected and manually-entered ZIP alerts require an
    // authoritative mapping. Never fall back to queue 9400 or a static list.
    if (!zipWasMapped) {
      console.warn(`[${alertType === "manual_zip_change" ? "manual-zip-alert" : "early-alert"}]: skipped unmapped zip ${zip || "invalid"}`);
      return;
    }
    const defaultBody = alertType === "manual_zip_change"
      ? `CTA Activity, Customer manually entered a new ZIP code: ${zip} (${stateCode}).`
      : zip
        ? `A customer just started a live session with Ailana (zip ${zip}). Prepare for a potential Loan Officer handoff.`
        : `A customer just started a live session with Ailana. Prepare for a potential Loan Officer handoff.`;
    const configuredBody = alertType === "manual_zip_change"
      ? process.env.RINGOTEL_MANUAL_ZIP_ALERT_MSG
      : process.env.RINGOTEL_ALERT_MSG;
    const body = (configuredBody || defaultBody)
      .split('{zipCode}').join(zip || 'unknown')
      .split('{zip}').join(zip || 'unknown')
      .split('{state}').join(stateCode || 'unknown');

    try {
      // PostgreSQL queue membership is authoritative. This deliberately does
      // not use mod_callcenter's runtime tier list because deleted tiers can
      // remain stale in callcenter.db until explicitly reconciled.
      const members = await getQueueMembers(queueExt);
      const exts = [...new Set(members.map((member) => member.extension))];
      let domain = process.env.FS_DOMAIN || "fspbx.convergentai.tech";
      for (const member of members) {
        const contact = member.contact;
        const dm = contact.match(/@([\w.-]+)/);
        if (dm && dm[1]) domain = dm[1];
      }

      if (exts.length === 0) {
        console.warn(`[early-alert]: no agents found for queue ${queueExt}`);
        return;
      }

      const { sendRingotelAlert } = await import("../utils/sipTransfer.js");
      const { sendSipMessage } = await import("../utils/fsMessage.js");

      // For each agent: Ringotel cloud alert (Ringotel app) AND a SIP MESSAGE via
      // FreeSWITCH (reaches Linphone / desk phones / any registered SIP contact).
      let ringOkCount = 0;
      let sipOkCount = 0;
      const results = await Promise.allSettled(
        exts.map(async (ext) => {
          const [ring, sip] = await Promise.allSettled([
            sendRingotelAlert(ext, body),
            sendSipMessage(ext, domain, body),
          ]);
          const ringOk = ring.status === "fulfilled" && ring.value === true;
          const sipOk = sip.status === "fulfilled" && sip.value === true;
          if (ringOk) ringOkCount++;
          if (sipOk) sipOkCount++;
          // Consider the agent "reached" if either channel succeeded.
          if (!ringOk && !sipOk) throw new Error("both channels failed");
        })
      );
      const sent: string[] = [];
      const failed: string[] = [];
      exts.forEach((ext, i) => {
        (results[i]?.status === "fulfilled" ? sent : failed).push(ext);
      });
      console.log(
        `[${alertType === "manual_zip_change" ? "manual-zip-alert" : "early-alert"}]: queue ${queueExt} → reached ${sent.length}/${exts.length} ` +
          `(ringotel ${ringOkCount}/${exts.length}, sip ${sipOkCount}/${exts.length}) ` +
          `[${sent.join(",")}]` +
          (failed.length ? ` | failed [${failed.join(",")}]` : "") +
          (zip ? ` (zip ${zip})` : "")
      );
    } catch (e: any) {
      console.error("[early-alert]: failed:", safeErrorMessage(e));
    }
  })();
});

export default router;
