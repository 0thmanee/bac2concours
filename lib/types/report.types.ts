import type { ExpenseWithRelations } from "./prisma";
import type { ExpenseStatus, StartupStatus } from "@prisma/client";

// Budget Report Types
export interface BudgetReportCategory {
  id: string;
  name: string;
  allocated: number;
  spent: number;
  remaining: number;
  utilizationPercent: number;
  expenseCount: number;
}

export interface BudgetReportStartup {
  id: string;
  name: string;
  founders: Array<{
    id: string;
    name: string;
    email: string;
  }>;
  incubationStart: Date;
  incubationEnd: Date;
  status: StartupStatus;
}

export interface BudgetReportBudget {
  total: number;
  allocated: number;
  unallocated: number;
  spent: number;
  remaining: number;
  utilizationPercent: number;
}

export interface BudgetReportItem {
  startup: BudgetReportStartup;
  budget: BudgetReportBudget;
  categories: BudgetReportCategory[];
}

export interface BudgetReportSummary {
  totalStartups: number;
  totalBudget: number;
  totalAllocated: number;
  totalSpent: number;
}

export interface BudgetReport {
  report: BudgetReportItem[];
  summary: BudgetReportSummary;
}

// Expense Report Types
export interface ExpenseReportByCategory {
  categoryName: string;
  startupName: string;
  expenses: ExpenseWithRelations[];
  total: number;
  count: number;
}

export interface ExpenseReportByStatus {
  PENDING: {
    count: number;
    total: number;
  };
  APPROVED: {
    count: number;
    total: number;
  };
  REJECTED: {
    count: number;
    total: number;
  };
}

export interface ExpenseReportSummary {
  totalExpenses: number;
  totalAmount: number;
  approvedAmount: number;
}

export interface ExpenseReport {
  expenses: ExpenseWithRelations[];
  byCategory: ExpenseReportByCategory[];
  byStatus: ExpenseReportByStatus;
  summary: ExpenseReportSummary;
}

// Activity Report Types
export interface ActivityReportStartup {
  startup: {
    id: string;
    name: string;
  };
  progressUpdateCount: number;
  expenseCount: number;
  totalExpenseAmount: number;
  lastActivity: Date;
}

export interface ActivityReportProgressUpdates {
  count: number;
  items: Array<{
    id: string;
    whatWasDone: string | null;
    whatIsBlocked: string | null;
    whatIsNext: string | null;
    createdAt: Date;
    startup: {
      id: string;
      name: string;
    };
    submittedBy: {
      id: string;
      name: string;
      email: string;
    };
  }>;
}

export interface ActivityReportExpenses {
  count: number;
  total: number;
  items: ExpenseWithRelations[];
}

export interface ActivityReportTimelineItem {
  type: "PROGRESS_UPDATE" | "EXPENSE";
  date: Date;
  startup: {
    id: string;
    name: string;
  };
  user: {
    id: string;
    name: string;
    email?: string;
  };
  details: {
    whatWasDone?: string | null;
    description?: string;
    amount?: number;
    status?: ExpenseStatus;
  };
}

export interface ActivityReportSummary {
  totalProgressUpdates: number;
  totalExpenses: number;
  activeStartups: number;
}

export interface ActivityReport {
  progressUpdates: ActivityReportProgressUpdates;
  expenses: ActivityReportExpenses;
  activityByStartup: ActivityReportStartup[];
  timeline: ActivityReportTimelineItem[];
  summary: ActivityReportSummary;
}

