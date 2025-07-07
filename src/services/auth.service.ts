import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendVerificationEmail } from "../utils/mailer";
const prisma = new PrismaClient();

export const registerLeader = async (data: any) => {
  const { fullName, email, password, phone } = data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error("Email already registered");

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      fullName,
      email,
      phone,
      passwordHash,
      role: "leader",
      isVerified: false,
    },
  });

  if (user.email && user.isVerified === false) {
    await sendVerificationEmail(user.email, user.fullName, user.id);
  }

  return user;
};

export const loginLeader = async (data: any) => {
  const { email, password } = data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("Invalid credentials");

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) throw new Error("Invalid credentials");

  if (!user.isVerified) {
    throw new Error("Account not verified");
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: "7d" }
  );
  const { passwordHash, ...safeUser } = user;

  return { user: safeUser, token };
};
