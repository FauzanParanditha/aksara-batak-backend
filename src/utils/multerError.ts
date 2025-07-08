import { ErrorRequestHandler } from "express";
import { MulterError } from "multer";

export const multerErrorHandler: ErrorRequestHandler = (
  err,
  req,
  res,
  next
) => {
  if (err instanceof MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      res.status(400).json({ error: "File too large. Max 2MB allowed." });
      return;
    }
  }

  // Default: teruskan ke error handler berikutnya
  next(err);
};
