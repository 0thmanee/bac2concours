import { z } from "zod";

/**
 * Settings Resources Validation Schemas
 * For Categories, Levels, and Matieres
 */

// ============================================================
// CATEGORY SCHEMAS
// ============================================================

export const createCategorySchema = z.object({
  name: z.string().min(1, "Le nom est requis").max(100, "Le nom est trop long"),
  description: z.string().max(500, "La description est trop longue").optional(),
  isActive: z.boolean().default(true),
  order: z.number().int().min(0).default(0),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  isActive: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
});

// ============================================================
// LEVEL SCHEMAS
// ============================================================

export const createLevelSchema = z.object({
  name: z.string().min(1, "Le nom est requis").max(100, "Le nom est trop long"),
  description: z.string().max(500, "La description est trop longue").optional(),
  isActive: z.boolean().default(true),
  order: z.number().int().min(0).default(0),
});

export const updateLevelSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  isActive: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
});

// ============================================================
// MATIERE SCHEMAS
// ============================================================

export const createMatiereSchema = z.object({
  name: z.string().min(1, "Le nom est requis").max(100, "Le nom est trop long"),
  description: z.string().max(500, "La description est trop longue").optional(),
  isActive: z.boolean().default(true),
  order: z.number().int().min(0).default(0),
});

export const updateMatiereSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  isActive: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
});

// ============================================================
// FILTER SCHEMAS
// ============================================================

export const resourceFiltersSchema = z.object({
  search: z.string().optional(),
  isActive: z.boolean().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(50),
  sortBy: z.enum(["name", "order", "createdAt"]).default("order"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

// ============================================================
// TYPE EXPORTS
// ============================================================

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CreateLevelInput = z.infer<typeof createLevelSchema>;
export type UpdateLevelInput = z.infer<typeof updateLevelSchema>;
export type CreateMatiereInput = z.infer<typeof createMatiereSchema>;
export type UpdateMatiereInput = z.infer<typeof updateMatiereSchema>;
export type ResourceFilters = z.infer<typeof resourceFiltersSchema>;
