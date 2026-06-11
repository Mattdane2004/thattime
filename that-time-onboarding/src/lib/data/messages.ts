// Demo data for Messages — ported (typed) from the legacy that-time-app
// src/data/conversations.js. Copy matches the Figma "Main screens / Messages".

export interface Conversation {
  id: string;
  /** Single initials string, or up to 3 stacked initials for group threads. */
  initials: string | string[];
  name: string;
  preview: string;
  time: string;
  group?: boolean;
  business?: boolean;
  /** Unread message count (truthy = unread). */
  unread?: number;
}

export const conversationList: Conversation[] = [
  { id: "sarah-johnson", initials: "SJ", name: "Sarah Johnson", preview: "Thanks! See you then 😊", time: "3 Mar, 14:30" },
  { id: "team-chat", initials: ["SJ", "AB", "MD"], name: "Team chat", preview: "Thanks! See you Soon", time: "3 Mar, 14:30", group: true },
  { id: "managers", initials: ["ES", "AM"], name: "Managers", preview: "Rota for next week is up", time: "Today, 08:12", group: true },
  { id: "emily-davis", initials: "ED", name: "Emily Davis", preview: "Maybe Thursday the 9th? I'll confirm later today", time: "Today, 09:45", unread: 2 },
  { id: "hair-saloon", initials: "HS", name: "Hair saloon", preview: "Perfect lets collaborate on Monday", time: "3 Mar, 14:30", business: true },
  { id: "lisa-anderson", initials: "LA", name: "Lisa Anderson", preview: "Perfect, see you there!", time: "27 Feb, 12:18" },
  { id: "robert-lee", initials: "RL", name: "Robert Lee", preview: "Yes definitely! Can I come in next week?", time: "2 Mar, 14:22", unread: 1 },
];
