/**
 * Notification Service
 * Handles all notification-related operations
 */

import prisma from "@/lib/prisma";
import {
  NotificationType,
  NotificationChannel,
  type User,
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
      systemAnnouncements: NotificationChannel;
    },
    defaultChannel: NotificationChannel
  ): NotificationChannel {
    switch (type) {
      case "USER_ACTIVATED":
      case "USER_DEACTIVATED":
      case "NEW_USER_REGISTERED":
      case "SYSTEM_ANNOUNCEMENT":
      case "PAYMENT_SUBMITTED":
      case "PAYMENT_APPROVED":
      case "PAYMENT_REJECTED":
      case "NEW_RESOURCE":
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
   * Trigger: User activated (notify user)
   */
  async onUserActivated(user: User) {
    await this.notifyUser(
      user.id,
      "USER_ACTIVATED",
      "Compte activé",
      "Votre compte a été activé par un administrateur. Vous pouvez maintenant accéder à toutes les fonctionnalités.",
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
      "Compte désactivé",
      "Votre compte a été désactivé. Veuillez contacter un administrateur pour plus d'informations.",
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
      "Nouvelle inscription",
      `${user.name} (${user.email}) s'est inscrit et attend l'activation de son compte.`,
      { userId: user.id, email: user.email }
    );
  },

  /**
   * Trigger: Account created (notify student)
   */
  async onAccountCreated(user: User) {
    await this.notifyUser(
      user.id,
      "ACCOUNT_CREATED",
      "Bienvenue !",
      `Votre compte a été créé avec succès. Veuillez vérifier votre email pour activer votre compte.`,
      { userId: user.id },
      "BOTH"
    );
  },

  /**
   * Trigger: Email verified (notify admins)
   */
  async onEmailVerified(user: User) {
    await this.notifyAdmins(
      "EMAIL_VERIFIED",
      "Email vérifié",
      `${user.name} (${user.email}) a vérifié son adresse email.`,
      { userId: user.id, email: user.email }
    );
  },

  /**
   * Trigger: User deleted (notify admins)
   */
  async onUserDeleted(userName: string, userEmail: string, deletedById: string) {
    await this.notifyAdmins(
      "USER_DELETED",
      "Utilisateur supprimé",
      `L'utilisateur ${userName} (${userEmail}) a été supprimé du système.`,
      { userName, userEmail, deletedById }
    );
  },

  /**
   * Trigger: Payment proof submitted (notify admins)
   */
  async onPaymentSubmitted(user: User) {
    await this.notifyAdmins(
      "PAYMENT_SUBMITTED",
      "Nouveau paiement soumis",
      `${user.name} (${user.email}) a soumis une preuve de paiement et attend la vérification.`,
      { userId: user.id, email: user.email }
    );
  },

  /**
   * Trigger: Payment proof re-submitted after rejection (notify admins)
   */
  async onPaymentResubmitted(user: User) {
    await this.notifyAdmins(
      "PAYMENT_RESUBMITTED",
      "Paiement re-soumis",
      `${user.name} (${user.email}) a re-soumis une preuve de paiement après rejet.`,
      { userId: user.id, email: user.email }
    );
  },

  /**
   * Trigger: Payment submitted confirmation (notify student)
   */
  async onPaymentConfirmation(user: User) {
    await this.notifyUser(
      user.id,
      "PAYMENT_CONFIRMATION",
      "Paiement reçu",
      "Votre preuve de paiement a été reçue avec succès. Elle sera examinée par un administrateur sous peu.",
      { userId: user.id },
      "BOTH"
    );
  },

  /**
   * Trigger: Payment approved (notify student)
   */
  async onPaymentApproved(user: User) {
    await this.notifyUser(
      user.id,
      "PAYMENT_APPROVED",
      "Paiement approuvé",
      "Excellente nouvelle ! Votre paiement a été approuvé. Vous pouvez maintenant accéder à tous les contenus de la plateforme.",
      { userId: user.id },
      "IN_APP" // Email is sent separately in payment service
    );
  },

  /**
   * Trigger: Payment rejected (notify student)
   */
  async onPaymentRejected(user: User, reason: string) {
    await this.notifyUser(
      user.id,
      "PAYMENT_REJECTED",
      "Paiement refusé",
      `Votre preuve de paiement a été refusée. Raison : ${reason}. Veuillez soumettre une nouvelle preuve.`,
      { userId: user.id, reason },
      "IN_APP" // Email is sent separately in payment service
    );
  },

  /**
   * Trigger: New resource published (notify all active students)
   */
  async onNewResourcePublished(
    resourceType: "BOOK" | "VIDEO" | "QCM",
    resourceTitle: string,
    resourceId: string
  ) {
    // Get all active students with approved payment
    const students = await prisma.user.findMany({
      where: {
        role: "STUDENT",
        status: "ACTIVE",
        paymentStatus: "APPROVED",
      },
      select: { id: true },
    });

    const typeLabels = {
      BOOK: "Nouveau livre",
      VIDEO: "Nouvelle vidéo",
      QCM: "Nouveau QCM",
    };

    const notifications = students.map((student) => ({
      type: "NEW_RESOURCE" as const,
      title: typeLabels[resourceType],
      message: `${resourceTitle} est maintenant disponible !`,
      data: { resourceType, resourceId, resourceTitle },
      userId: student.id,
      channel: "IN_APP" as const,
    }));

    // Batch create notifications (in-app only, don't spam emails)
    if (notifications.length > 0) {
      await prisma.notification.createMany({
        data: notifications,
      });
    }
  },

  /**
   * Trigger: Resource deleted (notify admins)
   */
  async onResourceDeleted(
    resourceType: "BOOK" | "VIDEO" | "QCM" | "QUESTION",
    resourceTitle: string,
    deletedById: string
  ) {
    const typeLabels = {
      BOOK: "Livre",
      VIDEO: "Vidéo",
      QCM: "QCM",
      QUESTION: "Question",
    };

    await this.notifyAdmins(
      "RESOURCE_DELETED",
      "Ressource supprimée",
      `${typeLabels[resourceType]} "${resourceTitle}" a été supprimé(e) du système.`,
      { resourceType, resourceTitle, deletedById }
    );
  },

  /**
   * Trigger: Resource status updated (notify admins)
   */
  async onResourceStatusChanged(
    resourceType: "BOOK" | "VIDEO" | "QCM" | "QUESTION",
    resourceTitle: string,
    oldStatus: string,
    newStatus: string,
    updatedById: string
  ) {
    const typeLabels = {
      BOOK: "Livre",
      VIDEO: "Vidéo",
      QCM: "QCM",
      QUESTION: "Question",
    };

    await this.notifyAdmins(
      "RESOURCE_UPDATED",
      "Statut de ressource modifié",
      `${typeLabels[resourceType]} "${resourceTitle}" : ${oldStatus} → ${newStatus}`,
      { resourceType, resourceTitle, oldStatus, newStatus, updatedById }
    );
  },

  /**
   * Trigger: Quiz completed (notify student)
   */
  async onQuizCompleted(
    userId: string,
    quizData: {
      school: string;
      matiere: string;
      score: number;
      totalQuestions: number;
      percentage: number;
    }
  ) {
    const { school, matiere, score, totalQuestions, percentage } = quizData;
    
    let message = `Vous avez terminé le quiz ${matiere} (${school}) avec un score de ${score}/${totalQuestions} (${percentage}%).`;
    
    // Add encouraging message based on performance
    if (percentage >= 80) {
      message += " Excellent travail ! 🎉";
    } else if (percentage >= 60) {
      message += " Bon travail ! Continuez comme ça ! 👍";
    } else {
      message += " Continuez à pratiquer pour vous améliorer ! 💪";
    }

    await this.notifyUser(
      userId,
      "QUIZ_COMPLETED",
      "Quiz terminé",
      message,
      { school, matiere, score, totalQuestions, percentage },
      "IN_APP"
    );
  },

  /**
   * Trigger: System announcement (notify all users or specific role)
   */
  async sendSystemAnnouncement(
    title: string,
    message: string,
    targetRole?: "ADMIN" | "STUDENT",
    channel: NotificationChannel = "BOTH"
  ) {
    // Get target users
    const users = await prisma.user.findMany({
      where: {
        status: "ACTIVE",
        ...(targetRole && { role: targetRole }),
      },
      select: { id: true },
    });

    const notifications = users.map((user) => ({
      type: "SYSTEM_ANNOUNCEMENT" as const,
      title,
      message,
      userId: user.id,
      channel,
    }));

    // Create all notifications
    return this.createBulk(notifications);
  },
};
