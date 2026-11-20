import { Router } from 'express';

import { createGetReady, getHealth } from './health.controller.js';
import type { ReadinessProbe } from './health.service.js';

export function createHealthRouter(readinessProbe: ReadinessProbe): Router {
  const router = Router();

  router.get('/health', getHealth);
  router.get('/ready', createGetReady(readinessProbe));

  return router;
}
