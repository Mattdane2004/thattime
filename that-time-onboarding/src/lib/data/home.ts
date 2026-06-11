// Demo data for the Home dashboard — ported (typed) from the legacy
// that-time-app src/data/homeToday.js. Copy matches the Figma
// "Main screens / Home" frame.

export interface HomeHeader {
  location: string;
  date: string;
  greeting: string;
  hours: string;
  userInitials: string;
}

export interface Stat {
  label: string;
  value: string;
}

export interface NeedsAttentionItem {
  id: string;
  title: string;
  detail: string;
  action: string;
  done: string;
}

export interface TeamMemberToday {
  id: string;
  initials: string;
  name: string;
  detail: string;
  status: string;
}

export interface Shift {
  id: string;
  title: string;
  detail: string;
  badge?: string;
}

export interface TimeOffItem {
  id: string;
  title: string;
  detail: string;
  badge: "Approved" | "Pending" | string;
}

export const homeHeader: HomeHeader = {
  location: "Salon Soho",
  date: "Wednesday 4 March",
  greeting: "Good afternoon, Emma",
  hours: "09:00 – 17:00",
  userInitials: "ES",
};

// Owner sees revenue; staff see their own day.
export const ownerStats: Stat[] = [
  { label: "Revenue", value: "£349" },
  { label: "Next gap", value: "12:30" },
  { label: "Booked", value: "70%" },
];

export const staffStats: Stat[] = [
  { label: "Appointments", value: "9" },
  { label: "Next gap", value: "12:30" },
  { label: "Booked", value: "70%" },
];

export const upNext = {
  context: "Gap",
  time: "11:00 AM",
  duration: "1h 30m",
  countdown: "In 5min",
  initials: "SJ",
  client: "Sarah Johnson",
  service: "Cut & Colour · Emma S.",
  scheduleCount: 3,
};

export const needsAttention: NeedsAttentionItem[] = [
  { id: "no-show", title: "No-show", detail: "Michael Chen · Alex Martinez · 10:30 AM", action: "View", done: "Viewed" },
  { id: "form", title: "Consultation form not completed", detail: "Jessica Brown · 11:30 AM", action: "Send Reminder", done: "Sent" },
  { id: "holiday", title: "Holiday request pending", detail: "Emma Stevens · 3–7 July", action: "Approve", done: "Approved" },
];

export const teamToday: { count: string; members: TeamMemberToday[]; warning: string } = {
  count: "4/6",
  members: [
    { id: "emma-k-1", initials: "ES", name: "Emma K", detail: "09:00 – 17:00 · Stylist", status: "With client" },
    { id: "emma-k-2", initials: "ES", name: "Emma K", detail: "09:00 – 17:00 · Stylist", status: "On lunch" },
    { id: "jordan-1", initials: "JK", name: "Jordan Kelly", detail: "11:00 – 17:00 · Junior Stylist", status: "With Client" },
    { id: "jordan-2", initials: "JK", name: "Jordan Kelly", detail: "11:00 – 17:00 · Stylist", status: "Called in Sick" },
  ],
  warning: "Called in sick — not yet covered",
};

export const upcomingShifts: Shift[] = [
  { id: "today", title: "Today", detail: "09:00 – 17:00 · Main Studio", badge: "Now" },
  { id: "tomorrow", title: "Tomorrow", detail: "10:00 – 18:00 · Main Studio" },
  { id: "fri", title: "Fri 7 Mar", detail: "09:00 – 15:00 · Main Studio" },
];

export const timeOff: TimeOffItem[] = [
  { id: "annual", title: "Mon 10 – Tue 11 Mar", detail: "Annual Leave", badge: "Approved" },
  { id: "doctors", title: "Fri 21 Mar", detail: "Doctors", badge: "Pending" },
];
