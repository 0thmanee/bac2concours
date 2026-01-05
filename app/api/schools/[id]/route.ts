import { NextRequest, NextResponse } from "next/server";
import { schoolService } from "@/lib/services/school.service";
import { updateSchoolSchema } from "@/lib/validations/school.validation";
import {
  requireApiAdmin,
  validateApiSession,
  ApiAuthError,
} from "@/lib/auth-security";
import { ZodError } from "zod";
import { MESSAGES } from "@/lib/constants";
import { formatZodError } from "@/lib/utils/error.utils";

/**
 * GET /api/schools/[id]
 * Get a single school by ID
 * Accessible by authenticated users (students see only public schools)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await validateApiSession();
    const { id } = await params;

    if (!user) {
      return NextResponse.json(
        { error: MESSAGES.ERROR.UNAUTHORIZED },
        { status: 401 }
      );
    }

    const school = await schoolService.findById(id);

    if (!school) {
      return NextResponse.json({ error: "École non trouvée" }, { status: 404 });
    }

    // If not admin, check if school is public and active
    if (user.role !== "ADMIN") {
      if (!school.isPublic || school.status !== "ACTIVE") {
        return NextResponse.json(
          { error: "École non disponible" },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: school,
    });
  } catch (error) {
    console.error("Get school error:", error);

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
 * PATCH /api/schools/[id]
 * Update a school (Admin only)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireApiAdmin();
    const { id } = await params;

    const body = await req.json();
    const validated = updateSchoolSchema.parse(body);

    const school = await schoolService.update(id, validated);

    return NextResponse.json({
      success: true,
      message: "École mise à jour avec succès",
      data: school,
    });
  } catch (error) {
    console.error("Update school error:", error);

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
 * DELETE /api/schools/[id]
 * Delete a school (Admin only)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireApiAdmin();
    const { id } = await params;

    await schoolService.delete(id);

    return NextResponse.json({
      success: true,
      message: "École supprimée avec succès",
    });
  } catch (error) {
    console.error("Delete school error:", error);

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
