import { NextRequest, NextResponse } from "next/server";
import { qcmService } from "@/lib/services/qcm.service";
import { startQuizSchema } from "@/lib/validations/qcm.validation";
import { validateApiSession, ApiAuthError } from "@/lib/auth-security";
import { ZodError } from "zod";
import { MESSAGES } from "@/lib/constants";

/**
 * POST /api/quiz/start
 * Get random questions to start a quiz
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
    const validated = startQuizSchema.parse(body);

    const questions = await qcmService.getRandomQuestions(validated);

    if (questions.length === 0) {
      return NextResponse.json(
        {
          error:
            "Aucune question disponible pour cette combinaison école/matière",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: questions,
    });
  } catch (error) {
    console.error("Start quiz error:", error);

    if (error instanceof ApiAuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Paramètres invalides", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: MESSAGES.ERROR.GENERIC },
      { status: 500 }
    );
  }
}
