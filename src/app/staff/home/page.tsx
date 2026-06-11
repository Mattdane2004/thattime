import { AppFrame } from "@/components/app/AppFrame";
import { AppTabBar } from "@/components/app/AppTabBar";
import { HomeDashboard } from "@/components/app/HomeDashboard";

// Staff landing after the join-a-team flow — same dashboard as the owner's
// Home but without setup tasks, and with check-in actions on Up Next.
export default function StaffHomePage() {
  return (
    <AppFrame>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <HomeDashboard variant="staff" />
      </div>
      <AppTabBar />
    </AppFrame>
  );
}
