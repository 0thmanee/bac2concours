import { z } from "zod";
import { EXPENSE_STATUS } from "@/lib/constants";
import { expenseStatusSchema } from "@/lib/validations/expense.validation";
import type {
  BudgetReport,
  ExpenseReport,
  ActivityReport,
} from "@/lib/types/report.types";

export const budgetReportQueryParamsSchema = z.object({
  startupId: z.string().optional(),
});

export const activityReportQueryParamsSchema = z.object({
  startupId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

// Expense report query params (re-exported from expense.validation for convenience)
export { expenseReportQueryParamsSchema } from "@/lib/validations/expense.validation";
export type { ExpenseReportQueryParams } from "@/lib/validations/expense.validation";

// Filter input types for report services
export const expenseReportFiltersSchema = z.object({
  startupId: z.string().optional(),
  status: z
    .enum([
      EXPENSE_STATUS.PENDING,
      EXPENSE_STATUS.APPROVED,
      EXPENSE_STATUS.REJECTED,
    ])
    .optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const activityReportFiltersSchema = z.object({
  startupId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const expenseReportServiceFiltersSchema = expenseReportFiltersSchema
  .omit({
    startDate: true,
    endDate: true,
  })
  .extend({
    status: expenseStatusSchema.optional(),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
  });

export const activityReportServiceFiltersSchema = activityReportFiltersSchema
  .omit({
    startDate: true,
    endDate: true,
  })
  .extend({
    startDate: z.date().optional(),
    endDate: z.date().optional(),
  });

export const activityByStartupItemSchema = z.object({
  startup: z.object({
    id: z.string(),
    name: z.string(),
  }),
  progressUpdateCount: z.number(),
  expenseCount: z.number(),
  totalExpenseAmount: z.number(),
  lastActivity: z.date(),
});

// Report step for the multi-step report wizard
export const reportStepSchema = z.enum(["select", "configure", "preview"]);

// Report format for export
export const reportFormatSchema = z.enum(["html", "pdf"]);

// Stored report for history tracking
export const storedReportSchema = z.object({
  id: z.string(),
  type: z.string(),
  typeName: z.string(),
  period: z.string(),
  startupName: z.string().optional(),
  format: reportFormatSchema,
  generatedAt: z.string(),
  // Data is a union of report types - we use z.unknown() here as it's validated elsewhere
  data: z.unknown(),
});

export type BudgetReportQueryParams = z.infer<
  typeof budgetReportQueryParamsSchema
>;
export type ActivityReportQueryParams = z.infer<
  typeof activityReportQueryParamsSchema
>;
export type ExpenseReportFilters = z.infer<typeof expenseReportFiltersSchema>;
export type ActivityReportFilters = z.infer<typeof activityReportFiltersSchema>;
export type ExpenseReportServiceFilters = z.infer<
  typeof expenseReportServiceFiltersSchema
>;
export type ActivityReportServiceFilters = z.infer<
  typeof activityReportServiceFiltersSchema
>;
export type ActivityByStartupItem = z.infer<typeof activityByStartupItemSchema>;
export type ReportStep = z.infer<typeof reportStepSchema>;
export type ReportFormat = z.infer<typeof reportFormatSchema>;

// StoredReport uses actual report types for the data field
export interface StoredReport {
  id: string;
  type: string;
  typeName: string;
  period: string;
  startupName?: string;
  format: ReportFormat;
  generatedAt: string;
  data: BudgetReport | ExpenseReport | ActivityReport;
}
