import { Router } from "express";
import { login, register, verifyEmail } from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { loginRateLimiter } from "../middlewares/rateLimit.middleware";

const router = Router();

router.post("/register", register);
router.post("/login", loginRateLimiter, login);
router.get("/verify", verifyEmail);

router.get("/me", authenticate, (req, res) => {
  res.json({ user: req.user });
});

export default router;
