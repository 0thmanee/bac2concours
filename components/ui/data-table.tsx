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

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
  headerClassName?: string;
  cellClassName?: string;
  sortable?: boolean;
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
    </Card>
  );
}

export default DataTable;
