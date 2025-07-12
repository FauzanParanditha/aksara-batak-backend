import { Request, Response } from "express";
import * as service from "../services/announcement.service";
import { CreateAnnouncementSchema } from "../validators/announcement.validator";

export async function createAnnouncement(req: Request, res: Response) {
  try {
    const parsed = CreateAnnouncementSchema.parse(req.body);
    const announcement = await service.createAnnouncementAndNotify(parsed);
    res
      .status(201)
      .json({ message: "Announcement created and emails sent", announcement });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export const getAll = async (req: Request, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = (req.query.search as string) || undefined;

  const logs = await service.getAllLogs(page, limit, req, search);
  res.json(logs);
};
