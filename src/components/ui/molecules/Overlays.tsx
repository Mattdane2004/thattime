"use client";

import { type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

// Frame-scoped overlays. These render inside the phone frame (`absolute inset-0`
// over the `relative` AppFrame/onboarding shell) rather than portalling to
// document.body — so they stay contained in the device, which a Radix
// portal-based sheet/dialog would not. This is why these are the canonical app
// overlays instead of the Radix primitives.

/**
 * Bottom sheet with header/handle. Imperative open/onClose API.
 * `full` raises the top; `aboveNav` sits above the bottom tab bar.
 */
export function Sheet({
  open,
  onClose,
  children,
  title,
  sub,
  full,
  aboveNav,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: ReactNode;
  sub?: string;
  full?: boolean;
  aboveNav?: boolean;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className={`absolute inset-0 bg-fg-primary/40 ${aboveNav ? "z-40" : "z-[70]"}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className={`absolute inset-x-0 flex flex-col rounded-t-[24px] bg-white ${
              aboveNav ? "bottom-[64px] z-50" : "bottom-0 z-[80]"
            } ${full ? "top-[7%]" : "max-h-[88%]"}`}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 38 }}
          >
            <div className="shrink-0 px-6 pt-3">
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border" />
              {(title || sub) && (
                <div className="flex items-start justify-between pb-3">
                  <div className="min-w-0">
                    {title && <h2 className="text-[18px] font-bold text-navy">{title}</h2>}
                    {sub && <p className="mt-0.5 text-[13px] text-secondary">{sub}</p>}
                  </div>
                  <button type="button" aria-label="Close" onClick={onClose} className="p-1 text-navy">
                    <X size={18} strokeWidth={2} />
                  </button>
                </div>
              )}
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-8">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/** Draggable-to-dismiss bottom sheet (onboarding pattern). */
export function BottomSheet({
  open,
  onClose,
  children,
  title,
  sub,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  sub?: string;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="absolute inset-0 z-40 bg-fg-primary/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="absolute inset-x-0 bottom-0 z-50 max-h-[88%] overflow-y-auto rounded-t-[24px] bg-white px-6 pb-8 pt-3"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 38 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 90 || info.velocity.y > 600) onClose();
            }}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" />
            {(title || sub) && (
              <div className="flex items-start justify-between pb-4">
                <div>
                  {title && <h2 className="text-[17px] font-bold text-navy">{title}</h2>}
                  {sub && <p className="mt-1 text-[14px] text-secondary">{sub}</p>}
                </div>
                <button type="button" aria-label="Close" onClick={onClose} className="p-1 text-navy">
                  <X size={17} strokeWidth={2} />
                </button>
              </div>
            )}
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/** Centered iOS-permission style dialog ("Let that time …" + Yes). */
export function PermissionDialog({
  open,
  text,
  onYes,
}: {
  open: boolean;
  text: string;
  onYes: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="absolute inset-0 z-40 bg-fg-primary/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            className="absolute inset-x-6 top-[38%] z-50 rounded-[28px] bg-white p-7"
            initial={{ opacity: 0, scale: 0.92, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 32 }}
          >
            <p className="text-center text-[16px] font-semibold text-navy">{text}</p>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={onYes}
              className="mt-6 flex h-12 w-full items-center justify-center rounded-full bg-navy text-[15px] font-semibold text-white"
            >
              Yes
            </motion.button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
