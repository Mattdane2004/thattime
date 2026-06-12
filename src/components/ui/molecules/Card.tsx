import { forwardRef, type HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Card — surface container. The `rounded-2xl border bg-surface` pattern that's
// on nearly every screen.
export const cardVariants = cva("rounded-2xl bg-surface", {
  variants: {
    variant: {
      default: "border border-border",
      flat: "bg-canvas",
      elevated: "border border-border shadow-card",
    },
    padding: { none: "", sm: "p-3", md: "p-4", lg: "p-5" },
  },
  defaultVariants: { variant: "default", padding: "md" },
});

export interface CardProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, ...props }, ref) => (
    <div ref={ref} className={cn(cardVariants({ variant, padding }), className)} {...props} />
  ),
);
Card.displayName = "Card";
