import { z } from "zod";

export const createMemberSchema = z.object({
  teamId: z.string(),
  fullName: z.string().min(3),
  email: z.string().email(),
  institution: z.string().min(2),
  roleInTeam: z.string().min(2),
});

export const updateMemberSchema = z.object({
  fullName: z.string().optional(),
  email: z.string().email().optional(),
  institution: z.string().optional(),
  roleInTeam: z.string().optional(),
});
