import { NextRequest } from "next/server";
import {
  handleApiRequest,
  getAuthenticatedUser,
  ApiError,
} from "@/lib/api-utils";
import { updateExpenseSchema } from "@/lib/validations/expense.validation";
import { expenseService } from "@/lib/services/expense.service";
import { categoryService } from "@/lib/services/category.service";
import { MESSAGES, EXPENSE_STATUS, USER_ROLE } from "@/lib/constants";

// GET /api/expenses/[id] - Get single expense
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleApiRequest(req, async () => {
    const user = await getAuthenticatedUser();
    const { id } = await params;

    const expense = await expenseService.findById(id);

    if (!expense) {
      throw new ApiError(404, MESSAGES.ERROR.EXPENSE_NOT_FOUND);
    }

    // Students can only view their own expenses
    if (user.role === USER_ROLE.STUDENT && expense.submittedById !== user.id) {
      throw new ApiError(403, MESSAGES.ERROR.FORBIDDEN);
    }

    return expense;
  });
}

// PATCH /api/expenses/[id] - Update expense (Students can only edit their own PENDING expenses)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleApiRequest(req, async () => {
    const user = await getAuthenticatedUser();
    const { id } = await params;

    const body = await req.json();
    const validated = updateExpenseSchema.parse(body);

    const expense = await expenseService.findById(id);

    if (!expense) {
      throw new ApiError(404, MESSAGES.ERROR.EXPENSE_NOT_FOUND);
    }

    // Only the student who submitted can edit
    if (user.role === USER_ROLE.STUDENT && expense.submittedById !== user.id) {
      throw new ApiError(403, MESSAGES.ERROR.FORBIDDEN);
    }

    // Only pending expenses can be edited
    if (expense.status !== EXPENSE_STATUS.PENDING) {
      throw new ApiError(
        400,
        MESSAGES.ERROR.EXPENSE_CANNOT_EDIT(expense.status)
      );
    }

    // If category is being changed, verify it exists and is active
    if (validated.categoryId && validated.categoryId !== expense.categoryId) {
      const newCategory = await categoryService.findById(validated.categoryId);

      if (!newCategory) {
        throw new ApiError(400, MESSAGES.ERROR.CATEGORY_NOT_FOUND);
      }

      if (!newCategory.isActive) {
        throw new ApiError(400, MESSAGES.ERROR.EXPENSE_INVALID_CATEGORY);
      }
    }

    const updated = await expenseService.update(id, {
      amount: validated.amount,
      description: validated.description,
      date: validated.date,
      categoryId: validated.categoryId,
      receiptUrl: validated.receiptUrl,
    });

    return updated;
  });
}
