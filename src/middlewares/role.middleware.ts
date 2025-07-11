import { RequestHandler } from "express";

export const authorizeRole = (roles: string[]): RequestHandler => {
  return (req, res, next) => {
    const role = req.user?.role;

    if (!role || !roles.includes(role)) {
      res.status(403).json({ message: "Forbidden: Insufficient role" });
      return;
    }

    next();
  };
};
