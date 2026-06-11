// ── Client domain ────────────────────────────────────────────────────
// Mirrors the legacy that-time-app src/data/clientsDirectory.js. There are
// two shapes: a lightweight list item (the directory) and a full detail
// profile (opened from a card). Most demo profiles reuse the Sarah Johnson
// layout with their own header identity.

export type TagTone = "light" | "dark" | "mid";

export interface ClientTag {
  label: string;
  tone: TagTone;
}

/** Row in the Clients directory list. */
export interface ClientListItem {
  id: string;
  initials: string;
  name: string;
  /** Average star rating, formatted (e.g. "4.9"). Absent for some clients. */
  rating?: string;
  /** "Next: 2 Apr, 14:30" or "Last: 5 Feb 2026". */
  schedule: string;
  tags: ClientTag[];
  /** Dimmed in the list (e.g. blocked clients). */
  muted?: boolean;
}

export interface EmergencyContact {
  name: string;
  phone: string;
}

export interface ClientDetails {
  phone: string;
  email: string;
  address: string;
  birthday: string;
  pronouns: string;
  occupation: string;
  emergencyContact: EmergencyContact;
}

export interface ClientAllergy {
  id: string;
  name: string;
  type: "Drug" | "Non-drug";
  severity: "Mild" | "Moderate" | "Severe";
  reaction: string;
  patchTestRequired: boolean;
}

export interface PatchTest {
  id: string;
  product: string;
  date: string;
  result: string;
  retest: string;
}

export interface ClientFile {
  id: string;
  name: string;
  meta: string;
}

export interface WalletTransaction {
  id: string;
  label: string;
  date: string;
  /** Signed, formatted amount, e.g. "+£60" / "−£20". */
  amount: string;
}

export interface ClientWallet {
  balance: number;
  transactions: WalletTransaction[];
}

export interface ClientLoyalty {
  points: number;
  tier: string;
  caption: string;
}

export interface ClientOverview {
  stats: Array<{ label: string; value: string }>;
  nextAppointment: { service: string; detail: string };
  allergies: string[];
  contact: { phone: string; email: string; address: string };
}

export interface ClientForm {
  id: string;
  name: string;
  meta: string;
  linked: string;
  action: "View" | "Remind" | "Not Sent" | string;
}

export interface ClientForms {
  summary: string;
  pending: string;
  notSent: string;
  items: ClientForm[];
}

export interface BookingRecord {
  notes: Array<{ time: string; text: string }>;
  images: string[];
}

export interface ClientBooking {
  id: string;
  service: string;
  detail: string;
  status: "Completed" | "Cancelled" | "Upcoming" | string;
  unpaid?: string;
  record?: BookingRecord;
}

export interface ClientReview {
  id: string;
  stars: number;
  date: string;
  text: string;
  service: string;
}

/** How the client profile came to exist. */
export type ClientSource = "app" | "manual";

/** Full client profile opened from a directory card. */
export interface Client {
  id: string;
  initials: string;
  name: string;
  status: string;
  rating: string;
  conversationId: string;
  source: ClientSource;
  joined: string;
  staffAlert: string | null;
  listTags: ClientTag[];
  details: ClientDetails;
  allergies: ClientAllergy[];
  patchTests: PatchTest[];
  files: ClientFile[];
  wallet: ClientWallet;
  loyalty: ClientLoyalty;
  overview: ClientOverview;
  forms: ClientForms;
  topUp: { title: string; detail: string; service: string };
  bookings: { pastCount: string; items: ClientBooking[] };
  profileNotes: Array<{ time: string; text: string }>;
  reviews: { average: string; count: string; items: ClientReview[] };
}
