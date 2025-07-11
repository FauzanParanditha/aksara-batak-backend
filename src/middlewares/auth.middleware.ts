import { NextFunction, Request, RequestHandler, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/jwt";
import logger from "../utils/logger";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

interface JwtPayload {
  id: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export const authenticate: RequestHandler = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "Unauthorized: No token provided" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    if (!decoded?.id || !decoded?.email || !decoded?.role) {
      res.status(401).json({ message: "Invalid token payload" });
      return;
    }

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    logger.info(
      `✅ Authenticated user ${decoded.email} with role ${decoded.role}`
    );

    next();
  } catch (error) {
    logger.warn(`⛔ Invalid JWT: ${error}`);
    res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};
