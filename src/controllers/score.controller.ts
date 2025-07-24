import { Request, Response } from "express";
import * as scoreService from "../services/score.service";
import { scoreSchema } from "../validators/score.validator";

export const scoreController = {
  async createScore(req: Request, res: Response) {
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
  },
};
