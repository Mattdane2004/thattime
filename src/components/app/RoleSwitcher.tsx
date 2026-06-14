"use client";

import { useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import { useRoleStore, roleLabels, type AppRole } from "@/lib/store/roleStore";

const order: AppRole[] = ["owner", "solo", "staff"];

// Header role switcher — a prototype persona picker that flips the whole app
// between owner / solo / staff views. An inline dropdown anchored to the pill
// (not a frame-scoped Sheet, which would be clipped by the header).
export function RoleSwitcher() {
  const role = useRoleStore((s) => s.role);
  const setRole = useRoleStore((s) => s.setRole);
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Switch role"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 rounded-full border border-border bg-white px-3.5 py-1.5 text-[13px] font-semibold text-navy"
      >
        {roleLabels[role].label}
        <ChevronDown size={14} strokeWidth={2} className={`text-muted transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
          />
          <div className="absolute left-1/2 top-[calc(100%+8px)] z-50 w-60 -translate-x-1/2 overflow-hidden rounded-2xl border border-border bg-white shadow-lg">
            {order.map((r) => {
              const active = r === role;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => { setRole(r); setOpen(false); }}
                  className={`flex w-full items-center justify-between gap-3 border-b border-border px-4 py-3 text-left last:border-0 ${active ? "bg-canvas" : ""}`}
                >
                  <span className="min-w-0">
                    <span className="block text-[14px] font-semibold text-navy">{roleLabels[r].label}</span>
                    <span className="block text-[11px] leading-snug text-muted">{roleLabels[r].sub}</span>
                  </span>
                  {active && <Check size={15} strokeWidth={2.5} className="shrink-0 text-navy" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
