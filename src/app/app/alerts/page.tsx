"use client";

import NotificationsPage from "@/app/app/notifications/page";

// Compatibility route: Alerts has folded into Notifications as the canonical
// activity feed, but older links still land on the same signed-off surface.
export default function AlertsPage() {
  return <NotificationsPage />;
}
