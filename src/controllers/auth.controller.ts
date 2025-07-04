import { Request, Response } from "express";
import { loginLeader, registerLeader } from "../services/auth.service";
import { verifyEmailService } from "../services/verify.service";
import { loginSchema, registerSchema } from "../validators/auth.validator";

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
