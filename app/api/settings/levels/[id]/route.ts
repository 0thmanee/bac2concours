import { NextRequest, NextResponse } from "next/server";
import { levelService } from "@/lib/services/settings-resources.service";
import { updateLevelSchema } from "@/lib/validations/settings-resources.validation";
import { validateApiSession, ApiAuthError } from "@/lib/auth-security";
import { ZodError } from "zod";
import { MESSAGES } from "@/lib/constants";
import { formatZodError } from "@/lib/utils/error.utils";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/settings/levels/[id]
 * Get a single level
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
    const level = await levelService.getById(id);

    if (!level) {
      return NextResponse.json({ error: "Niveau non trouvé" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: level,
    });
  } catch (error) {
    console.error("Get level error:", error);

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
 * PATCH /api/settings/levels/[id]
 * Update a level
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
    const validated = updateLevelSchema.parse(body);
    const level = await levelService.update(id, validated);

    return NextResponse.json({
      success: true,
      data: level,
      message: "Niveau mis à jour avec succès",
    });
  } catch (error) {
    console.error("Update level error:", error);

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
        { error: "Un niveau avec ce nom existe déjà" },
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
 * DELETE /api/settings/levels/[id]
 * Delete a level
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
    await levelService.delete(id);

    return NextResponse.json({
      success: true,
      message: "Niveau supprimé avec succès",
    });
  } catch (error) {
    console.error("Delete level error:", error);

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
