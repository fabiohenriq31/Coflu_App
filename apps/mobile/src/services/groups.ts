import { api } from './api';

export type FinancialGroupSummary = {
  id: string;
  name: string;
  type: 'couple' | 'family' | 'friends' | 'other';
  ownerUserId: string;
  defaultCurrency: string;
  membership: {
    id: string;
    role: 'owner' | 'admin' | 'member' | 'viewer';
    status: 'active' | 'invited' | 'removed';
  };
};

export const groupsService = {
  async listGroups() {
    const response = await api.get<{ groups: FinancialGroupSummary[] }>('/groups');

    return response.data.groups;
  },
};
