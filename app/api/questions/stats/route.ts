import { NextResponse } from "next/server";
import { qcmService } from "@/lib/services/qcm.service";
import { requireApiAdmin, ApiAuthError } from "@/lib/auth-security";
import { MESSAGES } from "@/lib/constants";

/**
 * GET /api/questions/stats
 * Get question statistics (Admin only)
 */
export async function GET() {
  try {
    await requireApiAdmin();

    const stats = await qcmService.getQuestionStats();

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Get question stats error:", error);

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
