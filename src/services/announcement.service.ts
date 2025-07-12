import { PrismaClient } from "@prisma/client";
import { Request } from "express";
import { sendMail } from "../utils/mailer";

const prisma = new PrismaClient();

export async function createAnnouncementAndNotify({
  title,
  content,
  target,
}: {
  title: string;
  content: string;
  target: "all" | "leader" | string; // teamId kalau string lainnya
}) {
  const announcement = await prisma.announcement.create({
    data: { title, content, target },
  });

  let recipients: { email: string; fullName: string }[] = [];

  if (target === "all") {
    recipients = await prisma.user.findMany({
      where: { deletedAt: null },
    });
  } else if (target === "leader") {
    recipients = await prisma.user.findMany({
      where: { role: "leader", deletedAt: null },
    });
  } else {
    const team = await prisma.team.findUnique({
      where: { id: target },
      include: { leader: true },
    });
    if (team?.leader) recipients = [team.leader];
  }

  for (const user of recipients) {
    const html = `<p>Halo ${user.fullName},</p><p>${content}</p><p>Thank you.<br>Panitia</p>`;

    try {
      await sendMail(user.email, title, html);
      await prisma.email_Log.create({
        data: {
          to: user.email,
          subject: title,
          type: "annoucncement",
          status: "success",
          body: content,
          relatedId: announcement.id,
        },
      });
    } catch (error: any) {
      await prisma.email_Log.create({
        data: {
          to: user.email,
          subject: title,
          type: "annoucncement",
          status: "failed",
          errorMessage: error.message,
          body: content,
          relatedId: announcement.id,
        },
      });
    }
  }

  return announcement;
}

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
        { title: { contains: search, mode: "insensitive" } },
        { target: { contains: search, mode: "insensitive" } },
      ],
    };
  }

  const totalCount = await prisma.announcement.count({
    where,
  });

  const announcements = await prisma.announcement.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });

  return {
    data: announcements,
    meta: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
    },
  };
};
