/**
 * Dashboard service
 * Aggregates data for dashboard views
 */

import { startupService } from "./startup.service";
import { expenseService } from "./expense.service";
import { progressService } from "./progress.service";
import {
  calculateRemainingBudget,
  calculateUtilizationPercent,
  getCurrentMonthStart,
} from "@/lib/utils/startup.utils";
import { EXPENSE_STATUS, NUMERIC_CONSTANTS } from "@/lib/constants";
import type { StudentDashboardData } from "@/lib/types/dashboard.types";
import type {
  StartupWithRelations,
  ExpenseWithRelations,
  ProgressUpdateWithRelations,
} from "@/lib/types/prisma";

/**
 * Get student dashboard data
 */
export async function getStudentDashboardData(
  userId: string
): Promise<StudentDashboardData | null> {
  // Get student's startups
  const startups = await startupService.findByStudentId(userId);

  if (startups.length === 0) {
    return null;
  }

  // Use the first startup (students typically have one)
  const startup = startups[0] as StartupWithRelations;

  // Get expenses for this startup
  const expenses = (await expenseService.findAll({
    startupId: startup.id,
    submittedById: userId,
  })) as ExpenseWithRelations[];

  // Get progress updates for this startup
  const progressUpdates = (await progressService.findAll({
    startupId: startup.id,
    submittedById: userId,
  })) as ProgressUpdateWithRelations[];

  // Calculate metrics
  const approvedExpenses = expenses.filter(
    (e) => e.status === EXPENSE_STATUS.APPROVED
  );
  const spentBudget = approvedExpenses.reduce((sum, e) => sum + e.amount, 0);
  const remainingBudget = calculateRemainingBudget(
    startup.totalBudget,
    spentBudget
  );
  const utilizationPercent = calculateUtilizationPercent(
    spentBudget,
    startup.totalBudget
  );

  const pendingExpenses = expenses.filter(
    (e) => e.status === EXPENSE_STATUS.PENDING
  );

  // Get current month expenses
  const currentMonthStart = getCurrentMonthStart();
  const thisMonthExpenses = expenses.filter((e) => {
    const expenseDate = new Date(e.date);
    return (
      expenseDate >= currentMonthStart && e.status === EXPENSE_STATUS.APPROVED
    );
  });
  const thisMonthTotal = thisMonthExpenses.reduce(
    (sum, e) => sum + e.amount,
    0
  );

  // Recent expenses (last N)
  const recentExpenses = expenses
    .slice(0, NUMERIC_CONSTANTS.RECENT_ITEMS_LIMIT)
    .map((exp) => ({
      id: exp.id,
      amount: exp.amount,
      category: exp.category?.name || "Unknown",
      status: exp.status,
      date: exp.date,
    }));

  // Recent progress updates (last N)
  const recentProgressUpdates = progressUpdates
    .slice(0, NUMERIC_CONSTANTS.RECENT_ITEMS_LIMIT)
    .map((update) => {
      const whatWasDone = update.whatWasDone || "";
      return {
        id: update.id,
        date: update.createdAt,
        summary:
          whatWasDone.length > 100
            ? whatWasDone.substring(0, 100) + "..."
            : whatWasDone,
      };
    });

  return {
    startup,
    expenses,
    progressUpdates,
    metrics: {
      spentBudget,
      remainingBudget,
      utilizationPercent,
      pendingExpensesCount: pendingExpenses.length,
      pendingExpensesTotal: pendingExpenses.reduce(
        (sum, e) => sum + e.amount,
        0
      ),
      approvedExpensesCount: approvedExpenses.length,
      thisMonthTotal,
      totalExpensesCount: expenses.length,
    },
    recentExpenses,
    recentProgressUpdates,
  };
}
