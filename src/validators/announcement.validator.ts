import { z } from "zod";

export const CreateAnnouncementSchema = z.object({
  title: z.string().min(5),
  content: z.string().min(10),
  target: z.union([z.literal("all"), z.literal("leader"), z.string().cuid()]),
});
export type CreateAnnouncementType = z.infer<typeof CreateAnnouncementSchema>;
