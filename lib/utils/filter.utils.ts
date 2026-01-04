/**
 * Filter Utilities
 * Reusable utilities for managing filters, pagination, and URL params
 */

import { useCallback, useState } from "react";

// ============================================================
// TYPES
// ============================================================

export interface PaginationState {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FilterState<T extends Record<string, unknown>> {
  filters: T;
  pagination: PaginationState;
}

// ============================================================
// PAGINATION UTILITIES
// ============================================================

/**
 * Default pagination values
 */
export const DEFAULT_PAGINATION: PaginationState = {
  page: 1,
  limit: 10,
};

/**
 * Calculate pagination metadata from total count
 */
export function calculatePagination(
  total: number,
  page: number,
  limit: number
): { totalPages: number; hasNext: boolean; hasPrev: boolean } {
  const totalPages = Math.ceil(total / limit);
  return {
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

/**
 * Get skip value for database queries
 */
export function getSkip(page: number, limit: number): number {
  return (page - 1) * limit;
}

// ============================================================
// FILTER UTILITIES
// ============================================================

/**
 * Convert filter value to API param (handles "all" -> undefined)
 */
export function toApiParam<T>(value: T | "" | "all"): T | undefined {
  if (value === "" || value === "all") return undefined;
  return value;
}

/**
 * Convert API param to filter value (handles undefined -> "")
 */
export function toFilterValue<T>(
  value: T | undefined | null,
  defaultValue: T | "" = ""
): T | "" {
  if (value === undefined || value === null) return defaultValue;
  return value;
}

/**
 * Build URL search params from filter object
 */
export function buildSearchParams(
  filters: Record<string, unknown>,
  pagination?: PaginationState
): URLSearchParams {
  const params = new URLSearchParams();

  // Add filters
  Object.entries(filters).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== "" &&
      value !== "all"
    ) {
      if (Array.isArray(value)) {
        if (value.length > 0) {
          params.append(key, value.join(","));
        }
      } else {
        params.append(key, String(value));
      }
    }
  });

  // Add pagination
  if (pagination) {
    params.append("page", String(pagination.page));
    params.append("limit", String(pagination.limit));
  }

  return params;
}

/**
 * Parse URL search params to filter object
 */
export function parseSearchParams<T extends Record<string, unknown>>(
  searchParams: URLSearchParams,
  defaults: T
): T & PaginationState {
  const result = { ...defaults } as T & PaginationState;

  Object.keys(defaults).forEach((key) => {
    const value = searchParams.get(key);
    if (value !== null) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (result as any)[key] = value;
    }
  });

  // Parse pagination
  result.page = parseInt(searchParams.get("page") || "1", 10);
  result.limit = parseInt(searchParams.get("limit") || "10", 10);

  return result;
}

// ============================================================
// REACT HOOKS
// ============================================================

/**
 * Custom hook for managing filter state with pagination reset
 */
export function useFilterState<T extends Record<string, string>>(
  initialFilters: T,
  initialPagination: PaginationState = DEFAULT_PAGINATION
) {
  const [filters, setFilters] = useState<T>(initialFilters);
  const [pagination, setPagination] =
    useState<PaginationState>(initialPagination);

  const updateFilter = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    // Reset to page 1 when filters change
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const setPage = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  const setLimit = useCallback((limit: number) => {
    setPagination((prev) => ({ ...prev, page: 1, limit }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
    setPagination(initialPagination);
  }, [initialFilters, initialPagination]);

  // Convert filters to API params (excluding empty values)
  const apiParams = Object.entries(filters).reduce((acc, [key, value]) => {
    const param = toApiParam(value);
    if (param !== undefined) {
      acc[key] = param;
    }
    return acc;
  }, {} as Record<string, string>);

  return {
    filters,
    pagination,
    updateFilter,
    setPage,
    setLimit,
    resetFilters,
    apiParams: {
      ...apiParams,
      page: pagination.page,
      limit: pagination.limit,
    },
  };
}

// ============================================================
// FORMAT UTILITIES
// ============================================================

/**
 * Format number with locale
 */
export function formatNumber(value: number, locale = "fr-FR"): string {
  return value.toLocaleString(locale);
}

/**
 * Format duration in seconds to mm:ss
 */
export function formatDuration(seconds: number | null | undefined): string {
  if (!seconds) return "-";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}
