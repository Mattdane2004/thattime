import { useParams } from 'react-router-dom';
import { getClientDetail } from '../../../data/clientsDirectory';
import { useMainActions } from '../../../components/sheets/MainActionsContext';

// Build the empty-profile variant for clients added this session.
function addedProfile(added, base) {
  return {
    ...base,
    id: added.id,
    initials: added.initials,
    name: added.name,
    rating: null,
    conversationId: added.id,
    source: 'manual',
    joined: 'today',
    staffAlert: null,
    listTags: added.tags || [],
    topUp: null,
    profileNotes: [],
    allergies: added.note
      ? [{ id: 'seed', name: added.note, type: 'Non-drug', severity: 'Mild', reaction: '', patchTestRequired: false }]
      : [],
    patchTests: [],
    files: [],
    wallet: { balance: 0, transactions: [] },
    loyalty: { points: 0, tier: 'New', caption: '£1 spent = 2 points' },
    details: {
      phone: added.phone || '',
      email: added.email || '',
      address: added.address || '',
      birthday: added.birthday || '',
      pronouns: added.pronouns || '',
      occupation: added.occupation || '',
      emergencyContact: { name: '', phone: '' },
    },
    overview: {
      stats: [
        { label: 'Last Visit', value: '—' },
        { label: 'Total Bookings', value: '0' },
        { label: 'Client Since', value: 'Mar 2026' },
      ],
      nextAppointment: null,
      allergies: [],
      contact: {
        phone: added.phone || 'Not added',
        email: added.email || 'Not added',
        address: added.address || 'Not added',
      },
    },
    bookings: { pastCount: '0 past appointments', items: [] },
    forms: { summary: 'No forms yet', pending: '0 pending', notSent: '0 not sent', items: [] },
    reviews: { average: '—', count: '(no reviews)', items: [] },
  };
}

// Merge the seeded profile with session-added extras (quick-adds, block state).
export function useClient() {
  const { clientId } = useParams();
  const { extraClients, blockedClients, clientExtras } = useMainActions();
  const added = extraClients.find((c) => c.id === clientId);
  const base = getClientDetail(clientId);
  const client = added ? addedProfile(added, base) : base;
  const extras = clientExtras[clientId] || {};

  return {
    clientId,
    client,
    blocked: blockedClients.includes(clientId),
    allergies: [...(client.allergies || []), ...(extras.allergies || [])],
    patchTests: [...(client.patchTests || []), ...(extras.patchTests || [])],
    notes: [...(extras.notes || []), ...(client.profileNotes || [])],
    tags: [...(client.listTags || []), ...(extras.tags || [])],
    files: [...(client.files || []), ...(extras.files || [])],
    staffAlert: extras.staffAlert !== undefined ? extras.staffAlert : client.staffAlert,
  };
}


export const SEVERITY_TONES = {
  Mild: 'bg-gray-100 text-gray-600',
  Moderate: 'bg-amber-50 text-amber-600',
  Severe: 'bg-gray-900 text-white',
};

export const RESULT_TONES = {
  Passed: 'bg-green-50 text-green-600',
  Pending: 'bg-amber-50 text-amber-600',
  Failed: 'bg-gray-900 text-white',
};
