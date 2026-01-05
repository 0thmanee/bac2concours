import { NextRequest, NextResponse } from "next/server";
import { qcmService } from "@/lib/services/qcm.service";
import {
  createQuestionSchema,
  questionFiltersSchema,
  type QuestionFilters,
} from "@/lib/validations/qcm.validation";
import {
  requireApiAdmin,
  validateApiSession,
  ApiAuthError,
} from "@/lib/auth-security";
import { ZodError } from "zod";
import { MESSAGES } from "@/lib/constants";
import { formatZodError } from "@/lib/utils/error.utils";

/**
 * GET /api/questions
 * Get all questions with optional filtering and pagination
 * Admin: sees all questions
 * Students: only active, public questions
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
      search: searchParams.get("search") || undefined,
      school: searchParams.get("school") || undefined,
      matiere: searchParams.get("matiere") || undefined,
      chapter: searchParams.get("chapter") || undefined,
      difficulty: searchParams.get("difficulty") || undefined,
      status: searchParams.get("status") || undefined,
      isPublic: searchParams.get("isPublic")
        ? searchParams.get("isPublic") === "true"
        : undefined,
      tags: searchParams.get("tags")
        ? searchParams.get("tags")!.split(",")
        : undefined,
      page: searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1,
      limit: searchParams.get("limit")
        ? parseInt(searchParams.get("limit")!)
        : 20,
      sortBy:
        (searchParams.get("sortBy") as QuestionFilters["sortBy"]) ||
        "createdAt",
      sortOrder:
        (searchParams.get("sortOrder") as QuestionFilters["sortOrder"]) ||
        "desc",
    };

    // If not admin, force isPublic=true and status=ACTIVE
    if (user.role !== "ADMIN") {
      filters.isPublic = true;
      filters.status = "ACTIVE";
    }

    // Validate filters
    const validated = questionFiltersSchema.parse(filters);

    const result = await qcmService.findAllQuestions(validated);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Get questions error:", error);

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

/**
 * POST /api/questions
 * Create a new question (Admin only)
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requireApiAdmin();

    const body = await req.json();
    const validated = createQuestionSchema.parse(body);

    const question = await qcmService.createQuestion(validated, user.id);

    return NextResponse.json(
      {
        success: true,
        message: "Question créée avec succès",
        data: question,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create question error:", error);

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
