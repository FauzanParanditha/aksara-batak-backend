import { Router } from "express";
import {
  createTeam,
  deleteTeam,
  getMyTeam,
  updateTeam,
} from "../controllers/team.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);
router.get("/", getMyTeam);
router.post("/", createTeam);
router.put("/:id", updateTeam);
router.delete("/:id", deleteTeam);

export default router;
