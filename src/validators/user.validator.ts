import { z } from "zod";

export const createUserSchema = z.object({
  fullName: z.string().min(3),
  email: z.string().email(),
  passwordHash: z.string().min(2),
  phone: z.string().min(2),
  role: z.string().min(2),
  isVerified: z.boolean(),
});

export const updateUserSchema = z.object({
  fullName: z.string().min(3),
  email: z.string().email(),
  passwordHash: z.string().min(2).optional(),
  phone: z.string().min(2),
  role: z.string().min(2),
});
