import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { khayaHandler, geminiHandler, groqHandler } from "./api/_lib/handlers.js";

/**
 * Dev/preview server mounts the SAME proxy handlers used by the Vercel
 * functions in api/, so the Khaya + Gemini keys stay server-side (never in the
 * browser bundle) both locally and in production.
 */
function apiMiddleware(req, res, next) {
  if (req.url?.startsWith("/api/khaya")) return void khayaHandler(req, res);
  if (req.url?.startsWith("/api/gemini")) return void geminiHandler(req, res);
  if (req.url?.startsWith("/api/groq")) return void groqHandler(req, res);
  return next();
}

export default defineConfig(({ mode }) => {
  // Empty prefix loads ALL vars (including the non-VITE server secrets) into
  // the dev process so the proxy handlers can read process.env.*_API_KEY.
  const env = loadEnv(mode, process.cwd(), "");
  if (!process.env.KHAYA_API_KEY) process.env.KHAYA_API_KEY = env.KHAYA_API_KEY || "";
  if (!process.env.GEMINI_API_KEY) process.env.GEMINI_API_KEY = env.GEMINI_API_KEY || "";
  if (!process.env.GROQ_API_KEY) process.env.GROQ_API_KEY = env.GROQ_API_KEY || "";

  return {
    plugins: [
      react(),
      {
        name: "zigi-api-dev",
        configureServer(server) {
          server.middlewares.use(apiMiddleware);
        },
        configurePreviewServer(server) {
          server.middlewares.use(apiMiddleware);
        },
      },
    ],
    build: {
      rollupOptions: {
        output: {
          // Split the rarely-changing React runtime into its own long-cached
          // chunk so app updates don't invalidate it.
          manualChunks: {
            react: ["react", "react-dom"],
          },
        },
      },
    },
  };
});
