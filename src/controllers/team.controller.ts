import { Request, Response } from "express";
import * as service from "../services/team.service";
import { deleteLocalFileTeam } from "../utils/helper";
import { ManualProofSchema } from "../validators/payment.validator";
import {
  createTeamSchema,
  updateTeamSchema,
} from "../validators/team.validator";

export const getMyTeam = async (req: Request, res: Response) => {
  const isAdmin = req.user?.role;
  if (isAdmin == "admin") {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || undefined;

    const team = await service.getAllTeams(page, limit, req, search);
    res.json(team);
  } else {
    const team = await service.getTeamById(req.user!.id);
    res.json(team);
  }
};

export const getTeamById = async (req: Request, res: Response) => {
  const team = await service.getTeamByIdAdmin(req.params.id);
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

  if (!req.file) {
    res.status(400).json({ error: "Photo teams file is required" });
    return;
  }

  const photoUrl = `/uploads/teams/${req.file.filename}`;

  const team = await service.createTeam({
    teamName: data.teamName,
    category: data.category,
    leaderId,
    institution: data.institution,
    photoUrl,
  });
  res.status(201).json(team);
};

export const updateTeam = async (req: Request, res: Response) => {
  const data = updateTeamSchema.parse(req.body);

  const isAdmin = req.user?.role;
  if (isAdmin == "admin") {
    const team = await service.getTeamByIdAdmin(req.params.id);
    if (!team) {
      res.status(404).json({ message: "Team not found" });
      return;
    }

    if (req.file && team.photoUrl) {
      deleteLocalFileTeam(team.photoUrl);
    }

    if (!req.file) {
      res.status(400).json({ error: "Photo team file is required" });
      return;
    }
    const photoUrl = `/uploads/teams/${req.file.filename}`;
    const updated = await service.updateTeam(req.params.id, {
      ...data,
      photoUrl,
    });
    res.json(updated);
  } else {
    const team = await service.getTeamById(req.user!.id);
    if (!team) {
      res.status(404).json({ message: "Team not found" });
      return;
    }

    if (req.file && team.photoUrl) {
      deleteLocalFileTeam(team.photoUrl);
    }

    if (!req.file) {
      res.status(400).json({ error: "Photo team file is required" });
      return;
    }
    const photoUrl = `/uploads/teams/${req.file.filename}`;

    const updated = await service.updateTeam(req.params.id, {
      ...data,
      photoUrl,
    });
    res.json(updated);
  }
};

export const deleteTeam = async (req: Request, res: Response) => {
  const isAdmin = req.user?.role;
  if (isAdmin == "admin") {
    const team = await service.getTeamByIdAdmin(req.params.id);
    if (!team) {
      res.status(404).json({ message: "Team not found" });
      return;
    }

    await service.deleteTeam(req.params.id);
    res.status(204).send();
  } else {
    const team = await service.getTeamById(req.user!.id);
    if (!team) {
      res.status(404).json({ message: "Team not found" });
      return;
    }
    await service.deleteTeam(req.params.id);
    res.status(204).send();
  }
};
export const uploadSubmission = async (req: Request, res: Response) => {
  const parseResult = ManualProofSchema.safeParse(req.body);

  if (!parseResult.success) {
    res.status(400).json({
      error: "Validation error",
      issues: parseResult.error.flatten(),
    });
    return;
  }

  const { teamId } = parseResult.data;
  const leaderId = req.user!.id;
  const isExsit = await service.getTeamById(leaderId);
  if (!isExsit) {
    res.status(404).json({ message: "Team not found" });
    return;
  }

  if (!req.file) {
    res.status(400).json({ message: "No file uploaded" });
    return;
  }

  const relativePath = `/uploads/submissions/${req.file.filename}`;

  try {
    const updated = await service.updateSubmissionLink({
      teamId,
      filePath: relativePath,
    });
    res.status(201).json(updated);
    return;
  } catch (error) {
    res.status(500).json({ message: "Failed to update submission" });
    return;
  }
};
