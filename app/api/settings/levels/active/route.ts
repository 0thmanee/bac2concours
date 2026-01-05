import { NextResponse } from "next/server";
import { levelService } from "@/lib/services/settings-resources.service";
import { MESSAGES } from "@/lib/constants";

/**
 * GET /api/settings/levels/active
 * Get active levels for dropdowns (public access)
 */
export async function GET() {
  try {
    const levels = await levelService.getActive();

    return NextResponse.json({
      success: true,
      data: levels,
    });
  } catch (error) {
    console.error("Get active levels error:", error);

    return NextResponse.json(
      { error: MESSAGES.ERROR.GENERIC },
      { status: 500 }
    );
  }
}
