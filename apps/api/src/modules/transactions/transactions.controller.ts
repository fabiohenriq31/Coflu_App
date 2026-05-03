import type { RequestHandler } from 'express';

import { AppError } from '../../utils/app-error.js';
import {
  createTransactionSchema,
  groupTransactionsParamsSchema,
  transactionParamsSchema,
  transactionQuerySchema,
  updateTransactionSchema,
} from './transactions.schemas.js';
import { transactionsService } from './transactions.service.js';

const getAuthenticatedUserId = (request: Parameters<RequestHandler>[0]) => {
  if (!request.user) {
    throw new AppError('Authentication token is required', 401);
  }

  return request.user.id;
};

export const createTransaction: RequestHandler = async (request, response, next) => {
  try {
    const userId = getAuthenticatedUserId(request);
    const { groupId } = groupTransactionsParamsSchema.parse(request.params);
    const input = createTransactionSchema.parse(request.body);
    const transaction = await transactionsService.createTransaction(userId, groupId, input);

    return response.status(201).json({ transaction });
  } catch (error) {
    return next(error);
  }
};

export const listTransactions: RequestHandler = async (request, response, next) => {
  try {
    const userId = getAuthenticatedUserId(request);
    const { groupId } = groupTransactionsParamsSchema.parse(request.params);
    const query = transactionQuerySchema.parse(request.query);
    const transactions = await transactionsService.listTransactions(userId, groupId, query);

    return response.status(200).json({ transactions });
  } catch (error) {
    return next(error);
  }
};

export const getTransaction: RequestHandler = async (request, response, next) => {
  try {
    const userId = getAuthenticatedUserId(request);
    const { groupId, transactionId } = transactionParamsSchema.parse(request.params);
    const transaction = await transactionsService.getTransaction(userId, groupId, transactionId);

    return response.status(200).json({ transaction });
  } catch (error) {
    return next(error);
  }
};

export const updateTransaction: RequestHandler = async (request, response, next) => {
  try {
    const userId = getAuthenticatedUserId(request);
    const { groupId, transactionId } = transactionParamsSchema.parse(request.params);
    const input = updateTransactionSchema.parse(request.body);
    const transaction = await transactionsService.updateTransaction(
      userId,
      groupId,
      transactionId,
      input,
    );

    return response.status(200).json({ transaction });
  } catch (error) {
    return next(error);
  }
};

export const deleteTransaction: RequestHandler = async (request, response, next) => {
  try {
    const userId = getAuthenticatedUserId(request);
    const { groupId, transactionId } = transactionParamsSchema.parse(request.params);

    await transactionsService.deleteTransaction(userId, groupId, transactionId);

    return response.status(204).send();
  } catch (error) {
    return next(error);
  }
};
