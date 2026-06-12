import { forwardRef, type LabelHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

// Label — field label atom. Pair with Input/Textarea via htmlFor, or use the
// Field molecule which wires it for you.
export const Label = forwardRef<HTMLLabelElement, LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label ref={ref} className={cn("block text-[13px] font-medium text-secondary", className)} {...props} />
  ),
);
Label.displayName = "Label";
