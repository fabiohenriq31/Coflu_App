import { api } from './api';

export type DashboardSummary = {
  income: number;
  expense: number;
  balance: number;
};

export type DashboardCategory = {
  categoryId: string;
  name: string;
  total: number;
};

export type DashboardMember = {
  userId: string;
  name: string;
  total: number;
};

export const dashboardService = {
  async getSummary(groupId: string, month: number, year: number) {
    const response = await api.get<DashboardSummary>(`/groups/${groupId}/dashboard/summary`, {
      params: { month, year },
    });

    return response.data;
  },

  async getCategories(groupId: string, month: number, year: number) {
    const response = await api.get<DashboardCategory[]>(`/groups/${groupId}/dashboard/categories`, {
      params: { month, year },
    });

    return response.data;
  },

  async getMembers(groupId: string, month: number, year: number) {
    const response = await api.get<DashboardMember[]>(`/groups/${groupId}/dashboard/members`, {
      params: { month, year },
    });

    return response.data;
  },
};
