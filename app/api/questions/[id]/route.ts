import { NextRequest, NextResponse } from "next/server";
import { qcmService } from "@/lib/services/qcm.service";
import { updateQuestionSchema } from "@/lib/validations/qcm.validation";
import {
  requireApiAdmin,
  validateApiSession,
  ApiAuthError,
} from "@/lib/auth-security";
import { ZodError } from "zod";
import { MESSAGES } from "@/lib/constants";
import { formatZodError } from "@/lib/utils/error.utils";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/questions/[id]
 * Get a single question by ID
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

    const { id } = await params;
    const question = await qcmService.findQuestionById(id);

    if (!question) {
      return NextResponse.json(
        { error: "Question non trouvée" },
        { status: 404 }
      );
    }

    // Non-admin can only see active, public questions
    if (
      user.role !== "ADMIN" &&
      (!question.isPublic || question.status !== "ACTIVE")
    ) {
      return NextResponse.json(
        { error: "Question non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: question,
    });
  } catch (error) {
    console.error("Get question error:", error);

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

/**
 * PATCH /api/questions/[id]
 * Update a question (Admin only)
 */
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    await requireApiAdmin();

    const { id } = await params;
    const body = await req.json();
    const validated = updateQuestionSchema.parse(body);

    const question = await qcmService.updateQuestion(id, validated);

    return NextResponse.json({
      success: true,
      message: "Question mise à jour avec succès",
      data: question,
    });
  } catch (error) {
    console.error("Update question error:", error);

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
 * DELETE /api/questions/[id]
 * Delete a question (Admin only)
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    await requireApiAdmin();

    const { id } = await params;
    await qcmService.deleteQuestion(id);

    return NextResponse.json({
      success: true,
      message: "Question supprimée avec succès",
    });
  } catch (error) {
    console.error("Delete question error:", error);

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
