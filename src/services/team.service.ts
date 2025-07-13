import { PrismaClient } from "@prisma/client";
import { Request } from "express";

const prisma = new PrismaClient();

export const createTeam = async (data: {
  teamName: string;
  category: string;
  leaderId: string;
  institution: string;
}) => {
  const existingTeam = await prisma.team.findFirst({
    where: { teamName: data.teamName },
  });

  if (existingTeam) {
    throw new Error("Team name already exists");
  }

  const user = await prisma.user.findUnique({
    where: { id: data.leaderId },
  });

  if (!user) throw new Error("Leader not found");

  const alreadyMember = await prisma.teamMember.findFirst({
    where: {
      email: user.email,
    },
  });

  if (alreadyMember) {
    throw new Error("User already registered as a team member");
  }

  const amount = 200000;

  return prisma.team.create({
    data: {
      teamName: data.teamName,
      category: data.category,
      leaderId: data.leaderId,
      members: {
        create: {
          fullName: user.fullName,
          email: user.email,
          institution: data.institution,
          roleInTeam: "Leader",
        },
      },
      payment: {
        create: {
          amount,
          method: "manual", // atau tentukan dinamis
          status: "waiting_verification",
        },
      },
    },
    include: {
      payment: true, // opsional: agar langsung terlihat hasilnya
    },
  });
};

export const getAllTeams = async (
  page = 1,
  limit = 10,
  req: Request,
  search?: string
) => {
  const { status } = req.query;

  let where = {};

  if (typeof search === "string" && search != "") {
    where = {
      OR: [
        { teamName: { contains: search, mode: "insensitive" } },
        { id: { contains: search, mode: "insensitive" } },
      ],
    };
  }

  const totalCount = await prisma.team.count({
    where,
  });

  const teams = await prisma.team.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });

  return {
    data: teams,
    meta: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
    },
  };
};
export const getTeamById = (leaderId: string) =>
  prisma.team.findFirst({
    where: { leaderId },
    include: { members: true },
  });
export const getTeamByIdAdmin = (id: string) =>
  prisma.team.findUnique({ where: { id } });
export const updateTeam = (id: string, data: any) =>
  prisma.team.update({ where: { id }, data });
export const deleteTeam = (id: string) => prisma.team.delete({ where: { id } });
export const updateSubmissionLink = ({
  teamId,
  filePath,
}: {
  teamId: string;
  filePath: string;
}) => {
  return prisma.team.update({
    where: { id: teamId },
    data: { submissionLink: filePath },
  });
};
