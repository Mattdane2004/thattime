import { useOutletContext } from 'react-router-dom';
import BottomSheet from '../../components/BottomSheet';
import TextField from '../../components/TextField';
import DurationPicker from '../../components/DurationPicker';
import { offerTypeMeta } from '../../data/offerTypes';

export default function PriceSheet({ open, onClose }) {
  const { draft, updateDraft } = useOutletContext();
  const meta = offerTypeMeta(draft.type);
  const isSubscription = draft.type === 'subscription';
  const isBundle = draft.type === 'bundle';

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={isSubscription ? 'Billing' : 'Price & duration'}
      footer={
        <button
          onClick={onClose}
          className="w-full h-12 rounded-full bg-gray-900 hover:bg-gray-800 text-white text-[15px] font-medium transition-colors"
        >
          Done
        </button>
      }
    >
      <div className="space-y-5">
        <TextField
          label={isSubscription ? 'Billing price (£)' : meta.priceLabel || 'Price (£)'}
          type="number"
          value={draft.price}
          onChange={(v) => updateDraft({ price: v })}
          placeholder="35"
        />
        {!isSubscription && (
          <DurationPicker
            value={draft.durationMin}
            onChange={(v) => updateDraft({ price: draft.price, durationMin: v })}
          />
        )}
        {isBundle && (
          <div className="text-[12px] text-gray-500 leading-snug">
            Bundle duration can also be refined from the included services settings.
          </div>
        )}
      </div>
    </BottomSheet>
  );
}
