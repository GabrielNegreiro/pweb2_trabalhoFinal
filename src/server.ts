import { createServer } from 'node:http';

import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { disconnectDatabase } from './database/prisma.js';

const server = createServer(createApp());

server.listen(env.PORT, () => {
  logger.info({ port: env.PORT, environment: env.NODE_ENV }, 'HTTP server started');
});

let shuttingDown = false;

async function shutdown(signal: NodeJS.Signals): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;

  logger.info({ signal }, 'Graceful shutdown started');

  server.close(async (error) => {
    if (error) {
      logger.error({ err: error }, 'Failed to close HTTP server');
      process.exitCode = 1;
    }

    try {
      await disconnectDatabase();
    } catch (databaseError) {
      logger.error({ err: databaseError }, 'Failed to disconnect database');
      process.exitCode = 1;
    }
  });
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
