// Demo data for Messages. Copy matches the Figma "Main screens / Messages"
// frames — the Emily Davis thread is the fully-designed conversation.

export const messageFilters = ['All', 'Unread 3', 'Group 2', 'Business 0'];

export const conversationList = [
  {
    id: 'sarah-johnson',
    initials: 'SJ',
    name: 'Sarah Johnson',
    preview: 'Thanks! See you then 😊',
    time: '3 Mar, 14:30',
  },
  {
    id: 'team-chat',
    initials: ['SJ', 'AB', 'MD'],
    name: 'Team chat',
    preview: 'Thanks! See you Soon',
    time: '3 Mar, 14:30',
    group: true,
  },
  {
    id: 'managers',
    initials: ['ES', 'AM'],
    name: 'Managers',
    preview: 'Rota for next week is up',
    time: 'Today, 08:12',
    group: true,
  },
  {
    id: 'emily-davis',
    initials: 'ED',
    name: 'Emily Davis',
    preview: "Maybe Thursday the 9th? I'll confirm later today",
    time: 'Today, 09:45',
    unread: 2,
  },
  {
    id: 'hair-saloon',
    initials: 'HS',
    name: 'Hair saloon',
    preview: 'Perfect lets collaborate on Monday',
    time: '3 Mar, 14:30',
    business: true,
  },
  {
    id: 'lisa-anderson',
    initials: 'LA',
    name: 'Lisa Anderson',
    preview: 'Perfect, see you there!',
    time: '27 Feb, 12:18',
  },
  {
    id: 'robert-lee',
    initials: 'RL',
    name: 'Robert Lee',
    preview: 'Yes definitely! Can I come in next week?',
    time: '2 Mar, 14:22',
    unread: 1,
  },
];

const emilyDavis = {
  id: 'emily-davis',
  initials: 'ED',
  name: 'Emily Davis',
  phone: '(555) 012-3456',
  appointment: {
    banner: 'Appointment Rescheduled',
    service: 'Blow Dry & Style',
    date: '14 April, 2026',
    time: '13:00 – 14:00',
  },
  messages: [
    { id: 'm1', from: 'client', text: 'Hi, can I move my April appointment to the week after?', meta: 'Today, 09:14 · SMS' },
    { id: 'm2', from: 'business', text: 'Of course! What date works best?', meta: 'Today, 09:31 · SMS', action: 'Select a date' },
    { id: 'm3', from: 'client', text: "Maybe Thursday the 9th? I'll confirm later today", meta: 'Today, 09:45 · SMS' },
    {
      id: 'm4',
      from: 'system',
      title: 'Appointment Rescheduled !',
      service: 'Blow Dry & Style',
      price: '£55',
      previous: '15 March, 2026 at 10:00',
      next: { date: '10 March, 2026', time: '11:00' },
    },
    { id: 'm5', from: 'business', text: 'Perfect see you then !', meta: 'Today, 09:31 · SMS' },
  ],
  suggestions: ['Your appointment is tomorrow!', 'We have availability this week', 'Time to rebook?'],
};

// Threads other than Emily Davis reuse her appointment card layout with their
// own identity and last message (prototype filler). Team & business threads
// have no appointment card.
export function getConversation(id) {
  const entry = conversationList.find((c) => c.id === id);
  if (!entry || id === 'emily-davis') return emilyDavis;
  const internal = entry.group || entry.business;
  return {
    ...emilyDavis,
    id: entry.id,
    initials: Array.isArray(entry.initials) ? entry.initials[0] : entry.initials,
    name: entry.name,
    phone: internal
      ? entry.group
        ? `${Array.isArray(entry.initials) ? entry.initials.length : 2} members`
        : 'Business'
      : emilyDavis.phone,
    internal,
    appointment: internal ? null : emilyDavis.appointment,
    suggestions: internal
      ? ['On it 👍', 'Can someone cover 13:00?', 'See you Monday']
      : emilyDavis.suggestions,
    messages: internal
      ? [
          { id: 'm1', from: 'client', text: entry.preview, meta: `${entry.time}` },
          { id: 'm2', from: 'business', text: 'Sounds good — thanks all!', meta: 'Today, 09:31' },
        ]
      : [
          { id: 'm1', from: 'client', text: entry.preview, meta: `${entry.time} · SMS` },
          { id: 'm2', from: 'business', text: 'Perfect see you then !', meta: 'Today, 09:31 · SMS' },
        ],
  };
}
