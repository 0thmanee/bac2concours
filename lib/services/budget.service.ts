import prisma from "@/lib/prisma";
import { EXPENSE_STATUS } from "@/lib/constants";
import type {
  CreateBudgetCategoryServiceInput,
  UpdateBudgetCategoryInput,
  BudgetTotals,
  BudgetMetrics,
  BudgetCategoryWithSpent,
} from "@/lib/validations/budget.validation";

export const budgetService = {
  // Get all budget categories for a startup
  async findByStartupId(startupId: string) {
    return prisma.budgetCategory.findMany({
      where: { startupId },
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  // Get single budget category
  async findById(id: string) {
    return prisma.budgetCategory.findUnique({
      where: { id },
      include: {
        startup: true,
      },
    });
  },

  // Create budget category
  async create(data: CreateBudgetCategoryServiceInput) {
    return prisma.budgetCategory.create({
      data,
    });
  },

  // Update budget category
  async update(id: string, data: UpdateBudgetCategoryInput) {
    return prisma.budgetCategory.update({
      where: { id },
      data,
    });
  },

  // Delete budget category
  async delete(id: string) {
    return prisma.budgetCategory.delete({
      where: { id },
    });
  },

  // Get total allocated budget for startup
  async getTotalAllocated(startupId: string): Promise<number> {
    const categories = await prisma.budgetCategory.findMany({
      where: { startupId },
      select: { maxBudget: true },
    });
    return categories.reduce((sum, cat) => sum + cat.maxBudget, 0);
  },

  // Get spent amount for budget category (matches expenses by category name)
  async getSpentAmount(
    budgetCategoryId: string,
    startupId: string
  ): Promise<number> {
    // First get the budget category to get its name
    const budgetCategory = await prisma.budgetCategory.findUnique({
      where: { id: budgetCategoryId },
      select: { name: true },
    });

    if (!budgetCategory) return 0;

    // Find the global category with matching name
    const globalCategory = await prisma.category.findFirst({
      where: { name: budgetCategory.name },
    });

    if (!globalCategory) return 0;

    // Sum expenses for this startup and category
    const result = await prisma.expense.aggregate({
      where: {
        startupId,
        categoryId: globalCategory.id,
        status: EXPENSE_STATUS.APPROVED,
      },
      _sum: {
        amount: true,
      },
    });
    return result._sum.amount || 0;
  },

  // Check if category has expenses
  async hasExpenses(categoryId: string): Promise<boolean> {
    const count = await prisma.expense.count({
      where: { categoryId },
    });
    return count > 0;
  },

  // Get total allocated and total spent for a startup's budgets
  async getTotalsByStartupId(startupId: string): Promise<BudgetTotals> {
    const categories = await this.findByStartupId(startupId);
    const totalAllocated = categories.reduce(
      (sum, cat) => sum + cat.maxBudget,
      0
    );

    // Calculate total spent by getting spent amount for each category
    const spentAmounts = await Promise.all(
      categories.map((cat) => this.getSpentAmount(cat.id, startupId))
    );
    const totalSpent = spentAmounts.reduce((sum, spent) => sum + spent, 0);

    return {
      totalAllocated,
      totalSpent,
    };
  },

  // Get overall budget metrics (all startups)
  async getMetrics(): Promise<BudgetMetrics> {
    const startups = await prisma.startup.findMany({
      where: { isDeleted: false },
      select: { id: true },
    });

    const totalsByStartup = await Promise.all(
      startups.map((startup) => this.getTotalsByStartupId(startup.id))
    );

    const totalAllocated = totalsByStartup.reduce(
      (sum, t) => sum + t.totalAllocated,
      0
    );
    const totalSpent = totalsByStartup.reduce(
      (sum, t) => sum + t.totalSpent,
      0
    );

    return {
      totalAllocated,
      totalSpent,
      startupCount: startups.length,
    };
  },

  // Get budget categories with spent amounts pre-calculated
  async findByStartupIdWithSpentAmounts(
    startupId: string
  ): Promise<BudgetCategoryWithSpent[]> {
    const categories = await this.findByStartupId(startupId);

    // Calculate spent amount for each category
    const categoriesWithSpent = await Promise.all(
      categories.map(async (cat) => {
        const spent = await this.getSpentAmount(cat.id, startupId);
        return {
          ...cat,
          spent,
        };
      })
    );

    return categoriesWithSpent;
  },
};
