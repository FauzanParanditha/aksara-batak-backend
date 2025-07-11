import { Request, Response } from "express";
import { createSignatureForward, generateRequestId } from "../helpers/paylabs";
import {
  createInvoiceLinkForTeam,
  handlePaylabsWebhook,
} from "../services/paylabs.service";
import { teamIdSchema } from "../validators/paylabs.validator";

export const createPaylabsInvoiceLink = async (req: Request, res: Response) => {
  try {
    const parseResult = teamIdSchema.safeParse(req.params);
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.format() });
      return;
    }

    const { teamId } = parseResult.data;
    const invoiceUrl = await createInvoiceLinkForTeam(teamId);
    res.json({ payUrl: invoiceUrl });
    return;
  } catch (error: any) {
    res.status(500).json({ error: error.message });
    return;
  }
};

export const paylabsWebhook = async (req: Request, res: Response) => {
  const rawBody = JSON.stringify(req.body);
  const headersIn = {
    "x-signature": req.headers["x-signature"] as string,
    "x-timestamp": req.headers["x-timestamp"] as string,
    "x-client-id": req.headers["x-client-id"] as string,
  };

  const result = await handlePaylabsWebhook({
    rawBody,
    headers: headersIn,
    endpoint: "/callback/payment",
  });

  const responseBody = JSON.stringify(result);
  const timestamp = new Date().toISOString();
  const requestId = generateRequestId();

  const signature = createSignatureForward(
    "POST",
    "/callback/payment",
    responseBody,
    timestamp,
    "private-key.pem"
  );

  res.setHeader("X-TIMESTAMP", timestamp);
  res.setHeader("X-SIGNATURE", signature);
  res.setHeader("X-REQUEST-ID", requestId);

  const statusCode = result.errCode === "0" ? 200 : 400;
  res.status(statusCode).json(result);
  return;
};
