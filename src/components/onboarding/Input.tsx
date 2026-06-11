import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  rightElement?: ReactNode;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, rightElement, className = "", ...props },
  ref,
) {
  return (
    <label className="block">
      <span className="mb-2 block text-[14px] text-secondary">{label}</span>
      <span className="relative block">
        <input
          ref={ref}
          className={[
            "h-14 w-full rounded-xl border bg-white px-4 text-[16px] text-navy outline-none transition-colors placeholder:text-muted focus:border-navy",
            rightElement ? "pr-14" : "",
            error ? "border-danger" : "border-border",
            className,
          ].join(" ")}
          {...props}
        />
        {rightElement ? (
          <span className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightElement}
          </span>
        ) : null}
      </span>
      {error ? <span className="mt-2 block text-[13px] text-danger">{error}</span> : null}
    </label>
  );
});
