import { NextRequest, NextResponse } from "next/server";
import { announcementService } from "@/lib/services/announcement.service";
import {
  createAnnouncementSchema,
  announcementFiltersSchema,
  type AnnouncementFilters,
} from "@/lib/validations/announcement.validation";
import {
  requireApiAdmin,
  validateApiSession,
  ApiAuthError,
} from "@/lib/auth-security";
import { ZodError } from "zod";
import { MESSAGES } from "@/lib/constants";
import { formatZodError } from "@/lib/utils/error.utils";

/**
 * GET /api/announcements
 * Admin: all announcements. Others: published only.
 */
export async function GET(req: NextRequest) {
  try {
    const user = await validateApiSession();

    if (!user) {
      return NextResponse.json(
        { error: MESSAGES.ERROR.UNAUTHORIZED },
        { status: 401 },
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const filters: Record<string, unknown> = {
      search: searchParams.get("search") || undefined,
      type: searchParams.get("type") || undefined,
      status: searchParams.get("status") || undefined,
      schoolId: searchParams.get("schoolId") || undefined,
      page: searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1,
      limit: searchParams.get("limit")
        ? parseInt(searchParams.get("limit")!)
        : 20,
      sortBy:
        (searchParams.get("sortBy") as AnnouncementFilters["sortBy"]) ||
        "createdAt",
      sortOrder:
        (searchParams.get("sortOrder") as AnnouncementFilters["sortOrder"]) ||
        "desc",
    };

    if (user.role !== "ADMIN") {
      filters.status = "PUBLISHED";
    }

    const validated = announcementFiltersSchema.parse(filters);
    const result = await announcementService.findAll(validated);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Get announcements error:", error);

    if (error instanceof ApiAuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: formatZodError(error) },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: MESSAGES.ERROR.GENERIC },
      { status: 500 },
    );
  }
}

/**
 * POST /api/announcements
 * Create an announcement (Admin only)
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requireApiAdmin();

    const body = await req.json();
    const validated = createAnnouncementSchema.parse(body);

    const announcement = await announcementService.create(validated, user.id);

    return NextResponse.json(
      {
        success: true,
        message: "Annonce créée avec succès",
        data: announcement,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create announcement error:", error);

    if (error instanceof ApiAuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: formatZodError(error) },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: MESSAGES.ERROR.GENERIC },
      { status: 500 },
    );
  }
}
