// Demo data for the Notifications feed screen. Core items match the Figma
// "Main screens / Notifications" frame; Messages / Updates / Blogs /
// Favourites content extends the hub per client feedback.

export const feedFilters = [
  'All',
  'Appointments',
  'Messages',
  'Reviews',
  'Favourites',
  'Blogs',
  'Updates',
];

export const feedGroups = [
  {
    label: 'Today',
    items: [
      {
        id: 't1',
        kind: 'message-request',
        initials: 'CM',
        category: 'Messages',
        title: 'Message request',
        text: 'Chloe Martin wants to message Salon Soho — she found you through search.',
      },
      {
        id: 't2',
        kind: 'update',
        category: 'Updates',
        title: 'New in ThatTime',
        text: 'Week view is here — see your whole week at a glance in the Schedule.',
        cta: 'Try it',
        to: '/schedule?view=calendar',
      },
      {
        id: 't3',
        kind: 'favourite',
        initials: 'AW',
        category: 'Favourites',
        title: 'New favourite',
        text: 'Amanda White added Salon Soho to her favourites.',
      },
    ],
  },
  {
    label: 'Yesterday',
    items: [
      {
        id: 'n1',
        initials: 'FD',
        icon: 'cancel',
        category: 'Appointments',
        title: 'Cancellation Request',
        text: 'James Smith Canceled Facial Treatment at 10:00 - 24/11/26',
      },
      {
        id: 'n2',
        initials: 'HD',
        icon: 'booking',
        category: 'Appointments',
        title: 'New Booking',
        text: 'Michael Brown Booked Haircut & Beard Trim at 11:00 - 26/11/26',
      },
      {
        id: 'b1',
        kind: 'blog',
        category: 'Blogs',
        title: 'From the ThatTime blog',
        text: '5 ways to fill last-minute gaps in your calendar',
        meta: '4 min read',
      },
      {
        id: 'n3',
        initials: 'ID',
        icon: 'feedback',
        category: 'Reviews',
        title: 'Client Feedback',
        text: 'Jessica White Left Review: "Amazing service! Will come back!" on 22/11/26',
      },
    ],
  },
  {
    label: '23 January',
    items: [
      {
        id: 'n4',
        initials: 'GD',
        icon: 'reschedule',
        category: 'Appointments',
        title: 'Rescheduled Appointment',
        text: 'Sarah Johnson Rescheduled Manicure to 15:00 - 25/11/26',
      },
      {
        id: 'b2',
        kind: 'blog',
        category: 'Blogs',
        title: 'From the ThatTime blog',
        text: 'Pricing psychology: what your service menu says about you',
        meta: '6 min read',
      },
      {
        id: 'n5',
        initials: 'FD',
        icon: 'cancel',
        category: 'Appointments',
        title: 'Cancelled Booking',
        text: 'John Smith Cancelled Haircut at 10:00 - 22/11/26',
      },
      {
        id: 'u2',
        kind: 'update',
        category: 'Updates',
        title: 'ThatTime update',
        text: 'Faster checkout, client merge tools and bug fixes in version 3.2.',
        cta: "What's new",
        to: null,
      },
      {
        id: 'n6',
        initials: 'GD',
        icon: 'reschedule',
        category: 'Appointments',
        title: 'Rescheduled Booking',
        text: 'Lisa Brown Rescheduled Facial to 15:00 - 24/11/26',
      },
    ],
  },
];
