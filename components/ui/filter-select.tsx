"use client";

import React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[] | { value: string; label: string }[];
  placeholder?: string;
  className?: string;
  label?: string;
}

export const FilterSelect: React.FC<FilterSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = "Sélectionner...",
  className,
  label,
}) => {
  const normalizedOptions = options.map(opt => 
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger 
          className={cn(
            "!h-10 !py-0 !leading-10 px-4",
            "border-gray-300 dark:border-gray-700",
            "bg-white dark:bg-gray-900",
            "text-gray-900 dark:text-white",
            "hover:border-gray-400 dark:hover:border-gray-600",
            "focus:ring-brand-500/20",
            "focus:border-brand-500 dark:focus:border-brand-500",
            "data-[placeholder]:text-gray-400 dark:data-[placeholder]:text-gray-500",
            "transition-all duration-200",
            "[&>span]:line-clamp-1",
            className
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent 
          className={cn(
            "bg-white dark:bg-gray-900",
            "border-gray-200 dark:border-gray-800",
            "max-h-[300px]"
          )}
        >
          {normalizedOptions.map((option) => (
            <SelectItem 
              key={option.value} 
              value={option.value}
              className={cn(
                "text-gray-900 dark:text-white",
                "focus:bg-brand-50 dark:focus:bg-brand-950/20",
                "focus:text-brand-900 dark:focus:text-brand-100",
                "cursor-pointer",
                "h-9"
              )}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default FilterSelect;
