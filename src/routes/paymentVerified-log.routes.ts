import { Router } from "express";
import { getAll } from "../controllers/paymentVerified-log.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorizeRole } from "../middlewares/role.middleware";

const router = Router();

router.use(authenticate);
router.get("/", authorizeRole(["admin"]), getAll);

export default router;
