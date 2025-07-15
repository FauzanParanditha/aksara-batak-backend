import { Request, Response } from "express";
import {
  forgotPasswordService,
  loginLeader,
  registerLeader,
  resetPasswordService,
} from "../services/auth.service";
import { verifyEmailService } from "../services/verify.service";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "../validators/auth.validator";

export const register = async (req: Request, res: Response) => {
  try {
    const parsed = registerSchema.parse(req.body);
    const user = await registerLeader(parsed);
    res.status(201).json({ message: "Registered", user });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const parsed = loginSchema.parse(req.body);
    const { user, token } = await loginLeader(parsed);
    res.json({ token, user });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  const token = req.query.token as string;

  try {
    const result = await verifyEmailService(token);
    res.status(200).json(result);
    return;
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
    return;
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  const parsed = forgotPasswordSchema.parse(req.body);
  await forgotPasswordService(parsed.email);
  res.json({ message: "If that email exists, a reset link has been sent." });
  return;
};

export const resetPassword = async (req: Request, res: Response) => {
  const parsed = resetPasswordSchema.parse(req.body);
  try {
    await resetPasswordService(parsed.token, parsed.newPassword);
    res.json({ message: "Password has been reset." });
    return;
  } catch (err: any) {
    res.status(400).json({ message: err.message });
    return;
  }
};
