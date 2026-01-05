import { NextResponse } from "next/server";
import { categoryService } from "@/lib/services/settings-resources.service";
import { MESSAGES } from "@/lib/constants";

/**
 * GET /api/settings/categories/active
 * Get active categories for dropdowns (public access)
 */
export async function GET() {
  try {
    const categories = await categoryService.getActive();

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Get active categories error:", error);

    return NextResponse.json(
      { error: MESSAGES.ERROR.GENERIC },
      { status: 500 }
    );
  }
}
