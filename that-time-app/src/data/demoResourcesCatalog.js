// Business-wide resources library. Services attach FROM here.
// locationIds: [] means "available at all locations". Otherwise a subset.
// parentId: only on equipment — the space that equipment lives in.

export const resourcesCatalog = [
  // Spaces
  { id: 'sp1', type: 'space', name: 'Treatment room A', capacity: 1, locationIds: ['loc1'] },
  { id: 'sp2', type: 'space', name: 'Treatment room B', capacity: 1, locationIds: ['loc1', 'loc2'] },
  { id: 'sp3', type: 'space', name: 'VIP suite', capacity: 1, locationIds: ['loc1'] },
  { id: 'sp4', type: 'space', name: 'Tanning studio', capacity: 2, locationIds: [] },

  // Standalone equipment
  { id: 'eq1', type: 'equipment', name: 'Wash basin', locationIds: [] },
  { id: 'eq2', type: 'equipment', name: 'UV lamp', locationIds: [] },
  { id: 'eq3', type: 'equipment', name: 'Steamer', locationIds: [] },

  // Equipment with a parent space
  { id: 'eq4', type: 'equipment', name: 'Tanning bed 1', parentId: 'sp4', locationIds: [] },
  { id: 'eq5', type: 'equipment', name: 'Tanning bed 2', parentId: 'sp4', locationIds: [] },
  { id: 'eq6', type: 'equipment', name: 'Laser machine', parentId: 'sp1', locationIds: ['loc1'] },
];

export const resourceTypeMeta = {
  space: { label: 'Space', plural: 'Spaces' },
  equipment: { label: 'Equipment', plural: 'Equipment' },
};

// Given the user's explicit selections and previous attachments, build the
// full attachments list (user picks + auto-included parent spaces for
// child equipment that wasn't explicitly paired with its parent).
export function resolveAttachments(userPickedIds, prevAttachments) {
  const picked = new Set(userPickedIds);
  const prevNotes = Object.fromEntries(
    (prevAttachments || []).map((a) => [a.resourceId, a.note || ''])
  );
  const autoParents = new Set();
  for (const id of picked) {
    const r = resourcesCatalog.find((c) => c.id === id);
    if (r?.type === 'equipment' && r.parentId && !picked.has(r.parentId)) {
      autoParents.add(r.parentId);
    }
  }
  const explicit = Array.from(picked).map((id) => ({
    resourceId: id,
    note: prevNotes[id] || '',
    autoIncluded: false,
  }));
  const autos = Array.from(autoParents).map((id) => ({
    resourceId: id,
    note: prevNotes[id] || '',
    autoIncluded: true,
  }));
  return [...explicit, ...autos];
}
