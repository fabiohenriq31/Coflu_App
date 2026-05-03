import { z } from 'zod';

const categoryTypeSchema = z.enum(['income', 'expense']);
const colorSchema = z
  .string()
  .trim()
  .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color');

export const categoryParamsSchema = z.object({
  groupId: z.string().uuid('groupId must be a valid UUID'),
});

export const categoryItemParamsSchema = categoryParamsSchema.extend({
  categoryId: z.string().uuid('categoryId must be a valid UUID'),
});

export const createCategorySchema = z.object({
  name: z.string().trim().min(2, 'Name must have at least 2 characters'),
  type: categoryTypeSchema,
  icon: z.string().trim().min(1).optional(),
  color: colorSchema.optional(),
});

export const updateCategorySchema = z
  .object({
    name: z.string().trim().min(2, 'Name must have at least 2 characters').optional(),
    icon: z.string().trim().min(1).optional(),
    color: colorSchema.optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field must be provided',
  });

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
