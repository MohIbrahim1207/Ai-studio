const PLATFORMS = ["instagram reels", "youtube shorts", "facebook", "instagram", "youtube"];
const TONES = ["funny", "emotional", "testimonial", "bold", "luxury", "minimal"];

function findPlatform(text) {
  const lower = text.toLowerCase();
  for (const platform of PLATFORMS) {
    if (lower.includes(platform)) {
      if (platform === "instagram") return "Instagram Reels";
      if (platform === "youtube") return "YouTube Shorts";
      if (platform === "facebook") return "Facebook";
      return platform
        .split(" ")
        .map((item) => item[0].toUpperCase() + item.slice(1))
        .join(" ");
    }
  }
  return "Instagram Reels";
}

function findTone(text) {
  const lower = text.toLowerCase();
  for (const tone of TONES) {
    if (lower.includes(tone)) return tone;
  }
  return "testimonial";
}

function findDuration(text) {
  const match = text.match(/(\d{1,2})\s*(sec|second|seconds)/i);
  if (!match) return 20;
  const duration = Number(match[1]);
  return Math.max(15, Math.min(30, duration));
}

function findAudience(text) {
  const targetingMatch = text.match(/targeting\s+([^,.]+)/i);
  if (targetingMatch) return targetingMatch[1].trim();
  const forMatch = text.match(/for\s+([^,.]+)/i);
  if (forMatch) return forMatch[1].trim();
  return "online shoppers";
}

function findProduct(text) {
  const lower = text.toLowerCase();
  const tokens = [
    " ad for ",
    " for ",
    " promoting ",
    " about "
  ];
  for (const token of tokens) {
    const idx = lower.indexOf(token);
    if (idx >= 0) {
      const productChunk = text.slice(idx + token.length);
      const clipped = productChunk
        .split(/targeting|on|in|with|tone|for/gi)[0]
        .trim()
        .replace(/[.]/g, "");
      if (clipped.length) return clipped;
    }
  }
  return "your product";
}

export function parseBrief({
  brief,
  productName,
  audience,
  platform,
  tone,
  duration
}) {
  const raw = brief || "";
  return {
    product: productName || findProduct(raw),
    audience: audience || findAudience(raw),
    platform: platform || findPlatform(raw),
    tone: tone || findTone(raw),
    duration: Number(duration) || findDuration(raw)
  };
}
