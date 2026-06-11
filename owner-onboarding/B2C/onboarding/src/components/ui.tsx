"use client";

import { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";

export function PrimaryButton({
  children,
  disabled,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      disabled={disabled}
      className={`w-full h-14 rounded-2xl bg-brand text-white font-semibold text-base shadow-[0_10px_24px_-10px_rgba(255,90,95,0.6)] transition-all hover:brightness-110 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none ${rest.className ?? ""}`}
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className={`w-full h-14 rounded-2xl bg-transparent text-foreground font-medium text-base border border-border hover:bg-black/[0.03] transition-colors ${rest.className ?? ""}`}
    >
      {children}
    </button>
  );
}

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  leading?: ReactNode;
};

export function Field({ label, hint, leading, className, ...rest }: FieldProps) {
  return (
    <label className="block">
      {label && (
        <span className="block text-sm font-medium text-foreground mb-1.5">
          {label}
        </span>
      )}
      <div className="relative">
        {leading && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">
            {leading}
          </span>
        )}
        <input
          {...rest}
          className={`w-full h-14 rounded-2xl border border-border bg-white px-4 ${leading ? "pl-11" : ""} text-base outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition ${className ?? ""}`}
        />
      </div>
      {hint && <span className="block text-xs text-muted mt-1.5">{hint}</span>}
    </label>
  );
}

export function ScreenHeader({
  title,
  subtitle,
  emoji,
}: {
  title: string;
  subtitle: string;
  emoji?: string;
}) {
  return (
    <div className="mb-6">
      {emoji && (
        <div className="text-4xl mb-3" aria-hidden>
          {emoji}
        </div>
      )}
      <h1 className="text-[26px] leading-tight font-bold tracking-tight text-foreground">
        {title}
      </h1>
      <p className="mt-2 text-[15px] text-muted leading-relaxed">{subtitle}</p>
    </div>
  );
}
