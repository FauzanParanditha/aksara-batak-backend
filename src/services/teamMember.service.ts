import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
