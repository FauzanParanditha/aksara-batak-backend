import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import {
  createMemberSchema,
  updateMemberSchema,
} from "../validators/teamMember.validator";

const prisma = new PrismaClient();

export const getMembers = async (req: Request, res: Response) => {
  const teamId = req.params.teamId;
  const members = await prisma.teamMember.findMany({ where: { teamId } });
  res.json(members);
};

export const addMember = async (req: Request, res: Response) => {
  const data = createMemberSchema.parse(req.body);
  const leaderId = req.user!.id;

  // Validasi kepemilikan tim
  const team = await prisma.team.findUnique({ where: { id: data.teamId } });
  if (!team || team.leaderId !== leaderId) {
    res.status(403).json({ error: "Unauthorized" });
    return;
  }

  const member = await prisma.teamMember.create({ data });
  res.status(201).json(member);
  return;
};

export const updateMember = async (req: Request, res: Response) => {
  const memberId = req.params.id;
  const data = updateMemberSchema.parse(req.body);
  const leaderId = req.user!.id;

  const member = await prisma.teamMember.findUnique({
    where: { id: memberId },
    include: { team: true },
  });
  if (!member || member.team.leaderId !== leaderId) {
    res.status(403).json({ error: "Unauthorized" });
    return;
  }

  const updated = await prisma.teamMember.update({
    where: { id: memberId },
    data,
  });
  res.json(updated);
  return;
};

export const deleteMember = async (req: Request, res: Response) => {
  const memberId = req.params.id;
  const leaderId = req.user!.id;

  const member = await prisma.teamMember.findUnique({
    where: { id: memberId },
    include: { team: true },
  });
  if (!member || member.team.leaderId !== leaderId) {
    res.status(403).json({ error: "Unauthorized" });
    return;
  }

  await prisma.teamMember.delete({ where: { id: memberId } });
  res.json({ message: "Member deleted" });
  return;
};
