"use client";

// Shared chrome for the offer-creation wizard (Figma "Add new service" flow):
// every step shows "Step N of M" + a segmented progress bar above a Back /
// Next footer; titles are a large heading with a grey subtitle.

// Steps per offer type: service basics→locations→staff→price; class
// basics→attendees→dates→times→locations→instructors→price; bundle basics
// →services→order→pricing; subscription basics→type→benefits→billing.
export const TOTAL_STEPS = { service: 4, class: 7, bundle: 4, subscription: 4 } as const;

export function WizardTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="pb-6 pt-2">
      <div className="text-[26px] font-semibold leading-tight tracking-tight text-navy">{title}</div>
      {subtitle && <div className="mt-1 text-[14px] text-muted">{subtitle}</div>}
    </div>
  );
}

export function WizardFooter({
  step,
  total,
  onBack,
  onNext,
  nextLabel = "Next",
  disabled = false,
}: {
  step: number;
  total: number;
  onBack?: () => void;
  onNext: () => void;
  nextLabel?: string;
  disabled?: boolean;
}) {
  return (
    <div className="shrink-0 border-t border-border px-5 pb-4 pt-3">
      <div className="flex items-center justify-between pb-3">
        <span className="text-[12px] text-muted">
          Step <span className="font-semibold text-navy">{step}</span> of {total}
        </span>
        <div className="flex gap-1.5">
          {Array.from({ length: total }, (_, i) => (
            <span key={i} className={`h-1 w-7 rounded-full ${i < step ? "bg-navy" : "bg-border"}`} />
          ))}
        </div>
      </div>
      <div className="flex gap-3">
        {onBack && (
          <button onClick={onBack} className="h-12 flex-1 rounded-full border border-border bg-surface text-[15px] font-semibold text-navy hover:bg-canvas">
            Back
          </button>
        )}
        <button
          onClick={onNext}
          disabled={disabled}
          className="h-12 flex-1 rounded-full bg-navy text-[15px] font-semibold text-white transition-colors hover:bg-navy/90 disabled:bg-border disabled:text-muted"
        >
          {nextLabel}
        </button>
      </div>
    </div>
  );
}

export const fieldInput =
  "h-12 w-full rounded-xl border border-border bg-canvas px-4 text-[14px] text-navy outline-none placeholder:text-muted focus:border-navy focus:ring-1 focus:ring-navy";

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="mb-2 block text-[13px] font-medium text-secondary">{children}</span>;
}

export function Toggle({ on }: { on: boolean }) {
  return (
    <span className={`relative h-6 w-10 shrink-0 rounded-full transition-colors ${on ? "bg-navy" : "bg-border"}`}>
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-surface transition-all ${on ? "left-[1.125rem]" : "left-0.5"}`} />
    </span>
  );
}
