import { PrismaClient } from "@/app/generated/prisma";
import { createTestFixtures } from "@iodome/prisma/playwright";

export const test = createTestFixtures(PrismaClient);
