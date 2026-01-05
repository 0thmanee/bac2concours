import { NextResponse } from "next/server";
import { qcmService } from "@/lib/services/qcm.service";
import { validateApiSession, ApiAuthError } from "@/lib/auth-security";
import { MESSAGES } from "@/lib/constants";

/**
 * GET /api/questions/filter-options
 * Get filter options for questions (schools, matieres, chapters, difficulties)
 */
export async function GET() {
  try {
    const user = await validateApiSession();

    if (!user) {
      return NextResponse.json(
        { error: MESSAGES.ERROR.UNAUTHORIZED },
        { status: 401 }
      );
    }

    const filterOptions = await qcmService.getQuestionFilterOptions();

    return NextResponse.json({
      success: true,
      data: filterOptions,
    });
  } catch (error) {
    console.error("Get question filter options error:", error);

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
