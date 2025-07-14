import { PaymentStatus, PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getDashboardStatsLeader = async (userId: string) => {
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

export const getDashboardStatsAdmin = async () => {
  const [
    totalTeams,
    totalMember,
    totalLeader,
    waitingPayment,
    paidPayment,
    submission,
  ] = await Promise.all([
    prisma.team.count(),
    prisma.teamMember.count(),
    prisma.user
      .findMany({
        where: { role: "leader" },
      })
      .then((users) => users.length),
    prisma.payment
      .findMany({
        where: { status: PaymentStatus.waiting_verification },
      })
      .then((payments) => payments.length),
    prisma.payment
      .findMany({
        where: { status: PaymentStatus.paid },
      })
      .then((payments) => payments.length),
    prisma.team
      .findMany({
        where: { submissionLink: { not: null } },
      })
      .then((teams) => teams.length),
  ]);
  return {
    totalTeams,
    totalMember,
    totalLeader,
    waitingPayment,
    paidPayment,
    submission,
  };
};
