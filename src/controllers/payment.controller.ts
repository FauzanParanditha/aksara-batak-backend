import { Request, Response } from "express";
import * as paymentService from "../services/payment.service";
import { getTeamById } from "../services/team.service";
import { deleteLocalFile } from "../utils/helper";
import {
  ManualProofSchema,
  VerifyPaymentSchema,
} from "../validators/payment.validator";

export const submitManualProof = async (req: Request, res: Response) => {
  try {
    const parseResult = ManualProofSchema.safeParse(req.body);

    if (!parseResult.success) {
      res.status(400).json({
        error: "Validation error",
        issues: parseResult.error.flatten(),
      });
      return;
    }

    const { teamId } = parseResult.data;

    const isExsit = await paymentService.getPaymentManualById(teamId);
    if (!isExsit) {
      res.status(404).json({ message: "Payment not found" });
      return;
    }

    if (req.file && isExsit.manualProofUrl) {
      deleteLocalFile(isExsit.manualProofUrl);
    }

    if (!req.file) {
      res.status(400).json({ error: "Proof file is required" });
      return;
    }

    const proofUrl = `/uploads/payments/${req.file.filename}`;
    const payment = await paymentService.updateManualProof({
      teamId,
      proofUrl,
    });

    res.status(201).json(payment);
    return;
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to submit manual proof", detail: err });
    return;
  }
};

export const getPayments = async (req: Request, res: Response) => {
  try {
    const role = req.user?.role as "admin" | "leader";
    const userId = req.user?.id as string;

    let teamId: string | undefined;

    if (role === "leader") {
      const team = await getTeamById(userId);
      if (!team) {
        res.status(404).json({ error: "Team not found for leader" });
        return;
      }
      teamId = team.id;
    }
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || undefined;
    const payments = await paymentService.getPaymentsByRole(
      { role, teamId },
      page,
      limit,
      req,
      search
    );

    res.status(200).json(payments);
    return;
  } catch (err) {
    console.error("Failed to get payments:", err);
    res.status(500).json({ error: "Failed to retrieve payments", detail: err });
    return;
  }
};

export const verifyManual = async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.params;
    const adminId = req.user?.id as string
    const parseResult = VerifyPaymentSchema.safeParse(req.body);

    if (!parseResult.success) {
      res.status(400).json({
        error: "Validation error",
        issues: parseResult.error.flatten(),
      });
      return;
    }

    const { status, notes } = parseResult.data;

    const payment = await paymentService.verifyManualPayment({
      paymentId,
      status,
      notes,
      adminId
    });

    res.json(payment);
    return;
  } catch (err) {
    res.status(500).json({ error: "Failed to verify payment", detail: err });
    return;
  }
};

export const listWaitingManualPayments = async (_: Request, res: Response) => {
  const payments = await paymentService.getManualPaymentsToVerify();
  res.json(payments);
  return;
};
