"use client";

/**
 * Notification Bell Component
 * Displays notification icon with unread count badge and dropdown
 */

import { useState, useRef, useEffect } from "react";
import { 
  Bell, 
  Check, 
  Trash2, 
  X,
  UserCheck,
  Lock,
  UserPlus,
  Megaphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useNotifications,
  useUnreadCount,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
} from "@/lib/hooks/use-notifications";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import type { NotificationType } from "@prisma/client";

// Notification type icons and colors - using Lucide icons
const notificationConfig: Record<
  NotificationType,
  { icon: React.ComponentType<{ className?: string }>; color: string; bgColor: string }
> = {
  USER_ACTIVATED: { icon: UserCheck, color: "text-emerald-600", bgColor: "bg-emerald-50" },
  USER_DEACTIVATED: { icon: Lock, color: "text-red-600", bgColor: "bg-red-50" },
  NEW_USER_REGISTERED: { icon: UserPlus, color: "text-primary", bgColor: "bg-primary/10" },
  SYSTEM_ANNOUNCEMENT: { icon: Megaphone, color: "text-primary", bgColor: "bg-primary/10" },
};

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: notifications = [], isLoading } = useNotifications({ limit: 10 });
  const { data: unreadData } = useUnreadCount();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const deleteNotification = useDeleteNotification();

  const unreadCount = unreadData?.count ?? 0;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = (notificationId: string) => {
    markAsRead.mutate({ notificationId });
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate();
  };

  const handleDelete = (notificationId: string) => {
    deleteNotification.mutate(notificationId);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center px-1 text-[10px] font-semibold text-white bg-red-500 rounded-full">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xl z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 bg-neutral-50/80">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm text-neutral-900">Notifications</h3>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="h-5 px-1.5 text-xs bg-primary/10 text-primary">
                  {unreadCount}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-7 text-primary hover:text-primary hover:bg-primary/10"
                  onClick={handleMarkAllAsRead}
                  disabled={markAllAsRead.isPending}
                >
                  <Check className="h-3 w-3 mr-1" />
                  Mark all read
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-neutral-500 hover:text-neutral-700"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto bg-white">
            {isLoading ? (
              <div className="px-4 py-12 text-center">
                <div className="w-8 h-8 mx-auto mb-3 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                <p className="text-sm text-neutral-500">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-neutral-100 flex items-center justify-center">
                  <Bell className="h-6 w-6 text-neutral-400" />
                </div>
                <p className="text-sm font-medium text-neutral-700">No notifications yet</p>
                <p className="text-xs text-neutral-500 mt-1">We&apos;ll notify you when something happens</p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-100">
                {notifications.map((notification) => {
                  const config = notificationConfig[notification.type] || {
                    icon: Bell,
                    color: "text-primary",
                    bgColor: "bg-primary/10",
                  };
                  const IconComponent = config.icon;

                  return (
                    <div
                      key={notification.id}
                      className={cn(
                        "px-4 py-3 hover:bg-neutral-50 transition-colors group",
                        !notification.isRead && "bg-primary/[0.03]"
                      )}
                    >
                      <div className="flex gap-3">
                        {/* Icon */}
                        <div
                          className={cn(
                            "shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                            config.bgColor
                          )}
                        >
                          <IconComponent className={cn("h-5 w-5", config.color)} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={cn(
                              "text-sm truncate",
                              !notification.isRead ? "font-semibold text-neutral-900" : "font-medium text-neutral-700"
                            )}>
                              {notification.title}
                            </p>
                            {!notification.isRead && (
                              <span className="shrink-0 w-2 h-2 bg-primary rounded-full mt-1.5" />
                            )}
                          </div>
                          <p className="text-sm text-neutral-500 line-clamp-2 mt-0.5">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-neutral-400">
                              {formatDistanceToNow(new Date(notification.createdAt), {
                                addSuffix: true,
                              })}
                            </span>
                            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              {!notification.isRead && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-neutral-400 hover:text-primary hover:bg-primary/10"
                                  onClick={() => handleMarkAsRead(notification.id)}
                                  disabled={markAsRead.isPending}
                                  title="Mark as read"
                                >
                                  <Check className="h-3.5 w-3.5" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-neutral-400 hover:text-red-600 hover:bg-red-50"
                                onClick={() => handleDelete(notification.id)}
                                disabled={deleteNotification.isPending}
                                title="Delete notification"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2.5 border-t border-neutral-100 bg-neutral-50/50">
              <Button variant="ghost" size="sm" className="w-full text-xs text-primary hover:text-primary hover:bg-primary/10">
                View all notifications
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
