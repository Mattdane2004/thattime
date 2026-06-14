import { cn } from "@/lib/utils";

// Tag — small labelled pill for client/record tags. `emphasis` renders the
// solid ink treatment (e.g. Allergy / Blocked); default is the quiet chip.
export interface TagProps {
  label: string;
  emphasis?: boolean;
  className?: string;
}

export function Tag({ label, emphasis, className }: TagProps) {
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[10px] font-semibold",
        emphasis ? "bg-fg-primary text-white" : "bg-canvas text-secondary",
        className,
      )}
    >
      {label}
    </span>
  );
}
