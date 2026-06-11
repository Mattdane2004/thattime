import Link from "next/link";
import { ChevronLeft, Phone, Mail, MapPin, Star, AlertTriangle } from "lucide-react";
import { getClientProfile } from "@/lib/data/clientDetail";

// Client profile — ported from the legacy that-time-app client detail screens.
// Server component: renders the overview, contact, allergies, recent bookings
// and reviews for a directory id. Editing/forms/wallet tabs are backlog.

export default function ClientDetailPage({ params }: { params: { id: string } }) {
  const c = getClientProfile(params.id);

  return (
    <div className="flex h-full flex-col bg-surface">
      <div className="flex h-16 items-center px-5">
        <Link href="/app/clients" aria-label="Back to clients" className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full text-navy hover:bg-canvas">
          <ChevronLeft size={22} />
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-8">
        {/* Identity */}
        <div className="flex items-center gap-3.5 pb-5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-canvas text-[16px] font-semibold text-secondary">{c.initials}</div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[18px] font-bold text-navy">{c.name}</span>
              <span className="flex items-center gap-0.5 text-[12px] font-medium text-secondary"><Star size={12} className="fill-current" />{c.rating}</span>
            </div>
            <div className="mt-0.5 text-[12px] text-muted">{c.status} · Client since {c.joined}</div>
          </div>
        </div>

        {/* Overview stats */}
        <div className="mb-5 grid grid-cols-3 rounded-2xl bg-canvas px-2 py-4">
          {c.overview.stats.map((s, i) => (
            <div key={s.label} className={`text-center ${i > 0 ? "border-l border-border" : ""}`}>
              <div className="text-[11px] text-muted">{s.label}</div>
              <div className="mt-1 text-[15px] font-bold text-navy">{s.value}</div>
            </div>
          ))}
        </div>

        {/* Allergies — surfaced prominently */}
        {c.allergies.length > 0 && (
          <div className="mb-5">
            <div className="mb-2 flex items-center gap-1.5 text-[13px] font-semibold text-navy"><AlertTriangle size={14} className="text-warning" />Allergies</div>
            <div className="space-y-2">
              {c.allergies.map((a) => (
                <div key={a.id} className="rounded-2xl border border-border bg-surface px-4 py-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] font-medium text-navy">{a.name}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${a.severity === "Severe" ? "bg-danger/10 text-danger" : "bg-canvas text-secondary"}`}>{a.severity}</span>
                  </div>
                  <div className="mt-0.5 text-[12px] text-muted">{a.reaction}{a.patchTestRequired ? " · Patch test required" : ""}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact */}
        <div className="mb-5">
          <div className="mb-2 text-[13px] font-semibold text-navy">Contact</div>
          <div className="space-y-2 rounded-2xl border border-border bg-surface px-4 py-3 text-[13px] text-secondary">
            <div className="flex items-center gap-2"><Phone size={14} className="text-muted" />{c.details.phone}</div>
            <div className="flex items-center gap-2"><Mail size={14} className="text-muted" />{c.details.email}</div>
            <div className="flex items-center gap-2"><MapPin size={14} className="text-muted" />{c.details.address}</div>
          </div>
        </div>

        {/* Recent bookings */}
        <div className="mb-5">
          <div className="mb-2 text-[13px] font-semibold text-navy">{c.bookings.pastCount}</div>
          <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            {c.bookings.items.map((b, i) => (
              <div key={b.id} className={`flex items-center justify-between px-4 py-3 ${i > 0 ? "border-t border-border" : ""}`}>
                <div className="min-w-0">
                  <div className="text-[14px] font-medium text-navy">{b.service}</div>
                  <div className="truncate text-[12px] text-muted">{b.detail}</div>
                </div>
                <span className={`shrink-0 text-[11px] font-medium ${b.status === "Cancelled" ? "text-danger" : "text-secondary"}`}>{b.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews */}
        <div>
          <div className="mb-2 text-[13px] font-semibold text-navy">Reviews {c.reviews.count}</div>
          <div className="space-y-2">
            {c.reviews.items.map((r) => (
              <div key={r.id} className="rounded-2xl border border-border bg-surface px-4 py-3">
                <div className="flex items-center gap-1">
                  {Array.from({ length: r.stars }).map((_, i) => <Star key={i} size={12} className="fill-warning text-warning" />)}
                  <span className="ml-1 text-[11px] text-muted">{r.date}</span>
                </div>
                <div className="mt-1 text-[13px] text-secondary">{r.text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
