// scripts/backfill-scores.ts
import { PrismaClient } from "@prisma/client";
import "dotenv/config";
import { calculateWeightedScore } from "../utils/helper";

const prisma = new PrismaClient();

async function backfillAggregates(batchSize = 1000) {
  let cursor: string | undefined;
  let processed = 0;

  for (;;) {
    const teams = await prisma.team.findMany({
      take: batchSize,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { id: "asc" },
      select: { id: true },
    });
    if (teams.length === 0) break;

    for (const t of teams) {
      const rows = await prisma.score.findMany({
        where: { teamId: t.id },
        select: { judgeId: true, criteria: true, score: true },
      });

      const byJudge: Record<string, { criteria: string; score: number }[]> = {};
      for (const r of rows) {
        (byJudge[r.judgeId] ??= []).push({
          criteria: r.criteria,
          score: r.score,
        });
      }

      await prisma.$transaction(async (tx) => {
        // bersihkan aggregate lama agar idempotent
        await tx.judgeScoreAggregate.deleteMany({ where: { teamId: t.id } });

        const entries = Object.entries(byJudge);
        for (const [judgeId, arr] of entries) {
          const w = calculateWeightedScore(arr); // versi kamu (tanpa normalisasi)
          await tx.judgeScoreAggregate.create({
            data: { teamId: t.id, judgeId, weightedScore: w },
          });
        }

        const judgeCount = entries.length;
        const avgScore =
          judgeCount > 0
            ? Number(
                (
                  entries.reduce(
                    (s, [, arr]) => s + calculateWeightedScore(arr),
                    0
                  ) / judgeCount
                ).toFixed(2)
              )
            : null;

        await tx.team.update({
          where: { id: t.id },
          data: { avgScore, judgeCount },
        });
      });

      processed++;
      if (processed % 500 === 0) {
        console.log(`Processed ${processed} teams...`);
      }
    }

    cursor = teams[teams.length - 1].id;
  }

  console.log("✅ Backfill done.");
}

backfillAggregates()
  .catch((e) => {
    console.error("Backfill error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
