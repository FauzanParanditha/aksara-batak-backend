import { Router } from "express";
import {
  addMember,
  deleteMember,
  getMembers,
  updateMember,
} from "../controllers/teamMember.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);
router.get("/:teamId", getMembers);
router.post("/", addMember);
router.put("/:id", updateMember);
router.delete("/:id", deleteMember);

export default router;
