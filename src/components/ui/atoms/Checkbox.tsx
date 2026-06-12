"use client";

import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

// Checkbox — Radix checkbox with the navy-fill checked state.
export const Checkbox = forwardRef<
  ElementRef<typeof CheckboxPrimitive.Root>,
  ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-border bg-surface transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-navy data-[state=checked]:bg-navy data-[state=checked]:text-white",
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className="text-current">
      <Check className="h-3.5 w-3.5" strokeWidth={3} />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = "Checkbox";
