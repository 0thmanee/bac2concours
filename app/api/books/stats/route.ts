import { NextRequest, NextResponse } from "next/server";
import { bookService } from "@/lib/services/book.service";
import { requireApiAdmin, ApiAuthError } from "@/lib/auth-security";
import { MESSAGES } from "@/lib/constants";

/**
 * GET /api/books/stats
 * Get book statistics (Admin only)
 */
export async function GET(req: NextRequest) {
  try {
    await requireApiAdmin();

    const stats = await bookService.getStats();

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Get book stats error:", error);

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
