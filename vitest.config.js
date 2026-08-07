import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.js"],
    include: ["src/**/*.test.{js,jsx}", "api/**/*.test.js"],
    coverage: {
      provider: "v8",
      // Coverage is measured on the pure, unit-testable core. The thin I/O
      // adapters (asr/tts/khaya client/understand/uiLocalize) are exercised by
      // the Playwright E2E flow, not unit tests, so including them here would
      // measure the wrong denominator.
      include: [
        "src/voice/nlu.js",
        "src/voice/intents.js",
        "src/voice/dialogue.js",
        "src/voice/pinSummary.js",
        "src/data/bundles.js",
        "api/_lib/handlers.js",
      ],
      exclude: ["**/*.test.{js,jsx}"],
      thresholds: { statements: 70, branches: 70, functions: 80, lines: 70 },
    },
  },
});
