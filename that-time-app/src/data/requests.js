// Team requests submitted from the staff side — time off and shift swaps.
// Owners approve or decline them from Team → Schedule. Swaps are agreed
// between colleagues first (peer_accepted), then come to the owner.

export const demoTeamRequests = [
  {
    id: 'req1',
    type: 'time_off',
    memberId: 's2',
    label: 'Family wedding',
    dates: 'Fri 22 May',
    day: 'Fri',
    submitted: '2 hours ago',
    note: 'Happy to move my Friday clients to Saturday morning.',
    status: 'pending',
  },
  {
    id: 'req2',
    type: 'swap',
    memberId: 's4',
    withMemberId: 's1',
    label: 'Shift swap',
    dates: 'Thu 21 May',
    day: 'Thu',
    submitted: 'Yesterday',
    note: 'Alex covers Sam’s Thursday shift. Sam takes Alex’s next Saturday in return.',
    status: 'peer_accepted',
  },
  {
    id: 'req3',
    type: 'time_off',
    memberId: 's8',
    label: 'Holiday',
    dates: 'Mon 1 - Fri 5 Jun',
    day: null,
    submitted: '3 days ago',
    note: 'Booked flights — happy to prep cover notes for my classes.',
    status: 'pending',
  },
];
