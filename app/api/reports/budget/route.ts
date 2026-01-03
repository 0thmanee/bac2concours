import { NextRequest } from "next/server";
import { handleApiRequest, requireAdmin } from "@/lib/api-utils";
import { reportService } from "@/lib/services/report.service";
import { budgetReportQueryParamsSchema } from "@/lib/validations/report.validation";

// GET /api/reports/budget - Budget usage report (Admin)
export async function GET(req: NextRequest) {
  return handleApiRequest(req, async () => {
    await requireAdmin();

    const searchParams = req.nextUrl.searchParams;
    const queryParams = budgetReportQueryParamsSchema.parse({
      startupId: searchParams.get("startupId") || undefined,
    });

    const report = await reportService.getBudgetReport(queryParams.startupId);
    return report;
  });
}
