import { NextRequest, NextResponse } from "next/server";
import { categoryService } from "@/lib/services/settings-resources.service";
import { createCategorySchema } from "@/lib/validations/settings-resources.validation";
import { validateApiSession, ApiAuthError } from "@/lib/auth-security";
import { ZodError } from "zod";
import { MESSAGES } from "@/lib/constants";
import { formatZodError } from "@/lib/utils/error.utils";

/**
 * GET /api/settings/categories
 * Get all categories
 */
export async function GET() {
  try {
    const user = await validateApiSession();

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: MESSAGES.ERROR.UNAUTHORIZED },
        { status: 401 }
      );
    }

    const result = await categoryService.getAll();

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Get categories error:", error);

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
 * POST /api/settings/categories
 * Create a new category
 */
export async function POST(req: NextRequest) {
  try {
    const user = await validateApiSession();

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: MESSAGES.ERROR.UNAUTHORIZED },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validated = createCategorySchema.parse(body);
    const category = await categoryService.create(validated);

    return NextResponse.json(
      {
        success: true,
        data: category,
        message: "Catégorie créée avec succès",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create category error:", error);

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

    // Handle unique constraint violation
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "Une catégorie avec ce nom existe déjà" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: MESSAGES.ERROR.GENERIC },
      { status: 500 }
    );
  }
}
