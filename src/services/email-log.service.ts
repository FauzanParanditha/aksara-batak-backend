import { EmailStatus, EmailType, PrismaClient } from "@prisma/client";

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

export const updateLogEmail = (id: string, data: any) =>
  prisma.email_Log.update({ where: { id }, data });
