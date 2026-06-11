import { AppFrame } from "@/components/app/AppFrame";
import { AppTabBar } from "@/components/app/AppTabBar";
import { QuickActionsHost } from "@/components/app/QuickActions";
import HomePage from "@/app/app/page";

// Staff landing after the join-a-team flow — the same mid-fi dashboard.
export default function StaffHomePage() {
  return (
    <AppFrame>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <HomePage />
      </div>
      <AppTabBar />
      <QuickActionsHost />
    </AppFrame>
  );
}
