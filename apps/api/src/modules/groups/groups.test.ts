import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockPrisma = vi.hoisted(() => ({
  $transaction: vi.fn(),
  user: {
    findFirst: vi.fn(),
  },
  financialGroup: {
    create: vi.fn(),
    delete: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    findUniqueOrThrow: vi.fn(),
    update: vi.fn(),
  },
  groupMember: {
    create: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
  },
  transaction: {
    count: vi.fn(),
  },
  goal: {
    count: vi.fn(),
  },
  budget: {
    count: vi.fn(),
  },
  category: {
    count: vi.fn(),
    createMany: vi.fn(),
  },
  paymentMethod: {
    count: vi.fn(),
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
const memberId = 'bd702a85-b95f-4835-a548-4ec3f5f77887';
const ownerMemberId = '995d1169-280b-4080-979a-09b75e7026b2';
const now = new Date('2026-05-03T12:00:00.000Z');

const authUser = {
  id: userId,
  name: 'Fabio',
  email: 'fabio@email.com',
  defaultCurrency: 'BRL',
  theme: 'SYSTEM',
};

const otherUser = {
  id: otherUserId,
  name: 'Bianca',
  email: 'bianca@email.com',
  avatarUrl: null,
};

const group = {
  id: groupId,
  name: 'Familia Fabio e Bianca',
  type: 'COUPLE',
  ownerUserId: userId,
  defaultCurrency: 'BRL',
  createdAt: now,
  updatedAt: now,
};

const ownerMember = {
  id: ownerMemberId,
  groupId,
  userId,
  role: 'OWNER',
  status: 'ACTIVE',
  joinedAt: now,
  createdAt: now,
  updatedAt: now,
  user: {
    id: userId,
    name: 'Fabio',
    email: 'fabio@email.com',
    avatarUrl: null,
  },
};

const regularMember = {
  id: memberId,
  groupId,
  userId: otherUserId,
  role: 'MEMBER',
  status: 'ACTIVE',
  joinedAt: now,
  createdAt: now,
  updatedAt: now,
  user: otherUser,
};

const token = signAccessToken(userId);
const otherToken = signAccessToken(otherUserId);
const authHeader = { Authorization: `Bearer ${token}` };
const otherAuthHeader = { Authorization: `Bearer ${otherToken}` };

const mockAuthenticatedUser = () => {
  mockPrisma.user.findFirst.mockResolvedValueOnce(authUser);
};

describe('groups routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a group for the authenticated user', async () => {
    mockAuthenticatedUser();
    const tx = {
      financialGroup: {
        create: vi.fn().mockResolvedValueOnce(group),
        findFirst: vi.fn().mockResolvedValueOnce(null),
        findUniqueOrThrow: vi.fn().mockResolvedValueOnce({
          ...group,
          members: [ownerMember],
        }),
      },
      groupMember: {
        create: vi.fn().mockResolvedValueOnce(ownerMember),
      },
      category: {
        createMany: vi.fn().mockResolvedValueOnce({ count: 14 }),
      },
    };
    mockPrisma.$transaction.mockImplementationOnce((callback) => callback(tx));

    const response = await request(app).post('/groups').set(authHeader).send({
      name: 'Familia Fabio e Bianca',
      type: 'couple',
      defaultCurrency: 'BRL',
    });

    expect(response.status).toBe(201);
    expect(response.body.group).toMatchObject({
      id: groupId,
      name: 'Familia Fabio e Bianca',
      type: 'couple',
      members: [
        {
          userId,
          role: 'owner',
          status: 'active',
        },
      ],
    });
    expect(tx.groupMember.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          groupId,
          userId,
          role: 'OWNER',
          status: 'ACTIVE',
        }),
      }),
    );
    expect(tx.financialGroup.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          inviteCode: expect.any(String),
        }),
      }),
    );
    expect(tx.category.createMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({
            groupId,
            name: 'Alimentação',
            isDefault: true,
          }),
        ]),
        skipDuplicates: true,
      }),
    );
  });

  it('lists only active groups for the authenticated user', async () => {
    mockAuthenticatedUser();
    mockPrisma.groupMember.findMany.mockResolvedValueOnce([
      {
        id: ownerMemberId,
        role: 'OWNER',
        status: 'ACTIVE',
        group,
      },
    ]);

    const response = await request(app).get('/groups').set(authHeader);

    expect(response.status).toBe(200);
    expect(response.body.groups).toHaveLength(1);
    expect(response.body.groups[0]).toMatchObject({
      id: groupId,
      membership: {
        role: 'owner',
        status: 'active',
      },
    });
    expect(mockPrisma.groupMember.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId,
          status: 'ACTIVE',
        },
      }),
    );
  });

  it('does not allow an outside user to access group details', async () => {
    mockAuthenticatedUser();
    mockPrisma.groupMember.findFirst.mockResolvedValueOnce(null);

    const response = await request(app).get(`/groups/${groupId}`).set(authHeader);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: 'Group not found or access denied',
    });
  });

  it('allows owner or admin to edit a group', async () => {
    mockAuthenticatedUser();
    mockPrisma.groupMember.findFirst.mockResolvedValueOnce({
      ...ownerMember,
      user: undefined,
    });
    mockPrisma.financialGroup.update.mockResolvedValueOnce({
      ...group,
      name: 'Novo nome',
      type: 'FAMILY',
      members: [ownerMember],
    });

    const response = await request(app).patch(`/groups/${groupId}`).set(authHeader).send({
      name: 'Novo nome',
      type: 'family',
    });

    expect(response.status).toBe(200);
    expect(response.body.group).toMatchObject({
      name: 'Novo nome',
      type: 'family',
    });
  });

  it('does not allow a regular member to edit a group', async () => {
    mockAuthenticatedUser();
    mockPrisma.groupMember.findFirst.mockResolvedValueOnce({
      ...regularMember,
      userId,
      role: 'MEMBER',
      user: undefined,
    });

    const response = await request(app).patch(`/groups/${groupId}`).set(authHeader).send({
      name: 'Novo nome',
    });

    expect(response.status).toBe(403);
    expect(mockPrisma.financialGroup.update).not.toHaveBeenCalled();
  });

  it('allows owner to invite an existing user', async () => {
    mockAuthenticatedUser();
    mockPrisma.groupMember.findFirst
      .mockResolvedValueOnce({ ...ownerMember, user: undefined })
      .mockResolvedValueOnce(null);
    mockPrisma.user.findFirst.mockResolvedValueOnce(otherUser);
    mockPrisma.groupMember.create.mockResolvedValueOnce({
      ...regularMember,
      role: 'MEMBER',
      status: 'INVITED',
      joinedAt: null,
    });

    const response = await request(app).post(`/groups/${groupId}/invite`).set(authHeader).send({
      email: 'bianca@email.com',
      role: 'member',
    });

    expect(response.status).toBe(201);
    expect(response.body.member).toMatchObject({
      userId: otherUserId,
      role: 'member',
      status: 'invited',
    });
  });

  it('does not allow inviting an unknown email in this version', async () => {
    mockAuthenticatedUser();
    mockPrisma.groupMember.findFirst.mockResolvedValueOnce({
      ...ownerMember,
      user: undefined,
    });
    mockPrisma.user.findFirst.mockResolvedValueOnce(null);

    const response = await request(app).post(`/groups/${groupId}/invite`).set(authHeader).send({
      email: 'naoexiste@email.com',
      role: 'member',
    });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: 'User with this email was not found',
    });
    expect(mockPrisma.groupMember.create).not.toHaveBeenCalled();
  });

  it('does not allow duplicate active or invited members', async () => {
    mockAuthenticatedUser();
    mockPrisma.groupMember.findFirst
      .mockResolvedValueOnce({ ...ownerMember, user: undefined })
      .mockResolvedValueOnce({ ...regularMember, user: undefined });
    mockPrisma.user.findFirst.mockResolvedValueOnce(otherUser);

    const response = await request(app).post(`/groups/${groupId}/invite`).set(authHeader).send({
      email: 'bianca@email.com',
      role: 'viewer',
    });

    expect(response.status).toBe(409);
    expect(response.body).toEqual({
      message: 'User is already a member or has a pending invite',
    });
  });

  it('returns the group invite code for owner or admin', async () => {
    mockAuthenticatedUser();
    mockPrisma.groupMember.findFirst.mockResolvedValueOnce({
      ...ownerMember,
      user: undefined,
    });
    mockPrisma.financialGroup.findUnique.mockResolvedValueOnce({
      id: groupId,
      inviteCode: 'ABC123XYZ0',
    });

    const response = await request(app).get(`/groups/${groupId}/invite-code`).set(authHeader);

    expect(response.status).toBe(200);
    expect(response.body.invite).toEqual({
      groupId,
      code: 'ABC123XYZ0',
    });
  });

  it('regenerates the invite code for owner or admin', async () => {
    mockAuthenticatedUser();
    mockPrisma.groupMember.findFirst.mockResolvedValueOnce({
      ...ownerMember,
      user: undefined,
    });
    mockPrisma.financialGroup.findFirst.mockResolvedValueOnce(null);
    mockPrisma.financialGroup.update.mockResolvedValueOnce({
      id: groupId,
      inviteCode: 'NEWCODE123',
    });

    const response = await request(app)
      .post(`/groups/${groupId}/invite-code/regenerate`)
      .set(authHeader);

    expect(response.status).toBe(200);
    expect(response.body.invite).toEqual({
      groupId,
      code: 'NEWCODE123',
    });
    expect(mockPrisma.financialGroup.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          inviteCode: expect.any(String),
        },
      }),
    );
  });

  it('accepts an invite by code and creates an active member', async () => {
    mockPrisma.user.findFirst.mockResolvedValueOnce({
      ...otherUser,
      defaultCurrency: 'BRL',
      theme: 'SYSTEM',
    });
    mockPrisma.financialGroup.findFirst.mockResolvedValueOnce({
      id: groupId,
    });
    mockPrisma.groupMember.findFirst.mockResolvedValueOnce(null);
    mockPrisma.groupMember.create.mockResolvedValueOnce({
      ...regularMember,
      status: 'ACTIVE',
      role: 'MEMBER',
      joinedAt: now,
    });

    const response = await request(app)
      .post('/groups/invitations/accept')
      .set(otherAuthHeader)
      .send({
        code: 'abc123xyz0',
      });

    expect(response.status).toBe(200);
    expect(response.body.member).toMatchObject({
      groupId,
      userId: otherUserId,
      role: 'member',
      status: 'active',
    });
    expect(mockPrisma.groupMember.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          groupId,
          userId: otherUserId,
          role: 'MEMBER',
          status: 'ACTIVE',
          joinedAt: expect.any(Date),
        }),
      }),
    );
  });

  it('accepts a pending email invite by groupId', async () => {
    mockPrisma.user.findFirst.mockResolvedValueOnce({
      ...otherUser,
      defaultCurrency: 'BRL',
      theme: 'SYSTEM',
    });
    mockPrisma.financialGroup.findUnique.mockResolvedValueOnce({
      id: groupId,
    });
    mockPrisma.groupMember.findFirst.mockResolvedValueOnce({
      ...regularMember,
      status: 'INVITED',
      joinedAt: null,
    });
    mockPrisma.groupMember.update.mockResolvedValueOnce({
      ...regularMember,
      status: 'ACTIVE',
      joinedAt: now,
    });

    const response = await request(app)
      .post('/groups/invitations/accept')
      .set(otherAuthHeader)
      .send({
        groupId,
      });

    expect(response.status).toBe(200);
    expect(response.body.member).toMatchObject({
      groupId,
      userId: otherUserId,
      status: 'active',
    });
    expect(mockPrisma.groupMember.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          status: 'ACTIVE',
          joinedAt: expect.any(Date),
        },
      }),
    );
  });

  it('does not accept invite when user is already active', async () => {
    mockPrisma.user.findFirst.mockResolvedValueOnce({
      ...otherUser,
      defaultCurrency: 'BRL',
      theme: 'SYSTEM',
    });
    mockPrisma.financialGroup.findFirst.mockResolvedValueOnce({
      id: groupId,
    });
    mockPrisma.groupMember.findFirst.mockResolvedValueOnce({
      ...regularMember,
      status: 'ACTIVE',
    });

    const response = await request(app)
      .post('/groups/invitations/accept')
      .set(otherAuthHeader)
      .send({
        code: 'ABC123XYZ0',
      });

    expect(response.status).toBe(409);
    expect(response.body).toEqual({
      message: 'User is already an active member of this group',
    });
  });

  it('allows owner to update member role', async () => {
    mockAuthenticatedUser();
    mockPrisma.groupMember.findFirst
      .mockResolvedValueOnce({ ...ownerMember, user: undefined })
      .mockResolvedValueOnce({ ...regularMember, user: undefined });
    mockPrisma.groupMember.update.mockResolvedValueOnce({
      ...regularMember,
      role: 'ADMIN',
    });

    const response = await request(app)
      .patch(`/groups/${groupId}/members/${memberId}/role`)
      .set(authHeader)
      .send({
        role: 'admin',
      });

    expect(response.status).toBe(200);
    expect(response.body.member).toMatchObject({
      id: memberId,
      role: 'admin',
    });
  });

  it('does not allow admin to update member role', async () => {
    mockAuthenticatedUser();
    mockPrisma.groupMember.findFirst.mockResolvedValueOnce({
      ...ownerMember,
      role: 'ADMIN',
      user: undefined,
    });

    const response = await request(app)
      .patch(`/groups/${groupId}/members/${memberId}/role`)
      .set(authHeader)
      .send({
        role: 'viewer',
      });

    expect(response.status).toBe(403);
    expect(mockPrisma.groupMember.update).not.toHaveBeenCalled();
  });

  it('removes a member by changing status to removed', async () => {
    mockAuthenticatedUser();
    mockPrisma.groupMember.findFirst
      .mockResolvedValueOnce({ ...ownerMember, user: undefined })
      .mockResolvedValueOnce({ ...regularMember, user: undefined });
    mockPrisma.groupMember.update.mockResolvedValueOnce({
      ...regularMember,
      status: 'REMOVED',
    });

    const response = await request(app)
      .delete(`/groups/${groupId}/members/${memberId}`)
      .set(authHeader);

    expect(response.status).toBe(200);
    expect(response.body.member).toMatchObject({
      id: memberId,
      status: 'removed',
    });
    expect(mockPrisma.groupMember.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          status: 'REMOVED',
        },
      }),
    );
  });

  it('does not allow viewer to manage members', async () => {
    mockAuthenticatedUser();
    mockPrisma.groupMember.findFirst
      .mockResolvedValueOnce({
        ...ownerMember,
        userId,
        role: 'VIEWER',
        user: undefined,
      })
      .mockResolvedValueOnce({ ...regularMember, user: undefined });

    const response = await request(app)
      .delete(`/groups/${groupId}/members/${memberId}`)
      .set(authHeader);

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      message: 'You do not have permission to manage members',
    });
  });
});
