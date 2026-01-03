import { NextRequest } from "next/server";
import { handleApiRequest, ApiError } from "@/lib/api-utils";
import { requireApiAdmin } from "@/lib/auth-security";
import { createBudgetCategorySchema } from "@/lib/validations/budget.validation";
import { budgetService } from "@/lib/services/budget.service";
import { startupService } from "@/lib/services/startup.service";
import { MESSAGES } from "@/lib/constants";

// POST /api/startups/[id]/budgets - Create budget category
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleApiRequest(req, async () => {
    await requireApiAdmin();

    const { id } = await params;
    const body = await req.json();
    const validated = createBudgetCategorySchema.parse(body);

    // Check if startup exists
    const startup = await startupService.findById(id);

    if (!startup) {
      throw new ApiError(404, MESSAGES.ERROR.STARTUP_NOT_FOUND);
    }

    // Check if total budget categories would exceed startup total budget
    const currentCategoriesTotal = await budgetService.getTotalAllocated(id);
    const newTotal = currentCategoriesTotal + validated.maxBudget;

    if (newTotal > startup.totalBudget) {
      throw new ApiError(
        400,
        MESSAGES.ERROR.BUDGET_EXCEEDS_STARTUP(newTotal, startup.totalBudget)
      );
    }

    const category = await budgetService.create({
      name: validated.name,
      maxBudget: validated.maxBudget,
      startupId: id,
    });

    return category;
  });
}

// GET /api/startups/[id]/budgets - List budget categories
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleApiRequest(req, async () => {
    await requireAdmin();

    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const includeSpent = searchParams.get("includeSpent") === "true";

    if (includeSpent) {
      const categories = await budgetService.findByStartupIdWithSpentAmounts(
        id
      );
      return categories;
    }

    const categories = await budgetService.findByStartupId(id);
    return categories;
  });
}
