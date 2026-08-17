"use client";

import { Check, ChevronDown } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface FilterDropdownOption<T extends string> {
  value: T;
  label: string;
  count: number;
  dotClass?: string;
}

export function FilterDropdown<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
}: {
  value: T;
  options: FilterDropdownOption<T>[];
  onChange: (value: T) => void;
  ariaLabel: string;
}) {
  const selected = options.find((option) => option.value === value) ?? options[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            aria-label={ariaLabel}
            className="inline-flex h-10 w-full items-center justify-between gap-2 rounded-xl border border-(--panel-border) bg-(--panel-inset) px-3.5 text-sm font-medium text-(--panel-text) transition hover:bg-(--panel-hover) sm:w-56"
          >
            <span className="inline-flex min-w-0 items-center gap-2">
              {selected.dotClass && (
                <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", selected.dotClass)} />
              )}
              <span className="truncate">{selected.label}</span>
              <span className="text-xs text-(--panel-text-subtle)">{selected.count}</span>
            </span>
            <ChevronDown size={16} className="shrink-0 text-(--panel-text-subtle)" />
          </button>
        }
      />
      <DropdownMenuContent align="start" className="min-w-56">
        {options.map((option) => (
          <DropdownMenuItem key={option.value} onClick={() => onChange(option.value)}>
            {option.dotClass && (
              <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", option.dotClass)} />
            )}
            <span className="flex-1 truncate">{option.label}</span>
            <span className="text-xs text-(--panel-text-subtle)">{option.count}</span>
            {value === option.value && <Check size={14} className="shrink-0 text-indigo-500" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
