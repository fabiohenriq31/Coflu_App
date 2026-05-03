import type { GroupMember } from '@prisma/client';
import { MemberRole, MemberStatus } from '@prisma/client';

import { prisma } from '../../services/prisma.js';
import { AppError } from '../../utils/app-error.js';

type ActiveMember = Pick<GroupMember, 'id' | 'groupId' | 'userId' | 'role' | 'status'>;

export const isActiveGroupMember = async (userId: string, groupId: string) => {
  const member = await prisma.groupMember.findFirst({
    where: {
      userId,
      groupId,
      status: MemberStatus.ACTIVE,
    },
    select: {
      id: true,
    },
  });

  return Boolean(member);
};

export const requireGroupMember = async (
  userId: string,
  groupId: string,
): Promise<ActiveMember> => {
  const member = await prisma.groupMember.findFirst({
    where: {
      userId,
      groupId,
      status: MemberStatus.ACTIVE,
    },
  });

  if (!member) {
    throw new AppError('Group not found or access denied', 404);
  }

  return member;
};

export const requireGroupAdmin = async (userId: string, groupId: string) => {
  const member = await requireGroupMember(userId, groupId);

  if (member.role !== MemberRole.OWNER && member.role !== MemberRole.ADMIN) {
    throw new AppError('You do not have permission to manage this group', 403);
  }

  return member;
};

export const requireGroupOwner = async (userId: string, groupId: string) => {
  const member = await requireGroupMember(userId, groupId);

  if (member.role !== MemberRole.OWNER) {
    throw new AppError('Only the group owner can perform this action', 403);
  }

  return member;
};
