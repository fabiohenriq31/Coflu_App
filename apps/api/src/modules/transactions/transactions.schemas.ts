import { z } from 'zod';

const uuidSchema = z.string().uuid();
const transactionTypeSchema = z.enum(['income', 'expense', 'transfer']);
const amountSchema = z.coerce.number().positive('Amount must be greater than zero');
const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must use YYYY-MM-DD format')
  .transform((value) => new Date(`${value}T00:00:00.000Z`))
  .refine((value) => !Number.isNaN(value.getTime()), 'Date must be valid');

const splitSchema = z.object({
  userId: uuidSchema,
  amount: amountSchema,
});

export const transactionParamsSchema = z.object({
  groupId: uuidSchema,
  transactionId: uuidSchema,
});

export const groupTransactionsParamsSchema = z.object({
  groupId: uuidSchema,
});

export const createTransactionSchema = z.object({
  type: transactionTypeSchema,
  amount: amountSchema,
  categoryId: uuidSchema,
  paymentMethodId: uuidSchema.optional(),
  description: z.string().trim().max(240).optional(),
  date: dateSchema,
  isPrivate: z.boolean().default(false),
  splits: z.array(splitSchema).min(1).optional(),
});

export const updateTransactionSchema = z
  .object({
    amount: amountSchema.optional(),
    categoryId: uuidSchema.optional(),
    paymentMethodId: uuidSchema.nullable().optional(),
    description: z.string().trim().max(240).nullable().optional(),
    date: dateSchema.optional(),
    splits: z.array(splitSchema).min(1).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field must be provided',
  });

export const transactionQuerySchema = z
  .object({
    month: z.coerce.number().int().min(1).max(12).optional(),
    year: z.coerce.number().int().min(2000).max(2100).optional(),
    type: transactionTypeSchema.optional(),
    userId: uuidSchema.optional(),
  })
  .refine((value) => !value.month || Boolean(value.year), {
    path: ['year'],
    message: 'Year is required when month is provided',
  });

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type TransactionQueryInput = z.infer<typeof transactionQuerySchema>;
