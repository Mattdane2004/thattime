import type { InputHTMLAttributes } from "react";

// Input atom — the text-field primitive. Replaces the repeated
// `h-12 rounded-xl bg-canvas px-4 … focus:ring-1 focus:ring-navy` inputs.
// Optional label renders a field group; omit it for a bare input.

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const FIELD =
  "h-12 w-full rounded-xl bg-canvas px-4 text-[14px] text-navy outline-none placeholder:text-muted focus:ring-1 focus:ring-navy";

export function Input({ label, className = "", ...props }: InputProps) {
  const input = <input className={[FIELD, className].filter(Boolean).join(" ")} {...props} />;
  if (!label) return input;
  return (
    <label className="block">
      <span className="mb-2 block text-[13px] font-medium text-secondary">{label}</span>
      {input}
    </label>
  );
}
