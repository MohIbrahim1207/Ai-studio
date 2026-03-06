import { parseBrief } from "../backend/src/utils/briefParser.js";
import { generateScript } from "../backend/src/services/scriptService.js";
import { generateScenes } from "../backend/src/services/sceneService.js";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const parsedBrief = parseBrief(req.body || {});
        const script = await generateScript(parsedBrief);
        const scenes = generateScenes(script, parsedBrief.duration);

        return res.status(200).json({
            parsedBrief,
            script,
            scenes,
            // Video generation is not available on Vercel (requires ffmpeg + persistent storage).
            // The script and scenes data are returned for preview.
            videoUrl: null,
            assets: null,
            notice: "Video assembly requires a server with ffmpeg. Script and scenes generated successfully."
        });
    } catch (error) {
        return res.status(500).json({ error: error.message || "Pipeline failed" });
    }
}
