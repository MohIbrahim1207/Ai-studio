import { generateScenes } from "../backend/src/services/sceneService.js";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { script, duration } = req.body || {};
        if (!script) {
            return res.status(400).json({ error: "script is required" });
        }
        const scenes = generateScenes(script, duration);
        return res.status(200).json({ scenes });
    } catch (error) {
        return res.status(500).json({ error: error.message || "Scene generation failed" });
    }
}
