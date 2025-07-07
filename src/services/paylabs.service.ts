import { Payment, PrismaClient } from "@prisma/client";
import dayjs from "dayjs";
import { buildPaylabsPayloadFromTeam } from "../helpers/items";
import {
  generateHeadersPartnerId,
  generateRequestId,
  sendToPaylabs,
  verifySignatureForward,
} from "../helpers/paylabs";
import { PaylabsPayload, ResponsePaylabsLink } from "../types/paylabs";

const prisma = new PrismaClient();
const storeId = process.env.STORE_ID || "";

export const createInvoiceLinkForTeam = async (
  teamId: string
): Promise<string> => {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      leader: true,
      payment: true,
    },
  });

  if (!team) {
    throw new Error("Team not found");
  }

  if (!team.payment) {
    throw new Error("Payment not found");
  }

  const { payment } = team;

  // 🚫 Prevent duplicate if already paid
  if (payment.status === "paid") {
    throw new Error("This team has already paid");
  }

  const createdAt = dayjs(payment.createdAt);
  const now = dayjs();
  const isExpired = now.diff(createdAt, "minute") > 30;

  // ✅ If already created before and still valid, reuse it
  if (payment.paymentUrl && payment.status === "pending" && !isExpired) {
    // Optionally, check if still valid or expired
    return payment.paymentUrl;
  }

  // Build item payload
  const teamWithPayment = team as typeof team & { payment: Payment };
  const payload: PaylabsPayload = buildPaylabsPayloadFromTeam(
    teamWithPayment,
    storeId
  );

  const requestBody = JSON.stringify(payload);
  const { headers } = generateHeadersPartnerId(
    "POST",
    "/api/v1/order/create/link",
    requestBody
  );

  const response = await sendToPaylabs<ResponsePaylabsLink>(
    "/api/v1/order/create/link",
    headers,
    payload
  );

  if (!response.success) {
    console.log(response);
    throw new Error("error send to paylabs ");
  }

  // Simpan token dan status
  await prisma.payment.update({
    where: { teamId: team.id },
    data: {
      paymentUrl: response.paymentLink,
      status: "pending",
      createdAt: new Date(),
    },
  });

  return response.paymentLink;
};

const CLIENT_ID = process.env.PARTNER_ID || "";

export const handlePaylabsWebhook = async ({
  rawBody,
  headers,
  endpoint,
}: {
  rawBody: string;
  headers: Record<string, string>;
  endpoint: string;
}) => {
  const requestId = generateRequestId();
  const signature = headers["x-signature"];
  const timestamp = headers["x-timestamp"];

  if (!signature || !timestamp) {
    return {
      clientId: CLIENT_ID,
      requestId,
      errCode: "400",
      errCodeDes: "Missing headers",
    };
  }

  const isValid = verifySignatureForward(
    "POST",
    endpoint,
    rawBody,
    timestamp,
    signature,
    "certs/paylabs-public.pem"
  );

  if (!isValid) {
    return {
      clientId: CLIENT_ID,
      requestId,
      errCode: "401",
      errCodeDes: "Invalid signature",
    };
  }

  let parsed;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return {
      clientId: CLIENT_ID,
      requestId,
      errCode: "400",
      errCodeDes: "Invalid JSON body",
    };
  }

  const {
    partnerTxId,
    status,
    paidAt,
    errCode: errCodeFromNotification,
    responseCode,
  } = parsed;

  const match = partnerTxId?.match(/^TX-(.+?)-/);
  const teamId = match?.[1];

  if (!teamId || !status) {
    return {
      clientId: CLIENT_ID,
      requestId,
      errCode: "400",
      errCodeDes: "Missing partnerTxId or status",
    };
  }

  if (status !== "PAID") {
    return {
      clientId: CLIENT_ID,
      requestId,
      errCode: "0",
      errCodeDes: "Ignored non-paid status",
    };
  }

  try {
    await prisma.payment.update({
      where: { teamId },
      data: {
        status: "paid",
        paidAt: new Date(paidAt || Date.now()),
      },
    });

    const errCode =
      errCodeFromNotification ??
      (responseCode === "2003100" ? "0" : responseCode);

    return {
      clientId: CLIENT_ID,
      requestId,
      errCode: errCode ?? "0",
    };
  } catch (err: any) {
    return {
      clientId: CLIENT_ID,
      requestId,
      errCode: "500",
      errCodeDes: err.message,
    };
  }
};
