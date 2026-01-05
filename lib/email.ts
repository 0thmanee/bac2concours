import { Resend } from "resend";
import type { NotificationType } from "@prisma/client";

const resend = new Resend(process.env.RESEND_API_KEY);

const fromEmail = process.env.EMAIL_FROM || "onboarding@resend.dev";
const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// Brand colors
const BRAND = {
  primary: "#047C6E",
  primaryDark: "#035854",
  textPrimary: "#111827",
  textSecondary: "#6b7280",
  textMuted: "#9ca3af",
  background: "#f9fafb",
  surface: "#ffffff",
  success: "#22C55E",
  warning: "#EAB308",
  error: "#EF4444",
};

// Email template wrapper
function emailTemplate(content: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: system-ui, -apple-system, 'Segoe UI', sans-serif; margin: 0; padding: 0; background-color: ${
        BRAND.background
      };">
        <div style="max-width: 600px; margin: 40px auto; background-color: ${
          BRAND.surface
        }; border-radius: 8px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <div style="background-color: ${
            BRAND.primary
          }; padding: 24px 32px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="color: #ffffff; font-size: 20px; font-weight: 700; margin: 0;">2BAConcours</h1>
          </div>
          <!-- Content -->
          <div style="padding: 40px 32px;">
            ${content}
          </div>
          <!-- Footer -->
          <div style="padding: 24px 32px; border-top: 1px solid #e5e7eb; text-align: center;">
            <p style="color: ${BRAND.textMuted}; font-size: 12px; margin: 0;">
              © ${new Date().getFullYear()} 2BAConcours. Tous droits réservés.
            </p>
            <p style="color: ${
              BRAND.textMuted
            }; font-size: 12px; margin: 8px 0 0 0;">
              <a href="${appUrl}" style="color: ${
    BRAND.primary
  }; text-decoration: none;">Visit Dashboard</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export const emailService = {
  async sendVerificationEmail(email: string, token: string) {
    const verifyUrl = `${appUrl}/verify-email?token=${token}`;

    try {
      const result = await resend.emails.send({
        from: fromEmail,
        to: email,
        subject: "Vérifiez votre adresse email - 2BAConcours",
        html: emailTemplate(`
          <h2 style="color: ${BRAND.textPrimary}; font-size: 24px; font-weight: 700; margin: 0 0 16px 0; text-align: center;">
            Bienvenue sur 2BAConcours
          </h2>
          <p style="color: ${BRAND.textSecondary}; font-size: 16px; line-height: 24px; margin: 0 0 32px 0; text-align: center;">
            Click the button below to verify your email address and activate your account.
          </p>
          <div style="text-align: center;">
            <a href="${verifyUrl}" style="display: inline-block; background-color: ${BRAND.primary}; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 12px 32px; border-radius: 6px;">
              Verify Email Address
            </a>
          </div>
          <p style="color: ${BRAND.textMuted}; font-size: 14px; line-height: 20px; margin: 32px 0 0 0; text-align: center;">
            Or copy and paste this link into your browser:<br>
            <a href="${verifyUrl}" style="color: ${BRAND.primary}; word-break: break-all;">${verifyUrl}</a>
          </p>
          <p style="color: ${BRAND.textMuted}; font-size: 14px; line-height: 20px; margin: 32px 0 0 0; text-align: center;">
            This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
          </p>
        `),
      });
      return { success: true, data: result };
    } catch (error) {
      throw error;
    }
  },

  async sendPasswordResetEmail(email: string, token: string) {
    const resetUrl = `${appUrl}/reset-password?token=${token}`;

    try {
      const result = await resend.emails.send({
        from: fromEmail,
        to: email,
        subject: "Réinitialisez votre mot de passe - 2BAConcours",
        html: emailTemplate(`
          <h2 style="color: ${BRAND.textPrimary}; font-size: 24px; font-weight: 700; margin: 0 0 16px 0; text-align: center;">
            Reset Your Password
          </h2>
          <p style="color: ${BRAND.textSecondary}; font-size: 16px; line-height: 24px; margin: 0 0 32px 0; text-align: center;">
            We received a request to reset your password. Click the button below to create a new password.
          </p>
          <div style="text-align: center;">
            <a href="${resetUrl}" style="display: inline-block; background-color: ${BRAND.primary}; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 12px 32px; border-radius: 6px;">
              Reset Password
            </a>
          </div>
          <p style="color: ${BRAND.textMuted}; font-size: 14px; line-height: 20px; margin: 32px 0 0 0; text-align: center;">
            Or copy and paste this link into your browser:<br>
            <a href="${resetUrl}" style="color: ${BRAND.primary}; word-break: break-all;">${resetUrl}</a>
          </p>
          <p style="color: ${BRAND.textMuted}; font-size: 14px; line-height: 20px; margin: 32px 0 0 0; text-align: center;">
            This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
          </p>
        `),
      });
      return { success: true, data: result };
    } catch (error) {
      throw error;
    }
  },

  async sendPaymentApprovedEmail(email: string, userName: string) {
    const dashboardUrl = `${appUrl}/student`;

    try {
      const result = await resend.emails.send({
        from: fromEmail,
        to: email,
        subject: "✅ Paiement approuvé - Bienvenue sur 2BAConcours",
        html: emailTemplate(`
          <div style="text-align: center; margin-bottom: 24px;">
            <span style="font-size: 48px;">🎉</span>
          </div>
          <h2 style="color: ${BRAND.textPrimary}; font-size: 24px; font-weight: 700; margin: 0 0 16px 0; text-align: center;">
            Paiement Approuvé !
          </h2>
          <p style="color: ${BRAND.textSecondary}; font-size: 16px; line-height: 24px; margin: 0 0 24px 0; text-align: center;">
            Bonjour ${userName},
          </p>
          <div style="background-color: #f0fdf4; border-radius: 8px; padding: 20px; margin-bottom: 24px; border-left: 4px solid ${BRAND.success};">
            <p style="color: ${BRAND.textPrimary}; font-size: 16px; line-height: 24px; margin: 0;">
              Excellente nouvelle ! Votre preuve de paiement a été vérifiée et approuvée. Votre compte est maintenant actif et vous pouvez accéder à tous les contenus de la plateforme.
            </p>
          </div>
          <div style="background-color: ${BRAND.background}; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
            <h3 style="color: ${BRAND.textPrimary}; font-size: 16px; font-weight: 600; margin: 0 0 12px 0;">
              Prochaines étapes :
            </h3>
            <ul style="color: ${BRAND.textSecondary}; font-size: 14px; line-height: 24px; margin: 0; padding-left: 20px;">
              <li>Connectez-vous à votre tableau de bord</li>
              <li>Accédez aux livres et vidéos</li>
              <li>Suivez votre progression</li>
            </ul>
          </div>
          <div style="text-align: center;">
            <a href="${dashboardUrl}" style="display: inline-block; background-color: ${BRAND.primary}; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 12px 32px; border-radius: 6px;">
              Accéder au tableau de bord
            </a>
          </div>
          <p style="color: ${BRAND.textMuted}; font-size: 14px; line-height: 20px; margin: 32px 0 0 0; text-align: center;">
            Si vous avez des questions, n'hésitez pas à nous contacter.
          </p>
        `),
      });
      return { success: true, data: result };
    } catch (error) {
      throw error;
    }
  },

  async sendPaymentRejectedEmail(
    email: string,
    userName: string,
    rejectionReason: string
  ) {
    const paymentUrl = `${appUrl}/student/payment`;

    try {
      const result = await resend.emails.send({
        from: fromEmail,
        to: email,
        subject: "⚠️ Action requise - Preuve de paiement à soumettre à nouveau",
        html: emailTemplate(`
          <div style="text-align: center; margin-bottom: 24px;">
            <span style="font-size: 48px;">⚠️</span>
          </div>
          <h2 style="color: ${BRAND.textPrimary}; font-size: 24px; font-weight: 700; margin: 0 0 16px 0; text-align: center;">
            Preuve de paiement à revoir
          </h2>
          <p style="color: ${BRAND.textSecondary}; font-size: 16px; line-height: 24px; margin: 0 0 24px 0; text-align: center;">
            Bonjour ${userName},
          </p>
          <div style="background-color: #fef2f2; border-radius: 8px; padding: 20px; margin-bottom: 24px; border-left: 4px solid ${BRAND.error};">
            <p style="color: ${BRAND.textPrimary}; font-size: 16px; line-height: 24px; margin: 0 0 12px 0; font-weight: 600;">
              Votre preuve de paiement a été examinée et nécessite une nouvelle soumission.
            </p>
            <p style="color: ${BRAND.textSecondary}; font-size: 14px; line-height: 20px; margin: 0;">
              <strong>Raison :</strong> ${rejectionReason}
            </p>
          </div>
          <div style="background-color: ${BRAND.background}; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
            <h3 style="color: ${BRAND.textPrimary}; font-size: 16px; font-weight: 600; margin: 0 0 12px 0;">
              Comment procéder :
            </h3>
            <ul style="color: ${BRAND.textSecondary}; font-size: 14px; line-height: 24px; margin: 0; padding-left: 20px;">
              <li>Vérifiez que votre document est clair et lisible</li>
              <li>Assurez-vous que toutes les informations sont visibles</li>
              <li>Utilisez un format accepté (JPG, PNG, WebP ou PDF)</li>
              <li>Le fichier ne doit pas dépasser 5 Mo</li>
            </ul>
          </div>
          <div style="text-align: center;">
            <a href="${paymentUrl}" style="display: inline-block; background-color: ${BRAND.primary}; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 12px 32px; border-radius: 6px;">
              Soumettre une nouvelle preuve
            </a>
          </div>
          <p style="color: ${BRAND.textMuted}; font-size: 14px; line-height: 20px; margin: 32px 0 0 0; text-align: center;">
            Si vous avez des questions ou besoin d'aide, n'hésitez pas à nous contacter.
          </p>
        `),
      });
      return { success: true, data: result };
    } catch (error) {
      throw error;
    }
  },
};

// ============================================================
// NOTIFICATION EMAIL SERVICE
// ============================================================

const notificationIcons: Record<
  NotificationType,
  { icon: string; color: string }
> = {
  USER_ACTIVATED: { icon: "✅", color: BRAND.success },
  USER_DEACTIVATED: { icon: "🔒", color: BRAND.error },
  NEW_USER_REGISTERED: { icon: "👤", color: BRAND.primary },
  SYSTEM_ANNOUNCEMENT: { icon: "📢", color: BRAND.primary },
  PAYMENT_SUBMITTED: { icon: "💳", color: BRAND.primary },
  PAYMENT_APPROVED: { icon: "✅", color: BRAND.success },
  PAYMENT_REJECTED: { icon: "⚠️", color: BRAND.error },
  NEW_RESOURCE: { icon: "📚", color: BRAND.primary },
};

export const notificationEmailService = {
  async sendNotificationEmail(
    email: string,
    userName: string,
    title: string,
    message: string,
    type: NotificationType,
    data?: Record<string, unknown> | null
  ) {
    const { icon, color } = notificationIcons[type] || {
      icon: "🔔",
      color: BRAND.primary,
    };

    // Build action URL based on notification type
    let actionUrl = appUrl;
    let actionText = "View Dashboard";

    switch (type) {
      case "NEW_USER_REGISTERED":
        actionUrl = `${appUrl}/admin/users`;
        actionText = "Gérer les utilisateurs";
        break;
      case "USER_ACTIVATED":
        actionUrl = `${appUrl}/student`;
        actionText = "Accéder au tableau de bord";
        break;
      case "PAYMENT_SUBMITTED":
        actionUrl = `${appUrl}/admin`;
        actionText = "Voir les paiements";
        break;
      case "PAYMENT_APPROVED":
        actionUrl = `${appUrl}/student`;
        actionText = "Accéder au tableau de bord";
        break;
      case "PAYMENT_REJECTED":
        actionUrl = `${appUrl}/student/payment`;
        actionText = "Soumettre à nouveau";
        break;
      case "NEW_RESOURCE":
        if (data?.resourceType === "BOOK") {
          actionUrl = `${appUrl}/student/books`;
          actionText = "Voir les livres";
        } else if (data?.resourceType === "VIDEO") {
          actionUrl = `${appUrl}/student/videos`;
          actionText = "Voir les vidéos";
        } else if (data?.resourceType === "QCM") {
          actionUrl = `${appUrl}/student/qcm`;
          actionText = "Voir les QCM";
        }
        break;
    }

    try {
      const result = await resend.emails.send({
        from: fromEmail,
        to: email,
        subject: `${icon} ${title} - 2BAConcours`,
        html: emailTemplate(`
          <div style="text-align: center; margin-bottom: 24px;">
            <span style="font-size: 48px;">${icon}</span>
          </div>
          <h2 style="color: ${BRAND.textPrimary}; font-size: 24px; font-weight: 700; margin: 0 0 8px 0; text-align: center;">
            ${title}
          </h2>
          <p style="color: ${BRAND.textSecondary}; font-size: 14px; margin: 0 0 24px 0; text-align: center;">
            Hi ${userName},
          </p>
          <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 24px; border-left: 4px solid ${color};">
            <p style="color: ${BRAND.textPrimary}; font-size: 16px; line-height: 24px; margin: 0;">
              ${message}
            </p>
          </div>
          <div style="text-align: center;">
            <a href="${actionUrl}" style="display: inline-block; background-color: ${BRAND.primary}; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 6px;">
              ${actionText}
            </a>
          </div>
          <p style="color: ${BRAND.textMuted}; font-size: 12px; line-height: 18px; margin: 24px 0 0 0; text-align: center;">
            You received this email because you have notifications enabled for this type of activity.
            <br>
            <a href="${appUrl}/admin/profile" style="color: ${BRAND.primary}; text-decoration: none;">Manage notification preferences</a>
          </p>
        `),
      });
      return { success: true, data: result };
    } catch (error) {
      console.error("Failed to send notification email:", error);
      throw error;
    }
  },
};
