import { Request, Response } from "express";
import * as service from "../services/paymentVerified-log.service";

export const getAll = async (req: Request, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = (req.query.search as string) || undefined;

  const logs = await service.getPaymentVerifiedLogs(page, limit, req, search);
  res.json(logs);
};
