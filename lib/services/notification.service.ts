/**
 * Notification Service
 * Handles all notification-related operations
 */

import prisma from "@/lib/prisma";
import {
  NotificationType,
  NotificationChannel,
  type Expense,
  type ProgressUpdate,
  type User,
  type Startup,
} from "@prisma/client";
import { USER_ROLE } from "@/lib/constants";
import type {
  CreateNotificationInput,
  NotificationFilters,
  UpdateNotificationPreferencesInput,
} from "@/lib/validations/notification.validation";
import { notificationEmailService } from "@/lib/email";

// ============================================================
// NOTIFICATION SERVICE
// ============================================================

export const notificationService = {
  // ============================================================
  // CRUD OPERATIONS
  // ============================================================

  /**
   * Create a single notification
   */
  async create(data: CreateNotificationInput) {
    const notification = await prisma.notification.create({
      data: {
        type: data.type,
        title: data.title,
        message: data.message,
        data: data.data ? JSON.parse(JSON.stringify(data.data)) : undefined,
        userId: data.userId,
        channel: data.channel,
      },
    });

    // Send email if channel is EMAIL or BOTH
    if (data.channel === "EMAIL" || data.channel === "BOTH") {
      await this.sendNotificationEmail(notification.id);
    }

    return notification;
  },

  /**
   * Create multiple notifications (for notifying all admins)
   */
  async createBulk(notifications: CreateNotificationInput[]) {
    const results = await Promise.all(
      notifications.map((notification) => this.create(notification))
    );
    return results;
  },

  /**
   * Get notifications for a user with pagination
   */
  async findByUserId(userId: string, filters?: NotificationFilters) {
    const { isRead, type, limit = 20, cursor } = filters || {};

    return prisma.notification.findMany({
      where: {
        userId,
        ...(isRead !== undefined && { isRead }),
        ...(type && { type }),
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      ...(cursor && {
        skip: 1,
        cursor: { id: cursor },
      }),
    });
  },

  /**
   * Get a single notification by ID
   */
  async findById(id: string) {
    return prisma.notification.findUnique({
      where: { id },
    });
  },

  /**
   * Mark a notification as read
   */
  async markAsRead(id: string) {
    return prisma.notification.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  },

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  },

  /**
   * Delete a notification
   */
  async delete(id: string) {
    return prisma.notification.delete({
      where: { id },
    });
  },

  /**
   * Get unread count for a user
   */
  async getUnreadCount(userId: string): Promise<number> {
    return prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  },

  /**
   * Delete old notifications (older than 90 days)
   */
  async cleanupOldNotifications() {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    return prisma.notification.deleteMany({
      where: {
        createdAt: { lt: ninetyDaysAgo },
        isRead: true,
      },
    });
  },

  // ============================================================
  // PREFERENCES
  // ============================================================

  /**
   * Get notification preferences for a user
   */
  async getPreferences(userId: string) {
    let preferences = await prisma.notificationPreference.findUnique({
      where: { userId },
    });

    // Create default preferences if none exist
    if (!preferences) {
      preferences = await prisma.notificationPreference.create({
        data: { userId },
      });
    }

    return preferences;
  },

  /**
   * Update notification preferences
   */
  async updatePreferences(
    userId: string,
    data: UpdateNotificationPreferencesInput
  ) {
    // Ensure preferences exist
    await this.getPreferences(userId);

    return prisma.notificationPreference.update({
      where: { userId },
      data,
    });
  },

  // ============================================================
  // HELPER METHODS
  // ============================================================

  /**
   * Notify all admin users
   */
  async notifyAdmins(
    type: NotificationType,
    title: string,
    message: string,
    data?: Record<string, unknown>
  ) {
    const admins = await prisma.user.findMany({
      where: { role: USER_ROLE.ADMIN, status: "ACTIVE" },
      select: { id: true },
    });

    const notifications = admins.map((admin) => ({
      type,
      title,
      message,
      data,
      userId: admin.id,
      channel: "BOTH" as NotificationChannel,
    }));

    return this.createBulk(notifications);
  },

  /**
   * Notify a specific user
   */
  async notifyUser(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    data?: Record<string, unknown>,
    channel: NotificationChannel = "BOTH"
  ) {
    // Check user preferences
    const preferences = await this.getPreferences(userId);
    const effectiveChannel = this.getEffectiveChannel(
      type,
      preferences,
      channel
    );

    if (effectiveChannel === "IN_APP" || effectiveChannel === "BOTH") {
      return this.create({
        type,
        title,
        message,
        data,
        userId,
        channel: effectiveChannel,
      });
    }

    // Email only - still create in-app record but send email
    if (effectiveChannel === "EMAIL") {
      const notification = await this.create({
        type,
        title,
        message,
        data,
        userId,
        channel: "EMAIL",
      });
      return notification;
    }
  },

  /**
   * Get effective notification channel based on preferences
   */
  getEffectiveChannel(
    type: NotificationType,
    preferences: {
      expenseUpdates: NotificationChannel;
      progressReminders: NotificationChannel;
      budgetAlerts: NotificationChannel;
      startupUpdates: NotificationChannel;
      systemAnnouncements: NotificationChannel;
    },
    defaultChannel: NotificationChannel
  ): NotificationChannel {
    switch (type) {
      case "EXPENSE_SUBMITTED":
      case "EXPENSE_APPROVED":
      case "EXPENSE_REJECTED":
        return preferences.expenseUpdates;
      case "PROGRESS_UPDATE_SUBMITTED":
      case "PROGRESS_UPDATE_REMINDER":
        return preferences.progressReminders;
      case "BUDGET_THRESHOLD_WARNING":
      case "BUDGET_EXCEEDED":
        return preferences.budgetAlerts;
      case "STARTUP_ASSIGNED":
      case "STARTUP_STATUS_CHANGED":
      case "INCUBATION_ENDING_SOON":
        return preferences.startupUpdates;
      case "USER_ACTIVATED":
      case "USER_DEACTIVATED":
      case "NEW_USER_REGISTERED":
      case "SYSTEM_ANNOUNCEMENT":
        return preferences.systemAnnouncements;
      default:
        return defaultChannel;
    }
  },

  /**
   * Send notification email
   */
  async sendNotificationEmail(notificationId: string) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
      include: {
        user: {
          select: { email: true, name: true },
        },
      },
    });

    if (!notification) return;

    try {
      await notificationEmailService.sendNotificationEmail(
        notification.user.email,
        notification.user.name,
        notification.title,
        notification.message,
        notification.type,
        notification.data as Record<string, unknown> | null
      );
    } catch (error) {
      console.error("Failed to send notification email:", error);
    }
  },

  // ============================================================
  // TRIGGER METHODS (Called from other services)
  // ============================================================

  /**
   * Trigger: Expense submitted (notify admins)
   */
  async onExpenseSubmitted(
    expense: Expense & {
      submittedBy: { name: string };
      startup: { name: string };
      category: { name: string };
    }
  ) {
    const amount = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(expense.amount);

    await this.notifyAdmins(
      "EXPENSE_SUBMITTED",
      "New Expense Submitted",
      `${expense.submittedBy.name} submitted an expense of ${amount} for ${expense.startup.name} in ${expense.category.name}.`,
      {
        expenseId: expense.id,
        startupId: expense.startupId,
        amount: expense.amount,
      }
    );
  },

  /**
   * Trigger: Expense approved (notify founder)
   */
  async onExpenseApproved(
    expense: Expense & {
      startup: { name: string };
      category: { name: string };
    },
    adminComment?: string
  ) {
    const amount = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(expense.amount);

    let message = `Your expense of ${amount} for "${expense.description}" has been approved.`;
    if (adminComment) {
      message += ` Admin comment: "${adminComment}"`;
    }

    await this.notifyUser(
      expense.submittedById,
      "EXPENSE_APPROVED",
      "Expense Approved",
      message,
      {
        expenseId: expense.id,
        startupId: expense.startupId,
        amount: expense.amount,
      }
    );
  },

  /**
   * Trigger: Expense rejected (notify founder)
   */
  async onExpenseRejected(
    expense: Expense & {
      startup: { name: string };
      category: { name: string };
    },
    adminComment?: string
  ) {
    const amount = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(expense.amount);

    let message = `Your expense of ${amount} for "${expense.description}" has been rejected.`;
    if (adminComment) {
      message += ` Reason: "${adminComment}"`;
    }

    await this.notifyUser(
      expense.submittedById,
      "EXPENSE_REJECTED",
      "Expense Rejected",
      message,
      {
        expenseId: expense.id,
        startupId: expense.startupId,
        amount: expense.amount,
        reason: adminComment,
      }
    );
  },

  /**
   * Trigger: Progress update submitted (notify admins)
   */
  async onProgressUpdateSubmitted(
    progressUpdate: ProgressUpdate & {
      submittedBy: { name: string };
      startup: { name: string };
    }
  ) {
    await this.notifyAdmins(
      "PROGRESS_UPDATE_SUBMITTED",
      "New Progress Update",
      `${progressUpdate.submittedBy.name} submitted a progress update for ${progressUpdate.startup.name}.`,
      {
        progressUpdateId: progressUpdate.id,
        startupId: progressUpdate.startupId,
      }
    );
  },

  /**
   * Trigger: Budget threshold reached (notify founders of startup)
   */
  async onBudgetThresholdReached(
    startup: Startup & { founders: { id: string }[] },
    categoryName: string,
    percentage: number
  ) {
    const notifications = startup.founders.map((founder) => ({
      type: "BUDGET_THRESHOLD_WARNING" as NotificationType,
      title: "Budget Warning",
      message: `The ${categoryName} budget for ${
        startup.name
      } has reached ${percentage.toFixed(0)}% utilization.`,
      data: {
        startupId: startup.id,
        categoryName,
        percentage,
      },
      userId: founder.id,
      channel: "BOTH" as NotificationChannel,
    }));

    await this.createBulk(notifications);

    // Also notify admins
    await this.notifyAdmins(
      "BUDGET_THRESHOLD_WARNING",
      "Budget Warning",
      `${
        startup.name
      }'s ${categoryName} budget has reached ${percentage.toFixed(
        0
      )}% utilization.`,
      { startupId: startup.id, categoryName, percentage }
    );
  },

  /**
   * Trigger: Budget exceeded (notify founders and admins)
   */
  async onBudgetExceeded(
    startup: Startup & { founders: { id: string }[] },
    categoryName: string,
    overage: number
  ) {
    const formattedOverage = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(overage);

    const notifications = startup.founders.map((founder) => ({
      type: "BUDGET_EXCEEDED" as NotificationType,
      title: "Budget Exceeded",
      message: `The ${categoryName} budget for ${startup.name} has been exceeded by ${formattedOverage}.`,
      data: {
        startupId: startup.id,
        categoryName,
        overage,
      },
      userId: founder.id,
      channel: "BOTH" as NotificationChannel,
    }));

    await this.createBulk(notifications);

    // Also notify admins
    await this.notifyAdmins(
      "BUDGET_EXCEEDED",
      "Budget Exceeded",
      `${startup.name}'s ${categoryName} budget has been exceeded by ${formattedOverage}.`,
      { startupId: startup.id, categoryName, overage }
    );
  },

  /**
   * Trigger: User activated (notify user)
   */
  async onUserActivated(user: User) {
    await this.notifyUser(
      user.id,
      "USER_ACTIVATED",
      "Account Activated",
      "Your account has been activated by an administrator. You can now access all features.",
      { userId: user.id },
      "BOTH"
    );
  },

  /**
   * Trigger: User deactivated (notify user via email only)
   */
  async onUserDeactivated(user: User) {
    // Send email directly since user can't access in-app notifications
    await notificationEmailService.sendNotificationEmail(
      user.email,
      user.name,
      "Account Deactivated",
      "Your account has been deactivated. Please contact an administrator for more information.",
      "USER_DEACTIVATED",
      { userId: user.id }
    );
  },

  /**
   * Trigger: New user registered (notify admins)
   */
  async onNewUserRegistered(user: User) {
    await this.notifyAdmins(
      "NEW_USER_REGISTERED",
      "New User Registration",
      `${user.name} (${user.email}) has registered and is awaiting account activation.`,
      { userId: user.id, email: user.email }
    );
  },

  /**
   * Trigger: Startup assigned to founder
   */
  async onStartupAssigned(startup: Startup, founderId: string) {
    await this.notifyUser(
      founderId,
      "STARTUP_ASSIGNED",
      "Assigned to Startup",
      `You have been assigned to ${startup.name}. You can now submit expenses and progress updates.`,
      { startupId: startup.id, startupName: startup.name },
      "BOTH"
    );
  },

  /**
   * Trigger: Incubation ending soon
   */
  async onIncubationEndingSoon(
    startup: Startup & { founders: { id: string }[] },
    daysRemaining: number
  ) {
    const notifications = startup.founders.map((founder) => ({
      type: "INCUBATION_ENDING_SOON" as NotificationType,
      title: "Incubation Period Ending",
      message: `The incubation period for ${startup.name} will end in ${daysRemaining} days.`,
      data: {
        startupId: startup.id,
        daysRemaining,
        endDate: startup.incubationEnd,
      },
      userId: founder.id,
      channel: "BOTH" as NotificationChannel,
    }));

    await this.createBulk(notifications);

    // Also notify admins
    await this.notifyAdmins(
      "INCUBATION_ENDING_SOON",
      "Incubation Period Ending",
      `${startup.name}'s incubation period will end in ${daysRemaining} days.`,
      { startupId: startup.id, daysRemaining, endDate: startup.incubationEnd }
    );
  },
};
