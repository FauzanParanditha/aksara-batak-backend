import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // 1. Create admin and judge user
  const password = await bcrypt.hash('Pandi@123#', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      fullName: 'Admin',
      email: 'admin@pandi.id',
      passwordHash: password,
      role: 'admin',
      isVerified: true,
    },
  });

  const judge = await prisma.user.upsert({
    where: { email: 'judge@example.com' },
    update: {},
    create: {
      fullName: 'Judge',
      email: 'judge@pandi.id',
      passwordHash: password,
      role: 'judge',
      isVerified: true,
    },
  });

  // 2. Registrar → Domain map
  const data: Record<string, string[]> = {
    Rumahweb: [
      "hatobangon.id", "aksara.id", "jabuinbatak.id", "aksaranta.id", "sinhho.id", "bataka.id", "samsil.id", "bataksara.id",
      "boanaksara.id", "belajarakasarabatak.id", "aksara-batak-digital.id", "podaHoras.id", "arsipaksarabatak.id", "mahago.id",
      "studiaksarabatak.id", "horaseolu.id", "membatak.id", "mahitta.id", "learnaksarabatak.id", "arezna.id", "wonderful-project.id",
      "batakscript.id", "batubako.id", "batakverse.id", "aksaraku.id", "horizons.id", "piforrr.id", "aksarakolal.id", "maraksara.id",
      "khavi.id", "edwan.id", "velthoria.id", "rivetcore.id", "suratbatak.id", "cintabatak.id"
    ],
    Mediacloud: [
      "matakba.id", "tondibatak.id", "abitebelajar.id", "batakwonderful.id", "base44.id", "parjolo.id", "pahoda.id", "nauliaksara.id"
    ],
    Domainesia: [
      "sukubatak.id", "galayaksara.id", "batakbersejarah.id", "satupintu.id", "hurufbatak.id"
    ],
    Niagahoster: ["inabatak.id"],
    Exabytes: ["aminudinaz.id"],
    IDCH: ["yogik.id"],
  };

  for (const [registrarName, domains] of Object.entries(data)) {
    const registrar = await prisma.registrar.upsert({
      where: { name: registrarName },
      update: {},
      create: {
        name: registrarName,
      },
    });

    for (const domainName of domains) {
      await prisma.domainEntry.upsert({
        where: { domainName },
        update: {},
        create: {
          domainName,
          registrarId: registrar.id,
        },
      });
    }
  }

  console.log('✅ Seed completed: Admin, Judge, Registrars, Domains');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
