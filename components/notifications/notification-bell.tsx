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
  CreditCard,
  CheckCircle,
  AlertCircle,
  BookOpen,
  UserX,
  Mail,
  PartyPopper,
  RefreshCw,
  FileCheck,
  FileX,
  FileEdit,
  Trophy,
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
  // User Management
  USER_ACTIVATED: { icon: UserCheck, color: "text-success", bgColor: "bg-success-light" },
  USER_DEACTIVATED: { icon: Lock, color: "text-error", bgColor: "bg-error-light" },
  USER_DELETED: { icon: UserX, color: "text-error", bgColor: "bg-error-light" },
  NEW_USER_REGISTERED: { icon: UserPlus, color: "text-primary", bgColor: "bg-primary/10" },
  EMAIL_VERIFIED: { icon: Mail, color: "text-success", bgColor: "bg-success-light" },
  ACCOUNT_CREATED: { icon: PartyPopper, color: "text-primary", bgColor: "bg-primary/10" },
  
  // System
  SYSTEM_ANNOUNCEMENT: { icon: Megaphone, color: "text-primary", bgColor: "bg-primary/10" },
  
  // Payment
  PAYMENT_SUBMITTED: { icon: CreditCard, color: "text-warning", bgColor: "bg-warning-light" },
  PAYMENT_RESUBMITTED: { icon: RefreshCw, color: "text-warning", bgColor: "bg-warning-light" },
  PAYMENT_APPROVED: { icon: CheckCircle, color: "text-success", bgColor: "bg-success-light" },
  PAYMENT_REJECTED: { icon: AlertCircle, color: "text-error", bgColor: "bg-error-light" },
  PAYMENT_CONFIRMATION: { icon: FileCheck, color: "text-info", bgColor: "bg-info-light" },
  
  // Resources
  NEW_RESOURCE: { icon: BookOpen, color: "text-info", bgColor: "bg-info-light" },
  RESOURCE_UPDATED: { icon: FileEdit, color: "text-warning", bgColor: "bg-warning-light" },
  RESOURCE_DELETED: { icon: FileX, color: "text-error", bgColor: "bg-error-light" },
  
  // Quiz
  QUIZ_COMPLETED: { icon: Trophy, color: "text-success", bgColor: "bg-success-light" },
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
          <span className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center px-1 text-[10px] font-semibold text-white bg-error rounded-full">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 overflow-hidden rounded-xl border border-border ops-card shadow-xl z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/50">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm text-ops-primary">Notifications</h3>
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
                className="h-7 w-7 text-ops-secondary hover:text-ops-primary"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="px-4 py-12 text-center">
                <div className="w-8 h-8 mx-auto mb-3 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                <p className="text-sm text-ops-secondary">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
                  <Bell className="h-6 w-6 text-ops-tertiary" />
                </div>
                <p className="text-sm font-medium text-ops-primary">No notifications yet</p>
                <p className="text-xs text-ops-tertiary mt-1">We&apos;ll notify you when something happens</p>
              </div>
            ) : (
              <div className="divide-y divide-ops">
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
                        "px-4 py-3 hover:bg-muted/50 transition-colors group",
                        !notification.isRead && "bg-primary/5"
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
                              !notification.isRead ? "font-semibold text-ops-primary" : "font-medium text-ops-secondary"
                            )}>
                              {notification.title}
                            </p>
                            {!notification.isRead && (
                              <span className="shrink-0 w-2 h-2 bg-primary rounded-full mt-1.5" />
                            )}
                          </div>
                          <p className="text-sm text-ops-tertiary line-clamp-2 mt-0.5">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-ops-tertiary">
                              {formatDistanceToNow(new Date(notification.createdAt), {
                                addSuffix: true,
                              })}
                            </span>
                            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              {!notification.isRead && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-ops-tertiary hover:text-primary hover:bg-primary/10"
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
                                className="h-7 w-7 text-ops-tertiary hover:text-destructive hover:bg-destructive/10"
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
            <div className="px-4 py-2.5 border-t border-border bg-muted/30">
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
