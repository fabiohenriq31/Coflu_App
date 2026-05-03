import type { RequestHandler } from 'express';

import { AppError } from '../../utils/app-error.js';
import {
  dashboardParamsSchema,
  dashboardPeriodQuerySchema,
  optionalDashboardPeriodQuerySchema,
} from './dashboard.schemas.js';
import { dashboardService } from './dashboard.service.js';

const getAuthenticatedUserId = (request: Parameters<RequestHandler>[0]) => {
  if (!request.user) {
    throw new AppError('Authentication token is required', 401);
  }

  return request.user.id;
};

export const getSummary: RequestHandler = async (request, response, next) => {
  try {
    const userId = getAuthenticatedUserId(request);
    const { groupId } = dashboardParamsSchema.parse(request.params);
    const query = dashboardPeriodQuerySchema.parse(request.query);
    const summary = await dashboardService.getSummary(userId, groupId, query);

    return response.status(200).json(summary);
  } catch (error) {
    return next(error);
  }
};

export const getCategories: RequestHandler = async (request, response, next) => {
  try {
    const userId = getAuthenticatedUserId(request);
    const { groupId } = dashboardParamsSchema.parse(request.params);
    const query = optionalDashboardPeriodQuerySchema.parse(request.query);
    const categories = await dashboardService.getCategories(userId, groupId, query);

    return response.status(200).json(categories);
  } catch (error) {
    return next(error);
  }
};

export const getMembers: RequestHandler = async (request, response, next) => {
  try {
    const userId = getAuthenticatedUserId(request);
    const { groupId } = dashboardParamsSchema.parse(request.params);
    const query = optionalDashboardPeriodQuerySchema.parse(request.query);
    const members = await dashboardService.getMembers(userId, groupId, query);

    return response.status(200).json(members);
  } catch (error) {
    return next(error);
  }
};
