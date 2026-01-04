import { NextRequest } from "next/server";
import { handleApiRequest, requireAdmin, ApiError } from "@/lib/api-utils";
import { approveExpenseSchema } from "@/lib/validations/expense.validation";
import { expenseService } from "@/lib/services/expense.service";
import { notificationService } from "@/lib/services/notification.service";
import { MESSAGES, EXPENSE_STATUS } from "@/lib/constants";

// PATCH /api/expenses/[id]/approve - Approve expense (Admin only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleApiRequest(req, async () => {
    await requireAdmin();
    const { id } = await params;

    const body = await req.json();
    const validated = approveExpenseSchema.parse(body);

    const expense = await expenseService.findById(id);

    if (!expense) {
      throw new ApiError(404, MESSAGES.ERROR.EXPENSE_NOT_FOUND);
    }

    if (expense.status !== EXPENSE_STATUS.PENDING) {
      throw new ApiError(
        400,
        MESSAGES.ERROR.EXPENSE_ALREADY_PROCESSED(expense.status)
      );
    }

    const updated = await expenseService.updateStatus(id, {
      status: EXPENSE_STATUS.APPROVED,
      adminComment: validated.adminComment,
    });

    // Notify the student that their expense was approved
    notificationService
      .onExpenseApproved(
        {
          ...updated,
          startup: { name: expense.startup.name },
          category: { name: expense.category.name },
        },
        validated.adminComment
      )
      .catch(console.error);

    return updated;
  });
}
