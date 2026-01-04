/**
 * File Upload Validation Schemas
 * Type-safe validation for file uploads with size and type constraints
 */

import { z } from "zod";
import { FileType } from "@prisma/client";

// File size limits (in bytes)
export const FILE_SIZE_LIMITS = {
  IMAGE: 5 * 1024 * 1024, // 5 MB
  DOCUMENT: 50 * 1024 * 1024, // 50 MB
  PAYMENT_PROOF: 5 * 1024 * 1024, // 5 MB
  OTHER: 10 * 1024 * 1024, // 10 MB
} as const;

// Allowed MIME types by file type
export const ALLOWED_MIME_TYPES = {
  IMAGE: ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"],
  DOCUMENT: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  PAYMENT_PROOF: [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "application/pdf",
  ],
  OTHER: [], // No restriction for OTHER type
} as const;

/**
 * Get file size limit for a specific file type
 */
export function getFileSizeLimit(fileType: FileType): number {
  return FILE_SIZE_LIMITS[fileType] || FILE_SIZE_LIMITS.OTHER;
}

/**
 * Get allowed MIME types for a specific file type
 */
export function getAllowedMimeTypes(fileType: FileType): readonly string[] {
  return ALLOWED_MIME_TYPES[fileType] || [];
}

/**
 * Validate if a MIME type is allowed for a file type
 */
export function isAllowedMimeType(
  mimeType: string,
  fileType: FileType
): boolean {
  const allowed = getAllowedMimeTypes(fileType);
  return allowed.length === 0 || allowed.includes(mimeType);
}

/**
 * Schema for file upload request
 */
export const fileUploadSchema = z.object({
  type: z.nativeEnum(FileType),
  folder: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type FileUploadInput = z.infer<typeof fileUploadSchema>;

/**
 * Schema for file query parameters
 */
export const fileQuerySchema = z.object({
  type: z.nativeEnum(FileType).optional(),
  limit: z.number().int().positive().max(100).default(50),
  page: z.number().int().positive().default(1),
});

export type FileQueryParams = z.infer<typeof fileQuerySchema>;

/**
 * Validation error messages
 */
export const FILE_VALIDATION_ERRORS = {
  NO_FILE: "Aucun fichier fourni",
  FILE_TOO_LARGE: "Le fichier est trop volumineux",
  INVALID_TYPE: "Type de fichier non valide",
  INVALID_MIME_TYPE: "Format de fichier non accepté",
} as const;

/**
 * Validate file size
 */
export function validateFileSize(
  fileSize: number,
  fileType: FileType
): boolean {
  return fileSize <= getFileSizeLimit(fileType);
}

/**
 * Get human-readable file size limit
 */
export function getFileSizeLimitLabel(fileType: FileType): string {
  const bytes = getFileSizeLimit(fileType);
  const mb = bytes / (1024 * 1024);
  return `${mb} MB`;
}

/**
 * Get file type label for UI
 */
export function getFileTypeLabel(fileType: FileType): string {
  const labels: Record<FileType, string> = {
    IMAGE: "Image",
    DOCUMENT: "Document",
    PAYMENT_PROOF: "Preuve de paiement",
    OTHER: "Autre",
  };
  return labels[fileType];
}

/**
 * Get accepted file extensions for input element
 */
export function getAcceptedExtensions(fileType: FileType): string {
  const mimeTypes = getAllowedMimeTypes(fileType);

  // Map common MIME types to extensions
  const mimeToExtension: Record<string, string[]> = {
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
    "image/webp": [".webp"],
    "image/gif": [".gif"],
    "application/pdf": [".pdf"],
    "application/msword": [".doc"],
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
      ".docx",
    ],
  };

  const extensions = mimeTypes.flatMap((mime) => mimeToExtension[mime] || []);
  return extensions.join(",");
}
