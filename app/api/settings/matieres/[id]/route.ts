import { NextRequest, NextResponse } from "next/server";
import { matiereService } from "@/lib/services/settings-resources.service";
import { updateMatiereSchema } from "@/lib/validations/settings-resources.validation";
import { validateApiSession, ApiAuthError } from "@/lib/auth-security";
import { ZodError } from "zod";
import { MESSAGES } from "@/lib/constants";
import { formatZodError } from "@/lib/utils/error.utils";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/settings/matieres/[id]
 * Get a single matiere
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
    const matiere = await matiereService.getById(id);

    if (!matiere) {
      return NextResponse.json(
        { error: "Matière non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: matiere,
    });
  } catch (error) {
    console.error("Get matiere error:", error);

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
 * PATCH /api/settings/matieres/[id]
 * Update a matiere
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
    const validated = updateMatiereSchema.parse(body);
    const matiere = await matiereService.update(id, validated);

    return NextResponse.json({
      success: true,
      data: matiere,
      message: "Matière mise à jour avec succès",
    });
  } catch (error) {
    console.error("Update matiere error:", error);

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
        { error: "Une matière avec ce nom existe déjà" },
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
 * DELETE /api/settings/matieres/[id]
 * Delete a matiere
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
    await matiereService.delete(id);

    return NextResponse.json({
      success: true,
      message: "Matière supprimée avec succès",
    });
  } catch (error) {
    console.error("Delete matiere error:", error);

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
