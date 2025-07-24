import { Router } from "express";
import { scoreController } from "../controllers/score.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorizeRole } from "../middlewares/role.middleware";

const router = Router();

router.post(
  "/",
  authenticate,
  authorizeRole(["judge"]),
  scoreController.createScore
);

export default router;
