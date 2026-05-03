import {
  GroupType,
  MemberRole,
  MemberStatus,
  type FinancialGroup,
  type GroupMember,
  type Prisma,
  type User,
} from '@prisma/client';

import { prisma } from '../../services/prisma.js';
import { AppError } from '../../utils/app-error.js';
import { createDefaultCategoriesForGroup } from '../categories/categories.service.js';
import { requireGroupAdmin, requireGroupMember, requireGroupOwner } from './groups.permissions.js';
import type {
  CreateGroupInput,
  InviteMemberInput,
  UpdateGroupInput,
  UpdateMemberRoleInput,
} from './groups.schemas.js';

const groupTypeByInput: Record<CreateGroupInput['type'], GroupType> = {
  couple: GroupType.COUPLE,
  family: GroupType.FAMILY,
  friends: GroupType.FRIENDS,
  other: GroupType.OTHER,
};

const groupTypeByPrisma: Record<GroupType, CreateGroupInput['type']> = {
  COUPLE: 'couple',
  FAMILY: 'family',
  FRIENDS: 'friends',
  OTHER: 'other',
};

const roleByInput: Record<InviteMemberInput['role'], MemberRole> = {
  admin: MemberRole.ADMIN,
  member: MemberRole.MEMBER,
  viewer: MemberRole.VIEWER,
};

const roleByPrisma: Record<MemberRole, 'owner' | 'admin' | 'member' | 'viewer'> = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member',
  VIEWER: 'viewer',
};

const statusByPrisma: Record<MemberStatus, 'invited' | 'active' | 'removed'> = {
  INVITED: 'invited',
  ACTIVE: 'active',
  REMOVED: 'removed',
};

type MemberWithUser = Pick<
  GroupMember,
  'id' | 'role' | 'status' | 'joinedAt' | 'createdAt' | 'updatedAt' | 'userId'
> & {
  user: Pick<User, 'id' | 'name' | 'email' | 'avatarUrl'>;
};

type GroupWithMembers = FinancialGroup & {
  members: MemberWithUser[];
};

const memberInclude = {
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
    },
  },
} satisfies Prisma.GroupMemberInclude;

const serializeMember = (member: MemberWithUser) => ({
  id: member.id,
  userId: member.userId,
  role: roleByPrisma[member.role],
  status: statusByPrisma[member.status],
  joinedAt: member.joinedAt,
  createdAt: member.createdAt,
  updatedAt: member.updatedAt,
  user: member.user,
});

const serializeGroup = (group: GroupWithMembers) => ({
  id: group.id,
  name: group.name,
  type: groupTypeByPrisma[group.type],
  ownerUserId: group.ownerUserId,
  defaultCurrency: group.defaultCurrency,
  createdAt: group.createdAt,
  updatedAt: group.updatedAt,
  members: group.members.map(serializeMember),
});

const serializeGroupSummary = (
  group: FinancialGroup,
  membership: Pick<GroupMember, 'id' | 'role' | 'status'>,
) => ({
  id: group.id,
  name: group.name,
  type: groupTypeByPrisma[group.type],
  ownerUserId: group.ownerUserId,
  defaultCurrency: group.defaultCurrency,
  createdAt: group.createdAt,
  updatedAt: group.updatedAt,
  membership: {
    id: membership.id,
    role: roleByPrisma[membership.role],
    status: statusByPrisma[membership.status],
  },
});

const findGroupForMember = async (groupId: string) => {
  const group = await prisma.financialGroup.findUnique({
    where: {
      id: groupId,
    },
    include: {
      members: {
        where: {
          status: MemberStatus.ACTIVE,
        },
        include: memberInclude,
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  });

  if (!group) {
    throw new AppError('Group not found or access denied', 404);
  }

  return group;
};

export const groupsService = {
  async createGroup(userId: string, input: CreateGroupInput) {
    const group = await prisma.$transaction(async (transaction) => {
      const createdGroup = await transaction.financialGroup.create({
        data: {
          name: input.name,
          type: groupTypeByInput[input.type],
          ownerUserId: userId,
          defaultCurrency: input.defaultCurrency,
        },
      });

      await transaction.groupMember.create({
        data: {
          groupId: createdGroup.id,
          userId,
          role: MemberRole.OWNER,
          status: MemberStatus.ACTIVE,
          joinedAt: new Date(),
        },
      });

      await createDefaultCategoriesForGroup(createdGroup.id, transaction);

      return transaction.financialGroup.findUniqueOrThrow({
        where: {
          id: createdGroup.id,
        },
        include: {
          members: {
            include: memberInclude,
          },
        },
      });
    });

    return serializeGroup(group);
  },

  async listGroups(userId: string) {
    const memberships = await prisma.groupMember.findMany({
      where: {
        userId,
        status: MemberStatus.ACTIVE,
      },
      include: {
        group: true,
      },
      orderBy: {
        joinedAt: 'desc',
      },
    });

    return memberships.map((membership) => serializeGroupSummary(membership.group, membership));
  },

  async getGroup(userId: string, groupId: string) {
    await requireGroupMember(userId, groupId);
    const group = await findGroupForMember(groupId);

    return serializeGroup(group);
  },

  async updateGroup(userId: string, groupId: string, input: UpdateGroupInput) {
    await requireGroupAdmin(userId, groupId);

    const group = await prisma.financialGroup.update({
      where: {
        id: groupId,
      },
      data: {
        ...(input.name ? { name: input.name } : {}),
        ...(input.type ? { type: groupTypeByInput[input.type] } : {}),
        ...(input.defaultCurrency ? { defaultCurrency: input.defaultCurrency } : {}),
      },
      include: {
        members: {
          where: {
            status: MemberStatus.ACTIVE,
          },
          include: memberInclude,
        },
      },
    });

    return serializeGroup(group);
  },

  async deleteGroup(userId: string, groupId: string) {
    await requireGroupOwner(userId, groupId);

    const dependencyCounts = await Promise.all([
      prisma.transaction.count({ where: { groupId } }),
      prisma.goal.count({ where: { groupId } }),
      prisma.budget.count({ where: { groupId } }),
      prisma.category.count({ where: { groupId, isDefault: false } }),
      prisma.paymentMethod.count({ where: { groupId } }),
    ]);

    if (dependencyCounts.some((count) => count > 0)) {
      throw new AppError('Group cannot be deleted because it already has financial data', 409);
    }

    // Future version: prefer soft delete for groups after financial data retention rules are defined.
    await prisma.financialGroup.delete({
      where: {
        id: groupId,
      },
    });
  },

  async listMembers(userId: string, groupId: string) {
    await requireGroupMember(userId, groupId);

    const members = await prisma.groupMember.findMany({
      where: {
        groupId,
        status: {
          in: [MemberStatus.ACTIVE, MemberStatus.INVITED],
        },
      },
      include: memberInclude,
      orderBy: {
        createdAt: 'asc',
      },
    });

    return members.map(serializeMember);
  },

  async inviteMember(userId: string, groupId: string, input: InviteMemberInput) {
    await requireGroupAdmin(userId, groupId);

    const invitedUser = await prisma.user.findFirst({
      where: {
        email: input.email,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
      },
    });

    if (!invitedUser) {
      throw new AppError('User with this email was not found', 404);
    }

    const existingMember = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId: invitedUser.id,
      },
    });

    if (
      existingMember &&
      (existingMember.status === MemberStatus.ACTIVE ||
        existingMember.status === MemberStatus.INVITED)
    ) {
      throw new AppError('User is already a member or has a pending invite', 409);
    }

    const role = roleByInput[input.role];
    const member = existingMember
      ? await prisma.groupMember.update({
          where: {
            id: existingMember.id,
          },
          data: {
            role,
            status: MemberStatus.INVITED,
            joinedAt: null,
          },
          include: memberInclude,
        })
      : await prisma.groupMember.create({
          data: {
            groupId,
            userId: invitedUser.id,
            role,
            status: MemberStatus.INVITED,
          },
          include: memberInclude,
        });

    return serializeMember(member);
  },

  async updateMemberRole(
    userId: string,
    groupId: string,
    memberId: string,
    input: UpdateMemberRoleInput,
  ) {
    await requireGroupOwner(userId, groupId);

    const member = await prisma.groupMember.findFirst({
      where: {
        id: memberId,
        groupId,
      },
    });

    if (!member) {
      throw new AppError('Member not found', 404);
    }

    if (member.role === MemberRole.OWNER) {
      throw new AppError('Owner role cannot be changed from this route', 409);
    }

    const updatedMember = await prisma.groupMember.update({
      where: {
        id: member.id,
      },
      data: {
        role: roleByInput[input.role],
      },
      include: memberInclude,
    });

    return serializeMember(updatedMember);
  },

  async removeMember(userId: string, groupId: string, memberId: string) {
    const actor = await requireGroupMember(userId, groupId);
    const member = await prisma.groupMember.findFirst({
      where: {
        id: memberId,
        groupId,
      },
    });

    if (!member) {
      throw new AppError('Member not found', 404);
    }

    const isSelfRemoval = member.userId === userId;
    const canManageMembers = actor.role === MemberRole.OWNER || actor.role === MemberRole.ADMIN;

    if (!isSelfRemoval && !canManageMembers) {
      throw new AppError('You do not have permission to manage members', 403);
    }

    if (isSelfRemoval && member.role === MemberRole.OWNER) {
      throw new AppError('Owner cannot leave the group before transferring ownership', 409);
    }

    if (actor.role === MemberRole.ADMIN && member.role === MemberRole.OWNER) {
      throw new AppError('Admin cannot remove the group owner', 403);
    }

    const removedMember = await prisma.groupMember.update({
      where: {
        id: member.id,
      },
      data: {
        status: MemberStatus.REMOVED,
      },
      include: memberInclude,
    });

    return serializeMember(removedMember);
  },
};
