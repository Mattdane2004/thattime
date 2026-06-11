import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { House, Calendar, Users, MessageSquare, Plus, X } from 'lucide-react';
import QuickActionsSheet from './QuickActionsSheet';

// Bottom tab bar shared by the main screens — Figma "Navigation" section.
// The Add tab opens the Quick Actions sheet instead of navigating.
const TABS = [
  { key: 'home', label: 'Home', icon: House, to: '/' },
  { key: 'schedule', label: 'Schedule', icon: Calendar, to: '/schedule' },
  { key: 'clients', label: 'Clients', icon: Users, to: '/clients' },
  { key: 'messages', label: 'Message', icon: MessageSquare, to: '/messages' },
];

export default function MainTabBar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [actionsOpen, setActionsOpen] = useState(false);

  const isActive = (to) => (to === '/' ? pathname === '/' : pathname.startsWith(to));

  return (
    <>
      <QuickActionsSheet open={actionsOpen} onClose={() => setActionsOpen(false)} />
      <div className="shrink-0 bg-white border-t border-gray-100 px-2 pt-2 pb-3 grid grid-cols-5 relative z-20">
        {TABS.map(({ key, label, icon: Icon, to }) => {
          const active = isActive(to) && !actionsOpen;
          return (
            <button
              key={key}
              onClick={() => {
                setActionsOpen(false);
                navigate(to);
              }}
              className="flex flex-col items-center gap-1 py-1"
            >
              <Icon
                size={20}
                strokeWidth={active ? 2.25 : 1.75}
                className={active ? 'text-gray-900' : 'text-gray-400'}
              />
              <span
                className={
                  'text-[11px] ' +
                  (active ? 'text-gray-900 font-semibold' : 'text-gray-400 font-medium')
                }
              >
                {label}
              </span>
            </button>
          );
        })}
        <button
          onClick={() => setActionsOpen((v) => !v)}
          className="flex flex-col items-center gap-1 py-1"
          aria-label="Quick actions"
        >
          {actionsOpen ? (
            <X size={20} strokeWidth={2.25} className="text-gray-900" />
          ) : (
            <Plus size={20} strokeWidth={1.75} className="text-gray-400" />
          )}
          <span
            className={
              'text-[11px] ' +
              (actionsOpen ? 'text-gray-900 font-semibold' : 'text-gray-400 font-medium')
            }
          >
            {actionsOpen ? 'Actions' : 'Add'}
          </span>
        </button>
      </div>
    </>
  );
}
