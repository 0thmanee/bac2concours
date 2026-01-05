import { NextRequest, NextResponse } from "next/server";
import { schoolService } from "@/lib/services/school.service";
import { validateApiSession, ApiAuthError } from "@/lib/auth-security";
import { MESSAGES } from "@/lib/constants";

/**
 * POST /api/schools/[id]/view
 * Increment view counter for a school
 * Accessible by authenticated users
 */
export async function POST(
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

    const school = await schoolService.incrementView(id);

    return NextResponse.json({
      success: true,
      data: { views: school.views },
    });
  } catch (error) {
    console.error("Increment school view error:", error);

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
