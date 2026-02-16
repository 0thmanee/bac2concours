import { z } from "zod";

/**
 * Announcement validation schemas
 */

export const announcementStatusSchema = z.enum(["DRAFT", "PUBLISHED"]);
export const announcementTypeSchema = z.enum([
  "REGISTRATION",
  "EVENT",
  "GENERAL",
]);

export const createAnnouncementSchema = z.object({
  title: z
    .string()
    .min(1, "Le titre est requis")
    .max(200, "Le titre est trop long"),
  content: z
    .string()
    .min(1, "Le contenu est requis")
    .max(10000, "Le contenu est trop long"),
  type: announcementTypeSchema.default("GENERAL"),
  status: announcementStatusSchema.default("DRAFT"),
  linkUrl: z.string().url("URL invalide").optional().or(z.literal("")),
  schoolId: z.string().optional().nullable(),
});

export const updateAnnouncementSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).max(10000).optional(),
  type: announcementTypeSchema.optional(),
  status: announcementStatusSchema.optional(),
  linkUrl: z.string().url().optional().nullable().or(z.literal("")),
  schoolId: z.string().optional().nullable(),
});

export const announcementFiltersSchema = z.object({
  search: z.string().optional(),
  type: announcementTypeSchema.optional(),
  status: announcementStatusSchema.optional(),
  schoolId: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  sortBy: z.enum(["createdAt", "publishedAt", "title"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>;
export type UpdateAnnouncementInput = z.infer<typeof updateAnnouncementSchema>;
export type AnnouncementFilters = z.infer<typeof announcementFiltersSchema>;
export type AnnouncementStatusType = z.infer<typeof announcementStatusSchema>;
export type AnnouncementTypeInput = z.infer<typeof announcementTypeSchema>;
