import bcrypt from 'bcryptjs';

import { prisma } from '../../services/prisma.js';
import { AppError } from '../../utils/app-error.js';
import { signAccessToken } from '../../utils/jwt.js';
import { publicUserSelect, toPublicUser } from '../../utils/public-user.js';
import type { LoginInput, RegisterInput } from './auth.schemas.js';

const PASSWORD_SALT_ROUNDS = 12;
const INVALID_CREDENTIALS_MESSAGE = 'Invalid email or password';

export const authService = {
  async register(input: RegisterInput) {
    const existingUser = await prisma.user.findUnique({
      where: {
        email: input.email,
      },
      select: {
        id: true,
      },
    });

    if (existingUser) {
      throw new AppError('Email is already in use', 409);
    }

    const passwordHash = await bcrypt.hash(input.password, PASSWORD_SALT_ROUNDS);
    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash,
      },
      select: publicUserSelect,
    });

    return {
      user: toPublicUser(user),
      accessToken: signAccessToken(user.id),
    };
  },

  async login(input: LoginInput) {
    const user = await prisma.user.findFirst({
      where: {
        email: input.email,
        deletedAt: null,
      },
    });

    if (!user?.passwordHash) {
      throw new AppError(INVALID_CREDENTIALS_MESSAGE, 401);
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new AppError(INVALID_CREDENTIALS_MESSAGE, 401);
    }

    return {
      user: toPublicUser(user),
      accessToken: signAccessToken(user.id),
    };
  },
};
