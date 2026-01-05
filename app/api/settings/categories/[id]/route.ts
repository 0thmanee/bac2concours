import { NextRequest, NextResponse } from "next/server";
import { categoryService } from "@/lib/services/settings-resources.service";
import { updateCategorySchema } from "@/lib/validations/settings-resources.validation";
import { validateApiSession, ApiAuthError } from "@/lib/auth-security";
import { ZodError } from "zod";
import { MESSAGES } from "@/lib/constants";
import { formatZodError } from "@/lib/utils/error.utils";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/settings/categories/[id]
 * Get a single category
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const user = await validateApiSession();

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: MESSAGES.ERROR.UNAUTHORIZED },
        { status: 401 }
      );
    }

    const { id } = await params;
    const category = await categoryService.getById(id);

    if (!category) {
      return NextResponse.json(
        { error: "Catégorie non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error("Get category error:", error);

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
 * PATCH /api/settings/categories/[id]
 * Update a category
 */
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const user = await validateApiSession();

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: MESSAGES.ERROR.UNAUTHORIZED },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const validated = updateCategorySchema.parse(body);
    const category = await categoryService.update(id, validated);

    return NextResponse.json({
      success: true,
      data: category,
      message: "Catégorie mise à jour avec succès",
    });
  } catch (error) {
    console.error("Update category error:", error);

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

/**
 * DELETE /api/settings/categories/[id]
 * Delete a category
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const user = await validateApiSession();

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: MESSAGES.ERROR.UNAUTHORIZED },
        { status: 401 }
      );
    }

    const { id } = await params;
    await categoryService.delete(id);

    return NextResponse.json({
      success: true,
      message: "Catégorie supprimée avec succès",
    });
  } catch (error) {
    console.error("Delete category error:", error);

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
