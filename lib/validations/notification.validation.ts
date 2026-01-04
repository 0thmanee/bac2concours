/**
 * Notification validation schemas
 */

import { z } from "zod";
import { NotificationType, NotificationChannel } from "@prisma/client";

// ============================================================
// ENUMS
// ============================================================

export const notificationTypeSchema = z.nativeEnum(NotificationType);
export const notificationChannelSchema = z.nativeEnum(NotificationChannel);

// ============================================================
// CREATE NOTIFICATION
// ============================================================

export const createNotificationSchema = z.object({
  type: notificationTypeSchema,
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(2000),
  data: z.record(z.string(), z.unknown()).optional(),
  userId: z.string().min(1),
  channel: notificationChannelSchema.default("IN_APP"),
});

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;

// ============================================================
// NOTIFICATION FILTERS
// ============================================================

export const notificationFiltersSchema = z.object({
  isRead: z.boolean().optional(),
  type: notificationTypeSchema.optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  cursor: z.string().optional(),
});

export type NotificationFilters = z.infer<typeof notificationFiltersSchema>;

// ============================================================
// MARK AS READ
// ============================================================

export const markAsReadSchema = z.object({
  notificationId: z.string().optional(),
  markAll: z.boolean().default(false),
});

export type MarkAsReadInput = z.infer<typeof markAsReadSchema>;

// ============================================================
// NOTIFICATION PREFERENCES
// ============================================================

export const updateNotificationPreferencesSchema = z.object({
  systemAnnouncements: notificationChannelSchema.optional(),
  newContent: notificationChannelSchema.optional(),
  emailDigest: z.boolean().optional(),
});

export type UpdateNotificationPreferencesInput = z.infer<
  typeof updateNotificationPreferencesSchema
>;

// ============================================================
// RESPONSE TYPES
// ============================================================

export interface NotificationWithUser {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data: Record<string, unknown> | null;
  isRead: boolean;
  channel: NotificationChannel;
  userId: string;
  createdAt: Date;
  readAt: Date | null;
}

export interface NotificationPreferencesResponse {
  id: string;
  userId: string;
  systemAnnouncements: NotificationChannel;
  newContent: NotificationChannel;
  emailDigest: boolean;
}

export interface UnreadCountResponse {
  count: number;
}
