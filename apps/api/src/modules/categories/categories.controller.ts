import type { RequestHandler } from 'express';
import { z } from 'zod';

import { AppError } from '../../utils/app-error.js';
import { categoriesService } from './categories.service.js';

const paramsSchema = z.object({
  groupId: z.string().uuid(),
});

const getAuthenticatedUserId = (request: Parameters<RequestHandler>[0]) => {
  if (!request.user) {
    throw new AppError('Authentication token is required', 401);
  }

  return request.user.id;
};

export const listCategories: RequestHandler = async (request, response, next) => {
  try {
    const userId = getAuthenticatedUserId(request);
    const { groupId } = paramsSchema.parse(request.params);
    const categories = await categoriesService.listCategories(userId, groupId);

    return response.status(200).json({ categories });
  } catch (error) {
    return next(error);
  }
};
