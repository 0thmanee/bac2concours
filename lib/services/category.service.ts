import prisma from "@/lib/prisma";
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
  CategoryQueryParams,
  CategoryMetrics,
} from "@/lib/validations/category.validation";

export const categoryService = {
  // Get all categories with filters
  async findAll(options?: CategoryQueryParams) {
    const { isActive, search } = options || {};

    return prisma.category.findMany({
      where: {
        ...(isActive !== undefined && { isActive }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ],
        }),
      },
      include: {
        _count: {
          select: {
            expenses: true,
          },
        },
      },
      orderBy: [
        { isActive: "desc" },
        { name: "asc" },
      ],
    });
  },

  // Get active categories only (for dropdowns)
  async findActive() {
    return prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        description: true,
      },
    });
  },

  // Get single category by ID
  async findById(id: string) {
    return prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            expenses: true,
          },
        },
      },
    });
  },

  // Create category
  async create(data: CreateCategoryInput) {
    // Check if category with same name already exists
    const existing = await prisma.category.findUnique({
      where: { name: data.name },
    });

    if (existing) {
      throw new Error("Category with this name already exists");
    }

    return prisma.category.create({
      data,
      include: {
        _count: {
          select: {
            expenses: true,
          },
        },
      },
    });
  },

  // Update category
  async update(id: string, data: UpdateCategoryInput) {
    // If name is being updated, check if it's already taken
    if (data.name !== undefined) {
      const existing = await prisma.category.findUnique({
        where: { name: data.name },
      });

      if (existing && existing.id !== id) {
        throw new Error("Category with this name already exists");
      }
    }

    return prisma.category.update({
      where: { id },
      data: {
        ...data,
        description: data.description === null ? null : data.description,
      },
      include: {
        _count: {
          select: {
            expenses: true,
          },
        },
      },
    });
  },

  // Delete category
  async delete(id: string) {
    // Check if category has expenses
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            expenses: true,
          },
        },
      },
    });

    if (!category) {
      throw new Error("Category not found");
    }

    if (category._count.expenses > 0) {
      throw new Error(
        `Cannot delete category with ${category._count.expenses} expense(s). Please deactivate it instead.`
      );
    }

    return prisma.category.delete({
      where: { id },
    });
  },

  // Get category metrics
  async getMetrics(): Promise<CategoryMetrics> {
    const [totalCount, activeCount, inactiveCount, totalExpensesCount] = await Promise.all([
      prisma.category.count(),
      prisma.category.count({
        where: { isActive: true },
      }),
      prisma.category.count({
        where: { isActive: false },
      }),
      prisma.expense.count(),
    ]);

    return {
      totalCount,
      activeCount,
      inactiveCount,
      totalExpensesCount,
    };
  },
};

