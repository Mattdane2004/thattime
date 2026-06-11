import { useMemo, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Bell, Mail, MessageSquare, Plus, Send } from 'lucide-react';
import ScreenHeader from '../../components/ScreenHeader';
import Toggle from '../../components/Toggle';
import {
  enabledChannels,
  scopeLabel,
  triggerLabel,
} from '../../data/demoNotifications';

const FILTERS = ['All', 'On', 'Off'];

const channelIcons = {
  sms: MessageSquare,
  email: Mail,
  push: Bell,
  whatsapp: Send,
};

export default function NotificationsList() {
  const navigate = useNavigate();
  const { notifications, updateNotification } = useOutletContext();
  const [filter, setFilter] = useState('All');

  const visible = useMemo(() => {
    return notifications.filter((notification) => {
      if (filter === 'On') return notification.status === 'on';
      if (filter === 'Off') return notification.status === 'off';
      if (filter === 'Defaults') return notification.type === 'default';
      if (filter === 'Custom') return notification.type === 'custom';
      return true;
    });
  }, [filter, notifications]);

  return (
    <>
      <ScreenHeader title="Notifications" onBack={() => navigate('/hub')} />
      <div className="flex-1 overflow-y-auto bg-gray-50 px-5 pt-2 pb-6">
        <div className="pb-5">
          <div className="text-[28px] leading-tight font-semibold tracking-tight text-gray-900">
            Client notifications
          </div>
          <div className="text-[14px] text-gray-500 mt-1 leading-snug">
            Booking messages sent to clients.
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-4 -mx-5 px-5">
          {FILTERS.map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={
                'h-9 px-4 rounded-full text-[13px] font-medium shrink-0 transition-colors ' +
                (filter === item ? 'bg-gray-900 text-white' : 'bg-white border border-gray-100 text-gray-600')
              }
            >
              {item}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {visible.map((notification) => (
            <div
              key={notification.id}
              onClick={() => navigate(`/notifications/${notification.id}`)}
              role="button"
              tabIndex={0}
              className="w-full bg-white border border-gray-100 rounded-2xl px-4 py-3 text-left hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="text-[15px] font-semibold text-gray-900 truncate">
                      {notification.name}
                    </div>
                    {notification.type === 'default' && (
                      <span className="text-[10px] uppercase tracking-wide text-gray-300 shrink-0">Default</span>
                    )}
                  </div>
                  <div className="text-[12px] text-gray-500 mt-1 truncate">
                    {triggerLabel(notification.trigger)} · {scopeLabel(notification.scope)}
                  </div>

                  <div className="flex items-center gap-1.5 mt-2">
                    {enabledChannels(notification).map((channel) => {
                      const Icon = channelIcons[channel.key];
                      return (
                        <div
                          key={channel.key}
                          className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center text-gray-500"
                          title={channel.label}
                        >
                          <Icon size={12} strokeWidth={1.8} />
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div onClick={(event) => event.stopPropagation()} className="shrink-0">
                  <Toggle
                    checked={notification.status === 'on'}
                    onChange={(checked) =>
                      updateNotification(notification.id, { status: checked ? 'on' : 'off' })
                    }
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 pb-5 pt-3 shrink-0 bg-white border-t border-gray-100">
        <button
          onClick={() => navigate('/notifications/new')}
          className="w-full h-12 rounded-full bg-gray-900 hover:bg-gray-800 text-white text-[15px] font-medium flex items-center justify-center gap-2 transition-colors"
        >
          <Plus size={16} strokeWidth={2} />
          Create notification
        </button>
      </div>
    </>
  );
}
