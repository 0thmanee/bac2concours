import prisma from "@/lib/prisma";
import type {
  CreateProgressUpdateServiceInput,
  ProgressFindAllFilters,
} from "@/lib/validations/progress.validation";

export const progressService = {
  // Get all progress updates with filters
  async findAll(filters?: ProgressFindAllFilters) {
    return prisma.progressUpdate.findMany({
      where: {
        ...(filters?.startupId && { startupId: filters.startupId }),
        ...(filters?.submittedById && { submittedById: filters.submittedById }),
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
  },

  // Get single progress update
  async findById(id: string) {
    return prisma.progressUpdate.findUnique({
      where: { id },
      include: {
        startup: true,
        submittedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  },

  // Create progress update
  async create(data: CreateProgressUpdateServiceInput) {
    return prisma.progressUpdate.create({
      data,
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
          },
        },
      },
    });
  },

  // Get updates by startup
  async findByStartupId(startupId: string) {
    return prisma.progressUpdate.findMany({
      where: { startupId },
      include: {
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
  },
};
