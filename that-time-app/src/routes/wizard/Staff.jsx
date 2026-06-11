import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Search, SlidersHorizontal, Check } from 'lucide-react';
import ScreenHeader from '../../components/ScreenHeader';
import HelpTrigger from '../../components/HelpTrigger';
import WizardFooter from '../../components/WizardFooter';
import { activeStaffList, staff as fallbackStaff } from '../../data/staff';
import { offerTypeMeta, wizardTotalFor } from '../../data/offerTypes';

export default function Staff() {
  const navigate = useNavigate();
  const { draft, updateDraft, teamMembers = fallbackStaff } = useOutletContext();
  const [query, setQuery] = useState('');
  // Classes use ClassStaff.jsx (lead + supporting); this screen now serves
  // services / bundles / subscriptions only.
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
      <ScreenHeader title="" onBack={() => navigate('/new/locations')} rightAction={<HelpTrigger helpKey="staff" />} />
      <div className="flex-1 overflow-y-auto px-5">
        <div className="pt-2 pb-6">
          <div className="text-[26px] leading-tight font-semibold tracking-tight">Who offers it?</div>
          <div className="text-[14px] text-gray-500 mt-1">
            Pick staff who can deliver this {meta.noun}.
          </div>
        </div>

        <div className="flex items-center gap-2 pb-4">
          <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-3">
            <Search size={16} className="text-gray-400" strokeWidth={1.75} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search staff"
              className="flex-1 text-[15px] bg-transparent placeholder:text-gray-400 outline-none"
            />
          </div>
          <button
            className="w-12 h-12 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center"
            aria-label="Filter"
          >
            <SlidersHorizontal size={18} strokeWidth={1.75} />
          </button>
        </div>

        <div className="-mx-2 pb-6">
          {visible.map((s) => {
            const isOn = selected.has(s.id);
            return (
              <button
                key={s.id}
                onClick={() => toggle(s.id)}
                className="w-full flex items-center gap-4 px-3 py-3 rounded-xl text-left hover:bg-gray-50 transition-colors"
              >
                <div className="w-11 h-11 rounded-full bg-gray-100 shrink-0" />
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
      </div>
      <WizardFooter
        step={3}
        total={wizardTotalFor(draft.type)}
        onBack={() => navigate('/new/locations')}
        onNext={() => navigate('/new/price')}
        nextDisabled={draft.staff.length === 0}
      />
    </>
  );
}
