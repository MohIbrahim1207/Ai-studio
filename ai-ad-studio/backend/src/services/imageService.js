import fs from "fs";
import path from "path";

function colorBySection(section) {
  if (section === "hook") return [20, 30, 60];
  if (section === "problem") return [70, 20, 20];
  if (section === "solution") return [20, 70, 40];
  if (section === "testimonial") return [55, 45, 20];
  return [15, 45, 75];
}

function createSolidPpmBuffer(width, height, rgb) {
  const [r, g, b] = rgb;
  const header = Buffer.from(`P6\n${width} ${height}\n255\n`, "ascii");
  const pixels = Buffer.alloc(width * height * 3);
  for (let i = 0; i < pixels.length; i += 3) {
    pixels[i] = r;
    pixels[i + 1] = g;
    pixels[i + 2] = b;
  }
  return Buffer.concat([header, pixels]);
}

export async function generateSceneImages(scenes, sceneDir) {
  const files = [];
  for (const scene of scenes) {
    const filePath = path.join(sceneDir, `scene-${scene.id}.ppm`);
    const buffer = createSolidPpmBuffer(1080, 1920, colorBySection(scene.section));
    fs.writeFileSync(filePath, buffer);
    files.push(filePath);
  }
  return files;
}
