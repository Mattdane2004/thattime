import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronRight, Circle, ClipboardCheck, Upload } from 'lucide-react';
import { getSetupPreviewSteps, getSetupProgress } from '../data/setupGuide';

function StatusIcon({ status }) {
  if (status === 'done') {
    return <CheckCircle2 size={17} className="text-emerald-600" strokeWidth={2} />;
  }

  return <Circle size={17} className={status === 'current' ? 'text-gray-900' : 'text-gray-300'} strokeWidth={2} />;
}

export default function HubSetupCard() {
  const navigate = useNavigate();
  const progress = getSetupProgress();
  const previewSteps = getSetupPreviewSteps(3);

  return (
    <div className="w-full bg-white border border-gray-100 rounded-2xl p-5 text-left">
      <button
        onClick={() => navigate('/setup')}
        className="w-full text-left"
      >
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gray-900 text-white flex items-center justify-center shrink-0">
            <ClipboardCheck size={20} strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <div className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">
                Setup guide
              </div>
              <div className="text-[12px] font-semibold text-gray-900 shrink-0">
                {progress.completed}/{progress.total}
              </div>
            </div>
            <div className="text-[22px] leading-tight font-semibold tracking-tight text-gray-900 mt-1">
              Pick up setup anytime
            </div>
            <div className="text-[13px] text-gray-500 mt-1 leading-snug">
              Start with the basics, then keep improving when you are ready.
            </div>
          </div>
        </div>

        <div className="mt-4 h-1.5 rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-gray-900"
            style={{ width: `${Math.max(progress.percent, 8)}%` }}
          />
        </div>

        <div className="mt-4 space-y-3">
          {previewSteps.map((step) => (
            <div key={step.key} className="flex items-start gap-3">
              <div className="mt-0.5">
                <StatusIcon status={step.status} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-medium text-gray-900 truncate">{step.title}</div>
                <div className="text-[12px] text-gray-500 mt-0.5 truncate">
                  {step.levelLabel} - {step.time}
                </div>
              </div>
            </div>
          ))}
        </div>
      </button>

      <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-[1fr_auto] gap-2">
        <button
          onClick={() => navigate('/setup')}
          className="h-10 rounded-full bg-gray-50 px-4 text-[13px] font-medium text-gray-800 flex items-center justify-center gap-1.5 hover:bg-gray-100 transition-colors"
        >
          Continue setup
          <ChevronRight size={15} strokeWidth={2} />
        </button>
        <button
          onClick={() => navigate('/setup/import')}
          className="h-10 rounded-full bg-gray-900 px-4 text-[13px] font-medium text-white flex items-center justify-center gap-1.5 hover:bg-gray-800 transition-colors"
        >
          <Upload size={15} strokeWidth={2} />
          Import data
        </button>
      </div>
    </div>
  );
}
