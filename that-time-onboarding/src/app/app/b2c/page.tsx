import Link from "next/link";
import { ChevronLeft, Smartphone, ArrowLeftRight } from "lucide-react";

// B2C client view — ported from the legacy that-time-app /routes/ClientView.jsx.
// The full consumer booking app is a separate build; this is the placeholder
// the "Switch to client view" control links to.
export default function B2CPage() {
  return (
    <div className="flex h-full flex-col bg-surface">
      <div className="flex h-14 items-center px-4">
        <Link href="/app/hub" aria-label="Back" className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full text-navy hover:bg-canvas">
          <ChevronLeft size={22} />
        </Link>
        <div className="ml-1 flex-1 text-[11px] font-semibold uppercase tracking-widest text-muted">Client view · B2C</div>
      </div>

      <div className="flex flex-1 items-start justify-center overflow-y-auto px-6 pt-14">
        <div className="flex max-w-[300px] flex-col items-center text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-navy text-white">
            <Smartphone size={24} strokeWidth={1.75} />
          </div>
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-muted">Coming soon</div>
          <div className="text-[22px] font-semibold leading-tight text-navy">That Time for clients</div>
          <div className="mt-2 text-[14px] leading-relaxed text-secondary">
            The B2C app where clients discover businesses, book services, and manage their appointments — built on the same data you configure here, so a service becomes bookable the moment it&apos;s published.
          </div>
          <Link href="/app/hub" className="mt-8 flex h-11 items-center gap-2 rounded-full bg-navy px-5 text-[14px] font-medium text-white hover:bg-navy/90">
            <ArrowLeftRight size={14} strokeWidth={2} />Switch back to business
          </Link>
        </div>
      </div>
    </div>
  );
}
