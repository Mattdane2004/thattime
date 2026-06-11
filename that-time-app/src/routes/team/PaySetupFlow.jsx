import { useState } from 'react';
import { CreditCard } from 'lucide-react';
import ProductSelect from '../../components/ProductSelect';
import TextField from '../../components/TextField';
import Toggle from '../../components/Toggle';

// Guided pay setup — Fresha-style, two screens. Toggle on what applies
// (wage, commission, tips) and fill in the numbers as each one opens, then
// the Stripe payouts note. Used inside the guided member setup and from the
// profile Pay card's empty state.

export default function PaySetupFlow({ memberName, onComplete, onCancel }) {
  const firstName = memberName?.split(' ')[0] || 'them';
  const [step, setStep] = useState('numbers'); // numbers → payouts
  const [wageEnabled, setWageEnabled] = useState(true);
  const [rate, setRate] = useState('');
  const [ratePeriod, setRatePeriod] = useState('hourly');
  const [commissionEnabled, setCommissionEnabled] = useState(false);
  const [commission, setCommission] = useState('');
  const [tips, setTips] = useState(true);

  const numbersValid =
    (wageEnabled || commissionEnabled) &&
    (!wageEnabled || rate.trim() !== '') &&
    (!commissionEnabled || commission.trim() !== '');

  const finish = () => {
    onComplete({
      model: !wageEnabled ? 'no_base' : ratePeriod === 'hourly' ? 'hourly' : 'salary',
      rate: wageEnabled ? rate : '',
      ratePeriod,
      commission: commissionEnabled ? Number(commission || 0) : 0,
      tips,
      payoutStatus: 'Invite sent',
    });
  };

  if (step === 'numbers') {
    return (
      <div>
        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-200 p-4 space-y-4">
            <SectionToggle
              label="Wage"
              description="A base amount they always earn."
              checked={wageEnabled}
              onChange={setWageEnabled}
            />
            {wageEnabled && (
              <div className="grid grid-cols-2 gap-3">
                <TextField
                  label="Amount (£)"
                  type="number"
                  value={rate}
                  onChange={setRate}
                  placeholder={ratePeriod === 'hourly' ? '14.50' : ratePeriod === 'weekly' ? '550' : '2200'}
                />
                <ProductSelect
                  label="Per"
                  value={ratePeriod}
                  onChange={setRatePeriod}
                  options={[
                    { value: 'hourly', label: 'Hour' },
                    { value: 'weekly', label: 'Week' },
                    { value: 'monthly', label: 'Month' },
                  ]}
                />
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-gray-200 p-4 space-y-4">
            <SectionToggle
              label="Commission"
              description="They earn a percentage of what they sell."
              checked={commissionEnabled}
              onChange={setCommissionEnabled}
            />
            {commissionEnabled && (
              <TextField
                label="Commission on their sales (%)"
                type="number"
                value={commission}
                onChange={setCommission}
                placeholder="20"
              />
            )}
          </div>

          <div className="rounded-2xl border border-gray-200 p-4">
            <SectionToggle
              label="They keep their tips"
              description={`Card tips are passed to ${firstName} in full.`}
              checked={tips}
              onChange={setTips}
            />
          </div>
        </div>
        <FlowFooter
          backLabel="Not now"
          nextLabel="Continue"
          nextDisabled={!numbersValid}
          onBack={onCancel}
          onNext={() => setStep('payouts')}
        />
      </div>
    );
  }

  return (
    <div>
      <StepIntro
        title="Getting paid"
        body={`${firstName} connects their own bank through Stripe — you never handle their details. We'll include the link in their invite.`}
      />
      <div className="mt-5 rounded-2xl bg-gray-50 p-4 flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center text-gray-700 shrink-0">
          <CreditCard size={19} strokeWidth={1.75} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[14px] font-semibold text-gray-900">Stripe payout invite</div>
          <div className="text-[12px] text-gray-500 mt-0.5 leading-snug">
            Sent with their invite — payouts start once they've verified.
          </div>
        </div>
      </div>
      <FlowFooter
        backLabel="Back"
        nextLabel="Finish pay setup"
        onBack={() => setStep('numbers')}
        onNext={finish}
      />
    </div>
  );
}

function SectionToggle({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-medium text-gray-900">{label}</div>
        <div className="text-[12px] text-gray-500 mt-0.5 leading-snug">{description}</div>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

function StepIntro({ title, body }) {
  return (
    <div>
      <div className="text-[20px] font-semibold tracking-tight text-gray-950">{title}</div>
      <div className="text-[13px] text-gray-500 mt-1.5 leading-snug">{body}</div>
    </div>
  );
}

function FlowFooter({ backLabel, nextLabel, nextDisabled = false, onBack, onNext }) {
  return (
    <div className="mt-6 flex gap-2">
      <button
        onClick={onBack}
        className="h-12 px-5 rounded-full border border-gray-200 text-[14px] font-medium text-gray-900 hover:bg-gray-50 transition-colors"
      >
        {backLabel}
      </button>
      <button
        onClick={onNext}
        disabled={nextDisabled}
        className={
          'flex-1 h-12 rounded-full text-[15px] font-medium transition-colors ' +
          (nextDisabled ? 'bg-gray-100 text-gray-400' : 'bg-gray-900 hover:bg-gray-800 text-white')
        }
      >
        {nextLabel}
      </button>
    </div>
  );
}
