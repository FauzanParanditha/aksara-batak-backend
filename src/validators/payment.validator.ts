import { z } from "zod";

export const ManualProofSchema = z.object({
  teamId: z.string().min(1, "teamId is required"),
});

export const VerifyPaymentSchema = z.object({
  status: z.enum(["paid", "rejected"]),
  notes: z.string().optional(),
});
