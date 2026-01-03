/**
 * Dashboard data types
 * Type definitions for dashboard components
 */

import type {
  StartupWithRelations,
  ExpenseWithRelations,
  ProgressUpdateWithRelations,
} from "./prisma";
import type { EXPENSE_STATUS } from "@/lib/constants";

// Recent expense item for dashboard display
export interface RecentExpenseItem {
  id: string;
  amount: number;
  category: string;
  status: typeof EXPENSE_STATUS[keyof typeof EXPENSE_STATUS];
  date: Date | string;
}

// Recent progress update item for dashboard display
export interface RecentProgressUpdateItem {
  id: string;
  date: Date | string;
  summary: string;
}

// Founder dashboard data
export interface FounderDashboardData {
  startup: StartupWithRelations;
  expenses: ExpenseWithRelations[];
  progressUpdates: ProgressUpdateWithRelations[];
  metrics: {
    spentBudget: number;
    remainingBudget: number;
    utilizationPercent: number;
    pendingExpensesCount: number;
    pendingExpensesTotal: number;
    approvedExpensesCount: number;
    thisMonthTotal: number;
    totalExpensesCount: number;
  };
  recentExpenses: RecentExpenseItem[];
  recentProgressUpdates: RecentProgressUpdateItem[];
}

