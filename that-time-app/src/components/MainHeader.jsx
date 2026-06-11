import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Crown, User, LayoutGrid, Check, ChevronRight } from 'lucide-react';
import { useMainActions } from './sheets/MainActionsContext';

// Header shared by the main screens — title + date on the left, notification
// bell (→ activity feed) and avatar (→ role switcher + Hub) on the right.
export default function MainHeader({ title, date = 'Wednesday 4 March' }) {
  const navigate = useNavigate();
  const { role, setRole, showToast } = useMainActions();
  const [menuOpen, setMenuOpen] = useState(false);

  const pickRole = (next) => {
    if (next !== role) {
      setRole(next);
      showToast(next === 'owner' ? 'Switched to Owner view' : 'Switched to Staff view');
    }
    setMenuOpen(false);
  };

  return (
    <>
      <div className="shrink-0 bg-white flex items-start justify-between px-4 pt-4 pb-3">
        <div>
          <div className="text-[17px] font-bold text-gray-900 leading-tight">{title}</div>
          <div className="text-[12px] text-gray-400 mt-0.5">{date}</div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/alerts')}
            className="relative w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100"
            aria-label="Notifications"
          >
            <Bell size={20} strokeWidth={1.75} className="text-gray-700" />
            <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-red-500 border border-white" />
          </button>
          <button
            onClick={() => setMenuOpen(true)}
            className="relative w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-[13px] font-semibold text-gray-500"
            aria-label="Account menu"
          >
            SJ
            {role === 'staff' && (
              <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-gray-900 border-2 border-white flex items-center justify-center">
                <User size={8} className="text-white" strokeWidth={2.5} />
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Account / role switcher */}
      {menuOpen && (
        <div className="absolute inset-0 z-40">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMenuOpen(false)} />
          <div className="absolute left-0 right-0 bottom-0 bg-white rounded-t-3xl px-5 pt-5 pb-6">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
              <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center text-[13px] font-semibold text-gray-500">
                SJ
              </div>
              <div>
                <div className="text-[15px] font-bold text-gray-900">Emma Stevens</div>
                <div className="text-[12px] text-gray-400">
                  Salon Soho · {role === 'owner' ? 'Owner' : 'Staff'}
                </div>
              </div>
            </div>

            <div className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase mt-4 mb-2">
              Viewing as
            </div>
            {[
              { key: 'owner', icon: Crown, label: 'Owner view', desc: 'Full business operations' },
              { key: 'staff', icon: User, label: 'Staff view', desc: 'Your day, bookings and shifts' },
            ].map(({ key, icon: Icon, label, desc }) => (
              <button
                key={key}
                onClick={() => pickRole(key)}
                className={
                  'w-full flex items-center gap-3 rounded-2xl px-3.5 py-3 mb-2 border text-left transition-colors ' +
                  (role === key ? 'border-gray-900 border-[1.5px]' : 'border-gray-100 hover:bg-gray-50')
                }
              >
                <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                  <Icon size={16} className="text-gray-900" strokeWidth={1.75} />
                </div>
                <div className="flex-1">
                  <div className="text-[14px] font-medium text-gray-900">{label}</div>
                  <div className="text-[12px] text-gray-400">{desc}</div>
                </div>
                {role === key && <Check size={16} className="text-gray-900" />}
              </button>
            ))}

            <button
              onClick={() => {
                setMenuOpen(false);
                navigate('/hub');
              }}
              className="w-full flex items-center gap-3 rounded-2xl px-3.5 py-3 mt-2 bg-gray-50 text-left hover:bg-gray-100 transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-white border border-gray-100 flex items-center justify-center shrink-0">
                <LayoutGrid size={16} className="text-gray-900" strokeWidth={1.75} />
              </div>
              <div className="flex-1">
                <div className="text-[14px] font-medium text-gray-900">Open Hub</div>
                <div className="text-[12px] text-gray-400">
                  {role === 'owner' ? 'Manage your business' : 'Your profile and settings'}
                </div>
              </div>
              <ChevronRight size={16} className="text-gray-300" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
