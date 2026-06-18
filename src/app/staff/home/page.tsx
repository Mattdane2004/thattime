"use client";

import { useEffect } from "react";
import { AppFrame } from "@/components/app/AppFrame";
import { AppTabBar } from "@/components/app/AppTabBar";
import { QuickActionsHost } from "@/components/app/QuickActions";
import { AppointmentSheetHost } from "@/components/app/AppointmentSheet";
import HomePage from "@/app/app/page";
import { useRoleStore } from "@/lib/store/roleStore";

// Staff landing after the join-a-team flow — the same dashboard, locked to the
// stripped-back staff role (their day only, no business settings).
export default function StaffHomePage() {
  const setRole = useRoleStore((s) => s.setRole);
  useEffect(() => {
    setRole("staff");
  }, [setRole]);

  return (
    <AppFrame>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <HomePage />
      </div>
      <AppTabBar />
      <QuickActionsHost />
      <AppointmentSheetHost />
    </AppFrame>
  );
}
