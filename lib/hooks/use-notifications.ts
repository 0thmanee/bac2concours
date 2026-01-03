/**
 * Notification hooks
 * React Query hooks for notification operations
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API_ROUTES, QUERY_KEYS } from "@/lib/constants";
import type {
  NotificationWithUser,
  NotificationFilters,
  NotificationPreferencesResponse,
  UnreadCountResponse,
  UpdateNotificationPreferencesInput,
} from "@/lib/validations/notification.validation";

// ============================================================
// FETCH FUNCTIONS
// ============================================================

async function fetchNotifications(
  filters?: NotificationFilters
): Promise<NotificationWithUser[]> {
  const params = new URLSearchParams();
  if (filters?.isRead !== undefined)
    params.set("isRead", String(filters.isRead));
  if (filters?.type) params.set("type", filters.type);
  if (filters?.limit) params.set("limit", String(filters.limit));
  if (filters?.cursor) params.set("cursor", filters.cursor);

  const url = `${API_ROUTES.NOTIFICATIONS}${
    params.toString() ? `?${params}` : ""
  }`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch notifications");
  return res.json();
}

async function fetchUnreadCount(): Promise<UnreadCountResponse> {
  const res = await fetch(API_ROUTES.NOTIFICATIONS_UNREAD_COUNT);
  if (!res.ok) throw new Error("Failed to fetch unread count");
  return res.json();
}

async function fetchPreferences(): Promise<NotificationPreferencesResponse> {
  const res = await fetch(API_ROUTES.NOTIFICATIONS_PREFERENCES);
  if (!res.ok) throw new Error("Failed to fetch preferences");
  return res.json();
}

async function markAsRead(data: {
  notificationId?: string;
  markAll?: boolean;
}) {
  const res = await fetch(API_ROUTES.NOTIFICATIONS_MARK_READ, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to mark as read");
  return res.json();
}

async function deleteNotification(id: string) {
  const res = await fetch(API_ROUTES.NOTIFICATION(id), {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete notification");
  return res.json();
}

async function updatePreferences(data: UpdateNotificationPreferencesInput) {
  const res = await fetch(API_ROUTES.NOTIFICATIONS_PREFERENCES, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update preferences");
  return res.json();
}

// ============================================================
// QUERY HOOKS
// ============================================================

/**
 * Hook to fetch user's notifications
 */
export function useNotifications(filters?: NotificationFilters) {
  return useQuery({
    queryKey: QUERY_KEYS.NOTIFICATIONS.LIST(filters),
    queryFn: () => fetchNotifications(filters),
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to fetch unread notification count
 */
export function useUnreadCount() {
  return useQuery({
    queryKey: QUERY_KEYS.NOTIFICATIONS.UNREAD_COUNT(),
    queryFn: fetchUnreadCount,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
}

/**
 * Hook to fetch notification preferences
 */
export function useNotificationPreferences() {
  return useQuery({
    queryKey: QUERY_KEYS.NOTIFICATIONS.PREFERENCES(),
    queryFn: fetchPreferences,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ============================================================
// MUTATION HOOKS
// ============================================================

/**
 * Hook to mark notification(s) as read
 */
export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      // Invalidate notifications and unread count
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATIONS.ALL });
    },
  });
}

/**
 * Hook to mark all notifications as read
 */
export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => markAsRead({ markAll: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATIONS.ALL });
    },
  });
}

/**
 * Hook to delete a notification
 */
export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATIONS.ALL });
    },
  });
}

/**
 * Hook to update notification preferences
 */
export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePreferences,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.NOTIFICATIONS.PREFERENCES(),
      });
    },
  });
}
