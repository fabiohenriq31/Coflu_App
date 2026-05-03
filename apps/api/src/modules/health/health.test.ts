import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { app } from '../../app.js';

describe('GET /health', () => {
  it('returns API health metadata', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'ok',
      app: 'Coflu API',
      version: '0.1.0',
    });
  });
});
