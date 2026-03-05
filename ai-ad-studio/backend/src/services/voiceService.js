import fs from "fs";
import path from "path";
import { config } from "../config.js";
import { runCommand } from "../utils/ffmpeg.js";

function scriptToNarration(script) {
  return [script.hook, script.problem, script.solution, script.testimonial, script.cta]
    .filter(Boolean)
    .join(" ");
}

async function generateWithElevenLabs(text, outputPath) {
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${config.ttsVoiceId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": config.ttsApiKey
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: { stability: 0.45, similarity_boost: 0.75 }
      })
    }
  );

  if (!response.ok) {
    throw new Error(`ElevenLabs request failed: ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  fs.writeFileSync(outputPath, Buffer.from(arrayBuffer));
}

async function generateFallbackVoice(duration, outputPath) {
  await runCommand(config.ffmpegPath, [
    "-y",
    "-f",
    "lavfi",
    "-i",
    "anullsrc=channel_layout=stereo:sample_rate=44100",
    "-t",
    String(duration),
    "-q:a",
    "9",
    "-acodec",
    "libmp3lame",
    outputPath
  ]);
}

export async function generateVoiceover(script, duration, audioDir) {
  const outputPath = path.join(audioDir, "voiceover.mp3");
  const narration = scriptToNarration(script);

  if (config.ttsApiKey) {
    try {
      await generateWithElevenLabs(narration, outputPath);
      return { narration, audioPath: outputPath, usedFallback: false };
    } catch (error) {
      await generateFallbackVoice(duration, outputPath);
      return { narration, audioPath: outputPath, usedFallback: true };
    }
  }

  await generateFallbackVoice(duration, outputPath);
  return { narration, audioPath: outputPath, usedFallback: true };
}
