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
        <label className="block text-sm font-medium text-foreground mb-2">
          {label}
        </label>
      )}
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger 
          className={cn(
            "!h-10 !py-0 !leading-10 px-4",
            "border-border",
            "bg-card",
            "text-foreground",
            "hover:border-border-strong",
            "focus:ring-brand-500/20",
            "focus:border-brand-500",
            "data-[placeholder]:text-muted-foreground",
            "transition-all duration-200",
            "[&>span]:line-clamp-1",
            className
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent 
          className={cn(
            "bg-card",
            "border-border",
            "max-h-[300px]"
          )}
        >
          {normalizedOptions.map((option) => (
            <SelectItem 
              key={option.value} 
              value={option.value}
              className={cn(
                "text-foreground",
                "focus:bg-accent",
                "focus:text-accent-foreground",
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
