import { useOutletContext } from 'react-router-dom';
import { Info, MapPin, Minus, Plus } from 'lucide-react';
import BottomSheet from '../../components/BottomSheet';
import { defaultMobileProfile } from '../../data/business';

export default function MobileSheet({ open, onClose }) {
  const { draft, updateDraft } = useOutletContext();
  // Defensive: merge defaults so inputs are always controlled
  const m = { ...defaultMobileProfile, ...draft.locations.mobile };

  const set = (patch) =>
    updateDraft({
      locations: { ...draft.locations, mobile: { ...m, enabled: true, ...patch } },
    });

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Mobile settings"
      footer={
        <button
          onClick={onClose}
          className="w-full h-12 rounded-full bg-gray-900 hover:bg-gray-800 text-white text-[15px] font-medium transition-colors"
        >
          Save settings
        </button>
      }
    >
      {/* Defaults banner */}
      <div className="flex items-start gap-2 bg-gray-50 rounded-xl px-3 py-2.5 mb-5">
        <Info size={14} className="text-gray-500 shrink-0 mt-0.5" strokeWidth={1.75} />
        <div className="text-[12px] text-gray-600 leading-snug">
          Defaults loaded from your business settings.
        </div>
      </div>

      {/* Base address */}
      <div className="mb-5">
        <div className="text-[13px] font-medium text-gray-700 mb-2">Base address</div>
        <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
          <MapPin size={16} className="text-gray-500 shrink-0" strokeWidth={1.75} />
          <div className="flex-1 text-[14px] truncate">{m.baseAddress}</div>
          <button className="text-[13px] text-gray-700 font-medium">Edit</button>
        </div>
      </div>

      {/* Radius slider */}
      <div className="mb-5">
        <div className="flex items-baseline justify-between mb-3">
          <div className="text-[13px] font-medium text-gray-700">Travel radius</div>
          <div className="text-[14px] text-gray-900">{m.radiusMiles} miles</div>
        </div>
        <input
          type="range"
          min={1}
          max={50}
          value={m.radiusMiles}
          onChange={(e) => set({ radiusMiles: Number(e.target.value) })}
          className="w-full accent-gray-900"
        />
        <div className="flex justify-between text-[11px] text-gray-500 mt-1">
          <span>1 mile</span>
          <span>50 miles</span>
        </div>
      </div>

      {/* Travel fee */}
      <div className="mb-5">
        <div className="text-[13px] font-medium text-gray-700 mb-2">Travel fee</div>
        <div className="grid grid-cols-2 gap-2 mb-2 bg-gray-50 rounded-xl p-1">
          {[
            { key: 'flat', label: 'Flat rate', sub: 'Per booking' },
            { key: 'perMile', label: 'Per mile', sub: 'By distance' },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => set({ feeType: t.key })}
              className={
                'py-2.5 rounded-lg text-center transition-colors ' +
                (m.feeType === t.key ? 'bg-white' : 'hover:bg-white/50')
              }
            >
              <div className="text-[14px] font-medium text-gray-900">{t.label}</div>
              <div className="text-[11px] text-gray-500 mt-0.5">{t.sub}</div>
            </button>
          ))}
        </div>
        <div className="bg-gray-50 rounded-xl px-4 py-3 flex items-baseline gap-2">
          <span className="text-[18px] text-gray-500">£</span>
          <input
            type="number"
            value={m.feeAmount}
            onChange={(e) => set({ feeAmount: e.target.value })}
            className="flex-1 min-w-0 text-[18px] font-medium bg-transparent outline-none"
          />
          <span className="text-[12px] text-gray-500">
            {m.feeType === 'flat' ? 'per booking' : 'per mile'}
          </span>
        </div>
      </div>

      {/* Booking notice */}
      <div>
        <div className="text-[13px] font-medium text-gray-700 mb-2">Minimum booking notice</div>
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center bg-gray-50 rounded-xl">
            <button
              onClick={() => set({ noticeValue: Math.max(0, (m.noticeValue || 0) - 1) })}
              className="w-12 h-12 flex items-center justify-center text-gray-700 hover:bg-gray-100 rounded-l-xl"
              aria-label="Decrease"
            >
              <Minus size={16} strokeWidth={1.75} />
            </button>
            <input
              type="number"
              value={m.noticeValue}
              onChange={(e) => set({ noticeValue: Number(e.target.value) || 0 })}
              className="flex-1 text-center text-[18px] font-medium bg-transparent outline-none"
            />
            <button
              onClick={() => set({ noticeValue: (m.noticeValue || 0) + 1 })}
              className="w-12 h-12 flex items-center justify-center text-gray-700 hover:bg-gray-100 rounded-r-xl"
              aria-label="Increase"
            >
              <Plus size={16} strokeWidth={1.75} />
            </button>
          </div>
          <div className="flex bg-gray-50 rounded-xl p-1">
            {[
              { key: 'hours', label: 'Hours' },
              { key: 'days', label: 'Days' },
            ].map((u) => (
              <button
                key={u.key}
                onClick={() => set({ noticeUnit: u.key })}
                className={
                  'px-3 py-2 rounded-lg text-[13px] transition-colors ' +
                  (m.noticeUnit === u.key ? 'bg-white text-gray-900' : 'text-gray-600')
                }
              >
                {u.label}
              </button>
            ))}
          </div>
        </div>
        <div className="text-[12px] text-gray-500 mt-2 leading-snug">
          Clients must book at least {m.noticeValue} {m.noticeUnit} in advance.
        </div>
      </div>
    </BottomSheet>
  );
}
