import {
  Expense,
  Startup,
  BudgetCategory,
  Category,
  User,
  ProgressUpdate,
  Book,
  File,
} from "@prisma/client";

// Expense with relations (as returned by expenseService.findAll)
export type ExpenseWithRelations = Expense & {
  category: Category;
  submittedBy: Pick<User, "id" | "name" | "email">;
  startup: Pick<Startup, "id" | "name">;
};

// Startup with relations (as returned by startupService.findAll)
export type StartupWithRelations = Startup & {
  students: Pick<User, "id" | "name" | "email">[];
  budgetCategories: (BudgetCategory & {
    expenses?: Expense[];
  })[];
  _count: {
    expenses: number;
    progressUpdates: number;
  };
};

// Expense with simple relations (as returned by startupService.findById)
export type ExpenseWithSimpleRelations = Expense & {
  category: Category;
  submittedBy: Pick<User, "id" | "name">;
};

// Startup with full relations (as returned by startupService.findById)
export type StartupWithFullRelations = Startup & {
  students: Pick<User, "id" | "name" | "email">[];
  budgetCategories: (BudgetCategory & {
    expenses: Expense[];
  })[];
  expenses: ExpenseWithSimpleRelations[];
  progressUpdates: (ProgressUpdate & {
    submittedBy: Pick<User, "id" | "name">;
  })[];
};

// BudgetCategory with relations (as returned by budgetService.findByStartupId)
export type BudgetCategoryWithRelations = BudgetCategory & {
  expenses: Expense[];
};

// Book with relations (as returned by bookService.findById)
export type BookWithRelations = Book & {
  uploadedBy?: Pick<User, "id" | "name" | "email">;
  coverFile?: File | null;
};

// ProgressUpdate with relations (as returned by progressService.findAll)
export type ProgressUpdateWithRelations = ProgressUpdate & {
  startup: Pick<Startup, "id" | "name">;
  submittedBy: Pick<User, "id" | "name" | "email">;
};

// User with minimal fields (as used in selects)
export type UserSelect = Pick<User, "id" | "name" | "email">;

// Re-export Prisma enums for convenience
export {
  ExpenseStatus,
  StartupStatus,
  UserRole,
  UpdateFrequency,
} from "@prisma/client";

// API Response types (matching api-utils.ts successResponse format)
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
