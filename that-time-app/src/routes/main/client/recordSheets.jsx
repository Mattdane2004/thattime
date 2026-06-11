import { useState } from 'react';
import SheetShell, { SheetCta, Chip, SheetSectionLabel } from '../../../components/sheets/SheetShell';
import DayPicker from '../../../components/sheets/DayPicker';
import { MiniToggle } from './clientShared';
import { useMainActions } from '../../../components/sheets/MainActionsContext';
import {
  allergySuggestions,
  allergyTypes,
  allergySeverities,
  patchTestResults,
  tagSuggestions,
  bookableServices,
  dayLabel,
} from '../../../data/bookingOptions';

// Quick-add sheets for the client record — launched from the profile ⋯ menu
// and from the Client record screen. All writes go to session clientExtras.

export function AllergySheet({ open, onClose, clientId, clientName }) {
  const { addClientExtra, showToast } = useMainActions();
  const [name, setName] = useState('');
  const [type, setType] = useState('Non-drug');
  const [severity, setSeverity] = useState('Mild');
  const [reaction, setReaction] = useState('');
  const [patchTestRequired, setPatchTestRequired] = useState(false);

  const reset = () => {
    setName('');
    setType('Non-drug');
    setSeverity('Mild');
    setReaction('');
    setPatchTestRequired(false);
  };

  return (
    <SheetShell
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title="Add allergy"
      subtitle={clientName}
      footer={
        <SheetCta
          disabled={!name.trim()}
          onClick={() => {
            addClientExtra(clientId, 'allergies', {
              id: `al_${Date.now().toString(36)}`,
              name: name.trim(),
              type,
              severity,
              reaction: reaction.trim(),
              patchTestRequired,
            });
            showToast(`${severity} allergy added — team will see it`);
            reset();
            onClose();
          }}
        >
          Add allergy
        </SheetCta>
      }
    >
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. PPD (hair dye)"
        autoFocus
        className="w-full bg-gray-50 rounded-xl px-4 h-12 text-[14px] text-gray-900 placeholder-gray-400 outline-none focus:ring-1 focus:ring-gray-900"
      />
      <div className="flex flex-wrap gap-2 mt-3">
        {allergySuggestions.map((s) => (
          <Chip key={s} selected={name === s} onClick={() => setName(s)}>
            {s}
          </Chip>
        ))}
      </div>

      <SheetSectionLabel>Type</SheetSectionLabel>
      <div className="flex flex-wrap gap-2">
        {allergyTypes.map((t) => (
          <Chip key={t} selected={type === t} onClick={() => setType(t)}>
            {t}
          </Chip>
        ))}
      </div>

      <SheetSectionLabel>Severity</SheetSectionLabel>
      <div className="flex flex-wrap gap-2">
        {allergySeverities.map((s) => (
          <Chip key={s} selected={severity === s} onClick={() => setSeverity(s)}>
            {s}
          </Chip>
        ))}
      </div>
      {severity === 'Severe' && (
        <div className="text-[12px] text-gray-500 bg-gray-50 rounded-xl px-3.5 py-3 mt-3">
          Severe allergies show as an alert on the profile and on their bookings.
        </div>
      )}

      <SheetSectionLabel>Reaction</SheetSectionLabel>
      <input
        value={reaction}
        onChange={(e) => setReaction(e.target.value)}
        placeholder="e.g. scalp irritation, swelling"
        className="w-full bg-gray-50 rounded-xl px-4 h-12 text-[14px] text-gray-900 placeholder-gray-400 outline-none focus:ring-1 focus:ring-gray-900"
      />

      <div className="flex items-center justify-between mt-5 mb-1">
        <div>
          <div className="text-[13px] text-gray-900">Patch test required</div>
          <div className="text-[11px] text-gray-400">Before any chemical service</div>
        </div>
        <MiniToggle on={patchTestRequired} onChange={setPatchTestRequired} />
      </div>
    </SheetShell>
  );
}

export function PatchTestSheet({ open, onClose, clientId, clientName }) {
  const { addClientExtra, showToast } = useMainActions();
  const [product, setProduct] = useState(null);
  const [day, setDay] = useState(4);
  const [month, setMonth] = useState(2);
  const [result, setResult] = useState('Pending');

  const reset = () => {
    setProduct(null);
    setDay(4);
    setMonth(2);
    setResult('Pending');
  };

  return (
    <SheetShell
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title="Add patch test"
      subtitle={clientName}
      footer={
        <SheetCta
          disabled={!product}
          onClick={() => {
            addClientExtra(clientId, 'patchTests', {
              id: `pt_${Date.now().toString(36)}`,
              product,
              date: `${dayLabel(day, month)} 2026`,
              result,
              retest: result === 'Passed' ? 'Retest due in 6 months' : 'Awaiting result — check in 48h',
            });
            showToast(`Patch test recorded · ${result}`);
            reset();
            onClose();
          }}
        >
          Record patch test
        </SheetCta>
      }
    >
      <SheetSectionLabel>Product / service</SheetSectionLabel>
      <div className="flex flex-wrap gap-2">
        {[...bookableServices.filter((s) => s.category === 'Colour').map((s) => s.name), 'Lash tint', 'Brow tint'].map(
          (p) => (
            <Chip key={p} selected={product === p} onClick={() => setProduct(p)}>
              {p}
            </Chip>
          ),
        )}
      </div>

      <SheetSectionLabel>Test date</SheetSectionLabel>
      <DayPicker
        selected={day}
        selectedMonth={month}
        onSelect={(d, m) => {
          setDay(d);
          setMonth(m);
        }}
      />

      <SheetSectionLabel>Result</SheetSectionLabel>
      <div className="flex flex-wrap gap-2">
        {patchTestResults.map((r) => (
          <Chip key={r} selected={result === r} onClick={() => setResult(r)}>
            {r}
          </Chip>
        ))}
      </div>
    </SheetShell>
  );
}

export function StaffAlertSheet({ open, onClose, clientId, clientName, current }) {
  const { setClientAlert, showToast } = useMainActions();
  const [text, setText] = useState(current || '');
  const [showOnBookings, setShowOnBookings] = useState(true);

  return (
    <SheetShell
      open={open}
      onClose={onClose}
      title="Staff alert"
      subtitle={`${clientName} · shown to the whole team`}
      footer={
        <div className="space-y-2.5">
          <SheetCta
            disabled={!text.trim()}
            onClick={() => {
              setClientAlert(clientId, text.trim());
              showToast('Staff alert saved');
              onClose();
            }}
          >
            Save alert
          </SheetCta>
          {current && (
            <button
              onClick={() => {
                setClientAlert(clientId, null);
                setText('');
                showToast('Staff alert removed');
                onClose();
              }}
              className="w-full rounded-full py-3.5 text-[14px] font-semibold border border-gray-200 text-gray-900 hover:bg-gray-50 transition-colors"
            >
              Remove alert
            </button>
          )}
        </div>
      }
    >
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="e.g. Always confirm by phone — texts often bounce"
        rows={3}
        autoFocus
        className="w-full bg-gray-50 rounded-xl px-4 py-3 text-[14px] text-gray-900 placeholder-gray-400 outline-none resize-none focus:ring-1 focus:ring-gray-900"
      />
      <div className="flex items-center justify-between mt-4">
        <div>
          <div className="text-[13px] text-gray-900">Show on their bookings</div>
          <div className="text-[11px] text-gray-400">The alert appears on every appointment</div>
        </div>
        <MiniToggle on={showOnBookings} onChange={setShowOnBookings} />
      </div>
    </SheetShell>
  );
}

export function TagSheet({ open, onClose, clientId, clientName, existingTags = [] }) {
  const { addClientExtra, showToast } = useMainActions();
  const [tag, setTag] = useState('');

  const existing = existingTags.map((t) => t.label);

  return (
    <SheetShell
      open={open}
      onClose={onClose}
      title="Add tag"
      subtitle={clientName}
      footer={
        <SheetCta
          disabled={!tag.trim() || existing.includes(tag.trim())}
          onClick={() => {
            addClientExtra(clientId, 'tags', { label: tag.trim(), tone: 'light' });
            showToast(`Tagged · ${tag.trim()}`);
            setTag('');
            onClose();
          }}
        >
          Add tag
        </SheetCta>
      }
    >
      <input
        value={tag}
        onChange={(e) => setTag(e.target.value)}
        placeholder="Type a tag…"
        autoFocus
        className="w-full bg-gray-50 rounded-xl px-4 h-12 text-[14px] text-gray-900 placeholder-gray-400 outline-none focus:ring-1 focus:ring-gray-900"
      />
      <SheetSectionLabel>Suggestions</SheetSectionLabel>
      <div className="flex flex-wrap gap-2">
        {tagSuggestions
          .filter((s) => !existing.includes(s))
          .map((s) => (
            <Chip key={s} selected={tag === s} onClick={() => setTag(s)}>
              {s}
            </Chip>
          ))}
      </div>
    </SheetShell>
  );
}

export function NoteSheet({ open, onClose, clientId, clientName }) {
  const { addClientExtra, showToast } = useMainActions();
  const [text, setText] = useState('');

  return (
    <SheetShell
      open={open}
      onClose={onClose}
      title="Add note"
      subtitle={`${clientName} · profile note`}
      footer={
        <SheetCta
          disabled={!text.trim()}
          onClick={() => {
            addClientExtra(clientId, 'notes', {
              time: 'Today, just now · You',
              text: text.trim(),
            });
            showToast('Note added to profile');
            setText('');
            onClose();
          }}
        >
          Add note
        </SheetCta>
      }
    >
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Anything the team should know — no appointment needed…"
        rows={3}
        autoFocus
        className="w-full bg-gray-50 rounded-xl px-4 py-3 text-[14px] text-gray-900 placeholder-gray-400 outline-none resize-none focus:ring-1 focus:ring-gray-900"
      />
    </SheetShell>
  );
}
