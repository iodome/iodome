import prisma from "@/prisma/db";
import { wrapTestsInTransactions } from "@iodome/prisma/vitest";

wrapTestsInTransactions(prisma);
