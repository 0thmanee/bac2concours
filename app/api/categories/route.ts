import { NextRequest } from "next/server";
import { handleApiRequest, requireAdmin, ApiError } from "@/lib/api-utils";
import { categoryService } from "@/lib/services/category.service";
import {
  createCategorySchema,
  categoryQueryParamsSchema,
} from "@/lib/validations/category.validation";
import { MESSAGES } from "@/lib/constants";

// GET /api/categories - List categories (Admin only for management, but active categories can be fetched by founders)
export async function GET(req: NextRequest) {
  return handleApiRequest(req, async () => {
    const { searchParams } = new URL(req.url);
    const queryParams = categoryQueryParamsSchema.parse({
      isActive: searchParams.get("isActive") === "true" ? true : searchParams.get("isActive") === "false" ? false : undefined,
      search: searchParams.get("search") || undefined,
    });

    const categories = await categoryService.findAll(queryParams);

    return categories;
  });
}

// POST /api/categories - Create category (Admin only)
export async function POST(req: NextRequest) {
  return handleApiRequest(req, async () => {
    await requireAdmin();

    const body = await req.json();
    const validated = createCategorySchema.parse(body);

    try {
      const category = await categoryService.create(validated);
      return category;
    } catch (error) {
      if (error instanceof Error && error.message.includes("already exists")) {
        throw new ApiError(400, MESSAGES.ERROR.CATEGORY_NAME_EXISTS || "Category with this name already exists");
      }
      throw error;
    }
  });
}

