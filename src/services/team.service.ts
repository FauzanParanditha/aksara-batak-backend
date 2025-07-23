import { PrismaClient } from "@prisma/client";
import { Request } from "express";

const prisma = new PrismaClient();

export const generateUniqueAmount = async (
  baseAmount: number,
  teamId: string
): Promise<{ amount: number; uniqueCode: number }> => {
  const poolCode = await prisma.uniqueCodePool.findFirst({
    where: { isUsed: false },
    orderBy: { code: "asc" }, // atau random jika perlu
  });

  if (!poolCode) {
    throw new Error("All unique codes have been used");
  }

  await prisma.uniqueCodePool.update({
    where: { code: poolCode.code },
    data: {
      isUsed: true,
      usedAt: new Date(),
      teamId,
    },
  });

  return {
    amount: baseAmount + poolCode.code,
    uniqueCode: poolCode.code,
  };
};

export const createTeam = async (data: {
  teamName: string;
  category: string;
  leaderId: string;
  institution: string;
  photoUrl: string;
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

  const createdTeam = await prisma.team.create({
    data: {
      teamName: data.teamName,
      category: data.category,
      leaderId: data.leaderId,
      photoUrl: data.photoUrl,
      members: {
        create: {
          fullName: user.fullName,
          email: user.email,
          institution: data.institution,
          roleInTeam: "Leader",
        },
      },
    },
  });

  const baseAmount = 100000;
  const { amount, uniqueCode } = await generateUniqueAmount(
    baseAmount,
    createdTeam.id
  );

  const updatedTeam = await prisma.team.update({
    where: { id: createdTeam.id },
    data: {
      payment: {
        create: {
          amount,
          uniqueCode,
          method: "manual",
          status: "waiting_verification",
        },
      },
    },
    include: {
      payment: true,
    },
  });

  return updatedTeam;
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
export const deleteTeam = async (id: string) => {
  await prisma.team.delete({ where: { id } });

  await prisma.uniqueCodePool.updateMany({
    where: { teamId: id },
    data: {
      isUsed: false,
      usedAt: null,
      teamId: null,
    },
  });
};
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
