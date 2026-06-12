import type { ButtonHTMLAttributes, ReactNode } from "react";

// Button atom — the primary action primitive. Replaces the ~14 repeated inline
// `rounded-full bg-navy …` button strings across the app. Token-driven; extend
// variants/sizes here, never re-style inline on a screen.

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "md" | "sm";

const BASE =
  "inline-flex items-center justify-center gap-1.5 rounded-full font-semibold transition-colors disabled:cursor-not-allowed";

const VARIANT: Record<ButtonVariant, string> = {
  primary: "bg-navy text-white hover:bg-navy/90 disabled:bg-border disabled:text-muted",
  secondary: "border border-border bg-surface text-navy hover:bg-canvas disabled:text-muted",
  ghost: "text-navy hover:bg-canvas disabled:text-muted",
  danger: "border border-border bg-surface text-danger hover:bg-canvas disabled:text-muted",
};

const SIZE: Record<ButtonSize, string> = {
  md: "h-12 px-6 text-[15px]",
  sm: "h-9 px-3.5 text-[13px]",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  type = "button",
  children,
  ...props
}: ButtonProps) {
  const cls = [BASE, VARIANT[variant], SIZE[size], fullWidth ? "w-full" : "", className]
    .filter(Boolean)
    .join(" ");
  return (
    <button type={type} className={cls} {...props}>
      {children}
    </button>
  );
}
