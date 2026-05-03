import { create } from 'zustand';

import {
  transactionsService,
  type CreateTransactionPayload,
  type Transaction,
  type TransactionFilters,
  type UpdateTransactionPayload,
} from '../services/transactions';

type TransactionsState = {
  transactions: Transaction[];
  isLoadingTransactions: boolean;
  fetchTransactions: (groupId: string, filters: TransactionFilters) => Promise<Transaction[]>;
  createTransaction: (groupId: string, payload: CreateTransactionPayload) => Promise<Transaction>;
  updateTransaction: (
    groupId: string,
    transactionId: string,
    payload: UpdateTransactionPayload,
  ) => Promise<Transaction>;
  deleteTransaction: (groupId: string, transactionId: string) => Promise<void>;
  resetTransactions: () => void;
};

export const useTransactionsStore = create<TransactionsState>((set) => ({
  transactions: [],
  isLoadingTransactions: false,

  async fetchTransactions(groupId, filters) {
    set({ isLoadingTransactions: true });

    try {
      const transactions = await transactionsService.listTransactions(groupId, filters);
      set({ transactions });

      return transactions;
    } finally {
      set({ isLoadingTransactions: false });
    }
  },

  async createTransaction(groupId, payload) {
    const transaction = await transactionsService.createTransaction(groupId, payload);

    set((state) => ({
      transactions: [transaction, ...state.transactions],
    }));

    return transaction;
  },

  async updateTransaction(groupId, transactionId, payload) {
    const transaction = await transactionsService.updateTransaction(
      groupId,
      transactionId,
      payload,
    );

    set((state) => ({
      transactions: state.transactions.map((item) =>
        item.id === transaction.id ? transaction : item,
      ),
    }));

    return transaction;
  },

  async deleteTransaction(groupId, transactionId) {
    await transactionsService.deleteTransaction(groupId, transactionId);

    set((state) => ({
      transactions: state.transactions.filter((transaction) => transaction.id !== transactionId),
    }));
  },

  resetTransactions() {
    set({ transactions: [], isLoadingTransactions: false });
  },
}));
