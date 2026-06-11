// Options shared by the quick-action flows (new appointment, block time,
// log payment) and the small pickers across the main screens.

export const bookableServices = [
  { id: 'cut-style', name: 'Cut & Style', duration: '60m', minutes: 60, price: '£85', category: 'Cuts' },
  { id: 'cut-colour', name: 'Cut & Colour', duration: '90m', minutes: 90, price: '£140', category: 'Colour' },
  { id: 'blow-dry', name: 'Blow Dry & Style', duration: '60m', minutes: 60, price: '£55', category: 'Styling' },
  { id: 'colour-treatment', name: 'Colour Treatment', duration: '120m', minutes: 120, price: '£180', category: 'Colour' },
  { id: 'haircut', name: 'Haircut', duration: '45m', minutes: 45, price: '£65', category: 'Cuts' },
  { id: 'cut-beard', name: 'Cut & Beard', duration: '60m', minutes: 60, price: '£95', category: 'Barber' },
];

export const serviceCategories = ['All', 'Cuts', 'Colour', 'Styling', 'Barber'];

export const bookableStaff = [
  { id: 'emma', initials: 'ES', name: 'Emma S.', role: 'Senior Stylist' },
  { id: 'alex', initials: 'AM', name: 'Alex M.', role: 'Barber' },
  { id: 'chris', initials: 'CT', name: 'Chris T.', role: 'Stylist' },
  { id: 'sophie', initials: 'SL', name: 'Sophie L.', role: 'Stylist' },
];

// Day-of-month in March 2026. "Today" in the prototype is Wednesday 4 March.
export const bookableDates = [
  { day: 3, label: 'Tue 3' },
  { day: 4, label: 'Today · Wed 4' },
  { day: 5, label: 'Thu 5' },
  { day: 6, label: 'Fri 6' },
  { day: 7, label: 'Sat 7' },
];

// Month helpers — the prototype lives in 2026; March (index 2) is "now".
export const CURRENT_MONTH = 2;

export function monthName(month) {
  return new Date(2026, month, 1).toLocaleDateString('en-GB', { month: 'long' });
}

export function daysInMonth(month) {
  return new Date(2026, month + 1, 0).getDate();
}

// Offset of the 1st in a Monday-first grid.
export function firstWeekdayOffset(month) {
  return (new Date(2026, month, 1).getDay() + 6) % 7;
}

export function dayLabel(day, month = CURRENT_MONTH) {
  if (!day) return null;
  const date = new Date(2026, month, day);
  const weekday = date.toLocaleDateString('en-GB', { weekday: 'short' });
  const mon = date.toLocaleDateString('en-GB', { month: 'short' });
  return `${weekday} ${day} ${mon}`;
}

export const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '13:00', '13:30', '14:00', '14:30', '15:00',
  '15:30', '16:00', '16:30',
];

// Slots rendered as unavailable in the picker, to keep it honest-feeling.
export const busySlots = ['10:00', '11:00', '13:30'];

export const blockDurations = ['15m', '30m', '45m', '1h', '2h'];

export const blockReasons = ['Lunch', 'Personal', 'Training', 'Admin', 'Other'];

export const paymentMethods = ['Card', 'Cash', 'Bank transfer'];

// Retail products available at checkout.
export const retailProducts = [
  { id: 'shampoo', name: 'Repair Shampoo', meta: '250ml', price: 12 },
  { id: 'conditioner', name: 'Repair Conditioner', meta: '250ml', price: 14 },
  { id: 'wax', name: 'Styling Wax', meta: '75ml', price: 9 },
  { id: 'heat-spray', name: 'Heat Protect Spray', meta: '200ml', price: 16 },
  { id: 'serum', name: 'Gloss Serum', meta: '50ml', price: 18 },
  { id: 'gift-card', name: 'Gift Card', meta: 'Digital', price: 25 },
];

export const checkoutDiscounts = [
  { id: 'pct10', label: '10% off', type: 'percent', value: 10 },
  { id: 'pct20', label: '20% off', type: 'percent', value: 20 },
  { id: 'fix5', label: '£5 off', type: 'fixed', value: 5 },
  { id: 'fix10', label: '£10 off', type: 'fixed', value: 10 },
];

export const businessLocations = ['Salon Soho', 'Salon Shoreditch', 'Salon Camden'];

export const clientSortOptions = [
  { id: 'recent', label: 'Recent booking' },
  { id: 'name', label: 'Name A–Z' },
  { id: 'rating', label: 'Highest rated' },
  { id: 'newest', label: 'Newest clients' },
];

export const clientFilterOptions = ['All', 'VIP', 'Regular', 'Allergy', 'Blocked', 'Inactive'];

export const formTemplates = [
  { id: 'consultation', name: 'Consultation Form', meta: 'Consent' },
  { id: 'allergy', name: 'Allergy Questionnaire', meta: 'Medical' },
  { id: 'aftercare', name: 'Aftercare Instructions', meta: 'Aftercare' },
  { id: 'checklist', name: 'Pre-Appointment Checklist', meta: 'Intake' },
  { id: 'patch-test', name: 'Patch Test Consent', meta: 'Consent' },
];

export const allergySuggestions = ['PPD (hair dye)', 'Nut allergy', 'Latex allergy', 'Fragrance sensitivity', 'Plasters / adhesives'];

export const allergyTypes = ['Drug', 'Non-drug'];

export const allergySeverities = ['Mild', 'Moderate', 'Severe'];

export const patchTestResults = ['Pending', 'Passed', 'Failed'];

export const tagSuggestions = ['VIP', 'Regular', 'Colour client', 'Sensitive', 'New client', 'Lapsed'];

export const clientSources = ['Phone', 'Walk-in', 'Referral', 'Other'];

export const timeOffTypes = ['Annual Leave', 'Sick', 'Appointment', 'Other'];

export const timeOffDates = ['Fri 28 Mar', 'Mon 31 Mar', 'Mon 31 Mar – Tue 1 Apr'];

export const allShifts = [
  { id: 's1', title: 'Today', detail: '09:00 – 17:00 · Main Studio', badge: 'Now' },
  { id: 's2', title: 'Tomorrow', detail: '10:00 – 18:00 · Main Studio' },
  { id: 's3', title: 'Fri 7 Mar', detail: '09:00 – 15:00 · Main Studio' },
  { id: 's4', title: 'Mon 10 Mar', detail: '09:00 – 17:00 · Main Studio' },
  { id: 's5', title: 'Tue 11 Mar', detail: '09:00 – 17:00 · Main Studio' },
  { id: 's6', title: 'Thu 13 Mar', detail: '12:00 – 20:00 · Soho Late' },
  { id: 's7', title: 'Fri 14 Mar', detail: '09:00 – 15:00 · Main Studio' },
];
