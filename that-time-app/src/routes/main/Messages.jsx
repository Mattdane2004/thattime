import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Building2 } from 'lucide-react';
import MainHeader from '../../components/MainHeader';
import MainTabBar from '../../components/MainTabBar';
import { conversationList } from '../../data/conversations';

function Avatar({ convo }) {
  if (convo.group) {
    // Stacked initials for group threads.
    const [a, b, c] = convo.initials;
    return (
      <div className="relative w-12 h-12 shrink-0">
        <span className="absolute top-0 right-0 w-7 h-7 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[8px] font-semibold text-gray-500">
          {a}
        </span>
        <span className="absolute left-0 top-3 w-7 h-7 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[8px] font-semibold text-gray-500">
          {b}
        </span>
        <span className="absolute bottom-0 right-1 w-7 h-7 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[8px] font-semibold text-gray-500">
          {c}
        </span>
      </div>
    );
  }
  if (convo.business) {
    return (
      <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
        <Building2 size={20} className="text-gray-500" strokeWidth={1.5} />
      </div>
    );
  }
  return (
    <div className="relative w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-[13px] font-semibold text-gray-500 shrink-0">
      {convo.initials}
      {convo.unread && (
        <span className="absolute top-0 left-0 w-2.5 h-2.5 rounded-full bg-gray-900 border-2 border-white" />
      )}
    </div>
  );
}

const TABS = [
  { key: 'clients', label: 'Clients' },
  { key: 'internal', label: 'Team & Business' },
];

export default function Messages() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('clients');
  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState('');

  const inTab = conversationList.filter((c) =>
    tab === 'internal' ? c.group || c.business : !c.group && !c.business,
  );

  const visible = inTab.filter((c) => {
    if (query && !c.name.toLowerCase().includes(query.trim().toLowerCase())) return false;
    if (filter.startsWith('Unread')) return Boolean(c.unread);
    return true;
  });

  return (
    <>
      <MainHeader title="Messages" />

      <div className="shrink-0 bg-white px-4 pb-3">
        {/* Client-facing vs internal threads */}
        <div className="bg-gray-100 rounded-full p-1 flex mb-3">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => {
                setTab(t.key);
                setFilter('All');
              }}
              className={
                'flex-1 py-2 rounded-full text-[13px] font-medium transition-colors ' +
                (tab === t.key
                  ? 'bg-white text-gray-900 shadow-sm font-semibold'
                  : 'text-gray-500')
              }
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 bg-gray-50 rounded-full px-4 h-12">
          <Search size={16} className="text-gray-400 shrink-0" strokeWidth={1.75} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search conversations…"
            className="flex-1 bg-transparent text-[13px] text-gray-900 placeholder-gray-400 outline-none min-w-0"
          />
        </div>
        <div className="flex items-center gap-2 mt-3">
          {['All', 'Unread'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={
                'rounded-full px-3.5 py-2 text-[12px] font-medium transition-colors ' +
                (filter === f ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500')
              }
            >
              {f === 'Unread' ? `Unread ${inTab.filter((c) => c.unread).length}` : f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-white px-4 pb-6">
        {visible.map((convo, i) => (
          <button
            key={convo.id}
            onClick={() => navigate(`/messages/${convo.id}`)}
            className={
              'w-full flex items-center gap-3.5 py-4 text-left ' +
              (i > 0 ? 'border-t border-gray-50' : '')
            }
          >
            <Avatar convo={convo} />
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[14px] font-semibold text-gray-900 truncate">
                  {convo.name}
                </span>
                <span className="text-[11px] text-gray-400 shrink-0">{convo.time}</span>
              </div>
              <div className="flex items-center justify-between gap-2 mt-0.5">
                <span
                  className={
                    'text-[13px] truncate ' +
                    (convo.unread ? 'text-gray-900 font-medium' : 'text-gray-400')
                  }
                >
                  {convo.preview}
                </span>
                {convo.unread && (
                  <span className="shrink-0 w-5 h-5 rounded-full bg-gray-900 text-white text-[10px] font-semibold flex items-center justify-center">
                    {convo.unread}
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
        {visible.length === 0 && (
          <div className="text-center text-[13px] text-gray-400 pt-12">No conversations</div>
        )}
      </div>

      <MainTabBar />
    </>
  );
}
