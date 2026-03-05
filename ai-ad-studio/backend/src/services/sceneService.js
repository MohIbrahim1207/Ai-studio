const DEFAULT_SPLIT = [0.18, 0.2, 0.26, 0.18, 0.18];

function sectionVisual(section, product) {
  if (section === "hook") return `Fast, high-contrast close-up of ${product} with bold headline`;
  if (section === "problem") return "Person frustrated with the old solution in daily life";
  if (section === "solution") return `${product} shown in clean product demo shots`;
  if (section === "testimonial") return "Happy customer selfie style vertical video testimonial";
  return "Strong brand packshot and call-to-action button animation";
}

export function generateScenes(script, durationSeconds = 20) {
  const sections = ["hook", "problem", "solution", "testimonial", "cta"];
  const total = Math.max(15, Math.min(30, Number(durationSeconds) || 20));
  let consumed = 0;

  const scenes = sections.map((section, index) => {
    const isLast = index === sections.length - 1;
    const seconds = isLast
      ? Math.max(2, Number((total - consumed).toFixed(2)))
      : Number((total * DEFAULT_SPLIT[index]).toFixed(2));

    consumed += seconds;

    return {
      id: index + 1,
      section,
      textOverlay: script[section],
      visualDescription: sectionVisual(section, script.solution || "the product"),
      duration: seconds
    };
  });

  return scenes;
}
