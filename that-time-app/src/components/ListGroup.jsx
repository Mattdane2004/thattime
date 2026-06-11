import { useState } from 'react';

export default function ListGroup({ title, items, renderItem, initialVisible = 3 }) {
  const [expanded, setExpanded] = useState(false);
  const total = items.length;
  const visible = expanded ? items : items.slice(0, initialVisible);
  const hiddenCount = total - visible.length;

  return (
    <div className="pb-4">
      <div className="flex items-baseline justify-between px-5 pb-2">
        <div className="text-[15px] font-semibold text-gray-900">{title}</div>
        <div className="text-[12px] text-gray-400">{total}</div>
      </div>
      <div className="px-2">{visible.map(renderItem)}</div>
      {hiddenCount > 0 && (
        <button
          onClick={() => setExpanded(true)}
          className="ml-5 mt-1 text-[13px] text-gray-900 font-medium underline underline-offset-2"
        >
          Show {hiddenCount} more
        </button>
      )}
    </div>
  );
}
