import { Prisma, PrismaClient } from "@prisma/client";
import { Request } from "express";
import { calculateWeightedScore } from "../utils/helper";

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
  photoUrl?: string;
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

type Role = "admin" | "judge";

const isNonEmptyString = (v: unknown): v is string =>
  typeof v === "string" && v.trim() !== "";

// Field yang boleh di-sort langsung dari DB
const SORTABLE_FIELDS: (keyof Prisma.TeamOrderByWithRelationInput)[] = [
  "createdAt",
  "updatedAt",
  "teamName",
  "status",
  "avgScore", // mapping dari sort=score (khusus admin)
];

export interface GetAllTeamsMeta {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

export interface GetAllTeamsParams {
  page?: number;
  limit?: number;
  req: Request;
  search?: string;
  role?: Role;
  judgeId?: string;
}

export const getAllTeams = async ({
  page = 1,
  limit = 10,
  req,
  search,
  role,
  judgeId,
}: GetAllTeamsParams) => {
  // Ambil query tambahan
  const status = isNonEmptyString(req.query.status)
    ? req.query.status
    : undefined;
  const sortParam = isNonEmptyString(req.query.sort)
    ? req.query.sort
    : "createdAt"; // "score" untuk avgScore
  const orderParam = (
    isNonEmptyString(req.query.order) ? req.query.order : "desc"
  ).toLowerCase();

  // Normalisasi pagination
  page = Math.max(1, Number(page) || 1);
  limit = Math.min(100, Math.max(1, Number(limit) || 10));

  // Normalisasi order → Prisma.SortOrder ('asc' | 'desc')
  const order: Prisma.SortOrder = orderParam === "asc" ? "asc" : "desc";

  // WHERE
  const where: Prisma.TeamWhereInput = {};
  if (isNonEmptyString(search)) {
    const term = search.trim();
    where.OR = [
      { teamName: { contains: term, mode: "insensitive" } },
      { id: { contains: term, mode: "insensitive" } },
    ];
  }
  if (isNonEmptyString(status)) {
    // TeamStatus enum di schema, tapi Prisma WhereInput menerima string valid
    (where as any).status = status;
  }

  // INCLUDE scores sesuai role
  const scoresInclude =
    role === "judge" && judgeId
      ? ({
          where: { judgeId },
          select: {
            judgeId: true,
            criteria: true,
            score: true,
            comment: true,
            judge: { select: { fullName: true } },
          },
        } satisfies Prisma.ScoreFindManyArgs)
      : ({
          select: {
            judgeId: true,
            criteria: true,
            score: true,
            comment: true,
            judge: { select: { fullName: true } },
          },
        } satisfies Prisma.ScoreFindManyArgs);

  // ORDER BY
  let orderBy: Prisma.TeamOrderByWithRelationInput[] = [];
  if (role === "admin" && sortParam === "score") {
    // score ⇒ pakai avgScore (global-correct) + tie-breaker createdAt
    orderBy = [{ avgScore: order }, { createdAt: "desc" }];
  } else if ((SORTABLE_FIELDS as readonly string[]).includes(sortParam)) {
    // field biasa yang diizinkan
    const field = sortParam as keyof Prisma.TeamOrderByWithRelationInput;
    orderBy = [{ [field]: order } as Prisma.TeamOrderByWithRelationInput];
  } else {
    // fallback aman
    orderBy = [{ createdAt: order }];
  }

  // Query + pagination
  const [totalCount, teams] = await prisma.$transaction([
    prisma.team.count({ where }),
    prisma.team.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: { scores: scoresInclude },
    }),
  ]);

  // Post-process weightedScore:
  // - Admin: gunakan avgScore yang sudah dihitung di DB (via hook recompute/backfill)
  // - Judge: hitung weightedScore pribadi dari include.scores yang sudah terfilter judgeId
  const data =
    role === "admin"
      ? teams.map((t) => ({
          ...t,
          weightedScore: t.avgScore ?? null,
        }))
      : role === "judge" && judgeId
      ? teams.map((team) => {
          const personalScores = team.scores.map((s) => ({
            criteria: s.criteria,
            score: s.score,
          }));
          const weighted = personalScores.length
            ? calculateWeightedScore(personalScores, 2) // ← return number|null, sudah dibulatkan
            : null;
          return { ...team, weightedScore: weighted };
        })
      : teams;

  const meta: GetAllTeamsMeta = {
    page,
    limit,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
  };

  return { data, meta };
};

export const getTeamById = async (leaderId: string) => {
  const team = await prisma.team.findFirst({
    where: { leaderId },
    include: {
      members: true,
      scores: {
        select: {
          judgeId: true,
          criteria: true,
          score: true,
        },
      },
    },
  });

  if (!team) return null;

  // Kelompokkan skor berdasarkan judgeId
  const grouped: Record<string, { criteria: string; score: number }[]> = {};
  for (const s of team.scores) {
    if (!grouped[s.judgeId]) grouped[s.judgeId] = [];
    grouped[s.judgeId].push({
      criteria: s.criteria,
      score: s.score,
    });
  }

  // Hitung skor total per juri
  const judgeScores = Object.values(grouped)
    .map((scoreList) => calculateWeightedScore(scoreList))
    .filter((score): score is number => score !== null && score !== undefined);

  // Rata-rata dari semua skor juri
  const weightedScore =
    judgeScores.length > 0
      ? judgeScores.reduce((sum, s) => (sum ?? 0) + (s ?? 0), 0) /
        judgeScores.length
      : 0;

  return {
    ...team,
    weightedScore: Number(weightedScore.toFixed(2)),
  };
};

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

export async function deleteTeamPermanently(teamId: string) {
  // Check if team exists
  const team = await prisma.team.findUnique({
    where: { id: teamId },
  });

  if (!team) {
    throw new Error("Team not found.");
  }

  // Check if submission exists
  const project = await prisma.project.findUnique({
    where: { teamId },
  });

  if (project) {
    throw new Error("Cannot delete team: submission already exists.");
  }

  // Check if any score exists
  const scoreCount = await prisma.score.count({
    where: { teamId },
  });

  if (scoreCount > 0) {
    throw new Error("Cannot delete team: already scored by judges.");
  }

  // Check if payment is paid
  const payment = await prisma.payment.findUnique({
    where: { teamId },
  });

  if (payment?.status === "paid") {
    throw new Error("Cannot delete team: payment has already been made.");
  }

  // Proceed with permanent deletion
  await prisma.$transaction([
    // Delete payment verification logs
    prisma.paymentVerificationLog.deleteMany({
      where: {
        payment: {
          teamId: teamId,
        },
      },
    }),

    // Delete payment record
    prisma.payment.deleteMany({
      where: { teamId },
    }),

    // Delete team members
    prisma.teamMember.deleteMany({
      where: { teamId },
    }),

    // Reset unique code pool
    prisma.uniqueCodePool.updateMany({
      where: { teamId },
      data: {
        teamId: null,
        isUsed: false,
        usedAt: null,
      },
    }),

    // Delete presentation slot
    prisma.presentationSlot.deleteMany({
      where: { teamId },
    }),

    // Finally, delete the team itself
    prisma.team.delete({
      where: { id: teamId },
    }),
  ]);

  return {
    success: true,
    message: "Team deleted permanently.",
  };
}

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
