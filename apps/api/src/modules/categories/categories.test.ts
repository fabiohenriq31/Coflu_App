import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockPrisma = vi.hoisted(() => ({
  user: {
    findFirst: vi.fn(),
  },
  groupMember: {
    findFirst: vi.fn(),
  },
  category: {
    count: vi.fn(),
    create: vi.fn(),
    createMany: vi.fn(),
    delete: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
  },
  transaction: {
    count: vi.fn(),
  },
}));

vi.mock('../../services/prisma.js', () => ({
  prisma: mockPrisma,
}));

import { app } from '../../app.js';
import { signAccessToken } from '../../utils/jwt.js';

const userId = '6a2c9d42-752f-47ef-a4c1-c4a8fd2cd91d';
const groupId = 'd312e9be-4301-4eb6-89d5-f8fa1d6de74b';
const categoryId = '7ed72a98-d758-453e-b616-623a74f6f611';
const customCategoryId = '0343dad4-0169-4d7b-831b-91e3e4766119';
const token = signAccessToken(userId);
const authHeader = { Authorization: `Bearer ${token}` };

const authUser = {
  id: userId,
  name: 'Fabio',
  email: 'fabio@email.com',
  defaultCurrency: 'BRL',
  theme: 'SYSTEM',
};

const activeOwner = {
  id: '995d1169-280b-4080-979a-09b75e7026b2',
  groupId,
  userId,
  role: 'OWNER',
  status: 'ACTIVE',
};

const activeMember = {
  ...activeOwner,
  role: 'MEMBER',
};

const expenseCategory = {
  id: categoryId,
  groupId,
  name: 'Alimentação',
  type: 'EXPENSE',
  icon: 'utensils',
  color: '#EF4444',
  isDefault: true,
  createdAt: new Date('2026-05-03T12:00:00.000Z'),
  updatedAt: new Date('2026-05-03T12:00:00.000Z'),
};

const customCategory = {
  ...expenseCategory,
  id: customCategoryId,
  name: 'Pets',
  icon: null,
  color: '#F59E0B',
  isDefault: false,
};

const mockAuthenticatedUser = () => {
  mockPrisma.user.findFirst.mockResolvedValueOnce(authUser);
};

const mockActiveMember = (member = activeOwner) => {
  mockPrisma.groupMember.findFirst.mockResolvedValueOnce(member);
};

describe('categories routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lists group categories separated by type and creates missing defaults', async () => {
    mockAuthenticatedUser();
    mockActiveMember();
    mockPrisma.category.count.mockResolvedValueOnce(0);
    mockPrisma.category.createMany.mockResolvedValueOnce({ count: 14 });
    mockPrisma.category.findMany.mockResolvedValueOnce([
      {
        ...expenseCategory,
        id: '03b29c4b-b842-4d1d-93bb-d0141e1ba673',
        name: 'Salário',
        type: 'INCOME',
        icon: 'briefcase',
        color: '#4EBAA4',
      },
      expenseCategory,
    ]);

    const response = await request(app).get(`/groups/${groupId}/categories`).set(authHeader);

    expect(response.status).toBe(200);
    expect(response.body.categories).toHaveLength(2);
    expect(response.body.income).toEqual([
      expect.objectContaining({
        name: 'Salário',
        type: 'income',
      }),
    ]);
    expect(response.body.expense).toEqual([
      expect.objectContaining({
        name: 'Alimentação',
        type: 'expense',
      }),
    ]);
    expect(mockPrisma.category.createMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({
            groupId,
            name: 'Alimentação',
            isDefault: true,
          }),
          expect.objectContaining({
            groupId,
            name: 'Freelance',
            isDefault: true,
          }),
        ]),
        skipDuplicates: true,
      }),
    );
  });

  it('creates a custom category for an active member', async () => {
    mockAuthenticatedUser();
    mockActiveMember(activeMember);
    mockPrisma.category.create.mockResolvedValueOnce(customCategory);

    const response = await request(app).post(`/groups/${groupId}/categories`).set(authHeader).send({
      name: 'Pets',
      type: 'expense',
      color: '#F59E0B',
    });

    expect(response.status).toBe(201);
    expect(response.body.category).toMatchObject({
      id: customCategoryId,
      name: 'Pets',
      type: 'expense',
      color: '#F59E0B',
      isDefault: false,
    });
    expect(mockPrisma.category.create).toHaveBeenCalledWith({
      data: {
        groupId,
        name: 'Pets',
        type: 'EXPENSE',
        icon: null,
        color: '#F59E0B',
        isDefault: false,
      },
    });
  });

  it('edits category name and color as owner or admin', async () => {
    mockAuthenticatedUser();
    mockActiveMember();
    mockPrisma.category.findFirst.mockResolvedValueOnce(expenseCategory);
    mockPrisma.category.update.mockResolvedValueOnce({
      ...expenseCategory,
      name: 'Mercado',
      color: '#4EBAA4',
    });

    const response = await request(app)
      .patch(`/groups/${groupId}/categories/${categoryId}`)
      .set(authHeader)
      .send({
        name: 'Mercado',
        color: '#4EBAA4',
      });

    expect(response.status).toBe(200);
    expect(response.body.category).toMatchObject({
      name: 'Mercado',
      color: '#4EBAA4',
      type: 'expense',
    });
    expect(mockPrisma.category.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          name: 'Mercado',
          color: '#4EBAA4',
        },
      }),
    );
  });

  it('does not allow changing category type while editing', async () => {
    mockAuthenticatedUser();
    mockActiveMember();

    const response = await request(app)
      .patch(`/groups/${groupId}/categories/${categoryId}`)
      .set(authHeader)
      .send({
        type: 'income',
      });

    expect(response.status).toBe(400);
    expect(mockPrisma.category.update).not.toHaveBeenCalled();
  });

  it('prevents deleting default categories', async () => {
    mockAuthenticatedUser();
    mockActiveMember();
    mockPrisma.category.findFirst.mockResolvedValueOnce(expenseCategory);

    const response = await request(app)
      .delete(`/groups/${groupId}/categories/${categoryId}`)
      .set(authHeader);

    expect(response.status).toBe(409);
    expect(response.body).toEqual({
      message: 'Default categories cannot be deleted',
    });
    expect(mockPrisma.category.delete).not.toHaveBeenCalled();
  });

  it('prevents deleting categories with linked transactions', async () => {
    mockAuthenticatedUser();
    mockActiveMember();
    mockPrisma.category.findFirst.mockResolvedValueOnce(customCategory);
    mockPrisma.transaction.count.mockResolvedValueOnce(1);

    const response = await request(app)
      .delete(`/groups/${groupId}/categories/${customCategoryId}`)
      .set(authHeader);

    expect(response.status).toBe(409);
    expect(response.body).toEqual({
      message: 'Category cannot be deleted because it has linked transactions',
    });
    expect(mockPrisma.category.delete).not.toHaveBeenCalled();
  });

  it('deletes custom categories without linked transactions', async () => {
    mockAuthenticatedUser();
    mockActiveMember();
    mockPrisma.category.findFirst.mockResolvedValueOnce(customCategory);
    mockPrisma.transaction.count.mockResolvedValueOnce(0);
    mockPrisma.category.delete.mockResolvedValueOnce(customCategory);

    const response = await request(app)
      .delete(`/groups/${groupId}/categories/${customCategoryId}`)
      .set(authHeader);

    expect(response.status).toBe(204);
    expect(mockPrisma.category.delete).toHaveBeenCalledWith({
      where: {
        id: customCategoryId,
      },
    });
  });
});
