export function ProgressBar({ value }: { value?: number }) {
  if (value === undefined) return null;

  return (
    <div className="h-0.5 w-full overflow-hidden rounded-full bg-border" aria-hidden="true">
      <div
        className="h-full rounded-full bg-navy transition-all duration-300 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
