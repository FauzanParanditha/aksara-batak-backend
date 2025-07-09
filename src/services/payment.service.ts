import { PaymentStatus, PrismaClient } from "@prisma/client";
import { Request } from "express";

const prisma = new PrismaClient();

export const createManualPayment = async ({
  teamId,
  amount,
  proofUrl,
}: {
  teamId: string;
  amount: number;
  proofUrl: string;
}) => {
  return prisma.payment.create({
    data: {
      teamId,
      amount,
      method: "manual",
      status: "waiting_verification",
      manualProofUrl: proofUrl,
    },
  });
};

export const updateManualProof = async ({
  teamId,
  proofUrl,
}: {
  teamId: string;
  proofUrl: string;
}) => {
  return prisma.payment.update({
    where: {
      teamId: teamId,
    },
    data: {
      method: "manual",
      status: "waiting_verification",
      manualProofUrl: proofUrl,
      paidAt: new Date(),
    },
  });
};

export const getPaymentsByRole = async (
  {
    role,
    teamId,
  }: {
    role: "admin" | "leader";
    teamId?: string;
  },
  page = 1,
  limit = 10,
  req: Request,
  search?: string
) => {
  if (role === "admin") {
    const { search, status } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    let where: any = {
      teamId,
    };

    if (typeof search === "string" && search.trim() !== "") {
      where.OR = [
        { status: { contains: search, mode: "insensitive" } },
        {
          team: {
            teamName: { contains: search, mode: "insensitive" },
          },
        },
      ];
    }

    if (
      typeof status === "string" &&
      Object.values(PaymentStatus).includes(status as PaymentStatus)
    ) {
      where.status = status;
    }

    const totalCount = await prisma.payment.count({ where });

    const payments = await prisma.payment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: { team: true },
    });

    return {
      data: payments,
      meta: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }

  if (role === "leader") {
    if (!teamId) throw new Error("Missing teamId for leader");
    return prisma.payment.findMany({
      where: { teamId },
      orderBy: { createdAt: "desc" },
      include: { team: true },
    });
  }

  throw new Error(`Unauthorized role: ${role}`);
};

export const getPaymentManualById = (teamId: string) =>
  prisma.payment.findUnique({ where: { teamId } });

export const verifyManualPayment = async ({
  paymentId,
  status,
  notes,
  adminId,
}: {
  paymentId: string;
  status: "paid" | "rejected";
  notes?: string;
  adminId: string; // 🧑‍💼 dari req.user.id
}) => {
  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({
      where: { id: paymentId },
      include: { team: true },
    });

    if (!payment) throw new Error("Payment not found");

    const updates: any = {
      status,
      notes,
    };

    if (status === "paid") {
      updates.paidAt = new Date();

      const latest = await tx.team.findFirst({
        where: { queueNumber: { not: null } },
        orderBy: { queueNumber: "desc" },
      });

      const nextQueue = latest?.queueNumber ? latest.queueNumber + 1 : 1;

      await tx.team.update({
        where: { id: payment.teamId },
        data: {
          queueNumber: nextQueue,
          status: "paid",
          paymentStatus: "paid",
        },
      });
    }

    // Simpan log verifikasi
    await tx.paymentVerificationLog.create({
      data: {
        paymentId: payment.id,
        verifiedById: adminId,
        status,
        notes,
      },
    });

    return tx.payment.update({
      where: { id: paymentId },
      data: updates,
    });
  });
};

export const getManualPaymentsToVerify = () => {
  return prisma.payment.findMany({
    where: {
      method: "manual",
      status: PaymentStatus.waiting_verification,
    },
    include: {
      team: true,
    },
  });
};
