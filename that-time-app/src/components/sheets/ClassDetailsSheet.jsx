import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Clock,
  MapPin,
  GraduationCap,
  MessageSquare,
  UserPlus,
  Ban,
  Play,
  CheckCircle2,
  Check,
  ListChecks,
  Wrench,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useMainActions } from './MainActionsContext';
import ConfirmSheet from './ConfirmSheet';

// Class session sheet — the class equivalent of booking details. Built around
// what a teacher/receptionist needs: who's coming, who's paid, who's signed
// the waiver, who's actually in the room — plus the run sheet (agenda,
// equipment) and group actions.

export default function ClassDetailsSheet({ session, onClose }) {
  const navigate = useNavigate();
  const { openAction, showToast } = useMainActions();
  const [arrived, setArrived] = useState([]);
  const [attendeesOpen, setAttendeesOpen] = useState(false);
  const [status, setStatus] = useState('Scheduled'); // Scheduled | In progress
  const [cancelOpen, setCancelOpen] = useState(false);

  if (!session) return null;

  const booked = session.attendees.length;
  const toggleArrived = (id) =>
    setArrived((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]));

  const actions = [
    {
      icon: MessageSquare,
      label: 'Message all',
      onClick: () => showToast(`Message sent to ${booked} attendees`),
    },
    {
      icon: UserPlus,
      label: 'Add attendee',
      onClick: () => {
        if (booked >= session.capacity) {
          showToast('Class is full — start a waitlist?');
          return;
        }
        onClose();
        openAction('appointment', { service: session.name });
      },
    },
    { icon: Ban, label: 'Cancel class', onClick: () => setCancelOpen(true) },
  ];

  return (
    <div className="absolute inset-0 z-30">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute left-0 right-0 bottom-0 bg-white rounded-t-3xl max-h-[92%] overflow-y-auto px-5 pb-6">
        <div className="sticky top-0 bg-white pt-2.5 pb-1 flex justify-center">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between pt-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[16px] font-bold text-gray-900 truncate">{session.name}</span>
              <span className="shrink-0 text-[10px] font-semibold border-[1.5px] border-gray-900 text-gray-900 rounded-full px-2 py-0.5">
                Class
              </span>
            </div>
            <div className="text-[12px] text-gray-500 mt-0.5">
              {session.format} · {session.price}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={
                'shrink-0 text-[11px] font-semibold rounded-full px-2.5 py-1 ' +
                (status === 'In progress' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700')
              }
            >
              {status}
            </span>
            <button
              onClick={onClose}
              className="w-8 h-8 -mt-1 -mr-1 rounded-full flex items-center justify-center hover:bg-gray-100"
              aria-label="Close"
            >
              <X size={18} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Compact session meta */}
        <div className="flex items-center gap-3 text-[12px] text-gray-600 mt-3 flex-wrap">
          <span className="flex items-center gap-1 font-semibold text-gray-900">
            <Clock size={12} strokeWidth={1.75} className="text-gray-400" />
            {session.time}
          </span>
          <span className="flex items-center gap-1">
            <GraduationCap size={12} strokeWidth={1.75} className="text-gray-400" />
            {session.teacher}
          </span>
          <span className="flex items-center gap-1">
            <MapPin size={12} strokeWidth={1.75} className="text-gray-400" />
            {session.location}
          </span>
        </div>

        {/* Capacity */}
        <div className="flex items-center gap-3 mt-3">
          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gray-900 rounded-full"
              style={{ width: `${Math.min(100, (booked / session.capacity) * 100)}%` }}
            />
          </div>
          <span className="text-[11px] text-gray-500 font-medium shrink-0">
            {booked}/{session.capacity} · {session.capacity - booked} left
          </span>
        </div>

        {/* Attendees — collapsed card, expandable */}
        <button
          onClick={() => setAttendeesOpen((v) => !v)}
          className="w-full flex items-center gap-3 border border-gray-200 rounded-2xl px-4 py-3 mt-4 text-left hover:bg-gray-50 transition-colors"
        >
          <div className="flex -space-x-2 shrink-0">
            {session.attendees.slice(0, 4).map((a) => (
              <span
                key={a.id}
                className="w-7 h-7 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[9px] font-semibold text-gray-600"
              >
                {a.initials}
              </span>
            ))}
            {booked > 4 && (
              <span className="w-7 h-7 rounded-full bg-gray-900 border-2 border-white flex items-center justify-center text-[9px] font-semibold text-white">
                +{booked - 4}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold text-gray-900">
              {booked} attendees · {arrived.length} arrived
            </div>
            <div className="text-[11px] text-gray-500 mt-0.5">
              {[
                session.attendees.filter((a) => a.payment === 'Unpaid').length &&
                  `${session.attendees.filter((a) => a.payment === 'Unpaid').length} unpaid`,
                session.attendees.filter((a) => a.waiver === 'Awaiting waiver').length &&
                  `${session.attendees.filter((a) => a.waiver === 'Awaiting waiver').length} waiver pending`,
              ]
                .filter(Boolean)
                .join(' · ') || 'All paid · waivers signed'}
            </div>
          </div>
          {attendeesOpen ? (
            <ChevronUp size={15} className="text-gray-400 shrink-0" />
          ) : (
            <ChevronDown size={15} className="text-gray-400 shrink-0" />
          )}
        </button>
        {attendeesOpen && (
        <div className="space-y-2 mt-2.5">
          {session.attendees.map((a) => {
            const here = arrived.includes(a.id);
            const unpaid = a.payment === 'Unpaid';
            const deposit = a.payment === 'Deposit paid';
            const waiverPending = a.waiver === 'Awaiting waiver';
            return (
              <div key={a.id} className="flex items-center gap-3 bg-gray-50 rounded-2xl px-3.5 py-3">
                <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-[11px] font-semibold text-gray-600 shrink-0">
                  {a.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-gray-900">{a.name}</div>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    {unpaid && (
                      <button
                        onClick={() => {
                          onClose();
                          navigate(
                            `/checkout?client=${encodeURIComponent(a.name)}&service=${encodeURIComponent(
                              `${session.name} (seat)`,
                            )}&price=${session.price.replace(/[^0-9.]/g, '')}`,
                          );
                        }}
                        className="text-[10px] font-medium bg-amber-50 text-amber-600 rounded-full px-2 py-0.5"
                      >
                        Unpaid · collect
                      </button>
                    )}
                    {deposit && (
                      <span className="text-[10px] font-medium bg-gray-200 text-gray-600 rounded-full px-2 py-0.5">
                        Deposit paid
                      </span>
                    )}
                    {waiverPending && (
                      <span className="text-[10px] font-medium bg-amber-50 text-amber-600 rounded-full px-2 py-0.5">
                        Awaiting waiver
                      </span>
                    )}
                    {!unpaid && !deposit && !waiverPending && (
                      <span className="text-[10px] text-gray-400">Paid · waiver signed</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => toggleArrived(a.id)}
                  className={
                    'shrink-0 flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-semibold border transition-colors ' +
                    (here
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'border-gray-300 text-gray-600 hover:bg-gray-100')
                  }
                >
                  {here && <Check size={11} strokeWidth={2.5} />}
                  {here ? 'Arrived' : 'Mark arrived'}
                </button>
              </div>
            );
          })}
        </div>
        )}

        {/* Group actions */}
        <div className="grid grid-cols-3 gap-2.5 mt-3">
          {actions.map(({ icon: Icon, label, onClick }) => (
            <button
              key={label}
              onClick={onClick}
              className="bg-gray-50 rounded-xl py-2.5 flex flex-col items-center gap-1 hover:bg-gray-100 transition-colors"
            >
              <Icon size={17} className="text-gray-700" strokeWidth={1.75} />
              <span className="text-[12px] font-medium text-gray-700">{label}</span>
            </button>
          ))}
        </div>

        {/* Run sheet */}
        <div className="flex items-center gap-1.5 mt-4 mb-2">
          <ListChecks size={13} className="text-gray-400" strokeWidth={1.75} />
          <span className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
            Agenda
          </span>
        </div>
        <div className="bg-gray-50 rounded-2xl px-4 py-1">
          {session.agenda.map((item, i) => (
            <div
              key={item}
              className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0"
            >
              <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-600 text-[10px] font-bold flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              <span className="text-[13px] text-gray-900">{item}</span>
            </div>
          ))}
        </div>

        <div className="flex items-start gap-2.5 bg-gray-50 rounded-2xl px-4 py-3 mt-2">
          <Wrench size={14} className="text-gray-500 shrink-0 mt-0.5" strokeWidth={1.75} />
          <span className="text-[12px] text-gray-600 leading-snug">{session.equipment}</span>
        </div>

        {/* Lifecycle */}
        <div className="mt-4">
          {status === 'Scheduled' ? (
            <button
              onClick={() => {
                setStatus('In progress');
                showToast(`${session.name} started · ${arrived.length}/${booked} in the room`);
              }}
              className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white rounded-full py-3.5 text-[13px] font-semibold hover:bg-gray-800 transition-colors"
            >
              <Play size={15} strokeWidth={2} />
              Start class
            </button>
          ) : (
            <button
              onClick={() => {
                showToast(`Class completed · ${arrived.length} attended`);
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white rounded-full py-3.5 text-[13px] font-semibold hover:bg-gray-800 transition-colors"
            >
              <CheckCircle2 size={15} strokeWidth={2} />
              Complete class
            </button>
          )}
        </div>
      </div>

      <ConfirmSheet
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        title="Cancel this class?"
        message={`${session.name} · ${session.time}. All ${booked} attendees will be notified and refunded.`}
        confirmLabel="Cancel class"
        onConfirm={() => {
          showToast(`${session.name} cancelled · ${booked} attendees notified`);
          onClose();
        }}
      />
    </div>
  );
}
