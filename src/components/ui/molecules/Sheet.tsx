"use client";

import { forwardRef, type ComponentPropsWithoutRef, type ElementRef, type ReactNode } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

// Sheet — bottom sheet on Radix Dialog (the app's BottomSheet pattern), with a
// grab handle. Same a11y as Dialog (focus trap, escape, scroll-lock).
export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;

const SheetOverlay = forwardRef<
  ElementRef<typeof DialogPrimitive.Overlay>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay ref={ref} className={cn("fixed inset-0 z-50 bg-navy/40", className)} {...props} />
));
SheetOverlay.displayName = "SheetOverlay";

export interface SheetContentProps extends Omit<ComponentPropsWithoutRef<typeof DialogPrimitive.Content>, "title"> {
  title?: ReactNode;
}

export const SheetContent = forwardRef<ElementRef<typeof DialogPrimitive.Content>, SheetContentProps>(
  ({ className, children, title, ...props }, ref) => (
    <DialogPrimitive.Portal>
      <SheetOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[90dvh] w-full max-w-[420px] overflow-y-auto rounded-t-[28px] bg-surface px-5 pb-8 pt-3 shadow-phone focus:outline-none",
          className,
        )}
        {...props}
      >
        <div className="mx-auto mb-3 h-1 w-9 rounded-full bg-border" />
        {title && <DialogPrimitive.Title className="mb-3 text-[17px] font-semibold text-navy">{title}</DialogPrimitive.Title>}
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  ),
);
SheetContent.displayName = "SheetContent";
