/**
 * Startup-related utility functions
 * Reusable calculations and formatting for startup data
 */

import {
  NUMERIC_CONSTANTS,
  STARTUP_STATUS,
  EXPENSE_STATUS,
} from "@/lib/constants";

// ============================================================
// BUDGET CALCULATIONS
// ============================================================

/**
 * Calculate total spent budget from approved expenses for a startup
 * @param expenses Array of expenses (should be filtered by startupId and APPROVED status)
 */
export function calculateSpentBudget(expenses: Array<{ amount: number; status: string }>): number {
  return expenses
    .filter((exp) => exp.status === "APPROVED")
    .reduce((sum, exp) => sum + exp.amount, 0);
}

/**
 * Calculate budget utilization percentage
 */
export function calculateUtilizationPercent(
  spent: number,
  total: number
): number {
  if (total <= 0) return 0;
  return Math.min(
    (spent / total) * NUMERIC_CONSTANTS.PERCENTAGE_MAX,
    NUMERIC_CONSTANTS.PERCENTAGE_MAX
  );
}

/**
 * Calculate remaining budget
 */
export function calculateRemainingBudget(total: number, spent: number): number {
  return Math.max(0, total - spent);
}

/**
 * Calculate spent amount for a budget category by matching expenses by category name
 * @param budgetCategoryName Name of the budget category
 * @param expenses Array of expenses with category relation
 */
export function calculateCategorySpentFromExpenses(
  budgetCategoryName: string,
  expenses: Array<{
    amount: number;
    status: string;
    category: { name: string };
  }>
): number {
  return expenses
    .filter(
      (exp) =>
        exp.category.name === budgetCategoryName && exp.status === "APPROVED"
    )
    .reduce((sum, exp) => sum + exp.amount, 0);
}


/**
 * Format currency for display (with K suffix for thousands)
 */
export function formatCurrency(
  amount: number,
  options?: { useK?: boolean; decimals?: number }
): string {
  const { useK = false, decimals = 0 } = options || {};

  if (useK && amount >= NUMERIC_CONSTANTS.CURRENCY_DIVISOR) {
    return `$${(amount / NUMERIC_CONSTANTS.CURRENCY_DIVISOR).toFixed(
      decimals
    )}K`;
  }

  return `$${amount.toLocaleString("en-US", {
    maximumFractionDigits: decimals,
  })}`;
}

/**
 * Format percentage for display
 */
export function formatPercentage(
  value: number,
  decimals: number = NUMERIC_CONSTANTS.PERCENTAGE_DECIMALS
): string {
  return `${value.toFixed(decimals)}%`;
}

// ============================================================
// STATUS HELPERS
// ============================================================

/**
 * Get status badge variant class names
 */
export function getStatusBadgeClasses(status: string): string {
  const baseClasses = "h-6 text-xs border";

  switch (status.toUpperCase()) {
    case STARTUP_STATUS.ACTIVE:
    case EXPENSE_STATUS.APPROVED:
      return `${baseClasses} bg-[rgb(var(--metric-mint-light))] text-[rgb(var(--metric-mint-dark))] border-[rgb(var(--metric-mint-main))]`;
    case EXPENSE_STATUS.PENDING:
      return `${baseClasses} bg-[rgb(var(--metric-yellow-light))] text-[rgb(var(--metric-yellow-dark))] border-[rgb(var(--metric-yellow-main))]`;
    case EXPENSE_STATUS.REJECTED:
      return `${baseClasses} bg-[rgb(var(--metric-rose-light))] text-[rgb(var(--metric-rose-dark))] border-[rgb(var(--metric-rose-main))]`;
    case STARTUP_STATUS.INACTIVE:
    default:
      return `${baseClasses} bg-neutral-100 text-ops-tertiary border-ops`;
  }
}

/**
 * Format status for display (capitalize first letter)
 */
export function formatStatus(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}

// ============================================================
// DATA TRANSFORMATIONS
// ============================================================

/**
 * Get students display string
 */
export function getStudentsDisplay(
  students: Array<{ name: string }>,
  maxLength: number = 3
): string {
  if (students.length === 0) return "No students assigned";

  const names = students.slice(0, maxLength).map((f) => f.name);
  if (students.length > maxLength) {
    return `${names.join(", ")} +${students.length - maxLength} more`;
  }

  return names.join(", ");
}

/**
 * Format date for display
 */
export function formatDate(
  date: Date | string,
  locale: string = "en-US"
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleDateString(locale);
}

/**
 * Format date for input (ISO date string)
 */
export function formatDateForInput(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toISOString().split("T")[0];
}

/**
 * Format time ago (relative time)
 */
export function formatTimeAgo(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return dateObj.toLocaleDateString();
}

/**
 * Get current month start date
 */
export function getCurrentMonthStart(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}
