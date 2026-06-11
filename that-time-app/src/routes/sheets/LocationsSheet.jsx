import { useState } from 'react';
import BottomSheet from '../../components/BottomSheet';
import LocationCards from '../../components/LocationCards';
import InSalonSheet from './InSalonSheet';
import MobileSheet from './MobileSheet';
import RemoteSheet from './RemoteSheet';

export default function LocationsSheet({ open, onClose }) {
  const [inner, setInner] = useState(null);

  return (
    <>
      <BottomSheet
        open={open && !inner}
        onClose={onClose}
        title="Locations"
        footer={
          <button
            onClick={onClose}
            className="w-full h-12 rounded-full bg-gray-900 hover:bg-gray-800 text-white text-[15px] font-medium transition-colors"
          >
            Done
          </button>
        }
      >
        <LocationCards onEdit={setInner} />
      </BottomSheet>

      <InSalonSheet open={inner === 'inSalon'} onClose={() => setInner(null)} />
      <MobileSheet open={inner === 'mobile'} onClose={() => setInner(null)} />
      <RemoteSheet open={inner === 'remote'} onClose={() => setInner(null)} />
    </>
  );
}
