import { Router } from "express";
import * as ctrl from "../controllers/user.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorizeRole } from "../middlewares/role.middleware";

const router = Router();

router.use(authenticate);
router.get("/", authorizeRole(["admin"]), ctrl.getAll);
router.get("/:id", authorizeRole(["admin"]), ctrl.getOne);
router.post("/", authorizeRole(["admin"]), ctrl.create);
router.put("/:id", authorizeRole(["admin"]), ctrl.update);
router.delete("/:id", authorizeRole(["admin"]), ctrl.remove);

export default router;
