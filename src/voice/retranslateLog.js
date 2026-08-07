import { localizedLine } from "./localize.js";

/** Re-translate Zigi chat lines when the user switches language. */
export async function retranslateLog(log, lang) {
  if (!lang || lang === "en") return log;

  // Parallel; Promise.all preserves order, and the client dedupes in-flight.
  return Promise.all(
    log.map(async (entry) => {
      if (entry.who === "you") return entry;
      const source = entry.english || entry.text;
      const text = await localizedLine(source, null, lang);
      return { ...entry, text, english: source };
    })
  );
}