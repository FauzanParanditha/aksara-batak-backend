import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import * as scoreService from "../services/score.service";
import {
  multiJudgeScoreSchema,
  scoreSchema,
} from "../validators/score.validator";

const prisma = new PrismaClient();

export const createScore = async (req: Request, res: Response) => {
  const parsed = scoreSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.format() });
    return;
  }

  const { teamId, scores, comments } = parsed.data;
  const judgeId = (req as any).user.id;

  try {
    await scoreService.createOrUpdateScore(judgeId, teamId, scores, comments);
    res.json({ success: true, message: "Scores saved successfully" });
    return;
  } catch (err: any) {
    res.status(500).json({ error: "Internal server error" });
    return;
  }
};

export const createScoreMulti = async (req: Request, res: Response) => {
  const parsed = multiJudgeScoreSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: "Validation failed",
      details: parsed.error.flatten(),
    });
    return;
  }

  const { judgeIds, teamId, scores, comments } = parsed.data;

  try {
    // 1) pastikan team ada
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: { id: true },
    });
    if (!team) {
      res.status(404).json({ error: "Team not found" });
      return;
    }

    // 2) validasi judgeIds -> benar2 role judge
    const judges = await prisma.user.findMany({
      where: { id: { in: judgeIds }, role: "judge", deletedAt: null },
      select: { id: true },
    });
    const validIds = new Set(judges.map((j) => j.id));
    const invalid = judgeIds.filter((id) => !validIds.has(id));
    if (invalid.length) {
      res.status(400).json({
        error: "Some judgeIds are invalid or not judges",
        invalidIds: invalid,
      });
      return;
    }

    // 3) normalisasi comment
    const normalizedComment =
      typeof comments === "string" && comments.trim().length === 0
        ? null
        : comments ?? null;

    // 4) panggil service kamu (versi loop)
    await scoreService.createOrUpdateScoreForMultipleJudges(
      judgeIds,
      teamId,
      scores,
      normalizedComment ?? undefined
    );

    // Atau gunakan versi upsert + transaksi (lihat bagian 3 di bawah)

    res.json({ message: "Scores saved successfully" });
    return;
  } catch (err: any) {
    console.error(err);
    res.status(500).json({
      error: "Failed to save scores",
      details: err?.message,
    });
    return;
  }
};

export const getTeamScore = async (req: Request, res: Response) => {
  try {
    const teamId = req.params.teamId;
    const data = await scoreService.getTeamWeightedScore(teamId);
    res.json(data);
    return;
  } catch (err) {
    console.error("[GET /scores/team/:teamId]", err);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
};
