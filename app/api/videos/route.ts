import { NextRequest, NextResponse } from "next/server";
import { videoService } from "@/lib/services/video.service";
import {
  createVideoSchema,
  videoFiltersSchema,
  type VideoFilters,
} from "@/lib/validations/video.validation";
import {
  requireApiAdmin,
  validateApiSession,
  ApiAuthError,
} from "@/lib/auth-security";
import { ZodError } from "zod";
import { MESSAGES } from "@/lib/constants";

/**
 * GET /api/videos
 * Get all videos with optional filtering and pagination
 * Accessible by authenticated users (students see only public videos)
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
        (searchParams.get("sortBy") as VideoFilters["sortBy"]) || "createdAt",
      sortOrder:
        (searchParams.get("sortOrder") as VideoFilters["sortOrder"]) || "desc",
    };

    // If not admin, force isPublic=true and status=ACTIVE
    if (user.role !== "ADMIN") {
      filters.isPublic = true;
      filters.status = "ACTIVE";
    }

    // Validate filters
    const validated = videoFiltersSchema.parse(filters);

    const result = await videoService.findAll(validated);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Get videos error:", error);

    if (error instanceof ApiAuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Paramètres invalides", details: error.issues },
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
 * POST /api/videos
 * Create a new video (Admin only)
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requireApiAdmin();

    const body = await req.json();
    const validated = createVideoSchema.parse(body);

    const video = await videoService.create(validated, user.id);

    return NextResponse.json(
      {
        success: true,
        message: "Vidéo créée avec succès",
        data: video,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create video error:", error);

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
      { error: "Échec de la création de la vidéo" },
      { status: 500 }
    );
  }
}
