import { NextRequest, NextResponse } from "next/server";
import { bookService } from "@/lib/services/book.service";
import { incrementBookCounterSchema } from "@/lib/validations/book.validation";
import { validateApiSession, ApiAuthError } from "@/lib/auth-security";
import { ZodError } from "zod";
import { MESSAGES } from "@/lib/constants";

/**
 * POST /api/books/[bookId]/counter
 * Increment download or view counter
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  try {
    const user = await validateApiSession();
    
    if (!user) {
      return NextResponse.json(
        { error: MESSAGES.ERROR.UNAUTHORIZED },
        { status: 401 }
      );
    }

    const { bookId } = await params;
    const body = await req.json();
    const { type } = incrementBookCounterSchema.parse(body);

    let book;
    if (type === "download") {
      book = await bookService.incrementDownload(bookId);
    } else {
      book = await bookService.incrementView(bookId);
    }

    return NextResponse.json({
      success: true,
      message: type === "download" ? "Téléchargement enregistré" : "Vue enregistrée",
      data: book,
    });
  } catch (error) {
    console.error("Increment counter error:", error);

    if (error instanceof ApiAuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: MESSAGES.ERROR.GENERIC },
      { status: 500 }
    );
  }
}
