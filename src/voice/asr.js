import { hasKhayaKey } from "../khaya/config.js";
import { hasGroqKey } from "../groq/client.js";

export { hasKhayaKey };

// Manual override: "auto" (default) | "webspeech" | "khaya" | "groq"
export const ASR_PROVIDER = "auto";

export function isWebSpeechAvailable() {
  if (typeof window === "undefined") return false;
  if (!window.isSecureContext) return false;
  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
}

/**
 * Auto priority:
 *  - English: Groq Whisper (best) → Khaya ASR → Web Speech.
 *  - Twi/Kusaal: Khaya ASR → Groq Whisper (auto-detect) → Web Speech.
 */
export function resolveASRProvider(lang = "en") {
  if (ASR_PROVIDER === "webspeech") return "webspeech";
  if (ASR_PROVIDER === "khaya") return hasKhayaKey() ? "khaya" : "webspeech";
  if (ASR_PROVIDER === "groq") return hasGroqKey() ? "groq" : "webspeech";

  if (lang === "tw" || lang === "kus") {
    if (hasKhayaKey()) return "khaya";
    if (hasGroqKey()) return "groq";
    return "webspeech";
  }

  if (hasGroqKey()) return "groq";
  if (hasKhayaKey()) return "khaya";
  return "webspeech";
}

export function createASR(lang = "en") {
  const provider = resolveASRProvider(lang);
  if (provider === "groq") return createGroqASR(lang);
  const khaya = hasKhayaKey() ? createKhayaASR(lang) : null;

  if (provider === "khaya" && khaya) return khaya;
  return createWebSpeechASR(lang, khaya);
}

export function micHelpMessage(lang = "en") {
  if ((lang === "tw" || lang === "kus") && !hasKhayaKey()) {
    return "Twi and Kusaal voice need a Khaya API key. Copy .env.example to .env, add your key, restart the dev server, then try the mic again. You can type below meanwhile.";
  }
  if (!isWebSpeechAvailable() && !hasKhayaKey()) {
    return "Voice input isn't available in this browser. Open the app in Chrome or Edge over localhost, or add a Khaya API key in .env for mic capture. Typing below works the same.";
  }
  return "Voice input isn't available right now — type below and it works the same.";
}

async function ensureMicPermission() {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw Object.assign(new Error("Microphone API unavailable"), { code: "no-mic-api" });
  }
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  stream.getTracks().forEach((t) => t.stop());
}

function mapMicError(err) {
  const name = err?.name || "";
  const code = err?.code || name || "unknown";

  if (name === "NotAllowedError" || code === "not-allowed") {
    return {
      code: "not-allowed",
      message: "Microphone access was blocked. Allow mic permission for this site in your browser settings, then tap the mic again.",
      fallbackToKhaya: false,
    };
  }
  if (name === "NotFoundError") {
    return {
      code: "no-device",
      message: "No microphone found. Plug in a mic or type below.",
      fallbackToKhaya: false,
    };
  }
  if (code === "no-mic-api" || code === "no-khaya-key") {
    return { code, message: err.message, fallbackToKhaya: false };
  }
  return {
    code,
    message: err?.message || micHelpMessage(),
    fallbackToKhaya: false,
  };
}

function webSpeechLang(lang) {
  if (lang === "en") return "en-US";
  return lang;
}

function createWebSpeechASR(lang = "en", khayaFallback = null) {
  const speechLang = webSpeechLang(lang);

  return {
    id: "webspeech",
    lang: speechLang,
    listen(onResult, onError, onEnd) {
      (async () => {
        try {
          await ensureMicPermission();
        } catch (err) {
          const mapped = mapMicError(err);
          if (mapped.fallbackToKhaya && khayaFallback) {
            khayaFallback.listen(onResult, onError, onEnd);
            return;
          }
          onError(mapped);
          onEnd?.();
          return;
        }

        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) {
          if (khayaFallback) {
            khayaFallback.listen(onResult, onError, onEnd);
            return;
          }
          onError({ code: "unsupported", message: micHelpMessage(lang) });
          onEnd?.();
          return;
        }

        const rec = new SR();
        rec.lang = speechLang;
        rec.interimResults = false;
        rec.maxAlternatives = 1;
        let gotResult = false;

        rec.onresult = (e) => {
          if (e.results?.length && e.results[0]?.length) {
            gotResult = true;
            onResult(e.results[0][0].transcript);
          }
        };

        rec.onerror = (e) => {
          const code = e.error || "unknown";
          if (code === "no-speech") {
            if (!gotResult) {
              onError({
                code,
                message: "I didn't hear anything. Tap the mic and speak clearly, or type below.",
              });
            }
            return;
          }
          if (code === "aborted") return;

          if (khayaFallback && !gotResult) {
            khayaFallback.listen(onResult, onError, onEnd);
            return;
          }

          if (code === "not-allowed" || code === "service-not-allowed") {
            onError({
              code,
              message: "Microphone access was blocked. Allow mic permission for this site, then try again.",
            });
            return;
          }

          if (!gotResult) {
            onError({ code, message: micHelpMessage(lang) });
          }
        };

        rec.onend = () => onEnd?.();

        try {
          rec.start();
        } catch (err) {
          if (khayaFallback && !gotResult) {
            khayaFallback.listen(onResult, onError, onEnd);
            return;
          }
          onError({ code: "start-failed", message: err.message || micHelpMessage(lang) });
          onEnd?.();
        }
      })();

      return null;
    },
    async transcribe() {
      throw new Error("Use listen() for webspeech provider");
    },
  };
}

function createKhayaASR(lang = "en") {
  return {
    id: "khaya",
    lang,
    async transcribe(audioBlob, langOverride) {
      const { khayaSTT } = await import("../khaya/client.js");
      return khayaSTT(audioBlob, langOverride || lang);
    },
    listen(onResult, onError, onEnd) {
      (async () => {
        try {
          await ensureMicPermission();
          const { recordOnce, khayaSTT } = await import("../khaya/client.js");
          const blob = await recordOnce({ maxMs: 8000 });

          let text;
          try {
            text = (await khayaSTT(blob, lang))?.trim();
          } catch (khayaErr) {
            // Khaya STT unavailable (e.g. quota exhausted). If Groq is on, run
            // the SAME recording through Whisper instead of making the user
            // repeat themselves. Language auto-detects for tw/kus.
            if (!hasGroqKey()) throw khayaErr;
            console.warn("[ASR] Khaya STT failed — falling back to Groq Whisper", khayaErr);
            const { groqTranscribe } = await import("../groq/client.js");
            text = (await groqTranscribe(blob, lang))?.trim();
          }

          if (!text) {
            onError({
              code: "no-speech",
              message: "I didn't catch that. Speak again or type below.",
            });
          } else {
            onResult(text);
          }
        } catch (err) {
          onError(mapMicError(err));
        } finally {
          onEnd?.();
        }
      })();
      return null;
    },
  };
}

/** Groq Whisper: record with stop-on-silence, then transcribe. Much better
 *  than browser Web Speech, especially for English. */
function createGroqASR(lang = "en") {
  return {
    id: "groq",
    lang,
    async transcribe(audioBlob, langOverride) {
      const { groqTranscribe } = await import("../groq/client.js");
      return groqTranscribe(audioBlob, langOverride || lang);
    },
    listen(onResult, onError, onEnd) {
      (async () => {
        try {
          await ensureMicPermission();
          const [{ recordOnce }, { groqTranscribe }] = await Promise.all([
            import("../khaya/client.js"),
            import("../groq/client.js"),
          ]);
          const blob = await recordOnce({ maxMs: 12000 });
          const text = (await groqTranscribe(blob, lang))?.trim();
          if (!text) {
            onError({
              code: "no-speech",
              message: "I didn't catch that. Speak again or type below.",
            });
          } else {
            onResult(text);
          }
        } catch (err) {
          onError(mapMicError(err));
        } finally {
          onEnd?.();
        }
      })();
      return null;
    },
  };
}