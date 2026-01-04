"use client";

import { SearchInput } from "@/components/ui/search-input";
import { FilterSelect } from "@/components/ui/filter-select";
import { FilterPanel } from "@/components/ui/filter-panel";

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  placeholder?: string;
  className?: string;
}

interface AdminFilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters: FilterConfig[];
  resultsCount?: number;
  resultsLabel?: string;
}

export function AdminFilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Rechercher...",
  filters,
  resultsCount,
  resultsLabel = "résultat",
}: AdminFilterBarProps) {
  return (
    <FilterPanel className="space-y-3">
      <div className="flex flex-col lg:flex-row gap-3">
        <SearchInput
          value={searchValue}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
          containerClassName="flex-1 min-w-[250px]"
        />

        {filters.map((filter, index) => (
          <FilterSelect
            key={index}
            value={filter.value}
            onChange={(value) =>
              filter.onChange(value === "all" ? "" : value)
            }
            options={filter.options}
            className={filter.className || "w-full lg:w-[180px]"}
          />
        ))}
      </div>

      {resultsCount !== undefined && (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {resultsCount} {resultsLabel}
          {resultsCount !== 1 ? "s" : ""} trouvé
          {resultsCount !== 1 ? "s" : ""}
        </div>
      )}
    </FilterPanel>
  );
}
