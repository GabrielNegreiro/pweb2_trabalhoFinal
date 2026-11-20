import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';

import { env } from './config/env.js';
import { errorHandler } from './middlewares/error-handler.js';
import { notFoundHandler } from './middlewares/not-found.js';
import { requestLogger } from './middlewares/request-logger.js';
import {
  checkDatabaseConnection,
  type ReadinessProbe,
} from './modules/health/health.service.js';
import { createApiRouter } from './routes/index.js';

interface AppDependencies {
  readinessProbe?: ReadinessProbe;
}

function corsOrigin(): string | string[] {
  if (env.CORS_ORIGIN === '*') return '*';
  return env.CORS_ORIGIN.split(',').map((origin) => origin.trim());
}

export function createApp(dependencies: AppDependencies = {}): Express {
  const app = express();
  const readinessProbe = dependencies.readinessProbe ?? checkDatabaseConnection;

  app.disable('x-powered-by');
  app.use(requestLogger);
  app.use(helmet());
  app.use(cors({ origin: corsOrigin() }));
  app.use(express.json({ limit: '1mb' }));

  app.use('/api/v1', createApiRouter(readinessProbe));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
