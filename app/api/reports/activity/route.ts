import { NextRequest } from "next/server";
import { handleApiRequest, requireAdmin } from "@/lib/api-utils";
import { reportService } from "@/lib/services/report.service";
import { activityReportQueryParamsSchema } from "@/lib/validations/report.validation";

// GET /api/reports/activity - Activity report (Admin)
export async function GET(req: NextRequest) {
  return handleApiRequest(req, async () => {
    await requireAdmin();

    const searchParams = req.nextUrl.searchParams;
    const queryParams = activityReportQueryParamsSchema.parse({
      startupId: searchParams.get("startupId") || undefined,
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
    });

    const startDate = queryParams.startDate
      ? new Date(queryParams.startDate)
      : undefined;
    const endDate = queryParams.endDate
      ? new Date(queryParams.endDate)
      : undefined;

    const report = await reportService.getActivityReport({
      startupId: queryParams.startupId,
      startDate,
      endDate,
    });

    return report;
  });
}
