import { NextRequest } from "next/server";
import { handleApiRequest, requireAdmin, ApiError } from "@/lib/api-utils";
import { updateBudgetCategorySchema } from "@/lib/validations/budget.validation";
import { budgetService } from "@/lib/services/budget.service";
import { startupService } from "@/lib/services/startup.service";
import { MESSAGES } from "@/lib/constants";

// GET /api/budgets/[id] - Get single budget category
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleApiRequest(req, async () => {
    await requireAdmin();
    const { id } = await params;

    const category = await budgetService.findById(id);

    if (!category) {
      throw new ApiError(404, MESSAGES.ERROR.BUDGET_NOT_FOUND);
    }

    return category;
  });
}

// PATCH /api/budgets/[id] - Update budget category
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleApiRequest(req, async () => {
    await requireAdmin();
    const { id } = await params;

    const body = await req.json();
    const validated = updateBudgetCategorySchema.parse(body);

    const category = await budgetService.findById(id);

    if (!category) {
      throw new ApiError(404, MESSAGES.ERROR.BUDGET_NOT_FOUND);
    }

    // If updating maxBudget, check against startup total
    if (validated.maxBudget !== undefined) {
      const startup = await startupService.findById(category.startupId);
      if (!startup) {
        throw new ApiError(404, MESSAGES.ERROR.STARTUP_NOT_FOUND);
      }

      const currentTotal = await budgetService.getTotalAllocated(
        category.startupId
      );
      const otherCategoriesTotal = currentTotal - category.maxBudget;
      const newTotal = otherCategoriesTotal + validated.maxBudget;

      if (newTotal > startup.totalBudget) {
        throw new ApiError(
          400,
          MESSAGES.ERROR.BUDGET_EXCEEDS_STARTUP(newTotal, startup.totalBudget)
        );
      }
    }

    const updated = await budgetService.update(id, {
      name: validated.name,
      maxBudget: validated.maxBudget,
    });

    return updated;
  });
}

// DELETE /api/budgets/[id] - Delete budget category
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleApiRequest(req, async () => {
    await requireAdmin();
    const { id } = await params;

    const category = await budgetService.findById(id);

    if (!category) {
      throw new ApiError(404, MESSAGES.ERROR.BUDGET_NOT_FOUND);
    }

    const hasExpenses = await budgetService.hasExpenses(id);

    if (hasExpenses) {
      throw new ApiError(400, MESSAGES.ERROR.BUDGET_HAS_EXPENSES);
    }

    await budgetService.delete(id);

    return { message: MESSAGES.SUCCESS.BUDGET_DELETED };
  });
}
