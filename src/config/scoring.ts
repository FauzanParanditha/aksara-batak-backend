export const SCORING_WEIGHT: Record<string, number> = {
  website_accessibility: 0.1,
  platform_stability: 0.1,
  visual_design: 0.15,
  navigation_responsiveness: 0.1,
  content_weight: 0.3,
  creativity_innovation: 0.15,
  consistency_relevance: 0.1,
};

const total = Object.values(SCORING_WEIGHT).reduce((a, b) => a + b, 0);
if (total !== 1) throw new Error("❌ Total bobot harus 100%");
