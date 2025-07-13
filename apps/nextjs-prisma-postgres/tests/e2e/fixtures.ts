import { PrismaClient } from "@/app/generated/prisma";
import { createTestFixtures } from "@iodome/prisma/src/playwright";

export const test = createTestFixtures(PrismaClient);
