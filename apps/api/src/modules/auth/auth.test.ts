import bcrypt from 'bcryptjs';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockPrisma = vi.hoisted(() => ({
  user: {
    create: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
  },
}));

vi.mock('../../services/prisma.js', () => ({
  prisma: mockPrisma,
}));

import { app } from '../../app.js';
import { signAccessToken } from '../../utils/jwt.js';

const publicUser = {
  id: '6a2c9d42-752f-47ef-a4c1-c4a8fd2cd91d',
  name: 'Fábio',
  email: 'fabio@email.com',
  defaultCurrency: 'BRL',
  theme: 'SYSTEM',
};

describe('auth routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('registers a user successfully', async () => {
    mockPrisma.user.findUnique.mockResolvedValueOnce(null);
    mockPrisma.user.create.mockResolvedValueOnce(publicUser);

    const response = await request(app).post('/auth/register').send({
      name: 'Fábio',
      email: 'fabio@email.com',
      password: 'SenhaForte123',
    });

    expect(response.status).toBe(201);
    expect(response.body.user).toEqual({
      id: publicUser.id,
      name: publicUser.name,
      email: publicUser.email,
      defaultCurrency: 'BRL',
      theme: 'system',
    });
    expect(response.body.accessToken).toEqual(expect.any(String));
    expect(response.body.user.passwordHash).toBeUndefined();
    expect(mockPrisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: 'Fábio',
          email: 'fabio@email.com',
          passwordHash: expect.any(String),
        }),
      }),
    );
  });

  it('prevents duplicate email registration', async () => {
    mockPrisma.user.findUnique.mockResolvedValueOnce({
      id: publicUser.id,
    });

    const response = await request(app).post('/auth/register').send({
      name: 'Fábio',
      email: 'fabio@email.com',
      password: 'SenhaForte123',
    });

    expect(response.status).toBe(409);
    expect(response.body).toEqual({
      message: 'Email is already in use',
    });
    expect(mockPrisma.user.create).not.toHaveBeenCalled();
  });

  it('logs in successfully', async () => {
    const passwordHash = await bcrypt.hash('SenhaForte123', 4);
    mockPrisma.user.findFirst.mockResolvedValueOnce({
      ...publicUser,
      passwordHash,
      deletedAt: null,
    });

    const response = await request(app).post('/auth/login').send({
      email: 'fabio@email.com',
      password: 'SenhaForte123',
    });

    expect(response.status).toBe(200);
    expect(response.body.user).toEqual({
      id: publicUser.id,
      name: publicUser.name,
      email: publicUser.email,
      defaultCurrency: 'BRL',
      theme: 'system',
    });
    expect(response.body.accessToken).toEqual(expect.any(String));
    expect(response.body.user.passwordHash).toBeUndefined();
  });

  it('rejects login with a wrong password', async () => {
    const passwordHash = await bcrypt.hash('SenhaForte123', 4);
    mockPrisma.user.findFirst.mockResolvedValueOnce({
      ...publicUser,
      passwordHash,
      deletedAt: null,
    });

    const response = await request(app).post('/auth/login').send({
      email: 'fabio@email.com',
      password: 'SenhaErrada123',
    });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      message: 'Invalid email or password',
    });
  });

  it('rejects /auth/me without a token', async () => {
    const response = await request(app).get('/auth/me');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      message: 'Authentication token is required',
    });
  });

  it('returns the authenticated user with a valid token', async () => {
    mockPrisma.user.findFirst.mockResolvedValueOnce(publicUser);
    const token = signAccessToken(publicUser.id);

    const response = await request(app)
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      user: {
        id: publicUser.id,
        name: publicUser.name,
        email: publicUser.email,
        defaultCurrency: 'BRL',
        theme: 'system',
      },
    });
  });
});
