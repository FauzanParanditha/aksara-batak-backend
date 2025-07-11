import { NextFunction, Request, Response } from "express";
import logger from "../utils/logger";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(`Unhandled Error: ${err.message}`);
  res.status(500).json({ message: "Internal server error" });
};
