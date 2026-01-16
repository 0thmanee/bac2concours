/**
 * Google Drive Service - Manage folder permissions
 * Uses Google Drive API v3 with Service Account authentication
 */

import { google, drive_v3 } from "googleapis";

// Permission roles supported by Google Drive
export type DrivePermissionRole = "reader" | "commenter" | "writer";

export interface GrantAccessOptions {
  email: string;
  role: DrivePermissionRole;
  sendNotification?: boolean;
  emailMessage?: string;
}

export interface GrantAccessResult {
  email: string;
  success: boolean;
  permissionId?: string;
  error?: string;
}

export interface BatchGrantAccessResult {
  total: number;
  successful: number;
  failed: number;
  results: GrantAccessResult[];
}

export interface FolderPermission {
  id: string;
  email: string;
  role: string;
  type: string;
  displayName?: string;
}

/**
 * Initialize Google Drive client with Service Account credentials
 */
function getDriveClient(): drive_v3.Drive {
  const credentials = getServiceAccountCredentials();

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/drive"],
  });

  return google.drive({ version: "v3", auth });
}

/**
 * Get service account credentials from environment variables
 */
function getServiceAccountCredentials() {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

  if (!clientEmail || !privateKey) {
    throw new Error(
      "Google Service Account credentials not configured. " +
      "Please set GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY environment variables."
    );
  }

  // Handle escaped newlines in private key (common in env vars)
  const formattedPrivateKey = privateKey.replace(/\\n/g, "\n");

  return {
    client_email: clientEmail,
    private_key: formattedPrivateKey,
  };
}

/**
 * Get the configured Google Drive folder ID
 */
function getFolderId(): string {
  const folderId = process.env.GOOGLE_DRIVE_BOOKS_FOLDER_ID;

  if (!folderId) {
    throw new Error(
      "Google Drive folder ID not configured. " +
      "Please set GOOGLE_DRIVE_BOOKS_FOLDER_ID environment variable."
    );
  }

  return folderId;
}

export const googleDriveService = {
  /**
   * Check if Google Drive integration is configured
   */
  isConfigured(): boolean {
    return !!(
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
      process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY &&
      process.env.GOOGLE_DRIVE_BOOKS_FOLDER_ID
    );
  },

  /**
   * Get folder information
   */
  async getFolderInfo(): Promise<{ id: string; name: string; webViewLink: string } | null> {
    if (!this.isConfigured()) return null;

    try {
      const drive = getDriveClient();
      const folderId = getFolderId();

      const response = await drive.files.get({
        fileId: folderId,
        fields: "id, name, webViewLink",
      });

      return {
        id: response.data.id || folderId,
        name: response.data.name || "Books Folder",
        webViewLink: response.data.webViewLink || `https://drive.google.com/drive/folders/${folderId}`,
      };
    } catch (error) {
      console.error("Error getting folder info:", error);
      return null;
    }
  },

  /**
   * Grant access to a single user
   */
  async grantAccess({
    email,
    role,
    sendNotification = false,
    emailMessage,
  }: GrantAccessOptions): Promise<GrantAccessResult> {
    try {
      const drive = getDriveClient();
      const folderId = getFolderId();

      const response = await drive.permissions.create({
        fileId: folderId,
        sendNotificationEmail: sendNotification,
        emailMessage: emailMessage,
        requestBody: {
          type: "user",
          role: role,
          emailAddress: email,
        },
      });

      return {
        email,
        success: true,
        permissionId: response.data.id || undefined,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error(`Error granting access to ${email}:`, errorMessage);

      return {
        email,
        success: false,
        error: errorMessage,
      };
    }
  },

  /**
   * Grant access to multiple users with rate limiting
   * Google Drive API doesn't support concurrent permission operations on the same file
   */
  async grantAccessToMultiple(
    emails: string[],
    role: DrivePermissionRole,
    options?: {
      sendNotification?: boolean;
      emailMessage?: string;
      delayMs?: number; // Delay between requests to avoid rate limiting
    }
  ): Promise<BatchGrantAccessResult> {
    const {
      sendNotification = false,
      emailMessage,
      delayMs = 100, // 100ms delay between requests
    } = options || {};

    const results: GrantAccessResult[] = [];
    let successful = 0;
    let failed = 0;

    for (const email of emails) {
      const result = await this.grantAccess({
        email,
        role,
        sendNotification,
        emailMessage,
      });

      results.push(result);

      if (result.success) {
        successful++;
      } else {
        failed++;
      }

      // Add delay between requests to avoid rate limiting
      if (delayMs > 0 && emails.indexOf(email) < emails.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    return {
      total: emails.length,
      successful,
      failed,
      results,
    };
  },

  /**
   * List current permissions on the folder
   */
  async listPermissions(): Promise<FolderPermission[]> {
    try {
      const drive = getDriveClient();
      const folderId = getFolderId();

      const response = await drive.permissions.list({
        fileId: folderId,
        fields: "permissions(id, emailAddress, role, type, displayName)",
      });

      return (response.data.permissions || []).map((p) => ({
        id: p.id || "",
        email: p.emailAddress || "",
        role: p.role || "",
        type: p.type || "",
        displayName: p.displayName || undefined,
      }));
    } catch (error) {
      console.error("Error listing permissions:", error);
      return [];
    }
  },

  /**
   * Revoke access for a user
   */
  async revokeAccess(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const drive = getDriveClient();
      const folderId = getFolderId();

      // First, find the permission ID for this email
      const permissions = await this.listPermissions();
      const permission = permissions.find(
        (p) => p.email.toLowerCase() === email.toLowerCase() && p.type === "user"
      );

      if (!permission) {
        return {
          success: false,
          error: "Permission not found for this email",
        };
      }

      await drive.permissions.delete({
        fileId: folderId,
        permissionId: permission.id,
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error(`Error revoking access for ${email}:`, errorMessage);

      return {
        success: false,
        error: errorMessage,
      };
    }
  },

  /**
   * Sync folder access with platform users
   * Grants access to all users who don't have it yet
   */
  async syncAccessWithUsers(
    userEmails: string[],
    role: DrivePermissionRole,
    options?: {
      sendNotification?: boolean;
      emailMessage?: string;
    }
  ): Promise<BatchGrantAccessResult & { skipped: number }> {
    // Get current permissions
    const currentPermissions = await this.listPermissions();
    const currentEmails = new Set(
      currentPermissions
        .filter((p) => p.type === "user")
        .map((p) => p.email.toLowerCase())
    );

    // Filter out users who already have access
    const emailsToGrant = userEmails.filter(
      (email) => !currentEmails.has(email.toLowerCase())
    );

    const skipped = userEmails.length - emailsToGrant.length;

    if (emailsToGrant.length === 0) {
      return {
        total: userEmails.length,
        successful: 0,
        failed: 0,
        skipped,
        results: [],
      };
    }

    const result = await this.grantAccessToMultiple(emailsToGrant, role, options);

    return {
      ...result,
      total: userEmails.length,
      skipped,
    };
  },
};
