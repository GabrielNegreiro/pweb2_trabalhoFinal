import { Router } from 'express';

import { authRouter } from '../modules/auth/auth.routes.js';
import { checkInsRouter } from '../modules/checkins/checkins.routes.js';
import { createHealthRouter } from '../modules/health/health.routes.js';
import type { ReadinessProbe } from '../modules/health/health.service.js';
import { membersRouter } from '../modules/members/members.routes.js';
import { workoutsRouter } from '../modules/workouts/workouts.routes.js';

export function createApiRouter(readinessProbe: ReadinessProbe): Router {
  const router = Router();

  router.use(createHealthRouter(readinessProbe));
  router.use('/auth', authRouter);
  router.use('/members', membersRouter);
  router.use('/workouts', workoutsRouter);
  router.use('/checkins', checkInsRouter);

  return router;
}
