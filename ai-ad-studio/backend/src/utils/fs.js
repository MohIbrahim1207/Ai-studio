import fs from "fs";
import path from "path";

export function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

export function safeSlug(value) {
  return String(value || "ad")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);
}

export function resolveRunDirs(baseAssetsDir, runId) {
  const runDir = path.join(baseAssetsDir, runId);
  const sceneDir = path.join(runDir, "scenes");
  const audioDir = path.join(runDir, "audio");
  const videoDir = path.join(runDir, "video");
  ensureDir(runDir);
  ensureDir(sceneDir);
  ensureDir(audioDir);
  ensureDir(videoDir);
  return { runDir, sceneDir, audioDir, videoDir };
}

export function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}
