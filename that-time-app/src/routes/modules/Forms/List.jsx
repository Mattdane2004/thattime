import { useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import { FileText, X } from 'lucide-react';
import ScreenHeader from '../../../components/ScreenHeader';
import HelpTrigger from '../../../components/HelpTrigger';
import { formsCatalog } from '../../../data/demoFormsCatalog';
import { offerBasePath } from '../../routeBase';

export default function FormsList() {
  const navigate = useNavigate();
  const location = useLocation();
  const { draft, updateDraft } = useOutletContext();
  const attached = draft.forms || [];
  const catalogHasForms = formsCatalog.length > 0;
  const basePath = offerBasePath(draft, location);

  const detach = (id) =>
    updateDraft({ forms: attached.filter((f) => f.id !== id) });

  const toggleRequired = (id) =>
    updateDraft({
      forms: attached.map((f) => (f.id === id ? { ...f, required: !f.required } : f)),
    });

  // Empty state — no forms in catalog at all
  if (attached.length === 0 && !catalogHasForms) {
    return (
      <>
        <ScreenHeader title="Forms" onBack={() => navigate(basePath)} rightAction={<HelpTrigger helpKey="forms" />} />
        <div className="flex-1 overflow-y-auto px-5 pt-4 pb-6">
          <div className="flex flex-col items-center text-center pt-10">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <FileText size={24} className="text-gray-400" strokeWidth={1.5} />
            </div>
            <div className="text-[18px] font-semibold text-gray-900 mb-1">No forms yet</div>
            <div className="text-[14px] text-gray-500 leading-snug max-w-[260px]">
              Create intake forms your clients fill out before their appointment.
            </div>
            <button
              onClick={() => navigate('/forms')}
              className="mt-6 h-11 px-6 rounded-full bg-gray-900 text-white text-[14px] font-medium hover:bg-gray-800 transition-colors"
            >
              Set up your first form
            </button>
          </div>
        </div>
      </>
    );
  }

  // Empty state — catalog has forms, none attached to this service
  if (attached.length === 0) {
    return (
      <>
        <ScreenHeader title="Forms" onBack={() => navigate(basePath)} rightAction={<HelpTrigger helpKey="forms" />} />
        <div className="flex-1 overflow-y-auto px-5 pt-4 pb-6">
          <div className="flex flex-col items-center text-center pt-10">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <FileText size={24} className="text-gray-400" strokeWidth={1.5} />
            </div>
            <div className="text-[18px] font-semibold text-gray-900 mb-1">No forms attached</div>
            <div className="text-[14px] text-gray-500 leading-snug max-w-[260px]">
              Choose from forms you've already created.
            </div>
            <button
              onClick={() => navigate(`${basePath}/forms/select`)}
              className="mt-6 h-11 px-6 rounded-full bg-gray-900 text-white text-[14px] font-medium hover:bg-gray-800 transition-colors"
            >
              Select forms
            </button>
            <button
              onClick={() => navigate('/forms')}
              className="mt-3 text-[13px] text-gray-500 hover:text-gray-900 transition-colors"
            >
              Manage your forms catalog
            </button>
          </div>
        </div>
      </>
    );
  }

  // Populated state
  return (
    <>
      <ScreenHeader title="Forms" onBack={() => navigate(basePath)} rightAction={<HelpTrigger helpKey="forms" />} />
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-6">
        <div className="space-y-2">
          {attached.map((af) => {
            const meta = formsCatalog.find((f) => f.id === af.id);
            if (!meta) return null;
            return (
              <div
                key={af.id}
                className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-[15px] font-medium text-gray-900">{meta.name}</div>
                  <div className="text-[13px] text-gray-500 mt-0.5">
                    {meta.fieldCount} fields · {af.required ? 'Required' : 'Optional'}
                  </div>
                </div>
                <button
                  onClick={() => toggleRequired(af.id)}
                  className={'px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors ' + (af.required ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')}
                >
                  {af.required ? 'Required' : 'Optional'}
                </button>
                <button
                  onClick={() => detach(af.id)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                  aria-label="Remove"
                >
                  <X size={16} strokeWidth={1.75} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
      <div className="px-5 pb-5 pt-3 shrink-0 bg-white border-t border-gray-100">
        <button
          onClick={() => navigate(`${basePath}/forms/select`)}
          className="w-full h-12 rounded-full bg-gray-900 hover:bg-gray-800 text-white text-[15px] font-medium transition-colors"
        >
          Edit selection
        </button>
      </div>
    </>
  );
}
