import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Search, Check } from 'lucide-react';
import BottomSheet from '../../components/BottomSheet';
import { activeStaffList, staff as fallbackStaff } from '../../data/staff';

export default function StaffSheet({ open, onClose }) {
  const { draft, updateDraft, teamMembers = fallbackStaff } = useOutletContext();
  const [query, setQuery] = useState('');

  const selected = new Set(draft.staff);
  const visible = activeStaffList(teamMembers).filter((s) =>
    (s.name + ' ' + s.role).toLowerCase().includes(query.toLowerCase())
  );

  const toggle = (id) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    updateDraft({ staff: Array.from(next) });
  };

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Staff"
      footer={
        <button
          onClick={onClose}
          className="w-full h-12 rounded-full bg-gray-900 hover:bg-gray-800 text-white text-[15px] font-medium transition-colors"
        >
          Done · {selected.size} selected
        </button>
      }
    >
      <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-3 mb-3">
        <Search size={16} className="text-gray-400" strokeWidth={1.75} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search staff"
          className="flex-1 text-[15px] bg-transparent placeholder:text-gray-400 outline-none"
        />
      </div>
      <div className="-mx-2">
        {visible.map((s) => {
          const isOn = selected.has(s.id);
          return (
            <button
              key={s.id}
              onClick={() => toggle(s.id)}
              className="w-full flex items-center gap-4 px-3 py-3 rounded-xl text-left hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-gray-100 shrink-0" />
              <div className="flex-1">
                <div className="text-[15px]">{s.name}</div>
                <div className="text-[13px] text-gray-500 mt-0.5">{s.role}</div>
              </div>
              <div
                className={
                  'w-6 h-6 rounded-md flex items-center justify-center transition-colors ' +
                  (isOn ? 'bg-gray-900' : 'bg-gray-100')
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
