import { NextRequest } from "next/server";
import { handleApiRequest, requireAdmin } from "@/lib/api-utils";
import { userService } from "@/lib/services/user.service";

// GET /api/users/metrics - Get user metrics (Admin only)
export async function GET(req: NextRequest) {
  return handleApiRequest(req, async () => {
    await requireAdmin();
    const metrics = await userService.getMetrics();
    return metrics;
  });
}

