"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { BackButton } from "./BackButton";
import { ProgressBar } from "./ProgressBar";
import { StatusBar } from "./StatusBar";

type OnboardingScreenProps = {
  title: ReactNode;
  subhead?: ReactNode;
  children: ReactNode;
  cta?: ReactNode;
  progress?: number;
  backHref?: string;
  skipHref?: string;
  skipLabel?: string;
  centerTitle?: boolean;
  moment?: ReactNode;
};

export function OnboardingScreen({
  title,
  subhead,
  children,
  cta,
  progress,
  backHref,
  skipHref,
  skipLabel = "Skip",
  centerTitle = false,
  moment,
}: OnboardingScreenProps) {
  const router = useRouter();

  return (
    <div className="flex h-full flex-col bg-canvas">
      <StatusBar />
      <header className="shrink-0 px-6 pb-3">
        <div className="mb-4 flex h-10 items-center justify-between">
          <div className="w-16">{backHref ? <BackButton href={backHref} /> : null}</div>
          <div className="flex-1">{progress !== undefined ? <ProgressBar value={progress} /> : null}</div>
          <div className="flex w-16 justify-end">
            {skipHref ? (
              <button
                type="button"
                className="text-[15px] font-semibold text-navy underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-navy"
                onClick={() => router.push(skipHref)}
              >
                {skipLabel}
              </button>
            ) : null}
          </div>
        </div>
      </header>
      <section className="flex min-h-0 flex-1 flex-col px-6">
        {moment ? <div className="mb-4">{moment}</div> : null}
        <div className={centerTitle ? "text-center" : ""}>
          <h1 className="text-[32px] font-semibold leading-[1.08] text-navy">
            {title}
          </h1>
          {subhead ? (
            <p className="mt-4 text-[16px] leading-6 text-secondary">{subhead}</p>
          ) : null}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto pt-8">{children}</div>
      </section>
      {cta ? <footer className="safe-bottom shrink-0 px-6 pt-4">{cta}</footer> : null}
    </div>
  );
}
