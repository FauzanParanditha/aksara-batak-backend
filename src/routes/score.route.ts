import { Router } from "express";
import { createScore } from "../controllers/score.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorizeRole } from "../middlewares/role.middleware";

const router = Router();

router.post("/", authenticate, authorizeRole(["judge"]), createScore);

export default router;
