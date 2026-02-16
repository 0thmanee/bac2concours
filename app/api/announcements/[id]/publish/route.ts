import { NextRequest, NextResponse } from "next/server";
import { announcementService } from "@/lib/services/announcement.service";
import { requireApiAdmin, ApiAuthError } from "@/lib/auth-security";
import { MESSAGES } from "@/lib/constants";

/**
 * POST /api/announcements/[id]/publish
 * Publish a draft announcement and notify all users (Admin only)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireApiAdmin();
    const { id } = await params;

    const announcement = await announcementService.publish(id);

    return NextResponse.json({
      success: true,
      message: "Annonce publiée. Tous les utilisateurs ont été notifiés.",
      data: announcement,
    });
  } catch (error) {
    console.error("Publish announcement error:", error);

    if (error instanceof ApiAuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    if (error instanceof Error && error.message === "Announcement not found") {
      return NextResponse.json(
        { error: "Annonce non trouvée" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { error: MESSAGES.ERROR.GENERIC },
      { status: 500 },
    );
  }
}
