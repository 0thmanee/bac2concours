import { NextRequest } from "next/server";
import { handleApiRequest, ApiError } from "@/lib/api-utils";
import { requireApiAdmin } from "@/lib/auth-security";
import { budgetService } from "@/lib/services/budget.service";
import { startupService } from "@/lib/services/startup.service";
import { MESSAGES } from "@/lib/constants";

// GET /api/startups/[id]/budgets/metrics - Get budget metrics for a startup
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleApiRequest(req, async () => {
    await requireApiAdmin();

    const { id } = await params;

    // Check if startup exists
    const startup = await startupService.findById(id);
    if (!startup) {
      throw new ApiError(404, MESSAGES.ERROR.STARTUP_NOT_FOUND);
    }

    const metrics = await budgetService.getTotalsByStartupId(id);
    return metrics;
  });
}
