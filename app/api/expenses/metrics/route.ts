import { NextRequest } from "next/server";
import { handleApiRequest, requireAdmin, getAuthenticatedUser, ApiError } from "@/lib/api-utils";
import { expenseService } from "@/lib/services/expense.service";
import { startupService } from "@/lib/services/startup.service";
import { USER_ROLE, MESSAGES } from "@/lib/constants";

// GET /api/expenses/metrics - Get expense metrics
// Admin: all expenses, Founder: expenses for their startup (if startupId provided)
export async function GET(req: NextRequest) {
  return handleApiRequest(req, async () => {
    const user = await getAuthenticatedUser();
    const { searchParams } = new URL(req.url);
    const startupId = searchParams.get("startupId") || undefined;

    if (user.role === USER_ROLE.FOUNDER) {
      // Founders can only get metrics for their own startup
      if (!startupId) {
        throw new ApiError(400, "startupId is required for founders");
      }
      
      // Verify access to startup
      const hasAccess = await startupService.isFounderOfStartup(startupId, user.id);
      if (!hasAccess) {
        throw new ApiError(403, MESSAGES.ERROR.FORBIDDEN);
      }
      
      const metrics = await expenseService.getMetricsByStartupId(startupId);
      return metrics;
    } else {
      // Admins can get all metrics or filtered by startupId
      await requireAdmin();
      if (startupId) {
        const metrics = await expenseService.getMetricsByStartupId(startupId);
        return metrics;
      }
      const metrics = await expenseService.getMetrics();
      return metrics;
    }
  });
}

