import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// ListRow — leading slot + title/subtitle + trailing slot. The most repeated
// row pattern (lists, menus, settings). Wrap in a Link/button for navigation;
// set `chevron` for the affordance.
export interface ListRowProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  leading?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  trailing?: ReactNode;
  chevron?: boolean;
}

export const ListRow = forwardRef<HTMLDivElement, ListRowProps>(
  ({ className, leading, title, subtitle, trailing, chevron, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center gap-3 px-4 py-3", className)} {...props}>
      {leading}
      <div className="min-w-0 flex-1">
        <div className="text-[14px] font-medium text-navy">{title}</div>
        {subtitle && <div className="truncate text-[12px] text-muted">{subtitle}</div>}
      </div>
      {trailing}
      {chevron && <ChevronRight size={16} className="shrink-0 text-muted" />}
    </div>
  ),
);
ListRow.displayName = "ListRow";
