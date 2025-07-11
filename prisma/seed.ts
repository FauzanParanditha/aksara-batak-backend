import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@pandi.id";
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    console.log(`Admin user already exists: ${email}`);
    return;
  }

  const hashedPassword = await bcrypt.hash("Pandi@123#", 10);

  await prisma.user.create({
    data: {
      fullName: "Super Admin",
      email,
      passwordHash: hashedPassword,
      role: "admin",
      isVerified: false,
    },
  });

  console.log(`✅ Admin user created: ${email}`);
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
