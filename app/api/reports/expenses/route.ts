import { NextRequest } from "next/server";
import { handleApiRequest, requireAdmin } from "@/lib/api-utils";
import { reportService } from "@/lib/services/report.service";
import { expenseReportQueryParamsSchema } from "@/lib/validations/expense.validation";

// GET /api/reports/expenses - Expense breakdown report (Admin)
export async function GET(req: NextRequest) {
  return handleApiRequest(req, async () => {
    await requireAdmin();

    const searchParams = req.nextUrl.searchParams;
    const queryParams = expenseReportQueryParamsSchema.parse({
      startupId: searchParams.get("startupId") || undefined,
      status: searchParams.get("status") || undefined,
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
    });

    const startDate = queryParams.startDate ? new Date(queryParams.startDate) : undefined;
    const endDate = queryParams.endDate ? new Date(queryParams.endDate) : undefined;

    const report = await reportService.getExpenseReport({
      startupId: queryParams.startupId,
      status: queryParams.status,
      startDate,
      endDate,
    });

    return report;
  });
}
