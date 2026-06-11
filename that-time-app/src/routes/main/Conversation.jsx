import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ChevronLeft,
  Phone,
  User,
  AlertTriangle,
  Scissors,
  Calendar,
  Clock,
  X,
  RotateCcw,
  Plus,
  Send,
  CalendarPlus,
  PoundSterling,
} from 'lucide-react';
import { getConversation } from '../../data/conversations';
import { useMainActions } from '../../components/sheets/MainActionsContext';
import ConfirmSheet from '../../components/sheets/ConfirmSheet';
import RescheduleSheet from '../../components/sheets/RescheduleSheet';

function AppointmentCard({ appointment, cancelled, rescheduledTo, onCancel, onReschedule }) {
  return (
    <div className="bg-white border-b border-gray-100 px-4 pt-3 pb-4">
      <div className="text-[12px] text-gray-400 mb-2">Upcoming Appointment</div>
      <div className="border border-gray-200 rounded-xl px-3.5 py-2.5 flex items-center gap-2 bg-gray-50 mb-3">
        <AlertTriangle size={13} className="text-gray-500 shrink-0" strokeWidth={1.75} />
        <span className="text-[12px] font-medium text-gray-700">
          {cancelled ? 'Appointment Cancelled' : appointment.banner}
        </span>
      </div>
      <div className={'flex items-center gap-3 ' + (cancelled ? 'opacity-50' : '')}>
        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
          <Scissors size={17} className="text-gray-900" strokeWidth={1.75} />
        </div>
        <div className="min-w-0">
          <div
            className={
              'text-[14px] font-semibold text-gray-900 ' + (cancelled ? 'line-through' : '')
            }
          >
            {appointment.service}
          </div>
          <div className="flex items-center gap-3 text-[12px] text-gray-500 mt-1">
            <span className="flex items-center gap-1">
              <Calendar size={12} strokeWidth={1.75} />
              {rescheduledTo ? rescheduledTo.date : appointment.date}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={12} strokeWidth={1.75} />
              {rescheduledTo ? rescheduledTo.time : appointment.time}
            </span>
          </div>
        </div>
      </div>
      {!cancelled && (
        <div className="grid grid-cols-2 gap-2.5 mt-3.5">
          <button
            onClick={onCancel}
            className="flex items-center justify-center gap-1.5 border border-gray-200 rounded-full py-2.5 text-[13px] font-medium text-gray-900 hover:bg-gray-50 transition-colors"
          >
            <X size={14} strokeWidth={1.75} />
            Cancel
          </button>
          <button
            onClick={onReschedule}
            className="flex items-center justify-center gap-1.5 bg-gray-100 rounded-full py-2.5 text-[13px] font-medium text-gray-900 hover:bg-gray-200 transition-colors"
          >
            <RotateCcw size={14} strokeWidth={1.75} />
            Reschedule
          </button>
        </div>
      )}
    </div>
  );
}

function SystemCard({ title, service, price, previous, next }) {
  return (
    <div className="py-2">
      <div className="text-[12px] text-gray-400 border-t border-gray-100 pt-3 mb-3">{title}</div>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
          <Scissors size={17} className="text-gray-900" strokeWidth={1.75} />
        </div>
        <div>
          <div className="text-[14px] font-semibold text-gray-900">{service}</div>
          <div className="text-[12px] text-gray-500">{price}</div>
        </div>
      </div>
      <div className="flex items-center justify-between text-[12px] mt-3">
        <span className="text-gray-400">Previous:</span>
        <span className="text-gray-400 line-through">{previous}</span>
      </div>
      <div className="flex items-center justify-between text-[12px] mt-2 border-b border-gray-100 pb-3">
        <span className="text-gray-400">New:</span>
        <span className="flex items-center gap-3 font-medium text-gray-900">
          <span className="flex items-center gap-1">
            <Calendar size={12} strokeWidth={1.75} />
            {next.date}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={12} strokeWidth={1.75} />
            {next.time}
          </span>
        </span>
      </div>
    </div>
  );
}

export default function Conversation() {
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const convo = getConversation(conversationId);
  const { openAction, showToast } = useMainActions();
  const [draft, setDraft] = useState('');
  const [events, setEvents] = useState([]); // sent bubbles + reschedule cards
  const [plusOpen, setPlusOpen] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [rescheduledTo, setRescheduledTo] = useState(null);

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    setEvents((s) => [...s, { kind: 'bubble', id: `s${s.length}`, text, meta: 'Now · SMS' }]);
    setDraft('');
  };

  // Composer "+" menu — Figma frame 8978:29023.
  const plusActions = [
    {
      icon: CalendarPlus,
      label: 'Add New Appointment',
      desc: 'Schedule a new booking',
      onClick: () => openAction('appointment', { client: convo.name }),
    },
    {
      icon: RotateCcw,
      label: 'Reschedule',
      desc: 'Block time in your calendar',
      onClick: () => setRescheduleOpen(true),
    },
    {
      icon: PoundSterling,
      label: 'Take Payment',
      desc: 'Open the checkout till',
      onClick: () => navigate(`/checkout?client=${encodeURIComponent(convo.name)}`),
    },
  ];

  return (
    <>
      {/* Header */}
      <div className="shrink-0 bg-white border-b border-gray-100 flex items-center gap-2 px-3 h-16">
        <button
          onClick={() => navigate('/messages')}
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 shrink-0"
          aria-label="Back"
        >
          <ChevronLeft size={22} />
        </button>
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-[12px] font-semibold text-gray-500 shrink-0">
          {convo.initials}
        </div>
        <div className="flex-1 min-w-0 ml-1">
          <div className="text-[14px] font-semibold text-gray-900 truncate">{convo.name}</div>
          <div className="text-[11px] text-gray-400">{convo.phone}</div>
        </div>
        <button
          onClick={() => showToast(`Calling ${convo.name.split(' ')[0]}…`)}
          className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center hover:bg-gray-100 shrink-0"
          aria-label="Call"
        >
          <Phone size={15} className="text-gray-900" strokeWidth={1.75} />
        </button>
        {!convo.internal && (
          <button
            onClick={() => navigate(`/clients/${convo.id}`)}
            className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center hover:bg-gray-100 shrink-0"
            aria-label="Client profile"
          >
            <User size={15} className="text-gray-900" strokeWidth={1.75} />
          </button>
        )}
      </div>

      {convo.appointment && (
        <AppointmentCard
          appointment={convo.appointment}
          cancelled={cancelled}
          rescheduledTo={rescheduledTo}
          onCancel={() => setCancelOpen(true)}
          onReschedule={() => setRescheduleOpen(true)}
        />
      )}

      {/* Thread */}
      <div className="flex-1 overflow-y-auto bg-white px-4 py-4 space-y-4">
        {convo.messages.map((m) => {
          if (m.from === 'system') {
            return (
              <SystemCard
                key={m.id}
                title={m.title}
                service={m.service}
                price={m.price}
                previous={m.previous}
                next={m.next}
              />
            );
          }
          const mine = m.from === 'business';
          return (
            <div key={m.id} className={'flex ' + (mine ? 'justify-end' : 'justify-start')}>
              {!mine && (
                <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-[9px] font-semibold text-gray-500 shrink-0 self-end mr-2">
                  {convo.initials}
                </div>
              )}
              <div
                className={
                  'max-w-[75%] rounded-2xl px-4 py-3 ' +
                  (mine ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900')
                }
              >
                <div className="text-[14px] leading-snug">{m.text}</div>
                {m.action && (
                  <button
                    onClick={() => setRescheduleOpen(true)}
                    className="w-full flex items-center justify-center gap-1.5 bg-white text-gray-900 rounded-lg py-2.5 mt-2.5 text-[13px] font-semibold hover:bg-gray-100 transition-colors"
                  >
                    <Calendar size={14} strokeWidth={1.75} />
                    {m.action}
                  </button>
                )}
                <div className="text-[10px] text-gray-400 mt-1.5">{m.meta}</div>
              </div>
            </div>
          );
        })}
        {events.map((e) =>
          e.kind === 'bubble' ? (
            <div key={e.id} className="flex justify-end">
              <div className="max-w-[75%] rounded-2xl px-4 py-3 bg-gray-900 text-white">
                <div className="text-[14px] leading-snug">{e.text}</div>
                <div className="text-[10px] text-gray-400 mt-1.5">{e.meta}</div>
              </div>
            </div>
          ) : (
            <SystemCard
              key={e.id}
              title="Appointment Rescheduled !"
              service={convo.appointment?.service}
              price="£55"
              previous={`${convo.appointment?.date} at ${convo.appointment?.time.split(' ')[0]}`}
              next={e.next}
            />
          ),
        )}
      </div>

      {/* Suggestions + composer */}
      <div className="shrink-0 bg-white pt-2 pb-4 relative">
        <div className="flex gap-2 overflow-x-auto px-4 pb-2.5">
          {convo.suggestions.map((s) => (
            <button
              key={s}
              onClick={() => setDraft(s)}
              className="shrink-0 bg-gray-100 rounded-full px-3.5 py-2 text-[12px] font-medium text-gray-700 hover:bg-gray-200 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 px-4">
          <button
            onClick={() => setPlusOpen((v) => !v)}
            className={
              'w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ' +
              (plusOpen ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')
            }
            aria-label="More actions"
          >
            {plusOpen ? <X size={17} strokeWidth={1.75} /> : <Plus size={17} strokeWidth={1.75} />}
          </button>
          <div className="flex-1 bg-gray-50 rounded-full h-11 flex items-center px-4">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="Type a message…"
              className="flex-1 bg-transparent text-[13px] text-gray-900 placeholder-gray-400 outline-none min-w-0"
            />
          </div>
          <button
            onClick={send}
            disabled={!draft.trim()}
            className={
              'w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ' +
              (draft.trim()
                ? 'bg-gray-900 text-white hover:bg-gray-800'
                : 'bg-gray-50 text-gray-300')
            }
            aria-label="Send"
          >
            <Send size={15} strokeWidth={1.75} />
          </button>
        </div>

        {/* Plus menu sheet */}
        {plusOpen && (
          <div className="absolute bottom-full left-0 right-0 z-20">
            <div className="mx-0 bg-white rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.12)] px-4 pt-5 pb-4 space-y-3">
              {plusActions.map(({ icon: Icon, label, desc, onClick }) => (
                <button
                  key={label}
                  onClick={() => {
                    setPlusOpen(false);
                    onClick();
                  }}
                  className="w-full flex items-center gap-3.5 bg-white border border-gray-100 rounded-2xl px-4 py-3.5 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                    <Icon size={18} className="text-gray-900" strokeWidth={1.75} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[14px] font-semibold text-gray-900">{label}</div>
                    <div className="text-[12px] text-gray-500">{desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Reschedule the upcoming appointment */}
      <RescheduleSheet
        open={rescheduleOpen}
        onClose={() => setRescheduleOpen(false)}
        title="Reschedule"
        subtitle={convo.appointment ? `${convo.name} · ${convo.appointment.service}` : convo.name}
        onDone={(dateLabel, time) => {
          setRescheduledTo({ date: `${dateLabel} March`, time });
          setEvents((s) => [
            ...s,
            { kind: 'reschedule', id: `r${s.length}`, next: { date: `${dateLabel} March`, time } },
          ]);
          showToast(`Rescheduled to ${dateLabel}, ${time}`);
        }}
      />

      {/* Cancel the upcoming appointment */}
      <ConfirmSheet
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        title="Cancel this appointment?"
        message={`${convo.name} · ${convo.appointment?.service} on ${convo.appointment?.date}. We'll send them a cancellation message.`}
        confirmLabel="Cancel appointment"
        onConfirm={() => {
          setCancelled(true);
          showToast('Appointment cancelled');
        }}
      />
    </>
  );
}
