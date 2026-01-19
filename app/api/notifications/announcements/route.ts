import { NextRequest } from "next/server";
import { handleApiRequest, requireAdmin } from "@/lib/api-utils";
import { notificationService } from "@/lib/services/notification.service";
import { z } from "zod";

const systemAnnouncementSchema = z.object({
  title: z.string().min(1, "Title is required"),
  message: z.string().min(1, "Message is required"),
  targetRole: z.enum(["ADMIN", "STUDENT"]).optional(),
  channel: z.enum(["IN_APP", "EMAIL", "BOTH"]).default("BOTH"),
});

/**
 * POST /api/notifications/announcements
 * Send a system announcement to all users or specific role
 * Admin only
 */
export async function POST(req: NextRequest) {
  return handleApiRequest(req, async () => {
    await requireAdmin();

    const body = await req.json();
    const validated = systemAnnouncementSchema.parse(body);

    const notifications = await notificationService.sendSystemAnnouncement(
      validated.title,
      validated.message,
      validated.targetRole,
      validated.channel
    );

    return {
      success: true,
      message: "System announcement sent successfully",
      notificationCount: notifications.length,
    };
  });
}
