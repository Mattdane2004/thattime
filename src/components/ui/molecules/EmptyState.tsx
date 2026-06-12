import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

// EmptyState — centered icon + title + description + optional action. For
// empty lists / zero-data screens.
export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center px-6 pt-16 text-center", className)}>
      {icon && <div className="mb-3 text-muted">{icon}</div>}
      <div className="text-[14px] font-medium text-navy">{title}</div>
      {description && <div className="mt-1 text-[12px] text-muted">{description}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
