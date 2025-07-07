import { Request, Response } from "express";
import * as service from "../services/teamMember.service";
import {
  createMemberSchema,
  updateMemberSchema,
} from "../validators/teamMember.validator";

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
  const leaderId = req.user!.id;

  const member = await service.getMemberWithTeam(memberId);
  if (!member || member.team.leaderId !== leaderId) {
    res.status(403).json({ error: "Unauthorized" });
    return;
  }

  const updated = await service.updateTeamMember(memberId, data);
  res.json(updated);
  return;
};

export const deleteMember = async (req: Request, res: Response) => {
  const memberId = req.params.id;
  const leaderId = req.user!.id;

  const member = await service.getMemberWithTeam(memberId);
  if (!member || member.team.leaderId !== leaderId) {
    res.status(403).json({ error: "Unauthorized" });
    return;
  }

  await service.deleteTeamMember(memberId);
  res.json({ message: "Member deleted" });
  return;
};
