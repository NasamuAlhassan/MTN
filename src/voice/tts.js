import { hasKhayaKey } from "../khaya/config.js";
import { stopAudio, unlockAudio } from "../khaya/audioPlayer.js";
import { englishLine } from "./speakLine.js";

export const TTS_PROVIDER = "auto";

export function resolveTTSProvider(lang = "en") {
  if (TTS_PROVIDER === "khaya") return hasKhayaKey() ? "khaya" : "webspeech";
  if (TTS_PROVIDER === "webspeech") return "webspeech";
  if ((lang === "tw" || lang === "kus") && hasKhayaKey()) return "khaya";
  return "webspeech";
}

export function createTTS(lang = "en") {
  // Build both engines and pick per call based on the *spoken* language. The
  // TTS instance is memoized on `lang` in the app, so right after a language
  // switch the still-memoized instance (created for the previous language)
  // would otherwise route to the wrong engine — sending a Twi greeting to the
  // English Web Speech voice, which is silent. Deciding per call fixes that.
  const web = createWebSpeechTTS();
  const khaya = createKhayaTTS(lang);
  return {
    id: "auto",
    lang,
    async speak(lineId, text, speakLang = lang, opts = {}) {
      const provider = resolveTTSProvider(speakLang);
      const engine = provider === "khaya" ? khaya : web;
      return engine.speak(lineId, text, speakLang, opts);
    },
  };
}

function stopWebSpeech() {
  try {
    window.speechSynthesis?.cancel();
  } catch {
    /* graceful */
  }
}

function createWebSpeechTTS() {
  return {
    async speak(lineId, text, lang = "en", _opts = {}) {
      const line = englishLine(text, lineId);
      if (!line) return;
      stopAudio();
      stopWebSpeech();
      await unlockAudio();
      const synth = window.speechSynthesis;
      if (!synth) return;
      return new Promise((resolve) => {
        const utterance = new SpeechSynthesisUtterance(line);
        utterance.lang = lang === "en" ? "en-US" : lang;
        utterance.rate = 0.98;
        // Some browsers (notably Chrome) intermittently never fire onend; a
        // guard timer keeps the "speaking" state from wedging forever.
        let done = false;
        const finish = () => {
          if (done) return;
          done = true;
          clearTimeout(guard);
          resolve();
        };
        const guard = setTimeout(() => {
          try { synth.cancel(); } catch { /* graceful */ }
          finish();
        }, 15000);
        utterance.onend = finish;
        utterance.onerror = finish;
        synth.speak(utterance);
      });
    },
  };
}

function createKhayaTTS(lang) {
  const webFallback = createWebSpeechTTS();

  return {
    async speak(lineId, text, speakLang = lang, opts = {}) {
      const line = englishLine(text, lineId);
      if (!line) return;

      stopAudio();
      stopWebSpeech();
      await unlockAudio();

      try {
        const { khayaSpeak } = await import("../khaya/client.js");
        await khayaSpeak(lineId, line, speakLang, { spokenText: opts?.spokenText });
      } catch (err) {
        // Khaya voice unavailable (e.g. bad/expired key, network). Degrade
        // gracefully to spoken English rather than hard-failing with an error
        // the user — who may not read English — cannot act on. The line text is
        // already shown on screen; at least make it audible.
        console.warn("[Khaya TTS] falling back to Web Speech", speakLang, err);
        await webFallback.speak(lineId, line, "en");
      }
    },
  };
}