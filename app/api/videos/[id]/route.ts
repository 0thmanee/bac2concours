import { NextRequest, NextResponse } from "next/server";
import { videoService } from "@/lib/services/video.service";
import { updateVideoSchema } from "@/lib/validations/video.validation";
import {
  requireApiAdmin,
  validateApiSession,
  ApiAuthError,
} from "@/lib/auth-security";
import { ZodError } from "zod";
import { MESSAGES } from "@/lib/constants";
import { formatZodError } from "@/lib/utils/error.utils";

/**
 * GET /api/videos/[id]
 * Get a single video by ID
 * Accessible by authenticated users (students see only public videos)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await validateApiSession();
    const { id } = await params;

    if (!user) {
      return NextResponse.json(
        { error: MESSAGES.ERROR.UNAUTHORIZED },
        { status: 401 }
      );
    }

    const video = await videoService.findById(id);

    if (!video) {
      return NextResponse.json({ error: "Vidéo non trouvée" }, { status: 404 });
    }

    // If not admin, check if video is public and active
    if (user.role !== "ADMIN") {
      if (!video.isPublic || video.status !== "ACTIVE") {
        return NextResponse.json(
          { error: "Vidéo non disponible" },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: video,
    });
  } catch (error) {
    console.error("Get video error:", error);

    if (error instanceof ApiAuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    return NextResponse.json(
      { error: MESSAGES.ERROR.GENERIC },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/videos/[id]
 * Update a video (Admin only)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireApiAdmin();
    const { id } = await params;

    const body = await req.json();
    const validated = updateVideoSchema.parse(body);

    const video = await videoService.update(id, validated);

    return NextResponse.json({
      success: true,
      message: "Vidéo mise à jour avec succès",
      data: video,
    });
  } catch (error) {
    console.error("Update video error:", error);

    if (error instanceof ApiAuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: formatZodError(error) },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: MESSAGES.ERROR.GENERIC },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/videos/[id]
 * Delete a video (Admin only)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireApiAdmin();
    const { id } = await params;

    await videoService.delete(id);

    return NextResponse.json({
      success: true,
      message: "Vidéo supprimée avec succès",
    });
  } catch (error) {
    console.error("Delete video error:", error);

    if (error instanceof ApiAuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    return NextResponse.json(
      { error: MESSAGES.ERROR.GENERIC },
      { status: 500 }
    );
  }
}
