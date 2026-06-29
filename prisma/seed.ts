import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Siyaqi...");

  const hashedPassword = await bcrypt.hash("siyaqi2026", 10);

  // Auto-école demo
  const ecole = await prisma.autoEcole.upsert({
    where: { id: "demo-ecole" },
    update: {},
    create: {
      id: "demo-ecole",
      name: "أوطو إيكول النجاح",
      city: "الدار البيضاء",
      phone: "0661234567",
      trialEndsAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year for demo
    },
  });

  // Gérant
  await prisma.user.upsert({
    where: { username: "gerant" },
    update: {},
    create: {
      username: "gerant",
      hashedPassword,
      fullName: "محمد المنصوري",
      role: "GERANT",
      phone: "0661234567",
      autoEcoleId: ecole.id,
    },
  });

  // Moniteur
  await prisma.user.upsert({
    where: { username: "moniteur1" },
    update: {},
    create: {
      username: "moniteur1",
      hashedPassword,
      fullName: "رشيد بنعلي",
      role: "MONITEUR",
      phone: "0671234567",
      autoEcoleId: ecole.id,
    },
  });

  console.log("✅ Seed complete!");
  console.log("📌 Gérant: username=gerant, password=siyaqi2026");
  console.log("📌 Moniteur: username=moniteur1, password=siyaqi2026");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
