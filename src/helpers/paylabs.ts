import axios from "axios";
import crypto from "crypto";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import logger from "../utils/logger";

dotenv.config();

export const generateRequestId = () => uuidv4();
export function createSignatureForward(
  method: string,
  endpointUrl: string,
  body: string,
  timestamp: string,
  privateKeyPath: string
): string {
  logger.info(`minified body ${body}`);
  logger.info(`timestamp ${timestamp}`);

  const bodyHash = crypto.createHash("sha256").update(body).digest("hex");
  const stringToSign = `${method}:${endpointUrl}:${bodyHash}:${timestamp}`;

  logger.info(`string content ${stringToSign}`);

  const privateKeyPem = fs.readFileSync(path.resolve(privateKeyPath), "utf8");
  const signer = crypto.createSign("RSA-SHA256");
  signer.update(stringToSign);
  signer.end();

  const signature = signer.sign(privateKeyPem);
  return signature.toString("base64");
}

export function verifySignatureForward(
  method: string,
  endpointUrl: string,
  body: string,
  timestamp: string,
  signatureBase64: string,
  publicKeyPath: string
): boolean {
  logger.info(`verify minified body ${body}`);
  logger.info(`verify timestamp ${timestamp}`);

  const bodyHash = crypto.createHash("sha256").update(body).digest("hex");
  const stringToVerify = `${method}:${endpointUrl}:${bodyHash}:${timestamp}`;

  logger.info(`verify string content ${stringToVerify}`);

  const publicKeyPem = fs.readFileSync(path.resolve(publicKeyPath), "utf8");
  const verifier = crypto.createVerify("RSA-SHA256");
  verifier.update(stringToVerify);
  verifier.end();

  logger.info(
    verifier.verify(publicKeyPem, Buffer.from(signatureBase64, "base64"))
  );
  return verifier.verify(publicKeyPem, Buffer.from(signatureBase64, "base64"));
}

dayjs.extend(utc);
dayjs.extend(timezone);

export function generateTimestamp(offsetMinutes: number = 0): string {
  const jakartaTime = dayjs().tz("Asia/Jakarta").add(offsetMinutes, "minute");
  return jakartaTime.format("YYYY-MM-DDTHH:mm:ss.SSSZ");
}

export function generateHeadersForward(
  method: string,
  endpoint: string,
  requestBody: string,
  offsetMinutes: number = 0
): { headers: Record<string, string>; timestamp: string } {
  const timestamp = generateTimestamp(offsetMinutes);
  const signature = createSignatureForward(
    method,
    endpoint,
    requestBody,
    timestamp,
    "private-key.pem"
  );

  const headers = {
    "Content-Type": "application/json;charset=utf-8",
    "X-TIMESTAMP": timestamp,
    "X-SIGNATURE": signature,
    "X-REQUEST-ID": uuidv4(),
  };

  return { headers, timestamp };
}

export function generateHeadersPartnerId(
  method: string,
  endpoint: string,
  requestBody: string,
  offsetMinutes: number = 0
): { headers: Record<string, string>; timestamp: string } {
  const timestamp = generateTimestamp(offsetMinutes);
  const signature = createSignatureForward(
    method,
    endpoint,
    requestBody,
    timestamp,
    "private-key.pem"
  );

  const headers = {
    "Content-Type": "application/json;charset=utf-8",
    "X-TIMESTAMP": timestamp,
    "X-SIGNATURE": signature,
    "X-PARTNER-ID": process.env.PARTNER_ID || "",
  };

  return { headers, timestamp };
}

export async function sendToPaylabs<T>(
  endpoint: string,
  headers: Record<string, string>,
  payload: any
): Promise<T> {
  const url = `${process.env.PAYHUB_BASE_URL}${endpoint}`;
  try {
    const response = await axios.post<T>(url, payload, { headers });
    return response.data;
  } catch (error: any) {
    const status = error.response?.status || 500;
    const data = error.response?.data || error.message;
    throw new Error(`Paylabs error: ${status}, ${JSON.stringify(data)}`);
  }
}
