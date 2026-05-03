import { api } from './api';

export type TransactionType = 'income' | 'expense' | 'transfer';

export type Transaction = {
  id: string;
  groupId: string;
  userId: string;
  type: TransactionType;
  amount: string;
  categoryId: string | null;
  paymentMethodId: string | null;
  description: string | null;
  date: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  source: 'manual' | 'whatsapp' | 'shortcut' | 'open_finance';
  isPrivate: boolean;
  category: {
    id: string;
    name: string;
    type: 'INCOME' | 'EXPENSE';
    icon: string | null;
    color: string | null;
  } | null;
  creator: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  };
  splits: Array<{
    id: string;
    userId: string;
    amount: string;
    percent: string | null;
    status: 'pending' | 'confirmed' | 'cancelled';
  }>;
};

export type TransactionFilters = {
  month?: number;
  year?: number;
  type?: TransactionType;
  userId?: string;
};

export type CreateTransactionPayload = {
  type: TransactionType;
  amount: number;
  categoryId: string;
  paymentMethodId?: string;
  description: string;
  date: string;
  isPrivate: boolean;
};

export type UpdateTransactionPayload = Partial<
  Pick<
    CreateTransactionPayload,
    'amount' | 'categoryId' | 'paymentMethodId' | 'description' | 'date'
  >
>;

export const transactionsService = {
  async listTransactions(groupId: string, filters: TransactionFilters) {
    const response = await api.get<{ transactions: Transaction[] }>(
      `/groups/${groupId}/transactions`,
      {
        params: filters,
      },
    );

    return response.data.transactions;
  },

  async getTransaction(groupId: string, transactionId: string) {
    const response = await api.get<{ transaction: Transaction }>(
      `/groups/${groupId}/transactions/${transactionId}`,
    );

    return response.data.transaction;
  },

  async createTransaction(groupId: string, payload: CreateTransactionPayload) {
    const response = await api.post<{ transaction: Transaction }>(
      `/groups/${groupId}/transactions`,
      payload,
    );

    return response.data.transaction;
  },

  async updateTransaction(
    groupId: string,
    transactionId: string,
    payload: UpdateTransactionPayload,
  ) {
    const response = await api.patch<{ transaction: Transaction }>(
      `/groups/${groupId}/transactions/${transactionId}`,
      payload,
    );

    return response.data.transaction;
  },

  async deleteTransaction(groupId: string, transactionId: string) {
    await api.delete(`/groups/${groupId}/transactions/${transactionId}`);
  },
};
