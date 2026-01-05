/**
 * School Service
 * Business logic for managing educational schools/institutions
 */

import { prisma } from "@/lib/prisma";
import type {
  CreateSchoolInput,
  UpdateSchoolInput,
  SchoolFilters,
  SchoolStats,
  SchoolFilterOptions,
} from "@/lib/validations/school.validation";

export const schoolService = {
  /**
   * Get all schools with optional filtering, pagination, and sorting
   */
  async findAll(filters: SchoolFilters) {
    const {
      search,
      type,
      city,
      region,
      status,
      isPublic,
      featured,
      bourses,
      page,
      limit,
      sortBy,
      sortOrder,
    } = filters;

    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { shortName: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
      ];
    }

    if (type) where.type = type;
    if (city) where.city = city;
    if (region) where.region = region;
    if (status) where.status = status;
    if (typeof isPublic === "boolean") where.isPublic = isPublic;
    if (typeof featured === "boolean") where.featured = featured;
    if (typeof bourses === "boolean") where.bourses = bourses;

    // Get total count
    const total = await prisma.school.count({ where });

    // Get paginated schools
    const schools = await prisma.school.findMany({
      where,
      select: {
        id: true,
        name: true,
        shortName: true,
        type: true,
        description: true,
        imageFileId: true,
        imageFile: true,
        logoFileId: true,
        logoFile: true,
        city: true,
        region: true,
        seuilDeSelection: true,
        nombreEtudiants: true,
        tauxReussite: true,
        classementNational: true,
        bourses: true,
        featured: true,
        isPublic: true,
        status: true,
        views: true,
        createdAt: true,
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      schools,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  /**
   * Get a single school by ID
   */
  async findById(id: string) {
    return prisma.school.findUnique({
      where: { id },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        imageFile: true,
        logoFile: true,
      },
    });
  },

  /**
   * Create a new school
   */
  async create(data: CreateSchoolInput, uploadedById: string) {
    // Clean empty string fields
    const cleanedData = {
      ...data,
      email: data.email || null,
      website: data.website || null,
    };

    return prisma.school.create({
      data: {
        ...cleanedData,
        uploadedById,
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        imageFile: true,
        logoFile: true,
      },
    });
  },

  /**
   * Update a school
   */
  async update(id: string, data: UpdateSchoolInput) {
    // Clean empty string fields
    const cleanedData = {
      ...data,
      email: data.email === "" ? null : data.email,
      website: data.website === "" ? null : data.website,
    };

    return prisma.school.update({
      where: { id },
      data: cleanedData,
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        imageFile: true,
        logoFile: true,
      },
    });
  },

  /**
   * Delete a school
   */
  async delete(id: string): Promise<void> {
    await prisma.school.delete({
      where: { id },
    });
  },

  /**
   * Increment view counter
   */
  async incrementView(id: string) {
    return prisma.school.update({
      where: { id },
      data: {
        views: {
          increment: 1,
        },
      },
    });
  },

  /**
   * Get school statistics
   */
  async getStats(): Promise<SchoolStats> {
    const [
      totalSchools,
      activeSchools,
      featuredSchools,
      aggregations,
      typeGroup,
      cityGroup,
    ] = await Promise.all([
      prisma.school.count(),
      prisma.school.count({ where: { status: "ACTIVE" } }),
      prisma.school.count({ where: { featured: true } }),
      prisma.school.aggregate({
        _sum: {
          views: true,
        },
      }),
      prisma.school.groupBy({
        by: ["type"],
        _count: {
          id: true,
        },
      }),
      prisma.school.groupBy({
        by: ["city"],
        _count: {
          id: true,
        },
      }),
    ]);

    const schoolsByType: Record<string, number> = {};
    typeGroup.forEach((group) => {
      schoolsByType[group.type] = group._count.id;
    });

    const schoolsByCity: Record<string, number> = {};
    cityGroup.forEach((group) => {
      schoolsByCity[group.city] = group._count.id;
    });

    return {
      totalSchools,
      activeSchools,
      featuredSchools,
      totalViews: aggregations._sum.views || 0,
      schoolsByType,
      schoolsByCity,
    };
  },

  /**
   * Get unique values for filters
   */
  async getFilterOptions(): Promise<SchoolFilterOptions> {
    const [types, cities, regions] = await Promise.all([
      prisma.school.findMany({
        select: { type: true },
        distinct: ["type"],
        orderBy: { type: "asc" },
      }),
      prisma.school.findMany({
        select: { city: true },
        distinct: ["city"],
        orderBy: { city: "asc" },
      }),
      prisma.school.findMany({
        where: { region: { not: null } },
        select: { region: true },
        distinct: ["region"],
        orderBy: { region: "asc" },
      }),
    ]);

    return {
      types: types.map((t) => t.type),
      cities: cities.map((c) => c.city),
      regions: regions
        .map((r) => r.region)
        .filter((r): r is string => r !== null),
    };
  },

  /**
   * Toggle featured status
   */
  async toggleFeatured(id: string) {
    const school = await prisma.school.findUnique({
      where: { id },
      select: { featured: true },
    });

    if (!school) {
      throw new Error("School not found");
    }

    return prisma.school.update({
      where: { id },
      data: { featured: !school.featured },
    });
  },

  /**
   * Get related schools based on type and city
   */
  async getRelated(id: string, limit = 5) {
    const school = await prisma.school.findUnique({
      where: { id },
      select: { type: true, city: true },
    });

    if (!school) {
      return [];
    }

    return prisma.school.findMany({
      where: {
        id: { not: id },
        status: "ACTIVE",
        isPublic: true,
        OR: [{ type: school.type }, { city: school.city }],
      },
      select: {
        id: true,
        name: true,
        shortName: true,
        type: true,
        description: true,
        imageFile: true,
        logoFile: true,
        city: true,
        views: true,
        classementNational: true,
      },
      orderBy: [{ views: "desc" }],
      take: limit,
    });
  },
};
