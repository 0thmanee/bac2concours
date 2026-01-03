import { z } from "zod";

export const createProgressUpdateSchema = z.object({
  whatWasDone: z.string().min(10, "Please provide details (min 10 characters)"),
  whatIsBlocked: z.string().min(5, 'Please describe blockers or write "None"'),
  whatIsNext: z
    .string()
    .min(10, "Please provide next steps (min 10 characters)"),
  startupId: z.string(),
});

export const progressQueryParamsSchema = z.object({
  startupId: z.string().optional(),
  me: z.string().optional(),
});

export const progressFindAllFiltersSchema = progressQueryParamsSchema.extend({
  submittedById: z.string().optional(),
});

export const createProgressUpdateServiceInputSchema = createProgressUpdateSchema.extend({
  submittedById: z.string(),
});

export type CreateProgressUpdateInput = z.infer<
  typeof createProgressUpdateSchema
>;
export type ProgressQueryParams = z.infer<typeof progressQueryParamsSchema>;
export type ProgressFindAllFilters = z.infer<typeof progressFindAllFiltersSchema>;
export type CreateProgressUpdateServiceInput = z.infer<typeof createProgressUpdateServiceInputSchema>;
