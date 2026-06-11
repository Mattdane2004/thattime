import { Plus } from 'lucide-react';

export default function FAB({ onClick, label = 'Add' }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="absolute bottom-5 right-5 h-14 w-14 rounded-full bg-gray-900 hover:bg-gray-800 text-white flex items-center justify-center transition-colors"
    >
      <Plus size={22} strokeWidth={2} />
    </button>
  );
}
