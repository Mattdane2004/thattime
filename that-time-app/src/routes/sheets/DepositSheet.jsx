import { useOutletContext } from 'react-router-dom';
import BottomSheet from '../../components/BottomSheet';
import DepositControl from '../../components/DepositControl';

export default function DepositSheet({ open, onClose }) {
  const { draft, updateDraft } = useOutletContext();

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Deposit"
      footer={
        <button
          onClick={onClose}
          className="w-full h-12 rounded-full bg-gray-900 hover:bg-gray-800 text-white text-[15px] font-medium transition-colors"
        >
          Done
        </button>
      }
    >
      <DepositControl draft={draft} updateDraft={updateDraft} />
    </BottomSheet>
  );
}
