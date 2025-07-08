// src/routes/payment.routes.ts
import { Router } from "express";
import {
  getPayments,
  listWaitingManualPayments,
  submitManualProof,
  verifyManual,
} from "../controllers/payment.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorizeRole } from "../middlewares/role.middleware";
import { paymentUpload } from "../middlewares/upload.middleware";

const router = Router();
router.use(authenticate);
router.post(
  "/manual",
  authorizeRole(["admin", "leader"]),
  paymentUpload.single("proof"),
  submitManualProof
);
router.get("/", authorizeRole(["admin", "leader"]), getPayments);

router.patch(
  "/manual/:paymentId/verify",
  authorizeRole(["admin"]),
  verifyManual
);
router.get(
  "/manual/waiting",
  authorizeRole(["admin"]),
  listWaitingManualPayments
);

export default router;
