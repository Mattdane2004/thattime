import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Search, Check } from 'lucide-react';
import ScreenHeader from '../../components/ScreenHeader';
import { activeStaffList, staff as fallbackStaff } from '../../data/staff';
import { offerTypeMeta } from '../../data/offerTypes';

export default function ServiceStaff() {
  const navigate = useNavigate();
  const { draft, updateDraft, teamMembers = fallbackStaff } = useOutletContext();
  const [query, setQuery] = useState('');
  const meta = offerTypeMeta(draft.type);

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
    <>
      <ScreenHeader title={draft.type === 'class' ? 'Instructors' : 'Staff'} onBack={() => navigate('/service')} />
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-6">
        <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-3 mb-5">
          <Search size={15} className="text-gray-400 shrink-0" strokeWidth={1.75} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search staff"
            className="flex-1 text-[15px] bg-transparent placeholder:text-gray-400 outline-none"
          />
        </div>
        <div>
          {visible.map((s) => {
            const isOn = selected.has(s.id);
            return (
              <button
                key={s.id}
                onClick={() => toggle(s.id)}
                className="w-full flex items-center gap-4 px-1 py-3.5 border-b border-gray-100 last:border-0 text-left"
              >
                <div className="w-10 h-10 rounded-full bg-gray-100 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-[15px]">{s.name}</div>
                  <div className="text-[13px] text-gray-500 mt-0.5">{s.role}</div>
                </div>
                <div
                  className={
                    'w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-colors ' +
                    (isOn ? 'bg-gray-900' : 'bg-gray-100')
                  }
                >
                  {isOn && <Check size={14} className="text-white" strokeWidth={2.5} />}
                </div>
              </button>
            );
          })}
        </div>
      </div>
      <div className="px-5 pb-5 pt-3 shrink-0 bg-white border-t border-gray-100">
        <button
          onClick={() => navigate('/service')}
          className="w-full h-12 rounded-full bg-gray-900 hover:bg-gray-800 text-white text-[15px] font-medium transition-colors"
        >
          Done{selected.size > 0 ? ` · ${selected.size} ${draft.type === 'class' ? 'instructor' : meta.noun === 'service' ? 'staff' : 'person'}${selected.size === 1 ? '' : 's'} selected` : ''}
        </button>
      </div>
    </>
  );
}
