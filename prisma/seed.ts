import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // 1. Create Users
  const password = await bcrypt.hash("Pandi@123#", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@pandi.id" },
    update: {},
    create: {
      fullName: "Admin",
      email: "admin@pandi.id",
      passwordHash: password,
      role: "admin",
      isVerified: true,
    },
  });

  const judge1 = await prisma.user.upsert({
    where: { email: "judge@pandi.id" },
    update: {},
    create: {
      fullName: "Judge",
      email: "judge@pandi.id",
      passwordHash: password,
      role: "judge",
      isVerified: true,
    },
  });

  const judge2 = await prisma.user.upsert({
    where: { email: "judge2@pandi.id" },
    update: {},
    create: {
      fullName: "Judge",
      email: "judge2@pandi.id",
      passwordHash: password,
      role: "judge",
      isVerified: true,
    },
  });

  // 2. Create Registrars
  const registrarNames = [
    "Rumahweb",
    "Mediacloud",
    "Domainesia",
    "Niagahoster",
    "Exabytes",
  ];
  const registrars: Record<string, { id: string }> = {};
  for (const name of registrarNames) {
    registrars[name] = await prisma.registrar.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // 3. Map domains per registrar (from spreadsheet)
  const domainMap: Record<string, string[]> = {
    Rumahweb: [
      "hatobangon.id",
      "shinho.id",
      "boanaksara.id",
      "arsipaksarabatak.id",
      "membatak.id",
      "wonderful-project.id",
      "batakverse.id",
      "piforrr.id",
      "khavi.id",
      "rivetc0re.id",
      "aksaera.id",
      "batak.id",
      "belajarakasara.id",
      "mahago.id",
      "halakhita.id",
      "batakscript.id",
      "aksaraku.id",
      "aksaralokal.id",
      "edwan.id",
      "suratbatak.id",
      "jabunibatak.id",
      "samsil.id",
      "aksara-batak-digital.id",
      "studiaksarabatak.id",
      "learnaksarabatak.id",
      "batakuba.id",
      "horizons.id",
      "markasara.id",
      "velthoria.id",
      "cintabatak.id",
      "aksaranta.id",
      "aksara.id",
      "podahoras.id",
      "horasedu.id",
      "areznz.id",
    ],
    Mediacloud: [
      "matakba.id",
      "tondibatak.id",
      "abatibelajar.id",
      "batakwonderful.id",
      "base4d.id",
      "pariolo.id",
      "pahoda.id",
      "nauliaksara.id",
    ],
    Domainesia: [
      "sukubatak.id",
      "galaxyaksara.id",
      "bataksejarah.id",
      "satupintu.id",
      "hurufbatak.id",
    ],
    Niagahoster: ["inabatak.id"],
    Exabytes: ["aminudinaz.id"],
    IDCH: ["yogik.id"],
  };

  // 4. Insert Teams (domain = teamName), category = "default", leader = admin
  for (const registrarName in domainMap) {
    const registrar = registrars[registrarName];
    const domains = domainMap[registrarName];

    for (const domain of domains) {
      await prisma.team.create({
        data: {
          teamName: domain,
          category: "default",
          leaderId: admin.id,
          registrarId: registrar.id,
          status: "draft",
        },
      });
    }
  }

  console.log("✅ Seed completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
