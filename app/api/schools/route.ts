import { NextRequest, NextResponse } from "next/server";
import { schoolService } from "@/lib/services/school.service";
import {
  createSchoolSchema,
  schoolFiltersSchema,
  type SchoolFilters,
} from "@/lib/validations/school.validation";
import {
  requireApiAdmin,
  validateApiSession,
  ApiAuthError,
} from "@/lib/auth-security";
import { ZodError } from "zod";
import { MESSAGES } from "@/lib/constants";
import { formatZodError } from "@/lib/utils/error.utils";

/**
 * GET /api/schools
 * Get all schools with optional filtering and pagination
 * Accessible by authenticated users (students see only public schools)
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
      type: searchParams.get("type") || undefined,
      city: searchParams.get("city") || undefined,
      region: searchParams.get("region") || undefined,
      status: searchParams.get("status") || undefined,
      isPublic: searchParams.get("isPublic")
        ? searchParams.get("isPublic") === "true"
        : undefined,
      featured: searchParams.get("featured")
        ? searchParams.get("featured") === "true"
        : undefined,
      bourses: searchParams.get("bourses")
        ? searchParams.get("bourses") === "true"
        : undefined,
      page: searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1,
      limit: searchParams.get("limit")
        ? parseInt(searchParams.get("limit")!)
        : 20,
      sortBy:
        (searchParams.get("sortBy") as SchoolFilters["sortBy"]) || "createdAt",
      sortOrder:
        (searchParams.get("sortOrder") as SchoolFilters["sortOrder"]) || "desc",
    };

    // If not admin, force isPublic=true and status=ACTIVE
    if (user.role !== "ADMIN") {
      filters.isPublic = true;
      filters.status = "ACTIVE";
    }

    // Validate filters
    const validated = schoolFiltersSchema.parse(filters);

    const result = await schoolService.findAll(validated);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Get schools error:", error);

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
 * POST /api/schools
 * Create a new school (Admin only)
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requireApiAdmin();

    const body = await req.json();
    const validated = createSchoolSchema.parse(body);

    const school = await schoolService.create(validated, user.id);

    return NextResponse.json(
      {
        success: true,
        message: "École créée avec succès",
        data: school,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create school error:", error);

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
