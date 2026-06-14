// Lightweight, token-driven inline-SVG charts for the home dashboard.
// No chart library, no inline hex — colour comes from the `text-*` token class
// on the element via `currentColor`; tints use SVG opacity attributes. Pure and
// deterministic, so they render fine under SSR / the smoke test.

interface SparklineProps {
  data: number[];
  /** token colour class, e.g. "text-navy" / "text-success". */
  className?: string;
  height?: number;
  fill?: boolean;
}

/** Compact trend line for a hero metric. */
export function Sparkline({ data, className = "text-navy", height = 36, fill = true }: SparklineProps) {
  if (data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const n = data.length;
  const pts = data.map((v, i) => {
    const x = (i / (n - 1)) * 100;
    const y = 30 - ((v - min) / range) * 26 - 2;
    return [x, y] as const;
  });
  const line = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`).join(" ");
  const area = `${line} L100 32 L0 32 Z`;
  return (
    <svg viewBox="0 0 100 32" preserveAspectRatio="none" className={className} style={{ height, width: "100%" }} aria-hidden="true">
      {fill && <path d={area} fill="currentColor" fillOpacity={0.08} stroke="none" />}
      <path d={line} fill="none" stroke="currentColor" strokeWidth={2} vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

interface MiniBarLineProps {
  data: { day: string; bookings: number; revenue: number }[];
  className?: string;
}

/** 7-day activity — bars (bookings) under a revenue trend line. */
export function MiniBarLine({ data, className = "text-navy" }: MiniBarLineProps) {
  const W = 320;
  const H = 120;
  const top = 8;
  const bottom = 8;
  const usable = H - top - bottom;
  const maxB = Math.max(...data.map((d) => d.bookings)) || 1;
  const maxR = Math.max(...data.map((d) => d.revenue)) || 1;
  const n = data.length;
  const band = W / n;
  const barW = band * 0.4;
  const linePts = data.map((d, i) => {
    const x = band * i + band / 2;
    const y = top + usable - (d.revenue / maxR) * usable;
    return [x, y] as const;
  });
  const line = linePts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`).join(" ");
  return (
    <div className={className}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full" style={{ height: 132 }} aria-hidden="true">
        {data.map((d, i) => {
          const h = (d.bookings / maxB) * usable;
          const x = band * i + band / 2 - barW / 2;
          const y = top + usable - h;
          return <rect key={d.day} x={x} y={y} width={barW} height={h} rx={2} fill="currentColor" fillOpacity={0.13} />;
        })}
        <path d={line} fill="none" stroke="currentColor" strokeWidth={2} vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
      <div className="flex justify-between px-1 pt-1.5">
        {data.map((d) => (
          <span key={d.day} className="text-[10px] text-muted">{d.day}</span>
        ))}
      </div>
    </div>
  );
}

interface BenchmarkCurveProps {
  /** 0–100 position of "you" relative to peers. */
  you: number;
  className?: string;
}

/** Distribution bell with a "You" marker — peer benchmark. */
export function BenchmarkCurve({ you, className = "text-navy" }: BenchmarkCurveProps) {
  const W = 320;
  const H = 120;
  const padX = 10;
  const baseY = 100;
  const amp = 78;
  const mu = 50;
  const sigma = 17;
  const gauss = (x: number) => Math.exp(-((x - mu) ** 2) / (2 * sigma * sigma));
  const px = (x: number) => padX + (x / 100) * (W - 2 * padX);
  const py = (x: number) => baseY - gauss(x) * amp;
  const samples = Array.from({ length: 51 }, (_, i) => i * 2);
  const curve = samples.map((x, i) => `${i === 0 ? "M" : "L"}${px(x).toFixed(2)} ${py(x).toFixed(2)}`).join(" ");
  const area = `${curve} L${px(100).toFixed(2)} ${baseY} L${px(0).toFixed(2)} ${baseY} Z`;
  const youX = px(you);
  const youY = py(you);
  return (
    <div className={className}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 132 }} aria-hidden="true">
        <path d={area} fill="currentColor" fillOpacity={0.1} stroke="none" />
        <path d={curve} fill="none" stroke="currentColor" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {/* average marker */}
        <line x1={px(mu)} y1={py(mu)} x2={px(mu)} y2={baseY} stroke="currentColor" strokeWidth={1} strokeDasharray="3 3" strokeOpacity={0.35} />
        {/* you marker */}
        <line x1={youX} y1={youY} x2={youX} y2={baseY} stroke="currentColor" strokeWidth={1.5} />
        <circle cx={youX} cy={youY} r={6} fill="currentColor" fillOpacity={0.18} />
        <circle cx={youX} cy={youY} r={3} fill="currentColor" />
      </svg>
      <div className="flex justify-between px-1 pt-1">
        <span className="text-[10px] text-muted">Quieter</span>
        <span className="text-[10px] text-muted">Average</span>
        <span className="text-[10px] text-muted">Busiest</span>
      </div>
    </div>
  );
}
