import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Button — the primary action atom. shadcn-style cva variants, token-driven,
// keyboard-accessible (focus-visible ring). Token classes swap to the Figma
// shadcn palette when that JSON lands; the variant API stays stable.
export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 rounded-full font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-not-allowed [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-navy text-white hover:bg-navy/90 disabled:bg-border disabled:text-muted",
        secondary: "border border-border bg-surface text-navy hover:bg-canvas disabled:text-muted",
        ghost: "text-navy hover:bg-canvas disabled:text-muted",
        danger: "border border-border bg-surface text-danger hover:bg-canvas disabled:text-muted",
        solidDanger: "bg-danger text-white hover:bg-danger/90 disabled:bg-border disabled:text-muted",
      },
      size: {
        md: "h-12 px-6 text-[15px]",
        sm: "h-9 px-3.5 text-[13px]",
        icon: "h-9 w-9 p-0",
      },
      fullWidth: { true: "w-full" },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, type = "button", ...props }, ref) => (
    <button ref={ref} type={type} className={cn(buttonVariants({ variant, size, fullWidth }), className)} {...props} />
  ),
);
Button.displayName = "Button";
