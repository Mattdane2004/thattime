import { useState } from 'react';
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import { Search, Check, DoorOpen, Wrench } from 'lucide-react';
import ScreenHeader from '../../../components/ScreenHeader';
import { resourcesCatalog } from '../../../data/demoResourcesCatalog';
import { businessLocations } from '../../../data/business';
import { offerBasePath } from '../../routeBase';

const locationSummary = (resource) => {
  if (!resource?.locationIds || resource.locationIds.length === 0) return 'All locations';
  return resource.locationIds
    .map((id) => businessLocations.find((l) => l.id === id)?.name)
    .filter(Boolean)
    .join(', ');
};

const normalize = (r) =>
  typeof r === 'string'
    ? { resourceId: r, note: '', setupMin: 0, cleanupMin: 0, autoIncluded: false }
    : { note: '', setupMin: 0, cleanupMin: 0, autoIncluded: false, ...r };

export default function RoomPicker() {
  const navigate = useNavigate();
  const location = useLocation();
  const { draft, updateDraft } = useOutletContext();
  const [query, setQuery] = useState('');
  const basePath = offerBasePath(draft, location);

  const prevAttachments = (draft.resources || []).map(normalize);
  const prevRoomIds = prevAttachments
    .filter((a) => {
      const r = resourcesCatalog.find((c) => c.id === a.resourceId);
      return r?.type === 'space';
    })
    .map((a) => a.resourceId);
  const prevChildIds = prevAttachments
    .filter((a) => {
      const r = resourcesCatalog.find((c) => c.id === a.resourceId);
      return r?.type === 'equipment' && r?.parentId && prevRoomIds.includes(r.parentId);
    })
    .map((a) => a.resourceId);

  const [selectedRooms, setSelectedRooms] = useState(new Set(prevRoomIds));
  const [excludedChildren, setExcludedChildren] = useState(() => {
    // A child is "excluded" if its parent room is already attached but it isn't
    const excluded = new Set();
    for (const roomId of prevRoomIds) {
      const allChildren = resourcesCatalog.filter((r) => r.parentId === roomId);
      for (const c of allChildren) {
        if (!prevChildIds.includes(c.id)) excluded.add(c.id);
      }
    }
    return excluded;
  });

  const toggleRoom = (id) => {
    const next = new Set(selectedRooms);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedRooms(next);
  };

  const toggleChild = (id) => {
    const next = new Set(excludedChildren);
    next.has(id) ? next.delete(id) : next.add(id);
    setExcludedChildren(next);
  };

  const allRooms = resourcesCatalog.filter((r) => r.type === 'space');
  const filteredRooms = allRooms.filter((r) =>
    r.name.toLowerCase().includes(query.toLowerCase())
  );

  const save = () => {
    // Keep previous non-room attachments that aren't children of our selected rooms
    const untouched = prevAttachments.filter((a) => {
      const r = resourcesCatalog.find((c) => c.id === a.resourceId);
      if (!r) return false;
      if (r.type === 'space') return false; // we'll rebuild space attachments
      if (r.parentId && selectedRooms.has(r.parentId)) return false; // we'll rebuild children of picked rooms
      return true;
    });

    const noteFor = (id) => prevAttachments.find((a) => a.resourceId === id)?.note || '';
    const setupFor = (id) => prevAttachments.find((a) => a.resourceId === id)?.setupMin || 0;
    const cleanupFor = (id) =>
      prevAttachments.find((a) => a.resourceId === id)?.cleanupMin || 0;

    const rooms = Array.from(selectedRooms).map((id) => ({
      resourceId: id,
      note: noteFor(id),
      setupMin: setupFor(id),
      cleanupMin: cleanupFor(id),
      autoIncluded: false,
    }));

    const children = [];
    for (const roomId of selectedRooms) {
      const kids = resourcesCatalog.filter((r) => r.parentId === roomId);
      for (const kid of kids) {
        if (excludedChildren.has(kid.id)) continue;
        children.push({
          resourceId: kid.id,
          note: noteFor(kid.id),
          setupMin: setupFor(kid.id),
          cleanupMin: cleanupFor(kid.id),
          autoIncluded: false,
        });
      }
    }

    updateDraft({ resources: [...untouched, ...rooms, ...children] });
    navigate(`${basePath}/resources`);
  };

  const totalAttached =
    selectedRooms.size +
    Array.from(selectedRooms)
      .flatMap((roomId) => resourcesCatalog.filter((r) => r.parentId === roomId))
      .filter((k) => !excludedChildren.has(k.id)).length;

  return (
    <>
      <ScreenHeader title="Add room" onBack={() => navigate(`${basePath}/resources`)} />
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-6">
        <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-3 mb-4">
          <Search size={15} className="text-gray-400 shrink-0" strokeWidth={1.75} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search rooms"
            className="flex-1 text-[15px] bg-transparent placeholder:text-gray-400 outline-none"
          />
        </div>

        <div className="text-[12px] text-gray-500 leading-snug mb-4">
          Pick a room. Equipment inside it is auto-included — you can untick anything you don't need.
        </div>

        <div className="space-y-3">
          {filteredRooms.map((room) => {
            const isOn = selectedRooms.has(room.id);
            const children = resourcesCatalog.filter((r) => r.parentId === room.id);
            return (
              <div key={room.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                <button
                  onClick={() => toggleRoom(room.id)}
                  className={
                    'w-full flex items-center gap-3 p-4 text-left transition-colors ' +
                    (isOn ? 'bg-gray-50' : 'hover:bg-gray-50')
                  }
                >
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                    <DoorOpen size={16} className="text-gray-700" strokeWidth={1.75} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[15px] font-medium text-gray-900">{room.name}</div>
                    <div className="text-[12px] text-gray-500 mt-0.5 truncate">
                      Capacity {room.capacity} · {locationSummary(room)}
                    </div>
                  </div>
                  <div
                    className={
                      'w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-colors ' +
                      (isOn ? 'bg-gray-900' : 'bg-gray-100')
                    }
                  >
                    {isOn && <Check size={14} className="text-white" strokeWidth={2.5} />}
                  </div>
                </button>

                {isOn && children.length > 0 && (
                  <div className="border-t border-gray-100 bg-gray-50/60 py-1">
                    <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-4 pt-2 pb-1">
                      Equipment inside — auto-included
                    </div>
                    {children.map((kid) => {
                      const excluded = excludedChildren.has(kid.id);
                      return (
                        <button
                          key={kid.id}
                          onClick={() => toggleChild(kid.id)}
                          className="w-full flex items-center gap-3 py-2.5 px-4 text-left hover:bg-gray-100/70 transition-colors"
                        >
                          <div className="w-4 text-[12px] text-gray-300 shrink-0">▸</div>
                          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 border border-gray-100">
                            <Wrench size={12} className="text-gray-600" strokeWidth={1.75} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[14px] font-medium text-gray-900">{kid.name}</div>
                            <div className="text-[12px] text-gray-500 truncate">
                              {locationSummary(kid)}
                            </div>
                          </div>
                          <div
                            className={
                              'w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-colors ' +
                              (excluded ? 'bg-white border border-gray-200' : 'bg-gray-900')
                            }
                          >
                            {!excluded && <Check size={12} className="text-white" strokeWidth={2.5} />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="px-5 pb-5 pt-3 shrink-0 bg-white border-t border-gray-100">
        <button
          onClick={save}
          disabled={totalAttached === 0}
          className={
            'w-full h-12 rounded-full text-[15px] font-medium transition-colors ' +
            (totalAttached === 0
              ? 'bg-gray-100 text-gray-400'
              : 'bg-gray-900 hover:bg-gray-800 text-white')
          }
        >
          Save{totalAttached > 0 ? ` · ${totalAttached} attached` : ''}
        </button>
      </div>
    </>
  );
}
