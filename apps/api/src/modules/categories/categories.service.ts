import { CategoryType } from '@prisma/client';

import { prisma } from '../../services/prisma.js';
import { AppError } from '../../utils/app-error.js';
import { requireGroupAdmin, requireGroupMember } from '../groups/groups.permissions.js';
import type { CreateCategoryInput, UpdateCategoryInput } from './categories.schemas.js';

export const defaultCategories = [
  { name: 'Alimentação', type: CategoryType.EXPENSE, icon: 'utensils', color: '#EF4444' },
  { name: 'Transporte', type: CategoryType.EXPENSE, icon: 'car', color: '#4D76FD' },
  { name: 'Moradia', type: CategoryType.EXPENSE, icon: 'home', color: '#4EBAA4' },
  { name: 'Lazer', type: CategoryType.EXPENSE, icon: 'sparkles', color: '#8B5CF6' },
  { name: 'Saúde', type: CategoryType.EXPENSE, icon: 'heart-pulse', color: '#F43F5E' },
  { name: 'Educação', type: CategoryType.EXPENSE, icon: 'graduation-cap', color: '#6366F1' },
  { name: 'Compras', type: CategoryType.EXPENSE, icon: 'shopping-bag', color: '#F59E0B' },
  { name: 'Assinaturas', type: CategoryType.EXPENSE, icon: 'repeat', color: '#14B8A6' },
  { name: 'Outros', type: CategoryType.EXPENSE, icon: 'more-horizontal', color: '#6B7280' },
  { name: 'Salário', type: CategoryType.INCOME, icon: 'briefcase', color: '#4EBAA4' },
  { name: 'Freelance', type: CategoryType.INCOME, icon: 'laptop', color: '#4D76FD' },
  { name: 'Investimentos', type: CategoryType.INCOME, icon: 'trending-up', color: '#22C55E' },
  { name: 'Presentes', type: CategoryType.INCOME, icon: 'gift', color: '#A855F7' },
  { name: 'Outros', type: CategoryType.INCOME, icon: 'plus', color: '#6B7280' },
];

const typeByInput: Record<CreateCategoryInput['type'], CategoryType> = {
  income: CategoryType.INCOME,
  expense: CategoryType.EXPENSE,
};

const typeByPrisma: Record<CategoryType, 'income' | 'expense'> = {
  INCOME: 'income',
  EXPENSE: 'expense',
};

const serializeCategory = (category: {
  id: string;
  groupId: string | null;
  name: string;
  type: CategoryType;
  icon: string | null;
  color: string | null;
  isDefault: boolean;
}) => ({
  id: category.id,
  groupId: category.groupId,
  name: category.name,
  type: typeByPrisma[category.type],
  icon: category.icon,
  color: category.color,
  isDefault: category.isDefault,
});

export const createDefaultCategoriesForGroup = async (
  groupId: string,
  database: Pick<typeof prisma, 'category'> = prisma,
) => {
  await database.category.createMany({
    data: defaultCategories.map((category) => ({
      ...category,
      groupId,
      isDefault: true,
    })),
    skipDuplicates: true,
  });
};

export const categoriesService = {
  async ensureDefaultCategories(groupId: string) {
    const existingDefaultCategories = await prisma.category.count({
      where: {
        groupId,
        isDefault: true,
      },
    });

    if (existingDefaultCategories < defaultCategories.length) {
      await createDefaultCategoriesForGroup(groupId);
    }
  },

  async listCategories(userId: string, groupId: string) {
    await requireGroupMember(userId, groupId);
    await this.ensureDefaultCategories(groupId);

    const categories = await prisma.category.findMany({
      where: {
        groupId,
      },
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
    });

    const serializedCategories = categories.map(serializeCategory);

    return {
      categories: serializedCategories,
      income: serializedCategories.filter((category) => category.type === 'income'),
      expense: serializedCategories.filter((category) => category.type === 'expense'),
    };
  },

  async createCategory(userId: string, groupId: string, input: CreateCategoryInput) {
    await requireGroupMember(userId, groupId);

    const category = await prisma.category.create({
      data: {
        groupId,
        name: input.name,
        type: typeByInput[input.type],
        icon: input.icon ?? null,
        color: input.color ?? null,
        isDefault: false,
      },
    });

    return serializeCategory(category);
  },

  async updateCategory(
    userId: string,
    groupId: string,
    categoryId: string,
    input: UpdateCategoryInput,
  ) {
    await requireGroupAdmin(userId, groupId);

    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        groupId,
      },
    });

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    const updatedCategory = await prisma.category.update({
      where: {
        id: category.id,
      },
      data: {
        ...(input.name ? { name: input.name } : {}),
        ...(input.icon ? { icon: input.icon } : {}),
        ...(input.color ? { color: input.color } : {}),
      },
    });

    return serializeCategory(updatedCategory);
  },

  async deleteCategory(userId: string, groupId: string, categoryId: string) {
    await requireGroupAdmin(userId, groupId);

    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        groupId,
      },
    });

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    if (category.isDefault) {
      throw new AppError('Default categories cannot be deleted', 409);
    }

    const linkedTransactions = await prisma.transaction.count({
      where: {
        groupId,
        categoryId,
      },
    });

    if (linkedTransactions > 0) {
      throw new AppError('Category cannot be deleted because it has linked transactions', 409);
    }

    await prisma.category.delete({
      where: {
        id: category.id,
      },
    });
  },
};
