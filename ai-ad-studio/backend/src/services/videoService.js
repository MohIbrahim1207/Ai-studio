import fs from "fs";
import path from "path";
import { config } from "../config.js";
import { runCommand } from "../utils/ffmpeg.js";

function sceneClipPath(sceneDir, sceneId) {
  return path.join(sceneDir, `scene-${sceneId}.mp4`);
}

async function buildSceneClip(scene, imagePath, sceneDir) {
  const output = sceneClipPath(sceneDir, scene.id);
  const fadeOutStart = Math.max(0, scene.duration - 0.5);
  const safeText = String(scene.textOverlay || "")
    .replace(/\\/g, "\\\\")
    .replace(/:/g, "\\:")
    .replace(/'/g, "\\'")
    .replace(/\n/g, " ");

  await runCommand(config.ffmpegPath, [
    "-y",
    "-loop",
    "1",
    "-i",
    imagePath,
    "-t",
    String(scene.duration),
    "-vf",
    `scale=1080:1920,format=yuv420p,drawtext=text='${safeText}':fontcolor=white:fontsize=56:line_spacing=10:x=(w-text_w)/2:y=h-360:box=1:boxcolor=black@0.45:boxborderw=20,fade=t=in:st=0:d=0.35,fade=t=out:st=${fadeOutStart}:d=0.45`,
    "-r",
    "30",
    output
  ]);

  return output;
}

async function concatClips(clipPaths, outputPath) {
  const listFile = path.join(path.dirname(outputPath), "concat.txt");
  const content = clipPaths.map((clip) => `file '${clip.replace(/\\/g, "/")}'`).join("\n");
  fs.writeFileSync(listFile, content, "utf8");

  await runCommand(config.ffmpegPath, [
    "-y",
    "-f",
    "concat",
    "-safe",
    "0",
    "-i",
    listFile,
    "-c",
    "copy",
    outputPath
  ]);
}

async function mergeAudio(videoPath, audioPath, outputPath, totalDuration) {
  await runCommand(config.ffmpegPath, [
    "-y",
    "-i",
    videoPath,
    "-i",
    audioPath,
    "-map",
    "0:v:0",
    "-map",
    "1:a:0",
    "-c:v",
    "copy",
    "-c:a",
    "aac",
    "-shortest",
    "-t",
    String(totalDuration),
    outputPath
  ]);
}

export async function assembleVideo({
  scenes,
  sceneImages,
  sceneDir,
  videoDir,
  audioPath,
  duration
}) {
  const clipPaths = [];
  for (let i = 0; i < scenes.length; i += 1) {
    const clip = await buildSceneClip(scenes[i], sceneImages[i], sceneDir);
    clipPaths.push(clip);
  }

  const stitchedPath = path.join(videoDir, "stitched.mp4");
  await concatClips(clipPaths, stitchedPath);

  const finalPath = path.join(videoDir, "final-ad.mp4");
  await mergeAudio(stitchedPath, audioPath, finalPath, duration);

  return {
    stitchedPath,
    finalPath,
    clipPaths
  };
}
