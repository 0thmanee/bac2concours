/**
 * GET /api/notifications - Get user's notifications
 * POST /api/notifications - Create notification (admin only, for system announcements)
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { notificationService } from "@/lib/services/notification.service";
import {
  notificationFiltersSchema,
  createNotificationSchema,
} from "@/lib/validations/notification.validation";
import { USER_ROLE } from "@/lib/constants";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filters = notificationFiltersSchema.parse({
      isRead:
        searchParams.get("isRead") === "true"
          ? true
          : searchParams.get("isRead") === "false"
          ? false
          : undefined,
      type: searchParams.get("type") || undefined,
      limit: searchParams.get("limit") || 20,
      cursor: searchParams.get("cursor") || undefined,
    });

    const notifications = await notificationService.findByUserId(
      session.user.id,
      filters
    );

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

// POST - Create system announcement (admin only)
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== USER_ROLE.ADMIN) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const data = createNotificationSchema.parse(body);

    const notification = await notificationService.create(data);

    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    );
  }
}
