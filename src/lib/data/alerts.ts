// Activity / alerts feed — ported (typed) from the legacy that-time-app
// src/data/activityFeed.js. Grouped notifications shown on the Alerts screen.

export type AlertKind = "appointment" | "message" | "review" | "update" | "favourite";

export interface AlertItem {
  id: string;
  kind: AlertKind;
  title: string;
  detail: string;
  time: string;
}

export interface AlertGroup {
  label: string;
  items: AlertItem[];
}

export const alertFilters = ["All", "Appointments", "Messages", "Reviews", "Updates"] as const;

export const alertGroups: AlertGroup[] = [
  {
    label: "Today",
    items: [
      { id: "a1", kind: "message", title: "Message request", detail: "Robert Lee wants to rebook", time: "09:45" },
      { id: "a2", kind: "review", title: "New review", detail: "Sarah Johnson left 5 stars", time: "08:20" },
      { id: "a3", kind: "update", title: "New in That Time", detail: "Waitlists are now available", time: "07:00" },
    ],
  },
  {
    label: "Yesterday",
    items: [
      { id: "a4", kind: "appointment", title: "Cancellation request", detail: "Michael Chen · 10:30 cut", time: "18:12" },
      { id: "a5", kind: "appointment", title: "New booking", detail: "Emily Davis · Cut & Colour, 2 Apr", time: "14:02" },
      { id: "a6", kind: "favourite", title: "New favourite", detail: "Lisa Anderson favourited you", time: "11:30" },
    ],
  },
  {
    label: "23 January",
    items: [
      { id: "a7", kind: "appointment", title: "Rescheduled appointment", detail: "Amanda White moved to 17:30", time: "16:40" },
      { id: "a8", kind: "appointment", title: "Cancelled booking", detail: "Jessica Brown · blow dry", time: "09:15" },
    ],
  },
];

export const ALERT_FILTER_KIND: Record<string, AlertKind | "all"> = {
  All: "all",
  Appointments: "appointment",
  Messages: "message",
  Reviews: "review",
  Updates: "update",
};
