import { type ReactNode } from "react";

// SettingsGroup — uppercase label over a rounded white card that clips its rows
// (Apple-Settings style). Pairs with ToggleRow and list rows.
export function SettingsGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="pb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">{label}</p>
      <div className="overflow-hidden rounded-2xl bg-white shadow-[0_1px_4px_rgba(8,7,6,0.04)]">{children}</div>
    </div>
  );
}
