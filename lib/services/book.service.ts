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
import { notificationService } from "@/lib/services/notification.service";

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
    if (subject) where.subjects = { has: subject }; // Filter by subjects array
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
        subjects: true,
        tags: true,
        downloads: true,
        views: true,
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
    const book = await prisma.book.create({
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

    // Notify students about the new book if it's active
    if (data.status === "ACTIVE") {
      notificationService
        .onNewResourcePublished("BOOK", book.title, book.id)
        .catch(console.error);
    }

    return book;
  },

  /**
   * Update a book
   */
  async update(id: string, data: UpdateBookInput) {
    // Get current book to check for status changes
    const currentBook = await prisma.book.findUnique({
      where: { id },
      select: { status: true, title: true },
    });

    // Only include defined values (not undefined)
    const cleanedData: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        cleanedData[key] = value;
      }
    }

    const updatedBook = await prisma.book.update({
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
        coverFile: true,
      },
    });

    // Notify admins if status changed
    if (currentBook && data.status && data.status !== currentBook.status) {
      notificationService
        .onResourceStatusChanged(
          "BOOK",
          currentBook.title,
          currentBook.status,
          data.status,
          updatedBook.uploadedById
        )
        .catch(console.error);
    }

    return updatedBook;
  },

  /**
   * Delete a book
   */
  async delete(id: string): Promise<void> {
    // Get book details before deletion
    const book = await prisma.book.findUnique({
      where: { id },
      select: { title: true, uploadedById: true },
    });

    await prisma.book.delete({
      where: { id },
    });

    // Notify admins about deletion
    if (book) {
      notificationService
        .onResourceDeleted("BOOK", book.title, book.uploadedById)
        .catch(console.error);
    }
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
      booksByCategory,
      booksByLevel,
    };
  },

  /**
   * Get unique values for filters
   */
  async getFilterOptions(): Promise<BookFilterOptions> {
    const [categories, schools, levels, booksWithSubjects] = await Promise.all([
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
        select: { subjects: true },
      }),
    ]);

    // Flatten subjects arrays and get unique values
    const allSubjects = booksWithSubjects.flatMap((b) => b.subjects || []);
    const uniqueSubjects = Array.from(new Set(allSubjects)).sort();

    return {
      categories: categories.map((c) => c.category),
      schools: schools.map((s) => s.school),
      levels: levels.map((l) => l.level),
      subjects: uniqueSubjects,
    };
  },

  /**
   * Get related books (same category, level, or subjects, excluding current book)
   */
  async findRelated(bookId: string, limit: number = 5) {
    // First get the current book to know its category, level and subjects
    const currentBook = await prisma.book.findUnique({
      where: { id: bookId },
      select: { category: true, level: true, subjects: true },
    });

    if (!currentBook) {
      return [];
    }

    // Find books with same category, level, or subjects (excluding current book)
    return prisma.book.findMany({
      where: {
        id: { not: bookId },
        status: "ACTIVE",
        isPublic: true,
        OR: [
          { category: currentBook.category },
          { level: currentBook.level },
          ...(currentBook.subjects && currentBook.subjects.length > 0
            ? [{ subjects: { hasSome: currentBook.subjects } }]
            : []),
        ],
      },
      select: {
        id: true,
        title: true,
        author: true,
        category: true,
        level: true,
        coverFile: true,
        views: true,
      },
      orderBy: [{ views: "desc" }],
      take: limit,
    });
  },
};
