import { Router } from "express";
import { getDashboardStats } from "../controllers/dashboard.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

// GET /v1/dashboard/stats → membutuhkan autentikasi
router.get("/stats", authenticate, getDashboardStats);

export default router;
