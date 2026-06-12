// Demo data for the consumer-facing client app (B2C): the business profile a
// client browses and the slot grid they book from. The sellable catalogue
// lives in lib/data/offers.ts and the staff roster in lib/data/team.ts — this
// module only adds the client-facing presentation data that exists nowhere
// else. The demo "today" across the product is Wednesday 4 March 2026.
import { businessLocations } from "./locations";

export const clientBusiness = {
  id: businessLocations[0].id,
  name: businessLocations[0].name,
  rating: 4.9,
  reviewCount: 1234,
  address: `${businessLocations[0].address}, Soho, London`,
  openLine: "Open today · 09:00 – 18:00",
  about:
    "Independent salon in the heart of Soho. Colour specialists, precision cuts and blow-outs — walk out feeling like the best version of yourself.",
  photos: [
    "/onboarding/photo-carousel-center.png",
    "/onboarding/photo-carousel-left.png",
    "/onboarding/photo-carousel-right.png",
  ],
  hours: [
    { day: "Monday – Friday", time: "09:00 – 18:00" },
    { day: "Saturday", time: "09:00 – 17:00" },
    { day: "Sunday", time: "Closed" },
  ],
};

export interface BusinessReview {
  id: string;
  name: string;
  initials: string;
  stars: number;
  date: string;
  text: string;
}

export const businessReviews: BusinessReview[] = [
  { id: "br1", name: "Hannah M.", initials: "HM", stars: 5, date: "2 Mar 2026", text: "Best colour I've ever had — they really listen. The salon itself is gorgeous too." },
  { id: "br2", name: "Tom W.", initials: "TW", stars: 5, date: "27 Feb 2026", text: "Quick to book, zero waiting around, sharp cut. I've stopped going anywhere else." },
  { id: "br3", name: "Aisha K.", initials: "AK", stars: 4, date: "19 Feb 2026", text: "Lovely blow dry and a proper coffee while you wait. Slightly pricey but worth it." },
];

// ── Booking slot grid ──
// Fixed demo days (Wed 4 → Sat 14 March 2026) so SSR and client render agree.

export interface BookingDay {
  id: string;
  dow: string;
  date: number;
  month: string;
  /** Full label for summaries, e.g. "Wed 4 Mar". */
  label: string;
  closed?: boolean;
}

const dayDefs: [string, number][] = [
  ["Wed", 4], ["Thu", 5], ["Fri", 6], ["Sat", 7], ["Sun", 8],
  ["Mon", 9], ["Tue", 10], ["Wed", 11], ["Thu", 12], ["Fri", 13], ["Sat", 14],
];

export const bookingDays: BookingDay[] = dayDefs.map(([dow, date]) => ({
  id: `mar-${date}`,
  dow,
  date,
  month: "Mar",
  label: `${dow} ${date} Mar`,
  closed: dow === "Sun",
}));

export interface DaySlots {
  morning: string[];
  afternoon: string[];
  evening: string[];
}

const MORNING = ["09:00", "09:45", "10:30", "11:15"];
const AFTERNOON = ["12:00", "12:45", "13:30", "14:15", "15:00"];
const EVENING = ["16:00", "16:45", "17:30"];

// Deterministic availability: thin each day's slots with a fixed stride so
// every day looks different without Date/random (keeps SSR stable).
const thin = (times: string[], dayIdx: number) =>
  times.filter((_, i) => (i + dayIdx) % 4 !== 2);

export const daySlots: Record<string, DaySlots> = Object.fromEntries(
  bookingDays.map((d, i) => [
    d.id,
    d.closed
      ? { morning: [], afternoon: [], evening: [] }
      : { morning: thin(MORNING, i), afternoon: thin(AFTERNOON, i), evening: thin(EVENING, i) },
  ])
);

/** "1h 30m" from minutes, for booking summaries. */
export function fmtDuration(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h ? (m ? `${h}h ${m}m` : `${h}h`) : `${m}m`;
}
