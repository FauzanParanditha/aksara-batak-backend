import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@pandi.id";
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    console.log(`Admin user already exists: ${email}`);
  } else {
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

  const codes = Array.from({ length: 900 }, (_, i) => i + 100);

  for (const code of codes) {
    await prisma.uniqueCodePool.upsert({
      where: { code },
      update: {},
      create: { code },
    });
  }

  console.log("✅ Unique code pool seeded.");
}

main()
  .catch((e) => {
    console.error("❌ Error in seeding:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
