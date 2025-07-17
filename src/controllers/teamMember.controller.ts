import { Request, Response } from "express";
import * as service from "../services/teamMember.service";
import {
  createMemberSchema,
  updateMemberSchema,
} from "../validators/teamMember.validator";

export const getAll = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = (req.query.search as string) || undefined;

  const members = await service.getAllMembers(page, limit, req, search);
  res.json(members);
  return;
};

export const getMembers = async (req: Request, res: Response) => {
  const teamId = req.params.teamId;
  const members = await service.getTeamMembers(teamId);
  res.json(members);
  return;
};

export const addMember = async (req: Request, res: Response) => {
  const data = createMemberSchema.parse(req.body);
  const leaderId = req.user!.id;

  const authorized = await service.validateTeamOwnership(data.teamId, leaderId);
  if (!authorized) {
    res.status(403).json({ error: "Unauthorized" });
    return;
  }

  const count = await service.countTeamMembers(data.teamId);
  if (count >= 3) {
    res
      .status(400)
      .json({ error: "Team member limit reached (max 3 including leader)" });
    return;
  }

  const alreadyMember = await service.isEmailAlreadyMember(
    data.teamId,
    data.email
  );
  if (alreadyMember) {
    res
      .status(400)
      .json({ error: "This email is already a member of the team" });
    return;
  }

  const member = await service.createTeamMember(data);
  res.status(201).json(member);
  return;
};

export const updateMember = async (req: Request, res: Response) => {
  const memberId = req.params.id;
  const data = updateMemberSchema.parse(req.body);
  const user = req.user!;

  const member = await service.getMemberWithTeam(memberId);
  if (!member) {
    res.status(404).json({ error: "Member not found" });
    return;
  }

  const isAdmin = user.role === "admin";
  const isLeader = user.role === "leader";

  const isAuthorized =
    isAdmin || (isLeader && member.team.leaderId === user.id);

  if (!isAuthorized) {
    res.status(403).json({ error: "Unauthorized" });
    return;
  }

  const updated = await service.updateTeamMember(memberId, data);
  res.json(updated);
  return;
};

export const deleteMember = async (req: Request, res: Response) => {
  const memberId = req.params.id;
  const user = req.user!;

  const member = await service.getMemberWithTeam(memberId);
  if (!member) {
    res.status(404).json({ error: "Member not found" });
    return;
  }

  const isAdmin = user.role === "admin";
  const isLeader = user.role === "leader";

  const isAuthorized =
    isAdmin || (isLeader && member.team.leaderId === user.id);

  if (!isAuthorized) {
    res.status(403).json({ error: "Unauthorized" });
    return;
  }

  await service.deleteTeamMember(memberId);
  res.json({ message: "Member deleted" });
  return;
};
