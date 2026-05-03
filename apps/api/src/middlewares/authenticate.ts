import type { RequestHandler } from 'express';

import { prisma } from '../services/prisma.js';
import { AppError } from '../utils/app-error.js';
import { verifyAccessToken } from '../utils/jwt.js';
import { publicUserSelect, toPublicUser } from '../utils/public-user.js';

export const authenticate: RequestHandler = async (request, _response, next) => {
  try {
    const authorization = request.headers.authorization;

    if (!authorization?.startsWith('Bearer ')) {
      throw new AppError('Authentication token is required', 401);
    }

    const token = authorization.replace('Bearer ', '').trim();

    if (!token) {
      throw new AppError('Authentication token is required', 401);
    }

    const { userId } = verifyAccessToken(token);
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        deletedAt: null,
      },
      select: publicUserSelect,
    });

    if (!user) {
      throw new AppError('Invalid token', 401);
    }

    request.user = toPublicUser(user);
    next();
  } catch (error) {
    next(error);
  }
};
