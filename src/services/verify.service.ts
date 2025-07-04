import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export const verifyEmailService = async (token: string) => {
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      throw new Error("User tidak ditemukan");
    }

    if (user.isVerified) {
      return { message: "Akun sudah terverifikasi sebelumnya" };
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
      },
    });

    return {
      success: true,
      message: "Akun berhasil diverifikasi",
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
    };
  } catch (err: any) {
    throw new Error("Token tidak valid atau telah kedaluwarsa");
  }
};
