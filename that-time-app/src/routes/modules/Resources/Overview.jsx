import { useState } from 'react';
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import { Box, Plus, Trash2, DoorOpen, Wrench, ChevronRight, Info } from 'lucide-react';
import ScreenHeader from '../../../components/ScreenHeader';
import HelpTrigger from '../../../components/HelpTrigger';
import AttachmentSheet from './AttachmentSheet';
import { resourcesCatalog } from '../../../data/demoResourcesCatalog';
import { businessLocations } from '../../../data/business';
import { offerBasePath } from '../../routeBase';

const normalize = (r) => {
  const base = {
    note: '',
    setupMin: 0,
    cleanupMin: 0,
    timingMode: 'whole',
    firstMin: 0,
    lastMin: 0,
    windowStart: 0,
    windowEnd: 0,
    autoIncluded: false,
  };
  if (typeof r === 'string') return { ...base, resourceId: r };
  return { ...base, ...r };
};

const locationSummary = (resource) => {
  if (!resource?.locationIds || resource.locationIds.length === 0) return 'All locations';
  return resource.locationIds
    .map((id) => businessLocations.find((l) => l.id === id)?.name)
    .filter(Boolean)
    .join(', ');
};

const bufferSummary = (a) => {
  if (!a.setupMin && !a.cleanupMin) return null;
  const parts = [];
  if (a.setupMin > 0) parts.push(`+${a.setupMin}m before`);
  if (a.cleanupMin > 0) parts.push(`+${a.cleanupMin}m after`);
  return parts.join(' · ');
};

const timingChip = (a) => {
  if (a.timingMode === 'first' && a.firstMin > 0) return `First ${a.firstMin}m`;
  if (a.timingMode === 'last' && a.lastMin > 0) return `Last ${a.lastMin}m`;
  if (a.timingMode === 'window' && (a.windowStart > 0 || a.windowEnd > 0)) {
    return `${a.windowStart}\u2013${a.windowEnd}m`;
  }
  return null;
};

function TypeIcon({ type }) {
  const Icon = type === 'space' ? DoorOpen : Wrench;
  return (
    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
      <Icon size={16} className="text-gray-700" strokeWidth={1.75} />
    </div>
  );
}

function AttachmentRow({ attachment, resource, onOpen, onRemove, nested = false, viaNames = [] }) {
  const buffer = bufferSummary(attachment);
  const timing = timingChip(attachment);
  const metaParts = [];
  if (resource.type === 'space') metaParts.push(`Capacity ${resource.capacity}`);
  metaParts.push(locationSummary(resource));
  if (buffer) metaParts.push(buffer);
  const meta = metaParts.join(' · ');

  return (
    <div className={'flex items-center gap-3 ' + (nested ? 'pl-10' : '')}>
      <button
        onClick={onOpen}
        className={
          'flex-1 flex items-center gap-3 text-left min-w-0 py-3 px-2 rounded-xl hover:bg-gray-50 transition-colors'
        }
      >
        {!nested && <TypeIcon type={resource.type} />}
        {nested && <div className="w-4 text-[12px] text-gray-300 shrink-0">▸</div>}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="text-[15px] font-medium text-gray-900 truncate">{resource.name}</div>
            {attachment.autoIncluded && (
              <span className="text-[10px] font-semibold uppercase tracking-wider bg-gray-900 text-white rounded-full px-2 py-0.5 shrink-0">
                Auto
              </span>
            )}
          </div>
          <div className="text-[12px] text-gray-500 mt-0.5 truncate">{meta}</div>
          {attachment.autoIncluded && viaNames.length > 0 && (
            <div className="text-[12px] text-gray-500 mt-0.5 truncate">
              Needed by {viaNames.join(', ')}
            </div>
          )}
          {attachment.note && (
            <div className="text-[12px] text-gray-700 mt-1 truncate">{attachment.note}</div>
          )}
        </div>

        {timing && (
          <div className="text-[11px] font-medium text-white bg-gray-900 rounded-full px-2 py-1 shrink-0">
            {timing}
          </div>
        )}

        <ChevronRight size={15} className="text-gray-300 shrink-0" strokeWidth={2} />
      </button>

      {!attachment.autoIncluded && onRemove && (
        <button
          onClick={onRemove}
          className="text-gray-300 hover:text-gray-600 transition-colors p-2"
          aria-label="Remove"
        >
          <Trash2 size={14} strokeWidth={1.75} />
        </button>
      )}
    </div>
  );
}

export default function ResourcesOverview() {
  const navigate = useNavigate();
  const location = useLocation();
  const { draft, updateDraft } = useOutletContext();
  const [editingId, setEditingId] = useState(null);
  const basePath = offerBasePath(draft, location);

  const attachments = (draft.resources || []).map(normalize);
  const attachmentByResourceId = new Map(attachments.map((a) => [a.resourceId, a]));
  const explicitAttachments = attachments.filter((a) => !a.autoIncluded);

  const viaNamesFor = (parentId) =>
    explicitAttachments
      .map((a) => resourcesCatalog.find((r) => r.id === a.resourceId))
      .filter((r) => r?.parentId === parentId)
      .map((r) => r.name);

  const attachedSpaceIds = attachments
    .filter((a) => resourcesCatalog.find((r) => r.id === a.resourceId)?.type === 'space')
    .map((a) => a.resourceId);

  const parentBlocks = attachedSpaceIds.map((spaceId) => {
    const attachment = attachmentByResourceId.get(spaceId);
    const resource = resourcesCatalog.find((r) => r.id === spaceId);
    const children = attachments.filter((a) => {
      const r = resourcesCatalog.find((c) => c.id === a.resourceId);
      return r?.type === 'equipment' && r.parentId === spaceId;
    });
    return { attachment, resource, children };
  });

  const standalone = attachments.filter((a) => {
    const r = resourcesCatalog.find((c) => c.id === a.resourceId);
    if (!r || r.type === 'space') return false;
    if (r.parentId && attachmentByResourceId.has(r.parentId)) return false;
    return true;
  });

  const updateOne = (resourceId, patch) => {
    updateDraft({
      resources: attachments.map((a) => (a.resourceId === resourceId ? { ...a, ...patch } : a)),
    });
  };

  const detach = (resourceId) => {
    const target = resourcesCatalog.find((r) => r.id === resourceId);
    let next = attachments.filter((a) => a.resourceId !== resourceId);
    if (target?.type === 'space') {
      next = next.filter((a) => {
        const r = resourcesCatalog.find((c) => c.id === a.resourceId);
        return !(r?.type === 'equipment' && r.parentId === target.id);
      });
    }
    if (target?.type === 'equipment' && target.parentId) {
      const stillLinked = next.some((a) => {
        const r = resourcesCatalog.find((c) => c.id === a.resourceId);
        return r?.parentId === target.parentId;
      });
      if (!stillLinked) {
        next = next.filter((a) => !(a.resourceId === target.parentId && a.autoIncluded));
      }
    }
    updateDraft({ resources: next });
  };

  const editing = attachments.find((a) => a.resourceId === editingId);
  const editingResource = editing && resourcesCatalog.find((r) => r.id === editing.resourceId);

  if (attachments.length === 0) {
    return (
      <>
        <ScreenHeader title="Resources" onBack={() => navigate(basePath)} rightAction={<HelpTrigger helpKey="resources" />} />
        <div className="flex-1 overflow-y-auto px-5 pt-4 pb-6">
          <div className="flex flex-col items-center text-center pt-10">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <Box size={24} className="text-gray-400" strokeWidth={1.5} />
            </div>
            <div className="text-[18px] font-semibold text-gray-900 mb-1">No resources attached</div>
            <div className="text-[14px] text-gray-500 leading-snug max-w-[280px]">
              Decide what this service needs — a room to happen in, a piece of equipment to run, or both.
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => navigate(`${basePath}/resources/add-room`)}
                className="h-11 px-5 rounded-full bg-gray-900 text-white text-[14px] font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
              >
                <DoorOpen size={14} strokeWidth={2} />
                Add room
              </button>
              <button
                onClick={() => navigate(`${basePath}/resources/add-equipment`)}
                className="h-11 px-5 rounded-full bg-gray-100 text-gray-900 text-[14px] font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                <Wrench size={14} strokeWidth={2} />
                Add equipment
              </button>
            </div>
            <button
              onClick={() => navigate('/resources')}
              className="mt-4 text-[13px] text-gray-500 hover:text-gray-900 transition-colors"
            >
              Manage your resources library
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <ScreenHeader title="Resources" onBack={() => navigate(basePath)} rightAction={<HelpTrigger helpKey="resources" />} />
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-6 space-y-5">
        <div className="bg-gray-50 rounded-xl px-4 py-3 flex gap-2">
          <Info size={14} className="text-gray-500 shrink-0 mt-0.5" strokeWidth={2} />
          <div className="text-[12px] text-gray-600 leading-snug">
            Each attachment reserves the resource for the booking plus any buffer time. Tap a row to customise.
          </div>
        </div>

        {parentBlocks.length > 0 && (
          <div className="space-y-4">
            {parentBlocks.map(({ attachment, resource, children }) => {
              const viaNames = attachment.autoIncluded ? viaNamesFor(resource.id) : [];
              return (
                <div key={resource.id} className="bg-white border border-gray-100 rounded-2xl py-1">
                  <AttachmentRow
                    attachment={attachment}
                    resource={resource}
                    viaNames={viaNames}
                    onOpen={() => setEditingId(resource.id)}
                    onRemove={() => detach(resource.id)}
                  />
                  {children.length > 0 && (
                    <div className="border-t border-gray-50 mt-1 pt-1">
                      {children.map((childAttachment) => {
                        const childResource = resourcesCatalog.find((r) => r.id === childAttachment.resourceId);
                        if (!childResource) return null;
                        return (
                          <AttachmentRow
                            key={childAttachment.resourceId}
                            attachment={childAttachment}
                            resource={childResource}
                            nested
                            onOpen={() => setEditingId(childResource.id)}
                            onRemove={() => detach(childResource.id)}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {standalone.length > 0 && (
          <div>
            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-2 px-1">
              Standalone equipment
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl py-1">
              {standalone.map((a, i) => {
                const r = resourcesCatalog.find((c) => c.id === a.resourceId);
                if (!r) return null;
                return (
                  <div key={a.resourceId} className={i > 0 ? 'border-t border-gray-50' : ''}>
                    <AttachmentRow
                      attachment={a}
                      resource={r}
                      onOpen={() => setEditingId(a.resourceId)}
                      onRemove={() => detach(a.resourceId)}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="px-5 pb-5 pt-3 shrink-0 bg-white border-t border-gray-100 flex gap-2">
        <button
          onClick={() => navigate(`${basePath}/resources/add-room`)}
          className="flex-1 h-12 rounded-full bg-gray-900 hover:bg-gray-800 text-white text-[14px] font-medium flex items-center justify-center gap-1.5 transition-colors"
        >
          <Plus size={14} strokeWidth={2} />
          Add room
        </button>
        <button
          onClick={() => navigate(`${basePath}/resources/add-equipment`)}
          className="flex-1 h-12 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-900 text-[14px] font-medium flex items-center justify-center gap-1.5 transition-colors"
        >
          <Plus size={14} strokeWidth={2} />
          Add equipment
        </button>
      </div>

      <AttachmentSheet
        open={!!editingId}
        resourceName={editingResource?.name}
        attachment={editing}
        onClose={() => setEditingId(null)}
        onSave={(patch) => updateOne(editingId, patch)}
      />
    </>
  );
}
