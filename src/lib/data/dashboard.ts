// Demo metrics for the role-aware Home dashboard. All constants are
// deterministic (no Date.now/Math.random) so the screens are SSR-safe.
//
// `weekPerformance` is the single source the home hero + the hub "This week"
// card both read, so the numbers never drift between screens.

export interface WeekPerformance {
  revenue: string;
  revenueDelta: string;
  bookings: string;
  bookingsDelta: string;
}

export const weekPerformance: WeekPerformance = {
  revenue: "£4,280",
  revenueDelta: "+12% vs last week",
  bookings: "87",
  bookingsDelta: "+8% vs last week",
};

// Periods offered by the dashboard period pill. Prototype: switching scopes the
// headline label; the underlying demo figures stay constant.
export const periods = ["Today", "This week", "Last 30 days"] as const;
export type Period = (typeof periods)[number];

export interface HeroMetric {
  label: string;
  value: string;
  delta: string;
  up: boolean;
  /** 7-point series for the sparkline, oldest → newest. */
  spark: number[];
}

// Owner / solo lead metric — revenue this week with a 7-day trend.
export const revenueHero: HeroMetric = {
  label: "Revenue",
  value: "£4,280",
  delta: "+12%",
  up: true,
  spark: [320, 410, 380, 520, 470, 610, 590],
};

// Staff lead metric — their own takings, never business-wide revenue.
export const staffEarningsHero: HeroMetric = {
  label: "Your earnings",
  value: "£612",
  delta: "+6%",
  up: true,
  spark: [60, 95, 80, 120, 90, 110, 140],
};

export const staffEarningsSub = "incl. £84 tips · 9 appointments";

export interface KpiTile {
  id: string;
  /** lucide icon name resolved in the component. */
  icon: "banknote" | "calendar" | "userPlus" | "gauge" | "scissors" | "star";
  label: string;
  value: string;
  delta: string;
  up: boolean;
}

// Horizontal-scroll KPI row for owner/solo (the four insight categories).
export const businessKpis: KpiTile[] = [
  { id: "revenue", icon: "banknote", label: "Revenue", value: "£4,280", delta: "+12%", up: true },
  { id: "bookings", icon: "calendar", label: "Bookings", value: "87", delta: "+8%", up: true },
  { id: "new-clients", icon: "userPlus", label: "New clients", value: "14", delta: "+5", up: true },
  { id: "utilisation", icon: "gauge", label: "Utilisation", value: "78%", delta: "-3%", up: false },
];

// Personal KPI row for staff (counts + their own utilisation, no business money).
export const staffKpis: KpiTile[] = [
  { id: "appointments", icon: "calendar", label: "Appointments", value: "9", delta: "today", up: true },
  { id: "rebooked", icon: "star", label: "Rebooked", value: "6", delta: "+2", up: true },
  { id: "utilisation", icon: "gauge", label: "Booked", value: "70%", delta: "+4%", up: true },
];

export interface ActivityPoint {
  day: string;
  bookings: number;
  revenue: number;
}

// 7-day activity for the bar+line chart (bars = bookings, line = revenue £).
export const activitySeries: ActivityPoint[] = [
  { day: "Mon", bookings: 9, revenue: 320 },
  { day: "Tue", bookings: 12, revenue: 410 },
  { day: "Wed", bookings: 10, revenue: 380 },
  { day: "Thu", bookings: 15, revenue: 520 },
  { day: "Fri", bookings: 13, revenue: 470 },
  { day: "Sat", bookings: 18, revenue: 610 },
  { day: "Sun", bookings: 10, revenue: 590 },
];

export interface Benchmark {
  headline: string;
  /** 0–100 position of "you" along the curve. */
  you: number;
  sub: string;
}

export const benchmark: Benchmark = {
  headline: "Busier than 78% of nearby salons",
  you: 78,
  sub: "Bookings vs salons within 2 miles",
};

export interface TopService {
  name: string;
  count: number;
  revenue: string;
}

export const topServices: TopService[] = [
  { name: "Cut & Colour", count: 31, revenue: "£2,170" },
  { name: "Cut & Style", count: 22, revenue: "£1,100" },
  { name: "Blow Dry & Style", count: 18, revenue: "£540" },
];

export interface ClientSplit {
  newCount: number;
  returningCount: number;
  rebookRate: string;
}

export const clientSplit: ClientSplit = {
  newCount: 14,
  returningCount: 73,
  rebookRate: "68%",
};

export interface GrowCard {
  title: string;
  body: string;
  cta: string;
  href: string;
}

// Solo "grow" prompt — surfaces team set-up in place of the Team Today block.
export const growAddTeam: GrowCard = {
  title: "Grow — add your team",
  body: "Invite stylists, set their hours and share the diary. Take more bookings without doing it all yourself.",
  cta: "Add a team member",
  href: "/app/team/invite",
};
