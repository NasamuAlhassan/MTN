/**
 * Server-side proxy handlers for Khaya + Gemini.
 *
 * These run ONLY on the server (Vercel serverless functions in prod, Vite dev
 * middleware locally). They inject the provider API keys from *non-VITE* env
 * vars (KHAYA_API_KEY / GEMINI_API_KEY) so the secrets never reach the browser
 * bundle. The client calls same-origin /api/khaya/* and /api/gemini instead.
 *
 * Plain Node (req, res) handlers so the same code works under both Vercel and
 * Vite's connect-style middleware.
 */

const KHAYA_ORIGIN = "https://translation-api.ghananlp.org";
const GEMINI_ORIGIN = "https://generativelanguage.googleapis.com";
const GROQ_ORIGIN = "https://api.groq.com";
const UPSTREAM_TIMEOUT_MS = 30_000;

/* ── Best-effort rate limiting ──────────────────────────────────────────────
 * In-memory per-IP token bucket. This is NOT durable across serverless cold
 * starts or multiple instances — it's a cheap first line of defence for a
 * concept prototype. For production, back this with Upstash/Redis.
 */
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 40; // requests per IP per window
const hits = new Map();

function clientIp(req) {
  const fwd = (req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  return fwd || req.socket?.remoteAddress || "unknown";
}

function rateLimited(req) {
  const ip = clientIp(req);
  const now = Date.now();
  const rec = hits.get(ip) || { count: 0, reset: now + RATE_WINDOW_MS };
  if (now > rec.reset) {
    rec.count = 0;
    rec.reset = now + RATE_WINDOW_MS;
  }
  rec.count += 1;
  hits.set(ip, rec);
  // Opportunistic cleanup so the map can't grow unbounded.
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (now > v.reset) hits.delete(k);
  }
  return rec.count > RATE_MAX;
}

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function sendJson(res, status, obj) {
  res.statusCode = status;
  res.setHeader("content-type", "application/json");
  res.end(JSON.stringify(obj));
}

async function fetchWithTimeout(url, options) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), UPSTREAM_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function pipeUpstream(res, upstream) {
  const buf = Buffer.from(await upstream.arrayBuffer());
  res.statusCode = upstream.status;
  const ct = upstream.headers.get("content-type");
  if (ct) res.setHeader("content-type", ct);
  res.end(buf);
}

export async function khayaHandler(req, res) {
  try {
    const key = process.env.KHAYA_API_KEY;
    if (!key) return sendJson(res, 503, { error: { message: "Khaya API key not configured on the server." } });
    if (rateLimited(req)) return sendJson(res, 429, { error: { message: "Too many requests — slow down." } });

    const rest = req.url.replace(/^\/api\/khaya/, "") || "/";
    const target = KHAYA_ORIGIN + rest;
    const method = req.method || "GET";
    const hasBody = method !== "GET" && method !== "HEAD";

    const headers = { "Ocp-Apim-Subscription-Key": key, "Cache-Control": "no-cache" };
    const ct = req.headers["content-type"];
    if (ct) headers["Content-Type"] = ct;

    const upstream = await fetchWithTimeout(target, {
      method,
      headers,
      body: hasBody ? await readRawBody(req) : undefined,
    });
    return pipeUpstream(res, upstream);
  } catch (err) {
    const msg = err?.name === "AbortError" ? "Khaya request timed out." : `Khaya proxy error: ${err?.message || err}`;
    return sendJson(res, 502, { error: { message: msg } });
  }
}

export async function geminiHandler(req, res) {
  try {
    const key = process.env.GEMINI_API_KEY;
    if (!key) return sendJson(res, 503, { error: { message: "Gemini API key not configured on the server." } });
    if ((req.method || "") !== "POST") return sendJson(res, 405, { error: { message: "Method not allowed." } });
    if (rateLimited(req)) return sendJson(res, 429, { error: { message: "Too many requests — slow down." } });

    // Only allow well-formed Gemini model ids (prevents open-proxy / SSRF abuse).
    const model = new URL(req.url, "http://x").searchParams.get("model") || "gemini-2.0-flash";
    if (!/^gemini-[\w.-]+$/.test(model)) return sendJson(res, 400, { error: { message: "Invalid model." } });

    const url = `${GEMINI_ORIGIN}/v1beta/models/${model}:generateContent?key=${key}`;
    const upstream = await fetchWithTimeout(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: await readRawBody(req),
    });
    return pipeUpstream(res, upstream);
  } catch (err) {
    const msg = err?.name === "AbortError" ? "Gemini request timed out." : `Gemini proxy error: ${err?.message || err}`;
    return sendJson(res, 502, { error: { message: msg } });
  }
}

// Only these Groq paths may be proxied — keeps this from being an open relay.
const GROQ_ALLOWED = [/^\/openai\/v1\/chat\/completions$/, /^\/openai\/v1\/audio\/transcriptions$/];

export async function groqHandler(req, res) {
  try {
    const key = process.env.GROQ_API_KEY;
    if (!key) return sendJson(res, 503, { error: { message: "Groq API key not configured on the server." } });
    if ((req.method || "") !== "POST") return sendJson(res, 405, { error: { message: "Method not allowed." } });
    if (rateLimited(req)) return sendJson(res, 429, { error: { message: "Too many requests — slow down." } });

    const rest = (req.url.replace(/^\/api\/groq/, "") || "/").split("?")[0];
    if (!GROQ_ALLOWED.some((re) => re.test(rest))) {
      return sendJson(res, 403, { error: { message: "Path not allowed." } });
    }

    // Forward the exact Content-Type (incl. multipart boundary for audio uploads).
    const headers = { Authorization: `Bearer ${key}` };
    const ct = req.headers["content-type"];
    if (ct) headers["Content-Type"] = ct;

    const upstream = await fetchWithTimeout(GROQ_ORIGIN + rest, {
      method: "POST",
      headers,
      body: await readRawBody(req),
    });
    return pipeUpstream(res, upstream);
  } catch (err) {
    const msg = err?.name === "AbortError" ? "Groq request timed out." : `Groq proxy error: ${err?.message || err}`;
    return sendJson(res, 502, { error: { message: msg } });
  }
}
