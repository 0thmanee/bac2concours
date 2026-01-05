import { NextRequest, NextResponse } from "next/server";
import { bookService } from "@/lib/services/book.service";
import { updateBookSchema } from "@/lib/validations/book.validation";
import {
  requireApiAdmin,
  validateApiSession,
  ApiAuthError,
} from "@/lib/auth-security";
import { ZodError } from "zod";
import { MESSAGES } from "@/lib/constants";
import { formatZodError } from "@/lib/utils/error.utils";

/**
 * GET /api/books/[bookId]
 * Get a single book by ID
 */
export async function GET(
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
    const book = await bookService.findById(bookId);

    if (!book) {
      return NextResponse.json({ error: "Livre introuvable" }, { status: 404 });
    }

    // If not admin, only show public active books
    if (user.role !== "ADMIN" && (!book.isPublic || book.status !== "ACTIVE")) {
      return NextResponse.json({ error: "Livre introuvable" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: book,
    });
  } catch (error) {
    console.error("Get book error:", error);

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
 * PATCH /api/books/[bookId]
 * Update a book (Admin only)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  try {
    await requireApiAdmin();

    const { bookId } = await params;
    const body = await req.json();
    const validated = updateBookSchema.parse(body);

    const book = await bookService.update(bookId, validated);

    return NextResponse.json({
      success: true,
      message: "Livre mis à jour avec succès",
      data: book,
    });
  } catch (error) {
    console.error("Update book error:", error);

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

    if (
      error instanceof Error &&
      error.message.includes("Record to update not found")
    ) {
      return NextResponse.json({ error: "Livre introuvable" }, { status: 404 });
    }

    return NextResponse.json(
      { error: MESSAGES.ERROR.GENERIC },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/books/[bookId]
 * Delete a book (Admin only)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  try {
    await requireApiAdmin();

    const { bookId } = await params;
    await bookService.delete(bookId);

    return NextResponse.json({
      success: true,
      message: "Livre supprimé avec succès",
    });
  } catch (error) {
    console.error("Delete book error:", error);

    if (error instanceof ApiAuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    if (
      error instanceof Error &&
      error.message.includes("Record to delete does not exist")
    ) {
      return NextResponse.json({ error: "Livre introuvable" }, { status: 404 });
    }

    return NextResponse.json(
      { error: MESSAGES.ERROR.GENERIC },
      { status: 500 }
    );
  }
}
