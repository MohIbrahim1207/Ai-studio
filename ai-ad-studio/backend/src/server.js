import fs from "fs";
import path from "path";
import express from "express";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";
import { config } from "./config.js";
import { ensureDir, resolveRunDirs, writeJson } from "./utils/fs.js";
import { parseBrief } from "./utils/briefParser.js";
import { generateScript } from "./services/scriptService.js";
import { generateScenes } from "./services/sceneService.js";
import { generateVoiceover } from "./services/voiceService.js";
import { generateSceneImages } from "./services/imageService.js";
import { assembleVideo } from "./services/videoService.js";
import { generateDidVideo } from "./services/didVideoService.js";

const app = express();

ensureDir(config.assetsDir);
ensureDir(config.scriptsDir);

app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use("/assets", express.static(config.assetsDir));

function saveState(runDir, fileName, payload) {
  writeJson(path.join(runDir, fileName), payload);
}

app.get("/health", (_, res) => {
  res.json({ ok: true, service: "ai-ad-studio-backend" });
});

app.post("/generate-script", async (req, res) => {
  try {
    const parsedBrief = parseBrief(req.body || {});
    const script = await generateScript(parsedBrief);

    res.json({ parsedBrief, script });
  } catch (error) {
    res.status(500).json({ error: error.message || "Script generation failed" });
  }
});

app.post("/generate-scenes", async (req, res) => {
  try {
    const { script, duration } = req.body || {};
    if (!script) {
      return res.status(400).json({ error: "script is required" });
    }
    const scenes = generateScenes(script, duration);
    return res.json({ scenes });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Scene generation failed" });
  }
});

app.post("/generate-voice", async (req, res) => {
  try {
    const { script, duration, runId } = req.body || {};
    if (!script) {
      return res.status(400).json({ error: "script is required" });
    }

    const currentRunId = runId || uuidv4();
    const { runDir, audioDir } = resolveRunDirs(config.assetsDir, currentRunId);
    const voice = await generateVoiceover(script, duration || 20, audioDir);

    saveState(runDir, "voice.json", voice);

    return res.json({
      runId: currentRunId,
      voice,
      audioUrl: `${config.publicBaseUrl}/assets/${currentRunId}/audio/voiceover.mp3`
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Voice generation failed" });
  }
});

app.post("/generate-video", async (req, res) => {
  try {
    const { runId, scenes, script, duration } = req.body || {};
    if (!runId || !scenes || !script) {
      return res.status(400).json({ error: "runId, scenes and script are required" });
    }

    const { runDir, sceneDir, audioDir, videoDir } = resolveRunDirs(config.assetsDir, runId);
    const sceneImages = await generateSceneImages(scenes, sceneDir);
    const audioPath = path.join(audioDir, "voiceover.mp3");

    if (!fs.existsSync(audioPath)) {
      const voice = await generateVoiceover(script, duration || 20, audioDir);
      saveState(runDir, "voice.json", voice);
    }

    const result = await assembleVideo({
      scenes,
      sceneImages,
      sceneDir,
      videoDir,
      audioPath,
      duration: duration || 20
    });

    saveState(runDir, "scenes.json", scenes);
    saveState(runDir, "script.json", script);
    saveState(runDir, "video.json", result);

    return res.json({
      runId,
      videoUrl: `${config.publicBaseUrl}/assets/${runId}/video/final-ad.mp4`,
      assets: {
        scenes: sceneImages.map(
          (_, idx) => `${config.publicBaseUrl}/assets/${runId}/scenes/scene-${idx + 1}.ppm`
        ),
        voice: `${config.publicBaseUrl}/assets/${runId}/audio/voiceover.mp3`,
        finalVideo: `${config.publicBaseUrl}/assets/${runId}/video/final-ad.mp4`
      }
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Video generation failed" });
  }
});

app.post("/generate-all", async (req, res) => {
  try {
    const runId = uuidv4();
    const parsedBrief = parseBrief(req.body || {});
    const script = await generateScript(parsedBrief);
    const scenes = generateScenes(script, parsedBrief.duration);

    const { runDir, sceneDir, audioDir, videoDir } = resolveRunDirs(config.assetsDir, runId);
    saveState(runDir, "brief.json", parsedBrief);
    saveState(runDir, "script.json", script);
    saveState(runDir, "scenes.json", scenes);

    const voice = await generateVoiceover(script, parsedBrief.duration, audioDir);
    saveState(runDir, "voice.json", voice);

    const sceneImages = await generateSceneImages(scenes, sceneDir);
    await assembleVideo({
      scenes,
      sceneImages,
      sceneDir,
      videoDir,
      audioPath: voice.audioPath,
      duration: parsedBrief.duration
    });

    return res.json({
      runId,
      parsedBrief,
      script,
      scenes,
      videoUrl: `${config.publicBaseUrl}/assets/${runId}/video/final-ad.mp4`,
      assets: {
        voice: `${config.publicBaseUrl}/assets/${runId}/audio/voiceover.mp3`,
        finalVideo: `${config.publicBaseUrl}/assets/${runId}/video/final-ad.mp4`,
        sceneFolder: `${config.publicBaseUrl}/assets/${runId}/scenes`
      }
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Pipeline failed" });
  }
});

app.post("/generate-did-video", async (req, res) => {
  try {
    const { script, runId } = req.body || {};
    if (!script || !runId) {
      return res.status(400).json({ error: "script and runId are required" });
    }
    const { videoDir } = resolveRunDirs(config.assetsDir, runId);
    const outputPath = path.join(videoDir, "did-video.mp4");
    const resultPath = await generateDidVideo({ script, outputPath });
    return res.json({
      runId,
      videoUrl: `${config.publicBaseUrl}/assets/${runId}/video/did-video.mp4`,
      resultPath
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || "D-ID video generation failed" });
  }
});

app.listen(config.port, () => {
  console.log(`AI Ad Studio backend running on http://localhost:${config.port}`);
});
