import { NextRequest, NextResponse } from "next/server";
import { qcmService } from "@/lib/services/qcm.service";
import { validateApiSession, ApiAuthError } from "@/lib/auth-security";
import { MESSAGES } from "@/lib/constants";

/**
 * GET /api/quiz/matieres
 * Get available matieres for a specific school
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

    if (!school) {
      return NextResponse.json(
        { error: "Paramètre 'school' requis" },
        { status: 400 }
      );
    }

    const matieres = await qcmService.getMatieresForSchool(school);

    return NextResponse.json({
      success: true,
      data: matieres,
    });
  } catch (error) {
    console.error("Get matieres for school error:", error);

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
