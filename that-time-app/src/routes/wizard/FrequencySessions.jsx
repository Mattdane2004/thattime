import { useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import { Check, Infinity as InfinityIcon, Scissors, Hash } from 'lucide-react';
import ScreenHeader from '../../components/ScreenHeader';
import HelpTrigger from '../../components/HelpTrigger';
import WizardFooter from '../../components/WizardFooter';
import TextField from '../../components/TextField';
import Toggle from '../../components/Toggle';
import { demoServices } from '../../data/demoServices';
import { emptySubscriptionDetails, wizardTotalFor, billingPeriodLabel } from '../../data/offerTypes';
import { offerBasePath } from '../routeBase';

const availableItems = demoServices.filter((item) => item.type === 'service' || item.type === 'class');

export default function FrequencySessions() {
  const navigate = useNavigate();
  const location = useLocation();
  const { draft, updateDraft } = useOutletContext();
  const isWizard = location.pathname.startsWith('/new/');
  const details = draft.subscriptionDetails || emptySubscriptionDetails();
  const selected = new Set(details.includedItemIds || []);
  const returnPath = isWizard ? '/new/basics' : offerBasePath(draft, location);
  const nextPath = isWizard ? '/new/frequency-billing' : returnPath;

  const updateDetails = (patch) =>
    updateDraft({ subscriptionDetails: { ...details, ...patch } });

  const toggleItem = (id) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    updateDetails({ includedItemIds: Array.from(next) });
  };

  const setMode = (unlimited) => {
    updateDetails({
      unlimitedUsage: unlimited,
      includedSessions: unlimited ? details.includedSessions : (details.includedSessions || 4),
      rollover: unlimited ? false : details.rollover,
    });
  };

  const periodLabel = billingPeriodLabel(details.billingPeriod || 'month');
  const canContinue = selected.size > 0 && (details.unlimitedUsage || Number(details.includedSessions) > 0);

  return (
    <>
      <ScreenHeader title="" onBack={() => navigate(returnPath)} rightAction={<HelpTrigger helpKey="frequencySessions" />} />
      <div className="flex-1 overflow-y-auto px-5">
        <div className="pt-2 pb-6">
          <div className="text-[26px] leading-tight font-semibold tracking-tight">Included sessions</div>
          <div className="text-[14px] text-gray-500 mt-1">
            Choose how often members can redeem and which services they get.
          </div>
        </div>

        <div className="space-y-6 pb-6">
          <div>
            <div className="text-[13px] font-medium text-gray-700 mb-2">Redemptions per {periodLabel}</div>
            <div className="grid grid-cols-2 gap-2">
              <ModeCard
                active={!details.unlimitedUsage}
                Icon={Hash}
                title="Set number"
                body="A fixed quantity of sessions per period."
                onClick={() => setMode(false)}
              />
              <ModeCard
                active={Boolean(details.unlimitedUsage)}
                Icon={InfinityIcon}
                title="Unlimited"
                body="No cap on redemptions in a period."
                onClick={() => setMode(true)}
              />
            </div>
          </div>

          {!details.unlimitedUsage && (
            <TextField
              label={`Sessions per ${periodLabel}`}
              type="number"
              value={details.includedSessions}
              onChange={(v) => updateDetails({ includedSessions: v })}
              placeholder="4"
            />
          )}

          <div>
            <div className="text-[13px] font-medium text-gray-700 mb-2">Included services</div>
            <div className="-mx-2">
              {availableItems.map((item) => {
                const active = selected.has(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleItem(item.id)}
                    className="w-full flex items-center gap-4 px-3 py-3 rounded-xl text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-11 h-11 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                      <Scissors size={17} className="text-gray-700" strokeWidth={1.75} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[15px] text-gray-900 truncate">{item.name}</div>
                      <div className="text-[13px] text-gray-500 mt-0.5 capitalize">{item.type}</div>
                    </div>
                    <div className={'w-6 h-6 rounded-md flex items-center justify-center transition-colors ' + (active ? 'bg-gray-900' : 'bg-gray-100')}>
                      {active && <Check size={14} className="text-white" strokeWidth={2.5} />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {!details.unlimitedUsage && (
            <div className="flex items-center gap-4 bg-gray-50 rounded-2xl p-4">
              <div className="flex-1">
                <div className="text-[15px] font-medium">Rollover unused sessions</div>
                <div className="text-[13px] text-gray-500 mt-0.5 leading-snug">
                  Unused redemptions carry over into the next billing period.
                </div>
              </div>
              <Toggle
                checked={Boolean(details.rollover)}
                onChange={(v) => updateDetails({ rollover: v })}
              />
            </div>
          )}
        </div>
      </div>

      {isWizard ? (
        <WizardFooter
          step={3}
          total={wizardTotalFor(draft.type)}
          onBack={() => navigate('/new/basics')}
          onNext={() => navigate(nextPath)}
          nextDisabled={!canContinue}
        />
      ) : (
        <div className="px-5 pb-5 pt-3 shrink-0 bg-white border-t border-gray-100">
          <button
            onClick={() => navigate(returnPath)}
            disabled={!canContinue}
            className={
              'w-full h-12 rounded-full text-[15px] font-medium transition-colors ' +
              (canContinue ? 'bg-gray-900 hover:bg-gray-800 text-white' : 'bg-gray-100 text-gray-400')
            }
          >
            Done
          </button>
        </div>
      )}
    </>
  );
}

function ModeCard({ active, Icon, title, body, onClick }) {
  return (
    <button
      onClick={onClick}
      className={
        'rounded-2xl p-4 text-left transition-colors ' +
        (active ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900 hover:bg-gray-100')
      }
    >
      <div className={(active ? 'bg-white/10' : 'bg-white') + ' w-9 h-9 rounded-xl flex items-center justify-center mb-3'}>
        <Icon size={17} strokeWidth={1.75} />
      </div>
      <div className="text-[14px] font-semibold leading-tight">{title}</div>
      <div className={(active ? 'text-white/70' : 'text-gray-500') + ' text-[12px] leading-snug mt-1'}>{body}</div>
    </button>
  );
}
