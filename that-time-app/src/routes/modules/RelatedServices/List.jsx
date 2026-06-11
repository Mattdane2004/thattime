import { useNavigate, useOutletContext } from 'react-router-dom';
import { Sparkles, Plus } from 'lucide-react';
import ScreenHeader from '../../../components/ScreenHeader';
import HelpTrigger from '../../../components/HelpTrigger';
import { audienceSummary } from './forms/AudienceForm';

const discountSummary = (g) => {
  if (g.discountMode === 'percent' && g.discountAmount) return `${g.discountAmount}% off`;
  if (g.discountMode === 'flat' && g.discountAmount) return `£${g.discountAmount} off`;
  return 'No discount';
};

const subtitleFor = (g) => {
  const count = (g.serviceIds || []).length;
  return `${count} service${count === 1 ? '' : 's'} · ${discountSummary(g)} · ${audienceSummary(g.audience)}`;
};

export default function RelatedList() {
  const navigate = useNavigate();
  const { draft } = useOutletContext();
  const groups = draft.related || [];

  if (groups.length === 0) {
    return (
      <>
        <ScreenHeader title="Related services" onBack={() => navigate('/service')} rightAction={<HelpTrigger helpKey="related" />} />
        <div className="flex-1 overflow-y-auto px-5 pt-4 pb-6">
          <div className="flex flex-col items-center text-center pt-10">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <Sparkles size={24} className="text-gray-400" strokeWidth={1.5} />
            </div>
            <div className="text-[18px] font-semibold text-gray-900 mb-1">No groups yet</div>
            <div className="text-[14px] text-gray-500 leading-snug max-w-[280px]">
              Bundle related services into a group — share one discount and audience across all of them.
            </div>
            <button
              onClick={() => navigate('/service/related/new')}
              className="mt-6 h-11 px-6 rounded-full bg-gray-900 text-white text-[14px] font-medium hover:bg-gray-800 transition-colors"
            >
              Create group
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <ScreenHeader title="Related services" onBack={() => navigate('/service')} rightAction={<HelpTrigger helpKey="related" />} />
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-6">
        <div className="space-y-3">
          {groups.map((g) => (
            <button
              key={g.id}
              onClick={() => navigate(`/service/related/${g.id}`)}
              className="w-full bg-gray-50 rounded-2xl px-4 py-4 text-left hover:bg-gray-100 transition-colors"
            >
              <div className="text-[15px] font-medium text-gray-900">{g.name || 'Untitled group'}</div>
              <div className="text-[13px] text-gray-500 mt-0.5 truncate">{subtitleFor(g)}</div>
            </button>
          ))}
        </div>
      </div>
      <div className="px-5 pb-5 pt-3 shrink-0 bg-white border-t border-gray-100">
        <button
          onClick={() => navigate('/service/related/new')}
          className="w-full h-12 rounded-full bg-gray-900 hover:bg-gray-800 text-white text-[15px] font-medium flex items-center justify-center gap-2 transition-colors"
        >
          <Plus size={16} strokeWidth={2} />
          Create group
        </button>
      </div>
    </>
  );
}
