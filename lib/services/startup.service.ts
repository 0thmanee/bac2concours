import prisma from "@/lib/prisma";
import { StartupStatus } from "@prisma/client";
import {
  EXPENSE_STATUS,
  STARTUP_STATUS,
  NUMERIC_CONSTANTS,
  USER_STATUS,
  USER_ROLE,
} from "@/lib/constants";
import type {
  CreateStartupServiceInput,
  UpdateStartupServiceInput,
  StartupFindAllOptions,
  StartupMetrics,
} from "@/lib/validations/startup.validation";

export const startupService = {
  // Get all startups with relations
  async findAll(options?: StartupFindAllOptions) {
    const { includeDeleted = false, search, status } = options || {};

    return prisma.startup.findMany({
      where: {
        ...(includeDeleted ? {} : { isDeleted: false }),
        ...(status && { status: status as StartupStatus }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { industry: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ],
        }),
      },
      include: {
        students: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        budgetCategories: true,
        _count: {
          select: {
            expenses: true,
            progressUpdates: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  // Get single startup by ID
  async findById(id: string) {
    return prisma.startup.findUnique({
      where: { id },
      include: {
        students: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        budgetCategories: true,
        expenses: {
          include: {
            category: true,
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
          take: NUMERIC_CONSTANTS.RECENT_EXPENSES_LIMIT, // Limit to recent expenses for detail view
        },
        progressUpdates: {
          include: {
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
        },
      },
    });
  },

  // Create new startup
  async create(data: CreateStartupServiceInput) {
    // Use transaction to create startup and activate students
    return prisma.$transaction(async (tx) => {
      // Create startup
      const startup = await tx.startup.create({
        data: {
          name: data.name,
          description: data.description,
          industry: data.industry,
          incubationStart: data.incubationStart,
          incubationEnd: data.incubationEnd,
          totalBudget: data.totalBudget,
          students: {
            connect: data.studentIds.map((id) => ({ id })),
          },
        },
        include: {
          students: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Activate all assigned students (set status to ACTIVE)
      await tx.user.updateMany({
        where: {
          id: { in: data.studentIds },
          role: USER_ROLE.STUDENT,
        },
        data: {
          status: USER_STATUS.ACTIVE,
        },
      });

      return startup;
    });
  },

  // Update startup
  async update(id: string, data: UpdateStartupServiceInput) {
    const updateData: Record<string, unknown> = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.industry !== undefined) updateData.industry = data.industry;
    if (data.incubationStart !== undefined)
      updateData.incubationStart = data.incubationStart;
    if (data.incubationEnd !== undefined)
      updateData.incubationEnd = data.incubationEnd;
    if (data.totalBudget !== undefined)
      updateData.totalBudget = data.totalBudget;
    if (data.status !== undefined) updateData.status = data.status;

    if (data.studentIds) {
      updateData.students = {
        set: data.studentIds.map((id) => ({ id })),
      };
    }

    // Use transaction to update startup and activate newly assigned students
    return prisma.$transaction(async (tx) => {
      // Update startup
      const startup = await tx.startup.update({
        where: { id },
        data: updateData,
        include: {
          students: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // If students were updated, activate all assigned students
      if (data.studentIds) {
        await tx.user.updateMany({
          where: {
            id: { in: data.studentIds },
            role: USER_ROLE.STUDENT,
          },
          data: {
            status: USER_STATUS.ACTIVE,
          },
        });
      }

      return startup;
    });
  },

  // Soft delete startup
  async softDelete(id: string) {
    return prisma.startup.update({
      where: { id },
      data: {
        isDeleted: true,
        status: STARTUP_STATUS.INACTIVE,
      },
    });
  },

  // Get startups by student ID
  async findByStudentId(studentId: string) {
    return prisma.startup.findMany({
      where: {
        students: {
          some: {
            id: studentId,
          },
        },
        isDeleted: false,
      },
      include: {
        students: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        budgetCategories: true,
      },
    });
  },

  // Check if user is student of startup
  async isStudentOfStartup(
    startupId: string,
    userId: string
  ): Promise<boolean> {
    const startup = await prisma.startup.findFirst({
      where: {
        id: startupId,
        students: {
          some: {
            id: userId,
          },
        },
      },
    });
    return !!startup;
  },

  // Get startup metrics
  async getMetrics(): Promise<StartupMetrics> {
    const [activeCount, totalBudget, totalCount, allStartups] = await Promise.all([
      prisma.startup.count({
        where: {
          status: STARTUP_STATUS.ACTIVE,
          isDeleted: false,
        },
      }),
      prisma.startup.aggregate({
        where: { isDeleted: false },
        _sum: { totalBudget: true },
      }),
      prisma.startup.count({
        where: { isDeleted: false },
      }),
      prisma.startup.findMany({
        where: { isDeleted: false },
        include: {
          students: {
            select: { id: true },
          },
        },
      }),
    ]);

    // Calculate unique students count
    const uniqueStudentIds = new Set(
      allStartups.flatMap((s) => s.students.map((f) => f.id))
    );

    // Calculate total spent from approved expenses
    const totalSpentResult = await prisma.expense.aggregate({
      where: {
        status: EXPENSE_STATUS.APPROVED,
        startup: {
          isDeleted: false,
        },
      },
      _sum: {
        amount: true,
      },
    });

    return {
      activeCount,
      totalBudget: totalBudget._sum.totalBudget || 0,
      totalSpent: totalSpentResult._sum.amount || 0,
      totalCount,
      totalStudents: uniqueStudentIds.size,
    };
  },

  // Get startups with spent budgets pre-calculated
  async findAllWithSpentBudgets(options?: StartupFindAllOptions) {
    const { includeDeleted = false, search, status } = options || {};

    const startups = await prisma.startup.findMany({
      where: {
        ...(includeDeleted ? {} : { isDeleted: false }),
        ...(status && { status: status as StartupStatus }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { industry: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ],
        }),
      },
      include: {
        students: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        budgetCategories: true,
        _count: {
          select: {
            expenses: true,
            progressUpdates: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Get all approved expenses for these startups
    const startupIds = startups.map((s) => s.id);
    const expenses = await prisma.expense.findMany({
      where: {
        startupId: { in: startupIds },
        status: EXPENSE_STATUS.APPROVED,
      },
      select: {
        startupId: true,
        amount: true,
      },
    });

    // Calculate spent budget per startup
    const spentByStartupId = expenses.reduce((acc, expense) => {
      if (!acc[expense.startupId]) {
        acc[expense.startupId] = 0;
      }
      acc[expense.startupId] += expense.amount;
      return acc;
    }, {} as Record<string, number>);

    // Add spentBudget to each startup
    return startups.map((startup) => ({
      ...startup,
      spentBudget: spentByStartupId[startup.id] || 0,
    }));
  },
};
