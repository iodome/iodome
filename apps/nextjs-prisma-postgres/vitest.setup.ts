import prisma from "@/prisma/db";
import { useTransactions } from "@iodome/prisma/vitest";

useTransactions(prisma);
