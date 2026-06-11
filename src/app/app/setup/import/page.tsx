"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Upload, Building2, Users, CalendarDays, Check } from "lucide-react";

// Import data — bring clients & bookings in. Functional port of the legacy
// that-time-app /routes/ImportData.jsx (multi-stage column mapping deferred).

const SOURCES = [
  { key: "file", icon: Upload, label: "Upload CSV or Excel", desc: "We map the columns for you" },
  { key: "platform", icon: Building2, label: "From another platform", desc: "Fresha, Booksy, Square…" },
] as const;

const DATA = [
  { key: "clients", icon: Users, label: "Clients", desc: "Contacts, history, preferences" },
  { key: "bookings", icon: CalendarDays, label: "Bookings", desc: "Past & upcoming appointments" },
] as const;

export default function ImportDataPage() {
  const [source, setSource] = useState<string | null>(null);
  const [types, setTypes] = useState<string[]>(["clients"]);
  const toggle = (k: string) => setTypes((t) => (t.includes(k) ? t.filter((x) => x !== k) : [...t, k]));

  const canImport = Boolean(source) && types.length > 0;

  return (
    <div className="flex h-full flex-col bg-surface">
      <div className="flex h-16 items-center px-5">
        <Link href="/app/setup" aria-label="Back to setup" className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full text-navy hover:bg-canvas">
          <ChevronLeft size={22} />
        </Link>
        <span className="ml-1 text-[17px] font-semibold text-navy">Import data</span>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-6">
        <p className="pb-5 pt-1 text-[14px] text-muted">Bring your existing clients and bookings with you.</p>

        <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">Source</div>
        <div className="mb-6 space-y-2">
          {SOURCES.map(({ key, icon: Icon, label, desc }) => (
            <button key={key} onClick={() => setSource(key)}
              className={`flex w-full items-center gap-3.5 rounded-2xl border p-4 text-left transition-colors ${source === key ? "border-navy" : "border-border hover:bg-canvas"}`}>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-canvas"><Icon size={17} className="text-navy" /></span>
              <span className="flex-1">
                <span className="block text-[14px] font-semibold text-navy">{label}</span>
                <span className="block text-[12px] text-muted">{desc}</span>
              </span>
              {source === key && <Check size={18} className="text-navy" />}
            </button>
          ))}
        </div>

        <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">What to import</div>
        <div className="space-y-2">
          {DATA.map(({ key, icon: Icon, label, desc }) => {
            const on = types.includes(key);
            return (
              <button key={key} onClick={() => toggle(key)}
                className={`flex w-full items-center gap-3.5 rounded-2xl border p-4 text-left transition-colors ${on ? "border-navy" : "border-border hover:bg-canvas"}`}>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-canvas"><Icon size={17} className="text-navy" /></span>
                <span className="flex-1 text-[14px] font-semibold text-navy">{label}<span className="block text-[12px] font-normal text-muted">{desc}</span></span>
                <span className={`flex h-6 w-6 items-center justify-center rounded-md border ${on ? "border-navy bg-navy text-white" : "border-border"}`}>{on && <Check size={14} />}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="shrink-0 border-t border-border px-5 py-4">
        <button disabled={!canImport}
          className="h-12 w-full rounded-full bg-navy text-[15px] font-semibold text-white hover:bg-navy/90 disabled:bg-border disabled:text-muted">
          {canImport ? `Import ${types.join(" & ")}` : "Choose a source"}
        </button>
      </div>
    </div>
  );
}
