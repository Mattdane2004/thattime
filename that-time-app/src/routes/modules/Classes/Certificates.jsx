import { useNavigate, useOutletContext } from 'react-router-dom';
import { Award, Check, FileUp, ShieldCheck } from 'lucide-react';
import ScreenHeader from '../../../components/ScreenHeader';
import TextField from '../../../components/TextField';
import Toggle from '../../../components/Toggle';
import { emptyClassDetails } from '../../../data/offerTypes';

const DEFAULT_CERTIFICATE_SETTINGS = emptyClassDetails().certificateSettings;

const ISSUE_MODES = [
  { key: 'completion', label: 'On completion', desc: 'Issue after the course is marked complete.' },
  { key: 'attendance', label: 'Full attendance', desc: 'Only issue when all required sessions are attended.' },
  { key: 'assessment', label: 'Assessment pass', desc: 'Issue after practical or theory assessment is passed.' },
];

export default function Certificates() {
  const navigate = useNavigate();
  const { draft, updateDraft } = useOutletContext();
  const details = draft.classDetails || emptyClassDetails();
  const settings = {
    ...DEFAULT_CERTIFICATE_SETTINGS,
    ...(details.certificateSettings || {}),
  };

  const updateSettings = (patch) =>
    updateDraft({
      classDetails: {
        ...details,
        certificateSettings: { ...settings, ...patch },
      },
    });

  return (
    <>
      <ScreenHeader title="Certificates" onBack={() => navigate('/class')} />
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-6 space-y-6">
        <div className="bg-gray-50 rounded-3xl p-5">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center shrink-0">
              <Award size={21} className="text-gray-800" strokeWidth={1.75} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[16px] font-semibold text-gray-900">Completion certificate</div>
              <div className="text-[13px] text-gray-500 mt-1 leading-snug">
                Set how students receive proof of training, completion, or assessment.
              </div>
            </div>
            <Toggle
              checked={settings.enabled}
              onChange={(value) => updateSettings({ enabled: value })}
            />
          </div>
        </div>

        {settings.enabled ? (
          <>
            <TextField
              label="Certificate name"
              value={settings.certificateName}
              onChange={(value) => updateSettings({ certificateName: value })}
              placeholder={draft.name ? `${draft.name} certificate` : 'Foundation aesthetics certificate'}
            />

            <section>
              <SectionTitle title="Issue rule" />
              <div className="space-y-2">
                {ISSUE_MODES.map((mode) => (
                  <button
                    key={mode.key}
                    onClick={() => updateSettings({ issueMode: mode.key })}
                    className={
                      'w-full flex items-center gap-3 p-4 rounded-2xl text-left border transition-colors ' +
                      (settings.issueMode === mode.key
                        ? 'border-gray-900 bg-gray-50'
                        : 'border-gray-100 bg-white hover:bg-gray-50')
                    }
                  >
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0">
                      <ShieldCheck size={17} className="text-gray-700" strokeWidth={1.75} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] font-medium text-gray-900">{mode.label}</div>
                      <div className="text-[12px] text-gray-500 mt-0.5 leading-snug">{mode.desc}</div>
                    </div>
                    {settings.issueMode === mode.key && <Check size={17} className="text-gray-900" strokeWidth={2.5} />}
                  </button>
                ))}
              </div>
            </section>

            <div className="grid grid-cols-2 gap-3">
              <TextField
                label="Expiry in months"
                type="number"
                value={settings.expiryMonths}
                onChange={(value) => updateSettings({ expiryMonths: value })}
                placeholder="12"
              />
              <div className="bg-gray-50 rounded-2xl p-4">
                <div className="text-[12px] text-gray-500">Issue type</div>
                <div className="text-[15px] font-semibold text-gray-900 mt-1">
                  {ISSUE_MODES.find((mode) => mode.key === settings.issueMode)?.label || 'On completion'}
                </div>
              </div>
            </div>

            <TextField
              label="Certificate notes"
              value={settings.notes}
              onChange={(value) => updateSettings({ notes: value })}
              rows={4}
              placeholder="Internal notes about certificate wording, accreditor details, or manual checks."
            />
          </>
        ) : (
          <div className="text-center px-6 pt-8">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 mx-auto flex items-center justify-center mb-4">
              <FileUp size={22} className="text-gray-500" strokeWidth={1.75} />
            </div>
            <div className="text-[17px] font-semibold text-gray-900">No certificate configured</div>
            <div className="text-[14px] text-gray-500 mt-1 leading-snug">
              Turn this on for training courses where students need proof of completion or competency.
            </div>
          </div>
        )}
      </div>

      <div className="px-5 pb-5 pt-3 shrink-0 bg-white border-t border-gray-100">
        <button
          onClick={() => navigate('/class')}
          className="w-full h-12 rounded-full bg-gray-900 hover:bg-gray-800 text-white text-[15px] font-medium transition-colors"
        >
          Done
        </button>
      </div>
    </>
  );
}

function SectionTitle({ title }) {
  return (
    <div className="text-[12px] font-semibold uppercase tracking-wider text-gray-500 mb-3">
      {title}
    </div>
  );
}
