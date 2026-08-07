/** Serialize voice playback so replies never overlap. */

let tail = Promise.resolve();

export function enqueueSpeech(task) {
  const run = tail.then(() => task());
  tail = run.catch(() => {});
  return run;
}

export function clearSpeechQueue() {
  tail = Promise.resolve();
}