import { EmailStatus, EmailType, PrismaClient } from "@prisma/client";
import { Request } from "express";

const prisma = new PrismaClient();

export const logEmail = async (
  to: string,
  subject: string,
  type: EmailType,
  status: EmailStatus,
  relatedId?: string,
  body: string = "",
  errorMessage?: string
) => {
  return prisma.email_Log.create({
    data: {
      to,
      subject,
      body,
      type,
      status,
      relatedId,
      errorMessage,
    },
  });
};

export const getAllLogs = async (
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
        { to: { contains: search, mode: "insensitive" } },
        { subject: { contains: search, mode: "insensitive" } },
      ],
    };
  }

  if (
    typeof status === "string" &&
    Object.values(EmailStatus).includes(status as EmailStatus)
  ) {
    where = { status: status as EmailStatus };
  }

  const totalCount = await prisma.email_Log.count({
    where,
  });

  const email_Logs = await prisma.email_Log.findMany({
    where,
    orderBy: { sentAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });

  return {
    data: email_Logs,
    meta: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
    },
  };
};

export const getLogEmailById = (id: string) =>
  prisma.email_Log.findUnique({ where: { id } });

export const updateLogEmail = (id: string, data: any) =>
  prisma.email_Log.update({ where: { id }, data });
