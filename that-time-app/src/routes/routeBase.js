export function offerBasePath(draft = {}, location = {}) {
  const root = (location.pathname || '').split('/')[1];
  if (['class', 'bundle', 'subscription'].includes(root)) return `/${root}`;
  if (draft.type === 'class') return '/class';
  if (draft.type === 'bundle') return '/bundle';
  if (draft.type === 'subscription') return '/subscription';
  return '/service';
}
