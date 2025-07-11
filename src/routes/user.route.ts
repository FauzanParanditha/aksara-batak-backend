import { Router } from "express";
import * as ctrl from "../controllers/user.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorizeRole } from "../middlewares/role.middleware";

const router = Router();

router.use(authenticate);
router.get("/", authorizeRole(["admin"]), ctrl.getAll);
router.get("/me", ctrl.getCurrentUser);
router.get("/:id", authorizeRole(["admin"]), ctrl.getOne);
router.post("/", authorizeRole(["admin"]), ctrl.create);
router.put("/:id", authorizeRole(["admin", "leader"]), ctrl.update);
router.delete("/:id", authorizeRole(["admin"]), ctrl.remove);

router.post(
  "/me/change-password",
  authorizeRole(["admin", "leader"]),
  ctrl.changePassword
);

export default router;
