import { NextRequest, NextResponse } from "next/server";
import { announcementService } from "@/lib/services/announcement.service";
import { updateAnnouncementSchema } from "@/lib/validations/announcement.validation";
import {
  requireApiAdmin,
  validateApiSession,
  ApiAuthError,
} from "@/lib/auth-security";
import { ZodError } from "zod";
import { MESSAGES } from "@/lib/constants";
import { formatZodError } from "@/lib/utils/error.utils";

/**
 * GET /api/announcements/[id]
 * Admin: any. Others: published only.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await validateApiSession();
    const { id } = await params;

    if (!user) {
      return NextResponse.json(
        { error: MESSAGES.ERROR.UNAUTHORIZED },
        { status: 401 },
      );
    }

    const announcement = await announcementService.findById(id);

    if (!announcement) {
      return NextResponse.json(
        { error: "Annonce non trouvée" },
        { status: 404 },
      );
    }

    if (user.role !== "ADMIN" && announcement.status !== "PUBLISHED") {
      return NextResponse.json(
        { error: "Annonce non disponible" },
        { status: 403 },
      );
    }

    return NextResponse.json({
      success: true,
      data: announcement,
    });
  } catch (error) {
    console.error("Get announcement error:", error);

    if (error instanceof ApiAuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    return NextResponse.json(
      { error: MESSAGES.ERROR.GENERIC },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/announcements/[id]
 * Update an announcement (Admin only)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireApiAdmin();
    const { id } = await params;

    const body = await req.json();
    const validated = updateAnnouncementSchema.parse(body);

    const announcement = await announcementService.update(id, validated);

    return NextResponse.json({
      success: true,
      message: "Annonce mise à jour avec succès",
      data: announcement,
    });
  } catch (error) {
    console.error("Update announcement error:", error);

    if (error instanceof ApiAuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: formatZodError(error) },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: MESSAGES.ERROR.GENERIC },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/announcements/[id]
 * Delete an announcement (Admin only)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireApiAdmin();
    const { id } = await params;

    await announcementService.delete(id);

    return NextResponse.json({
      success: true,
      message: "Annonce supprimée avec succès",
    });
  } catch (error) {
    console.error("Delete announcement error:", error);

    if (error instanceof ApiAuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    return NextResponse.json(
      { error: MESSAGES.ERROR.GENERIC },
      { status: 500 },
    );
  }
}
