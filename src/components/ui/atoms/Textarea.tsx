import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

// Textarea — multi-line text atom. Mirrors Input's treatment.
export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, invalid, "aria-invalid": ariaInvalid, ...props }, ref) => (
    <textarea
      ref={ref}
      aria-invalid={ariaInvalid ?? invalid}
      className={cn(
        "min-h-24 w-full resize-y rounded-xl bg-canvas px-4 py-3 text-[14px] text-navy outline-none transition placeholder:text-muted focus-visible:ring-1 focus-visible:ring-navy disabled:cursor-not-allowed disabled:opacity-60",
        invalid && "ring-1 ring-danger focus-visible:ring-danger",
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";
