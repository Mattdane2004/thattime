import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import ScreenHeader from '../../../components/ScreenHeader';
import WizardFooter from '../../../components/WizardFooter';
import BasicsForm from './forms/BasicsForm';
import DiscountForm from './forms/DiscountForm';
import AudienceForm, { emptyAudience } from './forms/AudienceForm';

export default function GroupWizard() {
  const navigate = useNavigate();
  const { draft, updateDraft } = useOutletContext();

  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [query, setQuery] = useState('');
  const [serviceIds, setServiceIds] = useState([]);
  const [discountMode, setDiscountMode] = useState('none');
  const [discountAmount, setDiscountAmount] = useState('');
  const [showPopular, setShowPopular] = useState(false);
  const [audience, setAudience] = useState(emptyAudience());

  const step1Valid = name.trim().length > 0 && serviceIds.length > 0;
  const step2Valid = discountMode === 'none' || discountAmount !== '';

  const close = () => navigate('/service/related');

  const back = () => {
    if (step === 1) close();
    else setStep(step - 1);
  };

  const next = () => {
    if (step === 1 && !step1Valid) return;
    if (step === 2 && !step2Valid) return;
    setStep(step + 1);
  };

  const save = () => {
    const record = {
      id: crypto.randomUUID(),
      name: name.trim(),
      serviceIds,
      discountMode,
      discountAmount: discountMode === 'none' ? '' : discountAmount,
      showPopular,
      audience,
    };
    updateDraft({ related: [...(draft.related || []), record] });
    navigate('/service/related');
  };

  const titles = {
    1: 'Name & services',
    2: 'Discount',
    3: 'Audience',
  };

  const subtitles = {
    1: 'Pick services that should share this discount and audience.',
    2: 'Set the discount when any service in this group is added to a booking.',
    3: 'Narrow who sees this group at booking.',
  };

  return (
    <>
      <ScreenHeader
        title=""
        onBack={step > 1 ? back : undefined}
        onClose={step === 1 ? close : undefined}
      />
      <div className="flex-1 overflow-y-auto px-5">
        <div className="pt-2 pb-6">
          <div className="text-[26px] leading-tight font-semibold tracking-tight">{titles[step]}</div>
          <div className="text-[14px] text-gray-500 mt-1">{subtitles[step]}</div>
        </div>

        <div className="pb-6">
          {step === 1 && (
            <BasicsForm
              name={name}
              onNameChange={setName}
              serviceIds={serviceIds}
              onServiceIdsChange={setServiceIds}
              query={query}
              onQueryChange={setQuery}
            />
          )}
          {step === 2 && (
            <DiscountForm
              discountMode={discountMode}
              onDiscountModeChange={setDiscountMode}
              discountAmount={discountAmount}
              onDiscountAmountChange={setDiscountAmount}
              showPopular={showPopular}
              onShowPopularChange={setShowPopular}
            />
          )}
          {step === 3 && (
            <AudienceForm audience={audience} onAudienceChange={setAudience} />
          )}
        </div>
      </div>

      <WizardFooter
        step={step}
        total={3}
        onBack={step > 1 ? back : undefined}
        onNext={step === 3 ? save : next}
        nextLabel={step === 3 ? 'Create group' : 'Next'}
        nextDisabled={
          (step === 1 && !step1Valid) || (step === 2 && !step2Valid)
        }
      />
    </>
  );
}
