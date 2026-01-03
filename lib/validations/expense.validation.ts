import { z } from "zod";
import { EXPENSE_STATUS } from "@/lib/constants";

// Expense status enum schema
export const expenseStatusSchema = z.enum([
  EXPENSE_STATUS.PENDING,
  EXPENSE_STATUS.APPROVED,
  EXPENSE_STATUS.REJECTED,
]);

// Expense status for approval/rejection (only APPROVED or REJECTED)
export const expenseStatusUpdateSchema = z.enum([
  EXPENSE_STATUS.APPROVED,
  EXPENSE_STATUS.REJECTED,
]);

export const createExpenseSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  description: z.string().min(5, "Description required (min 5 characters)"),
  date: z.string().transform((val) => new Date(val)),
  categoryId: z.string(),
  startupId: z.string(),
  receiptUrl: z.string().url().optional().or(z.literal("")),
});

export const updateExpenseStatusSchema = z.object({
  status: expenseStatusUpdateSchema,
  adminComment: z.string().optional(),
});

export const approveExpenseSchema = z.object({
  adminComment: z.string().optional(),
});

export const rejectExpenseSchema = z.object({
  adminComment: z.string().min(5, "Please provide a reason for rejection"),
});

export const updateExpenseSchema = z.object({
  amount: z.number().positive("Amount must be positive").optional(),
  description: z
    .string()
    .min(5, "Description required (min 5 characters)")
    .optional(),
  date: z
    .string()
    .transform((val) => new Date(val))
    .optional(),
  categoryId: z.string().optional(),
  receiptUrl: z.string().url().optional().or(z.literal("")),
});

export const expenseQueryParamsSchema = z.object({
  startupId: z.string().optional(),
  status: expenseStatusSchema.optional(),
});

export const expenseFindAllFiltersSchema = expenseQueryParamsSchema.extend({
  categoryId: z.string().optional(),
  submittedById: z.string().optional(),
});

export const createExpenseServiceInputSchema = createExpenseSchema.omit({ date: true }).extend({
  date: z.date(),
  submittedById: z.string(),
  status: expenseStatusSchema.optional(),
});

export const updateExpenseServiceInputSchema = updateExpenseSchema.omit({ date: true }).extend({
  date: z.date().optional(),
});

export const updateExpenseStatusServiceInputSchema = updateExpenseStatusSchema.extend({
  status: expenseStatusSchema,
});

export const approveExpenseMutationInputSchema = z.object({
  id: z.string(),
  adminComment: z.string().optional(),
});

export const rejectExpenseMutationInputSchema = z.object({
  id: z.string(),
  adminComment: z.string(),
});

export const expenseReportQueryParamsSchema = z.object({
  startupId: z.string().optional(),
  status: expenseStatusSchema.optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const expenseMetricsSchema = z.object({
  pendingCount: z.number(),
  pendingTotal: z.number(),
  approvedCount: z.number(),
  approvedTotal: z.number(),
  totalCount: z.number(),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
export type UpdateExpenseStatusInput = z.infer<
  typeof updateExpenseStatusSchema
>;
export type ApproveExpenseInput = z.infer<typeof approveExpenseSchema>;
export type RejectExpenseInput = z.infer<typeof rejectExpenseSchema>;
export type ExpenseQueryParams = z.infer<typeof expenseQueryParamsSchema>;
export type ExpenseReportQueryParams = z.infer<
  typeof expenseReportQueryParamsSchema
>;
export type ExpenseStatusInput = z.infer<typeof expenseStatusSchema>;
export type ExpenseMetrics = z.infer<typeof expenseMetricsSchema>;
export type ExpenseFindAllFilters = z.infer<typeof expenseFindAllFiltersSchema>;
export type CreateExpenseServiceInput = z.infer<typeof createExpenseServiceInputSchema>;
export type UpdateExpenseServiceInput = z.infer<typeof updateExpenseServiceInputSchema>;
export type UpdateExpenseStatusServiceInput = z.infer<typeof updateExpenseStatusServiceInputSchema>;
export type ApproveExpenseMutationInput = z.infer<typeof approveExpenseMutationInputSchema>;
export type RejectExpenseMutationInput = z.infer<typeof rejectExpenseMutationInputSchema>;
