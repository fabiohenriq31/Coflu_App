import type { Request, Response } from 'express';

import { env } from '../../config/env.js';

export const getHealth = (_request: Request, response: Response) => {
  return response.status(200).json({
    status: 'ok',
    app: 'Coflu API',
    version: env.apiVersion,
  });
};
