import type { Response } from 'express';

interface SuccessResponse<T> {
  success: true;
  data: T;
}

interface ErrorBody {
  code: string;
  message: string;
  details?: unknown;
}

interface ErrorResponse {
  success: false;
  error: ErrorBody;
}

export function sendSuccess<T>(response: Response, data: T, statusCode = 200): Response {
  const body: SuccessResponse<T> = { success: true, data };
  return response.status(statusCode).json(body);
}

export function sendError(
  response: Response,
  statusCode: number,
  error: ErrorBody,
): Response {
  const body: ErrorResponse = { success: false, error };
  return response.status(statusCode).json(body);
}
