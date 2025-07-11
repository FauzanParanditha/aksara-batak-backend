import { Request, Response } from "express";
import {
  getDashboardStatsAdmin,
  getDashboardStatsLeader,
} from "../services/dashboard.service";

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error("User id not found");
    }

    const stat = await getDashboardStatsLeader(userId);

    res.json(stat);
    return;
  } catch (error) {
    console.error("Error in getDashboardStats:", error);
    res.status(500).json({ message: "Internal Server Error" });
    return;
  }
};

export const getStatsAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  const stats = await getDashboardStatsAdmin();
  res.json(stats);
};
