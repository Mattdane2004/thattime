import { useState } from 'react';
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import { Plus, Trash2, Pencil, Check } from 'lucide-react';
import ScreenHeader from '../../../components/ScreenHeader';
import TextField from '../../../components/TextField';
import { offerBasePath } from '../../routeBase';

const PRESETS = [
  { sessions: 5,  label: '5-class pack',  note: 'Popular starter pack' },
  { sessions: 10, label: '10-class pack', note: 'Best value' },
  { sessions: 20, label: '20-class pack', note: 'Committed learner' },
];

function uid() {
  return 'sp_' + Math.random().toString(36).slice(2, 8);
}

const EXPIRY_MODES = [
  { key: 'never',  label: 'No expiry' },
  { key: 'days',   label: 'Expires after days' },
  { key: 'months', label: 'Expires after months' },
];

export default function ClassSessionPacks() {
  const navigate = useNavigate();
  const location = useLocation();
  const { draft, updateDraft } = useOutletContext();
  const packs = draft.sessionPacks || [];
  const [sheet, setSheet] = useState(null);
  const returnPath = offerBasePath(draft, location);

  const openNew = (preset = null) =>
    setSheet({
      mode: 'new',
      id: uid(),
      label: preset?.label || '',
      sessions: preset ? String(preset.sessions) : '',
      price: '',
      note: preset?.note || '',
      expiryMode: 'never',
      expiryValue: '',
    });

  const openEdit = (pack) => setSheet({ mode: 'edit', ...pack });

  const save = (data) => {
    const { mode, ...pack } = data;
    updateDraft({
      sessionPacks: mode === 'new' ? [...packs, pack] : packs.map((p) => (p.id === pack.id ? pack : p)),
    });
    setSheet(null);
  };

  const remove = (id) => updateDraft({ sessionPacks: packs.filter((p) => p.id !== id) });

  const unusedPresets = PRESETS.filter((p) => !packs.some((pk) => pk.label === p.label));

  // Per-session savings vs individual price
  const singlePrice = Number(draft.price) || 0;

  return (
    <>
      <ScreenHeader title="Session packs" onBack={() => navigate(returnPath)} />
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-6">
        <p className="text-[14px] text-gray-500 mb-5 leading-snug">
          Let clients buy multiple sessions upfront at a discounted rate.
          {singlePrice > 0 && ` Single session is £${singlePrice}.`}
        </p>

        {/* Pack list */}
        {packs.length > 0 && (
          <div className="mb-5 space-y-2">
            {packs.map((pack) => {
              const ppSession = pack.price && pack.sessions
                ? (Number(pack.price) / Number(pack.sessions)).toFixed(2)
                : null;
              const saving = singlePrice && ppSession
                ? (singlePrice - Number(ppSession)).toFixed(2)
                : null;

              return (
                <div key={pack.id} className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-[15px] font-medium text-gray-900 truncate">{pack.label || 'Untitled pack'}</div>
                    <div className="text-[13px] text-gray-500 mt-0.5">
                      {pack.sessions && `${pack.sessions} sessions`}
                      {pack.price && ` · £${pack.price}`}
                      {ppSession && ` (£${ppSession}/session`}
                      {saving && Number(saving) > 0 && ` · save £${saving}`}
                      {ppSession && ')'}
                    </div>
                    {pack.note && (
                      <div className="text-[12px] text-gray-400 mt-0.5">{pack.note}</div>
                    )}
                  </div>
                  <button
                    onClick={() => openEdit(pack)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-white transition-colors"
                  >
                    <Pencil size={15} strokeWidth={1.75} />
                  </button>
                  <button
                    onClick={() => remove(pack.id)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-white transition-colors"
                  >
                    <Trash2 size={15} strokeWidth={1.75} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Presets */}
        {unusedPresets.length > 0 && (
          <div className="mb-5">
            <div className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Quick add</div>
            <div className="flex flex-wrap gap-2">
              {unusedPresets.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => openNew(preset)}
                  className="flex items-center gap-1.5 h-8 px-3 rounded-full bg-gray-100 text-[13px] font-medium text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  <Plus size={13} strokeWidth={2.5} />
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={() => openNew()}
          className="w-full flex items-center justify-center gap-2 h-12 rounded-2xl border-2 border-dashed border-gray-200 text-[14px] font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700 transition-colors"
        >
          <Plus size={16} strokeWidth={2} />
          Add custom pack
        </button>
      </div>

      <div className="px-5 pb-5 pt-3 shrink-0 bg-white border-t border-gray-100">
        <button
          onClick={() => navigate(returnPath)}
          className="w-full h-12 rounded-full bg-gray-900 hover:bg-gray-800 text-white text-[15px] font-medium transition-colors"
        >
          Done · {packs.length} pack{packs.length === 1 ? '' : 's'}
        </button>
      </div>

      {sheet && (
        <PackSheet data={sheet} onSave={save} onClose={() => setSheet(null)} />
      )}
    </>
  );
}

function PackSheet({ data, onSave, onClose }) {
  const [label,       setLabel]       = useState(data.label);
  const [sessions,    setSessions]    = useState(data.sessions);
  const [price,       setPrice]       = useState(data.price);
  const [note,        setNote]        = useState(data.note);
  const [expiryMode,  setExpiryMode]  = useState(data.expiryMode || 'never');
  const [expiryValue, setExpiryValue] = useState(data.expiryValue || '');

  const canSave = label.trim() && sessions && price;

  return (
    <>
      <div className="absolute inset-0 bg-black/30 z-20" onClick={onClose} />
      <div className="absolute bottom-0 left-0 right-0 z-30 bg-white rounded-t-3xl px-5 pt-5 pb-6 space-y-4">
        <div className="flex items-center justify-between mb-1">
          <div className="text-[17px] font-semibold">
            {data.mode === 'new' ? 'New session pack' : 'Edit pack'}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
          >
            ✕
          </button>
        </div>

        <TextField label="Label" value={label} onChange={setLabel} placeholder="e.g. 10-class pack" />

        <div className="grid grid-cols-2 gap-3">
          <TextField label="Sessions" type="number" value={sessions} onChange={setSessions} placeholder="10" />
          <TextField label="Pack price (£)" type="number" value={price} onChange={setPrice} placeholder="100" />
        </div>

        <TextField
          label="Note (optional)"
          value={note}
          onChange={setNote}
          placeholder="e.g. Best value — save 20%"
        />

        {/* Expiry */}
        <div>
          <div className="text-[13px] font-medium text-gray-700 mb-2">Pack validity</div>
          <div className="space-y-1.5">
            {EXPIRY_MODES.map(({ key, label: lbl }) => (
              <button
                key={key}
                onClick={() => setExpiryMode(key)}
                className={
                  'w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left text-[13px] font-medium transition-colors ' +
                  (expiryMode === key ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100')
                }
              >
                <div
                  className={
                    'w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ' +
                    (expiryMode === key ? 'border-white' : 'border-gray-400')
                  }
                >
                  {expiryMode === key && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                {lbl}
              </button>
            ))}
          </div>
          {expiryMode !== 'never' && (
            <div className="mt-2">
              <TextField
                label={expiryMode === 'days' ? 'Days' : 'Months'}
                type="number"
                value={expiryValue}
                onChange={setExpiryValue}
                placeholder={expiryMode === 'days' ? '90' : '6'}
              />
            </div>
          )}
        </div>

        <button
          onClick={() => onSave({ mode: data.mode, id: data.id, label, sessions, price, note, expiryMode, expiryValue })}
          disabled={!canSave}
          className={
            'w-full h-12 rounded-full flex items-center justify-center gap-2 text-[15px] font-medium transition-colors ' +
            (canSave ? 'bg-gray-900 hover:bg-gray-800 text-white' : 'bg-gray-100 text-gray-400')
          }
        >
          <Check size={16} strokeWidth={2.5} />
          {data.mode === 'new' ? 'Add pack' : 'Save changes'}
        </button>
      </div>
    </>
  );
}
