import type { RequestHandler } from 'express';

export const notFoundHandler: RequestHandler = (request, response) => {
  return response.status(404).json({
    message: `Route ${request.method} ${request.originalUrl} not found`,
  });
};
