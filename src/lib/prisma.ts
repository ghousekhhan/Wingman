import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createPrisma() {
  return new PrismaClient({
    log: ["warn", "error"],
  });
}

export const prisma =
  globalForPrisma.prisma ??
  (globalForPrisma.prisma = createPrisma());

export default prisma;
