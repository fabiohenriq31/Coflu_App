import type { RequestHandler } from 'express';

import { AppError } from '../../utils/app-error.js';
import { authService } from './auth.service.js';
import { loginSchema, registerSchema } from './auth.schemas.js';

export const register: RequestHandler = async (request, response, next) => {
  try {
    const input = registerSchema.parse(request.body);
    const result = await authService.register(input);

    return response.status(201).json(result);
  } catch (error) {
    return next(error);
  }
};

export const login: RequestHandler = async (request, response, next) => {
  try {
    const input = loginSchema.parse(request.body);
    const result = await authService.login(input);

    return response.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

export const me: RequestHandler = (request, response, next) => {
  if (!request.user) {
    return next(new AppError('Authentication token is required', 401));
  }

  return response.status(200).json({
    user: request.user,
  });
};

export const logout: RequestHandler = (_request, response) => {
  // Stateless logout for the first auth version. Refresh token revocation will be added later.
  return response.status(200).json({
    success: true,
  });
};
