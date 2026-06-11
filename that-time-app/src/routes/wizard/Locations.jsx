import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import ScreenHeader from '../../components/ScreenHeader';
import HelpTrigger from '../../components/HelpTrigger';
import WizardFooter from '../../components/WizardFooter';
import LocationCards from '../../components/LocationCards';
import InSalonSheet from '../sheets/InSalonSheet';
import MobileSheet from '../sheets/MobileSheet';
import RemoteSheet from '../sheets/RemoteSheet';
import { anyLocationEnabled, offerTypeMeta, wizardTotalFor } from '../../data/offerTypes';

export default function Locations() {
  const navigate = useNavigate();
  const { draft } = useOutletContext();
  const [sheet, setSheet] = useState(null);
  const meta = offerTypeMeta(draft.type);
  const canContinue = anyLocationEnabled(draft.locations);
  // Class wizard now goes Location → Schedule → Staff (availability needs the
  // schedule first); other types still go Location → Staff.
  const isClass = draft.type === 'class';
  const nextPath = isClass ? '/new/class-details' : '/new/staff';

  return (
    <>
      <ScreenHeader title="" onBack={() => navigate('/new/basics')} rightAction={<HelpTrigger helpKey="locations" />} />
      <div className="flex-1 overflow-y-auto px-5">
        <div className="pt-2 pb-6">
          <div className="text-[26px] leading-tight font-semibold tracking-tight">Locations</div>
          <div className="text-[14px] text-gray-500 mt-1">
            Choose where this {meta.noun} is offered. Select one or more.
          </div>
        </div>

        <div className="pb-6">
          <LocationCards onEdit={setSheet} />
        </div>
      </div>
      <WizardFooter
        step={2}
        total={wizardTotalFor(draft.type)}
        onBack={() => navigate('/new/basics')}
        onNext={() => navigate(nextPath)}
        nextDisabled={!canContinue}
      />

      <InSalonSheet open={sheet === 'inSalon'} onClose={() => setSheet(null)} />
      <MobileSheet open={sheet === 'mobile'} onClose={() => setSheet(null)} />
      <RemoteSheet open={sheet === 'remote'} onClose={() => setSheet(null)} />
    </>
  );
}
