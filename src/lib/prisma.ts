import { PrismaTiDBCloud } from "@tidbcloud/prisma-adapter";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: any };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _prisma: any = null;

function createPrismaClient() {
  const url = process.env.DATABASE_URL!;
  const adapter = new PrismaTiDBCloud({ url });
  return new PrismaClient({ adapter });
}

function getPrisma(): any {
  if (process.env.NODE_ENV === "production") {
    if (!_prisma) _prisma = createPrismaClient();
    return _prisma;
  }
  if (!globalForPrisma.prisma) globalForPrisma.prisma = createPrismaClient();
  return globalForPrisma.prisma;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const prisma: any = new Proxy({} as any, {
  get(_, prop) {
    return (getPrisma() as any)[prop as string];
  },
});
