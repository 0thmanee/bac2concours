import { NextRequest, NextResponse } from "next/server";
import { videoService } from "@/lib/services/video.service";
import { validateApiSession, ApiAuthError } from "@/lib/auth-security";
import { MESSAGES } from "@/lib/constants";

/**
 * GET /api/videos/filter-options
 * Get unique filter options for dropdowns
 * Accessible by authenticated users
 */
export async function GET(req: NextRequest) {
  try {
    const user = await validateApiSession();

    if (!user) {
      return NextResponse.json(
        { error: MESSAGES.ERROR.UNAUTHORIZED },
        { status: 401 }
      );
    }

    const options = await videoService.getFilterOptions();

    return NextResponse.json({
      success: true,
      data: options,
    });
  } catch (error) {
    console.error("Get video filter options error:", error);

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
