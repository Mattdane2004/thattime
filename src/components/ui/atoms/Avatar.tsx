import { type HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Avatar — circular initials/identity atom. Pass `initials`; optional
// `colorClass` (e.g. "bg-sky-100 text-sky-700") for per-person tint, else the
// neutral token treatment.
export const avatarVariants = cva(
  "inline-flex shrink-0 items-center justify-center rounded-full font-semibold",
  {
    variants: {
      size: {
        sm: "h-9 w-9 text-[11px]",
        md: "h-11 w-11 text-[13px]",
        lg: "h-14 w-14 text-[16px]",
      },
    },
    defaultVariants: { size: "md" },
  },
);

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof avatarVariants> {
  initials: string;
  colorClass?: string;
}

export function Avatar({ className, size, initials, colorClass, ...props }: AvatarProps) {
  return (
    <span className={cn(avatarVariants({ size }), colorClass ?? "bg-canvas text-muted", className)} {...props}>
      {initials}
    </span>
  );
}
