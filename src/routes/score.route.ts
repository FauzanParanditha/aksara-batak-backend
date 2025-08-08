import { Router } from "express";
import { createScore, createScoreMulti } from "../controllers/score.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorizeRole } from "../middlewares/role.middleware";

const router = Router();

router.post("/", authenticate, authorizeRole(["judge"]), createScore);
router.post("/multi", authenticate, authorizeRole(["admin"]), createScoreMulti);

export default router;
