import { useState, useEffect } from 'react';
import BottomSheet from '../../../components/BottomSheet';
import { productsCatalog } from '../../../data/demoProductsCatalog';

export default function OptionSheet({ open, option, onClose, onSave }) {
  const product = option ? productsCatalog.find((p) => p.id === option.productId) : null;

  const [priceMode, setPriceMode] = useState('included');
  const [priceAmount, setPriceAmount] = useState('');
  const [durationMode, setDurationMode] = useState('same');
  const [durationAdd, setDurationAdd] = useState('');

  useEffect(() => {
    if (!open || !option) return;
    setPriceMode(option.priceMode || 'included');
    setPriceAmount(option.priceAmount || '');
    setDurationMode(option.durationMode || 'same');
    setDurationAdd(option.durationAdd || '');
  }, [open, option]);

  const save = () => {
    onSave({
      priceMode,
      priceAmount: priceMode === 'add' ? priceAmount : '',
      durationMode,
      durationAdd: durationMode === 'add' ? durationAdd : '',
    });
    onClose();
  };

  if (!product) return null;

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={product.name}
      footer={
        <button
          onClick={save}
          className="w-full h-12 rounded-full bg-gray-900 hover:bg-gray-800 text-white text-[15px] font-medium transition-colors"
        >
          Save
        </button>
      }
    >
      <div className="space-y-5">
        <div className="text-[13px] text-gray-500">
          {product.category} · catalog £{product.basePrice}
        </div>

        {/* Price */}
        <div>
          <div className="text-[13px] font-medium text-gray-700 mb-2">Price</div>
          <div className="grid grid-cols-2 gap-2 bg-gray-50 rounded-2xl p-1">
            {[{ k: 'included', label: 'Included' }, { k: 'add', label: '+ £' }].map((m) => (
              <button
                key={m.k}
                onClick={() => setPriceMode(m.k)}
                className={'py-2.5 rounded-xl text-[14px] font-medium transition-colors ' + (priceMode === m.k ? 'bg-white text-gray-900' : 'text-gray-500')}
              >
                {m.label}
              </button>
            ))}
          </div>
          {priceMode === 'add' && (
            <div className="flex items-center gap-2 bg-gray-50 rounded-2xl px-4 py-3.5 mt-2">
              <span className="text-[18px] text-gray-500">+ £</span>
              <input
                type="number"
                value={priceAmount}
                onChange={(e) => setPriceAmount(e.target.value)}
                placeholder="0"
                autoFocus
                className="flex-1 text-[18px] font-medium bg-transparent outline-none placeholder:text-gray-300"
              />
            </div>
          )}
        </div>

        {/* Duration */}
        <div>
          <div className="text-[13px] font-medium text-gray-700 mb-2">Duration</div>
          <div className="grid grid-cols-2 gap-2 bg-gray-50 rounded-2xl p-1">
            {[{ k: 'same', label: 'No change' }, { k: 'add', label: '+ min' }].map((m) => (
              <button
                key={m.k}
                onClick={() => setDurationMode(m.k)}
                className={'py-2.5 rounded-xl text-[14px] font-medium transition-colors ' + (durationMode === m.k ? 'bg-white text-gray-900' : 'text-gray-500')}
              >
                {m.label}
              </button>
            ))}
          </div>
          {durationMode === 'add' && (
            <div className="flex items-center gap-2 bg-gray-50 rounded-2xl px-4 py-3.5 mt-2">
              <span className="text-[18px] text-gray-500">+</span>
              <input
                type="number"
                value={durationAdd}
                onChange={(e) => setDurationAdd(e.target.value)}
                placeholder="0"
                className="flex-1 text-[18px] font-medium bg-transparent outline-none placeholder:text-gray-300"
              />
              <span className="text-[14px] text-gray-500">min</span>
            </div>
          )}
        </div>
      </div>
    </BottomSheet>
  );
}
