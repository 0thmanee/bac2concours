import { z } from "zod";
import { STARTUP_STATUS } from "@/lib/constants";

// Startup status enum schema
export const startupStatusSchema = z.enum([
  STARTUP_STATUS.ACTIVE,
  STARTUP_STATUS.INACTIVE,
]);

export const createStartupSchema = z.object({
  name: z.string().min(2, "Name required"),
  description: z.string().optional(),
  industry: z.string().optional(),
  incubationStart: z.string().min(1, "Start date required"),
  incubationEnd: z.string().min(1, "End date required"),
  totalBudget: z.number().positive("Budget must be positive"),
  founderIds: z.array(z.string()).min(1, "At least one founder required"),
});

export const updateStartupSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  industry: z.string().optional(),
  incubationStart: z.string().optional(),
  incubationEnd: z.string().optional(),
  totalBudget: z.number().positive().optional(),
  status: startupStatusSchema.optional(),
  founderIds: z.array(z.string()).optional(),
});

export const startupQueryParamsSchema = z.object({
  search: z.string().optional(),
  status: startupStatusSchema.optional(),
});

export const startupFindAllOptionsSchema = startupQueryParamsSchema.extend({
  includeDeleted: z.boolean().optional(),
});

export const createStartupServiceInputSchema = createStartupSchema
  .omit({
    incubationStart: true,
    incubationEnd: true,
  })
  .extend({
    incubationStart: z.date(),
    incubationEnd: z.date(),
  });

export const updateStartupServiceInputSchema = updateStartupSchema
  .omit({
    incubationStart: true,
    incubationEnd: true,
  })
  .extend({
    incubationStart: z.date().optional(),
    incubationEnd: z.date().optional(),
  });

export const startupMetricsSchema = z.object({
  activeCount: z.number(),
  totalBudget: z.number(),
  totalSpent: z.number(),
  totalCount: z.number(),
  totalFounders: z.number(),
});

export const startupQueryOptionsSchema = startupQueryParamsSchema.extend({
  includeSpentBudgets: z.boolean().optional(),
});

export type CreateStartupInput = z.infer<typeof createStartupSchema>;
export type UpdateStartupInput = z.infer<typeof updateStartupSchema>;
export type StartupQueryParams = z.infer<typeof startupQueryParamsSchema>;
export type StartupStatusInput = z.infer<typeof startupStatusSchema>;
export type StartupMetrics = z.infer<typeof startupMetricsSchema>;
export type StartupFindAllOptions = z.infer<typeof startupFindAllOptionsSchema>;
export type CreateStartupServiceInput = z.infer<
  typeof createStartupServiceInputSchema
>;
export type UpdateStartupServiceInput = z.infer<
  typeof updateStartupServiceInputSchema
>;
export type StartupQueryOptions = z.infer<typeof startupQueryOptionsSchema>;

// Extended form data type that includes required founderIds for editing
export type StartupEditFormData = UpdateStartupInput & { founderIds: string[] };

// Type for startup with optional spentBudget (used in hooks)
export type StartupWithSpentBudget<T = unknown> = T & { spentBudget?: number };
