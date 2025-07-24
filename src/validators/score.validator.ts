import { z } from "zod";

export const scoreSchema = z.object({
  teamId: z.string().min(1),
  scores: z.record(z.string(), z.number().min(0).max(10)),
  comments: z.string().optional(),
});
