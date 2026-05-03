import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockPrisma = vi.hoisted(() => ({
  $transaction: vi.fn(),
  user: {
    findFirst: vi.fn(),
  },
  groupMember: {
    findFirst: vi.fn(),
    findMany: vi.fn(),
  },
  category: {
    findFirst: vi.fn(),
  },
  paymentMethod: {
    findFirst: vi.fn(),
  },
  transaction: {
    create: vi.fn(),
    delete: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
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
const transactionId = '7cc79b8a-bb63-4875-9851-7ce98c3de19a';
const categoryId = '7ed72a98-d758-453e-b616-623a74f6f611';
const now = new Date('2026-05-03T12:00:00.000Z');
const token = signAccessToken(userId);
const authHeader = { Authorization: `Bearer ${token}` };

const authUser = {
  id: userId,
  name: 'Fabio',
  email: 'fabio@email.com',
  defaultCurrency: 'BRL',
  theme: 'SYSTEM',
};

const creator = {
  id: userId,
  name: 'Fabio',
  email: 'fabio@email.com',
  avatarUrl: null,
};

const otherUser = {
  id: otherUserId,
  name: 'Bianca',
  email: 'bianca@email.com',
  avatarUrl: null,
};

const activeOwner = {
  id: '995d1169-280b-4080-979a-09b75e7026b2',
  groupId,
  userId,
  role: 'OWNER',
  status: 'ACTIVE',
};

const activeViewer = {
  ...activeOwner,
  role: 'VIEWER',
};

const category = {
  id: categoryId,
  name: 'Mercado',
  type: 'EXPENSE',
  icon: 'cart',
  color: '#4EBAA4',
};

const baseTransaction = {
  id: transactionId,
  groupId,
  userId,
  type: 'EXPENSE',
  amount: 120.5,
  categoryId,
  paymentMethodId: null,
  description: 'Mercado',
  date: new Date('2026-05-03T00:00:00.000Z'),
  status: 'CONFIRMED',
  source: 'MANUAL',
  isPrivate: false,
  createdAt: now,
  updatedAt: now,
  category,
  user: creator,
  splits: [
    {
      id: 'a54c6412-165a-40a4-94a7-51068f874fac',
      transactionId,
      userId,
      amount: 120.5,
      percent: 100,
      status: 'CONFIRMED',
      createdAt: now,
      updatedAt: now,
      user: creator,
    },
  ],
};

const mockAuthenticatedUser = () => {
  mockPrisma.user.findFirst.mockResolvedValueOnce(authUser);
};

const mockCategoryAndMembers = (memberIds = [userId]) => {
  mockPrisma.category.findFirst.mockResolvedValueOnce({ id: categoryId });
  mockPrisma.groupMember.findMany.mockResolvedValueOnce(
    memberIds.map((memberUserId) => ({ userId: memberUserId })),
  );
};

describe('transactions routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a simple expense', async () => {
    mockAuthenticatedUser();
    mockPrisma.groupMember.findFirst.mockResolvedValueOnce(activeOwner);
    mockCategoryAndMembers([userId]);
    mockPrisma.transaction.create.mockResolvedValueOnce(baseTransaction);

    const response = await request(app)
      .post(`/groups/${groupId}/transactions`)
      .set(authHeader)
      .send({
        type: 'expense',
        amount: 120.5,
        categoryId,
        description: 'Mercado',
        date: '2026-05-03',
        isPrivate: false,
      });

    expect(response.status).toBe(201);
    expect(response.body.transaction).toMatchObject({
      id: transactionId,
      type: 'expense',
      amount: '120.5',
      splits: [
        {
          userId,
          amount: '120.5',
          percent: '100',
        },
      ],
    });
    expect(mockPrisma.transaction.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          groupId,
          userId,
          type: 'EXPENSE',
          amount: 120.5,
        }),
      }),
    );
  });

  it('creates an expense with valid splits', async () => {
    mockAuthenticatedUser();
    mockPrisma.groupMember.findFirst.mockResolvedValueOnce(activeOwner);
    mockCategoryAndMembers([userId, otherUserId]);
    mockPrisma.transaction.create.mockResolvedValueOnce({
      ...baseTransaction,
      splits: [
        { ...baseTransaction.splits[0], amount: 60.25, percent: 50 },
        {
          ...baseTransaction.splits[0],
          id: '55e4e9b7-9cdb-4b36-ae0d-0a9cdb27b559',
          userId: otherUserId,
          amount: 60.25,
          percent: 50,
          user: otherUser,
        },
      ],
    });

    const response = await request(app)
      .post(`/groups/${groupId}/transactions`)
      .set(authHeader)
      .send({
        type: 'expense',
        amount: 120.5,
        categoryId,
        description: 'Mercado',
        date: '2026-05-03',
        splits: [
          { userId, amount: 60.25 },
          { userId: otherUserId, amount: 60.25 },
        ],
      });

    expect(response.status).toBe(201);
    expect(response.body.transaction.splits).toHaveLength(2);
    expect(mockPrisma.groupMember.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          groupId,
          userId: { in: [userId, otherUserId] },
          status: 'ACTIVE',
        }),
      }),
    );
  });

  it('fails when split total does not match amount', async () => {
    mockAuthenticatedUser();
    mockPrisma.groupMember.findFirst.mockResolvedValueOnce(activeOwner);
    mockPrisma.category.findFirst.mockResolvedValueOnce({ id: categoryId });

    const response = await request(app)
      .post(`/groups/${groupId}/transactions`)
      .set(authHeader)
      .send({
        type: 'expense',
        amount: 120.5,
        categoryId,
        date: '2026-05-03',
        splits: [
          { userId, amount: 50 },
          { userId: otherUserId, amount: 60 },
        ],
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: 'Split amounts must match transaction amount',
    });
    expect(mockPrisma.transaction.create).not.toHaveBeenCalled();
  });

  it('blocks users outside the group', async () => {
    mockAuthenticatedUser();
    mockPrisma.groupMember.findFirst.mockResolvedValueOnce(null);

    const response = await request(app)
      .post(`/groups/${groupId}/transactions`)
      .set(authHeader)
      .send({
        type: 'expense',
        amount: 120.5,
        categoryId,
        date: '2026-05-03',
      });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: 'Group not found or access denied',
    });
  });

  it('lists group transactions', async () => {
    mockAuthenticatedUser();
    mockPrisma.groupMember.findFirst.mockResolvedValueOnce(activeOwner);
    mockPrisma.transaction.findMany.mockResolvedValueOnce([baseTransaction]);

    const response = await request(app).get(`/groups/${groupId}/transactions`).set(authHeader);

    expect(response.status).toBe(200);
    expect(response.body.transactions).toHaveLength(1);
    expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          groupId,
          OR: [{ isPrivate: false }, { userId }],
        }),
        orderBy: {
          date: 'desc',
        },
      }),
    );
  });

  it('hides private transactions from other users in list queries', async () => {
    mockAuthenticatedUser();
    mockPrisma.groupMember.findFirst.mockResolvedValueOnce(activeOwner);
    mockPrisma.transaction.findMany.mockResolvedValueOnce([
      baseTransaction,
      {
        ...baseTransaction,
        id: '532b44a0-b284-48f4-86ca-1c3aa3a391ff',
        userId,
        isPrivate: true,
      },
    ]);

    const response = await request(app).get(`/groups/${groupId}/transactions`).set(authHeader);

    expect(response.status).toBe(200);
    expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: [{ isPrivate: false }, { userId }],
        }),
      }),
    );
  });

  it('allows owner to edit a transaction', async () => {
    mockAuthenticatedUser();
    mockPrisma.groupMember.findFirst.mockResolvedValueOnce(activeOwner);
    mockPrisma.transaction.findFirst.mockResolvedValueOnce(baseTransaction);
    mockCategoryAndMembers([userId]);
    const database = {
      transactionSplit: {
        deleteMany: vi.fn(),
      },
      transaction: {
        update: vi.fn().mockResolvedValueOnce({
          ...baseTransaction,
          description: 'Mercado atualizado',
        }),
      },
    };
    mockPrisma.$transaction.mockImplementationOnce((callback) => callback(database));

    const response = await request(app)
      .patch(`/groups/${groupId}/transactions/${transactionId}`)
      .set(authHeader)
      .send({
        description: 'Mercado atualizado',
      });

    expect(response.status).toBe(200);
    expect(response.body.transaction).toMatchObject({
      id: transactionId,
      description: 'Mercado atualizado',
    });
  });

  it('prevents viewer from editing a transaction', async () => {
    mockAuthenticatedUser();
    mockPrisma.groupMember.findFirst.mockResolvedValueOnce(activeViewer);
    mockPrisma.transaction.findFirst.mockResolvedValueOnce({
      ...baseTransaction,
      userId,
    });

    const response = await request(app)
      .patch(`/groups/${groupId}/transactions/${transactionId}`)
      .set(authHeader)
      .send({
        description: 'Nao pode editar',
      });

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      message: 'Viewers cannot manage transactions',
    });
  });

  it('deletes a transaction', async () => {
    mockAuthenticatedUser();
    mockPrisma.groupMember.findFirst.mockResolvedValueOnce(activeOwner);
    mockPrisma.transaction.findFirst.mockResolvedValueOnce(baseTransaction);
    mockPrisma.transaction.delete.mockResolvedValueOnce(baseTransaction);

    const response = await request(app)
      .delete(`/groups/${groupId}/transactions/${transactionId}`)
      .set(authHeader);

    expect(response.status).toBe(204);
    expect(mockPrisma.transaction.delete).toHaveBeenCalledWith({
      where: {
        id: transactionId,
      },
    });
  });

  it('filters transactions by month and year', async () => {
    mockAuthenticatedUser();
    mockPrisma.groupMember.findFirst.mockResolvedValueOnce(activeOwner);
    mockPrisma.transaction.findMany.mockResolvedValueOnce([baseTransaction]);

    const response = await request(app)
      .get(`/groups/${groupId}/transactions?month=5&year=2026`)
      .set(authHeader);

    expect(response.status).toBe(200);
    expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          date: {
            gte: new Date('2026-05-01T00:00:00.000Z'),
            lt: new Date('2026-06-01T00:00:00.000Z'),
          },
        }),
      }),
    );
  });
});
