import { NextRequest } from "next/server";
import {
  handleApiRequest,
  requireAdmin,
  ApiError,
} from "@/lib/api-utils";
import { categoryService } from "@/lib/services/category.service";
import { updateCategorySchema } from "@/lib/validations/category.validation";
import { MESSAGES } from "@/lib/constants";

// GET /api/categories/[id] - Get single category
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleApiRequest(req, async () => {
    const { id } = await params;
    const category = await categoryService.findById(id);

    if (!category) {
      throw new ApiError(404, MESSAGES.ERROR.CATEGORY_NOT_FOUND || "Category not found");
    }

    return category;
  });
}

// PATCH /api/categories/[id] - Update category (Admin only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleApiRequest(req, async () => {
    await requireAdmin();

    const { id } = await params;
    const body = await req.json();
    const validated = updateCategorySchema.parse(body);

    try {
      const category = await categoryService.update(id, validated);
      return category;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("already exists")) {
          throw new ApiError(400, MESSAGES.ERROR.CATEGORY_NAME_EXISTS || "Category with this name already exists");
        }
        if (error.message.includes("not found")) {
          throw new ApiError(404, MESSAGES.ERROR.CATEGORY_NOT_FOUND || "Category not found");
        }
      }
      throw error;
    }
  });
}

// DELETE /api/categories/[id] - Delete category (Admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleApiRequest(req, async () => {
    await requireAdmin();

    const { id } = await params;

    try {
      await categoryService.delete(id);
      return { success: true };
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("not found")) {
          throw new ApiError(404, MESSAGES.ERROR.CATEGORY_NOT_FOUND || "Category not found");
        }
        if (error.message.includes("expense")) {
          throw new ApiError(400, error.message);
        }
      }
      throw error;
    }
  });
}

