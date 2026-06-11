import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Camera, Check, ChevronRight, ClipboardCheck, Copy, Link2, ShieldCheck, Users } from 'lucide-react';
import BottomSheet from '../../../components/BottomSheet';
import ScreenHeader from '../../../components/ScreenHeader';
import TextField from '../../../components/TextField';
import Toggle from '../../../components/Toggle';
import ProductSelect from '../../../components/ProductSelect';
import { emptyClassDetails } from '../../../data/offerTypes';

const DEFAULT_MODEL_SETTINGS = emptyClassDetails().modelSettings;

const GENDERS = [
  { key: 'all', label: 'All' },
  { key: 'male', label: 'Male' },
  { key: 'female', label: 'Female' },
  { key: 'non_binary', label: 'Non-binary' },
];

export default function ModelsPracticeClients() {
  const navigate = useNavigate();
  const { draft, updateDraft } = useOutletContext();
  const details = draft.classDetails || emptyClassDetails();
  const settings = mergeModelSettings(details.modelSettings);
  const [activeSheet, setActiveSheet] = useState(null);
  const [copied, setCopied] = useState(false);

  const updateSettings = (patch) =>
    updateDraft({
      classDetails: {
        ...details,
        modelSettings: { ...settings, ...patch },
      },
    });

  const updateNested = (key, patch) =>
    updateSettings({ [key]: { ...settings[key], ...patch } });

  const applicationUrl = `https://${settings.applicationLink}`;

  const copyApplicationLink = async () => {
    try {
      await navigator.clipboard.writeText(applicationUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  const rows = [
    {
      key: 'criteria',
      icon: Users,
      title: 'Candidate criteria',
      desc: 'Who is suitable to apply.',
      meta: criteriaMeta(settings.candidateCriteria),
    },
    {
      key: 'evidence',
      icon: Camera,
      title: 'Evidence & assessment',
      desc: 'Photos, documents, answers or proof.',
      meta: evidenceMeta(settings.mediaRequirements),
    },
    {
      key: 'intake',
      icon: ClipboardCheck,
      title: 'Intake & capacity',
      desc: 'How many applicants you need.',
      meta: intakeMeta(settings.intakeRules),
    },
    {
      key: 'safety',
      icon: ShieldCheck,
      title: 'Safety & commitment',
      desc: 'Checks, no-show protection and safeguards.',
      meta: safetyMeta(settings.safetyRules),
    },
  ];

  return (
    <>
      <ScreenHeader title="Models & practice clients" onBack={() => navigate('/class')} />
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-6 space-y-5">
        <div className="bg-gray-50 rounded-3xl p-5">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center shrink-0">
              <Users size={20} className="text-gray-800" strokeWidth={1.75} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[16px] font-semibold text-gray-900">Model applications</div>
              <div className="text-[13px] text-gray-500 mt-1 leading-snug">
                Collect and screen practice clients for this class.
              </div>
            </div>
            <Toggle
              checked={settings.usesLiveModels}
              onChange={(value) => updateSettings({ usesLiveModels: value })}
            />
          </div>
        </div>

        {settings.usesLiveModels ? (
          <>
            <div>
              <div className="text-[12px] font-semibold uppercase tracking-wider text-gray-500 mb-2">
                Setup
              </div>
              <div className="space-y-1">
                {rows.map((row) => (
                  <SetupRow key={row.key} row={row} onClick={() => setActiveSheet(row.key)} />
                ))}
              </div>
            </div>

            <div>
              <div className="text-[12px] font-semibold uppercase tracking-wider text-gray-500 mb-2">
                Application link
              </div>
              <div className="flex items-center gap-2 bg-gray-50 rounded-2xl p-3">
                <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shrink-0">
                  <Link2 size={16} className="text-gray-700" strokeWidth={1.75} />
                </div>
                <div className="flex-1 min-w-0 text-[13px] text-gray-700 break-all">
                  {applicationUrl}
                </div>
                <button
                  onClick={copyApplicationLink}
                  className="h-10 px-4 rounded-full bg-gray-900 text-white text-[13px] font-medium flex items-center gap-2 shrink-0"
                >
                  {copied ? <Check size={15} strokeWidth={2.4} /> : <Copy size={15} strokeWidth={1.9} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center px-6 pt-8">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 mx-auto flex items-center justify-center mb-4">
              <Users size={22} className="text-gray-500" strokeWidth={1.75} />
            </div>
            <div className="text-[17px] font-semibold text-gray-900">No live models needed</div>
            <div className="text-[14px] text-gray-500 mt-1 leading-snug">
              Turn this on when students practise on models, volunteers or discounted clients.
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

      <ConfigSheet
        open={activeSheet === 'criteria'}
        title="Candidate criteria"
        onClose={() => setActiveSheet(null)}
      >
        <ProductSelect
          label="Gender / demographic"
          value={settings.candidateCriteria.gender}
          onChange={(gender) => updateNested('candidateCriteria', { gender })}
          options={GENDERS}
        />

        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="Min age"
            type="number"
            value={settings.candidateCriteria.ageMin}
            onChange={(value) => updateNested('candidateCriteria', { ageMin: value })}
            placeholder="18"
          />
          <TextField
            label="Max age"
            type="number"
            value={settings.candidateCriteria.ageMax}
            onChange={(value) => updateNested('candidateCriteria', { ageMax: value })}
            placeholder="Optional"
          />
        </div>

        <ToggleRow
          title="Require 18+ only"
          desc="Useful for activities or legal checks that require adults."
          checked={settings.candidateCriteria.requireAdult}
          onChange={(value) => updateNested('candidateCriteria', { requireAdult: value })}
        />

        <TextField
          label="Candidate requirements"
          value={settings.candidateCriteria.customRequirements}
          onChange={(value) => updateNested('candidateCriteria', { customRequirements: value })}
          rows={5}
          placeholder="Describe who is suitable. For example: must have prior experience, must be comfortable being photographed, or must meet a specific condition for the activity."
        />
      </ConfigSheet>

      <ConfigSheet
        open={activeSheet === 'evidence'}
        title="Evidence & assessment"
        onClose={() => setActiveSheet(null)}
      >
        <ToggleRow
          title="Require evidence upload"
          desc="Applicants must attach photos, documents, screenshots, or other proof."
          checked={settings.mediaRequirements.evidenceRequired}
          onChange={(value) => updateNested('mediaRequirements', { evidenceRequired: value })}
        />
        <TextField
          label="What evidence do you need?"
          value={settings.mediaRequirements.evidenceInstructions}
          onChange={(value) => updateNested('mediaRequirements', { evidenceInstructions: value })}
          rows={4}
          placeholder="For example: upload photos, proof of qualification, a short video, or a signed consent form."
        />
        <TextField
          label="Agreement or suitability confirmation"
          value={settings.mediaRequirements.targetConfirmation}
          onChange={(value) => updateNested('mediaRequirements', { targetConfirmation: value })}
          rows={3}
          placeholder="For example: applicant must confirm they understand what will happen during the session."
        />
      </ConfigSheet>

      <ConfigSheet
        open={activeSheet === 'intake'}
        title="Intake & capacity"
        onClose={() => setActiveSheet(null)}
      >
        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="Models per student"
            type="number"
            value={settings.intakeRules.modelsPerStudent}
            onChange={(value) => updateNested('intakeRules', { modelsPerStudent: value })}
            placeholder="1"
          />
          <TextField
            label="Application cap"
            type="number"
            value={settings.intakeRules.applicationCap}
            onChange={(value) => updateNested('intakeRules', { applicationCap: value })}
            placeholder="10"
          />
        </div>
        <TextField
          label="Application deadline"
          type="datetime-local"
          value={settings.intakeRules.deadline}
          onChange={(value) => updateNested('intakeRules', { deadline: value })}
        />
      </ConfigSheet>

      <ConfigSheet
        open={activeSheet === 'safety'}
        title="Safety & commitment"
        onClose={() => setActiveSheet(null)}
      >
        <ToggleRow
          title="Require safety check"
          desc="Prompt the applicant to complete a required safety check before the session."
          checked={settings.safetyRules.patchTestRequired}
          onChange={(value) => updateNested('safetyRules', { patchTestRequired: value })}
        />
        <TextField
          label="No-show penalty fee"
          type="number"
          value={settings.safetyRules.noShowFee}
          onChange={(value) => updateNested('safetyRules', { noShowFee: value })}
          placeholder="15"
        />
      </ConfigSheet>
    </>
  );
}

function SetupRow({ row, onClick }) {
  const Icon = row.icon;
  return (
    <button
      onClick={onClick}
      className="w-full px-3 py-4 flex items-center gap-4 rounded-xl text-left hover:bg-gray-50 transition-colors"
    >
      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
        <Icon size={18} className="text-gray-700" strokeWidth={1.75} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <div className="text-[15px] text-gray-900 truncate">{row.title}</div>
          <div className="text-[11px] text-gray-400 truncate">{row.meta}</div>
        </div>
        <div className="text-[13px] text-gray-500 mt-0.5 truncate">{row.desc}</div>
      </div>
      <ChevronRight size={17} className="text-gray-400 shrink-0" strokeWidth={1.75} />
    </button>
  );
}

function ConfigSheet({ open, title, onClose, children }) {
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <button
          onClick={onClose}
          className="w-full h-12 rounded-full bg-gray-900 hover:bg-gray-800 text-white text-[15px] font-medium transition-colors"
        >
          Done
        </button>
      }
    >
      <div className="space-y-4">{children}</div>
    </BottomSheet>
  );
}

function criteriaMeta(criteria) {
  const gender = GENDERS.find((option) => option.key === criteria.gender)?.label || 'All';
  const age = criteria.ageMax ? `${criteria.ageMin || 18}-${criteria.ageMax}` : `${criteria.ageMin || 18}+`;
  return criteria.customRequirements ? 'Custom rules' : `${gender} · ${age}`;
}

function evidenceMeta(media) {
  if (media.evidenceRequired && media.evidenceInstructions) return 'Evidence specified';
  if (media.evidenceRequired) return 'Upload required';
  return 'Optional';
}

function intakeMeta(intake) {
  const cap = intake.applicationCap ? `${intake.applicationCap} cap` : 'No cap';
  return `${intake.modelsPerStudent || 1} per student · ${cap}`;
}

function safetyMeta(safety) {
  if (safety.patchTestRequired && safety.noShowFee) return `Check · £${safety.noShowFee}`;
  if (safety.patchTestRequired) return 'Safety check';
  if (safety.noShowFee) return `£${safety.noShowFee} no-show`;
  return 'Optional';
}

function mergeModelSettings(incoming = {}) {
  return {
    ...DEFAULT_MODEL_SETTINGS,
    ...incoming,
    candidateCriteria: {
      ...DEFAULT_MODEL_SETTINGS.candidateCriteria,
      ...(incoming.candidateCriteria || {}),
    },
    mediaRequirements: {
      ...DEFAULT_MODEL_SETTINGS.mediaRequirements,
      ...(incoming.mediaRequirements || {}),
    },
    intakeRules: {
      ...DEFAULT_MODEL_SETTINGS.intakeRules,
      ...(incoming.intakeRules || {}),
    },
    safetyRules: {
      ...DEFAULT_MODEL_SETTINGS.safetyRules,
      ...(incoming.safetyRules || {}),
    },
  };
}

function ToggleRow({ title, desc, checked, onChange }) {
  return (
    <div className="flex items-center gap-4 bg-gray-50 rounded-2xl px-4 py-3">
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-medium text-gray-900">{title}</div>
        <div className="text-[12px] text-gray-500 mt-0.5 leading-snug">{desc}</div>
      </div>
      <Toggle checked={Boolean(checked)} onChange={onChange} />
    </div>
  );
}
