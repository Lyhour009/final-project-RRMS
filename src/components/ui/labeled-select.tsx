"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface LabeledSelectOption {
  value: string;
  label: React.ReactNode;
}

// Base UI's uncontrolled <Select> shows the raw `value` string in the
// trigger on first paint (e.g. a bill's UUID, or "aba" instead of "ABA")
// until the user opens the dropdown once and an item registers its text.
// A render-prop on <SelectValue> resolves the current value to its option's
// label immediately, but that render-prop is a function and can't cross the
// Server->Client component boundary — so this wrapper carries only plain,
// serializable `options` data and owns the render-prop itself.
export function LabeledSelect({
  name,
  defaultValue,
  required,
  options,
  triggerClassName,
  contentClassName,
  itemClassName,
}: {
  name: string;
  defaultValue?: string;
  required?: boolean;
  options: LabeledSelectOption[];
  triggerClassName?: string;
  contentClassName?: string;
  itemClassName?: string;
}) {
  const labelFor = (value: string) =>
    options.find((option) => option.value === value)?.label ?? value;

  return (
    <Select name={name} defaultValue={defaultValue} required={required}>
      <SelectTrigger className={triggerClassName}>
        <SelectValue>{(value: string) => labelFor(value)}</SelectValue>
      </SelectTrigger>
      <SelectContent className={contentClassName}>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value} className={itemClassName}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
