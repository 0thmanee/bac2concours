import { NextRequest } from "next/server";
import { handleApiRequest, requireAdmin } from "@/lib/api-utils";
import { categoryService } from "@/lib/services/category.service";

// GET /api/categories/metrics - Get category metrics (Admin only)
export async function GET(req: NextRequest) {
  return handleApiRequest(req, async () => {
    await requireAdmin();
    const metrics = await categoryService.getMetrics();
    return metrics;
  });
}

