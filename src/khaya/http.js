/** fetch() with an abort-based timeout so hung requests never wedge the UI. */
export async function fetchWithTimeout(url, options = {}, ms = 20000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...options, signal: options.signal ?? ctrl.signal });
  } catch (err) {
    if (err?.name === "AbortError") {
      throw Object.assign(new Error("Request timed out. Check your connection and try again."), {
        code: "timeout",
      });
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
