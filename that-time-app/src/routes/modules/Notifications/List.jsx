import { useMemo } from 'react';
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import { Bell, Copy, Mail, MessageSquare, Plus, Send, Smartphone } from 'lucide-react';
import ScreenHeader from '../../../components/ScreenHeader';
import Toggle from '../../../components/Toggle';
import { demoServices } from '../../../data/demoServices';
import {
  appliesToService,
  duplicateForService,
  enabledChannels,
  isMutedForService,
  scopeLabel,
  timingLabel,
  triggerLabel,
} from '../../../data/demoNotifications';
import { offerBasePath } from '../../routeBase';

const channelIcons = {
  sms: MessageSquare,
  email: Mail,
  push: Smartphone,
  whatsapp: Send,
};

export default function ServiceNotificationsList() {
  const navigate = useNavigate();
  const location = useLocation();
  const { draft, notifications, setNotifications, updateNotification } = useOutletContext();
  const service = demoServices.find((item) => item.id === draft.id) || draft;
  const basePath = offerBasePath(draft, location);
  const offerLabel = basePath === '/class' ? 'course' : basePath === '/subscription' ? 'membership' : basePath === '/bundle' ? 'bundle' : 'service';
  const originQuery = basePath === '/class' ? '&origin=class' : '';

  const applicable = useMemo(
    () => notifications.filter((notification) => appliesToService(notification, service)),
    [notifications, service]
  );

  const activeCount = applicable.filter(
    (notification) => notification.status === 'on' && !isMutedForService(notification, service.id)
  ).length;

  const toggleForService = (notification, checked) => {
    if (notification.scope?.type === 'service_only') {
      updateNotification(notification.id, { status: checked ? 'on' : 'off' });
      return;
    }

    const without = (notification.serviceOverrides || []).filter((item) => item.serviceId !== service.id);
    updateNotification(notification.id, {
      serviceOverrides: checked ? without : [...without, { serviceId: service.id, muted: true }],
    });
  };

  const customize = (notification) => {
    const copy = duplicateForService(notification, service);
    setNotifications((items) => [copy, ...items]);
    navigate(`/notifications/${copy.id}?serviceId=${service.id}${originQuery}`);
  };

  return (
    <>
      <ScreenHeader title="Notifications" onBack={() => navigate(basePath)} />
      <div className="flex-1 overflow-y-auto bg-gray-50 px-5 pt-2 pb-8">
        <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
              <Bell size={18} className="text-gray-800" strokeWidth={1.75} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[16px] font-semibold text-gray-900">{service.name || 'This service'}</div>
              <div className="text-[13px] text-gray-500 mt-1 leading-snug">
                {activeCount} active client notification{activeCount === 1 ? '' : 's'} apply through defaults,
                category rules, or {offerLabel}-only rules.
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {applicable.map((notification) => {
            const muted = isMutedForService(notification, service.id);
            const checked = notification.status === 'on' && !muted;
            return (
              <div key={notification.id} className="bg-white border border-gray-100 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                    <Bell size={17} className="text-gray-700" strokeWidth={1.75} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2">
                      <button
                        onClick={() => navigate(`/notifications/${notification.id}?serviceId=${service.id}${originQuery}`)}
                        className="flex-1 min-w-0 text-left"
                      >
                        <div className="text-[15px] font-semibold text-gray-900 truncate">
                          {notification.name}
                        </div>
                        <div className="text-[12px] text-gray-500 mt-0.5 truncate">
                          {triggerLabel(notification.trigger)} · {timingLabel(notification)}
                        </div>
                      </button>
                      <Toggle checked={checked} onChange={(next) => toggleForService(notification, next)} />
                    </div>

                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      <span className="px-2 py-1 rounded-full bg-gray-100 text-[11px] font-medium text-gray-600">
                        {notification.type === 'default' ? 'Default' : 'Custom'}
                      </span>
                      <span className="px-2 py-1 rounded-full bg-gray-100 text-[11px] font-medium text-gray-600">
                        {scopeLabel(notification.scope)}
                      </span>
                      {muted && (
                        <span className="px-2 py-1 rounded-full bg-red-50 text-[11px] font-medium text-red-500">
                          Off for this service
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-3">
                      {enabledChannels(notification).map((channel) => {
                        const Icon = channelIcons[channel.key];
                        return (
                          <div
                            key={channel.key}
                            className="flex items-center gap-1.5 px-2 py-1 rounded-full border border-gray-100 text-[11px] text-gray-600"
                          >
                            <Icon size={12} strokeWidth={1.75} />
                            {channel.label}
                          </div>
                        );
                      })}
                    </div>

                    {notification.scope?.type !== 'service_only' && (
                      <button
                        onClick={() => customize(notification)}
                        className="mt-4 h-9 px-3 rounded-full bg-gray-50 text-[13px] font-medium text-gray-700 flex items-center gap-2"
                      >
                        <Copy size={14} strokeWidth={1.75} />
                        Customize for this service
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {applicable.length > 1 && (
          <div className="text-[12px] text-gray-500 leading-snug mt-4 px-1">
            More than one notification can use the same trigger. All matching active notifications are shown here.
          </div>
        )}
      </div>

      <div className="px-5 pb-5 pt-3 shrink-0 bg-white border-t border-gray-100 space-y-2">
        <button
          onClick={() => navigate(`/notifications/new?serviceId=${service.id}${originQuery}`)}
          className="w-full h-12 rounded-full bg-gray-900 hover:bg-gray-800 text-white text-[15px] font-medium flex items-center justify-center gap-2 transition-colors"
        >
          <Plus size={16} strokeWidth={2} />
          Create {offerLabel} notification
        </button>
        <button
          onClick={() => navigate('/notifications')}
          className="w-full h-11 rounded-full border border-gray-200 text-[14px] font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Manage all notifications
        </button>
      </div>
    </>
  );
}
