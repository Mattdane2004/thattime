import { useOutletContext } from 'react-router-dom';
import BottomSheet from '../../components/BottomSheet';
import CancellationPicker from '../../components/CancellationPicker';

export default function CancellationSheet({ open, onClose }) {
  const { draft, updateDraft } = useOutletContext();

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Cancellation policy"
      footer={
        <button
          onClick={onClose}
          className="w-full h-12 rounded-full bg-gray-900 hover:bg-gray-800 text-white text-[15px] font-medium transition-colors"
        >
          Done
        </button>
      }
    >
      <CancellationPicker
        value={draft.cancellationPolicy}
        onChange={(v) => updateDraft({ cancellationPolicy: v })}
      />
    </BottomSheet>
  );
}
