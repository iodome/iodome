import prisma from "@/prisma/db";
import { setupTransactionalVitest } from "@iodome/vitest";

setupTransactionalVitest(prisma);
