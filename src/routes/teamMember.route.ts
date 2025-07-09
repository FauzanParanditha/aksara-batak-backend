import { Router } from "express";
import {
  addMember,
  deleteMember,
  getAll,
  getMembers,
  updateMember,
} from "../controllers/teamMember.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorizeRole } from "../middlewares/role.middleware";

const router = Router();

router.use(authenticate);

router.get("/", authorizeRole(["admin"]), getAll);
router.get("/:teamId", authorizeRole(["admin", "leader"]), getMembers);
router.post("/", authorizeRole(["admin", "leader"]), addMember);
router.put("/:id", authorizeRole(["admin", "leader"]), updateMember);
router.delete("/:id", authorizeRole(["admin", "leader"]), deleteMember);

export default router;
