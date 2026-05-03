import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockPrisma = vi.hoisted(() => ({
  user: {
    findFirst: vi.fn(),
    findMany: vi.fn(),
  },
  groupMember: {
    findFirst: vi.fn(),
  },
  category: {
    findMany: vi.fn(),
  },
  transaction: {
    groupBy: vi.fn(),
  },
  transactionSplit: {
    groupBy: vi.fn(),
  },
}));

vi.mock('../../services/prisma.js', () => ({
  prisma: mockPrisma,
}));

import { app } from '../../app.js';
import { signAccessToken } from '../../utils/jwt.js';

const userId = '6a2c9d42-752f-47ef-a4c1-c4a8fd2cd91d';
const otherUserId = '25fc9c63-df1b-4d1c-8f0b-a5c848c5cd5e';
const groupId = 'd312e9be-4301-4eb6-89d5-f8fa1d6de74b';
const categoryId = '7ed72a98-d758-453e-b616-623a74f6f611';
const otherCategoryId = 'ab187af6-8952-488f-8f9a-3b638b2d077a';
const token = signAccessToken(userId);
const authHeader = { Authorization: `Bearer ${token}` };

const authUser = {
  id: userId,
  name: 'Fabio',
  email: 'fabio@email.com',
  defaultCurrency: 'BRL',
  theme: 'SYSTEM',
};

const activeMember = {
  id: '995d1169-280b-4080-979a-09b75e7026b2',
  groupId,
  userId,
  role: 'OWNER',
  status: 'ACTIVE',
};

const mockAuthenticatedUser = () => {
  mockPrisma.user.findFirst.mockResolvedValueOnce(authUser);
};

describe('dashboard routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calculates summary correctly', async () => {
    mockAuthenticatedUser();
    mockPrisma.groupMember.findFirst.mockResolvedValueOnce(activeMember);
    mockPrisma.transaction.groupBy.mockResolvedValueOnce([
      {
        type: 'INCOME',
        _sum: {
          amount: 5000,
        },
      },
      {
        type: 'EXPENSE',
        _sum: {
          amount: 3200,
        },
      },
    ]);

    const response = await request(app)
      .get(`/groups/${groupId}/dashboard/summary?month=5&year=2026`)
      .set(authHeader);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      income: 5000,
      expense: 3200,
      balance: 1800,
    });
    expect(mockPrisma.transaction.groupBy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          groupId,
          status: 'CONFIRMED',
          date: {
            gte: new Date('2026-05-01T00:00:00.000Z'),
            lt: new Date('2026-06-01T00:00:00.000Z'),
          },
        }),
      }),
    );
  });

  it('ignores private transactions from other users', async () => {
    mockAuthenticatedUser();
    mockPrisma.groupMember.findFirst.mockResolvedValueOnce(activeMember);
    mockPrisma.transaction.groupBy.mockResolvedValueOnce([]);

    const response = await request(app)
      .get(`/groups/${groupId}/dashboard/summary?month=5&year=2026`)
      .set(authHeader);

    expect(response.status).toBe(200);
    expect(mockPrisma.transaction.groupBy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: [{ isPrivate: false }, { userId }],
        }),
      }),
    );
  });

  it('groups expenses by category', async () => {
    mockAuthenticatedUser();
    mockPrisma.groupMember.findFirst.mockResolvedValueOnce(activeMember);
    mockPrisma.transaction.groupBy.mockResolvedValueOnce([
      {
        categoryId,
        _sum: {
          amount: 1200,
        },
      },
      {
        categoryId: otherCategoryId,
        _sum: {
          amount: 450,
        },
      },
    ]);
    mockPrisma.category.findMany.mockResolvedValueOnce([
      {
        id: categoryId,
        name: 'Alimentacao',
      },
      {
        id: otherCategoryId,
        name: 'Transporte',
      },
    ]);

    const response = await request(app)
      .get(`/groups/${groupId}/dashboard/categories`)
      .set(authHeader);

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      {
        categoryId,
        name: 'Alimentacao',
        total: 1200,
      },
      {
        categoryId: otherCategoryId,
        name: 'Transporte',
        total: 450,
      },
    ]);
    expect(mockPrisma.transaction.groupBy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          type: 'EXPENSE',
          categoryId: {
            not: null,
          },
        }),
        orderBy: {
          _sum: {
            amount: 'desc',
          },
        },
      }),
    );
  });

  it('calculates member spending from splits', async () => {
    mockAuthenticatedUser();
    mockPrisma.groupMember.findFirst.mockResolvedValueOnce(activeMember);
    mockPrisma.transactionSplit.groupBy.mockResolvedValueOnce([
      {
        userId,
        _sum: {
          amount: 1800,
        },
      },
      {
        userId: otherUserId,
        _sum: {
          amount: 1400,
        },
      },
    ]);
    mockPrisma.user.findMany.mockResolvedValueOnce([
      {
        id: userId,
        name: 'Fabio',
      },
      {
        id: otherUserId,
        name: 'Bianca',
      },
    ]);

    const response = await request(app).get(`/groups/${groupId}/dashboard/members`).set(authHeader);

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      {
        userId,
        name: 'Fabio',
        total: 1800,
      },
      {
        userId: otherUserId,
        name: 'Bianca',
        total: 1400,
      },
    ]);
    expect(mockPrisma.transactionSplit.groupBy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          transaction: expect.objectContaining({
            groupId,
            status: 'CONFIRMED',
            type: 'EXPENSE',
            OR: [{ isPrivate: false }, { userId }],
          }),
        },
      }),
    );
  });

  it('fails for users outside the group', async () => {
    mockAuthenticatedUser();
    mockPrisma.groupMember.findFirst.mockResolvedValueOnce(null);

    const response = await request(app)
      .get(`/groups/${groupId}/dashboard/summary?month=5&year=2026`)
      .set(authHeader);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: 'Group not found or access denied',
    });
    expect(mockPrisma.transaction.groupBy).not.toHaveBeenCalled();
  });
});
