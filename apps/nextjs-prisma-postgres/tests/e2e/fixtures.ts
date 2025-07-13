import { PrismaClient } from "@/app/generated/prisma";
import { createTestFixtures } from "@iodome/prisma";

export const test = createTestFixtures(PrismaClient);
