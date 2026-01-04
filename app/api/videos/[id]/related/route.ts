import { NextRequest, NextResponse } from "next/server";
import { videoService } from "@/lib/services/video.service";
import { validateApiSession, ApiAuthError } from "@/lib/auth-security";
import { MESSAGES } from "@/lib/constants";

/**
 * GET /api/videos/[id]/related
 * Get related videos based on category and school
 * Accessible by authenticated users
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

    const related = await videoService.getRelated(id);

    return NextResponse.json({
      success: true,
      data: related,
    });
  } catch (error) {
    console.error("Get related videos error:", error);

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
