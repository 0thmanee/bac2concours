"use client";

import React from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  className?: string;
  containerClassName?: string;
  showClearButton?: boolean;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      value,
      onChange,
      onClear,
      className,
      containerClassName,
      placeholder = "Rechercher...",
      showClearButton = true,
      ...props
    },
    ref
  ) => {
    const handleClear = () => {
      onChange("");
      onClear?.();
    };

    return (
      <div className={cn("relative group", containerClassName)}>
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 dark:text-neutral-500 transition-colors pointer-events-none group-hover:text-neutral-500 dark:group-hover:text-neutral-400" size={20} />
        <Input
          ref={ref}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "pl-10 pr-10 h-10! py-0! leading-10!",
            "border-neutral-300 dark:border-neutral-700",
            "bg-white dark:bg-neutral-900",
            "text-neutral-900 dark:text-white",
            "placeholder:text-neutral-400 dark:placeholder:text-neutral-500",
            "hover:border-neutral-400 dark:hover:border-neutral-600",
            "focus-visible:ring-brand-500/20",
            "focus-visible:border-brand-500 dark:focus-visible:border-brand-500",
            "transition-all duration-200",
            className
          )}
          {...props}
        />
        {showClearButton && value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors p-1 rounded-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>
    );
  }
);

SearchInput.displayName = "SearchInput";
