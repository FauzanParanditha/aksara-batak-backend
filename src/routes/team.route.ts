import { Router } from "express";
import {
  createTeam,
  deleteTeam,
  getMyTeam,
  getTeamById,
  updateTeam,
} from "../controllers/team.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorizeRole } from "../middlewares/role.middleware";

const router = Router();

router.use(authenticate);
router.get("/", authorizeRole(["admin", "leader"]), getMyTeam);
router.get("/:id", authorizeRole(["admin", "leader"]), getTeamById);
router.post("/", authorizeRole(["admin", "leader"]), createTeam);
router.put("/:id", authorizeRole(["admin", "leader"]), updateTeam);
router.delete("/:id", authorizeRole(["admin", "leader"]), deleteTeam);

export default router;
