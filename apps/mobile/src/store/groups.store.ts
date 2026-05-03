import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import {
  groupsService,
  type CreateGroupPayload,
  type FinancialGroupSummary,
} from '../services/groups';

type GroupsState = {
  groups: FinancialGroupSummary[];
  activeGroup: FinancialGroupSummary | null;
  isLoadingGroups: boolean;
  fetchGroups: () => Promise<FinancialGroupSummary[]>;
  createGroup: (payload: CreateGroupPayload) => Promise<FinancialGroupSummary>;
  setActiveGroup: (group: FinancialGroupSummary | null) => void;
  resetGroups: () => void;
};

const summarizeGroup = (group: Awaited<ReturnType<typeof groupsService.createGroup>>) => {
  const ownerMember = group.members.find((member) => member.role === 'owner');

  return {
    id: group.id,
    name: group.name,
    type: group.type,
    ownerUserId: group.ownerUserId,
    defaultCurrency: group.defaultCurrency,
    membership: {
      id: ownerMember?.id ?? '',
      role: ownerMember?.role ?? 'owner',
      status: ownerMember?.status ?? 'active',
    },
  } satisfies FinancialGroupSummary;
};

export const useGroupsStore = create<GroupsState>()(
  persist(
    (set, get) => ({
      groups: [],
      activeGroup: null,
      isLoadingGroups: false,

      async fetchGroups() {
        set({ isLoadingGroups: true });

        try {
          const groups = await groupsService.listGroups();
          const currentActiveGroup = get().activeGroup;
          const nextActiveGroup =
            currentActiveGroup && groups.some((group) => group.id === currentActiveGroup.id)
              ? (groups.find((group) => group.id === currentActiveGroup.id) ?? currentActiveGroup)
              : (groups[0] ?? null);

          set({
            groups,
            activeGroup: nextActiveGroup,
          });

          return groups;
        } finally {
          set({ isLoadingGroups: false });
        }
      },

      async createGroup(payload) {
        set({ isLoadingGroups: true });

        try {
          const group = summarizeGroup(await groupsService.createGroup(payload));

          set((state) => ({
            groups: [group, ...state.groups.filter((item) => item.id !== group.id)],
            activeGroup: group,
          }));

          return group;
        } finally {
          set({ isLoadingGroups: false });
        }
      },

      setActiveGroup(group) {
        set({ activeGroup: group });
      },

      resetGroups() {
        set({ groups: [], activeGroup: null, isLoadingGroups: false });
      },
    }),
    {
      name: 'coflu-groups',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        activeGroup: state.activeGroup,
      }),
    },
  ),
);
