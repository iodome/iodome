import { PrismaClient } from '@prisma/client';

declare function setupTransactionalVitest(prisma: PrismaClient): void;

export { setupTransactionalVitest };
