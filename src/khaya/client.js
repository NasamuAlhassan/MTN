/* Khaya REST client — Translation v1, ASR v3, TTS v1 */

import { getSharedAudioContext, playAudioBuffer, prepareKhayaAudio, unlockAudio } from "./audioPlayer.js";
import { hasKhayaKey, khayaHeaders, KHAYA_BASE, KHAYA_ROUTES } from "./config.js";
import { enqueueSpeech } from "./speechQueue.js";
import { fetchWithTimeout } from "./http.js";

export { hasKhayaKey };

const ASR_LANG_FALLBACK = { en: "en", tw: "tw", kus: "kus" };

let cachedASRLangs = null;
let cachedTTSLangs = null;

/**
 * Translations of fixed UI/narration strings never change, so persist them
 * across reloads. This is the single biggest saver against Khaya's 100-call
 * free tier: without it, every page load re-spends ~25 calls re-translating the
 * same UI, exhausting the quota within a few reloads.
 */
const TRANSLATE_STORE_KEY = "zigi.translateCache.v1";

function loadTranslateCache() {
  try {
    if (typeof localStorage === "undefined") return new Map();
    const raw = localStorage.getItem(TRANSLATE_STORE_KEY);
    if (raw) return new Map(Object.entries(JSON.parse(raw)));
  } catch {
    /* corrupt/unavailable — start empty */
  }
  return new Map();
}

let persistScheduled = false;
function persistTranslateCache() {
  if (persistScheduled || typeof localStorage === "undefined") return;
  persistScheduled = true;
  setTimeout(() => {
    persistScheduled = false;
    try {
      localStorage.setItem(TRANSLATE_STORE_KEY, JSON.stringify(Object.fromEntries(translateCache)));
    } catch {
      /* storage full/blocked — in-memory cache still works this session */
    }
  }, 800);
}

const translateCache = loadTranslateCache();
const audioCache = new Map();
const translateInFlight = new Map();
const ttsInFlight = new Map();



function requireKey() {
  if (!hasKhayaKey()) {
    throw Object.assign(new Error("Khaya API key missing — copy .env.example to .env and restart the dev server."), {
      code: "no-khaya-key",
    });
  }
}

async function parseKhayaError(r, fallback) {
  try {
    const d = await r.json();
    if (d.error) {
      const detail = d.error.details?.map((x) => x.message).filter(Boolean).join("; ");
      throw new Error(detail ? `${d.error.message} (${detail})` : d.error.message);
    }
    if (d.message) throw new Error(d.message);
    if (d.detail?.message) throw new Error(d.detail.message);
  } catch (err) {
    if (err.message && !err.message.includes("JSON")) throw err;
  }
  throw new Error(fallback || `request failed: ${r.status}`);
}

/* ─── Translation API ─── */

export async function khayaTranslateLanguages() {
  requireKey();
  const r = await fetchWithTimeout(KHAYA_BASE + KHAYA_ROUTES.translateLanguages, { headers: khayaHeaders() });
  if (!r.ok) throw new Error(`translate languages failed: ${r.status}`);
  const d = await r.json();
  return d.languages ?? {};
}

export async function khayaTranslate(text, from, to) {
  requireKey();
  const r = await fetchWithTimeout(KHAYA_BASE + KHAYA_ROUTES.translate, {
    method: "POST",
    headers: khayaHeaders(),
    body: JSON.stringify({ in: text, lang: `${from}-${to}` }),
  });
  if (!r.ok) throw new Error(`translate failed: ${r.status}`);
  const d = await r.json();
  const out = d.translation ?? d.out ?? d;
  return typeof out === "string" ? out : String(out ?? text);
}

export async function translateToEnglish(text, lang) {
  return khayaTranslate(text, lang, "en");
}

export async function translateForLang(text, lang) {
  const source = (text || "").trim();
  if (!source || lang === "en") return source;

  const key = `out:${lang}:${source}`;
  if (translateCache.has(key)) return translateCache.get(key);
  if (translateInFlight.has(key)) return translateInFlight.get(key);

  const pending = khayaTranslate(source, "en", lang)
    .then((translated) => {
      translateCache.set(key, translated);
      persistTranslateCache();
      translateInFlight.delete(key);
      return translated;
    })
    .catch((err) => {
      translateInFlight.delete(key);
      throw err;
    });

  translateInFlight.set(key, pending);
  return pending;
}

/* ─── ASR API v3 ─── */

async function fetchASRLanguages() {
  if (cachedASRLangs) return cachedASRLangs;
  requireKey();
  const r = await fetchWithTimeout(KHAYA_BASE + KHAYA_ROUTES.asrLanguages, { headers: khayaHeaders() });
  if (!r.ok) await parseKhayaError(r, `ASR languages failed: ${r.status}`);
  const d = await r.json();
  cachedASRLangs = d.languages ?? [];
  return cachedASRLangs;
}

export async function khayaASRLanguages() {
  return fetchASRLanguages();
}

export async function resolveASRLang(appLang) {
  const fallback = ASR_LANG_FALLBACK[appLang] || appLang;
  try {
    const langs = await fetchASRLanguages();
    const codes = new Set(langs.map((l) => l.code));
    if (codes.has(fallback)) return fallback;
    const aliases = { en: ["eng", "en_gh"], tw: ["twi", "atw"], kus: ["kus"] };
    const match = aliases[appLang]?.find((code) => codes.has(code));
    return match || fallback;
  } catch {
    return fallback;
  }
}

function audioBufferToWav(buffer) {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const bitsPerSample = 16;
  const samples = buffer.length;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = samples * blockAlign;
  const bytes = new ArrayBuffer(44 + dataSize);
  const view = new DataView(bytes);
  const writeStr = (offset, str) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };
  writeStr(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeStr(36, "data");
  view.setUint32(40, dataSize, true);
  let offset = 44;
  for (let i = 0; i < samples; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, buffer.getChannelData(ch)[i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += 2;
    }
  }
  return bytes;
}

async function ensureWavBlob(blob) {
  if (blob?.type?.includes("wav")) return blob;
  const audioCtx = getSharedAudioContext();
  const decoded = await audioCtx.decodeAudioData(await blob.arrayBuffer());
  return new Blob([audioBufferToWav(decoded)], { type: "audio/wav" });
}

function parseTranscript(data) {
  if (typeof data === "string") return data;
  return data?.text ?? data?.transcript ?? data?.transcription ?? "";
}

export async function khayaSTT(audioBlob, lang) {
  requireKey();
  const asrLang = await resolveASRLang(lang);
  const wav = await ensureWavBlob(audioBlob);
  const url = `${KHAYA_BASE}${KHAYA_ROUTES.asrTranscribe}?language=${encodeURIComponent(asrLang)}`;
  const r = await fetchWithTimeout(url, {
    method: "POST",
    headers: {
      ...khayaHeaders(false),
      "Content-Type": "audio/wav",
    },
    body: wav,
  });
  if (!r.ok) await parseKhayaError(r, `ASR failed: ${r.status}`);
  const d = await r.json();
  return parseTranscript(d);
}

/* ─── TTS API v2 (32 langs incl. Kusaal) — v1 legacy for some codes ─── */

/** App language → Khaya TTS v2 ISO-style codes (from GET /tts/v2/languages) */
const TTS_LANG_V2 = { tw: "twi", kus: "kus" };

async function fetchTTSLanguages() {
  if (cachedTTSLangs) return cachedTTSLangs;
  requireKey();
  const r = await fetchWithTimeout(KHAYA_BASE + KHAYA_ROUTES.ttsV2Languages, { headers: khayaHeaders() });
  if (!r.ok) return new Set(Object.values(TTS_LANG_V2));
  const d = await r.json();
  const raw = d.languages ?? {};
  cachedTTSLangs = new Set(Object.values(raw).filter(Boolean));
  return cachedTTSLangs;
}

export async function khayaTTSLanguages() {
  const codes = await fetchTTSLanguages();
  return [...codes];
}

export async function resolveTTSLang(appLang) {
  const preferred = TTS_LANG_V2[appLang];
  if (!preferred) return null;
  try {
    const codes = await fetchTTSLanguages();
    if (codes.has(preferred)) return preferred;
    if (appLang === "tw" && codes.has("tw")) return "tw";
  } catch {
    return preferred;
  }
  return preferred;
}

async function readKhayaTtsResponse(r, label) {
  if (!r.ok) await parseKhayaError(r, `${label} failed: ${r.status}`);

  const contentType = (r.headers.get("content-type") || "").toLowerCase();
  if (contentType.includes("text/html")) {
    throw new Error(`${label} returned the app page instead of audio — use Khaya API directly`);
  }

  const buf = await r.arrayBuffer();
  if (buf.byteLength < 256) {
    throw new Error(new TextDecoder().decode(buf) || `${label} failed`);
  }
  return prepareKhayaAudio(buf);
}

async function synthesizeSpeechV2(text, ttsLang) {
  const r = await fetchWithTimeout(KHAYA_BASE + KHAYA_ROUTES.ttsV2Synthesize, {
    method: "POST",
    headers: khayaHeaders(),
    body: JSON.stringify({ text, language: ttsLang }),
  });
  return readKhayaTtsResponse(r, "TTS v2");
}

async function synthesizeSpeechV1(text, ttsLang) {
  const r = await fetchWithTimeout(KHAYA_BASE + KHAYA_ROUTES.ttsV1, {
    method: "POST",
    headers: khayaHeaders(),
    body: JSON.stringify({ text, language: ttsLang }),
  });
  return readKhayaTtsResponse(r, "TTS v1");
}

async function synthesizeSpeech(text, ttsLang, appLang) {
  try {
    return await synthesizeSpeechV2(text, ttsLang);
  } catch (v2err) {
    if (appLang === "tw") {
      return synthesizeSpeechV1(text, "tw");
    }
    throw v2err;
  }
}

function ttsCacheKey(ttsLang, spoken) {
  return `${ttsLang}:${spoken}`;
}

async function getOrSynthesizeSpeech(spoken, ttsLang, appLang) {
  const cacheKey = ttsCacheKey(ttsLang, spoken);
  if (audioCache.has(cacheKey)) return audioCache.get(cacheKey);
  if (ttsInFlight.has(cacheKey)) return ttsInFlight.get(cacheKey);

  const pending = synthesizeSpeech(spoken, ttsLang, appLang)
    .then((audio) => {
      audioCache.set(cacheKey, audio);
      ttsInFlight.delete(cacheKey);
      return audio;
    })
    .catch((err) => {
      ttsInFlight.delete(cacheKey);
      throw err;
    });

  ttsInFlight.set(cacheKey, pending);
  return pending;
}

export async function prefetchSpeech(lineId, text, lang) {
  requireKey();
  const source = (text || "").trim();
  if (!source || lang === "en") return;

  const ttsLang = await resolveTTSLang(lang);
  if (!ttsLang) return;

  const spoken = await translateForLang(source, lang);
  const cacheKey = ttsCacheKey(ttsLang, spoken);
  if (audioCache.has(cacheKey) || ttsInFlight.has(cacheKey)) return;

  try {
    await getOrSynthesizeSpeech(spoken, ttsLang, lang);
  } catch (err) {
    console.warn("[Khaya prefetch]", lineId, err);
  }
}

/** Warm translate + TTS caches for common assistant lines. */
export async function warmVoiceCache(entries, lang) {
  if (!hasKhayaKey() || lang === "en") return;
  await Promise.allSettled(entries.map(({ lineId, text }) => prefetchSpeech(lineId, text, lang)));
}

export async function khayaSpeak(lineId, text, lang, opts = {}) {
  requireKey();
  const source = (text || "").trim();
  if (!source) throw new Error("Nothing to speak");

  return enqueueSpeech(async () => {
    await unlockAudio();

    const ttsLang = await resolveTTSLang(lang);
    if (!ttsLang) throw new Error(`TTS not available for language: ${lang}`);

    const spoken = opts.spokenText?.trim() || (await translateForLang(source, lang));
    const cacheKey = ttsCacheKey(ttsLang, spoken);

    let audio = audioCache.get(cacheKey);
    if (!audio) {
      try {
        audio = await getOrSynthesizeSpeech(spoken, ttsLang, lang);
      } catch (err) {
        audioCache.delete(cacheKey);
        throw err;
      }
    }

    try {
      await playAudioBuffer(audio);
    } catch (playErr) {
      audioCache.delete(cacheKey);
      throw playErr;
    }
  });
}

/* ─── Mic capture ─── */

/**
 * Record from the mic and stop automatically when the user finishes speaking
 * (≈1.2s of silence after speech), instead of a blind fixed window. Falls back
 * to a hard time limit if Web Audio analysis isn't available.
 */
export async function recordOnce({ maxMs = 8000, silenceMs = 1200, minMs = 800 } = {}) {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
    ? "audio/webm;codecs=opus"
    : MediaRecorder.isTypeSupported("audio/webm")
      ? "audio/webm"
      : "";
  const rec = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
  const chunks = [];
  rec.ondataavailable = (e) => {
    if (e.data?.size) chunks.push(e.data);
  };

  // Try to set up silence detection; degrade gracefully to a fixed window.
  let analyser = null;
  let sourceNode = null;
  try {
    const ctx = getSharedAudioContext();
    if (ctx.state === "suspended") await ctx.resume();
    sourceNode = ctx.createMediaStreamSource(stream);
    analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    sourceNode.connect(analyser);
  } catch {
    analyser = null;
  }

  return new Promise((resolve, reject) => {
    let stopped = false;
    let rafId = 0;
    let hardTimer = 0;

    const cleanup = () => {
      cancelAnimationFrame(rafId);
      clearTimeout(hardTimer);
      try { sourceNode?.disconnect(); } catch { /* graceful */ }
    };
    const stop = () => {
      if (stopped) return;
      stopped = true;
      if (rec.state !== "inactive") rec.stop();
    };

    rec.onerror = () => {
      cleanup();
      stream.getTracks().forEach((t) => t.stop());
      reject(new Error("Recording failed"));
    };
    rec.onstop = () => {
      cleanup();
      stream.getTracks().forEach((t) => t.stop());
      resolve(new Blob(chunks, { type: rec.mimeType || "audio/webm" }));
    };

    rec.start();
    hardTimer = setTimeout(stop, maxMs); // absolute safety cap

    if (analyser) {
      const buf = new Uint8Array(analyser.fftSize);
      const start = performance.now();
      let lastLoud = start;
      let heardSpeech = false;
      const tick = () => {
        if (stopped) return;
        analyser.getByteTimeDomainData(buf);
        let sum = 0;
        for (let i = 0; i < buf.length; i++) {
          const v = (buf[i] - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / buf.length);
        const now = performance.now();
        if (rms > 0.04) {
          lastLoud = now;
          heardSpeech = true;
        }
        const elapsed = now - start;
        if (heardSpeech && elapsed >= minMs && now - lastLoud >= silenceMs) return stop();
        rafId = requestAnimationFrame(tick);
      };
      rafId = requestAnimationFrame(tick);
    }
  });
}

