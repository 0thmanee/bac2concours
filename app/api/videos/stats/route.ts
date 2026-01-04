import { NextRequest, NextResponse } from "next/server";
import { videoService } from "@/lib/services/video.service";
import { validateApiSession, ApiAuthError } from "@/lib/auth-security";
import { MESSAGES } from "@/lib/constants";

/**
 * GET /api/videos/stats
 * Get video statistics for dashboard
 * Admin only
 */
export async function GET(req: NextRequest) {
  try {
    const user = await validateApiSession();

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: MESSAGES.ERROR.UNAUTHORIZED },
        { status: 401 }
      );
    }

    const stats = await videoService.getStats();

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Get video stats error:", error);

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
