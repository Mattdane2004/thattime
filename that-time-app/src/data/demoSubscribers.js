export const demoSubscribers = [
  { id: 'sub_1', name: 'Gold membership', activeCount: 8 },
  { id: 'sub_2', name: 'Silver membership', activeCount: 4 },
  { id: 'sub_3', name: 'VIP annual', activeCount: 2 },
];

export const totalActiveSubscribers = demoSubscribers.reduce(
  (sum, s) => sum + s.activeCount,
  0
); // 14
