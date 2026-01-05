import { NextResponse } from "next/server";
import { getDropdownOptions } from "@/lib/services/settings-resources.service";
import { MESSAGES } from "@/lib/constants";

/**
 * GET /api/settings/dropdown-options
 * Get all active categories, levels, and matieres for form dropdowns
 * Public access for forms
 */
export async function GET() {
  try {
    const options = await getDropdownOptions();

    return NextResponse.json({
      success: true,
      data: options,
    });
  } catch (error) {
    console.error("Get dropdown options error:", error);

    return NextResponse.json(
      { error: MESSAGES.ERROR.GENERIC },
      { status: 500 }
    );
  }
}
