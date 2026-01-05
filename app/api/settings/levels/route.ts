import { NextRequest, NextResponse } from "next/server";
import { levelService } from "@/lib/services/settings-resources.service";
import { createLevelSchema } from "@/lib/validations/settings-resources.validation";
import { validateApiSession, ApiAuthError } from "@/lib/auth-security";
import { ZodError } from "zod";
import { MESSAGES } from "@/lib/constants";
import { formatZodError } from "@/lib/utils/error.utils";

/**
 * GET /api/settings/levels
 * Get all levels
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

    const result = await levelService.getAll();

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Get levels error:", error);

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
 * POST /api/settings/levels
 * Create a new level
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
    const validated = createLevelSchema.parse(body);
    const level = await levelService.create(validated);

    return NextResponse.json(
      {
        success: true,
        data: level,
        message: "Niveau créé avec succès",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create level error:", error);

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
