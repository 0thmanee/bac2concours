/**
 * POST /api/notifications/mark-read - Mark notifications as read
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { notificationService } from "@/lib/services/notification.service";
import { markAsReadSchema } from "@/lib/validations/notification.validation";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { notificationId, markAll } = markAsReadSchema.parse(body);

    if (markAll) {
      await notificationService.markAllAsRead(session.user.id);
      return NextResponse.json({
        success: true,
        message: "All notifications marked as read",
      });
    }

    if (notificationId) {
      // Verify the notification belongs to the user
      const notification = await notificationService.findById(notificationId);
      if (!notification || notification.userId !== session.user.id) {
        return NextResponse.json(
          { error: "Notification not found" },
          { status: 404 }
        );
      }

      await notificationService.markAsRead(notificationId);
      return NextResponse.json({
        success: true,
        message: "Notification marked as read",
      });
    }

    return NextResponse.json(
      { error: "Either notificationId or markAll must be provided" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    return NextResponse.json(
      { error: "Failed to mark notifications as read" },
      { status: 500 }
    );
  }
}
