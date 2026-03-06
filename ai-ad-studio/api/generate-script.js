import { parseBrief } from "../backend/src/utils/briefParser.js";
import { generateScript } from "../backend/src/services/scriptService.js";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const parsedBrief = parseBrief(req.body || {});
        const script = await generateScript(parsedBrief);
        return res.status(200).json({ parsedBrief, script });
    } catch (error) {
        return res.status(500).json({ error: error.message || "Script generation failed" });
    }
}
