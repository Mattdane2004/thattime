import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Plus, X } from 'lucide-react';
import ScreenHeader from '../../../components/ScreenHeader';
import { emptyAdvancedOptions } from '../../../data/advancedOptions';

const mergedRequirements = (incoming = {}) => {
  const defaults = emptyAdvancedOptions().requirements;
  return {
    ...defaults,
    ...incoming,
    bring: { ...defaults.bring, ...(incoming.bring || {}) },
    equipment: { ...defaults.equipment, ...(incoming.equipment || {}) },
  };
};

export default function EquipmentBring() {
  const navigate = useNavigate();
  const { draft, updateDraft } = useOutletContext();
  const ao = draft.advancedOptions || emptyAdvancedOptions();
  const r = mergedRequirements(ao.requirements);
  const [input, setInput] = useState('');
  const items = [
    ...(r.equipment?.items || []).map((item, index) => ({ item, source: 'equipment', sourceIndex: index })),
    ...(r.bring?.items || []).map((item, index) => ({ item, source: 'bring', sourceIndex: index })),
  ];

  const update = (patch) =>
    updateDraft({
      advancedOptions: { ...ao, requirements: { ...r, ...patch } },
    });

  const updateNested = (key, patch) =>
    update({ [key]: { ...r[key], ...patch } });

  const addItem = () => {
    const item = input.trim();
    if (!item) return;
    updateNested('equipment', {
      enabled: true,
      items: [...(r.equipment?.items || []), item],
    });
    setInput('');
  };

  const removeItem = ({ source, sourceIndex }) =>
    updateNested(source, {
      items: (r[source]?.items || []).filter((_, itemIndex) => itemIndex !== sourceIndex),
    });

  return (
    <>
      <ScreenHeader title="Equipment & what to bring" onBack={() => navigate('/class')} />
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-6 space-y-5">
        <p className="text-[14px] text-gray-500 leading-snug">
          Keep kit, tools, stock, PPE, and student preparation items together so they are easier to manage.
        </p>

        <div className="bg-gray-50 rounded-2xl overflow-hidden">
          <div className="p-4">
            <div className="text-[15px] font-medium text-gray-900">Kit, PPE and student items</div>
            <div className="text-[12px] text-gray-500 mt-0.5 leading-snug">
              Add tools, products, safety equipment, or anything students need to bring.
            </div>
          </div>

          <div className="border-t border-white px-4 py-3">
            {items.length > 0 && (
              <div className="space-y-1.5 mb-3">
                {items.map((entry) => (
                  <div key={`${entry.source}-${entry.item}-${entry.sourceIndex}`} className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl">
                    <span className="flex-1 text-[14px] text-gray-900">{entry.item}</span>
                    <button
                      onClick={() => removeItem(entry)}
                      aria-label="Remove"
                      className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center"
                    >
                      <X size={14} className="text-gray-500" strokeWidth={1.75} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    addItem();
                  }
                }}
                placeholder="e.g. Mannequin head, notebook, PPE"
                className="flex-1 h-11 rounded-xl bg-white border border-gray-200 px-3 text-[14px] outline-none focus:border-gray-900"
              />
              <button
                onClick={addItem}
                className="h-11 px-4 rounded-xl bg-gray-900 text-white text-[14px] font-medium hover:bg-gray-800 flex items-center gap-1"
              >
                <Plus size={14} strokeWidth={2.5} />
                Add kit
              </button>
            </div>

            {items.length === 0 && (
              <div className="text-[12px] text-gray-400 mt-3">
                Leave empty if students do not need anything specific.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-5 pb-5 pt-3 shrink-0 bg-white border-t border-gray-100">
        <button
          onClick={() => navigate('/class')}
          className="w-full h-12 rounded-full bg-gray-900 hover:bg-gray-800 text-white text-[15px] font-medium transition-colors"
        >
          Done
        </button>
      </div>
    </>
  );
}
