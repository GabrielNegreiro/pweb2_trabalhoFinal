import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';

import { createApp } from './app.js';

describe('API infrastructure', () => {
  it('returns service health without consulting the database', async () => {
    const readinessProbe = vi.fn(async () => undefined);
    const response = await request(createApp({ readinessProbe })).get('/api/v1/health');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch(/json/);
    expect(response.body).toMatchObject({
      success: true,
      data: {
        status: 'ok',
        service: 'pweb2-academia-api',
      },
    });
    expect(response.body.data.timestamp).toEqual(expect.any(String));
    expect(readinessProbe).not.toHaveBeenCalled();
  });

  it('returns ready when the database probe succeeds', async () => {
    const readinessProbe = vi.fn(async () => undefined);
    const response = await request(createApp({ readinessProbe })).get('/api/v1/ready');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      data: {
        status: 'ready',
        database: 'connected',
      },
    });
    expect(readinessProbe).toHaveBeenCalledOnce();
  });

  it('returns a standardized 503 when the database probe fails', async () => {
    const readinessProbe = vi.fn(async () => {
      throw new Error('connection refused');
    });
    const response = await request(createApp({ readinessProbe })).get('/api/v1/ready');

    expect(response.status).toBe(503);
    expect(response.body).toEqual({
      success: false,
      error: {
        code: 'SERVICE_UNAVAILABLE',
        message: 'Database connection is unavailable',
      },
    });
  });

  it('returns a standardized 404 for an unknown route', async () => {
    const response = await request(createApp()).get('/api/v1/unknown');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      success: false,
      error: {
        code: 'ROUTE_NOT_FOUND',
        message: 'Route GET /api/v1/unknown not found',
      },
    });
  });

  it('returns a standardized 400 for malformed JSON', async () => {
    const response = await request(createApp())
      .post('/api/v1/auth')
      .set('Content-Type', 'application/json')
      .send('{"invalid":');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      success: false,
      error: {
        code: 'INVALID_JSON',
        message: 'Request body contains invalid JSON',
      },
    });
  });

  it('sets the main security headers', async () => {
    const response = await request(createApp()).get('/api/v1/health');

    expect(response.headers['x-powered-by']).toBeUndefined();
    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['content-security-policy']).toBeDefined();
  });
});
