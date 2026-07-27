import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const { PrismaClient } = require("@prisma/client");
import bcrypt from "bcryptjs";

function createPrismaClient() {
  const url = new URL(process.env.DATABASE_URL!);
  const adapter = new PrismaMariaDb({
    host: url.hostname,
    port: Number(url.port),
    user: url.username,
    password: url.password,
    database: url.pathname.replace(/^\//, ""),
    connectionLimit: 20,
  });
  return new PrismaClient({ adapter });
}

async function main() {
  const prisma = createPrismaClient();

  const phone = "9999999999";
  const password = "admin123";
  const name = "Admin";

  const existing = await prisma.user.findUnique({ where: { phone } });
  if (existing) {
    const updated = await prisma.user.update({
      where: { phone },
      data: { role: "admin", name },
    });
    console.log(`Updated existing user ${updated.phone} to admin role`);
    await prisma.$disconnect();
    return;
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { phone, password: hashed, name, role: "admin" },
  });
  console.log(`Admin created: ${user.phone} / ${password}`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
