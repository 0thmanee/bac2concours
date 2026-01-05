import { NextRequest, NextResponse } from "next/server";
import { qcmService } from "@/lib/services/qcm.service";
import { submitQuizSchema } from "@/lib/validations/qcm.validation";
import { validateApiSession, ApiAuthError } from "@/lib/auth-security";
import { ZodError } from "zod";
import { MESSAGES } from "@/lib/constants";

/**
 * POST /api/quiz/submit
 * Submit quiz answers and get results
 */
export async function POST(req: NextRequest) {
  try {
    const user = await validateApiSession();

    if (!user) {
      return NextResponse.json(
        { error: MESSAGES.ERROR.UNAUTHORIZED },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validated = submitQuizSchema.parse(body);

    const result = await qcmService.submitQuiz(user.id, validated);

    return NextResponse.json({
      success: true,
      message: "Quiz soumis avec succès",
      data: result,
    });
  } catch (error) {
    console.error("Submit quiz error:", error);

    if (error instanceof ApiAuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: MESSAGES.ERROR.GENERIC },
      { status: 500 }
    );
  }
}
