"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export function BackButton({ href }: { href?: string }) {
  const router = useRouter();

  return (
    <button
      type="button"
      aria-label="Back"
      onClick={() => (href ? router.push(href) : router.back())}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ECECEF] text-navy transition-colors hover:bg-border focus:outline-none focus:ring-2 focus:ring-navy focus:ring-offset-2"
    >
      <ChevronLeft size={21} strokeWidth={2.2} />
    </button>
  );
}
