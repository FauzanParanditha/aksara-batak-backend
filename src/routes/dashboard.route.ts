import { Router } from "express";
import {
  getDashboardStats,
  getStatJudge,
  getStatsAdmin,
} from "../controllers/dashboard.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorizeRole } from "../middlewares/role.middleware";

const router = Router();

// GET /v1/dashboard/stats → membutuhkan autentikasi
router.get(
  "/stats",
  authenticate,
  authorizeRole(["leader"]),
  getDashboardStats
);

router.get(
  "/stats/judge",
  authenticate,
  authorizeRole(["judge"]),
  getStatJudge
);

router.get(
  "/stats/admin",
  authenticate,
  authorizeRole(["admin"]),
  getStatsAdmin
);

export default router;
