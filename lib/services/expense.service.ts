import prisma from "@/lib/prisma";
import { ExpenseStatus } from "@prisma/client";
import { EXPENSE_STATUS } from "@/lib/constants";
import type {
  CreateExpenseServiceInput,
  UpdateExpenseServiceInput,
  UpdateExpenseStatusServiceInput,
  ExpenseFindAllFilters,
  ExpenseMetrics,
} from "@/lib/validations/expense.validation";

export const expenseService = {
  // Get all expenses with filters
  async findAll(filters?: ExpenseFindAllFilters) {
    return prisma.expense.findMany({
      where: {
        ...(filters?.startupId && { startupId: filters.startupId }),
        ...(filters?.categoryId && { categoryId: filters.categoryId }),
        ...(filters?.status && { status: filters.status }),
        ...(filters?.submittedById && { submittedById: filters.submittedById }),
      },
      include: {
        category: true,
        submittedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        startup: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  // Get single expense
  async findById(id: string) {
    return prisma.expense.findUnique({
      where: { id },
      include: {
        category: true,
        submittedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        startup: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  },

  // Create expense
  async create(data: CreateExpenseServiceInput) {
    return prisma.expense.create({
      data,
      include: {
        category: true,
        submittedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  },

  // Update expense (for students to edit their pending expenses)
  async update(id: string, data: UpdateExpenseServiceInput) {
    return prisma.expense.update({
      where: { id },
      data,
      include: {
        category: true,
        submittedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  },

  // Update expense status
  async updateStatus(id: string, data: UpdateExpenseStatusServiceInput) {
    const updateData: Record<string, unknown> = {
      status: data.status,
    };
    if (data.adminComment !== undefined)
      updateData.adminComment = data.adminComment || null;

    return prisma.expense.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        submittedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  },

  // Get pending expenses count
  async getPendingCount(): Promise<number> {
    return prisma.expense.count({
      where: { status: EXPENSE_STATUS.PENDING },
    });
  },

  // Get expense metrics
  async getMetrics(): Promise<ExpenseMetrics> {
    const [pendingCount, pendingTotal, approvedCount, approvedTotal, totalCount] =
      await Promise.all([
        prisma.expense.count({
          where: { status: EXPENSE_STATUS.PENDING },
        }),
        prisma.expense.aggregate({
          where: { status: EXPENSE_STATUS.PENDING },
          _sum: { amount: true },
        }),
        prisma.expense.count({
          where: { status: EXPENSE_STATUS.APPROVED },
        }),
        prisma.expense.aggregate({
          where: { status: EXPENSE_STATUS.APPROVED },
          _sum: { amount: true },
        }),
        prisma.expense.count(),
      ]);

    return {
      pendingCount,
      pendingTotal: pendingTotal._sum.amount || 0,
      approvedCount,
      approvedTotal: approvedTotal._sum.amount || 0,
      totalCount,
    };
  },

  // Get current month expenses total
  async getCurrentMonthTotal(): Promise<number> {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const result = await prisma.expense.aggregate({
      where: {
        status: EXPENSE_STATUS.APPROVED,
        date: {
          gte: currentMonthStart,
        },
      },
      _sum: {
        amount: true,
      },
    });

    return result._sum.amount || 0;
  },

  // Get metrics for expenses filtered by startupId
  async getMetricsByStartupId(startupId: string): Promise<ExpenseMetrics> {
    const [
      pendingCount,
      pendingTotal,
      approvedCount,
      approvedTotal,
      totalCount,
    ] = await Promise.all([
      prisma.expense.count({
        where: { startupId, status: EXPENSE_STATUS.PENDING },
      }),
      prisma.expense.aggregate({
        where: { startupId, status: EXPENSE_STATUS.PENDING },
        _sum: { amount: true },
      }),
      prisma.expense.count({
        where: { startupId, status: EXPENSE_STATUS.APPROVED },
      }),
      prisma.expense.aggregate({
        where: { startupId, status: EXPENSE_STATUS.APPROVED },
        _sum: { amount: true },
      }),
      prisma.expense.count({
        where: { startupId },
      }),
    ]);

    return {
      pendingCount,
      pendingTotal: pendingTotal._sum.amount || 0,
      approvedCount,
      approvedTotal: approvedTotal._sum.amount || 0,
      totalCount,
    };
  },

  // Get spent budget amount for a specific startup
  async getSpentBudgetByStartupId(startupId: string): Promise<number> {
    const result = await prisma.expense.aggregate({
      where: {
        startupId,
        status: EXPENSE_STATUS.APPROVED,
      },
      _sum: {
        amount: true,
      },
    });

    return result._sum.amount || 0;
  },

  // Get expenses by student
  async findByStudentId(studentId: string) {
    return prisma.expense.findMany({
      where: {
        submittedById: studentId,
      },
      include: {
        category: true,
        startup: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },
};
