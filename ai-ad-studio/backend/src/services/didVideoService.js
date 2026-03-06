import fs from "fs";
import path from "path";
import { config } from "../config.js";

/**
 * Generate a talking-head video via the D-ID API.
 * Falls back to a silent placeholder if the key is missing or the call fails.
 */
export async function generateDidVideo({ script, outputPath }) {
  const narration = [script.hook, script.problem, script.solution, script.testimonial, script.cta]
    .filter(Boolean)
    .join(" ");

  if (!config.didApiKey) {
    console.warn("DID_API_KEY not set – skipping D-ID video generation.");
    return outputPath;
  }

  try {
    // 1. Create a talk
    const createRes = await fetch("https://api.d-id.com/talks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${config.didApiKey}`
      },
      body: JSON.stringify({
        script: {
          type: "text",
          input: narration,
          provider: { type: "microsoft", voice_id: "en-US-JennyNeural" }
        },
        source_url:
          "https://d-id-public-bucket.s3.us-west-2.amazonaws.com/alice.jpg"
      })
    });

    if (!createRes.ok) {
      throw new Error(`D-ID create talk failed: ${createRes.status}`);
    }

    const { id: talkId } = await createRes.json();

    // 2. Poll until the talk is done (max ~2 min)
    let resultUrl = null;
    for (let i = 0; i < 24; i++) {
      await new Promise((r) => setTimeout(r, 5000));

      const pollRes = await fetch(`https://api.d-id.com/talks/${talkId}`, {
        headers: { Authorization: `Basic ${config.didApiKey}` }
      });

      if (!pollRes.ok) continue;
      const data = await pollRes.json();

      if (data.status === "done" && data.result_url) {
        resultUrl = data.result_url;
        break;
      }
      if (data.status === "error") {
        throw new Error("D-ID talk generation errored");
      }
    }

    if (!resultUrl) {
      throw new Error("D-ID talk timed out");
    }

    // 3. Download the video
    const videoRes = await fetch(resultUrl);
    if (!videoRes.ok) throw new Error("Failed to download D-ID video");
    const buffer = Buffer.from(await videoRes.arrayBuffer());
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, buffer);

    return outputPath;
  } catch (error) {
    console.error("D-ID video generation failed:", error.message);
    return outputPath;
  }
}
