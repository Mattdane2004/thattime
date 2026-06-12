"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Check, Plus, FileText } from "lucide-react";
import { formsCatalog } from "@/lib/data/modules";

// Forms module editor — attach intake/consent forms to an offer. Ported from
// the legacy that-time-app Forms module. Selection is local state.

export default function FormsModulePage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  return (
    <div className="flex h-full flex-col bg-surface">
      <div className="flex h-16 items-center px-5">
        <button type="button" aria-label="Back" onClick={() => router.back()} className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full text-navy hover:bg-canvas">
          <ChevronLeft size={22} />
        </button>
        <span className="ml-1 text-[17px] font-semibold text-navy">Forms</span>
      </div>
      <div className="px-4 pb-2 text-[12px] text-muted">{selected.length} attached to this offer</div>
      <div className="flex-1 space-y-2 overflow-y-auto px-4 pb-6">
        {formsCatalog.map((f) => {
          const sel = selected.includes(f.id);
          return (
            <button key={f.id} onClick={() => toggle(f.id)}
              className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors ${sel ? "border-navy" : "border-border hover:bg-canvas"}`}>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-canvas"><FileText size={17} className="text-navy" /></span>
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-medium text-navy">{f.name}</span>
                <span className="block truncate text-[12px] text-muted">{f.fieldCount} fields · {f.description}</span>
              </span>
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${sel ? "bg-navy text-white" : "bg-canvas text-muted"}`}>{sel ? <Check size={15} /> : <Plus size={15} />}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
