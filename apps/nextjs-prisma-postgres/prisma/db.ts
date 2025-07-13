import { PrismaClient } from "@/app/generated/prisma";

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.DEBUG ? ["query", "info", "warn", "error"] : [],
  });
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;
