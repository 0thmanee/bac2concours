import { z } from "zod";

/**
 * School validation schemas - Source of truth for all school types
 */

// School status and type enum schemas using string literals for client/server compatibility
export const schoolStatusSchema = z.enum(["ACTIVE", "INACTIVE", "DRAFT"]);
export const schoolTypeSchema = z.enum([
  "UNIVERSITE",
  "ECOLE_INGENIEUR",
  "ECOLE_COMMERCE",
  "INSTITUT",
  "FACULTE",
]);

// Program schema for the programs JSON field
export const schoolProgramSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Le nom du programme est requis"),
  description: z.string().optional(),
  duration: z.string().optional(), // e.g., "3 ans"
  requirements: z.array(z.string()).optional().default([]),
});

// Base school schema for creation
export const createSchoolSchema = z.object({
  name: z.string().min(1, "Le nom est requis").max(200, "Le nom est trop long"),
  shortName: z.string().max(20, "L'abréviation est trop longue").optional(),
  type: schoolTypeSchema,
  description: z
    .string()
    .min(1, "La description est requise")
    .max(500, "La description est trop longue"),
  longDescription: z
    .string()
    .max(5000, "La description détaillée est trop longue")
    .optional(),

  // Images
  imageFileId: z.string().optional(),
  logoFileId: z.string().optional(),

  // Location
  city: z.string().min(1, "La ville est requise").max(100),
  address: z.string().max(300).optional(),
  region: z.string().max(100).optional(),

  // Contact
  phone: z.string().max(30).optional(),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  website: z.string().url("URL invalide").optional().or(z.literal("")),

  // Admission
  seuilDeSelection: z.preprocess(
    (val) =>
      val === "" || val === null || val === undefined || Number.isNaN(val)
        ? undefined
        : Number(val),
    z.number().min(0).max(20).optional()
  ),
  documentsRequis: z.array(z.string().max(100)).default([]),
  datesConcours: z.string().max(100).optional(),
  fraisInscription: z.preprocess(
    (val) =>
      val === "" || val === null || val === undefined || Number.isNaN(val)
        ? undefined
        : Number(val),
    z.number().min(0).optional()
  ),
  bourses: z.boolean().default(false),

  // Statistics
  nombreEtudiants: z.preprocess(
    (val) =>
      val === "" || val === null || val === undefined || Number.isNaN(val)
        ? undefined
        : Number(val),
    z.number().int().positive().optional()
  ),
  tauxReussite: z.preprocess(
    (val) =>
      val === "" || val === null || val === undefined || Number.isNaN(val)
        ? undefined
        : Number(val),
    z.number().min(0).max(100).optional()
  ),
  classementNational: z.preprocess(
    (val) =>
      val === "" || val === null || val === undefined || Number.isNaN(val)
        ? undefined
        : Number(val),
    z.number().int().positive().optional()
  ),

  // Programs and details
  programs: z.array(schoolProgramSchema).default([]),
  specializations: z.array(z.string().max(100)).default([]),
  avantages: z.array(z.string().max(200)).default([]),
  services: z.array(z.string().max(100)).default([]),
  infrastructures: z.array(z.string().max(100)).default([]),
  partenariats: z.array(z.string().max(100)).default([]),

  // Meta
  isPublic: z.boolean().default(true),
  featured: z.boolean().default(false),
  establishedYear: z.preprocess(
    (val) =>
      val === "" || val === null || val === undefined || Number.isNaN(val)
        ? undefined
        : Number(val),
    z.number().int().min(1800).max(2100).optional()
  ),
  status: schoolStatusSchema.default("DRAFT"),
});

// Helper to coerce NaN to null for optional positive integer fields
const optionalPositiveInt = z.preprocess(
  (val) =>
    val === "" || val === null || val === undefined || Number.isNaN(val)
      ? null
      : Number(val),
  z.number().int().positive().nullable().optional()
);

// Schema for updating a school (all fields optional)
export const updateSchoolSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  shortName: z.string().max(20).optional().nullable(),
  type: schoolTypeSchema.optional(),
  description: z.string().min(1).max(500).optional(),
  longDescription: z.string().max(5000).optional().nullable(),

  // Images
  imageFileId: z.string().optional().nullable(),
  logoFileId: z.string().optional().nullable(),

  // Location
  city: z.string().min(1).max(100).optional(),
  address: z.string().max(300).optional().nullable(),
  region: z.string().max(100).optional().nullable(),

  // Contact
  phone: z.string().max(30).optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal("")),
  website: z.string().url().optional().nullable().or(z.literal("")),

  // Admission
  seuilDeSelection: z.preprocess(
    (val) =>
      val === "" || val === null || val === undefined || Number.isNaN(val)
        ? null
        : Number(val),
    z.number().min(0).max(20).nullable().optional()
  ),
  documentsRequis: z.array(z.string().max(100)).optional(),
  datesConcours: z.string().max(100).optional().nullable(),
  fraisInscription: z.preprocess(
    (val) =>
      val === "" || val === null || val === undefined || Number.isNaN(val)
        ? null
        : Number(val),
    z.number().min(0).nullable().optional()
  ),
  bourses: z.boolean().optional(),

  // Statistics
  nombreEtudiants: optionalPositiveInt,
  tauxReussite: z.preprocess(
    (val) =>
      val === "" || val === null || val === undefined || Number.isNaN(val)
        ? null
        : Number(val),
    z.number().min(0).max(100).nullable().optional()
  ),
  classementNational: optionalPositiveInt,

  // Programs and details
  programs: z.array(schoolProgramSchema).optional().nullable(),
  specializations: z.array(z.string().max(100)).optional(),
  avantages: z.array(z.string().max(200)).optional(),
  services: z.array(z.string().max(100)).optional(),
  infrastructures: z.array(z.string().max(100)).optional(),
  partenariats: z.array(z.string().max(100)).optional(),

  // Meta
  isPublic: z.boolean().optional(),
  featured: z.boolean().optional(),
  establishedYear: z.preprocess(
    (val) =>
      val === "" || val === null || val === undefined || Number.isNaN(val)
        ? null
        : Number(val),
    z.number().int().min(1800).max(2100).nullable().optional()
  ),
  status: schoolStatusSchema.optional(),
});

// Schema for school filters/search
export const schoolFiltersSchema = z.object({
  search: z.string().optional(),
  type: schoolTypeSchema.optional(),
  city: z.string().optional(),
  region: z.string().optional(),
  status: schoolStatusSchema.optional(),
  isPublic: z.boolean().optional(),
  featured: z.boolean().optional(),
  bourses: z.boolean().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  sortBy: z
    .enum([
      "name",
      "createdAt",
      "views",
      "classementNational",
      "seuilDeSelection",
    ])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// UI Filter options (for dropdowns in the UI)
export const schoolUIFiltersSchema = z.object({
  search: z.string().default(""),
  type: z.string().default(""),
  city: z.string().default(""),
  status: z.string().default(""),
});

// School stats schema
export const schoolStatsSchema = z.object({
  totalSchools: z.number(),
  activeSchools: z.number(),
  featuredSchools: z.number(),
  totalViews: z.number(),
  schoolsByType: z.record(z.string(), z.number()),
  schoolsByCity: z.record(z.string(), z.number()),
});

// School filter options schema
export const schoolFilterOptionsSchema = z.object({
  types: z.array(z.string()),
  cities: z.array(z.string()),
  regions: z.array(z.string()),
});

// Type exports - All types derived from Zod schemas
export type SchoolProgram = z.infer<typeof schoolProgramSchema>;
export type CreateSchoolInput = z.infer<typeof createSchoolSchema>;
export type UpdateSchoolInput = z.infer<typeof updateSchoolSchema>;
export type SchoolFilters = z.infer<typeof schoolFiltersSchema>;
export type SchoolUIFilters = z.infer<typeof schoolUIFiltersSchema>;
export type SchoolStatusInput = z.infer<typeof schoolStatusSchema>;
export type SchoolTypeInput = z.infer<typeof schoolTypeSchema>;
export type SchoolStats = z.infer<typeof schoolStatsSchema>;
export type SchoolFilterOptions = z.infer<typeof schoolFilterOptionsSchema>;

// Filter options for dropdowns (populated from database)
export type SchoolFilterOptionsType = {
  types: string[];
  cities: string[];
  regions: string[];
};

// School with relations (from API)
export type SchoolWithRelations = {
  id: string;
  name: string;
  shortName: string | null;
  type: string;
  description: string;
  longDescription: string | null;
  imageFileId: string | null;
  imageFile: {
    id: string;
    filename: string;
    publicUrl: string;
    mimeType: string;
    size: number;
  } | null;
  logoFileId: string | null;
  logoFile: {
    id: string;
    filename: string;
    publicUrl: string;
    mimeType: string;
    size: number;
  } | null;
  city: string;
  address: string | null;
  region: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  seuilDeSelection: number | null;
  documentsRequis: string[];
  datesConcours: string | null;
  fraisInscription: number | null;
  bourses: boolean;
  nombreEtudiants: number | null;
  tauxReussite: number | null;
  classementNational: number | null;
  programs: SchoolProgram[] | null;
  specializations: string[];
  avantages: string[];
  services: string[];
  infrastructures: string[];
  partenariats: string[];
  isPublic: boolean;
  featured: boolean;
  establishedYear: number | null;
  status: string;
  views: number;
  createdAt: Date;
  updatedAt: Date;
};
