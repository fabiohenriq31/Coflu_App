import {
  MemberRole,
  MemberStatus,
  SplitStatus,
  TransactionSource,
  TransactionStatus,
  TransactionType,
  type Category,
  type Prisma,
  type Transaction,
  type TransactionSplit,
  type User,
} from '@prisma/client';

import { prisma } from '../../services/prisma.js';
import { AppError } from '../../utils/app-error.js';
import { requireGroupMember } from '../groups/groups.permissions.js';
import type {
  CreateTransactionInput,
  TransactionQueryInput,
  UpdateTransactionInput,
} from './transactions.schemas.js';

const typeByInput: Record<CreateTransactionInput['type'], TransactionType> = {
  income: TransactionType.INCOME,
  expense: TransactionType.EXPENSE,
  transfer: TransactionType.TRANSFER,
};

const typeByPrisma: Record<TransactionType, 'income' | 'expense' | 'transfer'> = {
  INCOME: 'income',
  EXPENSE: 'expense',
  TRANSFER: 'transfer',
};

const statusByPrisma: Record<TransactionStatus, 'pending' | 'confirmed' | 'cancelled'> = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
};

const sourceByPrisma: Record<
  TransactionSource,
  'manual' | 'whatsapp' | 'shortcut' | 'open_finance'
> = {
  MANUAL: 'manual',
  WHATSAPP: 'whatsapp',
  SHORTCUT: 'shortcut',
  OPEN_FINANCE: 'open_finance',
};

const splitStatusByPrisma: Record<SplitStatus, 'pending' | 'confirmed' | 'cancelled'> = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
};

type TransactionWithRelations = Transaction & {
  category: Pick<Category, 'id' | 'name' | 'type' | 'icon' | 'color'> | null;
  user: Pick<User, 'id' | 'name' | 'email' | 'avatarUrl'>;
  splits: Array<
    TransactionSplit & {
      user: Pick<User, 'id' | 'name' | 'email' | 'avatarUrl'>;
    }
  >;
};

const transactionInclude = {
  category: {
    select: {
      id: true,
      name: true,
      type: true,
      icon: true,
      color: true,
    },
  },
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
    },
  },
  splits: {
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  },
} satisfies Prisma.TransactionInclude;

const toCents = (value: number) => Math.round(value * 100);
const toDecimalString = (value: { toString(): string } | number | string) => value.toString();

const ensureSplitTotalMatchesAmount = (
  amount: number,
  splits: Array<{ userId: string; amount: number }>,
) => {
  const amountInCents = toCents(amount);
  const splitTotalInCents = splits.reduce((total, split) => total + toCents(split.amount), 0);

  if (amountInCents !== splitTotalInCents) {
    throw new AppError('Split amounts must match transaction amount', 400);
  }
};

const buildDefaultSplits = (userId: string, amount: number) => [
  {
    userId,
    amount,
  },
];

const calculatePercent = (splitAmount: number, totalAmount: number) =>
  Number(((splitAmount / totalAmount) * 100).toFixed(2));

const validateGroupCategory = async (groupId: string, categoryId: string) => {
  const category = await prisma.category.findFirst({
    where: {
      id: categoryId,
      OR: [{ groupId }, { groupId: null }],
    },
    select: {
      id: true,
    },
  });

  if (!category) {
    throw new AppError('Category not found for this group', 404);
  }
};

const validatePaymentMethod = async (groupId: string, paymentMethodId?: string | null) => {
  if (!paymentMethodId) {
    return;
  }

  const paymentMethod = await prisma.paymentMethod.findFirst({
    where: {
      id: paymentMethodId,
      groupId,
    },
    select: {
      id: true,
    },
  });

  if (!paymentMethod) {
    throw new AppError('Payment method not found for this group', 404);
  }
};

const validateSplitMembers = async (
  groupId: string,
  splits: Array<{ userId: string; amount: number }>,
) => {
  const uniqueUserIds = [...new Set(splits.map((split) => split.userId))];

  if (uniqueUserIds.length !== splits.length) {
    throw new AppError('Each member can appear only once in splits', 400);
  }

  const activeMembers = await prisma.groupMember.findMany({
    where: {
      groupId,
      userId: {
        in: uniqueUserIds,
      },
      status: MemberStatus.ACTIVE,
    },
    select: {
      userId: true,
    },
  });

  if (activeMembers.length !== uniqueUserIds.length) {
    throw new AppError('All split users must be active members of the group', 400);
  }
};

const buildSplitCreateManyData = (
  amount: number,
  splits: Array<{ userId: string; amount: number }>,
) =>
  splits.map((split) => ({
    userId: split.userId,
    amount: split.amount,
    percent: calculatePercent(split.amount, amount),
    status: SplitStatus.CONFIRMED,
  }));

const rebalanceExistingSplits = (
  amount: number,
  currentSplits: Array<{ userId: string; amount: { toString(): string } | number | string }>,
) => {
  const totalInCents = toCents(amount);
  const currentTotalInCents = currentSplits.reduce(
    (total, split) => total + toCents(Number.parseFloat(toDecimalString(split.amount))),
    0,
  );
  let assignedInCents = 0;

  return currentSplits.map((split, index) => {
    if (index === currentSplits.length - 1) {
      return {
        userId: split.userId,
        amount: (totalInCents - assignedInCents) / 100,
      };
    }

    const splitAmountInCents = toCents(Number.parseFloat(toDecimalString(split.amount)));
    const nextSplitAmountInCents = Math.round(
      (splitAmountInCents / currentTotalInCents) * totalInCents,
    );
    assignedInCents += nextSplitAmountInCents;

    return {
      userId: split.userId,
      amount: nextSplitAmountInCents / 100,
    };
  });
};

const serializeTransaction = (transaction: TransactionWithRelations) => ({
  id: transaction.id,
  groupId: transaction.groupId,
  userId: transaction.userId,
  type: typeByPrisma[transaction.type],
  amount: toDecimalString(transaction.amount),
  categoryId: transaction.categoryId,
  paymentMethodId: transaction.paymentMethodId,
  description: transaction.description,
  date: transaction.date,
  status: statusByPrisma[transaction.status],
  source: sourceByPrisma[transaction.source],
  isPrivate: transaction.isPrivate,
  createdAt: transaction.createdAt,
  updatedAt: transaction.updatedAt,
  category: transaction.category,
  creator: transaction.user,
  splits: transaction.splits.map((split) => ({
    id: split.id,
    transactionId: split.transactionId,
    userId: split.userId,
    amount: toDecimalString(split.amount),
    percent: split.percent ? toDecimalString(split.percent) : null,
    status: splitStatusByPrisma[split.status],
    createdAt: split.createdAt,
    updatedAt: split.updatedAt,
    user: split.user,
  })),
});

const getVisibleTransaction = async (groupId: string, transactionId: string, userId: string) => {
  const transaction = await prisma.transaction.findFirst({
    where: {
      id: transactionId,
      groupId,
      OR: [{ isPrivate: false }, { userId }],
    },
    include: transactionInclude,
  });

  if (!transaction) {
    throw new AppError('Transaction not found or access denied', 404);
  }

  return transaction;
};

const ensureCanManageTransaction = (
  actor: Awaited<ReturnType<typeof requireGroupMember>>,
  transaction: Pick<Transaction, 'userId'>,
) => {
  if (actor.role === MemberRole.VIEWER) {
    throw new AppError('Viewers cannot manage transactions', 403);
  }

  const isCreator = transaction.userId === actor.userId;
  const isAdmin = actor.role === MemberRole.OWNER || actor.role === MemberRole.ADMIN;

  if (!isCreator && !isAdmin) {
    throw new AppError('You do not have permission to manage this transaction', 403);
  }
};

const buildDateFilter = (query: TransactionQueryInput) => {
  if (!query.year) {
    return undefined;
  }

  const startMonth = query.month ? query.month - 1 : 0;
  const endMonth = query.month ? query.month : 12;

  return {
    gte: new Date(Date.UTC(query.year, startMonth, 1)),
    lt: new Date(Date.UTC(query.year, endMonth, 1)),
  };
};

export const transactionsService = {
  async createTransaction(userId: string, groupId: string, input: CreateTransactionInput) {
    await requireGroupMember(userId, groupId);
    await validateGroupCategory(groupId, input.categoryId);
    await validatePaymentMethod(groupId, input.paymentMethodId);

    const splits = input.splits ?? buildDefaultSplits(userId, input.amount);
    ensureSplitTotalMatchesAmount(input.amount, splits);
    await validateSplitMembers(groupId, splits);

    const transaction = await prisma.transaction.create({
      data: {
        groupId,
        userId,
        type: typeByInput[input.type],
        amount: input.amount,
        categoryId: input.categoryId,
        paymentMethodId: input.paymentMethodId,
        description: input.description,
        date: input.date,
        isPrivate: input.isPrivate,
        status: TransactionStatus.CONFIRMED,
        source: TransactionSource.MANUAL,
        splits: {
          create: buildSplitCreateManyData(input.amount, splits),
        },
      },
      include: transactionInclude,
    });

    return serializeTransaction(transaction);
  },

  async listTransactions(userId: string, groupId: string, query: TransactionQueryInput) {
    await requireGroupMember(userId, groupId);

    const transactions = await prisma.transaction.findMany({
      where: {
        groupId,
        ...(query.type ? { type: typeByInput[query.type] } : {}),
        ...(query.userId ? { userId: query.userId } : {}),
        ...(buildDateFilter(query) ? { date: buildDateFilter(query) } : {}),
        OR: [{ isPrivate: false }, { userId }],
      },
      include: transactionInclude,
      orderBy: {
        date: 'desc',
      },
    });

    return transactions.map(serializeTransaction);
  },

  async getTransaction(userId: string, groupId: string, transactionId: string) {
    await requireGroupMember(userId, groupId);
    const transaction = await getVisibleTransaction(groupId, transactionId, userId);

    return serializeTransaction(transaction);
  },

  async updateTransaction(
    userId: string,
    groupId: string,
    transactionId: string,
    input: UpdateTransactionInput,
  ) {
    const actor = await requireGroupMember(userId, groupId);
    const currentTransaction = await getVisibleTransaction(groupId, transactionId, userId);
    ensureCanManageTransaction(actor, currentTransaction);

    if (input.categoryId) {
      await validateGroupCategory(groupId, input.categoryId);
    }

    if (input.paymentMethodId !== undefined) {
      await validatePaymentMethod(groupId, input.paymentMethodId);
    }

    const nextAmount =
      input.amount ?? Number.parseFloat(toDecimalString(currentTransaction.amount));
    const nextSplits = input.splits
      ? input.splits
      : input.amount !== undefined
        ? rebalanceExistingSplits(input.amount, currentTransaction.splits)
        : currentTransaction.splits.map((split) => ({
            userId: split.userId,
            amount: Number.parseFloat(toDecimalString(split.amount)),
          }));

    ensureSplitTotalMatchesAmount(nextAmount, nextSplits);
    await validateSplitMembers(groupId, nextSplits);

    const transaction = await prisma.$transaction(async (database) => {
      const shouldReplaceSplits = input.splits || input.amount !== undefined;

      if (shouldReplaceSplits) {
        await database.transactionSplit.deleteMany({
          where: {
            transactionId,
          },
        });
      }

      return database.transaction.update({
        where: {
          id: transactionId,
        },
        data: {
          ...(input.amount !== undefined ? { amount: input.amount } : {}),
          ...(input.categoryId ? { categoryId: input.categoryId } : {}),
          ...(input.paymentMethodId !== undefined
            ? { paymentMethodId: input.paymentMethodId }
            : {}),
          ...(input.description !== undefined ? { description: input.description } : {}),
          ...(input.date ? { date: input.date } : {}),
          ...(shouldReplaceSplits
            ? {
                splits: {
                  create: buildSplitCreateManyData(nextAmount, nextSplits),
                },
              }
            : {}),
        },
        include: transactionInclude,
      });
    });

    return serializeTransaction(transaction);
  },

  async deleteTransaction(userId: string, groupId: string, transactionId: string) {
    const actor = await requireGroupMember(userId, groupId);
    const transaction = await getVisibleTransaction(groupId, transactionId, userId);
    ensureCanManageTransaction(actor, transaction);

    // Future version: use soft delete once audit and financial retention rules are finalized.
    await prisma.transaction.delete({
      where: {
        id: transactionId,
      },
    });
  },
};
