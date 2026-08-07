// Ambient declarations for non-standard browser APIs used by the voice layer,
// so `// @ts-check` modules and editors type these instead of erroring.

interface Window {
  webkitAudioContext?: typeof AudioContext;
  SpeechRecognition?: typeof SpeechRecognition;
  webkitSpeechRecognition?: typeof SpeechRecognition;
}

declare class SpeechRecognition extends EventTarget {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}
