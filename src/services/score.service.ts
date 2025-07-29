import { PrismaClient } from "@prisma/client";
import { calculateWeightedScore } from "../utils/helper";

const prisma = new PrismaClient();

export const createOrUpdateScore = async (
  judgeId: string,
  teamId: string,
  scores: Record<string, number>,
  comments?: string
) => {
  const existing = await prisma.score.findMany({
    where: { judgeId, teamId },
  });

  const entries = Object.entries(scores);

  for (const [criteria, score] of entries) {
    const existingScore = existing.find((s) => s.criteria === criteria);

    if (existingScore) {
      await prisma.score.update({
        where: { id: existingScore.id },
        data: {
          score,
          comment: comments ?? existingScore.comment,
        },
      });
    } else {
      // Create new
      await prisma.score.create({
        data: {
          teamId,
          judgeId,
          criteria,
          score,
          comment: comments ?? null,
        },
      });
    }
  }
};

export const getTeamWeightedScore = async (teamId: string) => {
  const scores = await prisma.score.findMany({
    where: { teamId },
    select: { criteria: true, score: true },
  });

  const weightedScore = calculateWeightedScore(scores);

  return {
    teamId,
    weightedScore,
    details: scores,
  };
};
