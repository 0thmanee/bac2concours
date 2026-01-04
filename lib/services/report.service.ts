import prisma from "@/lib/prisma";
import { EXPENSE_STATUS, NUMERIC_CONSTANTS } from "@/lib/constants";
import type { ExpenseStatus } from "@prisma/client";
import {
  calculateUtilizationPercent,
  calculateRemainingBudget,
} from "@/lib/utils/startup.utils";
import type {
  ExpenseReportServiceFilters,
  ActivityReportServiceFilters,
  ActivityByStartupItem,
} from "@/lib/validations/report.validation";

export const reportService = {
  // Budget usage report
  async getBudgetReport(startupId?: string) {
    const startups = await prisma.startup.findMany({
      where: {
        ...(startupId && { id: startupId }),
        isDeleted: false,
      },
      include: {
        budgetCategories: true,
        students: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Get all approved expenses for these startups, grouped by category
    const startupIds = startups.map((s) => s.id);
    const expenses = await prisma.expense.findMany({
      where: {
        startupId: { in: startupIds },
        status: EXPENSE_STATUS.APPROVED,
      },
      include: {
        category: true,
      },
    });

    // Group expenses by startup and category name
    const expensesByStartupAndCategory = expenses.reduce((acc, expense) => {
      const key = `${expense.startupId}:${expense.category.name}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(expense);
      return acc;
    }, {} as Record<string, typeof expenses>);

    const report = startups.map((startup) => {
      const totalBudget = startup.totalBudget;
      const allocatedBudget = startup.budgetCategories.reduce(
        (sum: number, cat) => sum + cat.maxBudget,
        0
      );

      const categories = startup.budgetCategories.map((cat) => {
        // Find expenses for this budget category by matching category name
        const key = `${startup.id}:${cat.name}`;
        const categoryExpenses = expensesByStartupAndCategory[key] || [];
        const spent = categoryExpenses.reduce(
          (sum, exp) => sum + exp.amount,
          0
        );
        const remaining = calculateRemainingBudget(cat.maxBudget, spent);
        const utilizationPercent = calculateUtilizationPercent(
          spent,
          cat.maxBudget
        );

        return {
          id: cat.id,
          name: cat.name,
          allocated: cat.maxBudget,
          spent,
          remaining,
          utilizationPercent,
          expenseCount: categoryExpenses.length,
        };
      });

      const spentBudget = categories.reduce((sum, cat) => sum + cat.spent, 0);

      return {
        startup: {
          id: startup.id,
          name: startup.name,
          students: startup.students,
          incubationStart: startup.incubationStart,
          incubationEnd: startup.incubationEnd,
          status: startup.status,
        },
        budget: {
          total: totalBudget,
          allocated: allocatedBudget,
          unallocated: calculateRemainingBudget(totalBudget, allocatedBudget),
          spent: spentBudget,
          remaining: calculateRemainingBudget(totalBudget, spentBudget),
          utilizationPercent: calculateUtilizationPercent(
            spentBudget,
            totalBudget
          ),
        },
        categories,
      };
    });

    return {
      report,
      summary: {
        totalStartups: startups.length,
        totalBudget: report.reduce((sum, r) => sum + r.budget.total, 0),
        totalAllocated: report.reduce((sum, r) => sum + r.budget.allocated, 0),
        totalSpent: report.reduce((sum, r) => sum + r.budget.spent, 0),
      },
    };
  },

  // Expense breakdown report
  async getExpenseReport(filters?: ExpenseReportServiceFilters) {
    const where = {
      ...(filters?.startupId && { startupId: filters.startupId }),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.startDate &&
        filters?.endDate && {
          date: {
            gte: filters.startDate,
            lte: filters.endDate,
          },
        }),
    };

    const expenses = await prisma.expense.findMany({
      where,
      include: {
        category: true,
        startup: {
          select: {
            id: true,
            name: true,
          },
        },
        submittedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    // Group by category
    const byCategory: Record<
      string,
      {
        categoryName: string;
        startupName: string;
        expenses: typeof expenses;
        total: number;
        count: number;
      }
    > = {};

    expenses.forEach((expense) => {
      const key = expense.category.id;
      if (!byCategory[key]) {
        byCategory[key] = {
          categoryName: expense.category.name,
          startupName: expense.startup.name,
          expenses: [],
          total: 0,
          count: 0,
        };
      }
      byCategory[key].expenses.push(expense);
      byCategory[key].total += expense.amount;
      byCategory[key].count += 1;
    });

    // Group by status
    const byStatus = {
      PENDING: expenses.filter((e) => e.status === EXPENSE_STATUS.PENDING),
      APPROVED: expenses.filter((e) => e.status === EXPENSE_STATUS.APPROVED),
      REJECTED: expenses.filter((e) => e.status === EXPENSE_STATUS.REJECTED),
    };

    return {
      expenses,
      byCategory: Object.values(byCategory),
      byStatus: {
        PENDING: {
          count: byStatus.PENDING.length,
          total: byStatus.PENDING.reduce((sum, e) => sum + e.amount, 0),
        },
        APPROVED: {
          count: byStatus.APPROVED.length,
          total: byStatus.APPROVED.reduce((sum, e) => sum + e.amount, 0),
        },
        REJECTED: {
          count: byStatus.REJECTED.length,
          total: byStatus.REJECTED.reduce((sum, e) => sum + e.amount, 0),
        },
      },
      summary: {
        totalExpenses: expenses.length,
        totalAmount: expenses.reduce((sum, e) => sum + e.amount, 0),
        approvedAmount: byStatus.APPROVED.reduce((sum, e) => sum + e.amount, 0),
      },
    };
  },

  // Activity report
  async getActivityReport(filters?: ActivityReportServiceFilters) {
    const dateFilter =
      filters?.startDate && filters?.endDate
        ? {
            gte: filters.startDate,
            lte: filters.endDate,
          }
        : undefined;

    const progressUpdates = await prisma.progressUpdate.findMany({
      where: {
        ...(filters?.startupId && { startupId: filters.startupId }),
        ...(dateFilter && { createdAt: dateFilter }),
      },
      include: {
        startup: {
          select: {
            id: true,
            name: true,
          },
        },
        submittedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const recentExpenses = await prisma.expense.findMany({
      where: {
        ...(filters?.startupId && { startupId: filters.startupId }),
        ...(dateFilter && { date: dateFilter }),
      },
      include: {
        category: true,
        startup: {
          select: {
            id: true,
            name: true,
          },
        },
        submittedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: NUMERIC_CONSTANTS.REPORT_EXPENSES_LIMIT,
    });

    // Activity by startup
    const activityByStartup: Record<string, ActivityByStartupItem> = {};

    progressUpdates.forEach((update) => {
      const key = update.startup.id;
      if (!activityByStartup[key]) {
        activityByStartup[key] = {
          startup: update.startup,
          progressUpdateCount: 0,
          expenseCount: 0,
          totalExpenseAmount: 0,
          lastActivity: update.createdAt,
        };
      }
      activityByStartup[key].progressUpdateCount += 1;
      if (update.createdAt > activityByStartup[key].lastActivity) {
        activityByStartup[key].lastActivity = update.createdAt;
      }
    });

    recentExpenses.forEach((expense) => {
      const key = expense.startup.id;
      if (!activityByStartup[key]) {
        activityByStartup[key] = {
          startup: expense.startup,
          progressUpdateCount: 0,
          expenseCount: 0,
          totalExpenseAmount: 0,
          lastActivity: expense.createdAt,
        };
      }
      activityByStartup[key].expenseCount += 1;
      activityByStartup[key].totalExpenseAmount += expense.amount;
      if (expense.createdAt > activityByStartup[key].lastActivity) {
        activityByStartup[key].lastActivity = expense.createdAt;
      }
    });

    // Timeline of all activities
    const timeline = [
      ...progressUpdates.map((u) => ({
        type: "PROGRESS_UPDATE" as const,
        date: u.createdAt,
        startup: u.startup,
        user: u.submittedBy,
        details: {
          whatWasDone: u.whatWasDone,
        },
      })),
      ...recentExpenses.map((e) => ({
        type: "EXPENSE" as const,
        date: e.createdAt,
        startup: e.startup,
        user: e.submittedBy,
        details: {
          description: e.description,
          amount: e.amount,
          status: e.status,
        },
      })),
    ].sort((a, b) => b.date.getTime() - a.date.getTime());

    return {
      progressUpdates: {
        count: progressUpdates.length,
        items: progressUpdates,
      },
      expenses: {
        count: recentExpenses.length,
        total: recentExpenses.reduce((sum, e) => sum + e.amount, 0),
        items: recentExpenses,
      },
      activityByStartup: Object.values(activityByStartup),
      timeline: timeline.slice(0, NUMERIC_CONSTANTS.REPORT_TIMELINE_LIMIT),
      summary: {
        totalProgressUpdates: progressUpdates.length,
        totalExpenses: recentExpenses.length,
        activeStartups: Object.keys(activityByStartup).length,
      },
    };
  },
};
