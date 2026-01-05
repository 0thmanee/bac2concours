import { NextRequest, NextResponse } from "next/server";
import { schoolService } from "@/lib/services/school.service";
import { validateApiSession, ApiAuthError } from "@/lib/auth-security";
import { MESSAGES } from "@/lib/constants";

/**
 * GET /api/schools/[id]/related
 * Get related schools based on type and city
 * Accessible by authenticated users
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

    const related = await schoolService.getRelated(id);

    return NextResponse.json({
      success: true,
      data: related,
    });
  } catch (error) {
    console.error("Get related schools error:", error);

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
