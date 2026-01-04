/**
 * Book Service
 * Business logic for managing educational books
 */

import { prisma } from "@/lib/prisma";
import type {
  CreateBookInput,
  UpdateBookInput,
  BookFilters,
  BookStats,
  BookFilterOptions,
} from "@/lib/validations/book.validation";

export const bookService = {
  /**
   * Get all books with optional filtering, pagination, and sorting
   */
  async findAll(filters: BookFilters) {
    const {
      search,
      category,
      school,
      level,
      subject,
      status,
      isPublic,
      tags,
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
        { title: { contains: search, mode: "insensitive" } },
        { author: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category) where.category = category;
    if (school) where.school = school;
    if (level) where.level = level;
    if (subject) where.subject = subject;
    if (status) where.status = status;
    if (typeof isPublic === "boolean") where.isPublic = isPublic;
    if (tags && tags.length > 0) {
      where.tags = { hasSome: tags };
    }

    // Get total count
    const total = await prisma.book.count({ where });

    // Get paginated books
    const books = await prisma.book.findMany({
      where,
      select: {
        id: true,
        title: true,
        author: true,
        school: true,
        category: true,
        coverFileId: true,
        coverFile: true,
        fileSize: true,
        totalPages: true,
        level: true,
        subject: true,
        tags: true,
        downloads: true,
        views: true,
        rating: true,
        status: true,
        isPublic: true,
        createdAt: true,
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      books,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  /**
   * Get a single book by ID
   */
  async findById(id: string) {
    return prisma.book.findUnique({
      where: { id },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        coverFile: true,
      },
    });
  },

  /**
   * Create a new book
   */
  async create(data: CreateBookInput, uploadedById: string) {
    return prisma.book.create({
      data: {
        ...data,
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
        coverFile: true,
      },
    });
  },

  /**
   * Update a book
   */
  async update(id: string, data: UpdateBookInput) {
    return prisma.book.update({
      where: { id },
      data,
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        coverFile: true,
      },
    });
  },

  /**
   * Delete a book
   */
  async delete(id: string): Promise<void> {
    await prisma.book.delete({
      where: { id },
    });
  },

  /**
   * Increment download counter
   */
  async incrementDownload(id: string) {
    return prisma.book.update({
      where: { id },
      data: {
        downloads: {
          increment: 1,
        },
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  },

  /**
   * Increment view counter
   */
  async incrementView(id: string) {
    return prisma.book.update({
      where: { id },
      data: {
        views: {
          increment: 1,
        },
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  },

  /**
   * Get book statistics
   */
  async getStats(): Promise<BookStats> {
    const [totalBooks, activeBooks, aggregations, categoryGroup, levelGroup] =
      await Promise.all([
        prisma.book.count(),
        prisma.book.count({ where: { status: "ACTIVE" } }),
        prisma.book.aggregate({
          _sum: {
            downloads: true,
            views: true,
          },
          _avg: {
            rating: true,
          },
        }),
        prisma.book.groupBy({
          by: ["category"],
          _count: {
            id: true,
          },
        }),
        prisma.book.groupBy({
          by: ["level"],
          _count: {
            id: true,
          },
        }),
      ]);

    const booksByCategory: Record<string, number> = {};
    categoryGroup.forEach((group) => {
      booksByCategory[group.category] = group._count.id;
    });

    const booksByLevel: Record<string, number> = {};
    levelGroup.forEach((group) => {
      booksByLevel[group.level] = group._count.id;
    });

    return {
      totalBooks,
      activeBooks,
      totalDownloads: aggregations._sum.downloads || 0,
      totalViews: aggregations._sum.views || 0,
      averageRating: aggregations._avg.rating || 0,
      booksByCategory,
      booksByLevel,
    };
  },

  /**
   * Get unique values for filters
   */
  async getFilterOptions(): Promise<BookFilterOptions> {
    const [categories, schools, levels, subjects] = await Promise.all([
      prisma.book.findMany({
        select: { category: true },
        distinct: ["category"],
        orderBy: { category: "asc" },
      }),
      prisma.book.findMany({
        select: { school: true },
        distinct: ["school"],
        orderBy: { school: "asc" },
      }),
      prisma.book.findMany({
        select: { level: true },
        distinct: ["level"],
        orderBy: { level: "asc" },
      }),
      prisma.book.findMany({
        select: { subject: true },
        distinct: ["subject"],
        orderBy: { subject: "asc" },
      }),
    ]);

    return {
      categories: categories.map((c) => c.category),
      schools: schools.map((s) => s.school),
      levels: levels.map((l) => l.level),
      subjects: subjects.map((s) => s.subject),
    };
  },
};
