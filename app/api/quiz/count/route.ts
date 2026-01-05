import { NextRequest, NextResponse } from "next/server";
import { qcmService } from "@/lib/services/qcm.service";
import { validateApiSession, ApiAuthError } from "@/lib/auth-security";
import { MESSAGES } from "@/lib/constants";

/**
 * GET /api/quiz/count
 * Get question count for a school/matiere combination
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

    const school = req.nextUrl.searchParams.get("school");
    const matiere = req.nextUrl.searchParams.get("matiere");

    if (!school || !matiere) {
      return NextResponse.json(
        { error: "Paramètres 'school' et 'matiere' requis" },
        { status: 400 }
      );
    }

    const count = await qcmService.getQuestionCount(school, matiere);

    return NextResponse.json({
      success: true,
      data: { count },
    });
  } catch (error) {
    console.error("Get question count error:", error);

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
