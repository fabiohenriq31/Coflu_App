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
    createMany: vi.fn(),
    findMany: vi.fn(),
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
const token = signAccessToken(userId);
const authHeader = { Authorization: `Bearer ${token}` };

const authUser = {
  id: userId,
  name: 'Fabio',
  email: 'fabio@email.com',
  defaultCurrency: 'BRL',
  theme: 'SYSTEM',
};

describe('categories routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lists group categories and creates defaults when empty', async () => {
    mockPrisma.user.findFirst.mockResolvedValueOnce(authUser);
    mockPrisma.groupMember.findFirst.mockResolvedValueOnce({
      id: '995d1169-280b-4080-979a-09b75e7026b2',
      groupId,
      userId,
      role: 'OWNER',
      status: 'ACTIVE',
    });
    mockPrisma.category.count.mockResolvedValueOnce(0);
    mockPrisma.category.createMany.mockResolvedValueOnce({ count: 6 });
    mockPrisma.category.findMany.mockResolvedValueOnce([
      {
        id: categoryId,
        groupId,
        name: 'Alimentacao',
        type: 'EXPENSE',
        icon: 'utensils',
        color: '#EF4444',
        isDefault: true,
      },
    ]);

    const response = await request(app).get(`/groups/${groupId}/categories`).set(authHeader);

    expect(response.status).toBe(200);
    expect(response.body.categories).toEqual([
      {
        id: categoryId,
        groupId,
        name: 'Alimentacao',
        type: 'expense',
        icon: 'utensils',
        color: '#EF4444',
        isDefault: true,
      },
    ]);
    expect(mockPrisma.category.createMany).toHaveBeenCalled();
  });
});
