import { Request, Response } from "express";
import * as service from "../services/team.service";
import {
  createTeamSchema,
  updateTeamSchema,
} from "../validators/team.validator";

export const getMyTeam = async (req: Request, res: Response) => {
  const team = await service.getTeamById(req.user!.id);
  res.json(team);
};

export const createTeam = async (req: Request, res: Response) => {
  const data = createTeamSchema.parse(req.body);
  const leaderId = req.user!.id;

  const existingTeam = await service.getTeamById(leaderId);
  if (existingTeam) {
    res.status(400).json({ message: "You already have a team" });
    return;
  }

  const team = await service.createTeam({ ...data, leaderId });
  res.status(201).json(team);
};

export const updateTeam = async (req: Request, res: Response) => {
  const data = updateTeamSchema.parse(req.body);

  const team = await service.getTeamById(req.user!.id);
  if (!team) {
    res.status(404).json({ message: "Team not found" });
    return;
  }

  const updated = await service.updateTeam(req.params.id, {
    ...data,
  });
  res.json(updated);
};

export const deleteTeam = async (req: Request, res: Response) => {
  const team = await service.getTeamById(req.user!.id);
  if (!team) {
    res.status(404).json({ message: "Team not found" });
    return;
  }

  await service.deleteTeam(req.params.id);
  res.status(204).send();
};
