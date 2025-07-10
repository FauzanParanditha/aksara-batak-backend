import { PrismaClient } from "@prisma/client";
import { Request } from "express";
const prisma = new PrismaClient();

export const createUser = (data: any) => prisma.user.create({ data });
export const getAllUsers = async (
  page = 1,
  limit = 10,
  req: Request,
  search?: string
) => {
  const { status } = req.query;

  let where: any = {
    role: "leader",
    deletedAt: null,
  };

  if (typeof search === "string" && search != "") {
    where.OR = [
      { fullName: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const totalCount = await prisma.user.count({
    where,
  });

  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      role: true,
      isVerified: true,
      createdAt: true,
      updatedAt: true,
      emailVerificationToken: true,
    },
  });

  return {
    data: users,
    meta: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
    },
  };
};
export const getUserById = (id: string) =>
  prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      role: true,
      emailVerificationToken: true,
      isVerified: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true,
    },
  });
export const getUserPassword = (id: string) =>
  prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      passwordHash: true,
    },
  });
export const updateUser = (id: string, data: any) =>
  prisma.user.update({ where: { id }, data });
export const deleteUser = (id: string) => prisma.user.delete({ where: { id } });
