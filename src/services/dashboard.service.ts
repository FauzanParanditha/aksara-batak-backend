import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getDashboardStats = async (userId: string) => {
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
  const totalPeople = totalTeams + totalMembers;

  return {
    totalTeams,
    totalMembers,
    totalPeople,
  };
};
