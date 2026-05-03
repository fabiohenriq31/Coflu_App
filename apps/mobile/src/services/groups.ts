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

export type GroupMember = {
  id: string;
  groupId: string;
  userId: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  status: 'active' | 'invited' | 'removed';
  joinedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  };
};

export type FinancialGroup = Omit<FinancialGroupSummary, 'membership'> & {
  members: GroupMember[];
};

export type CreateGroupPayload = {
  name: string;
  type: FinancialGroupSummary['type'];
  defaultCurrency: string;
};

export type UpdateGroupPayload = Partial<CreateGroupPayload>;

export type InviteMemberPayload = {
  email: string;
  role: 'admin' | 'member' | 'viewer';
};

export type GroupInviteCode = {
  groupId: string;
  code: string;
};

export type AcceptInvitePayload =
  | {
      code: string;
      groupId?: never;
    }
  | {
      code?: never;
      groupId: string;
    };

export const groupsService = {
  async listGroups() {
    const response = await api.get<{ groups: FinancialGroupSummary[] }>('/groups');

    return response.data.groups;
  },

  async createGroup(payload: CreateGroupPayload) {
    const response = await api.post<{ group: FinancialGroup }>('/groups', payload);

    return response.data.group;
  },

  async getGroup(groupId: string) {
    const response = await api.get<{ group: FinancialGroup }>(`/groups/${groupId}`);

    return response.data.group;
  },

  async updateGroup(groupId: string, payload: UpdateGroupPayload) {
    const response = await api.patch<{ group: FinancialGroup }>(`/groups/${groupId}`, payload);

    return response.data.group;
  },

  async listMembers(groupId: string) {
    const response = await api.get<{ members: GroupMember[] }>(`/groups/${groupId}/members`);

    return response.data.members;
  },

  async inviteMember(groupId: string, payload: InviteMemberPayload) {
    const response = await api.post<{ member: GroupMember }>(`/groups/${groupId}/invite`, payload);

    return response.data.member;
  },

  async getInviteCode(groupId: string) {
    const response = await api.get<{ invite: GroupInviteCode }>(`/groups/${groupId}/invite-code`);

    return response.data.invite;
  },

  async regenerateInviteCode(groupId: string) {
    const response = await api.post<{ invite: GroupInviteCode }>(
      `/groups/${groupId}/invite-code/regenerate`,
    );

    return response.data.invite;
  },

  async acceptInvite(payload: AcceptInvitePayload) {
    const response = await api.post<{ member: GroupMember }>('/groups/invitations/accept', payload);

    return response.data.member;
  },
};
