import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "../config.js";

function fallbackScript(parsedBrief) {
  const { product, audience, tone } = parsedBrief;
  return {
    hook: `Still struggling with ${product}?`,
    problem: `${audience} waste money on products that do not deliver visible results.`,
    solution: `${product} is designed with fast-acting ingredients and an easy daily routine.`,
    testimonial: `Thousands of buyers report visible improvements in just weeks.`,
    cta: `Tap now and try ${product} today.`
  };
}

function sanitizeScript(data, parsedBrief) {
  const base = fallbackScript(parsedBrief);
  return {
    hook: data?.hook?.trim() || base.hook,
    problem: data?.problem?.trim() || base.problem,
    solution: data?.solution?.trim() || base.solution,
    testimonial: data?.testimonial?.trim() || base.testimonial,
    cta: data?.cta?.trim() || base.cta
  };
}

export async function generateScript(parsedBrief) {
  if (!config.geminiApiKey) {
    return sanitizeScript({}, parsedBrief);
  }

  const genAI = new GoogleGenerativeAI(config.geminiApiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
You are a D2C ad copywriter.
Create a short ad script with these sections:
1) hook
2) problem
3) solution
4) testimonial
5) cta

Return valid JSON only with this schema:
{
  "hook": "string",
  "problem": "string",
  "solution": "string",
  "testimonial": "string",
  "cta": "string"
}

Constraints:
- Audience: ${parsedBrief.audience}
- Product: ${parsedBrief.product}
- Tone: ${parsedBrief.tone}
- Platform: ${parsedBrief.platform}
- Total duration target: ${parsedBrief.duration} seconds
- Keep each field concise and spoken-word friendly.
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result?.response?.text() || "{}";
    const cleaned = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return sanitizeScript(parsed, parsedBrief);
  } catch (error) {
    return sanitizeScript({}, parsedBrief);
  }
}
