import { z } from "zod";

export const createTeamSchema = z.object({
  teamName: z.string().min(6),
  category: z.string().min(2),
  institution: z.string().min(3),
});

export const updateTeamSchema = z.object({
  teamName: z.string().min(6).optional(),
  category: z.string().min(2).optional(),
  institution: z.string().min(3),
});
