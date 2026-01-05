import { NextRequest, NextResponse } from "next/server";
import { bookService } from "@/lib/services/book.service";
import {
  createBookSchema,
  bookFiltersSchema,
  type BookFilters,
} from "@/lib/validations/book.validation";
import {
  requireApiAdmin,
  validateApiSession,
  ApiAuthError,
} from "@/lib/auth-security";
import { ZodError } from "zod";
import { MESSAGES } from "@/lib/constants";
import { formatZodError } from "@/lib/utils/error.utils";

/**
 * GET /api/books
 * Get all books with optional filtering and pagination
 * Accessible by authenticated users (students see only public books)
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

    // Parse query parameters
    const searchParams = req.nextUrl.searchParams;
    const filters = {
      search: searchParams.get("search") || undefined,
      category: searchParams.get("category") || undefined,
      school: searchParams.get("school") || undefined,
      level: searchParams.get("level") || undefined,
      subject: searchParams.get("subject") || undefined,
      status: searchParams.get("status") || undefined,
      isPublic: searchParams.get("isPublic")
        ? searchParams.get("isPublic") === "true"
        : undefined,
      tags: searchParams.get("tags")
        ? searchParams.get("tags")!.split(",")
        : undefined,
      page: searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1,
      limit: searchParams.get("limit")
        ? parseInt(searchParams.get("limit")!)
        : 20,
      sortBy:
        (searchParams.get("sortBy") as BookFilters["sortBy"]) || "createdAt",
      sortOrder:
        (searchParams.get("sortOrder") as BookFilters["sortOrder"]) || "desc",
    };

    // If not admin, force isPublic=true and status=ACTIVE
    if (user.role !== "ADMIN") {
      filters.isPublic = true;
      filters.status = "ACTIVE";
    }

    // Validate filters
    const validated = bookFiltersSchema.parse(filters);

    const result = await bookService.findAll(validated);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Get books error:", error);

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

    return NextResponse.json(
      { error: MESSAGES.ERROR.GENERIC },
      { status: 500 }
    );
  }
}

/**
 * POST /api/books
 * Create a new book (Admin only)
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requireApiAdmin();

    const body = await req.json();
    const validated = createBookSchema.parse(body);

    const book = await bookService.create(validated, user.id);

    return NextResponse.json(
      {
        success: true,
        message: "Livre créé avec succès",
        data: book,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create book error:", error);

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

    return NextResponse.json(
      { error: MESSAGES.ERROR.GENERIC },
      { status: 500 }
    );
  }
}
