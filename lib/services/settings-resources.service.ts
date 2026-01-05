import { prisma } from "@/lib/prisma";
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
  CreateLevelInput,
  UpdateLevelInput,
  CreateMatiereInput,
  UpdateMatiereInput,
  ResourceFilters,
} from "@/lib/validations/settings-resources.validation";
import type { Category, Level, Matiere } from "@prisma/client";

/**
 * Settings Resources Service
 * Handles CRUD operations for Categories, Levels, and Matieres
 */

// ============================================================
// CATEGORY SERVICE
// ============================================================

export const categoryService = {
  /**
   * Get all categories with optional filtering
   */
  async getAll(filters?: Partial<ResourceFilters>): Promise<{
    categories: Category[];
    total: number;
  }> {
    const {
      search,
      isActive,
      page = 1,
      limit = 50,
      sortBy = "order",
      sortOrder = "asc",
    } = filters || {};

    const where = {
      ...(search && {
        name: { contains: search, mode: "insensitive" as const },
      }),
      ...(isActive !== undefined && { isActive }),
    };

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.category.count({ where }),
    ]);

    return { categories, total };
  },

  /**
   * Get active categories for dropdowns
   */
  async getActive(): Promise<Category[]> {
    return prisma.category.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    });
  },

  /**
   * Get a single category by ID
   */
  async getById(id: string): Promise<Category | null> {
    return prisma.category.findUnique({ where: { id } });
  },

  /**
   * Create a new category
   */
  async create(data: CreateCategoryInput): Promise<Category> {
    // Get the highest order value
    const maxOrder = await prisma.category.findFirst({
      orderBy: { order: "desc" },
      select: { order: true },
    });

    return prisma.category.create({
      data: {
        ...data,
        order: data.order ?? (maxOrder?.order ?? 0) + 1,
      },
    });
  },

  /**
   * Update a category
   */
  async update(id: string, data: UpdateCategoryInput): Promise<Category> {
    return prisma.category.update({
      where: { id },
      data,
    });
  },

  /**
   * Delete a category
   */
  async delete(id: string): Promise<void> {
    await prisma.category.delete({ where: { id } });
  },

  /**
   * Reorder categories
   */
  async reorder(orderedIds: string[]): Promise<void> {
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.category.update({
          where: { id },
          data: { order: index },
        })
      )
    );
  },
};

// ============================================================
// LEVEL SERVICE
// ============================================================

export const levelService = {
  /**
   * Get all levels with optional filtering
   */
  async getAll(filters?: Partial<ResourceFilters>): Promise<{
    levels: Level[];
    total: number;
  }> {
    const {
      search,
      isActive,
      page = 1,
      limit = 50,
      sortBy = "order",
      sortOrder = "asc",
    } = filters || {};

    const where = {
      ...(search && {
        name: { contains: search, mode: "insensitive" as const },
      }),
      ...(isActive !== undefined && { isActive }),
    };

    const [levels, total] = await Promise.all([
      prisma.level.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.level.count({ where }),
    ]);

    return { levels, total };
  },

  /**
   * Get active levels for dropdowns
   */
  async getActive(): Promise<Level[]> {
    return prisma.level.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    });
  },

  /**
   * Get a single level by ID
   */
  async getById(id: string): Promise<Level | null> {
    return prisma.level.findUnique({ where: { id } });
  },

  /**
   * Create a new level
   */
  async create(data: CreateLevelInput): Promise<Level> {
    const maxOrder = await prisma.level.findFirst({
      orderBy: { order: "desc" },
      select: { order: true },
    });

    return prisma.level.create({
      data: {
        ...data,
        order: data.order ?? (maxOrder?.order ?? 0) + 1,
      },
    });
  },

  /**
   * Update a level
   */
  async update(id: string, data: UpdateLevelInput): Promise<Level> {
    return prisma.level.update({
      where: { id },
      data,
    });
  },

  /**
   * Delete a level
   */
  async delete(id: string): Promise<void> {
    await prisma.level.delete({ where: { id } });
  },

  /**
   * Reorder levels
   */
  async reorder(orderedIds: string[]): Promise<void> {
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.level.update({
          where: { id },
          data: { order: index },
        })
      )
    );
  },
};

// ============================================================
// MATIERE SERVICE
// ============================================================

export const matiereService = {
  /**
   * Get all matieres with optional filtering
   */
  async getAll(filters?: Partial<ResourceFilters>): Promise<{
    matieres: Matiere[];
    total: number;
  }> {
    const {
      search,
      isActive,
      page = 1,
      limit = 50,
      sortBy = "order",
      sortOrder = "asc",
    } = filters || {};

    const where = {
      ...(search && {
        name: { contains: search, mode: "insensitive" as const },
      }),
      ...(isActive !== undefined && { isActive }),
    };

    const [matieres, total] = await Promise.all([
      prisma.matiere.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.matiere.count({ where }),
    ]);

    return { matieres, total };
  },

  /**
   * Get active matieres for dropdowns
   */
  async getActive(): Promise<Matiere[]> {
    return prisma.matiere.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    });
  },

  /**
   * Get a single matiere by ID
   */
  async getById(id: string): Promise<Matiere | null> {
    return prisma.matiere.findUnique({ where: { id } });
  },

  /**
   * Create a new matiere
   */
  async create(data: CreateMatiereInput): Promise<Matiere> {
    const maxOrder = await prisma.matiere.findFirst({
      orderBy: { order: "desc" },
      select: { order: true },
    });

    return prisma.matiere.create({
      data: {
        ...data,
        order: data.order ?? (maxOrder?.order ?? 0) + 1,
      },
    });
  },

  /**
   * Update a matiere
   */
  async update(id: string, data: UpdateMatiereInput): Promise<Matiere> {
    return prisma.matiere.update({
      where: { id },
      data,
    });
  },

  /**
   * Delete a matiere
   */
  async delete(id: string): Promise<void> {
    await prisma.matiere.delete({ where: { id } });
  },

  /**
   * Reorder matieres
   */
  async reorder(orderedIds: string[]): Promise<void> {
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.matiere.update({
          where: { id },
          data: { order: index },
        })
      )
    );
  },
};

// ============================================================
// COMBINED DROPDOWN OPTIONS
// ============================================================

/**
 * Get all active resources for form dropdowns
 */
export async function getDropdownOptions() {
  const [categories, levels, matieres] = await Promise.all([
    categoryService.getActive(),
    levelService.getActive(),
    matiereService.getActive(),
  ]);

  return {
    categories: categories.map((c) => ({ value: c.name, label: c.name })),
    levels: levels.map((l) => ({ value: l.name, label: l.name })),
    matieres: matieres.map((m) => ({ value: m.name, label: m.name })),
  };
}
