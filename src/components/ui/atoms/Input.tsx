import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

// Input — bare text-field atom (compose with Label / Field for a labelled group).
// `invalid` flips to the error treatment. Token-driven; a11y focus ring.
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, "aria-invalid": ariaInvalid, ...props }, ref) => (
    <input
      ref={ref}
      aria-invalid={ariaInvalid ?? invalid}
      className={cn(
        "h-12 w-full rounded-xl bg-canvas px-4 text-[14px] text-navy outline-none transition placeholder:text-muted focus-visible:ring-1 focus-visible:ring-navy disabled:cursor-not-allowed disabled:opacity-60",
        invalid && "ring-1 ring-danger focus-visible:ring-danger",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";
