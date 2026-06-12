import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

// StatTile — a single label + value cell, used in the stat strips
// (revenue/next-gap/booked, client overview, etc.). Group several in a
// `grid grid-cols-N rounded-2xl bg-canvas`.
export interface StatTileProps {
  label: string;
  value: ReactNode;
  className?: string;
}

export function StatTile({ label, value, className }: StatTileProps) {
  return (
    <div className={cn("text-center", className)}>
      <div className="text-[11px] text-muted">{label}</div>
      <div className="mt-1 text-[18px] font-bold text-navy">{value}</div>
    </div>
  );
}
