// Demo data for the Clients screens. Copy matches the Figma
// "Main screens / Client" frames (list + Sarah Johnson detail).

export const clientList = [
  {
    id: 'emily-davis',
    initials: 'ED',
    name: 'Emily Davis',
    rating: '4.9',
    schedule: 'Next: 2 Apr, 14:30',
    tags: [{ label: 'Regular', tone: 'light' }],
  },
  {
    id: 'amanda-white',
    initials: 'AW',
    name: 'Amanda White',
    rating: '4.3',
    schedule: 'Next: 2 Apr, 17:30',
    tags: [{ label: 'Regular', tone: 'light' }],
  },
  {
    id: 'jessica-brown',
    initials: 'JB',
    name: 'Jessica Brown',
    rating: '4.5',
    schedule: 'Next: 3 Apr, 14:30',
    tags: [
      { label: 'VIP', tone: 'light' },
      { label: 'Allergy', tone: 'dark' },
    ],
  },
  {
    id: 'michael-chen',
    initials: 'MC',
    name: 'Michael Chen',
    rating: '2.1',
    schedule: 'Last: 20 Feb 2026',
    tags: [{ label: 'Blocked', tone: 'mid' }],
    muted: true,
  },
  {
    id: 'patricia-taylor',
    initials: 'PT',
    name: 'Patricia Taylor',
    schedule: 'Last: 5 Feb 2026',
    tags: [],
  },
  {
    id: 'christopher-garcia',
    initials: 'CG',
    name: 'Christopher Garcia',
    schedule: 'Last: 2 Jan 2026',
    tags: [{ label: 'Inactive', tone: 'light' }],
  },
  {
    id: 'christopher-garcia-2',
    initials: 'CG',
    name: 'Christopher Garcia',
    schedule: 'Last: 2 Jan 2026',
    tags: [{ label: 'Inactive', tone: 'light' }],
  },
];

export const clientCount = '11 clients';

const sarahJohnson = {
  id: 'sarah-johnson',
  initials: 'SJ',
  name: 'Sarah Johnson',
  status: 'Active',
  rating: '4.8',
  conversationId: 'sarah-johnson',
  // How the profile came to exist — most clients join by booking via the app.
  source: 'app',
  joined: 'Jan 2024',
  staffAlert: null,
  listTags: [{ label: 'VIP', tone: 'light' }],
  details: {
    phone: '(555) 234-5678',
    email: 'sarah.j@email.com',
    address: '14 Maple Lane, London',
    birthday: '14 June',
    pronouns: 'She / her',
    occupation: 'Teacher',
    emergencyContact: { name: 'Tom Johnson', phone: '(555) 234-9911' },
  },
  allergies: [
    {
      id: 'al1',
      name: 'PPD (hair dye)',
      type: 'Drug',
      severity: 'Severe',
      reaction: 'Scalp irritation and swelling',
      patchTestRequired: true,
    },
    {
      id: 'al2',
      name: 'Sensitive scalp',
      type: 'Non-drug',
      severity: 'Mild',
      reaction: 'Redness after colour treatments',
      patchTestRequired: false,
    },
  ],
  patchTests: [
    {
      id: 'pt1',
      product: 'Colour Treatment',
      date: '15 Jan 2026',
      result: 'Passed',
      retest: 'Retest due 15 Jul 2026',
    },
  ],
  files: [
    { id: 'f1', name: 'Colour consent.pdf', meta: 'PDF · 15 Jan 2024' },
    { id: 'f2', name: 'Inspiration photo', meta: 'Image · 10 Feb 2026' },
  ],
  wallet: {
    balance: 40,
    transactions: [
      { id: 'w1', label: 'Gift card top-up', date: '10 Feb 2026', amount: '+£60' },
      { id: 'w2', label: 'Cut & Style', date: '3 Mar 2026', amount: '−£20' },
    ],
  },
  loyalty: { points: 320, tier: 'Gold', caption: '£1 spent = 2 points · Platinum at 500' },
  overview: {
    stats: [
      { label: 'Last Visit', value: '3 Mar 2026' },
      { label: 'Total Bookings', value: '24' },
      { label: 'Client Since', value: 'Jan 2024' },
    ],
    nextAppointment: {
      service: 'Cut & Style',
      detail: '18 Mar 2026 · Emma S. · 60min · £85',
    },
    allergies: ['Sensitive scalp', 'PPD allergy'],
    contact: {
      phone: '(555) 234-5678',
      email: 'sarah.j@email.com',
      address: '14 Maple Lane, London',
    },
  },
  forms: {
    summary: '4 forms across all appointments',
    pending: '1 pending',
    notSent: '1 not sent',
    items: [
      {
        id: 'consultation',
        name: 'Consultation Form',
        meta: 'Consent · 15 Jan 2024',
        linked: 'Cut & Style — 3 Mar 2026',
        action: 'View',
      },
      {
        id: 'allergy',
        name: 'Allergy Questionnaire',
        meta: 'Medical · 15 Jan 2024',
        linked: 'Cut & Style — 3 Mar 2026',
        action: 'View',
      },
      {
        id: 'aftercare',
        name: 'Aftercare Instructions',
        meta: 'Aftercare · 16 Mar 2026',
        linked: 'Cut & Style — 18 Mar 2026',
        action: 'Remind',
      },
      {
        id: 'checklist',
        name: 'Pre-Appointment Checklist',
        meta: 'Intake · Not sent',
        linked: 'Cut & Style — 18 Mar 2026',
        action: 'Not Sent',
      },
    ],
  },
  topUp: {
    title: 'Colour top-up due',
    detail: 'Recommended 6 weeks after Cut & Colour · due 14 Apr',
    service: 'Cut & Colour',
  },
  bookings: {
    pastCount: '4 past appointments',
    items: [
      {
        id: 'b1',
        service: 'Cut & Style',
        detail: '3 Mar 2026 · Emma S. · 60min · £85',
        status: 'Completed',
        unpaid: '£85',
        record: {
          notes: [
            { time: '3 Mar 2026, 16:45 · Emma S.', text: 'Used 20 vol developer. Wants to go lighter gradually next visit.' },
          ],
          images: ['Before', 'During', 'After'],
        },
      },
      {
        id: 'b2',
        service: 'Cut & Style',
        detail: '10 Feb 2026 · Emma S. · 60min · £85',
        status: 'Completed',
        record: {
          notes: [
            { time: '10 Feb 2026, 15:10 · Emma S.', text: 'Patch test done — no reaction after 48h.' },
          ],
          images: ['Before', 'After'],
        },
      },
      { id: 'b3', service: 'Cut & Blow Dry', detail: '20 Jan 2026 · Emma S. · 45min · £75', status: 'Completed', record: { notes: [], images: [] } },
      { id: 'b4', service: 'Cut & Style', detail: '9 Dec 2025 · Alex M. · 60min · £85', status: 'Cancelled' },
    ],
  },
  profileNotes: [
    { time: '15 Jan 2026, 09:20 · Emma S.', text: 'Prefers quiet appointments — book the corner chair when possible.' },
  ],
  reviews: {
    average: '4.7',
    count: '(3 reviews)',
    items: [
      { id: 'r1', stars: 5, date: '3 Mar 2026', text: 'Absolutely love my new colour! Emma always knows exactly what I want.', service: 'Cut & Style' },
      { id: 'r2', stars: 5, date: '10 Feb 2026', text: 'Great experience as always. Very relaxing atmosphere.', service: 'Cut & Style' },
      { id: 'r3', stars: 4, date: '20 Jan 2026', text: 'Lovely cut, just took a bit longer than expected.', service: 'Cut & Blow Dry' },
    ],
  },
};

// Per-client tweaks layered over the filler profile.
const profileOverrides = {
  'jessica-brown': {
    staffAlert: 'Always confirm by phone — texts often bounce',
    source: 'manual',
    joined: 'Mar 2025',
  },
  'michael-chen': { source: 'app', joined: 'Nov 2025' },
};

// Every list entry resolves to a detail record so each card opens a profile.
// Sarah Johnson is the fully-designed profile; the rest reuse her layout with
// their own header identity (prototype filler).
export function getClientDetail(id) {
  const listEntry = clientList.find((c) => c.id === id);
  if (!listEntry || id === 'sarah-johnson') return sarahJohnson;
  return {
    ...sarahJohnson,
    id: listEntry.id,
    initials: listEntry.initials,
    name: listEntry.name,
    rating: listEntry.rating || sarahJohnson.rating,
    conversationId: listEntry.id,
    listTags: listEntry.tags,
    ...(profileOverrides[id] || {}),
  };
}

export { sarahJohnson };
