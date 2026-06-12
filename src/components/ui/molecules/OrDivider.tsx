// OrDivider — "Or" separator between primary CTA and alternative auth.
export function OrDivider({ label = "Or" }: { label?: string }) {
  return (
    <div className="flex items-center gap-4 py-5">
      <span className="h-px flex-1 bg-border" />
      <span className="text-[13px] text-muted">{label}</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}
