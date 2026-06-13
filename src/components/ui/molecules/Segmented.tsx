"use client";

import { motion } from "framer-motion";

// Segmented — sliding-pill segmented control (Schedule views, client tabs).
// String-array variant with an animated active pill; distinct from the
// shadcn `SegmentedControl` (bordered, generic value). Both are kept while the
// design-system look-and-feel is settled.
export function Segmented({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-1 rounded-full bg-canvas p-1">
      {options.map((o) => {
        const active = o === value;
        return (
          <button
            key={o}
            type="button"
            onClick={() => onChange(o)}
            className="relative flex-1 rounded-full py-2 text-[13px] font-medium"
          >
            {active && (
              <motion.span
                layoutId={`seg-${options.join("-")}`}
                className="absolute inset-0 rounded-full bg-white shadow-[0_1px_4px_rgba(15,26,46,0.1)]"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            <span className={`relative ${active ? "font-semibold text-navy" : "text-secondary"}`}>{o}</span>
          </button>
        );
      })}
    </div>
  );
}
