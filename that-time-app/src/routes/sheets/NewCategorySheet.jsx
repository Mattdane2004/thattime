import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import BottomSheet from '../../components/BottomSheet';
import { categorySwatches } from '../../data/categories';

export default function NewCategorySheet({ open, onClose, onCreated }) {
  const { addCategory, categories } = useOutletContext();
  const [name, setName] = useState('');
  const [color, setColor] = useState(categorySwatches[0]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) return;
    setName('');
    setColor(categorySwatches[0]);
    setError(null);
  }, [open]);

  const trimmed = name.trim();
  const canSave = trimmed.length > 0;

  const handleSave = () => {
    if (!canSave) return;
    if (categories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
      setError('That category already exists');
      return;
    }
    addCategory(trimmed, color);
    onCreated?.(trimmed);
    onClose();
  };

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="New category"
      footer={
        <button
          onClick={handleSave}
          disabled={!canSave}
          className="w-full h-12 rounded-full bg-gray-900 hover:bg-gray-800 text-white text-[15px] font-medium transition-colors disabled:opacity-40"
        >
          Save
        </button>
      }
    >
      <div className="mb-6">
        <div className="text-[11px] font-medium text-gray-400 uppercase tracking-widest mb-2">Name</div>
        <input
          type="text"
          value={name}
          onChange={(e) => { setName(e.target.value); setError(null); }}
          placeholder="e.g. Lash lift"
          autoFocus
          className="w-full text-[18px] font-medium bg-gray-50 rounded-2xl px-4 py-3 outline-none placeholder:text-gray-300"
        />
        {error && <div className="text-[12px] text-red-600 mt-2">{error}</div>}
      </div>

      <div>
        <div className="text-[11px] font-medium text-gray-400 uppercase tracking-widest mb-3">Colour</div>
        <div className="grid grid-cols-6 gap-3">
          {categorySwatches.map((c) => {
            const isActive = color === c;
            return (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={
                  'aspect-square rounded-full transition ' +
                  (isActive ? 'ring-2 ring-offset-2 ring-gray-900' : 'hover:opacity-80')
                }
                style={{ backgroundColor: c }}
                aria-label={`Pick ${c}`}
              />
            );
          })}
        </div>
      </div>
    </BottomSheet>
  );
}
