import { Router } from "express";
import {
  createAnnouncement,
  getAll,
} from "../controllers/announcement.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorizeRole } from "../middlewares/role.middleware";

const router = Router();
router.use(authenticate);

router.get("/logs", authorizeRole(["admin"]), getAll);
router.post("/", authorizeRole(["admin"]), createAnnouncement);

export default router;
