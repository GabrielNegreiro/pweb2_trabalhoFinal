import type { RequestHandler } from 'express';

import { ServiceUnavailableError } from '../../shared/errors/app-error.js';
import { sendSuccess } from '../../shared/http/api-response.js';
import type { ReadinessProbe } from './health.service.js';

export const getHealth: RequestHandler = (_request, response) => {
  sendSuccess(response, {
    status: 'ok',
    service: 'pweb2-academia-api',
    timestamp: new Date().toISOString(),
  });
};

export function createGetReady(readinessProbe: ReadinessProbe): RequestHandler {
  return async (_request, response) => {
    try {
      await readinessProbe();
    } catch {
      throw new ServiceUnavailableError('Database connection is unavailable');
    }

    sendSuccess(response, {
      status: 'ready',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  };
}
