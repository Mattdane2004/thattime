import { useOutletContext } from 'react-router-dom';
import BottomSheet from '../../components/BottomSheet';
import Pill from '../../components/Pill';
import { offerTypeMeta } from '../../data/offerTypes';

export default function NameSheet({ open, onClose }) {
  const { draft, updateDraft, categories } = useOutletContext();
  const meta = offerTypeMeta(draft.type);

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={`${meta.label} details`}
      footer={
        <button
          onClick={onClose}
          className="w-full h-12 rounded-full bg-gray-900 hover:bg-gray-800 text-white text-[15px] font-medium transition-colors"
        >
          Save
        </button>
      }
    >
      <div className="mb-6">
        <div className="text-[11px] font-medium text-gray-400 uppercase tracking-widest mb-2">Name</div>
        <input
          type="text"
          value={draft.name}
          onChange={(e) => updateDraft({ name: e.target.value })}
          placeholder={meta.namePlaceholder}
          className="w-full text-[20px] font-medium bg-gray-50 rounded-2xl px-4 py-4 outline-none placeholder:text-gray-300"
          autoFocus
        />
      </div>

      <div>
        <div className="text-[11px] font-medium text-gray-400 uppercase tracking-widest mb-3">Category</div>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <Pill
              key={c.name}
              label={c.name}
              dotColor={c.color}
              active={draft.category === c.name}
              onClick={() => updateDraft({ category: draft.category === c.name ? '' : c.name })}
            />
          ))}
        </div>
      </div>
    </BottomSheet>
  );
}
