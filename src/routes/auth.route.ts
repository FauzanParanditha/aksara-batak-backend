import { Router } from "express";
import { login, register, verifyEmail } from "../controllers/auth.controller";
import { loginRateLimiter } from "../middlewares/rateLimit.middleware";

const router = Router();

router.post("/register", register);
router.post("/login", loginRateLimiter, login);
router.get("/verify", verifyEmail);

export default router;
