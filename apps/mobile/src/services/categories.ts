import { api } from './api';

export type Category = {
  id: string;
  groupId: string | null;
  name: string;
  type: 'income' | 'expense';
  icon: string | null;
  color: string | null;
  isDefault: boolean;
};

export const categoriesService = {
  async listCategories(groupId: string) {
    const response = await api.get<{ categories: Category[] }>(`/groups/${groupId}/categories`);

    return response.data.categories;
  },
};
