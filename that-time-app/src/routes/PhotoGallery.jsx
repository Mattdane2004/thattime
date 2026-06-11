import { useNavigate, useOutletContext } from 'react-router-dom';
import { Plus, Trash2, Camera } from 'lucide-react';
import ScreenHeader from '../components/ScreenHeader';
import EmptyState from '../components/EmptyState';
import { makePhoto } from '../data/photoPlaceholders';

export default function PhotoGallery() {
  const navigate = useNavigate();
  const { draft, updateDraft } = useOutletContext();

  const addPhoto = () => {
    const next = [...draft.photos, makePhoto(draft.photos.length)];
    updateDraft({ photos: next });
  };

  const removePhoto = (id) => {
    updateDraft({ photos: draft.photos.filter((p) => p.id !== id) });
  };

  const hasPhotos = draft.photos.length > 0;

  return (
    <>
      <ScreenHeader title="Photos" onBack={() => navigate('/service')} />
      <div className="flex-1 overflow-y-auto px-5">
        <div className="pt-2 pb-6">
          <div className="text-[26px] leading-tight font-semibold tracking-tight">Photos</div>
          <div className="text-[14px] text-gray-500 mt-1">
            {hasPhotos
              ? `${draft.photos.length} photo${draft.photos.length === 1 ? '' : 's'} · tap to remove`
              : 'Show your work. The first photo becomes the cover.'}
          </div>
        </div>

        {!hasPhotos ? (
          <EmptyState
            icon={Camera}
            title="No photos yet"
            subtitle="Add shots of your space, your work, or the service in action."
          >
            <button
              onClick={addPhoto}
              className="w-full h-12 rounded-full bg-gray-900 hover:bg-gray-800 text-white text-[15px] font-medium transition-colors"
            >
              Add a photo
            </button>
          </EmptyState>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2 pb-4">
              {draft.photos.map((p, i) => (
                <div key={p.id} className="relative">
                  <div
                    className={
                      'aspect-square rounded-2xl flex items-center justify-center text-[12px] text-gray-600 ' +
                      p.shade
                    }
                  >
                    {i === 0 && (
                      <span className="absolute top-2 left-2 text-[11px] px-2 py-0.5 rounded-full bg-gray-900 text-white">
                        Cover
                      </span>
                    )}
                    {p.label}
                  </div>
                  <button
                    onClick={() => removePhoto(p.id)}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center"
                    aria-label="Remove photo"
                  >
                    <Trash2 size={14} strokeWidth={1.75} />
                  </button>
                </div>
              ))}
              <button
                onClick={addPhoto}
                className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 text-gray-500 hover:bg-gray-50 transition-colors"
              >
                <Plus size={20} strokeWidth={1.75} />
                <span className="text-[12px]">Add</span>
              </button>
            </div>
          </>
        )}

        <div className="h-6" />
      </div>
    </>
  );
}
