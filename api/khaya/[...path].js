import { khayaHandler } from "../_lib/handlers.js";

// Raw-body passthrough (audio uploads for ASR, JSON for translate/TTS).
export const config = { api: { bodyParser: false } };

export default khayaHandler;
