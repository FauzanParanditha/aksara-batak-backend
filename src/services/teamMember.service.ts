import { PrismaClient } from "@prisma/client";
import { Request } from "express";

const prisma = new PrismaClient();

export const getAllMembers = async (
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
        { fullName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ],
    };
  }

  const totalCount = await prisma.teamMember.count({
    where,
  });

  const teamMembers = await prisma.teamMember.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });

  return {
    data: teamMembers,
    meta: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
    },
  };
};

export const getTeamMembers = async (teamId: string) => {
  return prisma.teamMember.findMany({ where: { teamId } });
};

export const validateTeamOwnership = async (
  teamId: string,
  leaderId: string
) => {
  const team = await prisma.team.findUnique({ where: { id: teamId } });
  return team && team.leaderId === leaderId;
};

export const countTeamMembers = async (teamId: string) => {
  return prisma.teamMember.count({ where: { teamId } });
};

export const isEmailAlreadyMember = async (teamId: string, email: string) => {
  const existing = await prisma.teamMember.findFirst({
    where: { teamId, email },
  });
  return !!existing;
};

export const createTeamMember = async (data: {
  teamId: string;
  fullName: string;
  email: string;
  institution: string;
  roleInTeam: string;
}) => {
  return prisma.teamMember.create({ data });
};

export const getMemberWithTeam = async (id: string) => {
  return prisma.teamMember.findUnique({
    where: { id },
    include: { team: true },
  });
};

export const updateTeamMember = async (id: string, data: any) => {
  return prisma.teamMember.update({
    where: { id },
    data,
  });
};

export const deleteTeamMember = async (id: string) => {
  return prisma.teamMember.delete({
    where: { id },
  });
};
