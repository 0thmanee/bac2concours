import { NextRequest } from "next/server";
import { handleApiRequest } from "@/lib/api-utils";
import { requireApiAdmin } from "@/lib/auth-security";
import { startupService } from "@/lib/services/startup.service";

// GET /api/startups/metrics - Get startup metrics (Admin only)
export async function GET(req: NextRequest) {
  return handleApiRequest(req, async () => {
    await requireApiAdmin();
    const metrics = await startupService.getMetrics();
    return metrics;
  });
}
