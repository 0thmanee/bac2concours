import { NextRequest, NextResponse } from "next/server";
import { bookService } from "@/lib/services/book.service";
import { validateApiSession, ApiAuthError } from "@/lib/auth-security";
import { MESSAGES } from "@/lib/constants";

/**
 * GET /api/books/filters
 * Get available filter options
 */
export async function GET(req: NextRequest) {
  try {
    const user = await validateApiSession();
    
    if (!user) {
      return NextResponse.json(
        { error: MESSAGES.ERROR.UNAUTHORIZED },
        { status: 401 }
      );
    }

    const filters = await bookService.getFilterOptions();

    return NextResponse.json({
      success: true,
      data: filters,
    });
  } catch (error) {
    console.error("Get filter options error:", error);

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
