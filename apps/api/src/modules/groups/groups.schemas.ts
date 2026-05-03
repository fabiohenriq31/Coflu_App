import { z } from 'zod';

const groupTypeSchema = z.enum(['couple', 'family', 'friends', 'other']);
const manageableRoleSchema = z.enum(['admin', 'member', 'viewer']);
const currencySchema = z
  .string()
  .trim()
  .length(3, 'Currency must use ISO 4217 format')
  .transform((value) => value.toUpperCase());

export const groupParamsSchema = z.object({
  groupId: z.string().uuid('groupId must be a valid UUID'),
});

export const memberParamsSchema = groupParamsSchema.extend({
  memberId: z.string().uuid('memberId must be a valid UUID'),
});

export const acceptInviteSchema = z
  .object({
    code: z.string().trim().min(6).max(12).toUpperCase().optional(),
    groupId: z.string().uuid('groupId must be a valid UUID').optional(),
  })
  .refine((value) => Boolean(value.code || value.groupId), {
    message: 'code or groupId must be provided',
  });

export const createGroupSchema = z.object({
  name: z.string().trim().min(2, 'Name must have at least 2 characters'),
  type: groupTypeSchema,
  defaultCurrency: currencySchema.default('BRL'),
});

export const updateGroupSchema = z
  .object({
    name: z.string().trim().min(2, 'Name must have at least 2 characters').optional(),
    type: groupTypeSchema.optional(),
    defaultCurrency: currencySchema.optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field must be provided',
  });

export const inviteMemberSchema = z.object({
  email: z.string().trim().email('Email must be valid').toLowerCase(),
  role: manageableRoleSchema.default('member'),
});

export const updateMemberRoleSchema = z.object({
  role: manageableRoleSchema,
});

export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type UpdateGroupInput = z.infer<typeof updateGroupSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;
export type AcceptInviteInput = z.infer<typeof acceptInviteSchema>;
