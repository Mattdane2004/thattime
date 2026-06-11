import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  FileText,
  AlertTriangle,
  RotateCcw,
  MessageSquare,
  Clock,
  AlarmClock,
  UserX,
  Users,
  CheckCircle2,
  CreditCard,
  UserCheck,
  Play,
  User,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  Flag,
} from 'lucide-react';
import { useMainActions } from './MainActionsContext';
import ConfirmSheet from './ConfirmSheet';
import SheetShell, { SheetCta, Chip, SheetSectionLabel } from './SheetShell';
import { bookableStaff } from '../../data/bookingOptions';
import { getClientDetail } from '../../data/clientsDirectory';
import { upNextQueue } from '../../data/homeToday';

// Booking details (service) — kept deliberately light: who and when up top,
// warnings folded into one expandable heads-up card, three actions on the
// surface and the rest behind ⋯. The arrival lifecycle is shared with the
// Up Next card.

export default function BookingDetailsSheet({ booking, onClose }) {
  const navigate = useNavigate();
  const { openAction, showToast, clientExtras, upNext, setUpNext } = useMainActions();
  const [status, setStatus] = useState(booking?.status);
  const [localPhase, setLocalPhase] = useState('upcoming');
  const [duration, setDuration] = useState(booking?.duration);
  const [staffName, setStaffName] = useState(booking?.staff);
  const [headsUpOpen, setHeadsUpOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [extendOpen, setExtendOpen] = useState(false);
  const [reassignOpen, setReassignOpen] = useState(false);
  const [noShowOpen, setNoShowOpen] = useState(false);
  const [extendBy, setExtendBy] = useState(null);
  const [newStaff, setNewStaff] = useState(null);

  if (!booking) return null;

  const noShow = status === 'No-show';
  // Arrival lifecycle — shared with the Up Next card when this is the live booking.
  const isUpNextBooking = upNextQueue[upNext.index]?.bookingId === booking.clientId;
  const phase = isUpNextBooking ? upNext.phase : localPhase;
  const setPhase = (p) =>
    isUpNextBooking ? setUpNext({ ...upNext, phase: p, note: null }) : setLocalPhase(p);
  const statusLabel = noShow
    ? 'No-show'
    : phase === 'in-service'
      ? 'In service'
      : phase === 'arrived'
        ? 'Arrived'
        : status;
  const firstName = booking.client.split(' ')[0];

  // Heads-ups: staff alert + severe allergy from the client record, plus the
  // booking's own alerts and note — one collapsed card.
  const profile = getClientDetail(booking.clientId);
  const extras = clientExtras[booking.clientId] || {};
  const staffAlert = extras.staffAlert !== undefined ? extras.staffAlert : profile?.staffAlert;
  const severeAllergy = [...(profile?.allergies || []), ...(extras.allergies || [])].find(
    (a) => a.severity === 'Severe',
  );
  const headsUps = [
    staffAlert && { icon: Flag, tone: 'dark', text: `Staff alert: ${staffAlert}` },
    severeAllergy && {
      icon: AlertTriangle,
      tone: 'strong',
      text: `Severe allergy · ${severeAllergy.name}${severeAllergy.patchTestRequired ? ' — patch test required' : ''}`,
    },
    ...booking.alerts.map((a) => ({
      icon: a.icon === 'warning' ? AlertTriangle : FileText,
      tone: a.emphasis ? 'strong' : 'soft',
      text: a.label,
    })),
    booking.note && { icon: FileText, tone: 'note', text: `Note: ${booking.note}` },
  ].filter(Boolean);

  const lifecycleAction =
    phase === 'upcoming'
      ? {
          icon: UserCheck,
          label: 'Mark arrived',
          onClick: () => {
            setPhase('arrived');
            showToast(`${firstName} marked as arrived`);
          },
        }
      : phase === 'arrived'
        ? {
            icon: Play,
            label: 'Start service',
            onClick: () => {
              setPhase('in-service');
              showToast(`Service started · ${booking.client}`);
            },
          }
        : {
            icon: CheckCircle2,
            label: 'Check out',
            onClick: () => {
              onClose();
              navigate(
                `/checkout?client=${encodeURIComponent(booking.client)}&service=${encodeURIComponent(
                  booking.service,
                )}&price=${booking.payment.replace('£', '')}${isUpNextBooking ? '&from=upnext' : ''}`,
              );
            },
          };

  const moreActions = [
    {
      icon: RotateCcw,
      label: 'Rebook',
      onClick: () => {
        onClose();
        openAction('appointment', { client: booking.client, service: booking.service });
      },
    },
    { icon: Users, label: 'Reassign', onClick: () => setReassignOpen(true) },
    {
      icon: AlarmClock,
      label: 'Mark late',
      onClick: () => {
        setStatus('Running late');
        showToast(`${booking.client} marked as running late`);
      },
    },
    { icon: UserX, label: 'No show', onClick: () => setNoShowOpen(true) },
    {
      icon: User,
      label: 'View profile',
      onClick: () => {
        onClose();
        navigate(`/clients/${booking.clientId}`);
      },
    },
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
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center text-[13px] font-semibold text-gray-500 shrink-0">
              {booking.initials}
            </div>
            <div className="min-w-0">
              <div className="text-[16px] font-bold text-gray-900 leading-tight truncate">
                {booking.client}
              </div>
              <div className="text-[12px] text-gray-500 mt-0.5">
                {booking.service} · {booking.payment}
                {booking.paymentStatus === 'Unpaid' && (
                  <span className="text-gray-400"> unpaid</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span
              className={
                'text-[11px] font-semibold rounded-full px-2.5 py-1 ' +
                (noShow ? 'bg-gray-200 text-gray-500' : 'bg-gray-900 text-white')
              }
            >
              {statusLabel}
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

        {/* Meta */}
        <div className="flex items-center gap-3 text-[12px] text-gray-600 mt-3 flex-wrap">
          <span className="flex items-center gap-1 font-semibold text-gray-900">
            <Clock size={12} strokeWidth={1.75} className="text-gray-400" />
            {booking.time}
          </span>
          <span>{duration}</span>
          <span className="flex items-center gap-1">
            <User size={12} strokeWidth={1.75} className="text-gray-400" />
            {staffName}
          </span>
        </div>

        {/* Heads-up — collapsed card */}
        {headsUps.length > 0 && (
          <>
            <button
              onClick={() => setHeadsUpOpen((v) => !v)}
              className="w-full flex items-center gap-3 border border-gray-200 rounded-2xl px-4 py-3 mt-4 text-left hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center shrink-0">
                <AlertTriangle size={14} className="text-white" strokeWidth={1.75} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-gray-900">
                  {headsUps.length} heads-up{headsUps.length === 1 ? '' : 's'} before you start
                </div>
                <div className="text-[11px] text-gray-500 mt-0.5 truncate">{headsUps[0].text}</div>
              </div>
              {headsUpOpen ? (
                <ChevronUp size={15} className="text-gray-400 shrink-0" />
              ) : (
                <ChevronDown size={15} className="text-gray-400 shrink-0" />
              )}
            </button>
            {headsUpOpen && (
              <div className="space-y-2 mt-2.5">
                {headsUps.map((h, i) => (
                  <div
                    key={i}
                    className={
                      'flex items-center gap-2.5 rounded-xl px-3.5 py-3 text-[12px] font-medium ' +
                      (h.tone === 'dark'
                        ? 'bg-gray-900 text-white'
                        : h.tone === 'strong'
                          ? 'bg-gray-200 text-gray-900'
                          : h.tone === 'note'
                            ? 'border border-gray-200 text-gray-900'
                            : 'bg-gray-50 text-gray-700')
                    }
                  >
                    <h.icon size={14} strokeWidth={1.75} className="shrink-0" />
                    {h.text}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Actions — three on the surface, the rest behind ⋯ */}
        <div className="grid grid-cols-3 gap-2.5 mt-4">
          <button
            onClick={() => navigate(`/messages/${booking.clientId}`)}
            className="bg-gray-50 rounded-xl py-2.5 flex flex-col items-center gap-1 hover:bg-gray-100 transition-colors"
          >
            <MessageSquare size={16} className="text-gray-700" strokeWidth={1.75} />
            <span className="text-[12px] font-medium text-gray-700">Message</span>
          </button>
          <button
            onClick={() => setExtendOpen(true)}
            className="bg-gray-50 rounded-xl py-2.5 flex flex-col items-center gap-1 hover:bg-gray-100 transition-colors"
          >
            <Clock size={16} className="text-gray-700" strokeWidth={1.75} />
            <span className="text-[12px] font-medium text-gray-700">Extend</span>
          </button>
          <button
            onClick={() => setMoreOpen(true)}
            className="bg-gray-50 rounded-xl py-2.5 flex flex-col items-center gap-1 hover:bg-gray-100 transition-colors"
          >
            <MoreHorizontal size={16} className="text-gray-700" strokeWidth={1.75} />
            <span className="text-[12px] font-medium text-gray-700">More</span>
          </button>
        </div>

        {/* Footer */}
        <div className="flex gap-2.5 mt-4">
          <button
            onClick={lifecycleAction.onClick}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-900 text-white rounded-full py-3.5 text-[13px] font-semibold hover:bg-gray-800 transition-colors"
          >
            <lifecycleAction.icon size={15} strokeWidth={2} />
            {lifecycleAction.label}
          </button>
          <button
            onClick={() => {
              onClose();
              navigate(
                `/checkout?client=${encodeURIComponent(booking.client)}&service=${encodeURIComponent(
                  booking.service,
                )}&price=${booking.payment.replace('£', '')}`,
              );
            }}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-900 rounded-full py-3.5 text-[13px] font-semibold hover:bg-gray-200 transition-colors"
          >
            <CreditCard size={15} strokeWidth={1.75} />
            Take Payment
          </button>
        </div>
      </div>

      {/* More actions */}
      <SheetShell
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
        title={booking.client}
        subtitle={`${booking.service} · ${booking.time}`}
      >
        {moreActions.map(({ icon: Icon, label, onClick }) => (
          <button
            key={label}
            onClick={() => {
              setMoreOpen(false);
              onClick();
            }}
            className="w-full flex items-center gap-3.5 py-3 text-left"
          >
            <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
              <Icon size={15} className="text-gray-900" strokeWidth={1.75} />
            </div>
            <span className="text-[14px] font-medium text-gray-900">{label}</span>
          </button>
        ))}
      </SheetShell>

      {/* Extend */}
      <SheetShell
        open={extendOpen}
        onClose={() => setExtendOpen(false)}
        title="Extend appointment"
        subtitle={`${booking.client} · currently ${duration}`}
        footer={
          <SheetCta
            disabled={!extendBy}
            onClick={() => {
              const base = parseInt(duration, 10) || 0;
              setDuration(`${base + extendBy} min`);
              setExtendOpen(false);
              setExtendBy(null);
              showToast(`Extended by ${extendBy} min`);
            }}
          >
            Extend
          </SheetCta>
        }
      >
        <SheetSectionLabel>Add time</SheetSectionLabel>
        <div className="flex flex-wrap gap-2">
          {[15, 30, 45, 60].map((mins) => (
            <Chip key={mins} selected={extendBy === mins} onClick={() => setExtendBy(mins)}>
              +{mins} min
            </Chip>
          ))}
        </div>
        <div className="text-[11px] text-gray-400 mt-3">
          The next free slot is at 14:00 — up to 60 min available.
        </div>
      </SheetShell>

      {/* Reassign */}
      <SheetShell
        open={reassignOpen}
        onClose={() => setReassignOpen(false)}
        title="Reassign"
        subtitle={`${booking.client} · ${booking.service}`}
        footer={
          <SheetCta
            disabled={!newStaff || newStaff === staffName}
            onClick={() => {
              setStaffName(newStaff);
              setReassignOpen(false);
              showToast(`Reassigned to ${newStaff}`);
            }}
          >
            Reassign
          </SheetCta>
        }
      >
        <SheetSectionLabel>Available staff</SheetSectionLabel>
        {bookableStaff.map((m) => (
          <button
            key={m.id}
            onClick={() => setNewStaff(m.name)}
            className={
              'w-full flex items-center gap-3 rounded-2xl px-3.5 py-3 mb-2 border text-left transition-colors ' +
              ((newStaff ?? staffName) === m.name
                ? 'border-gray-900 border-[1.5px]'
                : 'border-gray-100 hover:bg-gray-50')
            }
          >
            <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-[11px] font-semibold text-gray-500 shrink-0">
              {m.initials}
            </div>
            <div className="flex-1">
              <div className="text-[14px] font-medium text-gray-900">{m.name}</div>
              <div className="text-[12px] text-gray-400">{m.role}</div>
            </div>
            {m.name === staffName && <span className="text-[11px] text-gray-400">Current</span>}
          </button>
        ))}
      </SheetShell>

      {/* No show */}
      <ConfirmSheet
        open={noShowOpen}
        onClose={() => setNoShowOpen(false)}
        title="Mark as no-show?"
        message={`${booking.client} didn't turn up for ${booking.service} at ${booking.time}. This will be noted on their profile.`}
        confirmLabel="Mark No Show"
        onConfirm={() => {
          setStatus('No-show');
          showToast(`${booking.client} marked as no-show`);
        }}
      />
    </div>
  );
}
