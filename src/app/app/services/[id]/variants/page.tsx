"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Check } from "lucide-react";
import { variantsCatalog, variantTypes, deltaLabel } from "@/lib/data/modules";

// Variants module editor — duration/staff/time variants with price & duration
// deltas. Ported from the legacy that-time-app Variants module. Local state.

const TYPE_LABEL: Record<string, string> = { duration: "Duration", staff: "Staff", time: "Time" };

export default function VariantsModulePage({ params }: { params: { id: string } }) {
  const [selected, setSelected] = useState<string[]>(["v2"]);
  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  return (
    <div className="flex h-full flex-col bg-surface">
      <div className="flex h-16 items-center px-5">
        <Link href={`/app/services/${params.id}`} aria-label="Back to offer" className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full text-navy hover:bg-canvas">
          <ChevronLeft size={22} />
        </Link>
        <span className="ml-1 text-[17px] font-semibold text-navy">Variants</span>
      </div>
      <div className="px-4 pb-2 text-[12px] text-muted">{selected.length} active · adjust price & duration per option</div>
      <div className="flex-1 space-y-5 overflow-y-auto px-4 pb-6">
        {variantTypes.map((t) => {
          const rows = variantsCatalog.filter((v) => v.type === t);
          if (!rows.length) return null;
          return (
            <div key={t}>
              <div className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted">{TYPE_LABEL[t]}</div>
              <div className="space-y-2">
                {rows.map((v) => {
                  const sel = selected.includes(v.id);
                  return (
                    <button key={v.id} onClick={() => toggle(v.id)}
                      className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors ${sel ? "border-navy" : "border-border hover:bg-canvas"}`}>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[14px] font-medium text-navy">{v.name}</span>
                        <span className="block text-[12px] text-muted">
                          {deltaLabel(v.priceDelta, "£")}{v.durationDelta !== undefined ? ` · ${deltaLabel(v.durationDelta, "min")}` : ""}
                        </span>
                      </span>
                      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border ${sel ? "border-navy bg-navy text-white" : "border-border"}`}>{sel && <Check size={14} />}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
