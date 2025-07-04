import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    // Ambil semua tim yang dibuat oleh user
    const teams = await prisma.team.findMany({
      where: { leaderId: userId },
      include: {
        members: true,
      },
    });

    const totalTeams = teams.length;
    const totalMembers = teams.reduce(
      (sum, team) => sum + team.members.length,
      0
    );
    const totalPeople = totalTeams + totalMembers; // 1 leader per tim

    res.json({
      totalTeams,
      totalMembers,
      totalPeople,
    });
    return;
  } catch (error) {
    console.error("Error in getDashboardStats:", error);
    res.status(500).json({ message: "Internal Server Error" });
    return;
  }
};
