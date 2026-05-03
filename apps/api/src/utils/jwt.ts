import jwt, { type SignOptions } from 'jsonwebtoken';

import { env } from '../config/env.js';
import { AppError } from './app-error.js';

type AccessTokenPayload = {
  sub: string;
};

export const signAccessToken = (userId: string) => {
  const options: SignOptions = {
    subject: userId,
    expiresIn: env.jwtExpiresIn as SignOptions['expiresIn'],
  };

  return jwt.sign({}, env.jwtSecret, options);
};

export const verifyAccessToken = (token: string) => {
  try {
    const payload = jwt.verify(token, env.jwtSecret) as AccessTokenPayload;

    if (!payload.sub) {
      throw new AppError('Invalid token', 401);
    }

    return {
      userId: payload.sub,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError('Invalid token', 401);
  }
};
