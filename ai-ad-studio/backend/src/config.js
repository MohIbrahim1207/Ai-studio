import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "../../");

export const config = {
  port: Number(process.env.PORT || 8787),
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  ttsApiKey: process.env.TTS_API_KEY || "",
  ttsVoiceId: process.env.TTS_VOICE_ID || "alloy",
  ffmpegPath: process.env.FFMPEG_PATH || "ffmpeg",
  ffprobePath: process.env.FFPROBE_PATH || "ffprobe",
  publicBaseUrl: process.env.PUBLIC_BASE_URL || "http://localhost:8787",
  assetsDir: path.join(root, "assets"),
  scriptsDir: path.join(root, "scripts")
  , didApiKey: process.env.DID_API_KEY || ""
};
