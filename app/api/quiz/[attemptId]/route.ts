import { NextRequest, NextResponse } from "next/server";
import { qcmService } from "@/lib/services/qcm.service";
import { validateApiSession, ApiAuthError } from "@/lib/auth-security";
import { MESSAGES } from "@/lib/constants";

interface RouteParams {
  params: Promise<{ attemptId: string }>;
}

/**
 * GET /api/quiz/[attemptId]
 * Get a specific quiz attempt with answers
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const user = await validateApiSession();

    if (!user) {
      return NextResponse.json(
        { error: MESSAGES.ERROR.UNAUTHORIZED },
        { status: 401 }
      );
    }

    const { attemptId } = await params;
    const attempt = await qcmService.getQuizAttempt(attemptId, user.id);

    if (!attempt) {
      return NextResponse.json(
        { error: "Tentative non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: attempt,
    });
  } catch (error) {
    console.error("Get quiz attempt error:", error);

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
