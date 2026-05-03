import { create } from 'zustand';

import { groupsService, type FinancialGroupSummary } from '../services/groups';

type GroupState = {
  groups: FinancialGroupSummary[];
  selectedGroup: FinancialGroupSummary | null;
  isLoadingGroups: boolean;
  loadGroups: () => Promise<FinancialGroupSummary[]>;
  setSelectedGroup: (group: FinancialGroupSummary | null) => void;
};

export const useGroupStore = create<GroupState>((set) => ({
  groups: [],
  selectedGroup: null,
  isLoadingGroups: false,

  async loadGroups() {
    set({ isLoadingGroups: true });

    try {
      const groups = await groupsService.listGroups();

      set((state) => ({
        groups,
        selectedGroup:
          state.selectedGroup && groups.some((group) => group.id === state.selectedGroup?.id)
            ? state.selectedGroup
            : (groups[0] ?? null),
      }));

      return groups;
    } finally {
      set({ isLoadingGroups: false });
    }
  },

  setSelectedGroup(group) {
    set({ selectedGroup: group });
  },
}));
