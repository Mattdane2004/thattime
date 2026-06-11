import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import ScreenHeader from '../../components/ScreenHeader';
import HelpTrigger from '../../components/HelpTrigger';
import SettingGroup from './settings/SettingGroup';
import SettingRow from './settings/SettingRow';
import WhoCanBookSheet from './settings/sheets/WhoCanBookSheet';
import LeadTimeSheet from './settings/sheets/LeadTimeSheet';
import MaxAdvanceSheet from './settings/sheets/MaxAdvanceSheet';
import BufferSheet from './settings/sheets/BufferSheet';
import CancellationSheet, { cancellationSummary } from './settings/sheets/CancellationSheet';
import RescheduleLimitSheet from './settings/sheets/RescheduleLimitSheet';
import PaymentMethodsSheet, { methodsSummary } from './settings/sheets/PaymentMethodsSheet';
import DepositSheet, { depositSummary } from './settings/sheets/DepositSheet';
import { emptyServiceSettings } from '../../data/businessDefaults';
import { offerTypeMeta } from '../../data/offerTypes';
import { offerBasePath } from '../routeBase';

const DEFAULT = { text: 'Default', muted: true };

const whoCanBookLabel = (k) =>
  ({ anyone: 'Anyone', existing: 'Existing clients', subscribers: 'Subscribers only' }[k] || 'Anyone');

const leadTimeValue = (v) => (v ? `${v.value} ${v.unit}` : null);
const maxAdvanceValue = (v) => (v ? `${v.value} ${v.unit}` : null);
const bufferValue = (v) => (v ? `${v.before || 0}m / ${v.after || 0}m` : null);
const rescheduleLimitValue = (v) => (v ? (v.value == null ? 'Unlimited' : `${v.value} times`) : null);

export default function ServiceSettings() {
  const navigate = useNavigate();
  const location = useLocation();
  const { draft, updateDraft } = useOutletContext();
  const [sheet, setSheet] = useState(null);
  const returnPath = offerBasePath(draft, location);
  const meta = offerTypeMeta(returnPath === '/service' ? draft.type : returnPath.slice(1));

  useEffect(() => {
    if (!draft.settings) updateDraft({ settings: emptyServiceSettings() });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const settings = draft.settings || emptyServiceSettings();
  const update = (patch) => updateDraft({ settings: { ...settings, ...patch } });

  return (
    <>
      <ScreenHeader title={`${meta.label} settings`} onBack={() => navigate(returnPath)} rightAction={<HelpTrigger helpKey="serviceSettings" />} />
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-8 bg-gray-50">
        {/* Access & visibility */}
        <SettingGroup title="Access & visibility">
          <SettingRow
            type="toggle"
            label="Online booking"
            description={`When off, clients can't book this ${meta.noun} online. Staff can still book manually.`}
            toggleValue={settings.onlineBooking}
            onToggle={(v) => update({ onlineBooking: v })}
          />
          <SettingRow
            label="Who can book"
            value={whoCanBookLabel(settings.whoCanBook)}
            onClick={() => setSheet('whoCanBook')}
          />
          <SettingRow
            type="toggle"
            label="Prescription required"
            description={
              settings.prescriptionRequired
                ? "Clients will be told a prescription is required at booking."
                : 'Flag only — no verification is applied.'
            }
            toggleValue={settings.prescriptionRequired}
            onToggle={(v) => update({ prescriptionRequired: v })}
          />
        </SettingGroup>

        {/* Booking rules */}
        <SettingGroup title="Booking rules">
          <SettingRow
            label="Lead time"
            value={leadTimeValue(settings.leadTime) || DEFAULT}
            onClick={() => setSheet('leadTime')}
          />
          <SettingRow
            label="Max advance booking"
            value={maxAdvanceValue(settings.maxAdvance) || DEFAULT}
            onClick={() => setSheet('maxAdvance')}
          />
          <SettingRow
            label="Buffer time"
            value={bufferValue(settings.buffer) || DEFAULT}
            onClick={() => setSheet('buffer')}
          />
          <SettingRow
            label="Cancellation policy"
            value={cancellationSummary(settings.cancellation) || DEFAULT}
            onClick={() => setSheet('cancellation')}
          />
        </SettingGroup>

        {/* Rescheduling */}
        <SettingGroup title="Rescheduling">
          <SettingRow
            type="toggle"
            label="Client rescheduling"
            description="When off, only staff can reschedule a booking."
            toggleValue={settings.clientReschedulingEnabled}
            onToggle={(v) => update({ clientReschedulingEnabled: v })}
          />
          <SettingRow
            label="Reschedule limit"
            value={rescheduleLimitValue(settings.rescheduleLimit) || DEFAULT}
            onClick={() => setSheet('rescheduleLimit')}
          />
        </SettingGroup>

        {/* Payment */}
        <SettingGroup title="Payment">
          <SettingRow
            label="Payment methods"
            value={settings.paymentMethods ? methodsSummary(settings.paymentMethods) : DEFAULT}
            onClick={() => setSheet('paymentMethods')}
          />
          <SettingRow
            label="Deposit"
            value={settings.deposit ? depositSummary(settings.deposit) : DEFAULT}
            onClick={() => setSheet('deposit')}
          />
          <SettingRow
            type="toggle"
            label="Pay on arrival"
            description="Client confirms booking without paying — pays when they arrive."
            toggleValue={settings.payOnArrival}
            onToggle={(v) => update({ payOnArrival: v })}
          />
          <SettingRow
            type="toggle"
            label="Pay after service"
            description="Client is invoiced after the appointment — useful when the final price depends on what's done."
            toggleValue={settings.payAfterService}
            onToggle={(v) => update({ payAfterService: v })}
          />
        </SettingGroup>
      </div>

      <WhoCanBookSheet
        open={sheet === 'whoCanBook'}
        value={settings.whoCanBook}
        onClose={() => setSheet(null)}
        onSave={(v) => update({ whoCanBook: v })}
      />
      <LeadTimeSheet
        open={sheet === 'leadTime'}
        value={settings.leadTime}
        onClose={() => setSheet(null)}
        onSave={(v) => update({ leadTime: v })}
      />
      <MaxAdvanceSheet
        open={sheet === 'maxAdvance'}
        value={settings.maxAdvance}
        onClose={() => setSheet(null)}
        onSave={(v) => update({ maxAdvance: v })}
      />
      <BufferSheet
        open={sheet === 'buffer'}
        value={settings.buffer}
        onClose={() => setSheet(null)}
        onSave={(v) => update({ buffer: v })}
      />
      <CancellationSheet
        open={sheet === 'cancellation'}
        value={settings.cancellation}
        onClose={() => setSheet(null)}
        onSave={(v) => update({ cancellation: v })}
      />
      <RescheduleLimitSheet
        open={sheet === 'rescheduleLimit'}
        value={settings.rescheduleLimit}
        onClose={() => setSheet(null)}
        onSave={(v) => update({ rescheduleLimit: v })}
      />
      <PaymentMethodsSheet
        open={sheet === 'paymentMethods'}
        value={settings.paymentMethods}
        onClose={() => setSheet(null)}
        onSave={(v) => update({ paymentMethods: v })}
      />
      <DepositSheet
        open={sheet === 'deposit'}
        value={settings.deposit}
        onClose={() => setSheet(null)}
        onSave={(v) => update({ deposit: v })}
      />
    </>
  );
}
