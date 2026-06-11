// Seed data for Variants module — 22 items across 4 types.
// Used to prove the scale handling (groups, "Show N more", filter pills).

export const variantTypes = [
  { key: 'duration', label: 'Duration', desc: 'Same service at different lengths' },
  { key: 'staff', label: 'Staff', desc: 'Same service, different team member' },
  { key: 'time', label: 'Time & date', desc: 'Same service, different days/times' },
  { key: 'location', label: 'Location', desc: 'Same service, different place' },
];

export const demoVariants = [
  // Duration (6)
  { id: 'v1', type: 'duration', name: 'Quick trim', durationDelta: -15, priceDelta: -10 },
  { id: 'v2', type: 'duration', name: 'Standard', durationDelta: 0, priceDelta: 0 },
  { id: 'v3', type: 'duration', name: 'Extended', durationDelta: 15, priceDelta: 10 },
  { id: 'v4', type: 'duration', name: 'Deluxe 90 min', durationDelta: 30, priceDelta: 20 },
  { id: 'v5', type: 'duration', name: 'Express 30 min', durationDelta: -30, priceDelta: -20 },
  { id: 'v6', type: 'duration', name: 'Weekend double', durationDelta: 60, priceDelta: 35 },

  // Staff (5)
  { id: 'v7', type: 'staff', name: 'With Alex (senior)', staffId: 's1', priceDelta: 15 },
  { id: 'v8', type: 'staff', name: 'With Priya', staffId: 's2', priceDelta: 0 },
  { id: 'v9', type: 'staff', name: 'With Jordan (colour)', staffId: 's3', priceDelta: 5 },
  { id: 'v10', type: 'staff', name: 'With Sam', staffId: 's4', priceDelta: 0 },
  { id: 'v11', type: 'staff', name: 'With Nina (apprentice)', staffId: 's5', priceDelta: -10 },

  // Time & date (7)
  { id: 'v12', type: 'time', name: 'Weekday morning', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], from: '09:00', to: '12:00', priceDelta: -5 },
  { id: 'v13', type: 'time', name: 'Weekday evening', days: ['Mon', 'Tue', 'Wed', 'Thu'], from: '17:00', to: '20:00', priceDelta: 5 },
  { id: 'v14', type: 'time', name: 'Weekend', days: ['Sat', 'Sun'], from: '09:00', to: '18:00', priceDelta: 10 },
  { id: 'v15', type: 'time', name: 'Late Friday', days: ['Fri'], from: '18:00', to: '22:00', priceDelta: 8 },
  { id: 'v16', type: 'time', name: 'Sunday only', days: ['Sun'], from: '10:00', to: '16:00', priceDelta: 15 },
  { id: 'v17', type: 'time', name: 'Early bird', days: ['Mon', 'Wed', 'Fri'], from: '07:00', to: '09:00', priceDelta: -8 },
  { id: 'v18', type: 'time', name: 'Midweek special', days: ['Tue', 'Wed'], from: '14:00', to: '17:00', priceDelta: -6 },

  // Location (4)
  { id: 'v19', type: 'location', name: 'In-salon', location: 'inSalon', priceDelta: 0 },
  { id: 'v20', type: 'location', name: 'Mobile (home)', location: 'mobile', priceDelta: 15 },
  { id: 'v21', type: 'location', name: 'Mobile (event)', location: 'mobile', priceDelta: 30 },
  { id: 'v22', type: 'location', name: 'Remote consult', location: 'remote', priceDelta: -10 },
];
