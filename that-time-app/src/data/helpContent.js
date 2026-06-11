// Help content shown in HelpSheet, keyed by page/feature.
// Shape:
//   title: short page/feature name
//   summary: 1–2 sentences — the "what & why"
//   sections: [{ heading, body }] — deeper explanation per concept

export const helpContent = {
  /* ──────────────── Setup wizard ──────────────── */

  typeSelector: {
    title: 'What are you adding?',
    summary: 'All three types share the same setup — price, duration, staff, locations. They differ in how clients book them.',
    sections: [
      { heading: 'Service', body: 'A one-on-one appointment between a client and a single staff member. Most bookings fit here.' },
      { heading: 'Class', body: 'A group session — multiple attendees in the same time slot. Set a capacity and book by seat.' },
      { heading: 'Bundle', body: 'Multiple services sold together (e.g. cut + colour + blow dry). Priced as a package.' },
    ],
  },

  basics: {
    title: 'The basics',
    summary: 'The name, category, and description clients see when browsing. Make it easy for people to recognise what they\'re booking.',
    sections: [
      { heading: 'Name', body: 'Keep it short and descriptive — "Classic haircut" reads faster than "Our amazing haircut experience."' },
      { heading: 'Category', body: 'Used to filter the services list on the client side. Pick the closest fit, not a perfect match.' },
      { heading: 'Description', body: 'One or two sentences about what\'s included. Clients see this on the booking page just before they confirm.' },
    ],
  },

  locations: {
    title: 'Where is it offered?',
    summary: 'Pick one or more delivery methods. Each turns on its own fields for fine-tuning later.',
    sections: [
      { heading: 'In-salon', body: 'Takes place at one or more of your salons. You pick which ones if you have multiple.' },
      { heading: 'Mobile', body: 'Staff travel to the client. Set a radius, travel fee, and how much notice you need.' },
      { heading: 'Remote', body: 'Happens over a video call or phone — handy for consultations.' },
    ],
  },

  staff: {
    title: 'Who offers it?',
    summary: 'Staff selected here will be shown as options at booking. A service needs at least one staff member to be bookable.',
    sections: [
      { heading: 'Per-staff pricing', body: 'If different staff charge different rates, add a Staff variant later — same service, different prices by staff.' },
      { heading: 'Staff-only bookings', body: 'Staff can always book a service manually even if they\'re not in this list — this list is what clients see.' },
    ],
  },

  price: {
    title: 'Price & duration',
    summary: 'How much and how long. Deposits live here; cancellation policy and payment methods are in Service settings.',
    sections: [
      { heading: 'Price', body: 'The price shown at booking. Leave blank for free services (e.g. consultations).' },
      { heading: 'Duration', body: 'How long one booking takes. Buffer time (setup / cleanup between appointments) is configured separately in Service settings.' },
      { heading: 'Deposit', body: 'An amount taken at booking to hold the slot. Can be a fixed fee or a percentage.' },
    ],
  },

  /* ──────────────── Advanced features ──────────────── */

  variants: {
    title: 'Variants',
    summary: 'Offer the same service in different shapes — by duration, staff, time slot, or location. Each variant has its own price, duration, and optional rules.',
    sections: [
      { heading: 'Duration variants', body: 'Tiers like 30m / 60m / 90m at different prices.' },
      { heading: 'Staff variants', body: 'Charge more when booking a senior stylist vs an apprentice.' },
      { heading: 'Time variants', body: 'Weekend surcharge, off-peak discount, evening rates.' },
      { heading: 'Location variants', body: 'Different pricing at different salons.' },
      { heading: 'Availability rules', body: 'Every variant can be restricted to specific staff, days, or locations.' },
    ],
  },

  products: {
    title: 'Products',
    summary: 'Let clients pick from your product catalog at booking — for example "Which oil would you like?" A product question is a single choice shown to the client.',
    sections: [
      { heading: 'Why use it', body: 'Capture client preferences upfront so staff don\'t have to ask. Useful for oils, shampoos, treatments, polishes.' },
      { heading: 'Single vs multi-select', body: 'Single: client picks one. Multi: client picks any combination.' },
      { heading: 'Optional pricing', body: 'Each product can add an up-charge or extra duration. Leave both at zero if it\'s just a preference, no price change.' },
    ],
  },

  related: {
    title: 'Related services',
    summary: 'Bundle services that pair well together. All services in a group share one discount and one audience segmentation.',
    sections: [
      { heading: 'Group vs single', body: 'Groups are fast to configure — set the discount once, pick the services, done. One group = one rule.' },
      { heading: 'Audience targeting', body: 'Narrow who sees a group by gender, client history, or engagement. Leave dimensions empty to show it to everyone.' },
      { heading: 'Popularity badge', body: 'Shows "12 clients added this last month" under each suggestion at booking — social proof.' },
    ],
  },

  resources: {
    title: 'Resources',
    summary: 'Physical things the service needs to run — rooms and equipment. Each attachment reserves that resource for the booking plus any buffer time.',
    sections: [
      { heading: 'Rooms vs equipment', body: 'Rooms are where a service happens. Equipment is the tools used during it. Some equipment lives inside a specific room — selecting one auto-attaches the other.' },
      { heading: 'Reservation window', body: 'By default the resource is held for the whole booking. You can narrow to a partial window (e.g. steamer only for the first 15 min) so the rest is free for other bookings.' },
      { heading: 'Buffer time', body: 'Extra minutes held before / after the appointment — for cleaning, heating, or resetting the resource.' },
      { heading: 'Staff note', body: 'An internal note on each attachment. Visible to staff on the booking, never shown to clients.' },
    ],
  },

  forms: {
    title: 'Forms',
    summary: 'Intake forms and questionnaires clients complete before or at booking. Useful for consent, allergies, preferences, or medical history.',
    sections: [
      { heading: 'When forms send', body: 'Attach a form to a service; the client is prompted at booking (or reminded before the appointment).' },
      { heading: 'Required vs optional', body: 'Required forms block the booking until complete. Optional ones can be skipped.' },
    ],
  },

  serviceSettings: {
    title: 'Service settings',
    summary: 'Per-service overrides to your business defaults — booking rules, rescheduling, payment methods, cancellation policy.',
    sections: [
      { heading: 'How overrides work', body: 'Every inheritable setting shows "Default" until you change it. Tapping a row opens a sheet where you can set a custom value or reset back to the default.' },
      { heading: 'When to override', body: 'Most services can leave everything on default. Override only when this specific service has different rules — e.g. longer lead time for a group class, no refunds on a gift voucher.' },
      { heading: 'Access & visibility', body: 'Unlike the other sections, access settings are always set per-service — there\'s no business-level default to inherit from.' },
    ],
  },
};
