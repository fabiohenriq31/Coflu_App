import { CategoryType } from '@prisma/client';

import { prisma } from '../../services/prisma.js';
import { requireGroupMember } from '../groups/groups.permissions.js';

const defaultCategories = [
  { name: 'Alimentacao', type: CategoryType.EXPENSE, icon: 'utensils', color: '#EF4444' },
  { name: 'Moradia', type: CategoryType.EXPENSE, icon: 'home', color: '#4D76FD' },
  { name: 'Transporte', type: CategoryType.EXPENSE, icon: 'car', color: '#4EBAA4' },
  { name: 'Lazer', type: CategoryType.EXPENSE, icon: 'sparkles', color: '#8B5CF6' },
  { name: 'Salario', type: CategoryType.INCOME, icon: 'briefcase', color: '#4EBAA4' },
  { name: 'Outras receitas', type: CategoryType.INCOME, icon: 'plus', color: '#4D76FD' },
];

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

export const categoriesService = {
  async listCategories(userId: string, groupId: string) {
    await requireGroupMember(userId, groupId);

    const existingGroupCategories = await prisma.category.count({
      where: {
        groupId,
      },
    });

    if (existingGroupCategories === 0) {
      await prisma.category.createMany({
        data: defaultCategories.map((category) => ({
          ...category,
          groupId,
          isDefault: true,
        })),
        skipDuplicates: true,
      });
    }

    const categories = await prisma.category.findMany({
      where: {
        OR: [{ groupId }, { groupId: null }],
      },
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
    });

    return categories.map(serializeCategory);
  },
};
