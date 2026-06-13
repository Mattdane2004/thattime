import { type ReactNode } from "react";

// StatusPill — status/label pill used on calendar blocks and cards. Distinct
// from the shadcn `Badge`; kept as the in-use variant so appearance is stable.
export function StatusPill({
  children,
  tone = "light",
}: {
  children: ReactNode;
  tone?: "light" | "dark" | "danger" | "amber";
}) {
  const cls =
    tone === "dark"
      ? "bg-white/15 text-white"
      : tone === "danger"
        ? "bg-danger text-white"
        : tone === "amber"
          ? "bg-[#FEF3C7] text-[#B45309]"
          : "bg-canvas text-secondary";
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${cls}`}>{children}</span>;
}
