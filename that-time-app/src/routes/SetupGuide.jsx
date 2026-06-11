import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  ChevronRight,
  Circle,
  CircleDashed,
  LockKeyhole,
} from 'lucide-react';
import ScreenHeader from '../components/ScreenHeader';
import { getSetupProgress, setupLevels } from '../data/setupGuide';

const STATUS_META = {
  done: {
    label: 'Done',
    className: 'bg-emerald-50 text-emerald-700',
  },
  current: {
    label: 'Next',
    className: 'bg-gray-900 text-white',
  },
  todo: {
    label: 'Open',
    className: 'bg-gray-100 text-gray-700',
  },
  locked: {
    label: 'Later',
    className: 'bg-gray-50 text-gray-400',
  },
};

function StepStatusIcon({ status }) {
  if (status === 'done') return <CheckCircle2 size={19} className="text-emerald-600" strokeWidth={2} />;
  if (status === 'current') return <CircleDashed size={19} className="text-gray-900" strokeWidth={2} />;
  if (status === 'locked') return <LockKeyhole size={18} className="text-gray-300" strokeWidth={1.8} />;
  return <Circle size={19} className="text-gray-300" strokeWidth={2} />;
}

function LevelButton({ level, active, onClick }) {
  const Icon = level.icon;
  const completed = level.steps.filter((step) => step.status === 'done').length;
  const available = level.steps.filter((step) => step.status !== 'locked').length;
  const percent = Math.round((completed / level.steps.length) * 100);

  return (
    <button
      onClick={onClick}
      className={
        'shrink-0 w-[238px] min-h-[178px] rounded-2xl border p-4 text-left transition-colors ' +
        (active ? `${level.tone} border-transparent` : 'bg-white border-gray-100 text-gray-900 hover:bg-gray-50')
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={
            'w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ' +
            (active ? 'bg-white/10' : 'bg-gray-50')
          }
        >
          <Icon size={20} strokeWidth={1.9} className={active ? 'text-white' : 'text-gray-800'} />
        </div>
        <div className={'text-[11px] font-semibold rounded-full px-2 py-1 ' + (active ? 'bg-white/10 text-white' : 'bg-gray-50 text-gray-500')}>
          {completed}/{level.steps.length}
        </div>
      </div>
      <div className="text-[18px] font-semibold mt-4">{level.label}</div>
      <div className={'text-[12px] mt-1 leading-snug ' + (active ? 'text-white/70' : 'text-gray-500')}>
        {level.title}
      </div>
      <div className={'mt-4 h-1.5 rounded-full overflow-hidden ' + (active ? 'bg-white/20' : 'bg-gray-100')}>
        <div
          className={'h-full rounded-full ' + (active ? 'bg-white' : 'bg-gray-900')}
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className={'text-[11px] mt-2 font-medium ' + (active ? 'text-white/60' : 'text-gray-400')}>
        {available > 0 ? `${available} steps open` : 'Saved for later'}
      </div>
    </button>
  );
}

function StepCard({ step, onOpen }) {
  const Icon = step.icon;
  const status = STATUS_META[step.status] || STATUS_META.todo;
  const locked = step.status === 'locked';

  return (
    <button
      onClick={locked ? undefined : onOpen}
      disabled={locked}
      className={
        'w-full bg-white border rounded-2xl p-4 text-left transition-colors ' +
        (step.status === 'current'
          ? 'border-gray-900 shadow-sm'
          : 'border-gray-100 hover:bg-gray-50 disabled:hover:bg-white')
      }
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
          <Icon size={18} className={locked ? 'text-gray-300' : 'text-gray-800'} strokeWidth={1.8} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[15px] font-semibold text-gray-900 leading-snug">{step.title}</div>
              <div className="text-[13px] text-gray-500 mt-1 leading-snug">{step.desc}</div>
            </div>
            <span className={'shrink-0 px-2 py-1 rounded-full text-[11px] font-semibold ' + status.className}>
              {status.label}
            </span>
          </div>

          <div className="mt-3 flex items-center gap-2 text-[12px] text-gray-500">
            <StepStatusIcon status={step.status} />
            <span className="flex-1 min-w-0 truncate">{step.lesson}</span>
            <span className="shrink-0">{step.time}</span>
            {!locked && <ChevronRight size={15} className="text-gray-300 shrink-0" strokeWidth={2} />}
          </div>
        </div>
      </div>
    </button>
  );
}

export default function SetupGuide() {
  const navigate = useNavigate();
  const progress = useMemo(() => getSetupProgress(), []);
  const [activeKey, setActiveKey] = useState(progress.currentLevel.key);
  const activeLevel = setupLevels.find((level) => level.key === activeKey) || setupLevels[0];
  const LevelIcon = activeLevel.icon;

  return (
    <>
      <ScreenHeader title="Setup guide" onBack={() => navigate('/hub')} border />

      <div className="flex-1 overflow-y-auto bg-gray-50 px-4 pt-4 pb-8">
        <div className="px-1 pb-3">
          <div className="text-[28px] leading-tight font-semibold tracking-tight text-gray-900">
            Setup guide
          </div>
          <div className="text-[14px] text-gray-500 mt-1">
            Choose one area, do a small step, then come back whenever you need.
          </div>
        </div>

        <div className="-mx-4 px-4 flex gap-3 overflow-x-auto no-scrollbar pb-1">
          {setupLevels.map((level) => (
            <LevelButton
              key={level.key}
              level={level}
              active={level.key === activeKey}
              onClick={() => setActiveKey(level.key)}
            />
          ))}
        </div>

        <div className="mt-6">
          <div className="px-1 mb-3">
            <div className="flex items-center gap-2">
              <div className={'w-8 h-8 rounded-xl flex items-center justify-center ' + activeLevel.tone}>
                <LevelIcon size={16} strokeWidth={2} />
              </div>
              <div className="text-[20px] font-semibold tracking-tight text-gray-900">
                {activeLevel.label}
              </div>
            </div>
            <div className="text-[13px] text-gray-500 mt-2 leading-snug">{activeLevel.desc}</div>
          </div>

          <div className="space-y-3">
            {activeLevel.steps.map((step) => (
              <StepCard
                key={step.key}
                step={step}
                onOpen={() => navigate(step.to)}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
