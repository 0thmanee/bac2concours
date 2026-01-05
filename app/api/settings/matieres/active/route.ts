import { NextResponse } from "next/server";
import { matiereService } from "@/lib/services/settings-resources.service";
import { MESSAGES } from "@/lib/constants";

/**
 * GET /api/settings/matieres/active
 * Get active matieres for dropdowns (public access)
 */
export async function GET() {
  try {
    const matieres = await matiereService.getActive();

    return NextResponse.json({
      success: true,
      data: matieres,
    });
  } catch (error) {
    console.error("Get active matieres error:", error);

    return NextResponse.json(
      { error: MESSAGES.ERROR.GENERIC },
      { status: 500 }
    );
  }
}
