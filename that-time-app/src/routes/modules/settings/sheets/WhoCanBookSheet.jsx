import { useState, useEffect } from 'react';
import BottomSheet from '../../../../components/BottomSheet';
import { Check } from 'lucide-react';
import { totalActiveSubscribers } from '../../../../data/demoSubscribers';

const OPTIONS = [
  { k: 'anyone', label: 'Anyone', sub: 'All clients can book this service' },
  { k: 'existing', label: 'Existing clients only', sub: 'Only clients already in your system' },
  { k: 'subscribers', label: 'Subscribers only', sub: `${totalActiveSubscribers} active subscribers can book` },
];

export default function WhoCanBookSheet({ open, value, onClose, onSave }) {
  const [selected, setSelected] = useState(value);

  useEffect(() => {
    if (open) setSelected(value);
  }, [open, value]);

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Who can book"
      footer={
        <button
          onClick={() => {
            onSave(selected);
            onClose();
          }}
          className="w-full h-12 rounded-full bg-gray-900 hover:bg-gray-800 text-white text-[15px] font-medium transition-colors"
        >
          Save
        </button>
      }
    >
      <div className="space-y-1.5">
        {OPTIONS.map((o) => {
          const active = selected === o.k;
          return (
            <button
              key={o.k}
              onClick={() => setSelected(o.k)}
              className="w-full flex items-start gap-3 px-3 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-left transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="text-[15px] font-medium text-gray-900">{o.label}</div>
                <div className="text-[12px] text-gray-500 mt-0.5 leading-snug">{o.sub}</div>
              </div>
              <div
                className={
                  'w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-colors ' +
                  (active ? 'bg-gray-900' : 'bg-white border border-gray-300')
                }
              >
                {active && <Check size={12} className="text-white" strokeWidth={3} />}
              </div>
            </button>
          );
        })}
      </div>
    </BottomSheet>
  );
}
