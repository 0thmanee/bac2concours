import { z } from "zod";

export const createBudgetCategorySchema = z.object({
  name: z.string().min(2, "Category name required"),
  maxBudget: z.number().positive("Budget must be positive"),
});

export const updateBudgetCategorySchema = z.object({
  name: z.string().min(2).optional(),
  maxBudget: z.number().positive().optional(),
});

export const createBudgetCategoryServiceInputSchema = createBudgetCategorySchema.extend({
  startupId: z.string(),
});

export const budgetTotalsSchema = z.object({
  totalAllocated: z.number(),
  totalSpent: z.number(),
});

export const budgetMetricsSchema = z.object({
  totalAllocated: z.number(),
  totalSpent: z.number(),
  startupCount: z.number(),
});

export const budgetCategoryWithSpentSchema = z.object({
  id: z.string(),
  name: z.string(),
  maxBudget: z.number(),
  startupId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  spent: z.number(),
});

export type CreateBudgetCategoryInput = z.infer<
  typeof createBudgetCategorySchema
>;
export type UpdateBudgetCategoryInput = z.infer<
  typeof updateBudgetCategorySchema
>;
export type BudgetTotals = z.infer<typeof budgetTotalsSchema>;
export type BudgetMetrics = z.infer<typeof budgetMetricsSchema>;
export type BudgetCategoryWithSpent = z.infer<
  typeof budgetCategoryWithSpentSchema
>;
export type CreateBudgetCategoryServiceInput = z.infer<typeof createBudgetCategoryServiceInputSchema>;
