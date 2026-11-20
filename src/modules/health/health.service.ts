import { prisma } from '../../database/prisma.js';

export type ReadinessProbe = () => Promise<void>;

export const checkDatabaseConnection: ReadinessProbe = async () => {
  await prisma.$queryRaw`SELECT 1`;
};
