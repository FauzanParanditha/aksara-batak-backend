import { PaymentStatus, PrismaClient } from "@prisma/client";
import { Request } from "express";

const prisma = new PrismaClient();

export const getPaymentVerifiedLogs = async (
  page = 1,
  limit = 10,
  req: Request,
  search?: string
) => {
  const { status } = req.query;

  let where: any = {
    status: PaymentStatus.paid,
  };

  if (typeof search === "string" && search.trim() !== "") {
    where.OR = [
      { status: { contains: search, mode: "insensitive" } },
      {
        payment: {
          team: {
            teamName: { contains: search, mode: "insensitive" },
          },
        },
      },
    ];
  }

  if (
    typeof status === "string" &&
    Object.values(PaymentStatus).includes(status as PaymentStatus)
  ) {
    where.status = status as PaymentStatus;
  }

  const totalCount = await prisma.paymentVerificationLog.count({ where });

  const logs = await prisma.paymentVerificationLog.findMany({
    where,
    orderBy: { verifiedAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
    include: {
      payment: {
        include: { team: true },
      },
      verifiedBy: true,
    },
  });

  return {
    data: logs,
    meta: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
    },
  };
};
