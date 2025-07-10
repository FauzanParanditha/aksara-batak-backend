import bcrypt from "bcrypt";
import { Request, Response } from "express";
import * as service from "../services/user.service";
import {
  changePasswordSchema,
  createUserSchema,
  updateUserSchema,
} from "../validators/user.validator";

export const create = async (req: Request, res: Response): Promise<void> => {
  const data = createUserSchema.parse(req.body);
  const user = await service.createUser({ ...data });
  res.status(201).json(user);
};

export const getAll = async (req: Request, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = (req.query.search as string) || undefined;

  const list = await service.getAllUsers(page, limit, req, search);
  res.json(list);
};

export const getOne = async (req: Request, res: Response): Promise<void> => {
  const user = await service.getUserById(req.params.id);
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }
  res.json(user);
};

export const update = async (req: Request, res: Response): Promise<void> => {
  const user = await service.getUserById(req.params.id);
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }
  const data = updateUserSchema.parse(req.body);
  const updated = await service.updateUser(req.params.id, {
    ...data,
  });
  res.json(updated);
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  const user = await service.getUserById(req.params.id);
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }
  await service.deleteUser(req.params.id);
  res.status(204).send();
};

export const getCurrentUser = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  const user = await service.getUserById(userId);
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }
  res.json(user);
};

export const changePassword = async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);

  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const user = await service.getUserPassword(userId);
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  const match = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!match) {
    res.status(400).json({ message: "Current password is incorrect" });
    return;
  }

  const newHash = await bcrypt.hash(newPassword, 10);
  await service.updateUser(userId, { passwordHash: newHash });

  res.json({ message: "Password changed successfully" });
  return;
};
