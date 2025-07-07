import z from "zod";

export const teamIdSchema = z.object({
  teamId: z.string().min(5, "teamId is required"),
});
