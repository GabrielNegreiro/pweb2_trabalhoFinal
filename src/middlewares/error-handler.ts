import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';

import { logger } from '../config/logger.js';
import { AppError } from '../shared/errors/app-error.js';
import { sendError } from '../shared/http/api-response.js';

interface JsonSyntaxError extends SyntaxError {
  status?: number;
  type?: string;
}

export const errorHandler: ErrorRequestHandler = (error: unknown, _request, response, _next) => {
  if (error instanceof ZodError) {
    sendError(response, 422, {
      code: 'VALIDATION_ERROR',
      message: 'Request validation failed',
      details: error.issues,
    });
    return;
  }

  if (error instanceof SyntaxError) {
    const jsonError = error as JsonSyntaxError;
    if (jsonError.status === 400 && jsonError.type === 'entity.parse.failed') {
      sendError(response, 400, {
        code: 'INVALID_JSON',
        message: 'Request body contains invalid JSON',
      });
      return;
    }
  }

  if (error instanceof AppError) {
    sendError(response, error.statusCode, {
      code: error.code,
      message: error.message,
      ...(error.details === undefined ? {} : { details: error.details }),
    });
    return;
  }

  logger.error({ err: error }, 'Unhandled request error');
  sendError(response, 500, {
    code: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred',
  });
};
