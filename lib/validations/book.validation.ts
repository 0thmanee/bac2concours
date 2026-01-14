import { z } from "zod";
import { BookStatus } from "@prisma/client";

/**
 * Book validation schemas - Source of truth for all book types
 */

// Book status enum schema
export const bookStatusSchema = z.nativeEnum(BookStatus);

// Base book schema for creation
export const createBookSchema = z.object({
  title: z
    .string()
    .min(1, "Le titre est requis")
    .max(200, "Le titre est trop long"),
  author: z
    .string()
    .min(1, "L'auteur est requis")
    .max(100, "Le nom de l'auteur est trop long"),
  school: z.string().min(1, "L'école est requise").max(100),
  category: z.string().min(1, "La catégorie est requise").max(50),
  description: z
    .string()
    .max(2000, "La description est trop longue")
    .optional(),
  coverFileId: z.string().optional(), // Uploaded cover image file ID
  fileUrl: z
    .string()
    .url("URL du fichier invalide")
    .min(1, "L'URL du fichier (Google Drive) est requise"),
  fileName: z.string().min(1, "Le nom du fichier est requis").max(255),
  fileSize: z.string().min(1, "La taille du fichier est requise"),
  totalPages: z.preprocess(
    (val) =>
      val === "" || val === null || val === undefined || Number.isNaN(val)
        ? 0
        : Number(val),
    z.number().int().positive("Le nombre de pages doit être positif")
  ),
  language: z.string().max(10).default("fr"),
  level: z.string().min(1, "Le niveau est requis").max(50),
  subjects: z.array(z.string().max(50)).min(1, "Au moins une matière est requise").default([]),
  tags: z.array(z.string().max(50)).default([]),
  status: bookStatusSchema.default(BookStatus.ACTIVE),
  isPublic: z.boolean().default(true),
});

// Schema for updating a book (all fields optional except validation rules)
export const updateBookSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  author: z.string().min(1).max(100).optional(),
  school: z.string().min(1).max(100).optional(),
  category: z.string().min(1).max(50).optional(),
  description: z.string().max(2000).optional(),
  coverFileId: z.string().optional().nullable(),
  fileUrl: z.string().url().optional(),
  fileName: z.string().min(1).max(255).optional(),
  fileSize: z.string().optional(),
  totalPages: z.preprocess(
    (val) =>
      val === "" || val === null || val === undefined || Number.isNaN(val)
        ? undefined
        : Number(val),
    z.number().int().positive().optional()
  ),
  language: z.string().max(10).optional(),
  level: z.string().min(1).max(50).optional(),
  subjects: z.array(z.string().max(50)).optional(),
  tags: z.array(z.string().max(50)).optional(),
  status: bookStatusSchema.optional(),
  isPublic: z.boolean().optional(),
});

// Schema for book filters/search
export const bookFiltersSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  school: z.string().optional(),
  level: z.string().optional(),
  subject: z.string().optional(),
  status: bookStatusSchema.optional(),
  isPublic: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  sortBy: z
    .enum(["title", "createdAt", "downloads", "views"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// UI Filter options (for dropdowns in the UI)
export const bookUIFiltersSchema = z.object({
  search: z.string().default(""),
  category: z.string().default(""),
  level: z.string().default(""),
});

// Query params schema for API (subset of filters as strings for URL)
export const bookQueryParamsSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  school: z.string().optional(),
  level: z.string().optional(),
  subject: z.string().optional(),
  status: bookStatusSchema.optional(),
  isPublic: z.boolean().optional(),
  tags: z.string().optional(), // Comma-separated for URL
  page: z.string().optional(),
  limit: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.string().optional(),
});

// Schema for incrementing book counters
export const incrementBookCounterSchema = z.object({
  type: z.enum(["download", "view"]),
});

// Book stats schema
export const bookStatsSchema = z.object({
  totalBooks: z.number(),
  activeBooks: z.number(),
  totalDownloads: z.number(),
  totalViews: z.number(),
  booksByCategory: z.record(z.string(), z.number()),
  booksByLevel: z.record(z.string(), z.number()),
});

// Book filter options schema
export const bookFilterOptionsSchema = z.object({
  categories: z.array(z.string()),
  schools: z.array(z.string()),
  levels: z.array(z.string()),
  subjects: z.array(z.string()),
});

// Type exports - All types derived from Zod schemas
export type CreateBookInput = z.infer<typeof createBookSchema>;
export type UpdateBookInput = z.infer<typeof updateBookSchema>;
export type BookFilters = z.infer<typeof bookFiltersSchema>;
export type BookUIFilters = z.infer<typeof bookUIFiltersSchema>;
export type BookQueryParams = z.infer<typeof bookQueryParamsSchema>;
export type IncrementBookCounter = z.infer<typeof incrementBookCounterSchema>;
export type BookStatusInput = z.infer<typeof bookStatusSchema>;
export type BookStatusType = BookStatus;
export type BookStats = z.infer<typeof bookStatsSchema>;
export type BookFilterOptions = z.infer<typeof bookFilterOptionsSchema>;
