import { NextRequest, NextResponse } from "next/server";
import { matiereService } from "@/lib/services/settings-resources.service";
import { createMatiereSchema } from "@/lib/validations/settings-resources.validation";
import { validateApiSession, ApiAuthError } from "@/lib/auth-security";
import { ZodError } from "zod";
import { MESSAGES } from "@/lib/constants";
import { formatZodError } from "@/lib/utils/error.utils";

/**
 * GET /api/settings/matieres
 * Get all matieres
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

    const result = await matiereService.getAll();

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Get matieres error:", error);

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
 * POST /api/settings/matieres
 * Create a new matiere
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
    const validated = createMatiereSchema.parse(body);
    const matiere = await matiereService.create(validated);

    return NextResponse.json(
      {
        success: true,
        data: matiere,
        message: "Matière créée avec succès",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create matiere error:", error);

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
