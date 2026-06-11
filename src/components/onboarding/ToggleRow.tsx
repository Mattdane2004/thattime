"use client";

import type { ReactNode } from "react";

type ToggleRowProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
};

export function ToggleRow({ checked, onChange, title, description }: ToggleRowProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-start gap-4 rounded-2xl border border-border bg-white p-4 text-left transition-colors hover:border-navy/25 focus:outline-none focus:ring-2 focus:ring-navy focus:ring-offset-2"
    >
      <span
        className={[
          "relative mt-0.5 h-[28px] w-12 shrink-0 rounded-full transition-colors",
          checked ? "bg-navy" : "bg-border",
        ].join(" ")}
      >
        <span
          className={[
            "absolute top-[3px] h-[22px] w-[22px] rounded-full bg-white transition-all",
            checked ? "left-[23px]" : "left-[3px]",
          ].join(" ")}
        />
      </span>
      <span className="flex-1">
        <span className="block text-[15px] font-semibold leading-5 text-navy">{title}</span>
        {description ? (
          <span className="mt-1 block text-[13px] leading-5 text-secondary">
            {description}
          </span>
        ) : null}
      </span>
    </button>
  );
}
