// Conversation thread data for /app/messages/[id] — ported (typed) from the
// legacy that-time-app src/data/conversations.js (getConversation). Most demo
// threads reuse the Emily Davis layout with their own header.
import { conversationList } from "./messages";

export interface ThreadMessage {
  id: string;
  from: "client" | "business" | "system";
  text?: string;
  meta?: string;
  action?: string;
  // system reschedule card
  title?: string;
  service?: string;
  price?: string;
  previous?: string;
  next?: { date: string; time: string };
}

export interface ConversationThread {
  id: string;
  initials: string;
  name: string;
  phone: string;
  appointment: { banner: string; service: string; date: string; time: string };
  messages: ThreadMessage[];
  suggestions: string[];
}

const emily: ConversationThread = {
  id: "emily-davis",
  initials: "ED",
  name: "Emily Davis",
  phone: "(555) 012-3456",
  appointment: { banner: "Appointment Rescheduled", service: "Blow Dry & Style", date: "14 April, 2026", time: "13:00 – 14:00" },
  messages: [
    { id: "m1", from: "client", text: "Hi, can I move my April appointment to the week after?", meta: "Today, 09:14 · SMS" },
    { id: "m2", from: "business", text: "Of course! What date works best?", meta: "Today, 09:31 · SMS", action: "Select a date" },
    { id: "m3", from: "client", text: "Maybe Thursday the 9th? I'll confirm later today", meta: "Today, 09:45 · SMS" },
    { id: "m4", from: "system", title: "Appointment Rescheduled", service: "Blow Dry & Style", price: "£55", previous: "15 March, 2026 at 10:00", next: { date: "10 March, 2026", time: "11:00" } },
    { id: "m5", from: "business", text: "Perfect, see you then!", meta: "Today, 09:31 · SMS" },
  ],
  suggestions: ["Your appointment is tomorrow!", "We have availability this week", "Time to rebook?"],
};

export function getConversationThread(id: string): ConversationThread {
  const base = conversationList.find((c) => c.id === id && !c.group && !c.business);
  if (!base) return emily;
  const initials = Array.isArray(base.initials) ? base.initials[0] : base.initials;
  return { ...emily, id, name: base.name, initials };
}
