import { NextRequest } from "next/server";
import { z } from "zod";
import { handleApiRequest, requireAdmin } from "@/lib/api-utils";
import { googleDriveService, DrivePermissionRole } from "@/lib/services/google-drive.service";
import prisma from "@/lib/prisma";

// Validation schema for grant access request
const grantAccessSchema = z.object({
  role: z.enum(["reader", "commenter", "writer"]).default("reader"),
  // Either provide specific user IDs or a target filter
  userIds: z.array(z.string()).optional(),
  targetUsers: z.enum(["all", "approved", "active"]).optional(),
  sendNotification: z.boolean().default(false),
  emailMessage: z.string().max(500).optional(),
});

/**
 * POST /api/drive/grant-access - Grant folder access to platform users
 */
export async function POST(req: NextRequest) {
  return handleApiRequest(req, async () => {
    await requireAdmin();

    if (!googleDriveService.isConfigured()) {
      throw new Error("Google Drive integration is not configured");
    }

    const body = await req.json();
    const { role, userIds, targetUsers, sendNotification, emailMessage } = grantAccessSchema.parse(body);

    let emails: string[] = [];

    if (userIds && userIds.length > 0) {
      // Get emails for specific user IDs
      const users = await prisma.user.findMany({
        where: {
          id: { in: userIds },
        },
        select: {
          email: true,
        },
      });
      emails = users.map((u) => u.email);
    } else if (targetUsers) {
      // Build user query based on target filter
      const whereClause = buildUserWhereClause(targetUsers);
      const users = await prisma.user.findMany({
        where: whereClause,
        select: {
          email: true,
        },
      });
      emails = users.map((u) => u.email);
    }

    if (emails.length === 0) {
      return {
        success: true,
        message: "No users found matching the criteria",
        total: 0,
        successful: 0,
        failed: 0,
        skipped: 0,
      };
    }

    // Grant access with sync (skips users who already have access)
    const result = await googleDriveService.syncAccessWithUsers(emails, role as DrivePermissionRole, {
      sendNotification,
      emailMessage,
    });

    return {
      success: true,
      message: `Access granted to ${result.successful} users`,
      total: result.total,
      successful: result.successful,
      failed: result.failed,
      skipped: result.skipped,
      failedEmails: result.results
        .filter((r) => !r.success)
        .map((r) => ({ email: r.email, error: r.error })),
    };
  });
}

/**
 * Build Prisma where clause based on target users
 */
function buildUserWhereClause(target: string) {
  switch (target) {
    case "all":
      // All users with verified email
      return {
        emailVerified: { not: null },
      };
    case "active":
      // Active users with verified email
      return {
        status: "ACTIVE" as const,
        emailVerified: { not: null },
      };
    case "approved":
    default:
      // Approved payment users who are active
      return {
        status: "ACTIVE" as const,
        paymentStatus: "APPROVED" as const,
        emailVerified: { not: null },
      };
  }
}
