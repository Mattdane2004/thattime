import { useState, useEffect } from 'react';
import BottomSheet from '../../../components/BottomSheet';

const numOrEmpty = (v) => (v !== 0 && v != null ? String(v) : '');
const toNum = (v) => (v === '' ? 0 : Number(v));

export default function AttachmentSheet({ open, resourceName, attachment, onClose, onSave }) {
  const [timingMode, setTimingMode] = useState('whole');
  const [timingPreset, setTimingPreset] = useState('first');
  const [firstMin, setFirstMin] = useState('');
  const [lastMin, setLastMin] = useState('');
  const [windowStart, setWindowStart] = useState('');
  const [windowEnd, setWindowEnd] = useState('');
  const [setupMin, setSetupMin] = useState('');
  const [cleanupMin, setCleanupMin] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!open) return;
    const mode = attachment?.timingMode || 'whole';
    setTimingMode(mode === 'whole' ? 'whole' : 'partial');
    setTimingPreset(mode === 'whole' ? 'first' : mode);
    setFirstMin(numOrEmpty(attachment?.firstMin));
    setLastMin(numOrEmpty(attachment?.lastMin));
    setWindowStart(numOrEmpty(attachment?.windowStart));
    setWindowEnd(numOrEmpty(attachment?.windowEnd));
    setSetupMin(numOrEmpty(attachment?.setupMin));
    setCleanupMin(numOrEmpty(attachment?.cleanupMin));
    setNote(attachment?.note || '');
  }, [open, attachment]);

  const save = () => {
    const resolvedTimingMode = timingMode === 'whole' ? 'whole' : timingPreset;
    onSave({
      timingMode: resolvedTimingMode,
      firstMin: resolvedTimingMode === 'first' ? toNum(firstMin) : 0,
      lastMin: resolvedTimingMode === 'last' ? toNum(lastMin) : 0,
      windowStart: resolvedTimingMode === 'window' ? toNum(windowStart) : 0,
      windowEnd: resolvedTimingMode === 'window' ? toNum(windowEnd) : 0,
      setupMin: toNum(setupMin),
      cleanupMin: toNum(cleanupMin),
      note,
    });
    onClose();
  };

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={resourceName || 'Attachment'}
      footer={
        <button
          onClick={save}
          className="w-full h-12 rounded-full bg-gray-900 hover:bg-gray-800 text-white text-[15px] font-medium transition-colors"
        >
          Save customisation
        </button>
      }
    >
      <div className="space-y-6">
        {/* Reservation window */}
        <div>
          <div className="text-[13px] font-medium text-gray-700 mb-2">Reservation window</div>
          <div className="grid grid-cols-2 gap-2 bg-gray-50 rounded-2xl p-1">
            {[
              { k: 'whole', label: 'Whole session' },
              { k: 'partial', label: 'Partial' },
            ].map((m) => (
              <button
                key={m.k}
                onClick={() => setTimingMode(m.k)}
                className={
                  'py-2.5 rounded-xl text-[14px] font-medium transition-colors ' +
                  (timingMode === m.k ? 'bg-white text-gray-900' : 'text-gray-500')
                }
              >
                {m.label}
              </button>
            ))}
          </div>

          {timingMode === 'partial' && (
            <div className="mt-3 space-y-3">
              <div className="grid grid-cols-3 gap-2 bg-gray-50 rounded-2xl p-1">
                {[
                  { k: 'first', label: 'First' },
                  { k: 'last', label: 'Last' },
                  { k: 'window', label: 'Window' },
                ].map((p) => (
                  <button
                    key={p.k}
                    onClick={() => setTimingPreset(p.k)}
                    className={
                      'py-2 rounded-xl text-[13px] font-medium transition-colors ' +
                      (timingPreset === p.k ? 'bg-white text-gray-900' : 'text-gray-500')
                    }
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {timingPreset === 'first' && (
                <div className="flex items-center gap-2 bg-gray-50 rounded-2xl px-4 py-3.5">
                  <input
                    type="number"
                    value={firstMin}
                    onChange={(e) => setFirstMin(e.target.value)}
                    placeholder="15"
                    autoFocus
                    className="w-16 text-[18px] font-medium bg-transparent outline-none placeholder:text-gray-300"
                  />
                  <span className="text-[14px] text-gray-500">min from start</span>
                </div>
              )}

              {timingPreset === 'last' && (
                <div className="flex items-center gap-2 bg-gray-50 rounded-2xl px-4 py-3.5">
                  <input
                    type="number"
                    value={lastMin}
                    onChange={(e) => setLastMin(e.target.value)}
                    placeholder="15"
                    autoFocus
                    className="w-16 text-[18px] font-medium bg-transparent outline-none placeholder:text-gray-300"
                  />
                  <span className="text-[14px] text-gray-500">min before end</span>
                </div>
              )}

              {timingPreset === 'window' && (
                <div className="flex items-center gap-2 bg-gray-50 rounded-2xl px-4 py-3.5">
                  <span className="text-[14px] text-gray-500">From</span>
                  <input
                    type="number"
                    value={windowStart}
                    onChange={(e) => setWindowStart(e.target.value)}
                    placeholder="15"
                    className="w-16 text-[18px] font-medium bg-transparent outline-none placeholder:text-gray-300"
                  />
                  <span className="text-[14px] text-gray-500">to</span>
                  <input
                    type="number"
                    value={windowEnd}
                    onChange={(e) => setWindowEnd(e.target.value)}
                    placeholder="45"
                    className="w-16 text-[18px] font-medium bg-transparent outline-none placeholder:text-gray-300"
                  />
                  <span className="text-[14px] text-gray-500">min</span>
                </div>
              )}
            </div>
          )}

          <div className="text-[12px] text-gray-500 mt-2 leading-snug">
            {timingMode === 'whole'
              ? 'Resource is reserved for the entire booking.'
              : 'Resource is reserved only during this slice of the booking — free the rest of the time.'}
          </div>
        </div>

        {/* Buffer */}
        <div>
          <div className="text-[13px] font-medium text-gray-700 mb-2">Buffer time</div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-[11px] text-gray-500 mb-1.5 uppercase tracking-wide">Before</div>
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5">
                <span className="text-[15px] text-gray-500">+</span>
                <input
                  type="number"
                  value={setupMin}
                  onChange={(e) => setSetupMin(e.target.value)}
                  placeholder="0"
                  className="flex-1 w-full text-[16px] font-medium bg-transparent outline-none placeholder:text-gray-300 min-w-0"
                />
                <span className="text-[12px] text-gray-500">min</span>
              </div>
            </div>
            <div>
              <div className="text-[11px] text-gray-500 mb-1.5 uppercase tracking-wide">After</div>
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5">
                <span className="text-[15px] text-gray-500">+</span>
                <input
                  type="number"
                  value={cleanupMin}
                  onChange={(e) => setCleanupMin(e.target.value)}
                  placeholder="0"
                  className="flex-1 w-full text-[16px] font-medium bg-transparent outline-none placeholder:text-gray-300 min-w-0"
                />
                <span className="text-[12px] text-gray-500">min</span>
              </div>
            </div>
          </div>
          <div className="text-[12px] text-gray-500 mt-2 leading-snug">
            Extra reservation time either side of the booking. Blocks other bookings from grabbing the resource in between.
          </div>
        </div>

        {/* Note */}
        <div>
          <div className="text-[13px] font-medium text-gray-700 mb-2">
            Staff note <span className="font-normal text-gray-400">(optional)</span>
          </div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Pre-heat 15 minutes before use"
            rows={3}
            className="w-full bg-gray-50 rounded-2xl px-4 py-3 text-[14px] outline-none placeholder:text-gray-300 resize-none"
          />
          <div className="text-[12px] text-gray-500 mt-1 leading-snug">
            Visible to staff only — never shown to clients.
          </div>
        </div>
      </div>
    </BottomSheet>
  );
}
