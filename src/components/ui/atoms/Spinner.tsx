import { cn } from "@/lib/utils";

// Spinner — indeterminate loading atom. Inherits `currentColor`, so colour it
// via text-* on the parent.
export interface SpinnerProps {
  className?: string;
  size?: number;
  label?: string;
}

export function Spinner({ className, size = 16, label = "Loading" }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      style={{ width: size, height: size }}
      className={cn("inline-block animate-spin rounded-full border-2 border-current border-t-transparent", className)}
    />
  );
}
