// Demo data for the Home screen — copy matches the Figma "Main screens / Home" frame.

export const homeHeader = {
  location: 'Salon Soho',
  date: 'Wednesday 4 March',
  greeting: 'Good afternoon, Emma',
  hours: '09:00 – 17:00',
  userInitials: 'ES',
  avatarInitials: 'SJ',
};

// Owner sees revenue; staff see their own day.
export const ownerStats = [
  { label: 'Revenue', value: '£349' },
  { label: 'Next gap', value: '12:30' },
  { label: 'Booked', value: '70%' },
];

export const staffStats = [
  { label: 'Appointments', value: '9' },
  { label: 'Next gap', value: '12:30' },
  { label: 'Booked', value: '70%' },
];

export const homeStats = staffStats;

// The live appointment queue behind the Up Next card. Completing or
// cancelling an appointment advances to the next one.
export const upNextQueue = [
  {
    context: 'Gap',
    time: '11:00 AM',
    duration: '1h 30m',
    countdown: 'In 5min',
    initials: 'SJ',
    client: 'Sarah Johnson',
    service: 'Cut & Colour · Emma S.',
    tags: [
      { icon: 'allergy', label: 'Allergy' },
      { icon: 'form', label: 'Form', extra: 'Note attached' },
    ],
    bookingId: 'sarah-johnson',
    amount: '140',
  },
  {
    context: 'Appointment',
    time: '13:00',
    duration: '1h',
    countdown: 'At 13:00',
    initials: 'LA',
    client: 'Lisa Anderson',
    service: 'Blow Dry & Style · Emma S.',
    tags: [],
    bookingId: 'lisa-anderson',
    amount: '55',
  },
  {
    context: 'Appointment',
    time: '14:30',
    duration: '2h',
    countdown: 'Later today',
    initials: 'ED',
    client: 'Emily Davis',
    service: 'Cut & Colour · Emma S.',
    tags: [],
    bookingId: 'emily-davis',
    amount: '210',
  },
];

export const upNext = {
  context: 'Gap',
  time: '11:00 AM',
  duration: '1h 30m',
  countdown: 'In 5min',
  initials: 'SJ',
  client: 'Sarah Johnson',
  service: 'Cut & Colour · Emma S.',
  tags: [
    { icon: 'allergy', label: 'Allergy' },
    { icon: 'form', label: 'Form', extra: 'Note attached' },
  ],
  scheduleCount: 3,
};

export const needsAttention = [
  {
    id: 'no-show',
    title: 'No-show',
    detail: 'Michael Chen · Alex Martinez · 10:30 AM',
    action: 'View',
    done: 'Viewed',
  },
  {
    id: 'form',
    title: 'Consultation form not completed',
    detail: 'Jessica Brown · 11:30 AM',
    action: 'Send Reminder',
    done: 'Sent',
  },
  {
    id: 'holiday',
    title: 'Holiday request pending',
    detail: 'Emma Stevens · 3–7 July',
    action: 'Approve',
    done: 'Approved',
  },
];

export const teamToday = {
  count: '4/6',
  members: [
    { id: 'emma-k-1', initials: 'ES', name: 'Emma K', detail: '09:00 – 17:00 · Stylist', status: 'With client' },
    { id: 'emma-k-2', initials: 'ES', name: 'Emma K', detail: '09:00 – 17:00 · Stylist', status: 'On lunch' },
    { id: 'jordan-1', initials: 'ES', name: 'Jordan Kelly', detail: '11:00 – 17:00 · Junior Stylist', status: 'With Client' },
    { id: 'jordan-2', initials: 'ES', name: 'Jordan Kelly', detail: '11:00 – 17:00 · Stylist', status: 'Called in Sick' },
  ],
  warning: 'Called in sick — not yet covered',
};

export const upcomingShifts = [
  { id: 'today', title: 'Today', detail: '09:00 – 17:00 · Main Studio', badge: 'Now' },
  { id: 'tomorrow', title: 'Tomorrow', detail: '10:00 – 18:00 · Main Studio' },
  { id: 'fri', title: 'Fri 7 Mar', detail: '09:00 – 15:00 · Main Studio' },
];

export const timeOff = [
  { id: 'annual', title: 'Mon 10 – Tue 11 Mar', detail: 'Annual Leave', badge: 'Approved' },
  { id: 'doctors', title: 'Fri 21 Mar', detail: 'Doctors', badge: 'Pending' },
];
