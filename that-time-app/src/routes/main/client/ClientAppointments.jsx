import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RotateCcw,
  X,
  Search,
  SlidersHorizontal,
  ChevronDown,
  CreditCard,
  FileText,
  Image,
  Camera,
  Plus,
} from 'lucide-react';
import { useMainActions } from '../../../components/sheets/MainActionsContext';
import ConfirmSheet from '../../../components/sheets/ConfirmSheet';
import RescheduleSheet from '../../../components/sheets/RescheduleSheet';
import SheetShell, { SheetSectionLabel } from '../../../components/sheets/SheetShell';
import { useClient } from './useClient';
import { SectionHeader } from './clientShared';

const BOOKING_FILTERS = ['All', 'Completed', 'Cancelled'];

const STATUS = {
  Completed: 'bg-green-50 text-green-600',
  Cancelled: 'bg-gray-100 text-gray-400',
};

// Appointments — history, next appointment management, outstanding payments,
// and the per-appointment clinical record (notes + photos).
export default function ClientAppointments() {
  const navigate = useNavigate();
  const { client } = useClient();
  const { openAction, showToast, collectedPayments } = useMainActions();

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [filterOpen, setFilterOpen] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [apptCancelled, setApptCancelled] = useState(false);
  const [rescheduledTo, setRescheduledTo] = useState(null);
  const [record, setRecord] = useState(null);
  const [recordNotes, setRecordNotes] = useState({});
  const [recordImages, setRecordImages] = useState({});
  const [noteDraft, setNoteDraft] = useState('');

  const next = client.overview.nextAppointment;
  const outstanding = client.bookings.items.find(
    (b) => b.unpaid && !collectedPayments.includes(`${client.id}_${b.id}`),
  );

  const items = client.bookings.items.filter((item) => {
    if (filter !== 'All' && item.status !== filter) return false;
    const q = query.trim().toLowerCase();
    if (q && !`${item.service} ${item.detail}`.toLowerCase().includes(q)) return false;
    return true;
  });

  const notesFor = (b) => [...(b.record?.notes || []), ...(recordNotes[b.id] || [])];
  const imagesFor = (b) => [...(b.record?.images || []), ...(recordImages[b.id] || [])];

  return (
    <>
      <SectionHeader title="Appointments" subtitle={client.name} />

      <div className="flex-1 overflow-y-auto bg-white px-4 pb-8 space-y-3">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2.5">
          {client.overview.stats.map((stat) => (
            <div key={stat.label} className="bg-gray-50 rounded-2xl px-3 py-3.5">
              <div className="text-[11px] text-gray-500 leading-tight">{stat.label}</div>
              <div className="text-[14px] font-bold text-gray-900 mt-1">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Next appointment */}
        {next && !apptCancelled ? (
          <div className="bg-gray-900 rounded-2xl p-4 text-white">
            <span className="text-[11px] font-medium bg-white/10 rounded-full px-2.5 py-1">
              {rescheduledTo ? `Next appointment · moved to ${rescheduledTo}` : 'Next appointment'}
            </span>
            <div className="text-[17px] font-bold mt-3">{next.service}</div>
            <div className="text-[12px] text-gray-400 mt-1">{next.detail}</div>
            <div className="grid grid-cols-2 gap-2.5 mt-4">
              <button
                onClick={() => setRescheduleOpen(true)}
                className="flex items-center justify-center gap-1.5 bg-white/10 rounded-full py-2.5 text-[13px] font-medium hover:bg-white/20 transition-colors"
              >
                <RotateCcw size={14} strokeWidth={1.75} />
                Reschedule
              </button>
              <button
                onClick={() => setCancelOpen(true)}
                className="flex items-center justify-center gap-1.5 bg-white/10 rounded-full py-2.5 text-[13px] font-medium hover:bg-white/20 transition-colors"
              >
                <X size={14} strokeWidth={1.75} />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-center">
            <div className="text-[13px] font-medium text-gray-500">
              {apptCancelled ? 'Next appointment cancelled' : 'No upcoming appointment'}
            </div>
            <button
              onClick={() => openAction('appointment', { client: client.name })}
              className="text-[13px] font-semibold text-gray-900 underline underline-offset-2 mt-1"
            >
              Book one now
            </button>
          </div>
        )}

        {/* Outstanding payment */}
        {outstanding && (
          <button
            onClick={() =>
              navigate(
                `/checkout?client=${encodeURIComponent(client.name)}&service=${encodeURIComponent(
                  `${outstanding.service} (outstanding)`,
                )}&price=${outstanding.unpaid.replace('£', '')}&collect=${client.id}_${outstanding.id}`,
              )
            }
            className="w-full flex items-center gap-3 border border-gray-300 bg-gray-50 rounded-2xl px-4 py-3.5 text-left hover:bg-gray-100 transition-colors"
          >
            <CreditCard size={15} strokeWidth={1.75} className="shrink-0 text-gray-700" />
            <span className="flex-1 text-[13px] font-medium text-gray-900">
              {outstanding.unpaid} outstanding · {outstanding.service}
            </span>
            <span className="shrink-0 text-[12px] font-semibold text-gray-900">Collect</span>
          </button>
        )}

        {/* Search + filter */}
        <div className="flex items-center gap-2 bg-gray-50 rounded-full px-4 h-11">
          <Search size={15} className="text-gray-400 shrink-0" strokeWidth={1.75} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search service, date, staff…"
            className="flex-1 bg-transparent text-[13px] text-gray-900 placeholder-gray-400 outline-none min-w-0"
          />
        </div>
        <div>
          <button
            onClick={() => setFilterOpen(true)}
            className={
              'flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-medium transition-colors ' +
              (filter !== 'All' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700')
            }
          >
            <SlidersHorizontal size={13} strokeWidth={1.75} />
            {filter}
            <ChevronDown size={13} strokeWidth={1.75} />
          </button>
        </div>
        <div className="text-[12px] text-gray-400">
          {items.length} past appointment{items.length === 1 ? '' : 's'} · tap one for notes & photos
        </div>

        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => item.record && setRecord(item)}
            className="w-full bg-gray-50 rounded-2xl px-4 py-3.5 flex items-center justify-between gap-3 text-left hover:bg-gray-100 transition-colors"
          >
            <div className="min-w-0">
              <div className="text-[14px] font-semibold text-gray-900">{item.service}</div>
              <div className="text-[12px] text-gray-500 mt-0.5">{item.detail}</div>
              {(notesFor(item).length > 0 || imagesFor(item).length > 0) && (
                <div className="flex items-center gap-2.5 mt-1.5 text-[11px] text-gray-400">
                  {notesFor(item).length > 0 && (
                    <span className="flex items-center gap-1">
                      <FileText size={11} strokeWidth={1.75} />
                      {notesFor(item).length} note{notesFor(item).length === 1 ? '' : 's'}
                    </span>
                  )}
                  {imagesFor(item).length > 0 && (
                    <span className="flex items-center gap-1">
                      <Image size={11} strokeWidth={1.75} />
                      {imagesFor(item).length} photo{imagesFor(item).length === 1 ? '' : 's'}
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {item.unpaid && outstanding?.id === item.id && (
                <span className="text-[11px] font-medium bg-amber-50 text-amber-600 rounded-full px-2.5 py-1">
                  Unpaid
                </span>
              )}
              <span className={'text-[11px] font-medium rounded-full px-2.5 py-1 ' + STATUS[item.status]}>
                {item.status}
              </span>
            </div>
          </button>
        ))}
        {items.length === 0 && (
          <div className="text-center text-[13px] text-gray-400 py-8">No appointments match</div>
        )}
      </div>

      {/* Filter */}
      <SheetShell open={filterOpen} onClose={() => setFilterOpen(false)} title="Filter bookings">
        {BOOKING_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => {
              setFilter(f);
              setFilterOpen(false);
            }}
            className="w-full flex items-center justify-between py-3.5 border-b border-gray-50 last:border-0 text-left"
          >
            <span className="text-[14px] font-medium text-gray-900">{f}</span>
            {filter === f && <span className="text-[12px] text-gray-400">Selected</span>}
          </button>
        ))}
      </SheetShell>

      {/* Appointment record — clinical notes & photos */}
      <SheetShell
        open={Boolean(record)}
        onClose={() => {
          setRecord(null);
          setNoteDraft('');
        }}
        title="Appointment record"
        subtitle={record ? `${record.service} · ${record.detail}` : ''}
      >
        {record && (
          <>
            <SheetSectionLabel>Photos</SheetSectionLabel>
            <div className="flex gap-2.5 overflow-x-auto pb-1">
              {imagesFor(record).map((label, i) => (
                <div
                  key={`${label}${i}`}
                  className="shrink-0 w-24 h-24 rounded-xl bg-gray-100 border border-gray-200 flex flex-col items-center justify-center gap-1.5"
                >
                  <Image size={18} className="text-gray-400" strokeWidth={1.5} />
                  <span className="text-[10px] font-medium text-gray-500">{label}</span>
                </div>
              ))}
              <button
                onClick={() => {
                  setRecordImages((r) => ({
                    ...r,
                    [record.id]: [...(r[record.id] || []), 'New photo'],
                  }));
                  showToast('Photo added to record');
                }}
                className="shrink-0 w-24 h-24 rounded-xl border border-dashed border-gray-300 flex flex-col items-center justify-center gap-1.5 hover:bg-gray-50"
              >
                <Camera size={18} className="text-gray-400" strokeWidth={1.5} />
                <span className="text-[10px] font-medium text-gray-500">Add photo</span>
              </button>
            </div>

            <SheetSectionLabel>Notes</SheetSectionLabel>
            <div className="space-y-3 mb-3">
              {notesFor(record).length === 0 && (
                <div className="text-[12px] text-gray-400">No notes for this appointment yet</div>
              )}
              {notesFor(record).map((note, i) => (
                <div key={i} className="bg-gray-50 rounded-xl px-3.5 py-3">
                  <div className="text-[13px] text-gray-900 leading-snug">{note.text}</div>
                  <div className="text-[11px] text-gray-400 mt-1">{note.time}</div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                placeholder="Add a treatment note…"
                className="flex-1 bg-gray-50 rounded-full px-4 h-11 text-[13px] text-gray-900 placeholder-gray-400 outline-none min-w-0"
              />
              <button
                onClick={() => {
                  if (!noteDraft.trim()) return;
                  setRecordNotes((r) => ({
                    ...r,
                    [record.id]: [
                      ...(r[record.id] || []),
                      { time: 'Today, just now · You', text: noteDraft.trim() },
                    ],
                  }));
                  setNoteDraft('');
                  showToast('Note added to record');
                }}
                className="shrink-0 w-11 h-11 rounded-full bg-gray-900 text-white flex items-center justify-center hover:bg-gray-800"
                aria-label="Add note"
              >
                <Plus size={16} strokeWidth={2} />
              </button>
            </div>
          </>
        )}
      </SheetShell>

      <RescheduleSheet
        open={rescheduleOpen}
        onClose={() => setRescheduleOpen(false)}
        title="Reschedule"
        subtitle={`${client.name} · ${next?.service || ''}`}
        onDone={(dateLabel, time) => {
          setRescheduledTo(`${dateLabel}, ${time}`);
          showToast(`Rescheduled to ${dateLabel}, ${time}`);
        }}
      />
      <ConfirmSheet
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        title="Cancel this appointment?"
        message={`${client.name} · ${next?.service || ''}. We'll notify them and free up the slot.`}
        confirmLabel="Cancel appointment"
        onConfirm={() => {
          setApptCancelled(true);
          showToast('Appointment cancelled');
        }}
      />
    </>
  );
}
