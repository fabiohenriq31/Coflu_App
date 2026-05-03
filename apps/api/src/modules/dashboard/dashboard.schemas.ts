import { z } from 'zod';

const uuidSchema = z.string().uuid();

export const dashboardParamsSchema = z.object({
  groupId: uuidSchema,
});

export const dashboardPeriodQuerySchema = z.object({
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2000).max(2100),
});

export const optionalDashboardPeriodQuerySchema = z
  .object({
    month: z.coerce.number().int().min(1).max(12).optional(),
    year: z.coerce.number().int().min(2000).max(2100).optional(),
  })
  .refine(
    (value) => (!value.month && !value.year) || (Boolean(value.month) && Boolean(value.year)),
    {
      message: 'Month and year must be provided together',
    },
  );

export type DashboardPeriodQuery = z.infer<typeof dashboardPeriodQuerySchema>;
export type OptionalDashboardPeriodQuery = z.infer<typeof optionalDashboardPeriodQuerySchema>;
