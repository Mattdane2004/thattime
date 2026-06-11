import { useCallback, useState } from 'react';
import { MainActionsContext } from './MainActionsContext';
import Toast from './Toast';
import AddAppointmentSheet from './AddAppointmentSheet';
import AddClientSheet from './AddClientSheet';
import BlockTimeSheet from './BlockTimeSheet';

// Session-level state + global action sheets for the main screens.
// Wraps the router outlet so the four quick-action flows can be launched from
// any screen and the things they create show up across the app for the rest
// of the session.

export default function MainActions({ children }) {
  const [actionSheet, setActionSheet] = useState(null); // { type, prefill }
  const [toast, setToast] = useState(null);
  const [addedBookings, setAddedBookings] = useState([]); // appointments + blocks from quick actions
  const [extraClients, setExtraClients] = useState([]);
  const [extraTimeOff, setExtraTimeOff] = useState([]);
  const [businessLocation, setBusinessLocation] = useState('Salon Soho');
  const [role, setRole] = useState('owner'); // 'owner' | 'staff'
  // Up Next appointment queue: index into upNextQueue + service phase.
  const [upNext, setUpNext] = useState({ index: 0, phase: 'upcoming', note: null });
  // Session-level client list management (block / delete / merge).
  const [removedClients, setRemovedClients] = useState([]);
  const [blockedClients, setBlockedClients] = useState([]);
  const [collectedPayments, setCollectedPayments] = useState([]);
  // Session-added client data (allergies, patch tests, notes, tags, files,
  // staff alerts) keyed by client id, so quick-adds survive navigation.
  const [clientExtras, setClientExtras] = useState({});

  const openAction = useCallback((type, prefill = {}) => setActionSheet({ type, prefill }), []);
  const closeAction = useCallback(() => setActionSheet(null), []);
  const showToast = useCallback((message) => setToast(message), []);
  const clearToast = useCallback(() => setToast(null), []);

  const addBooking = (booking) => setAddedBookings((b) => [...b, booking]);
  const addClient = (client) => setExtraClients((c) => [client, ...c]);
  const addTimeOff = (item) => setExtraTimeOff((t) => [...t, item]);
  const advanceUpNext = useCallback(
    () => setUpNext((u) => ({ index: u.index + 1, phase: 'upcoming', note: null })),
    [],
  );
  const removeClient = useCallback(
    (id) => setRemovedClients((r) => (r.includes(id) ? r : [...r, id])),
    [],
  );
  const blockClient = useCallback(
    (id) => setBlockedClients((b) => (b.includes(id) ? b : [...b, id])),
    [],
  );
  const unblockClient = useCallback(
    (id) => setBlockedClients((b) => b.filter((x) => x !== id)),
    [],
  );
  const markCollected = useCallback(
    (id) => setCollectedPayments((c) => (c.includes(id) ? c : [...c, id])),
    [],
  );
  const addClientExtra = useCallback(
    (clientId, kind, value) =>
      setClientExtras((prev) => ({
        ...prev,
        [clientId]: {
          ...prev[clientId],
          [kind]: [...(prev[clientId]?.[kind] || []), value],
        },
      })),
    [],
  );
  const setClientAlert = useCallback(
    (clientId, alert) =>
      setClientExtras((prev) => ({
        ...prev,
        [clientId]: { ...prev[clientId], staffAlert: alert },
      })),
    [],
  );

  const value = {
    openAction,
    showToast,
    addedBookings,
    extraClients,
    addClient,
    extraTimeOff,
    addTimeOff,
    businessLocation,
    setBusinessLocation,
    role,
    setRole,
    upNext,
    setUpNext,
    advanceUpNext,
    removedClients,
    removeClient,
    blockedClients,
    blockClient,
    unblockClient,
    collectedPayments,
    markCollected,
    clientExtras,
    addClientExtra,
    setClientAlert,
  };

  return (
    <MainActionsContext.Provider value={value}>
      {children}

      <AddAppointmentSheet
        open={actionSheet?.type === 'appointment'}
        prefill={actionSheet?.prefill}
        onClose={closeAction}
        onAdd={(booking) => {
          addBooking(booking);
          showToast('Appointment added');
        }}
      />
      <AddClientSheet
        open={actionSheet?.type === 'client'}
        onClose={closeAction}
        onAdd={(client) => {
          addClient(client);
          showToast(
            client.invited
              ? `${client.name} added · invite sent`
              : `${client.name} added to clients`,
          );
        }}
      />
      <BlockTimeSheet
        open={actionSheet?.type === 'block'}
        prefill={actionSheet?.prefill}
        onClose={closeAction}
        onAdd={(block) => {
          // One block per selected team member, so it shows in every column.
          const staffIds = block.staffIds?.length ? block.staffIds : [block.staffId];
          staffIds.forEach((staffId, i) =>
            addBooking({ ...block, id: `${block.id}_${i}`, staffId }),
          );
          showToast(`Time blocked · ${block.reason}`);
        }}
      />
      <Toast message={toast} onDone={clearToast} />
    </MainActionsContext.Provider>
  );
}
