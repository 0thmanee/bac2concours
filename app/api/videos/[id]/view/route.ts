import { NextRequest, NextResponse } from "next/server";
import { videoService } from "@/lib/services/video.service";
import { validateApiSession, ApiAuthError } from "@/lib/auth-security";
import { MESSAGES } from "@/lib/constants";

/**
 * POST /api/videos/[id]/view
 * Increment video views count
 * Accessible by authenticated users
 */
export async function POST(
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

    await videoService.incrementViews(id);

    return NextResponse.json({
      success: true,
      message: "Vue enregistrée",
    });
  } catch (error) {
    console.error("Increment video views error:", error);

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
