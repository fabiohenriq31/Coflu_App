import type { RequestHandler } from 'express';

import { AppError } from '../../utils/app-error.js';
import {
  categoryItemParamsSchema,
  categoryParamsSchema,
  createCategorySchema,
  updateCategorySchema,
} from './categories.schemas.js';
import { categoriesService } from './categories.service.js';

const getAuthenticatedUserId = (request: Parameters<RequestHandler>[0]) => {
  if (!request.user) {
    throw new AppError('Authentication token is required', 401);
  }

  return request.user.id;
};

export const listCategories: RequestHandler = async (request, response, next) => {
  try {
    const userId = getAuthenticatedUserId(request);
    const { groupId } = categoryParamsSchema.parse(request.params);
    const data = await categoriesService.listCategories(userId, groupId);

    return response.status(200).json(data);
  } catch (error) {
    return next(error);
  }
};

export const createCategory: RequestHandler = async (request, response, next) => {
  try {
    const userId = getAuthenticatedUserId(request);
    const { groupId } = categoryParamsSchema.parse(request.params);
    const input = createCategorySchema.parse(request.body);
    const category = await categoriesService.createCategory(userId, groupId, input);

    return response.status(201).json({ category });
  } catch (error) {
    return next(error);
  }
};

export const updateCategory: RequestHandler = async (request, response, next) => {
  try {
    const userId = getAuthenticatedUserId(request);
    const { groupId, categoryId } = categoryItemParamsSchema.parse(request.params);
    const input = updateCategorySchema.parse(request.body);
    const category = await categoriesService.updateCategory(userId, groupId, categoryId, input);

    return response.status(200).json({ category });
  } catch (error) {
    return next(error);
  }
};

export const deleteCategory: RequestHandler = async (request, response, next) => {
  try {
    const userId = getAuthenticatedUserId(request);
    const { groupId, categoryId } = categoryItemParamsSchema.parse(request.params);

    await categoriesService.deleteCategory(userId, groupId, categoryId);

    return response.status(204).send();
  } catch (error) {
    return next(error);
  }
};
