/** Audio playback — parse Khaya IEEE-float WAV into Web Audio buffers directly. */

let ctx = null;
let currentSource = null;

export function getSharedAudioContext() {
  return getContext();
}

function getContext() {
  if (!ctx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) throw new Error("Web Audio not supported");
    ctx = new Ctx();
  }
  return ctx;
}

function readFourCC(view, offset) {
  if (offset + 4 > view.byteLength) return "";
  return String.fromCharCode(
    view.getUint8(offset),
    view.getUint8(offset + 1),
    view.getUint8(offset + 2),
    view.getUint8(offset + 3)
  );
}

function findChunk(view, fourCC) {
  let offset = 12;
  while (offset + 8 <= view.byteLength) {
    const id = readFourCC(view, offset);
    const size = view.getUint32(offset + 4, true);
    if (id === fourCC) return { offset: offset + 8, size };
    offset += 8 + size + (size % 2);
  }
  return null;
}

export function inspectKhayaWav(input) {
  const view = input instanceof ArrayBuffer ? new DataView(input) : new DataView(input.buffer, input.byteOffset, input.byteLength);
  if (view.byteLength < 44) {
    throw new Error(`TTS audio too small (${view.byteLength} bytes)`);
  }

  const riff = readFourCC(view, 0);
  const wave = readFourCC(view, 8);
  if (riff !== "RIFF" || wave !== "WAVE") {
    const preview = new TextDecoder().decode(
      new Uint8Array(view.buffer, view.byteOffset, Math.min(120, view.byteLength))
    );
    throw new Error(`TTS returned non-audio data: ${preview.replace(/\s+/g, " ").trim().slice(0, 80)}`);
  }

  const fmt = findChunk(view, "fmt ");
  const data = findChunk(view, "data");
  if (!fmt || !data) throw new Error("TTS WAV missing fmt or data chunk");

  const audioFormat = view.getUint16(fmt.offset, true);
  const channels = view.getUint16(fmt.offset + 2, true);
  const sampleRate = view.getUint32(fmt.offset + 4, true);
  const blockAlign = view.getUint16(fmt.offset + 12, true);
  const bitsPerSample = view.getUint16(fmt.offset + 14, true);
  if (!channels || !sampleRate || !blockAlign) {
    throw new Error("TTS WAV header is invalid");
  }

  const available = view.byteLength - data.offset;
  const dataBytes = Math.min(data.size, available);
  const frameCount = Math.floor(dataBytes / blockAlign);
  if (!frameCount) throw new Error("TTS WAV contains no audio frames");

  return { view, audioFormat, channels, sampleRate, blockAlign, bitsPerSample, dataOffset: data.offset, frameCount };
}

function readSample(view, offset, format, bits) {
  if (offset + bits / 8 > view.byteLength) return 0;
  if (format === 3 && bits === 32) return view.getFloat32(offset, true);
  if (format === 1 && bits === 16) return view.getInt16(offset, true) / 0x8000;
  if (format === 1 && bits === 8) return (view.getUint8(offset) - 128) / 128;
  throw new Error(`Unsupported Khaya WAV format ${format}/${bits}`);
}

const decodedCache = new WeakMap();

function khayaWavToAudioBuffer(input, audioCtx) {
  const meta = inspectKhayaWav(input);
  const { view, channels, frameCount, sampleRate, blockAlign, bitsPerSample, audioFormat, dataOffset } = meta;

  let buffer;
  try {
    buffer = audioCtx.createBuffer(channels, frameCount, sampleRate);
  } catch (err) {
    throw new Error(`Cannot create audio buffer (${frameCount} frames @ ${sampleRate}Hz): ${err.message}`);
  }

  if (channels === 1 && audioFormat === 3 && bitsPerSample === 32 && blockAlign === 4) {
    const pcmBytes = frameCount * 4;
    const slice = input.slice(dataOffset, dataOffset + pcmBytes);
    const samples = new Float32Array(slice);
    const out = buffer.getChannelData(0);
    for (let i = 0; i < frameCount; i++) {
      const s = samples[i];
      out[i] = Number.isFinite(s) ? Math.max(-1, Math.min(1, s)) : 0;
    }
    return buffer;
  }

  const bytesPerSample = bitsPerSample / 8;
  for (let ch = 0; ch < channels; ch++) {
    const out = buffer.getChannelData(ch);
    for (let i = 0; i < frameCount; i++) {
      const sampleOffset = dataOffset + i * blockAlign + ch * bytesPerSample;
      const sample = readSample(view, sampleOffset, audioFormat, bitsPerSample);
      out[i] = Number.isFinite(sample) ? sample : 0;
    }
  }

  return buffer;
}

function decodeKhayaAudio(raw, audioCtx) {
  const cached = decodedCache.get(raw);
  if (cached) return cached;
  const buffer = khayaWavToAudioBuffer(raw, audioCtx);
  decodedCache.set(raw, buffer);
  return buffer;
}

/** Call on user tap (language pick, Zigi, mic) before any await. */
export async function unlockAudio() {
  const audioCtx = getContext();
  if (audioCtx.state === "suspended") await audioCtx.resume();

  try {
    const prime = audioCtx.createBufferSource();
    prime.buffer = audioCtx.createBuffer(1, 1, audioCtx.sampleRate);
    prime.connect(audioCtx.destination);
    prime.start(0);
    prime.stop(audioCtx.currentTime + 0.01);
  } catch {
    /* graceful */
  }

  return audioCtx.state === "running";
}

export function stopAudio() {
  if (currentSource) {
    try {
      currentSource.stop();
    } catch {
      /* already stopped */
    }
    currentSource.disconnect();
    currentSource = null;
  }
}

async function toArrayBuffer(input) {
  if (input instanceof ArrayBuffer) return input;
  if (ArrayBuffer.isView(input)) {
    return input.buffer.slice(input.byteOffset, input.byteOffset + input.byteLength);
  }
  if (input instanceof Blob) return input.arrayBuffer();
  throw new Error("Unsupported audio input");
}

async function playBuffer(buffer) {
  const audioCtx = getContext();
  if (audioCtx.state === "suspended") await audioCtx.resume();

  return new Promise((resolve, reject) => {
    const src = audioCtx.createBufferSource();
    src.buffer = buffer;
    src.connect(audioCtx.destination);
    currentSource = src;
    src.onended = () => {
      currentSource = null;
      resolve();
    };
    try {
      src.start(0);
    } catch (err) {
      currentSource = null;
      reject(err);
    }
  });
}

export async function playAudioBuffer(input) {
  await unlockAudio();
  stopAudio();
  const raw = await toArrayBuffer(input);
  const audioCtx = getContext();
  const buffer = decodeKhayaAudio(raw, audioCtx);
  return playBuffer(buffer);
}

export async function playAudioBlob(blob) {
  return playAudioBuffer(blob);
}

export async function playAudioUrl(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Audio file not found: ${url}`);
  const contentType = (res.headers.get("content-type") || "").toLowerCase();
  if (!contentType.includes("audio") && !contentType.includes("octet-stream")) {
    throw new Error(`URL is not an audio file: ${url}`);
  }
  return playAudioBuffer(await res.arrayBuffer());
}

/** Validate and return a copy of the Khaya WAV bytes for caching. */
export function prepareKhayaAudio(input) {
  const raw = input instanceof ArrayBuffer ? input : null;
  if (!raw) throw new Error("Expected ArrayBuffer from Khaya TTS");
  inspectKhayaWav(raw);
  return raw.slice(0);
}