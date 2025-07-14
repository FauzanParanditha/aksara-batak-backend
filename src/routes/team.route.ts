import { Router } from "express";
import {
  createTeam,
  deleteTeam,
  getMyTeam,
  getTeamById,
  updateTeam,
  uploadSubmission,
} from "../controllers/team.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorizeRole } from "../middlewares/role.middleware";
import { submissionUpload } from "../middlewares/submission.middleware copy";
import { teamUpload } from "../middlewares/team.middleware copy";

const router = Router();

router.use(authenticate);
router.get("/", authorizeRole(["admin", "leader"]), getMyTeam);
router.get("/:id", authorizeRole(["admin", "leader"]), getTeamById);
router.post(
  "/",
  authorizeRole(["admin", "leader"]),
  teamUpload.single("photo"),
  createTeam
);
router.put(
  "/:id",
  authorizeRole(["admin", "leader"]),
  teamUpload.single("photo"),
  updateTeam
);
router.delete("/:id", authorizeRole(["admin", "leader"]), deleteTeam);

router.post(
  "/submission",
  authorizeRole(["leader"]),
  submissionUpload.single("proof"),
  uploadSubmission
);

export default router;
