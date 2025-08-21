import { PrismaClient } from "@prisma/client";
import { calculateWeightedScore } from "../utils/helper";

const prisma = new PrismaClient();

export async function recomputeAggregatesForScoreChange(teamId: string, judgeId: string) {
  await prisma.$transaction(async (tx) => {
    // 1) hitung ulang weighted score milik (teamId, judgeId)
    const rows = await tx.score.findMany({
      where: { teamId, judgeId },
      select: { criteria: true, score: true },
    });

    if (rows.length === 0) {
      await tx.judgeScoreAggregate.deleteMany({ where: { teamId, judgeId } });
    } else {
      const weighted = calculateWeightedScore(rows); // versi kamu, tanpa normalisasi
      await tx.judgeScoreAggregate.upsert({
        where: { teamId_judgeId: { teamId, judgeId } },
        update: { weightedScore: weighted },
        create: { teamId, judgeId, weightedScore: weighted },
      });
    }

    // 2) hitung ulang avgScore tim dari seluruh agregat juri
    const aggs = await tx.judgeScoreAggregate.findMany({
      where: { teamId },
      select: { weightedScore: true },
    });

    const judgeCount = aggs.length;
    const avgScore =
      judgeCount > 0
        ? Number(
            (
              aggs.reduce((s, a) => s + a.weightedScore, 0) / judgeCount
            ).toFixed(2)
          )
        : null;

    await tx.team.update({
      where: { id: teamId },
      data: { avgScore, judgeCount },
    });
  });
}


export const createOrUpdateScore = async (
  judgeId: string,
  teamId: string,
  scores: Record<string, number>,
  comments?: string
) => {
  await prisma.$transaction(async (tx) => {
    for (const [criteria, score] of Object.entries(scores)) {
      await tx.score.upsert({
        where: { judgeId_teamId_criteria: { judgeId, teamId, criteria } },
        create: { teamId, judgeId, criteria, score, comment: comments ?? null },
        update: { score, comment: comments ?? undefined },
      });
    }

    // recompute sekali di akhir, masih dalam tx? → PISAHKAN ke luar tx
    // agar tidak memperpanjang lock. Jadi panggil di luar.
  });

  // recompute di luar tx tulis score supaya transaksi singkat & aman deadlock
  await recomputeAggregatesForScoreChange(teamId, judgeId);

  return { ok: true };
};

export const createOrUpdateScoreForMultipleJudges = async (
  judgeIds: string[],
  teamId: string,
  scores: Record<string, number>,
  comments?: string
) => {
  for (const judgeId of judgeIds) {
    await prisma.$transaction(async (tx) => {
      for (const [criteria, score] of Object.entries(scores)) {
        await tx.score.upsert({
          where: { judgeId_teamId_criteria: { judgeId, teamId, criteria } },
          create: { teamId, judgeId, criteria, score, comment: comments ?? null },
          update: { score, comment: comments ?? undefined },
        });
      }
    });

    await recomputeAggregatesForScoreChange(teamId, judgeId);
  }

  return { ok: true };
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
