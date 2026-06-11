import { useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import ScreenHeader from '../../../components/ScreenHeader';
import TextField from '../../../components/TextField';
import Toggle from '../../../components/Toggle';
import { emptyAdvancedOptions } from '../../../data/advancedOptions';
import { offerBasePath } from '../../routeBase';

const DIFFICULTY = [
  { key: 'none', label: 'Not applicable' },
  { key: 'beginner', label: 'Beginner' },
  { key: 'intermediate', label: 'Intermediate' },
  { key: 'advanced', label: 'Advanced' },
];

const mergedRequirements = (incoming = {}) => {
  const defaults = emptyAdvancedOptions().requirements;
  return {
    ...defaults,
    ...incoming,
    age: { ...defaults.age, ...(incoming.age || {}) },
    qualification: { ...defaults.qualification, ...(incoming.qualification || {}) },
    insurance: { ...defaults.insurance, ...(incoming.insurance || {}) },
    declarations: { ...defaults.declarations, ...(incoming.declarations || {}) },
    preparation: { ...defaults.preparation, ...(incoming.preparation || {}) },
    eligibility: { ...defaults.eligibility, ...(incoming.eligibility || {}) },
  };
};

export default function Requirements() {
  const navigate = useNavigate();
  const location = useLocation();
  const { draft, updateDraft } = useOutletContext();
  const ao = draft.advancedOptions || emptyAdvancedOptions();
  const r = mergedRequirements(ao.requirements);
  const returnPath = offerBasePath(draft, location);

  const update = (patch) =>
    updateDraft({
      advancedOptions: { ...ao, requirements: { ...r, ...patch } },
    });

  const updateNested = (key, patch) =>
    update({ [key]: { ...r[key], ...patch } });

  return (
    <>
      <ScreenHeader title="Requirements" onBack={() => navigate(returnPath)} />
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-6 space-y-6">
        <p className="text-[14px] text-gray-500 leading-snug">
          Set what students must know or prove before booking this course.
        </p>

        <div>
          <div className="text-[12px] font-semibold uppercase tracking-wider text-gray-500 mb-2">
            Course level
          </div>
          <div className="space-y-1.5">
            {DIFFICULTY.map(({ key, label }) => {
              const active = (r.difficulty || 'none') === key;
              return (
                <button
                  key={key}
                  onClick={() => update({ difficulty: key })}
                  className={
                    'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-[14px] transition-colors ' +
                    (active ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100')
                  }
                >
                  <div
                    className={
                      'w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ' +
                      (active ? 'border-white' : 'border-gray-400')
                    }
                  >
                    {active && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <Section
          title="Age limits"
          desc="Block bookings outside this age range."
          enabled={r.age.enabled}
          onToggle={(value) => updateNested('age', { enabled: value })}
        >
          <div className="grid grid-cols-2 gap-3">
            <TextField
              label="Min age"
              type="number"
              value={r.age.min}
              onChange={(value) => updateNested('age', { min: value })}
              placeholder="18"
            />
            <TextField
              label="Max age"
              type="number"
              value={r.age.max}
              onChange={(value) => updateNested('age', { max: value })}
              placeholder="Optional"
            />
          </div>
        </Section>

        <Section
          title="Required qualification"
          desc="Use this for aesthetics, beauty, medical, or advanced course eligibility."
          enabled={r.qualification.enabled}
          onToggle={(value) => updateNested('qualification', { enabled: value })}
        >
          <TextField
            label="Qualification requirement"
            value={r.qualification.text}
            onChange={(value) => updateNested('qualification', { text: value })}
            rows={3}
            placeholder="e.g. Must hold Level 3 Beauty Therapy or equivalent."
          />
        </Section>

        <Section
          title="Insurance proof"
          desc="Ask students to confirm or bring proof of professional insurance."
          enabled={r.insurance.enabled}
          onToggle={(value) => updateNested('insurance', { enabled: value })}
        >
          <TextField
            label="Insurance instructions"
            value={r.insurance.text}
            onChange={(value) => updateNested('insurance', { text: value })}
            rows={3}
            placeholder="e.g. Bring proof of practitioner insurance covering injectables."
          />
        </Section>

        <Section
          title="Student declarations"
          desc="Add declarations students must accept at booking."
          enabled={r.declarations.enabled}
          onToggle={(value) => updateNested('declarations', { enabled: value })}
        >
          <TextField
            label="Declaration text"
            value={r.declarations.text}
            onChange={(value) => updateNested('declarations', { text: value })}
            rows={4}
            placeholder="e.g. I confirm I am qualified to perform this treatment within my scope of practice."
          />
        </Section>

        <Section
          title="Preparation instructions"
          desc="Tell students how to prepare before the course."
          enabled={r.preparation.enabled}
          onToggle={(value) => updateNested('preparation', { enabled: value })}
        >
          <TextField
            label="Preparation instructions"
            value={r.preparation.text}
            onChange={(value) => updateNested('preparation', { text: value })}
            rows={4}
            placeholder="e.g. Complete pre-course theory and arrive with hair tied back."
          />
        </Section>

        <Section
          title="Eligibility notes"
          desc="Extra rules your team should review before accepting a booking."
          enabled={r.eligibility.enabled}
          onToggle={(value) => updateNested('eligibility', { enabled: value })}
        >
          <TextField
            label="Eligibility notes"
            value={r.eligibility.text}
            onChange={(value) => updateNested('eligibility', { text: value })}
            rows={4}
            placeholder="e.g. Manual approval required for non-medical practitioners."
          />
        </Section>
      </div>

      <div className="px-5 pb-5 pt-3 shrink-0 bg-white border-t border-gray-100">
        <button
          onClick={() => navigate(returnPath)}
          className="w-full h-12 rounded-full bg-gray-900 hover:bg-gray-800 text-white text-[15px] font-medium transition-colors"
        >
          Done
        </button>
      </div>
    </>
  );
}

function Section({ title, desc, enabled, onToggle, children }) {
  return (
    <div className="bg-gray-50 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-4 p-4">
        <div className="flex-1 min-w-0">
          <div className="text-[15px] font-medium text-gray-900">{title}</div>
          <div className="text-[12px] text-gray-500 mt-0.5 leading-snug">{desc}</div>
        </div>
        <Toggle checked={Boolean(enabled)} onChange={onToggle} />
      </div>
      {enabled && <div className="border-t border-white px-4 py-3">{children}</div>}
    </div>
  );
}
