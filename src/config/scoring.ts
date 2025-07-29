export const SCORING_WEIGHT: Record<string, number> = {
  usefulness_and_relevance: 0.25,
  design_and_user_experience: 0.2,
  performance_and_technical_stability: 0.2,
  innovation_and_differentiation: 0.2,
  impact_and_scalability_potential: 0.15,
};

const total = Object.values(SCORING_WEIGHT).reduce((a, b) => a + b, 0);
if (total !== 1) throw new Error("❌ Total bobot harus 100%");
