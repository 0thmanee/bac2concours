"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
  headerClassName?: string;
  cellClassName?: string;
  sortable?: boolean;
}

export interface PaginationConfig {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (row: T) => string;
  onRowClick?: (row: T) => void;
  emptyState?: React.ReactNode;
  className?: string;
  rowClassName?: string | ((row: T) => string);
  isLoading?: boolean;
  loadingRows?: number;
  pagination?: PaginationConfig;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  onRowClick,
  emptyState,
  className,
  rowClassName,
  isLoading = false,
  loadingRows = 5,
  pagination,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <Card className={cn("overflow-hidden border-gray-200 dark:border-gray-800", className)}>
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-200 dark:border-gray-800 hover:bg-transparent bg-gray-50/50 dark:bg-gray-900/50">
              {columns.map((column, index) => (
                <TableHead
                  key={index}
                  className={cn(
                    "font-medium text-gray-600 dark:text-gray-400",
                    column.headerClassName
                  )}
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: loadingRows }).map((_, index) => (
              <TableRow key={index} className="border-b border-gray-200 dark:border-gray-800">
                {columns.map((_, colIndex) => (
                  <TableCell key={colIndex}>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    );
  }

  if (data.length === 0 && emptyState) {
    return (
      <Card className={cn("p-12 border-gray-200 dark:border-gray-800", className)}>
        {emptyState}
      </Card>
    );
  }

  return (
    <Card className={cn("overflow-hidden border-gray-200 dark:border-gray-800", className)}>
      <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-gray-200 dark:border-gray-800 hover:bg-transparent bg-gray-50/50 dark:bg-gray-900/50">
            {columns.map((column, index) => (
              <TableHead
                key={index}
                className={cn(
                  "font-medium text-gray-600 dark:text-gray-400",
                  column.headerClassName
                )}
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => {
            const computedRowClassName = typeof rowClassName === 'function' 
              ? rowClassName(row) 
              : rowClassName;

            return (
              <TableRow
                key={keyExtractor(row)}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  "border-b border-gray-200 dark:border-gray-800",
                  "transition-colors duration-150",
                  onRowClick && "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/50",
                  computedRowClassName
                )}
              >
                {columns.map((column, colIndex) => (
                  <TableCell
                    key={colIndex}
                    className={cn(
                      "text-gray-900 dark:text-gray-100",
                      column.cellClassName
                    )}
                  >
                    {column.cell
                      ? column.cell(row)
                      : column.accessorKey
                      ? String(row[column.accessorKey])
                      : null}
                  </TableCell>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      </div>
      
      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <TablePagination {...pagination} />
      )}
    </Card>
  );
}

/**
 * Reusable table pagination component
 */
function TablePagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: PaginationConfig) {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push("ellipsis");
      }

      // Show pages around current
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("ellipsis");
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-800">
      {/* Items info */}
      <p className="text-sm text-ops-tertiary text-center sm:text-left">
        <span className="hidden sm:inline">Affichage de </span>
        <span className="font-medium text-ops-primary">{startItem}</span>
        <span className="hidden sm:inline"> à </span>
        <span className="sm:hidden">-</span>
        <span className="font-medium text-ops-primary">{endItem}</span>
        <span className="hidden sm:inline"> sur </span>
        <span className="sm:hidden"> / </span>
        <span className="font-medium text-ops-primary">{totalItems}</span>
        <span className="hidden sm:inline"> résultats</span>
      </p>

      {/* Pagination controls */}
      <div className="flex items-center justify-center sm:justify-end gap-1">
        {/* First page */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={!canGoPrevious}
          className="h-8 w-8 p-0"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        {/* Previous page */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!canGoPrevious}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Mobile page indicator */}
        <span className="sm:hidden text-sm text-ops-secondary px-2">
          {currentPage}/{totalPages}
        </span>

        {/* Page numbers - desktop only */}
        <div className="hidden sm:flex items-center gap-1 mx-2">
          {getPageNumbers().map((page, index) =>
            page === "ellipsis" ? (
              <span
                key={`ellipsis-${index}`}
                className="px-2 text-ops-tertiary"
              >
                ...
              </span>
            ) : (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "ghost"}
                size="sm"
                onClick={() => onPageChange(page)}
                className={cn(
                  "h-8 w-8 p-0",
                  currentPage === page && "ops-btn-primary"
                )}
              >
                {page}
              </Button>
            )
          )}
        </div>

        {/* Next page */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!canGoNext}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Last page */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={!canGoNext}
          className="h-8 w-8 p-0"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export { TablePagination };
export default DataTable;
