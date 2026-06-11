import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UserPlus, CheckCircle2, ChevronRight, Plus } from 'lucide-react';
import SheetShell, { SheetCta, Chip, SheetSectionLabel } from './SheetShell';
import DayPicker from './DayPicker';
import { useMainActions } from './MainActionsContext';
import { clientList } from '../../data/clientsDirectory';
import {
  bookableServices,
  bookableStaff,
  serviceCategories,
  dayLabel,
  CURRENT_MONTH,
  timeSlots,
  busySlots,
} from '../../data/bookingOptions';

// "Add New Appointment" flow — client → service → staff & time → review → done.
// One bottom sheet with internal steps so the user never loses the screen
// they launched it from.
export default function AddAppointmentSheet({ open, onClose, prefill = {}, onAdd }) {
  const navigate = useNavigate();
  const { extraClients, addClient, showToast } = useMainActions();
  const [step, setStep] = useState(null); // null → derive from prefill on open
  const [client, setClient] = useState(null);
  const [service, setService] = useState(null);
  const [staff, setStaff] = useState(null);
  const [day, setDay] = useState(null);
  const [month, setMonth] = useState(null);
  const [time, setTime] = useState(null);
  const [query, setQuery] = useState('');
  const [serviceFilter, setServiceFilter] = useState('All');
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');

  if (!open) return null;

  // Derive starting point once per open: a prefilled client (e.g. profile
  // "Book" button or Rebook) skips the client step.
  const effClient = client ?? (prefill.client || null);
  const effService = service ?? (bookableServices.find((s) => s.name === prefill.service) || null);
  const effTime = time ?? (prefill.time || null);
  const effDay = day ?? (prefill.day || null);
  const effMonth = month ?? (prefill.month ?? CURRENT_MONTH);
  const currentStep = step ?? (effClient ? 'service' : 'client');

  const reset = () => {
    setStep(null);
    setClient(null);
    setService(null);
    setStaff(null);
    setDay(null);
    setMonth(null);
    setTime(null);
    setQuery('');
    setServiceFilter('All');
    setNewClientName('');
    setNewClientPhone('');
  };
  const close = () => {
    reset();
    onClose();
  };

  const visibleClients = [...extraClients, ...clientList].filter(
    (c) => !c.muted && c.name.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const visibleServices = bookableServices.filter(
    (s) => serviceFilter === 'All' || s.category === serviceFilter,
  );
  const dateLabel = dayLabel(effDay, effMonth);

  const saveNewClient = () => {
    const trimmed = newClientName.trim();
    addClient({
      id: `new-${trimmed.toLowerCase().replace(/[^a-z]+/g, '-')}`,
      initials: trimmed
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
      name: trimmed,
      phone: newClientPhone,
      schedule: 'Added today',
      tags: [],
    });
    showToast(`${trimmed} added to clients`);
    setClient(trimmed);
    setNewClientName('');
    setNewClientPhone('');
    setStep('service');
  };

  const stepBack = {
    service: effClient && prefill.client ? null : 'client',
    'new-client': 'client',
    time: 'service',
    review: 'time',
  }[currentStep];

  const subtitle = {
    client: 'Who is it for?',
    'new-client': 'Add a new client',
    service: effClient,
    time: `${effClient} · ${effService?.name || ''}`,
    review: 'Check the details',
    done: null,
  }[currentStep];

  return (
    <SheetShell
      open={open}
      onClose={close}
      onBack={currentStep !== 'done' && stepBack ? () => setStep(stepBack) : undefined}
      title={currentStep === 'done' ? 'Appointment added' : 'New Appointment'}
      subtitle={subtitle}
      footer={
        currentStep === 'new-client' ? (
          <SheetCta disabled={!newClientName.trim()} onClick={saveNewClient}>
            Add & select
          </SheetCta>
        ) : currentStep === 'time' ? (
          <SheetCta disabled={!staff || !effDay || !effTime} onClick={() => setStep('review')}>
            Review appointment
          </SheetCta>
        ) : currentStep === 'review' ? (
          <SheetCta
            onClick={() => {
              onAdd({
                id: `apt_${Date.now().toString(36)}`,
                kind: 'appointment',
                day: effDay,
                month: effMonth,
                time: effTime,
                client: effClient,
                service: effService.name,
                duration: effService.duration,
                minutes: effService.minutes,
                price: effService.price,
                staffId: staff,
              });
              setStep('done');
            }}
          >
            Add Appointment
          </SheetCta>
        ) : currentStep === 'done' ? (
          <div className="space-y-2.5">
            <SheetCta
              onClick={() => {
                const target = `/schedule?date=${effDay}&month=${effMonth}`;
                close();
                navigate(target);
              }}
            >
              View in schedule
            </SheetCta>
            <button
              onClick={close}
              className="w-full rounded-full py-3.5 text-[14px] font-semibold border border-gray-200 text-gray-900 hover:bg-gray-50 transition-colors"
            >
              Done
            </button>
          </div>
        ) : null
      }
    >
      {currentStep === 'client' && (
        <>
          <div className="flex items-center gap-2 bg-gray-50 rounded-full px-4 h-11 mb-3">
            <Search size={15} className="text-gray-400 shrink-0" strokeWidth={1.75} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search clients…"
              className="flex-1 bg-transparent text-[13px] text-gray-900 placeholder-gray-400 outline-none min-w-0"
            />
          </div>
          <button
            onClick={() => setStep('new-client')}
            className="w-full flex items-center gap-3 py-3 text-left border-b border-gray-50"
          >
            <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center shrink-0">
              <Plus size={15} className="text-white" strokeWidth={2} />
            </div>
            <div className="text-[14px] font-medium text-gray-900">New client</div>
          </button>
          <button
            onClick={() => {
              setClient('Walk-in');
              setStep('service');
            }}
            className="w-full flex items-center gap-3 py-3 text-left border-b border-gray-50"
          >
            <div className="w-10 h-10 rounded-full border border-dashed border-gray-300 flex items-center justify-center shrink-0">
              <UserPlus size={15} className="text-gray-400" strokeWidth={1.75} />
            </div>
            <div className="text-[14px] font-medium text-gray-900">Walk-in</div>
          </button>
          {visibleClients.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setClient(c.name);
                setStep('service');
              }}
              className="w-full flex items-center gap-3 py-3 text-left border-b border-gray-50 last:border-0"
            >
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-[11px] font-semibold text-gray-500 shrink-0">
                {c.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-medium text-gray-900">{c.name}</div>
                <div className="text-[12px] text-gray-400">{c.schedule}</div>
              </div>
              <ChevronRight size={15} className="text-gray-300 shrink-0" />
            </button>
          ))}
        </>
      )}

      {currentStep === 'new-client' && (
        <div className="space-y-4">
          <label className="block">
            <div className="text-[12px] font-medium text-gray-500 mb-1.5">Full name</div>
            <input
              value={newClientName}
              onChange={(e) => setNewClientName(e.target.value)}
              placeholder="e.g. Maya Patel"
              autoFocus
              className="w-full bg-gray-50 rounded-xl px-4 h-12 text-[14px] text-gray-900 placeholder-gray-400 outline-none focus:ring-1 focus:ring-gray-900"
            />
          </label>
          <label className="block">
            <div className="text-[12px] font-medium text-gray-500 mb-1.5">Phone</div>
            <input
              value={newClientPhone}
              onChange={(e) => setNewClientPhone(e.target.value)}
              placeholder="(555) 000-0000"
              type="tel"
              className="w-full bg-gray-50 rounded-xl px-4 h-12 text-[14px] text-gray-900 placeholder-gray-400 outline-none focus:ring-1 focus:ring-gray-900"
            />
          </label>
          <div className="text-[11px] text-gray-400">
            They'll be added to your client list — you can fill in the rest of their profile later.
          </div>
        </div>
      )}

      {currentStep === 'service' && (
        <>
          <div className="flex gap-2 overflow-x-auto pb-3 -mx-5 px-5">
            {serviceCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setServiceFilter(cat)}
                className={
                  'shrink-0 rounded-full px-3.5 py-2 text-[12px] font-medium transition-colors ' +
                  (serviceFilter === cat ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500')
                }
              >
                {cat}
              </button>
            ))}
          </div>
          {visibleServices.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setService(s);
                setStep('time');
              }}
              className="w-full flex items-center justify-between py-3.5 text-left border-b border-gray-50 last:border-0"
            >
              <div>
                <div className="text-[14px] font-medium text-gray-900">{s.name}</div>
                <div className="text-[12px] text-gray-400 mt-0.5">
                  {s.duration} · {s.category}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-semibold text-gray-900">{s.price}</span>
                <ChevronRight size={15} className="text-gray-300" />
              </div>
            </button>
          ))}
          {visibleServices.length === 0 && (
            <div className="text-center text-[13px] text-gray-400 py-8">
              No {serviceFilter.toLowerCase()} services
            </div>
          )}
        </>
      )}

      {currentStep === 'time' && (
        <>
          <SheetSectionLabel>Staff</SheetSectionLabel>
          <div className="flex flex-wrap gap-2">
            {bookableStaff.map((m) => (
              <Chip key={m.id} selected={staff === m.id} onClick={() => setStaff(m.id)}>
                {m.name}
              </Chip>
            ))}
          </div>
          <SheetSectionLabel>Day</SheetSectionLabel>
          <DayPicker
            selected={effDay}
            selectedMonth={effMonth}
            onSelect={(d, m) => {
              setDay(d);
              setMonth(m);
            }}
          />
          <SheetSectionLabel>Time</SheetSectionLabel>
          <div className="flex flex-wrap gap-2">
            {timeSlots.map((slot) => (
              <Chip
                key={slot}
                selected={effTime === slot}
                disabled={busySlots.includes(slot)}
                onClick={() => setTime(slot)}
              >
                {slot}
              </Chip>
            ))}
          </div>
          <div className="text-[11px] text-gray-400 mt-3 mb-1">Greyed-out times are already booked.</div>
        </>
      )}

      {currentStep === 'review' && (
        <div className="bg-gray-50 rounded-2xl px-4 py-1">
          {[
            { label: 'Client', value: effClient },
            { label: 'Service', value: effService?.name },
            { label: 'Staff', value: bookableStaff.find((m) => m.id === staff)?.name },
            { label: 'Day', value: dateLabel },
            { label: 'Time', value: effTime },
            { label: 'Duration', value: effService?.duration },
            { label: 'Price', value: effService?.price },
          ].map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
            >
              <span className="text-[12px] text-gray-500">{row.label}</span>
              <span className="text-[13px] font-semibold text-gray-900">{row.value}</span>
            </div>
          ))}
        </div>
      )}

      {currentStep === 'done' && (
        <div className="flex flex-col items-center text-center pt-4 pb-2">
          <div className="w-14 h-14 rounded-full bg-gray-900 flex items-center justify-center mb-4">
            <CheckCircle2 size={26} className="text-white" strokeWidth={2} />
          </div>
          <div className="text-[16px] font-bold text-gray-900">
            {effClient} · {effService?.name}
          </div>
          <div className="text-[13px] text-gray-500 mt-1">
            {dateLabel} at {effTime} with {bookableStaff.find((m) => m.id === staff)?.name}
          </div>
        </div>
      )}
    </SheetShell>
  );
}
