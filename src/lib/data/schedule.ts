// Demo data for the Schedule "My Day" agenda — ported (typed) from the legacy
// that-time-app src/data/scheduleData.js (myDayTimeline). The original screen
// also has week / 3-day / team-column calendar views; those are backlog.

export type TimelineKind =
  | "past" | "now" | "break" | "upNext" | "appointment" | "gap" | "end" | "class";

export interface TimelineItem {
  id: string;
  kind: TimelineKind;
  time?: string;
  client?: string;
  service?: string;
  badge?: string;
  label?: string;
  duration?: string;
  start?: string;
  end?: string;
  bookingId?: string;
  classId?: string;
}

export const scheduleDate = "Tuesday 3 March";

export const myDayTimeline: TimelineItem[] = [
  { id: "past-1", kind: "past", time: "09:00", client: "Sarah Johnson", service: "Cut & Style", badge: "Paid" },
  { id: "past-2", kind: "past", time: "09:30", client: "Robert Lee", service: "Cut & Style", badge: "Paid" },
  { id: "now", kind: "now" },
  { id: "lunch", kind: "break", time: "10:00", label: "Lunch Break", duration: "60m" },
  { id: "up-next", kind: "upNext" },
  { id: "appt-1", kind: "appointment", bookingId: "lisa-anderson", start: "13:00", end: "14:00", client: "Lisa Anderson", service: "Blow Dry & Style" },
  { id: "gap-1", kind: "gap", time: "14:00", label: "30min open" },
  { id: "appt-2", kind: "appointment", bookingId: "emily-davis", start: "14:30", end: "16:30", client: "Emily Davis", service: "Cut & Colour" },
  { id: "appt-3", kind: "appointment", bookingId: "amanda-white", start: "16:00", end: "16:30", client: "Amanda White", service: "Fringe Trim" },
  { id: "gap-2", kind: "gap", time: "16:30", label: "30min open" },
  { id: "end", kind: "end", label: "End of shift · 17:00" },
  { id: "class-1", kind: "class", classId: "colour-masterclass", label: "Colour Masterclass · 6 booked" },
];
