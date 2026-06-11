import { useOutletContext } from 'react-router-dom';
import { Check } from 'lucide-react';
import BottomSheet from '../../components/BottomSheet';
import { remotePlatforms } from '../../data/business';

export default function RemoteSheet({ open, onClose }) {
  const { draft, updateDraft } = useOutletContext();
  const r = draft.locations.remote;
  const selected = new Set(r.platforms || []);

  const toggle = (key) => {
    const next = new Set(selected);
    next.has(key) ? next.delete(key) : next.add(key);
    const arr = Array.from(next);
    updateDraft({
      locations: { ...draft.locations, remote: { ...r, enabled: arr.length > 0, platforms: arr } },
    });
  };

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Remote settings"
      footer={
        <button
          onClick={onClose}
          className="w-full h-12 rounded-full bg-gray-900 hover:bg-gray-800 text-white text-[15px] font-medium transition-colors"
        >
          Save settings
        </button>
      }
    >
      <div className="mb-4">
        <div className="text-[13px] font-medium text-gray-700 mb-1">Platform</div>
        <div className="text-[13px] text-gray-500 leading-snug">
          Select where remote sessions take place. Choose all that apply.
        </div>
      </div>

      <div className="bg-gray-50 rounded-2xl overflow-hidden">
        {remotePlatforms.map((p, i) => {
          const isOn = selected.has(p.key);
          return (
            <button
              key={p.key}
              onClick={() => toggle(p.key)}
              className={
                'w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left hover:bg-gray-100 transition-colors ' +
                (i > 0 ? 'border-t border-white' : '')
              }
            >
              <div className="flex-1 min-w-0">
                <div className="text-[15px]">{p.label}</div>
                <div className="text-[12px] text-gray-500 mt-0.5 truncate">{p.desc}</div>
              </div>
              <div
                className={
                  'w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-colors ' +
                  (isOn ? 'bg-gray-900' : 'bg-white border border-gray-300')
                }
              >
                {isOn && <Check size={14} className="text-white" strokeWidth={2.5} />}
              </div>
            </button>
          );
        })}
      </div>
    </BottomSheet>
  );
}
