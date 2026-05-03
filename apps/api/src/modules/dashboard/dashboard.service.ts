import { TransactionStatus, TransactionType, type Prisma } from '@prisma/client';

import { prisma } from '../../services/prisma.js';
import { requireGroupMember } from '../groups/groups.permissions.js';
import type { DashboardPeriodQuery, OptionalDashboardPeriodQuery } from './dashboard.schemas.js';

const toMoneyNumber = (value: unknown) => {
  if (!value) {
    return 0;
  }

  return Number(value.toString());
};

const buildDateFilter = (query: OptionalDashboardPeriodQuery) => {
  if (!query.month || !query.year) {
    return undefined;
  }

  return {
    gte: new Date(Date.UTC(query.year, query.month - 1, 1)),
    lt: new Date(Date.UTC(query.year, query.month, 1)),
  };
};

const buildVisibleTransactionsWhere = (
  userId: string,
  groupId: string,
  query: OptionalDashboardPeriodQuery = {},
): Prisma.TransactionWhereInput => ({
  groupId,
  status: TransactionStatus.CONFIRMED,
  ...(buildDateFilter(query) ? { date: buildDateFilter(query) } : {}),
  OR: [{ isPrivate: false }, { userId }],
});

export const dashboardService = {
  async getSummary(userId: string, groupId: string, query: DashboardPeriodQuery) {
    await requireGroupMember(userId, groupId);

    const totalsByType = await prisma.transaction.groupBy({
      by: ['type'],
      where: buildVisibleTransactionsWhere(userId, groupId, query),
      _sum: {
        amount: true,
      },
    });

    const income = toMoneyNumber(
      totalsByType.find((total) => total.type === TransactionType.INCOME)?._sum.amount,
    );
    const expense = toMoneyNumber(
      totalsByType.find((total) => total.type === TransactionType.EXPENSE)?._sum.amount,
    );

    return {
      income,
      expense,
      balance: income - expense,
    };
  },

  async getCategories(userId: string, groupId: string, query: OptionalDashboardPeriodQuery) {
    await requireGroupMember(userId, groupId);

    const totalsByCategory = await prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        ...buildVisibleTransactionsWhere(userId, groupId, query),
        type: TransactionType.EXPENSE,
        categoryId: {
          not: null,
        },
      },
      _sum: {
        amount: true,
      },
      orderBy: {
        _sum: {
          amount: 'desc',
        },
      },
    });

    const categoryIds = totalsByCategory
      .map((total) => total.categoryId)
      .filter((categoryId): categoryId is string => Boolean(categoryId));

    const categories = await prisma.category.findMany({
      where: {
        id: {
          in: categoryIds,
        },
      },
      select: {
        id: true,
        name: true,
      },
    });
    const categoryNameById = new Map(categories.map((category) => [category.id, category.name]));

    return totalsByCategory
      .filter((total) => total.categoryId)
      .map((total) => ({
        categoryId: total.categoryId,
        name: categoryNameById.get(total.categoryId ?? '') ?? 'Sem categoria',
        total: toMoneyNumber(total._sum.amount),
      }));
  },

  async getMembers(userId: string, groupId: string, query: OptionalDashboardPeriodQuery) {
    await requireGroupMember(userId, groupId);

    const totalsByMember = await prisma.transactionSplit.groupBy({
      by: ['userId'],
      where: {
        transaction: {
          ...buildVisibleTransactionsWhere(userId, groupId, query),
          type: TransactionType.EXPENSE,
        },
      },
      _sum: {
        amount: true,
      },
      orderBy: {
        _sum: {
          amount: 'desc',
        },
      },
    });

    const userIds = totalsByMember.map((total) => total.userId);
    const users = await prisma.user.findMany({
      where: {
        id: {
          in: userIds,
        },
      },
      select: {
        id: true,
        name: true,
      },
    });
    const userNameById = new Map(users.map((user) => [user.id, user.name]));

    return totalsByMember.map((total) => ({
      userId: total.userId,
      name: userNameById.get(total.userId) ?? 'Usuario removido',
      total: toMoneyNumber(total._sum.amount),
    }));
  },
};
