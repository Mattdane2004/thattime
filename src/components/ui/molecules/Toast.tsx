"use client";

import { create } from "zustand";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { cn } from "@/lib/utils";

// Toast — Radix toasts with a tiny global queue. Mount <Toaster/> once near the
// app root, then call toast({ title }) from anywhere.
export interface ToastItem {
  id: number;
  title: string;
  description?: string;
  tone?: "default" | "success" | "danger";
}

interface ToastStore {
  toasts: ToastItem[];
  add: (t: Omit<ToastItem, "id">) => void;
  remove: (id: number) => void;
}

let nextId = 1;

const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  add: (t) => set((s) => ({ toasts: [...s.toasts, { ...t, id: nextId++ }] })),
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
}));

/** Enqueue a toast from anywhere (no hook needed). */
export const toast = (t: Omit<ToastItem, "id">) => useToastStore.getState().add(t);

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const remove = useToastStore((s) => s.remove);
  return (
    <ToastPrimitive.Provider swipeDirection="down" duration={4000}>
      {toasts.map((t) => (
        <ToastPrimitive.Root
          key={t.id}
          onOpenChange={(open) => !open && remove(t.id)}
          className={cn(
            "rounded-2xl border border-border bg-surface px-4 py-3 shadow-card",
            t.tone === "danger" && "border-danger/30",
            t.tone === "success" && "border-success/30",
          )}
        >
          <ToastPrimitive.Title className="text-[14px] font-semibold text-navy">{t.title}</ToastPrimitive.Title>
          {t.description && (
            <ToastPrimitive.Description className="mt-0.5 text-[12px] text-muted">{t.description}</ToastPrimitive.Description>
          )}
        </ToastPrimitive.Root>
      ))}
      <ToastPrimitive.Viewport className="fixed bottom-4 left-1/2 z-[60] flex w-[90%] max-w-[380px] -translate-x-1/2 list-none flex-col gap-2 p-0 outline-none" />
    </ToastPrimitive.Provider>
  );
}
