// Staffing coverage, estimated from booking history rather than owner input.
// In production these figures would come from the bookings system — typical
// demand per weekday drives how many staff the business usually needs on.

export const demandByDay = {
  Mon: { expectedBookings: 14, staffNeeded: 3 },
  Tue: { expectedBookings: 18, staffNeeded: 4 },
  Wed: { expectedBookings: 22, staffNeeded: 5 },
  Thu: { expectedBookings: 26, staffNeeded: 6 },
  Fri: { expectedBookings: 34, staffNeeded: 7 },
  Sat: { expectedBookings: 46, staffNeeded: 9 },
  Sun: { expectedBookings: 12, staffNeeded: 3 },
};

// Coverage states are monochrome-safe for the wireframe phase: a filled dot
// reads as covered, a mid-tone dot as tight, a hollow ring as understaffed.
// Colour (green/amber/red) is applied at the hi-fi skin stage.
export function coverageFor(day, scheduledCount) {
  const demand = demandByDay[day] || { expectedBookings: 0, staffNeeded: 0 };
  const needed = demand.staffNeeded;
  const scheduled = scheduledCount;
  if (scheduled >= needed) {
    return {
      state: 'covered',
      label: 'Covered',
      needed,
      scheduled,
      dot: 'bg-gray-900',
      summary: `Usually needs ~${needed} staff · ${scheduled} scheduled`,
    };
  }
  if (scheduled >= needed - 1) {
    return {
      state: 'tight',
      label: 'Tight',
      needed,
      scheduled,
      dot: 'bg-gray-400',
      summary: `Usually needs ~${needed} staff · ${scheduled} scheduled`,
    };
  }
  return {
    state: 'understaffed',
    label: 'Understaffed',
    needed,
    scheduled,
    dot: 'bg-white border-[1.5px] border-gray-900',
    summary: `Usually needs ~${needed} staff · only ${scheduled} scheduled`,
  };
}

// UK bank holidays around the demo period (the rota week is 18–24 May 2026).
export const upcomingHolidays = [
  { id: 'spring-bank', name: 'Spring bank holiday', dateLabel: 'Mon 25 May', dateKey: '2026-05-25', countdown: 'Next week' },
  { id: 'summer-bank', name: 'Summer bank holiday', dateLabel: 'Mon 31 Aug', dateKey: '2026-08-31', countdown: 'In 15 weeks' },
];

export const nextHoliday = upcomingHolidays[0];
