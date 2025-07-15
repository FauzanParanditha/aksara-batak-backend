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
  <p>Thank you for registering. To complete your registration, please click the button below to verify your account:</p>
  <p style="text-align: center; margin: 24px 0;">
    <a href="${verificationUrl}" 
      style="background-color: #4f46e5; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;"
      target="_blank">
      Verify Account
    </a>
  </p>
  <p>Or copy and open this link in your browser:</p>
  <p><a href="${verificationUrl}">${verificationUrl}</a></p>
  <p>If you did not register, you can safely ignore this email.</p>
  <p>Regards,<br/>The Committee Team</p>`;

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

export const transporter = nodemailer.createTransport({
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

export async function sendMail(to: string, subject: string, html: string) {
  await transporter.sendMail({
    from: `Panitia ${process.env.SMTP_USER!}`,
    to,
    subject,
    html,
  });
}

export async function sendResetEmail(name: string, to: string, token: string) {
  const resetLink = `${process.env.FRONTEND_URL}/auth/reset-password?token=${token}`;

  const body = `<p>Halo ${name},</p>
  <p>You recently requested to reset your password. Click the button below to set a new password:</p>
  <p style="text-align: center; margin: 24px 0;">
    <a href="${resetLink}" 
      style="background-color: #4f46e5; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;"
      target="_blank">
      Reset Password
    </a>
  </p>
  <p>Or copy and open this link in your browser:</p>
  <p><a href="${resetLink}">${resetLink}</a></p>
  <p>This link will expire in 1 hour for your security.</p>
  <p>If you did not request a password reset, you can safely ignore this email.</p>
  <p>Regards,<br/>The Committee Team</p>`;

  try {
    await transporter.sendMail({
      from: `"No Reply" <${process.env.SMTP_EMAIL}>`,
      to,
      subject: "Reset Password",
      html: body,
    });
    await logEmail(
      to,
      "Reset Password",
      EmailType.resetPassword,
      EmailStatus.success,
      undefined,
      `<p>Click the link below to reset your password:</p>
       <a href="${resetLink}">${resetLink}</a>
       <p>This link will expire in 1 hour.</p>`
    );
  } catch (error) {
    await logEmail(
      to,
      "Reset Password",
      EmailType.resetPassword,
      EmailStatus.failed,
      undefined,
      error instanceof Error ? error.message : String(error)
    );
    throw error;
  }
}
