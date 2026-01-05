import { NextRequest, NextResponse } from "next/server";
import { qcmService } from "@/lib/services/qcm.service";
import { quizHistoryFiltersSchema } from "@/lib/validations/qcm.validation";
import { validateApiSession, ApiAuthError } from "@/lib/auth-security";
import { ZodError } from "zod";
import { MESSAGES } from "@/lib/constants";
import { formatZodError } from "@/lib/utils/error.utils";

/**
 * GET /api/quiz/history
 * Get quiz history for the current user
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

    // Parse query parameters
    const searchParams = req.nextUrl.searchParams;
    const filters = {
      school: searchParams.get("school") || undefined,
      matiere: searchParams.get("matiere") || undefined,
      page: searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1,
      limit: searchParams.get("limit")
        ? parseInt(searchParams.get("limit")!)
        : 10,
      sortBy:
        (searchParams.get("sortBy") as "createdAt" | "score" | "percentage") ||
        "createdAt",
      sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || "desc",
    };

    const validated = quizHistoryFiltersSchema.parse(filters);
    const result = await qcmService.getQuizHistory(user.id, validated);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Get quiz history error:", error);

    if (error instanceof ApiAuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: formatZodError(error) },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: MESSAGES.ERROR.GENERIC },
      { status: 500 }
    );
  }
}
