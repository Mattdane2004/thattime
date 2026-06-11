import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Clock,
  Check,
  MessageSquare,
  CreditCard,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Flag,
  FileText,
  BellRing,
} from 'lucide-react';
import { useMainActions } from './MainActionsContext';
import { parseTimeToMinutes } from '../../data/scheduleData';
import { getClientDetail } from '../../data/clientsDirectory';

// Bundle sheet — several services in one booking, shown as a checklist
// timeline: tick each service off as it's delivered, the next one is always
// obvious, and checkout unlocks when everything's done.

const fmt = (mins) =>
  `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;

// Each service's start/end computed from the bundle start time.
function buildSteps(bundle) {
  let cursor = parseTimeToMinutes(bundle.start);
  return bundle.services.map((s, i) => {
    const step = { ...s, index: i, from: fmt(cursor), to: fmt(cursor + s.minutes) };
    cursor += s.minutes;
    return step;
  });
}

export default function BundleSheet({ bundle, onClose }) {
  const navigate = useNavigate();
  const { showToast, clientExtras } = useMainActions();
  const [done, setDone] = useState([]);
  const [headsUpOpen, setHeadsUpOpen] = useState(false);

  if (!bundle) return null;

  const steps = buildSteps(bundle);

  // Heads-ups before the booking: client staff alert + severe allergy from the
  // record, plus the bundle's own forms (pending ones flagged first).
  const profile = getClientDetail(bundle.clientId);
  const extras = clientExtras[bundle.clientId] || {};
  const staffAlert = extras.staffAlert !== undefined ? extras.staffAlert : profile?.staffAlert;
  const allergies = [...(profile?.allergies || []), ...(extras.allergies || [])];
  const severeAllergy = allergies.find((a) => a.severity === 'Severe');
  const pendingForms = (bundle.forms || []).filter((f) => f.status !== 'Completed');
  const headsUps = [
    staffAlert && { icon: Flag, tone: 'dark', text: `Staff alert: ${staffAlert}` },
    severeAllergy && {
      icon: AlertTriangle,
      tone: 'strong',
      text: `Severe allergy · ${severeAllergy.name}${severeAllergy.patchTestRequired ? ' — patch test required' : ''}`,
    },
    ...pendingForms.map((f) => ({
      icon: BellRing,
      tone: 'soft',
      text: `Form pending · ${f.name}`,
    })),
  ].filter(Boolean);
  const total = bundle.services.reduce((sum, s) => sum + s.minutes, 0);
  const totalLabel = `${Math.floor(total / 60)}h${total % 60 ? ` ${total % 60}m` : ''}`;
  const currentIndex = steps.findIndex((s) => !done.includes(s.index));
  const allDone = done.length === steps.length;

  const toggle = (i) => {
    setDone((d) => (d.includes(i) ? d.filter((x) => x !== i) : [...d, i]));
    if (!done.includes(i) && i === steps.length - 1 && done.length === steps.length - 1) {
      showToast('All services done — ready to check out');
    }
  };

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
              {bundle.initials}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[16px] font-bold text-gray-900 truncate">{bundle.name}</span>
                <span className="shrink-0 text-[10px] font-semibold bg-gray-900 text-white rounded-full px-2 py-0.5">
                  Bundle
                </span>
              </div>
              <div className="text-[12px] text-gray-500 mt-0.5">{bundle.client}</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 -mt-1 -mr-1 rounded-full flex items-center justify-center hover:bg-gray-100 shrink-0"
            aria-label="Close"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-3 text-[12px] text-gray-600 mt-3 flex-wrap">
          <span className="flex items-center gap-1 font-semibold text-gray-900">
            <Clock size={12} strokeWidth={1.75} className="text-gray-400" />
            {bundle.start} · {totalLabel}
          </span>
          <span>{steps.length} services</span>
          <span className="font-semibold text-gray-900">{bundle.price}</span>
        </div>
        <div className="text-[11px] text-gray-400 mt-1">{bundle.deposit}</div>

        {/* Heads-up — collapsed card (allergies, alerts, pending forms) */}
        {headsUps.length > 0 && (
          <>
            <button
              onClick={() => setHeadsUpOpen((v) => !v)}
              className="w-full flex items-center gap-3 border border-gray-200 rounded-2xl px-4 py-3 mt-3 text-left hover:bg-gray-50 transition-colors"
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

        {/* Forms */}
        {bundle.forms?.length > 0 && (
          <div className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3 mt-3">
            <FileText size={15} className="text-gray-500 shrink-0" strokeWidth={1.75} />
            <span className="flex-1 text-[12px] text-gray-700">
              {bundle.forms.filter((f) => f.status === 'Completed').length}/{bundle.forms.length} forms
              complete
            </span>
            <button
              onClick={() => navigate(`/clients/${bundle.clientId}/record`)}
              className="text-[12px] font-semibold text-gray-900 hover:underline shrink-0"
            >
              View
            </button>
          </div>
        )}

        {/* Progress */}
        <div className="flex items-center gap-3 mt-3">
          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gray-900 rounded-full transition-all"
              style={{ width: `${(done.length / steps.length) * 100}%` }}
            />
          </div>
          <span className="text-[11px] text-gray-500 font-medium shrink-0">
            {done.length} of {steps.length} done
          </span>
        </div>

        {/* Checklist timeline */}
        <div className="mt-4">
          {steps.map((step, i) => {
            const isDone = done.includes(step.index);
            const isCurrent = currentIndex === i && !allDone;
            return (
              <div key={step.index} className="flex gap-3">
                {/* Timeline rail */}
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => toggle(step.index)}
                    className={
                      'w-7 h-7 rounded-full border-[1.5px] flex items-center justify-center shrink-0 transition-colors ' +
                      (isDone
                        ? 'bg-gray-900 border-gray-900'
                        : isCurrent
                          ? 'border-gray-900 bg-white'
                          : 'border-gray-300 bg-white')
                    }
                    aria-label={isDone ? `Undo ${step.name}` : `Mark ${step.name} done`}
                  >
                    {isDone && <Check size={14} className="text-white" strokeWidth={2.5} />}
                    {isCurrent && !isDone && (
                      <span className="w-2.5 h-2.5 rounded-full bg-gray-900" />
                    )}
                  </button>
                  {i < steps.length - 1 && (
                    <div className={'w-px flex-1 my-1 ' + (isDone ? 'bg-gray-900' : 'bg-gray-200')} />
                  )}
                </div>
                {/* Step card */}
                <div
                  className={
                    'flex-1 rounded-2xl px-4 py-3 mb-2.5 ' +
                    (isCurrent
                      ? 'border-[1.5px] border-gray-900'
                      : isDone
                        ? 'bg-gray-50 opacity-60'
                        : 'bg-gray-50')
                  }
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={
                        'text-[14px] font-semibold text-gray-900 ' +
                        (isDone ? 'line-through' : '')
                      }
                    >
                      {step.name}
                    </span>
                    <span className="text-[12px] font-semibold text-gray-900 shrink-0">
                      {step.price}
                    </span>
                  </div>
                  <div className="text-[12px] text-gray-500 mt-0.5">
                    {step.from} – {step.to} · {step.staff}
                    {isCurrent && <span className="font-semibold text-gray-900"> · Up now</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2.5 mt-2">
          <button
            onClick={() => navigate(`/messages/${bundle.clientId}`)}
            className="flex items-center justify-center gap-1.5 bg-gray-50 rounded-xl py-2.5 text-[12px] font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <MessageSquare size={14} strokeWidth={1.75} />
            Message {bundle.client.split(' ')[0]}
          </button>
          <button
            onClick={() => showToast('Order updated — drag to reorder comes later')}
            className="flex items-center justify-center gap-1.5 bg-gray-50 rounded-xl py-2.5 text-[12px] font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <Clock size={14} strokeWidth={1.75} />
            Reorder services
          </button>
        </div>

        {/* Footer */}
        <div className="mt-4">
          <button
            onClick={() => {
              onClose();
              navigate(
                `/checkout?client=${encodeURIComponent(bundle.client)}&service=${encodeURIComponent(
                  bundle.name,
                )}&price=${bundle.price.replace('£', '')}`,
              );
            }}
            disabled={!allDone}
            className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white rounded-full py-3.5 text-[13px] font-semibold hover:bg-gray-800 transition-colors disabled:bg-gray-100 disabled:text-gray-300"
          >
            <CreditCard size={15} strokeWidth={1.75} />
            {allDone
              ? `Check out · ${bundle.price}`
              : `${steps.length - done.length} service${steps.length - done.length === 1 ? '' : 's'} remaining`}
          </button>
        </div>
      </div>
    </div>
  );
}
