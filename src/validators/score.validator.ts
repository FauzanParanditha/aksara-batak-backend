import { z } from "zod";

export const scoreSchema = z.object({
  teamId: z.string().min(1),
  scores: z.record(z.string(), z.number().min(0).max(10)),
  comments: z.string().optional(),
});

export const scoreMapSchema = z
  .record(
    z.string().min(1, "criteria key is required"),
    z.number().min(0, "min 0").max(10, "max 10")
  )
  .refine((obj) => Object.keys(obj).length > 0, {
    message: "At least one criteria must be provided",
  });

export const multiJudgeScoreSchema = z.object({
  judgeIds: z.array(z.string().min(1)).min(1, "Select at least 1 judge"),
  teamId: z.string().min(1, "teamId is required"),
  scores: scoreMapSchema,
  comments: z.string().max(2000).optional().nullable(),
});
