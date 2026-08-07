import { groqHandler } from "../_lib/handlers.js";

// Raw-body passthrough (JSON for chat, multipart audio for Whisper STT).
export const config = { api: { bodyParser: false } };

export default groqHandler;
