import { UI_EN } from "../content/ui.en.js";
import { hasKhayaKey } from "../khaya/config.js";

const cache = new Map();

export async function getUiStrings(lang = "en") {
  if (!lang || lang === "en" || !hasKhayaKey()) return { ...UI_EN };

  if (cache.has(lang)) return { ...cache.get(lang) };

  const translated = { ...UI_EN };

  try {
    const { translateForLang } = await import("../khaya/client.js");
    // Translate in parallel — the client dedupes/caches in-flight requests.
    const pairs = await Promise.all(
      Object.entries(UI_EN).map(async ([key, value]) => {
        try {
          const t = await translateForLang(value, lang);
          return [key, (t || "").trim() || value];
        } catch (err) {
          console.warn("[getUiStrings] fallback for", key, err);
          return [key, value];
        }
      })
    );
    for (const [key, value] of pairs) translated[key] = value;
  } catch (err) {
    console.warn("[getUiStrings] using English UI", err);
    return { ...UI_EN };
  }

  cache.set(lang, { ...translated });
  return { ...translated };
}

export function clearUiCache(lang) {
  if (lang) cache.delete(lang);
  else cache.clear();
}