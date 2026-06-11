import { createElement } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Scissors, Users, Package, Repeat, ChevronRight } from 'lucide-react';
import ScreenHeader from '../components/ScreenHeader';
import HelpTrigger from '../components/HelpTrigger';

const types = [
  { key: 'service',      label: 'Service',      desc: 'A one-on-one appointment',              Icon: Scissors },
  { key: 'class',        label: 'Class',        desc: 'Courses, workshops, and group training', Icon: Users },
  { key: 'bundle',       label: 'Bundle',       desc: 'Multiple services sold together',       Icon: Package },
  { key: 'subscription', label: 'Subscription', desc: 'Recurring access — memberships',        Icon: Repeat },
];

export default function TypeSelector() {
  const navigate = useNavigate();
  const { updateDraft } = useOutletContext();

  const pick = (key) => {
    updateDraft({ type: key });
    if (key === 'class') navigate('/new/basics?type=class');
    else if (key === 'subscription') navigate('/new/subscription-type');
    else navigate('/new/basics');
  };

  return (
    <>
      <ScreenHeader title="" onClose={() => navigate('/services')} rightAction={<HelpTrigger helpKey="typeSelector" />} />
      <div className="flex-1 overflow-y-auto px-5">
        <div className="pt-2 pb-7">
          <div className="text-[26px] leading-tight font-semibold tracking-tight">
            What are you adding?
          </div>
          <div className="text-[14px] text-gray-500 mt-1">
            You can change this later.
          </div>
        </div>

        <div className="space-y-3">
          {types.map(({ key, label, desc, Icon: IconComponent }) => (
            <button
              key={key}
              onClick={() => pick(key)}
              className="w-full flex items-center gap-4 p-4 bg-gray-50 rounded-2xl text-left hover:bg-gray-100 transition-colors"
            >
              <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shrink-0">
                {createElement(IconComponent, { size: 20, className: 'text-gray-700', strokeWidth: 1.75 })}
              </div>
              <div className="flex-1">
                <div className="text-[15px] font-medium">{label}</div>
                <div className="text-[13px] text-gray-500 mt-0.5">{desc}</div>
              </div>
              <ChevronRight size={18} className="text-gray-400 shrink-0" strokeWidth={1.75} />
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
