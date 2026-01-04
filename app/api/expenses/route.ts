import { NextRequest } from "next/server";
import {
  handleApiRequest,
  getAuthenticatedUser,
  ApiError,
} from "@/lib/api-utils";
import {
  createExpenseSchema,
  expenseQueryParamsSchema,
} from "@/lib/validations/expense.validation";
import { expenseService } from "@/lib/services/expense.service";
import { categoryService } from "@/lib/services/category.service";
import { startupService } from "@/lib/services/startup.service";
import { settingsService } from "@/lib/services/settings.service";
import { notificationService } from "@/lib/services/notification.service";
import { MESSAGES, EXPENSE_STATUS, USER_ROLE } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils/startup.utils";

// POST /api/expenses - Create expense (Student)
export async function POST(req: NextRequest) {
  return handleApiRequest(req, async () => {
    const user = await getAuthenticatedUser();

    const body = await req.json();
    const validated = createExpenseSchema.parse(body);

    // Verify student has access to this startup
    if (user.role === USER_ROLE.STUDENT) {
      const hasAccess = await startupService.isStudentOfStartup(
        validated.startupId,
        user.id
      );

      if (!hasAccess) {
        throw new ApiError(403, MESSAGES.ERROR.FORBIDDEN);
      }
    }

    // Verify category exists and is active
    const category = await categoryService.findById(validated.categoryId);

    if (!category) {
      throw new ApiError(400, MESSAGES.ERROR.CATEGORY_NOT_FOUND);
    }

    if (!category.isActive) {
      throw new ApiError(400, MESSAGES.ERROR.EXPENSE_INVALID_CATEGORY);
    }

    // Check auto-approve setting
    const settings = await settingsService.get();
    const status = settings.autoApproveExpenses
      ? EXPENSE_STATUS.APPROVED
      : EXPENSE_STATUS.PENDING;

    const expense = await expenseService.create({
      amount: validated.amount,
      description: validated.description,
      date: validated.date,
      receiptUrl: validated.receiptUrl,
      status,
      categoryId: validated.categoryId,
      startupId: validated.startupId,
      submittedById: user.id,
    });

    // Send notification to admins about new expense (if not auto-approved)
    if (status === EXPENSE_STATUS.PENDING) {
      const startup = await startupService.findById(validated.startupId);
      if (startup) {
        notificationService
          .onExpenseSubmitted({
            ...expense,
            submittedBy: { name: user.name || "Unknown" },
            startup: { name: startup.name },
            category: { name: category.name },
          })
          .catch(console.error); // Fire and forget
      }
    }

    return expense;
  });
}

// GET /api/expenses - List expenses
export async function GET(req: NextRequest) {
  return handleApiRequest(req, async () => {
    const user = await getAuthenticatedUser();
    const { searchParams } = new URL(req.url);

    const queryParams = expenseQueryParamsSchema.parse({
      startupId: searchParams.get("startupId") || undefined,
      status: searchParams.get("status") || undefined,
    });

    let expenses;

    // Students can only see their own expenses
    if (user.role === USER_ROLE.STUDENT) {
      // Verify access to startup if specified
      if (queryParams.startupId) {
        const hasAccess = await startupService.isStudentOfStartup(
          queryParams.startupId,
          user.id
        );

        if (!hasAccess) {
          throw new ApiError(403, MESSAGES.ERROR.FORBIDDEN);
        }
      }

      expenses = await expenseService.findAll({
        submittedById: user.id,
        startupId: queryParams.startupId,
        status: queryParams.status,
      });
    } else {
      // Admins can see all expenses, optionally filtered by startup
      expenses = await expenseService.findAll({
        startupId: queryParams.startupId,
        status: queryParams.status,
      });
    }

    return expenses;
  });
}
