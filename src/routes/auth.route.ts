import { Router } from "express";
import {
  forgotPassword,
  login,
  register,
  resetPassword,
  verifyEmail,
} from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/verify", verifyEmail);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.get("/me", authenticate, (req, res) => {
  res.json({ user: req.user });
});

export default router;
