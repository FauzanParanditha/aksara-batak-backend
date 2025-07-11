import { EmailStatus, EmailType, PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

import { logEmail, updateLogEmail } from "../services/email-log.service";

export const sendVerificationEmail = async (
  email: string,
  name: string,
  participantId?: string,
  options?: {
    skipLog?: boolean;
    logIdToUpdate?: string;
  }
) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST!,
    port: Number(process.env.SMTP_PORT!),
    secure: false,
    auth: {
      user: process.env.SMTP_USER!,
      pass: process.env.SMTP_PASS!,
    },
    tls: {
      ciphers: "TLSv1.2",
    },
  });

  const prisma = new PrismaClient();
  const user = await prisma.user.update({
    where: { id: participantId },
    data: {},
  });

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
    expiresIn: "1h",
  });

  const verificationUrl = `${process.env.FRONTEND_URL}/auth/verify?token=${token}`;

  const body = `<p>Halo ${name},</p>
    <p>Terima kasih telah mendaftar. Untuk menyelesaikan proses pendaftaran, silakan klik tombol di bawah ini untuk memverifikasi akun Anda:</p>
    <p style="text-align: center; margin: 24px 0;">
      <a href="${verificationUrl}" 
         style="background-color: #4f46e5; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;"
         target="_blank">
        Verifikasi Akun
      </a>
    </p>
    <p>Atau salin dan buka tautan ini di browser Anda:</p>
    <p><a href="${verificationUrl}">${verificationUrl}</a></p>
    <p>Jika Anda tidak merasa mendaftar, abaikan email ini.</p>
    <p>Salam,<br/>Tim Panitia</p>`;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER!,
      to: email,
      subject: "Verifikasi Akun Anda",
      html: body,
    });

    if (!options?.skipLog && !options?.logIdToUpdate) {
      await logEmail(
        email,
        "Verifikasi Akun Anda",
        EmailType.verification,
        EmailStatus.success,
        participantId,
        body
      );
    } else if (options?.logIdToUpdate) {
      await updateLogEmail(options.logIdToUpdate, {
        status: "success",
        sentAt: new Date(),
        errorMessage: null,
      });
    }
  } catch (err: any) {
    if (!options?.skipLog && !options?.logIdToUpdate) {
      await logEmail(
        email,
        "Verifikasi Akun Anda",
        EmailType.verification,
        EmailStatus.failed,
        participantId,
        err.message
      );
    } else if (options?.logIdToUpdate) {
      await updateLogEmail(options.logIdToUpdate, {
        status: "failed",
        sentAt: new Date(),
        errorMessage: err.message,
      });
    }

    throw err;
  }
};
