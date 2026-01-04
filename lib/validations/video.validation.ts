import { z } from "zod";
import { VideoStatus } from "@prisma/client";

/**
 * Video validation schemas - Source of truth for all video types
 */

// Video status enum schema
export const videoStatusSchema = z.nativeEnum(VideoStatus);

// Helper to validate YouTube URLs and extract video ID
const youtubeUrlRegex =
  /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:\?.*)?$/;

export const youtubeUrlSchema = z
  .string()
  .url("URL invalide")
  .refine(
    (url) => youtubeUrlRegex.test(url),
    "L'URL doit être une URL YouTube valide"
  );

// Base video schema for creation
export const createVideoSchema = z.object({
  title: z
    .string()
    .min(1, "Le titre est requis")
    .max(200, "Le titre est trop long"),
  description: z
    .string()
    .max(2000, "La description est trop longue")
    .optional(),
  url: youtubeUrlSchema,
  thumbnailFileId: z.string().optional(), // Uploaded thumbnail image file ID
  school: z.string().min(1, "L'école est requise").max(100),
  category: z.string().min(1, "La catégorie est requise").max(50),
  level: z.string().min(1, "Le niveau est requis").max(50),
  subject: z.string().min(1, "La matière est requise").max(50),
  tags: z.array(z.string().max(50)).default([]),
  duration: z.number().int().positive("La durée doit être positive").optional(),
  status: videoStatusSchema.default(VideoStatus.ACTIVE),
  isPublic: z.boolean().default(true),
});

// Schema for updating a video (all fields optional except validation rules)
export const updateVideoSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  url: youtubeUrlSchema.optional(),
  thumbnailFileId: z.string().optional().nullable(),
  school: z.string().min(1).max(100).optional(),
  category: z.string().min(1).max(50).optional(),
  level: z.string().min(1).max(50).optional(),
  subject: z.string().min(1).max(50).optional(),
  tags: z.array(z.string().max(50)).optional(),
  duration: z.number().int().positive().optional(),
  status: videoStatusSchema.optional(),
  isPublic: z.boolean().optional(),
});

// Schema for video filters/search
export const videoFiltersSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  school: z.string().optional(),
  level: z.string().optional(),
  subject: z.string().optional(),
  status: videoStatusSchema.optional(),
  isPublic: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  sortBy: z
    .enum(["title", "createdAt", "views", "rating"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// UI Filter options (for dropdowns in the UI)
export const videoUIFiltersSchema = z.object({
  search: z.string().default(""),
  category: z.string().default(""),
  level: z.string().default(""),
});

// Query params schema for API (subset of filters as strings for URL)
export const videoQueryParamsSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  school: z.string().optional(),
  level: z.string().optional(),
  subject: z.string().optional(),
  status: videoStatusSchema.optional(),
  isPublic: z.boolean().optional(),
  tags: z.string().optional(), // Comma-separated for URL
  page: z.string().optional(),
  limit: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.string().optional(),
});

// Response schema for a single video
export const videoResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  url: z.string(),
  youtubeId: z.string().nullable(),
  thumbnailFileId: z.string().nullable(),
  thumbnailFile: z
    .object({
      id: z.string(),
      filename: z.string(),
      publicUrl: z.string(),
      mimeType: z.string(),
      size: z.number(),
    })
    .nullable()
    .optional(),
  school: z.string(),
  category: z.string(),
  level: z.string(),
  subject: z.string(),
  tags: z.array(z.string()),
  duration: z.number().nullable(),
  views: z.number(),
  rating: z.number(),
  status: videoStatusSchema,
  isPublic: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// ============================================================
// TYPESCRIPT TYPES (Inferred from schemas)
// ============================================================

export type CreateVideoInput = z.infer<typeof createVideoSchema>;
export type UpdateVideoInput = z.infer<typeof updateVideoSchema>;
export type VideoFilters = z.infer<typeof videoFiltersSchema>;
export type VideoUIFilters = z.infer<typeof videoUIFiltersSchema>;
export type VideoQueryParams = z.infer<typeof videoQueryParamsSchema>;
export type VideoResponse = z.infer<typeof videoResponseSchema>;
export type VideoStatusType = z.infer<typeof videoStatusSchema>;

// Filter options for dropdowns (populated from database)
export type VideoFilterOptions = {
  categories: string[];
  schools: string[];
  levels: string[];
  subjects: string[];
};

// Stats for dashboard
export type VideoStats = {
  total: number;
  active: number;
  inactive: number;
  totalViews: number;
  averageRating: number;
};

// Video with relations (from API)
export type VideoWithRelations = {
  id: string;
  title: string;
  description: string | null;
  url: string;
  youtubeId: string | null;
  thumbnailFileId: string | null;
  thumbnailFile: {
    id: string;
    filename: string;
    publicUrl: string;
    mimeType: string;
    size: number;
  } | null;
  school: string;
  category: string;
  level: string;
  subject: string;
  tags: string[];
  duration: number | null;
  views: number;
  rating: number;
  status: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Extract YouTube video ID from URL
 */
export function extractYouTubeId(url: string): string | null {
  const match = url.match(youtubeUrlRegex);
  return match ? match[1] : null;
}

/**
 * Generate YouTube thumbnail URL from video ID
 */
export function getYouTubeThumbnailUrl(
  videoId: string,
  quality: "default" | "hq" | "mq" | "sd" | "maxres" = "hq"
): string {
  return `https://img.youtube.com/vi/${videoId}/${quality}default.jpg`;
}

/**
 * Generate YouTube embed URL from video ID
 */
export function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`;
}
