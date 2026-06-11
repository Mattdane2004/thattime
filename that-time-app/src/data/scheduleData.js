// Demo data for the Schedule screens (My Day / Calendar / Team views) and the
// booking details sheet. Copy matches the Figma "Main screens / Schedule" frames.

export const scheduleDate = 'Tuesday 3 March';

// The schedule's "designed" day is Tuesday 3 March 2026; the date pager can
// step across the whole month, with booking data for the week of 2–8 March.
export const DESIGNED_DAY = 3;

export function getDayLabel(day, month = 2) {
  const date = new Date(2026, month, day);
  const weekday = date.toLocaleDateString('en-GB', { weekday: 'long' });
  const monthLabel = date.toLocaleDateString('en-GB', { month: 'long' });
  return `${weekday} ${day} ${monthLabel}`;
}

export function getDayShort(day, month = 2) {
  const date = new Date(2026, month, day);
  return {
    day: date.toLocaleDateString('en-GB', { weekday: 'short' }),
    date: String(day),
  };
}

export const parseTimeToMinutes = (time) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

// ----- My Day view ------------------------------------------------------------

export const myDayTimeline = [
  { id: 'past-1', kind: 'past', time: '09:00', client: 'Sarah Johnson', service: 'Cut & Style', badge: 'Paid' },
  { id: 'past-2', kind: 'past', time: '09:00', client: 'Sarah Johnson', service: 'Cut & Style', badge: 'Paid' },
  { id: 'now', kind: 'now' },
  { id: 'lunch', kind: 'break', time: '10:00', label: 'Lunch Break', duration: '60m' },
  { id: 'up-next', kind: 'upNext' },
  { id: 'appt-1', kind: 'appointment', bookingId: 'lisa-anderson', start: '13:00', end: '14:00', client: 'Lisa Anderson', service: 'Blow Dry & Style' },
  { id: 'gap-1', kind: 'gap', time: '14:00', label: '30min open' },
  { id: 'appt-2', kind: 'appointment', bookingId: 'lisa-anderson', start: '13:00', end: '14:00', client: 'Lisa Anderson', service: 'Blow Dry & Style' },
  { id: 'appt-3', kind: 'appointment', bookingId: 'lisa-anderson', start: '13:00', end: '14:00', client: 'Lisa Anderson', service: 'Blow Dry & Style' },
  { id: 'gap-2', kind: 'gap', time: '16:30', label: '30min open' },
  { id: 'end', kind: 'end', label: 'End of shift · 17:00' },
  { id: 'class-1', kind: 'class', classId: 'colour-masterclass' },
];

// ----- Calendar view ------------------------------------------------------------
// Blocks per day-of-month (March 2026), minutes from 08:00. Data pulled from the
// designed week in the Figma frames (3-day view + the older week view).

export const weekCalendar = {
  2: [
    { id: 'np', start: 90, length: 45, client: 'Nina Patel', service: 'Blow Dry', tone: 'dark' },
    { id: 'og', start: 180, length: 60, client: 'Oliver Grant', service: 'Cut & Style', tone: 'dark' },
    { id: 'sc', start: 360, length: 60, client: 'Sophie Clark', service: 'Colour Touch-Up', tone: 'dark' },
  ],
  3: [
    { id: 'sj', start: 60, length: 60, client: 'Sarah Johnson', service: 'Cut & Style', tone: 'past' },
    { id: 'lunch', start: 120, length: 60, client: 'Lunch Break', service: '60m', tone: 'break' },
    { id: 'jb', start: 180, length: 120, client: 'Jessica Brown', service: 'Colour Treatment', tone: 'dark', bookingId: 'jessica-brown' },
    { id: 'la', start: 300, length: 60, client: 'Lisa Anderson', service: 'Blow Dry & Style', tone: 'mid', bookingId: 'lisa-anderson' },
    { id: 'ed', start: 390, length: 120, client: 'Emily Davis', service: 'Cut & Colour', tone: 'dark' },
    { id: 'cls1', start: 540, length: 90, client: 'Colour Masterclass', service: 'Class · 6/8', tone: 'class', classId: 'colour-masterclass' },
  ],
  4: [
    { id: 'gl', start: 120, length: 60, client: 'Grace Lee', service: 'Highlights', tone: 'dark' },
    { id: 'jp', start: 240, length: 45, client: 'Jake Porter', service: 'Haircut', tone: 'dark' },
    { id: 'cm', start: 390, length: 60, client: 'Chloe Martin', service: 'Cut & Style', tone: 'mid' },
  ],
  5: [
    { id: 'ab', start: 60, length: 60, client: 'Aiden Brooks', service: 'Cut & Style', tone: 'dark' },
    { id: 'et', start: 150, length: 90, client: 'Ella Thompson', service: 'Full Colour & Cut', tone: 'dark' },
    { id: 'ls', start: 300, length: 45, client: 'Liam Scott', service: 'Haircut', tone: 'dark' },
    { id: 'za', start: 390, length: 30, client: 'Zara Ali', service: '', tone: 'mid' },
    { id: 'he', start: 480, length: 60, client: 'Harry Evans', service: 'Cut & Beard', tone: 'dark' },
    { id: 'cls2', start: 600, length: 90, client: 'Beginners Cutting Class', service: 'Class · 4/10', tone: 'class', classId: 'beginners-cutting' },
  ],
  6: [
    { id: 'ic', start: 60, length: 60, client: 'Isla Cooper', service: 'Cut & Style', tone: 'dark' },
    { id: 'mt', start: 150, length: 60, client: 'Max Turner', service: 'Haircut', tone: 'dark' },
  ],
  7: [
    {
      id: 'bp',
      kind: 'bundle',
      bundleId: 'bridal-package',
      start: 60,
      length: 225,
      client: 'Bridal Package',
      service: 'Bundle · 3 services',
      tone: 'bundle',
    },
    { id: 'rl', start: 480, length: 45, client: 'Robert Lee', service: 'Haircut', tone: 'dark' },
  ],
  8: [],
};

// ----- Calendar (3 day) view (legacy static columns) ----------------------------

export const threeDayColumns = [
  {
    day: 'Thu',
    date: '12',
    blocks: [
      { id: 'sj', start: 60, length: 60, client: 'Sarah Johnson', service: 'Cut & Style', tone: 'past' },
      { id: 'lunch', start: 120, length: 60, client: 'Lunch Break', service: '60m', tone: 'break' },
      { id: 'jb', start: 180, length: 120, client: 'Jessica Brown', service: 'Colour Treatment', tone: 'dark' },
      { id: 'la', start: 300, length: 60, client: 'Lisa Anderson', service: 'Blow Dry & Style', tone: 'mid' },
      { id: 'ed', start: 390, length: 120, client: 'Emily Davis', service: 'Cut & Colour', tone: 'dark' },
    ],
  },
  {
    day: 'Fri',
    date: '13',
    blocks: [
      { id: 'ab', start: 60, length: 60, client: 'Aiden Brooks', service: 'Cut & Style', tone: 'dark' },
      { id: 'et', start: 150, length: 90, client: 'Ella Thompson', service: 'Full Colour & Cut', tone: 'dark' },
      { id: 'ls', start: 300, length: 45, client: 'Liam Scott', service: 'Haircut', tone: 'dark' },
      { id: 'za', start: 390, length: 30, client: 'Zara Ali', service: '', tone: 'mid' },
      { id: 'he', start: 480, length: 60, client: 'Harry Evans', service: 'Cut & Beard', tone: 'dark' },
    ],
  },
  {
    day: 'Sat',
    date: '14',
    blocks: [
      { id: 'ic', start: 60, length: 60, client: 'Isla Cooper', service: 'Cut & Style', tone: 'dark' },
      { id: 'mt', start: 150, length: 60, client: 'Max Turner', service: 'Haircut', tone: 'dark' },
    ],
  },
];

// ----- Team view --------------------------------------------------------------
// Hours rendered 09:00 – 17:00; top = minutes from 09:00.

export const teamColumns = [
  {
    id: 'emma',
    initials: 'ES',
    name: 'Emma S.',
    role: 'Senior Stylist',
    blocks: [
      { id: 'sj', start: 0, length: 60, time: '09:00', status: 'Done', client: 'Sarah Johnson', service: 'Cut & Style', meta: '60m · £85' },
      { id: 'lunch', start: 60, length: 60, kind: 'break', label: 'Lunch Break' },
      { id: 'jb', bookingId: 'jessica-brown', start: 120, length: 120, time: '11:00', status: 'Confirmed', client: 'Jessica Brown', service: 'Colour Treatment', meta: '120m · £180' },
      { id: 'la', start: 240, length: 60, time: '13:00', status: 'Confirmed', client: 'Lisa Anderson', service: 'Blow Dry & Style', meta: '60m · £55' },
      { id: 'ed', start: 330, length: 120, time: '14:30', status: 'Confirmed', client: 'Emily Davis', service: 'Cut & Colour', meta: '120m · £210' },
      { id: 'cls', kind: 'class', classId: 'colour-masterclass', start: 480, length: 90, time: '17:00', client: 'Colour Masterclass', meta: '6/8 booked' },
    ],
  },
  {
    id: 'alex',
    initials: 'AM',
    name: 'Alex M.',
    role: 'Barber',
    blocks: [
      { id: 'rl', start: 30, length: 45, time: '09:30', status: 'Done', client: 'Robert Lee' },
      { id: 'mc', start: 90, length: 45, time: '10:30', status: 'No-show', client: 'Michael Chen' },
      { id: 'lunch', start: 150, length: 60, kind: 'break', label: 'Lunch Break' },
      { id: 'jm', start: 300, length: 60, time: '14:00', status: 'Confirmed', client: 'James Miller' },
      { id: 'pt', start: 420, length: 60, time: '16:00', status: 'Confirmed', client: 'Patricia Taylor' },
    ],
  },
  {
    id: 'chris',
    initials: 'CT',
    name: 'Chris T.',
    role: 'Stylist',
    blocks: [
      { id: 'aw', start: 150, length: 60, time: '11:30', status: 'Confirmed', client: 'Amanda White' },
      { id: 'dw', start: 240, length: 60, time: '13:00', status: 'Unconfirmed', client: 'David Wilson' },
      { id: 'break', start: 330, length: 30, kind: 'break', label: 'Break' },
      { id: 'tm', start: 360, length: 60, time: '15:00', status: 'Confirmed', client: 'Thomas Moore' },
      { id: 'cg', start: 480, length: 60, time: '17:00', status: 'Confirmed', client: 'Chris Garcia' },
    ],
  },
  {
    id: 'sophie',
    initials: 'SL',
    name: 'Sophie L.',
    role: 'Off',
    blocks: [],
  },
];

export const teamRoster = [
  { id: 'emma', initials: 'ES', name: 'Emma S.', role: 'Senior Stylist' },
  { id: 'alex', initials: 'AM', name: 'Alex M.', role: 'Barber' },
  { id: 'chris', initials: 'CT', name: 'Chris T.', role: 'Stylist' },
  { id: 'sophie', initials: 'SL', name: 'Sophie L.', role: 'Stylist' },
  { id: 'kai', initials: 'KJ', name: 'Kai J.', role: 'Stylist' },
];

// ----- Booking details sheet --------------------------------------------------

export const bookingDetails = {
  'jessica-brown': {
    initials: 'JB',
    client: 'Jessica Brown',
    service: 'Colour Treatment',
    status: 'Confirmed',
    time: '11:00 – 13:00',
    duration: '120 min',
    staff: 'Emma S.',
    payment: '£180',
    paymentStatus: 'Unpaid',
    alerts: [
      { icon: 'form', label: 'Consultation form not completed' },
      { icon: 'warning', label: 'Sensitive scalp — patch test required', emphasis: true },
    ],
    note: 'First time colour, wants to go lighter',
    clientId: 'jessica-brown',
  },
  'lisa-anderson': {
    initials: 'LA',
    client: 'Lisa Anderson',
    service: 'Blow Dry & Style',
    status: 'Confirmed',
    time: '13:00 – 14:00',
    duration: '60 min',
    staff: 'Emma S.',
    payment: '£55',
    paymentStatus: 'Paid',
    alerts: [],
    note: '',
    clientId: 'lisa-anderson',
  },
  'sarah-johnson': {
    initials: 'SJ',
    client: 'Sarah Johnson',
    service: 'Cut & Colour',
    status: 'Confirmed',
    time: '11:00 – 12:30',
    duration: '90 min',
    staff: 'Emma S.',
    payment: '£140',
    paymentStatus: 'Unpaid',
    alerts: [
      { icon: 'warning', label: 'Allergy — see client notes', emphasis: true },
      { icon: 'form', label: 'Form — note attached' },
    ],
    note: '',
    clientId: 'sarah-johnson',
  },
  'emily-davis': {
    initials: 'ED',
    client: 'Emily Davis',
    service: 'Cut & Colour',
    status: 'Confirmed',
    time: '14:30 – 16:30',
    duration: '120 min',
    staff: 'Emma S.',
    payment: '£210',
    paymentStatus: 'Unpaid',
    alerts: [],
    note: 'Wants to keep the length, just refresh the colour',
    clientId: 'emily-davis',
  },
};

// ----- Class sessions -----------------------------------------------------------
// Seat-based classes (terminology from the Hub's Classes section): capacity,
// attendees with payment + waiver status, agenda, equipment. One teacher.

export const classSessions = {
  'colour-masterclass': {
    id: 'colour-masterclass',
    name: 'Colour Masterclass',
    format: 'Seat based class',
    time: '17:00 – 18:30',
    duration: '1h 30m',
    teacher: 'Emma S.',
    location: 'Main Studio',
    capacity: 8,
    price: '£65 per seat',
    agenda: [
      'Consultation & strand tests',
      'Mixing ratios and application',
      'Toning, gloss and aftercare',
    ],
    equipment: 'Bring your own tint brushes — colour kits and models provided.',
    attendees: [
      { id: 'a1', name: 'Maya Patel', initials: 'MP', payment: 'Paid in full', waiver: 'Waiver signed' },
      { id: 'a2', name: 'Theo Clarke', initials: 'TC', payment: 'Deposit paid', waiver: 'Waiver signed' },
      { id: 'a3', name: 'Isla Morgan', initials: 'IM', payment: 'Paid in full', waiver: 'Awaiting waiver' },
      { id: 'a4', name: 'Sofia Khan', initials: 'SK', payment: 'Paid in full', waiver: 'Waiver signed' },
      { id: 'a5', name: 'Robert Lee', initials: 'RL', payment: 'Unpaid', waiver: 'Waiver signed' },
      { id: 'a6', name: 'Grace Lee', initials: 'GL', payment: 'Paid in full', waiver: 'Waiver signed' },
    ],
  },
  'beginners-cutting': {
    id: 'beginners-cutting',
    name: 'Beginners Cutting Class',
    format: 'Seat based class',
    time: '18:00 – 19:30',
    duration: '1h 30m',
    teacher: 'Emma S.',
    location: 'Main Studio',
    capacity: 10,
    price: '£45 per seat',
    agenda: ['Sectioning basics', 'One-length cutting', 'Finishing and checking'],
    equipment: 'All tools provided. Closed shoes required.',
    attendees: [
      { id: 'b1', name: 'Nina Patel', initials: 'NP', payment: 'Paid in full', waiver: 'Waiver signed' },
      { id: 'b2', name: 'Jake Porter', initials: 'JP', payment: 'Deposit paid', waiver: 'Awaiting waiver' },
      { id: 'b3', name: 'Chloe Martin', initials: 'CM', payment: 'Paid in full', waiver: 'Waiver signed' },
      { id: 'b4', name: 'Oliver Grant', initials: 'OG', payment: 'Paid in full', waiver: 'Waiver signed' },
    ],
  },
};

// ----- Bundles ------------------------------------------------------------------
// A bundle is several services sold as one booking, run in order. The sheet
// shows them as a checklist timeline.

export const bundleSessions = {
  'bridal-package': {
    id: 'bridal-package',
    name: 'Bridal Package',
    client: 'Amanda White',
    initials: 'AW',
    clientId: 'amanda-white',
    start: '09:00',
    price: '£320',
    deposit: 'Deposit paid · £160 due',
    forms: [
      { id: 'bf1', name: 'Colour consultation', status: 'Completed' },
      { id: 'bf2', name: 'Allergy & patch test waiver', status: 'Pending' },
    ],
    services: [
      { name: 'Cut & Style', minutes: 60, staff: 'Emma S.', price: '£85' },
      { name: 'Colour Treatment', minutes: 120, staff: 'Emma S.', price: '£180' },
      { name: 'Blow Dry & Finish', minutes: 45, staff: 'Sophie L.', price: '£55' },
    ],
  },
};

// Generic booking record for calendar blocks without a hand-written one, so
// every block opens a sheet.
export function bookingFromBlock(block, staffName = 'Emma S.') {
  const startMins = 8 * 60 + block.start;
  const endMins = startMins + block.length;
  const fmt = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
  const slug = block.client.toLowerCase().replace(/[^a-z]+/g, '-');
  return {
    initials: block.client
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase(),
    client: block.client,
    service: block.service || 'Appointment',
    status: block.tone === 'past' ? 'Done' : 'Confirmed',
    time: `${fmt(startMins)} – ${fmt(endMins)}`,
    duration: `${block.length} min`,
    staff: staffName,
    payment: block.price || '£85',
    paymentStatus: block.tone === 'past' ? 'Paid' : 'Unpaid',
    alerts: [],
    note: '',
    clientId: slug,
  };
}

// ----- Calendar settings sheet ------------------------------------------------
// Dot colours for "jump to date" — index 0 = Sun 1 March, per the Figma frame.

export const jumpToDateDots = [
  'red',
  'green', 'amber', 'amber', 'green', 'green', 'red', 'red',
  'green', 'green', 'green', 'amber', 'none', 'red', 'amber',
  'red', 'green', 'red', 'red', 'red', 'red', 'red',
  'green', 'red', 'red', 'red', 'amber', 'red', 'red',
  'green', 'amber',
];
