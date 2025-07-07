import { Router } from "express";
import {
  createPaylabsInvoiceLink,
  paylabsWebhook,
} from "../controllers/paylabs.controller";

const router = Router();

router.post("/payment-link/:teamId", createPaylabsInvoiceLink);
router.post("/callback/payment", paylabsWebhook);

export default router;
