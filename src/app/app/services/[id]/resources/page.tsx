"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Check, Plus, DoorOpen, Wrench } from "lucide-react";
import { resourcesCatalog } from "@/lib/data/modules";

// Resources module editor — assign rooms & equipment an offer needs. Ported
// from the legacy that-time-app Resources module. Selection is local state.

export default function ResourcesModulePage({ params }: { params: { id: string } }) {
  const [selected, setSelected] = useState<string[]>([]);
  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const groups: { label: string; type: "space" | "equipment" }[] = [
    { label: "Spaces", type: "space" },
    { label: "Equipment", type: "equipment" },
  ];

  return (
    <div className="flex h-full flex-col bg-surface">
      <div className="flex h-16 items-center px-5">
        <Link href={`/app/services/${params.id}`} aria-label="Back to offer" className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full text-navy hover:bg-canvas">
          <ChevronLeft size={22} />
        </Link>
        <span className="ml-1 text-[17px] font-semibold text-navy">Resources</span>
      </div>
      <div className="px-4 pb-2 text-[12px] text-muted">{selected.length} required for this offer</div>
      <div className="flex-1 space-y-5 overflow-y-auto px-4 pb-6">
        {groups.map((g) => (
          <div key={g.type}>
            <div className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted">{g.label}</div>
            <div className="space-y-2">
              {resourcesCatalog.filter((r) => r.type === g.type).map((r) => {
                const sel = selected.includes(r.id);
                return (
                  <button key={r.id} onClick={() => toggle(r.id)}
                    className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors ${sel ? "border-navy" : "border-border hover:bg-canvas"}`}>
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-canvas">
                      {g.type === "space" ? <DoorOpen size={17} className="text-navy" /> : <Wrench size={17} className="text-navy" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14px] font-medium text-navy">{r.name}</span>
                      {r.capacity && <span className="block text-[12px] text-muted">Capacity {r.capacity}</span>}
                    </span>
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${sel ? "bg-navy text-white" : "bg-canvas text-muted"}`}>{sel ? <Check size={15} /> : <Plus size={15} />}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
