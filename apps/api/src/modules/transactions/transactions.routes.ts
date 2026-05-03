import { Router } from 'express';

import {
  createTransaction,
  deleteTransaction,
  getTransaction,
  listTransactions,
  updateTransaction,
} from './transactions.controller.js';

export const transactionsRoutes = Router({ mergeParams: true });

transactionsRoutes.post('/', createTransaction);
transactionsRoutes.get('/', listTransactions);
transactionsRoutes.get('/:transactionId', getTransaction);
transactionsRoutes.patch('/:transactionId', updateTransaction);
transactionsRoutes.delete('/:transactionId', deleteTransaction);
