import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  AlertTriangle,
  FileText,
  MessageSquare,
  RotateCcw,
  X,
  CreditCard,
  Calendar,
  Link2,
  UserCheck,
  Play,
} from 'lucide-react';
import { upNextQueue } from '../data/homeToday';
import { bookingDetails } from '../data/scheduleData';
import { useMainActions } from './sheets/MainActionsContext';
import ConfirmSheet from './sheets/ConfirmSheet';
import RescheduleSheet from './sheets/RescheduleSheet';
import BookingDetailsSheet from './sheets/BookingDetailsSheet';

// Dark "up next" appointment card — a live queue with a real service
// lifecycle: Mark arrived (reception) → Start service (provider) → Take
// payment (checkout) → rate → next appointment. The phase is shared state,
// so whoever marks a step, everyone sees it — including the booking sheet.
export default function UpNextCard() {
  const navigate = useNavigate();
  const { upNext, setUpNext, advanceUpNext, openAction, showToast } = useMainActions();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const data = upNextQueue[upNext.index];

  // Queue exhausted — "That's a wrap for today" variant from the Figma cards stack.
  if (!data) {
    return (
      <div className="border border-gray-100 rounded-2xl p-4">
        <div className="text-[15px] font-semibold text-gray-900">That's a wrap for today</div>
        <div className="text-[12px] text-gray-400 mt-0.5 mb-3.5">No more bookings</div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => openAction('appointment')}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-100 rounded-full py-3 text-[13px] font-semibold text-gray-900 hover:bg-gray-200 transition-colors"
          >
            <Calendar size={14} strokeWidth={1.75} />
            New booking
          </button>
          <button
            onClick={() => showToast('Booking link copied')}
            className="shrink-0 w-11 h-11 border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
            aria-label="Share booking link"
          >
            <Link2 size={15} className="text-gray-900" strokeWidth={1.75} />
          </button>
        </div>
      </div>
    );
  }

  const phase = upNext.phase; // 'upcoming' | 'arrived' | 'in-service'
  const pillLabel =
    phase === 'in-service'
      ? `In service · ${data.duration} left`
      : phase === 'arrived'
        ? 'Arrived · in waiting area'
        : upNext.note || data.countdown;
  const firstName = data.client.split(' ')[0];

  const checkOut = () =>
    navigate(
      `/checkout?client=${encodeURIComponent(data.client)}&service=${encodeURIComponent(
        data.service,
      )}&price=${data.amount}&from=upnext`,
    );

  const primaryAction =
    phase === 'upcoming'
      ? {
          icon: UserCheck,
          label: 'Mark arrived',
          onClick: () => {
            setUpNext({ ...upNext, phase: 'arrived', note: null });
            showToast(`${firstName} marked as arrived`);
          },
        }
      : phase === 'arrived'
        ? {
            icon: Play,
            label: 'Start service',
            onClick: () => {
              setUpNext({ ...upNext, phase: 'in-service' });
              showToast(`Service started · ${data.client}`);
            },
          }
        : { icon: CreditCard, label: 'Take Payment', onClick: checkOut };

  return (
    <>
      <div
        className="bg-gray-900 rounded-2xl p-4 text-white cursor-pointer"
        onClick={() => setDetailsOpen(true)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Clock size={14} className="text-gray-400" strokeWidth={1.75} />
            <span className="text-[15px] font-bold">{data.time}</span>
            <span className="text-[12px] text-gray-400">· {data.duration}</span>
          </div>
          <div
            className={
              'flex items-center gap-1 rounded-full px-2.5 py-1 ' +
              (phase !== 'upcoming' ? 'bg-white text-gray-900' : 'bg-white/10')
            }
          >
            <Clock
              size={11}
              strokeWidth={1.75}
              className={phase !== 'upcoming' ? 'text-gray-500' : 'text-gray-300'}
            />
            <span
              className={
                'text-[11px] font-medium ' +
                (phase !== 'upcoming' ? 'text-gray-900' : 'text-gray-100')
              }
            >
              {pillLabel}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-3.5">
          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-[12px] font-semibold text-white shrink-0">
            {data.initials}
          </div>
          <div className="min-w-0">
            <div className="text-[15px] font-semibold leading-tight">{data.client}</div>
            <div className="text-[12px] text-gray-400 mt-0.5">{data.service}</div>
          </div>
        </div>

        {data.tags.length > 0 && (
          <div className="flex items-center gap-2 mt-3 text-[11px]">
            {data.tags.map((tag) => (
              <span key={tag.label} className="flex items-center gap-1.5">
                <span className="flex items-center gap-1 bg-white/10 rounded-md px-1.5 py-0.5 font-medium text-gray-200">
                  {tag.icon === 'allergy' ? (
                    <AlertTriangle size={11} strokeWidth={1.75} />
                  ) : (
                    <FileText size={11} strokeWidth={1.75} />
                  )}
                  {tag.label}
                </span>
                {tag.extra && <span className="text-gray-400">{tag.extra}</span>}
              </span>
            ))}
          </div>
        )}

        <div
          className="border-t border-white/10 mt-3.5 pt-3.5 flex items-center justify-between"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/messages/${data.bookingId}`)}
              className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              aria-label="Message client"
            >
              <MessageSquare size={15} strokeWidth={1.75} />
            </button>
            {phase === 'upcoming' && (
              <>
                <button
                  onClick={() => setRescheduleOpen(true)}
                  className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                  aria-label="Reschedule"
                >
                  <RotateCcw size={15} strokeWidth={1.75} />
                </button>
                <button
                  onClick={() => setConfirmOpen(true)}
                  className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                  aria-label="Cancel appointment"
                >
                  <X size={15} strokeWidth={1.75} />
                </button>
              </>
            )}
            {phase === 'in-service' && (
              <span className="flex items-center gap-1.5 text-[11px] text-gray-400">
                <Play size={11} strokeWidth={1.75} />
                In progress
              </span>
            )}
          </div>
          <button
            onClick={primaryAction.onClick}
            className="flex items-center gap-1.5 bg-white text-gray-900 rounded-full pl-3 pr-4 py-2 text-[13px] font-semibold hover:bg-gray-100 transition-colors"
          >
            <primaryAction.icon size={15} strokeWidth={2} />
            {primaryAction.label}
          </button>
        </div>
      </div>

      <ConfirmSheet
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Cancel this appointment?"
        message={`${data.client} · ${data.service} at ${data.time}. We'll let them know and free up the slot.`}
        confirmLabel="Cancel appointment"
        onConfirm={() => {
          advanceUpNext();
          showToast(`Cancelled — ${firstName}'s slot freed. Showing what's next.`);
        }}
      />
      <RescheduleSheet
        open={rescheduleOpen}
        onClose={() => setRescheduleOpen(false)}
        title="Reschedule"
        subtitle={`${data.client} · ${data.service}`}
        onDone={(dateLabel, time) => {
          setUpNext({ ...upNext, note: `Moved · ${dateLabel}, ${time}` });
          showToast(`Rescheduled to ${dateLabel}, ${time}`);
        }}
      />
      {detailsOpen && (
        <BookingDetailsSheet
          booking={bookingDetails[data.bookingId]}
          onClose={() => setDetailsOpen(false)}
        />
      )}
    </>
  );
}
