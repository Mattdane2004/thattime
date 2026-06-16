import { type ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// SummaryRow — an icon · label · (value) · chevron row used in the offer
// dashboard summary card (locations, staff, and the per-type summary blocks
// that build on it). Distinct from the coral consumer SummaryRow in
// ./consumer, which is a flat label/value checkout row.
export interface SummaryRowProps {
  icon?: ReactNode;
  label: ReactNode;
  /** Optional trailing value, muted, before the chevron. */
  value?: ReactNode;
  onClick?: () => void;
  className?: string;
}

export function SummaryRow({ icon, label, value, onClick, className }: SummaryRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-border/30", className)}
    >
      {icon && <span className="flex shrink-0 items-center text-secondary">{icon}</span>}
      <span className="min-w-0 flex-1 text-[14px] font-medium text-navy">{label}</span>
      {value != null && <span className="shrink-0 text-[13px] text-muted">{value}</span>}
      <ChevronRight size={16} className="shrink-0 text-muted" />
    </button>
  );
}
