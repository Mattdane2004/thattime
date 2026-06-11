"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

type BottomSheetProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function BottomSheet({
  open,
  onClose,
  title,
  children,
  footer,
}: BottomSheetProps) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="absolute inset-0 z-30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            aria-label="Close invite code sheet"
            className="absolute inset-0 bg-navy/35"
            onClick={onClose}
          />
          <motion.div
            className="absolute bottom-0 left-0 right-0 flex max-h-[88%] flex-col rounded-t-[28px] bg-white"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.28, ease: "easeOut" }}
          >
            <div className="flex justify-center pt-3">
              <div className="h-1 w-9 rounded-full bg-border" />
            </div>
            <div className="flex h-14 shrink-0 items-center justify-between px-6">
              <div className="text-[16px] font-semibold text-navy">{title}</div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-canvas focus:outline-none focus:ring-2 focus:ring-navy"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 pb-4 pt-1">{children}</div>
            {footer ? <div className="shrink-0 px-6 pb-6 pt-2">{footer}</div> : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
