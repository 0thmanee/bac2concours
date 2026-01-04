# React Query Hooks Documentation

This document provides a comprehensive guide to all React Query hooks available in the application.

## Table of Contents

- [Overview](#overview)
- [Form Utilities](#form-utilities)
- [Authentication Hooks](#authentication-hooks)
- [Resource Hooks](#resource-hooks)
  - [Startups](#startups)
  - [Budgets](#budgets)
  - [Expenses](#expenses)
  - [Progress Updates](#progress-updates)
  - [Settings](#settings)
  - [Reports](#reports)
- [Best Practices](#best-practices)

## Overview

All hooks follow React Query best practices with:

- Hierarchical query keys for optimal cache invalidation
- Automatic cache updates on mutations
- Type-safe TypeScript interfaces
- Error handling with toast notifications

## Form Utilities

### `useSuperForm`

Enhanced form hook with built-in validation, error handling, and toast notifications.

**Features:**

- Automatic Zod schema validation
- Toast notifications for success/error
- Optional form reset on success
- Centralized error handling

**Usage:**

```tsx
import { useSuperForm } from "@/lib/hooks";
import {
  createStartupSchema,
  type CreateStartupInput,
} from "@/lib/validations";

function CreateStartupForm() {
  const createMutation = useCreateStartup();

  const form = useSuperForm<CreateStartupInput>({
    schema: createStartupSchema,
    onSubmit: async (data) => {
      await createMutation.mutateAsync(data);
    },
    successMessage: "Startup created successfully!",
    errorMessage: "Failed to create startup",
    resetOnSuccess: true,
  });

  const {
    register,
    formState: { errors },
    handleFormSubmit,
    isSubmitting,
  } = form;

  return (
    <form onSubmit={handleFormSubmit}>
      <input {...register("name")} disabled={isSubmitting} />
      {errors.name && <span>{errors.name.message}</span>}
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creating..." : "Create"}
      </button>
    </form>
  );
}
```

### `FormField`

Consistent form field wrapper component.

```tsx
import { FormField } from "@/lib/hooks";

<FormField
  label="Email"
  error={errors.email?.message}
  required
  description="Your work email address"
>
  <Input {...register("email")} />
</FormField>;
```

## Authentication Hooks

### `useLogin`

Handles user login with automatic cache invalidation and navigation.

```tsx
import { useLogin } from "@/lib/hooks";

const login = useLogin();

login.mutate({ email, password });
```

### `useRegister`

Handles user registration.

```tsx
import { useRegister } from "@/lib/hooks";

const register = useRegister();

register.mutate({ email, password, name, role });
```

### `useLogout`

Handles logout with complete cache clearing.

```tsx
import { useLogout } from "@/lib/hooks";

const logout = useLogout();

logout.mutate();
```

## Resource Hooks

### Startups

**Query Keys:**

```tsx
startupKeys.all; // ['startups']
startupKeys.lists(); // ['startups', 'list']
startupKeys.detail(id); // ['startups', 'detail', id]
```

#### `useStartups()`

Fetch all startups.

```tsx
import { useStartups } from "@/lib/hooks";

const { data: startups, isLoading, error } = useStartups();
```

#### `useStartup(id)`

Fetch single startup by ID.

```tsx
import { useStartup } from "@/lib/hooks";

const { data: startup } = useStartup("startup-id");
```

#### `useCreateStartup()`

Create a new startup.

```tsx
import { useCreateStartup } from "@/lib/hooks";

const createStartup = useCreateStartup();

createStartup.mutate({
  name: "Acme Corp",
  industry: "Technology",
  studentId: "user-id",
  description: "Innovative solutions",
  website: "https://acme.com",
});
```

#### `useUpdateStartup(id)`

Update existing startup.

```tsx
import { useUpdateStartup } from "@/lib/hooks";

const updateStartup = useUpdateStartup("startup-id");

updateStartup.mutate({ name: "New Name" });
```

#### `useDeleteStartup()`

Soft delete a startup.

```tsx
import { useDeleteStartup } from "@/lib/hooks";

const deleteStartup = useDeleteStartup();

deleteStartup.mutate("startup-id");
```

### Budgets

**Query Keys:**

```tsx
budgetKeys.all; // ['budgets']
budgetKeys.list(startupId); // ['budgets', 'list', { startupId }]
budgetKeys.detail(id); // ['budgets', 'detail', id]
```

#### `useBudgets(startupId)`

Fetch all budget categories for a startup.

```tsx
import { useBudgets } from "@/lib/hooks";

const { data: budgets } = useBudgets("startup-id");
```

#### `useBudget(id)`

Fetch single budget category.

```tsx
import { useBudget } from "@/lib/hooks";

const { data: budget } = useBudget("budget-id");
```

#### `useCreateBudget(startupId)`

Create a budget category.

```tsx
import { useCreateBudget } from "@/lib/hooks";

const createBudget = useCreateBudget("startup-id");

createBudget.mutate({
  name: "Marketing",
  allocatedAmount: 50000,
  description: "Marketing expenses",
});
```

#### `useUpdateBudget(id, startupId)`

Update budget category.

```tsx
import { useUpdateBudget } from "@/lib/hooks";

const updateBudget = useUpdateBudget("budget-id", "startup-id");

updateBudget.mutate({ allocatedAmount: 60000 });
```

#### `useDeleteBudget(startupId)`

Delete budget category.

```tsx
import { useDeleteBudget } from "@/lib/hooks";

const deleteBudget = useDeleteBudget("startup-id");

deleteBudget.mutate("budget-id");
```

### Expenses

**Query Keys:**

```tsx
expenseKeys.all; // ['expenses']
expenseKeys.list(filters); // ['expenses', 'list', filters]
expenseKeys.detail(id); // ['expenses', 'detail', id]
expenseKeys.pending(); // ['expenses', 'pending']
```

#### `useExpenses(params?)`

Fetch expenses with optional filtering.

```tsx
import { useExpenses } from "@/lib/hooks";

// All expenses
const { data: expenses } = useExpenses();

// Filtered expenses
const { data: pending } = useExpenses({
  status: "PENDING",
  startupId: "startup-id",
  startDate: "2024-01-01",
  endDate: "2024-12-31",
});
```

#### `useExpense(id)`

Fetch single expense.

```tsx
import { useExpense } from "@/lib/hooks";

const { data: expense } = useExpense("expense-id");
```

#### `useCreateExpense()`

Submit new expense.

```tsx
import { useCreateExpense } from "@/lib/hooks";

const createExpense = useCreateExpense();

createExpense.mutate({
  amount: 1500,
  description: "Office supplies",
  date: new Date(),
  categoryId: "budget-category-id",
  startupId: "startup-id",
  receiptUrl: "https://...",
});
```

#### `useUpdateExpense(id)`

Update expense details.

```tsx
import { useUpdateExpense } from "@/lib/hooks";

const updateExpense = useUpdateExpense("expense-id");

updateExpense.mutate({ amount: 1600 });
```

#### `useApproveExpense()`

Approve pending expense (Admin only).

```tsx
import { useApproveExpense } from "@/lib/hooks";

const approveExpense = useApproveExpense();

approveExpense.mutate("expense-id");
```

#### `useRejectExpense()`

Reject expense with reason (Admin only).

```tsx
import { useRejectExpense } from "@/lib/hooks";

const rejectExpense = useRejectExpense();

rejectExpense.mutate({
  id: "expense-id",
  adminComment: "Receipt required",
});
```

### Progress Updates

**Query Keys:**

```tsx
progressKeys.all; // ['progress']
progressKeys.list(filters); // ['progress', 'list', filters]
progressKeys.detail(id); // ['progress', 'detail', id]
progressKeys.byStartup(id); // ['progress', 'list', { startupId }]
```

#### `useProgressUpdates(params?)`

Fetch progress updates with optional filtering.

```tsx
import { useProgressUpdates } from "@/lib/hooks";

// All updates
const { data: updates } = useProgressUpdates();

// For specific startup
const { data: startupUpdates } = useProgressUpdates({
  startupId: "startup-id",
});

// Your updates
const { data: myUpdates } = useProgressUpdates({ me: "true" });
```

#### `useProgressUpdate(id)`

Fetch single progress update.

```tsx
import { useProgressUpdate } from "@/lib/hooks";

const { data: update } = useProgressUpdate("update-id");
```

#### `useCreateProgressUpdate()`

Submit progress update (Student only).

```tsx
import { useCreateProgressUpdate } from "@/lib/hooks";

const createUpdate = useCreateProgressUpdate();

createUpdate.mutate({
  whatWasDone: "Completed MVP development",
  whatIsBlocked: "Waiting for design feedback",
  whatIsNext: "Deploy to staging environment",
  startupId: "startup-id",
});
```

### Settings

**Query Keys:**

```tsx
settingsKeys.all; // ['settings']
settingsKeys.detail(); // ['settings', 'detail']
```

#### `useSettings()`

Fetch incubator settings (singleton).

```tsx
import { useSettings } from "@/lib/hooks";

const { data: settings } = useSettings();
```

#### `useUpdateSettings()`

Update incubator settings (Admin only).

```tsx
import { useUpdateSettings } from "@/lib/hooks";

const updateSettings = useUpdateSettings();

updateSettings.mutate({
  incubatorName: "Innovation Hub",
  updateFrequencyDays: 7,
  autoApproveExpenses: false,
});
```

### Reports

**Query Keys:**

```tsx
reportKeys.all; // ['reports']
reportKeys.budget(filters); // ['reports', 'budget', filters]
reportKeys.expenses(filters); // ['reports', 'expenses', filters]
reportKeys.activity(filters); // ['reports', 'activity', filters]
```

#### `useBudgetReport(params?)`

Fetch budget utilization report.

```tsx
import { useBudgetReport } from "@/lib/hooks";

const { data: report } = useBudgetReport({
  startupId: "startup-id",
});
```

#### `useExpenseReport(params?)`

Fetch expense breakdown report.

```tsx
import { useExpenseReport } from "@/lib/hooks";

const { data: report } = useExpenseReport({
  startupId: "startup-id",
  status: "APPROVED",
  startDate: "2024-01-01",
  endDate: "2024-12-31",
});
```

#### `useActivityReport(params?)`

Fetch activity overview report.

```tsx
import { useActivityReport } from "@/lib/hooks";

const { data: report } = useActivityReport({
  startDate: "2024-01-01",
  endDate: "2024-12-31",
});
```

## Best Practices

### 1. Use Enabled Flags for Dependent Queries

```tsx
const { data: startup } = useStartup(startupId);
const { data: budgets } = useBudgets(startupId, {
  enabled: !!startupId, // Only fetch when ID is available
});
```

### 2. Optimistic Updates

```tsx
const updateStartup = useUpdateStartup(id);

updateStartup.mutate(
  { name: "New Name" },
  {
    onMutate: async (newData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: startupKeys.detail(id) });

      // Snapshot previous value
      const previous = queryClient.getQueryData(startupKeys.detail(id));

      // Optimistically update
      queryClient.setQueryData(startupKeys.detail(id), (old) => ({
        ...old,
        ...newData,
      }));

      return { previous };
    },
    onError: (err, newData, context) => {
      // Rollback on error
      queryClient.setQueryData(startupKeys.detail(id), context.previous);
    },
  }
);
```

### 3. Handle Loading and Error States

```tsx
const { data, isLoading, error } = useStartups();

if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
if (!data) return null;

return <StartupList startups={data} />;
```

### 4. Use Mutation States

```tsx
const createStartup = useCreateStartup();

return (
  <button
    onClick={() => createStartup.mutate(data)}
    disabled={createStartup.isPending}
  >
    {createStartup.isPending ? "Creating..." : "Create Startup"}
  </button>
);
```

### 5. Invalidate Related Queries

The hooks automatically invalidate related queries, but you can manually invalidate:

```tsx
import { useQueryClient } from "@tanstack/react-query";
import { startupKeys, budgetKeys } from "@/lib/hooks";

const queryClient = useQueryClient();

// Invalidate all startups
queryClient.invalidateQueries({ queryKey: startupKeys.all });

// Invalidate specific startup
queryClient.invalidateQueries({ queryKey: startupKeys.detail(id) });

// Invalidate multiple keys
queryClient.invalidateQueries({ queryKey: startupKeys.all });
queryClient.invalidateQueries({ queryKey: budgetKeys.all });
```

### 6. Use Callbacks with useSuperForm

```tsx
const form = useSuperForm({
  schema: createStartupSchema,
  onSubmit: async (data) => {
    await createStartup.mutateAsync(data);
  },
  onSuccess: (data) => {
    console.log("Created:", data);
    router.push(`/startups/${data.id}`);
  },
  onError: (error) => {
    console.error("Failed:", error);
  },
  successMessage: "Startup created!",
  resetOnSuccess: true,
});
```

### 7. Prefetch Data

```tsx
import { useQueryClient } from "@tanstack/react-query";
import { startupKeys } from "@/lib/hooks";

const queryClient = useQueryClient();

// Prefetch on hover
const prefetchStartup = (id: string) => {
  queryClient.prefetchQuery({
    queryKey: startupKeys.detail(id),
    queryFn: () => apiClient.get(`/api/startups/${id}`),
  });
};

return (
  <Link href={`/startups/${id}`} onMouseEnter={() => prefetchStartup(id)}>
    View Startup
  </Link>
);
```

## Integration with Forms

All hooks integrate seamlessly with `useSuperForm`:

```tsx
import { useSuperForm, useCreateExpense } from "@/lib/hooks";
import {
  createExpenseSchema,
  type CreateExpenseInput,
} from "@/lib/validations";

function ExpenseForm({ startupId, categoryId }) {
  const createExpense = useCreateExpense();

  const form = useSuperForm<CreateExpenseInput>({
    schema: createExpenseSchema,
    defaultValues: {
      startupId,
      categoryId,
      date: new Date(),
    },
    onSubmit: async (data) => {
      await createExpense.mutateAsync(data);
    },
    successMessage: "Expense submitted for approval",
    resetOnSuccess: true,
  });

  // Form implementation...
}
```

## Error Handling

All hooks use the centralized `ApiError` class:

```tsx
import { ApiError } from "@/lib/api-client";

const { error } = useStartups();

if (error instanceof ApiError) {
  console.log("Status:", error.status);
  console.log("Message:", error.message);
  console.log("Data:", error.data);
}
```

## React Query DevTools

The DevTools are automatically included in development:

```tsx
// Already configured in QueryProvider
// Access via floating icon in bottom-right corner
// Shows all queries, mutations, and cache state
```
