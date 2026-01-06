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
        <label className="block text-sm font-medium text-[rgb(var(--neutral-700))] dark:text-[rgb(var(--neutral-300))] mb-2">
          {label}
        </label>
      )}
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger 
          className={cn(
            "!h-10 !py-0 !leading-10 px-4",
            "border-[rgb(var(--neutral-300))] dark:border-[rgb(var(--neutral-700))]",
            "bg-white dark:bg-[rgb(var(--neutral-900))]",
            "text-[rgb(var(--neutral-900))] dark:text-white",
            "hover:border-[rgb(var(--neutral-400))] dark:hover:border-[rgb(var(--neutral-600))]",
            "focus:ring-brand-500/20",
            "focus:border-brand-500 dark:focus:border-brand-500",
            "data-[placeholder]:text-[rgb(var(--neutral-400))] dark:data-[placeholder]:text-[rgb(var(--neutral-500))]",
            "transition-all duration-200",
            "[&>span]:line-clamp-1",
            className
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent 
          className={cn(
            "bg-white dark:bg-[rgb(var(--neutral-900))]",
            "border-[rgb(var(--neutral-200))] dark:border-[rgb(var(--neutral-800))]",
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
