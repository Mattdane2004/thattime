import { createElement, useMemo, useState } from 'react';
import { useNavigate, useOutletContext, useParams, useSearchParams } from 'react-router-dom';
import {
  Bell,
  Check,
  Clock3,
  Globe,
  Mail,
  MessageCircle,
  MessageSquare,
  Search,
  Send,
  SlidersHorizontal,
  Sparkles,
  Store,
  Smartphone,
  Zap,
} from 'lucide-react';
import BottomSheet from '../../components/BottomSheet';
import ProductSelect from '../../components/ProductSelect';
import ScreenHeader from '../../components/ScreenHeader';
import Toggle from '../../components/Toggle';
import { categories } from '../../data/categories';
import { demoServices } from '../../data/demoServices';
import {
  CHANNELS,
  NOTIFICATION_TRIGGERS,
  createBlankNotification,
  enabledChannels,
  renderTemplate,
  scopeLabel,
  triggerLabel,
} from '../../data/demoNotifications';

const VARIABLES = [
  'client_name',
  'service_name',
  'appointment_date',
  'appointment_time',
  'staff_member',
  'location',
  'form_link',
  'reschedule_link',
  'cancellation_link',
];

const channelMeta = {
  email: { label: 'Email', icon: Mail, cost: 'Free of charge', group: 'Send an email' },
  whatsapp: { label: 'WhatsApp', icon: MessageCircle, cost: '£0.05 per message', group: 'Send a message' },
  sms: { label: 'Text message', icon: MessageSquare, cost: '£0.05 per text', group: 'Send a message' },
  push: { label: 'Push notification', icon: Smartphone, cost: 'Free of charge', group: 'Send a push' },
};

const LIMITS = {
  sms: { body: 160 },
  whatsapp: { body: 1024 },
  push: { title: 50, body: 120 },
  email: { subject: 78, body: 2000 },
};

const variableLabels = {
  client_name: 'Client name',
  service_name: 'Service name',
  appointment_date: 'Appointment date',
  appointment_time: 'Appointment time',
  staff_member: 'Staff member',
  location: 'Location',
  form_link: 'Form link',
  reschedule_link: 'Reschedule link',
  cancellation_link: 'Cancellation link',
};

export default function NotificationEditor() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { notifications, setNotifications, draft: currentOffer } = useOutletContext();
  const serviceId = searchParams.get('serviceId');
  const origin = searchParams.get('origin');
  const service =
    demoServices.find((item) => item.id === serviceId) ||
    (serviceId && currentOffer?.id === serviceId ? currentOffer : null);
  const returnPath = origin === 'class'
    ? '/class/notifications'
    : serviceId
      ? '/service/notifications'
      : '/notifications';
  const existing = notifications.find((item) => item.id === id);
  const isNew = id === 'new' || !id;

  const initial = useMemo(() => existing || createBlankNotification(service), [existing, service]);
  const [draft, setDraft] = useState(initial);
  const [sheet, setSheet] = useState(null);
  const [tested, setTested] = useState(false);

  const updateDraft = (patch) => setDraft((current) => ({ ...current, ...patch }));
  const updateScope = (patch) => updateDraft({ scope: { ...draft.scope, ...patch } });
  const updateChannel = (key, patch) =>
    updateDraft({
      channels: {
        ...draft.channels,
        [key]: { ...draft.channels[key], ...patch },
      },
    });

  const save = () => {
    const saved = { ...draft, updatedAt: 'Just now' };
    if (isNew || !existing) {
      setNotifications((items) => [saved, ...items]);
    } else {
      setNotifications((items) => items.map((item) => (item.id === saved.id ? saved : item)));
    }
    navigate(returnPath);
  };

  const cancel = () => navigate(returnPath);
  const hasChannel = enabledChannels(draft).length > 0;

  return (
    <>
      <ScreenHeader title="" onBack={cancel} />
      <div className="flex-1 overflow-y-auto bg-white px-5 pt-1 pb-8">
        <div className="pb-5">
          <label className="block">
            <div className="text-[12px] font-medium text-gray-400 uppercase tracking-wider mb-2">Name</div>
            <textarea
              value={draft.name}
              onChange={(event) => updateDraft({ name: event.target.value })}
              rows={2}
              className="w-full min-h-[68px] rounded-2xl border border-gray-200 bg-white px-4 py-3 text-[24px] leading-tight font-semibold text-gray-950 outline-none resize-none overflow-hidden placeholder:text-gray-300"
              placeholder="Notification name"
            />
          </label>
          <div className="mt-4 flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3">
            <div>
              <div className="text-[13px] font-medium text-gray-900">Notification is active</div>
              <div className="text-[12px] text-gray-500 mt-0.5">{scopeLabel(draft.scope)}</div>
            </div>
            <Toggle
              checked={draft.status === 'on'}
              onChange={(checked) => updateDraft({ status: checked ? 'on' : 'off' })}
            />
          </div>
        </div>

        <ConnectedFlow
          draft={draft}
          setSheet={setSheet}
          updateChannel={updateChannel}
        />

        {!hasChannel && (
          <div className="mt-4 text-[12px] text-red-500">Enable at least one channel before saving.</div>
        )}
      </div>

      <div className="px-5 pb-5 pt-3 shrink-0 flex gap-2 bg-white border-t border-gray-100">
        <button
          onClick={() => setSheet('preview')}
          className="flex-1 h-12 rounded-full border border-gray-200 text-[15px] font-medium hover:bg-gray-50 transition-colors"
        >
          Preview
        </button>
        <button
          onClick={save}
          disabled={!draft.name || !hasChannel}
          className="flex-1 h-12 rounded-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 text-white text-[15px] font-medium transition-colors"
        >
          Save
        </button>
      </div>

      <TriggerSheet
        open={sheet === 'trigger'}
        draft={draft}
          updateDraft={updateDraft}
          onClose={() => setSheet(null)}
        />
      <TimingSheet
        open={sheet === 'timing'}
        draft={draft}
        updateDraft={updateDraft}
        onClose={() => setSheet(null)}
      />
      <ScopeSheet
        open={sheet === 'scope'}
        draft={draft}
        updateScope={updateScope}
        service={service}
        onClose={() => setSheet(null)}
      />
      <MessageSheet
        open={sheet === 'message'}
        draft={draft}
        updateDraft={updateDraft}
        onClose={() => setSheet(null)}
      />
      <ChannelsSheet
        open={sheet === 'channels'}
        draft={draft}
        updateChannel={updateChannel}
        onEditChannel={(key) => setSheet(`channel:${key}`)}
        onClose={() => setSheet(null)}
      />
      {CHANNELS.map((channel) => (
        <ChannelSheet
          key={channel.key}
          open={sheet === `channel:${channel.key}`}
          channelKey={channel.key}
          draft={draft}
          updateChannel={updateChannel}
          onClose={() => setSheet(null)}
        />
      ))}
      <PreviewSheet
        open={sheet === 'preview'}
        draft={draft}
        tested={tested}
        onTest={() => setTested(true)}
        onClose={() => setSheet(null)}
      />
    </>
  );
}

function ConnectedFlow({ draft, setSheet, updateChannel }) {
  const channels = enabledChannels(draft);
  const channelSummary = channels.length
    ? channels.map((channel) => channel.label).join(', ')
    : 'No channels enabled';

  return (
    <div>
      <FlowSection
        icon={Zap}
        title="Trigger"
        subtitle={triggerLabel(draft.trigger)}
        onClick={() => setSheet('trigger')}
      />

      <FlowSection
        icon={Clock3}
        title="Timing"
        subtitle={timingDescription(draft)}
        onClick={() => setSheet('timing')}
      />

      <FlowSection
        icon={Bell}
        title="Applies to"
        subtitle={selectionSummary(draft.scope)}
        onClick={() => setSheet('scope')}
      />

      <FlowSection
        icon={Send}
        title="Channels"
        subtitle={channelSummary}
        onClick={() => setSheet('channels')}
      >
        <div className="grid grid-cols-2 gap-2 mt-4">
          {CHANNELS.map((channel) => (
            <MiniChannel
              key={channel.key}
              channelKey={channel.key}
              draft={draft}
              updateChannel={updateChannel}
              onEdit={() => setSheet(`channel:${channel.key}`)}
            />
          ))}
        </div>
      </FlowSection>

      <FlowSection
        icon={Sparkles}
        title="Message"
        subtitle=""
        onClick={() => setSheet('message')}
        last
      >
        <div className="mt-3 rounded-xl bg-gray-50 p-3">
          <TokenMessage template={draft.baseMessage} />
        </div>
      </FlowSection>
    </div>
  );
}

function FlowSection({ icon, title, subtitle, onClick, children, last = false }) {
  return (
    <>
      <div
        onClick={onClick}
        role="button"
        tabIndex={0}
          className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
            {createElement(icon, { size: 15, className: 'text-gray-700', strokeWidth: 1.8 })}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[16px] font-semibold text-gray-950">{title}</div>
                <div className="text-[13px] text-gray-500 mt-1 leading-snug line-clamp-2">{subtitle}</div>
              </div>
              <div className="h-8 px-3 rounded-full bg-gray-50 flex items-center text-[12px] font-medium text-gray-700 shrink-0">
                Edit
              </div>
            </div>
            {children}
          </div>
        </div>
      </div>
      {!last && (
        <div className="flex justify-center py-2">
          <div className="w-px h-5 bg-gray-200" />
        </div>
      )}
    </>
  );
}

function MiniChannel({ channelKey, draft, updateChannel, onEdit }) {
  const meta = channelMeta[channelKey];
  const Icon = meta.icon;
  const active = draft.channels[channelKey].enabled;

  return (
    <div className="rounded-xl bg-gray-50 p-2.5">
      <button onClick={(event) => {
        event.stopPropagation();
        onEdit();
      }} className="w-full text-left">
        <div className="flex items-center gap-2">
          <Icon
            size={14}
            className={active ? 'text-gray-800' : 'text-gray-300'}
            strokeWidth={1.75}
          />
          <div className="text-[12px] font-semibold text-gray-800 truncate">{meta.label}</div>
        </div>
      </button>
      <button
        onClick={(event) => {
          event.stopPropagation();
          updateChannel(channelKey, { enabled: !active });
        }}
        className={
          'mt-2 h-7 px-2 rounded-full text-[11px] font-medium ' +
          (active ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-white text-gray-500')
        }
      >
        {active ? 'Enabled' : 'Off'}
      </button>
    </div>
  );
}

function TriggerSheet({ open, draft, updateDraft, onClose }) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Edit trigger">
      <div className="space-y-2">
        {NOTIFICATION_TRIGGERS.map((trigger) => (
          <button
            key={trigger.key}
            onClick={() =>
              updateDraft({
                trigger: trigger.key,
                timing: defaultTimingFor(trigger.key, draft.timing),
              })
            }
            className={
              'w-full min-h-11 rounded-xl px-3 flex items-center justify-between text-left text-[14px] transition-colors ' +
              (draft.trigger === trigger.key ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-700')
            }
          >
            {trigger.label}
            {draft.trigger === trigger.key && <Check size={15} />}
          </button>
        ))}
      </div>
    </BottomSheet>
  );
}

function TimingSheet({ open, draft, updateDraft, onClose }) {
  const supportsTiming = draft.trigger === 'appointment_reminder' || draft.trigger === 'form_request';
  const timing = draft.timing || defaultTimingFor(draft.trigger);

  return (
    <BottomSheet open={open} onClose={onClose} title="Edit timing">
      {supportsTiming ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {[
              { key: 'immediate', label: 'Immediately', value: null },
              { key: 'before', label: 'Before appointment', value: { ...timing, relation: 'before' } },
              { key: 'after', label: 'After booking', value: { ...timing, relation: 'after_booking' } },
            ].map((option) => {
              const active = option.value === null ? !draft.timing : draft.timing?.relation === option.value.relation;
              return (
                <button
                  key={option.key}
                  onClick={() => updateDraft({ timing: option.value })}
                  className={
                    'min-h-11 rounded-xl px-3 text-left text-[13px] font-medium transition-colors ' +
                    (active ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-700')
                  }
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          {draft.timing && (
            <div className="flex items-center gap-2 rounded-2xl bg-gray-50 p-3">
              <Clock3 size={17} className="text-gray-500" />
              <input
                value={draft.timing?.amount || 24}
                onChange={(event) =>
                  updateDraft({
                    timing: { ...(draft.timing || timing), amount: event.target.value },
                  })
                }
                inputMode="numeric"
                className="w-16 h-10 rounded-xl bg-white px-3 text-[14px] outline-none"
              />
              <ProductSelect
                value={draft.timing?.unit || 'hours'}
                onChange={(unit) =>
                  updateDraft({
                    timing: { ...(draft.timing || timing), unit },
                  })
                }
                options={[
                  { value: 'minutes', label: 'minutes' },
                  { value: 'hours', label: 'hours' },
                  { value: 'days', label: 'days' },
                ]}
                compact
                className="w-32"
                buttonClassName="bg-white h-10 min-h-0 px-3 py-0 text-[14px]"
              />
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-2xl bg-gray-50 p-4">
          <div className="text-[14px] font-medium text-gray-900">Immediately</div>
          <div className="text-[13px] text-gray-500 mt-1">
            This trigger sends as soon as the event happens.
          </div>
        </div>
      )}
    </BottomSheet>
  );
}

function ScopeSheet({ open, draft, updateScope, service, onClose }) {
  const [query, setQuery] = useState('');
  const selectedServices = new Set(draft.scope.serviceIds || []);
  const selectedCategories = new Set(draft.scope.categoryIds || []);
  const q = query.trim().toLowerCase();
  const grouped = categories
    .map(({ name }) => ({
      category: name,
      services: demoServices.filter(
        (item) =>
          item.category === name &&
          (!q || `${item.name} ${item.category}`.toLowerCase().includes(q))
      ),
    }))
    .filter((group) => group.services.length > 0 || (!q && demoServices.some((item) => item.category === group.category)));

  const setAll = () => updateScope({ type: 'all_services', categoryIds: [], serviceIds: [] });
  const setSelection = (categoryIds, serviceIds) =>
    updateScope({ type: 'selected_services', categoryIds, serviceIds });

  const toggleCategory = (category) => {
    const nextCategories = new Set(selectedCategories);
    nextCategories.has(category) ? nextCategories.delete(category) : nextCategories.add(category);
    setSelection(Array.from(nextCategories), Array.from(selectedServices));
  };

  const toggleService = (id) => {
    const nextServices = new Set(selectedServices);
    nextServices.has(id) ? nextServices.delete(id) : nextServices.add(id);
    setSelection(Array.from(selectedCategories), Array.from(nextServices));
  };

  const allSelected = draft.scope.type === 'all_services';

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Applies to"
      footer={
        <button
          onClick={onClose}
          className="w-full h-12 rounded-full bg-gray-900 hover:bg-gray-800 text-white text-[15px] font-medium transition-colors"
        >
          Save selection
        </button>
      }
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-3">
          <Search size={16} className="text-gray-400" strokeWidth={1.75} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search services..."
            className="flex-1 text-[15px] bg-transparent placeholder:text-gray-400 outline-none"
          />
        </div>
        <button
          className="w-12 h-12 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center"
          aria-label="Filter services"
        >
          <SlidersHorizontal size={18} strokeWidth={1.75} />
        </button>
      </div>

      <button
        onClick={setAll}
        className={
          'w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-colors mb-3 ' +
          (allSelected ? 'bg-gray-900 text-white' : 'bg-gray-50 hover:bg-gray-100')
        }
      >
        <div
          className={
            'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ' +
            (allSelected ? 'bg-white/15' : 'bg-white')
          }
        >
          <Globe size={18} strokeWidth={1.75} className={allSelected ? 'text-white' : 'text-gray-700'} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[15px] font-medium">All services</div>
          <div className={'text-[12px] mt-0.5 ' + (allSelected ? 'text-white/70' : 'text-gray-500')}>
            Send for every service
          </div>
        </div>
        <Box checked={allSelected} inverted={allSelected} />
      </button>

      {service && (
        <button
          onClick={() => updateScope({ type: 'service_only', categoryIds: [], serviceIds: [service.id] })}
          className={
            'w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-colors mb-3 ' +
            (draft.scope.type === 'service_only' ? 'bg-gray-900 text-white' : 'bg-gray-50 hover:bg-gray-100')
          }
        >
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0">
            <Store size={17} strokeWidth={1.75} className="text-gray-700" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[15px] font-medium">This service only</div>
            <div className="text-[12px] mt-0.5 text-gray-500 truncate">{service.name}</div>
          </div>
          <Box checked={draft.scope.type === 'service_only'} inverted={draft.scope.type === 'service_only'} />
        </button>
      )}

      <div className="space-y-3">
        {grouped.map((group) => {
          const categoryOn = selectedCategories.has(group.category);
          return (
            <div key={group.category} className="bg-gray-50 rounded-2xl overflow-hidden">
              <button
                onClick={() => toggleCategory(group.category)}
                className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-100 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0">
                  <Store size={16} className="text-gray-700" strokeWidth={1.75} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[15px] font-medium">{group.category}</div>
                  <div className="text-[12px] text-gray-500 mt-0.5">
                    {group.services.length} service{group.services.length === 1 ? '' : 's'}
                  </div>
                </div>
                <Box checked={categoryOn} />
              </button>
              {group.services.map((item) => {
                const serviceOn = selectedServices.has(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleService(item.id)}
                    className="w-full flex items-center gap-3 px-3 py-3 text-left hover:bg-gray-100 transition-colors border-t border-white"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0">
                      <span className="text-[11px] font-semibold text-gray-500">{item.type?.[0]?.toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] text-gray-900 truncate">{item.name}</div>
                      <div className="text-[12px] text-gray-500 mt-0.5 truncate">{item.durationMin} min</div>
                    </div>
                    <Box checked={categoryOn || serviceOn} />
                  </button>
                );
              })}
            </div>
          );
        })}
        {grouped.length === 0 && (
          <div className="rounded-2xl bg-gray-50 p-4 text-[14px] text-gray-500">No services found.</div>
        )}
      </div>
    </BottomSheet>
  );
}

function MessageSheet({ open, draft, updateDraft, onClose }) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Edit base message">
      <div className="space-y-4">
        <div className="rounded-2xl bg-gray-50 p-3">
          <div className="text-[12px] font-medium text-gray-500 mb-2">Visual message</div>
          <TokenMessage template={draft.baseMessage} />
        </div>
        <textarea
          value={draft.baseMessage}
          onChange={(event) => updateDraft({ baseMessage: event.target.value })}
          rows={5}
          className="w-full rounded-2xl bg-gray-50 px-3 py-3 text-[14px] leading-snug outline-none resize-none"
          placeholder="Write the shared message..."
        />
        <ChannelImpact template={draft.baseMessage} draft={draft} />
        <div>
          <div className="text-[13px] font-medium text-gray-700 mb-2">Add variable</div>
          <div className="flex flex-wrap gap-2">
            {VARIABLES.map((variable) => (
              <button
                key={variable}
                onClick={() => updateDraft({ baseMessage: `${draft.baseMessage} {{${variable}}}` })}
                className="px-3 py-1.5 rounded-full bg-gray-50 text-[12px] text-gray-700 border border-gray-100"
              >
                {variableLabels[variable]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </BottomSheet>
  );
}

function ChannelsSheet({ open, draft, updateChannel, onEditChannel, onClose }) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Edit channels">
      <div className="space-y-3">
        {CHANNELS.map((channel) => {
          const meta = channelMeta[channel.key];
          const Icon = meta.icon;
          const active = draft.channels[channel.key].enabled;
          return (
            <div key={channel.key} className="rounded-2xl bg-gray-50 p-4">
              <div className="flex items-center gap-3">
                <div
                  className={
                    'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ' +
                    (active ? 'bg-gray-900' : 'bg-white')
                  }
                >
                  <Icon
                    size={18}
                    className={active ? 'text-white' : 'text-gray-300'}
                    strokeWidth={1.75}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-semibold text-gray-900">{meta.label}</div>
                  <div className="text-[12px] text-gray-500 mt-0.5">{meta.cost}</div>
                </div>
                <Toggle
                  checked={active}
                  onChange={(checked) => updateChannel(channel.key, { enabled: checked })}
                />
              </div>
              <button
                onClick={() => onEditChannel(channel.key)}
                className="mt-3 h-9 px-4 rounded-full bg-white text-[13px] font-medium text-gray-700"
              >
                Customize copy
              </button>
            </div>
          );
        })}
      </div>
    </BottomSheet>
  );
}

function ChannelSheet({ open, channelKey, draft, updateChannel, onClose }) {
  const meta = channelMeta[channelKey];
  const channel = draft.channels[channelKey];

  return (
    <BottomSheet open={open} onClose={onClose} title={`${meta.label} settings`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-2xl bg-gray-50 p-4">
          <div>
            <div className="text-[14px] font-medium text-gray-900">Enable {meta.label}</div>
            <div className="text-[12px] text-gray-500 mt-0.5">{meta.cost}</div>
          </div>
          <Toggle
            checked={channel.enabled}
            onChange={(checked) => updateChannel(channelKey, { enabled: checked })}
          />
        </div>

        {(channelKey === 'email' || channelKey === 'push') && (
          <Field label={channelKey === 'email' ? 'Subject' : 'Title'}>
            <input
              value={channel.subject || channel.title || draft.name}
              onChange={(event) =>
                updateChannel(channelKey, channelKey === 'email' ? { subject: event.target.value } : { title: event.target.value })
              }
              className="w-full h-11 rounded-xl bg-gray-50 px-3 text-[14px] outline-none"
            />
            <LimitCounter
              value={channel.subject || channel.title || draft.name}
              limit={channelKey === 'email' ? LIMITS.email.subject : LIMITS.push.title}
              label={channelKey === 'email' ? 'subject' : 'title'}
            />
          </Field>
        )}

        <Field label="Message">
          <textarea
            value={channel.body || draft.baseMessage}
            onChange={(event) => updateChannel(channelKey, { body: event.target.value })}
            rows={4}
            className="w-full rounded-xl bg-gray-50 px-3 py-3 text-[14px] outline-none resize-none"
          />
          <LimitCounter
            value={channel.body || draft.baseMessage}
            limit={LIMITS[channelKey].body}
            label="message"
            showSegments={channelKey === 'sms'}
          />
        </Field>

        <div className="rounded-2xl bg-gray-50 p-3">
          <div className="text-[11px] uppercase tracking-wider font-semibold text-gray-400">Preview</div>
          <div className="text-[13px] text-gray-700 leading-snug mt-2">
            <TokenMessage template={channel.body || draft.baseMessage} renderValues />
          </div>
        </div>
      </div>
    </BottomSheet>
  );
}

function PreviewSheet({ open, draft, tested, onTest, onClose }) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Preview and test">
      <div className="space-y-3">
        {enabledChannels(draft).map((channel) => {
          const value = draft.channels[channel.key];
          const title = value.title || value.subject || draft.name;
          const body = value.body || draft.baseMessage;
          return (
            <div key={channel.key} className="rounded-2xl bg-gray-50 p-3">
              <div className="text-[11px] uppercase tracking-wider font-semibold text-gray-400">
                {channel.label}
              </div>
              {(channel.key === 'email' || channel.key === 'push') && (
                <div className="text-[13px] font-semibold text-gray-900 mt-2">{renderTemplate(title)}</div>
              )}
              <div className="text-[13px] text-gray-600 leading-snug mt-1">
                <TokenMessage template={body} renderValues />
              </div>
            </div>
          );
        })}
        <button
          onClick={onTest}
          className="w-full h-11 rounded-full bg-gray-900 text-white text-[14px] font-medium"
        >
          Send test
        </button>
        {tested && (
          <div className="flex items-center gap-2 text-[12px] text-gray-500">
            <Sparkles size={14} />
            Test queued for enabled channels.
          </div>
        )}
      </div>
    </BottomSheet>
  );
}

function TokenMessage({ template, renderValues = false }) {
  const source = renderValues ? renderTemplate(template) : template || '';
  const parts = source.split(/(\{\{.*?\}\})/g).filter(Boolean);

  return (
    <div className="flex flex-wrap items-center gap-1.5 text-[13px] leading-7 text-gray-700">
      {parts.map((part, index) => {
        const match = part.match(/^\{\{(.*?)\}\}$/);
        if (!match) return <span key={`${part}-${index}`}>{part}</span>;
        const key = match[1].trim();
        return (
          <span
            key={`${key}-${index}`}
            className="inline-flex h-6 items-center rounded-full border border-gray-200 bg-white px-2 text-[12px] font-medium text-gray-700"
          >
            {variableLabels[key] || key}
          </span>
        );
      })}
    </div>
  );
}

function ChannelImpact({ template, draft }) {
  return (
    <div className="rounded-2xl border border-gray-100 p-3">
      <div className="text-[12px] font-medium text-gray-500 mb-2">Channel limits</div>
      <div className="space-y-2">
        {enabledChannels(draft).map((channel) => {
          const value = draft.channels[channel.key]?.body || template;
          return (
            <LimitCounter
              key={channel.key}
              value={value}
              limit={LIMITS[channel.key].body}
              label={channel.label}
              showSegments={channel.key === 'sms'}
              compact
            />
          );
        })}
      </div>
    </div>
  );
}

function LimitCounter({ value, limit, label, showSegments = false, compact = false }) {
  const count = (value || '').length;
  const over = count > limit;
  const segments = Math.max(1, Math.ceil(count / limit));

  return (
    <div className={(compact ? 'text-[12px]' : 'mt-2 text-[12px]') + ' flex items-center justify-between gap-3'}>
      <span className={over ? 'text-red-500' : 'text-gray-500'}>
        {label}{showSegments ? ` · ${segments} segment${segments === 1 ? '' : 's'}` : ''}
      </span>
      <span className={over ? 'text-red-500 font-medium' : 'text-gray-400'}>
        {count}/{limit}
      </span>
    </div>
  );
}

function Box({ checked, inverted = false }) {
  return (
    <div
      className={
        'w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-colors ' +
        (checked
          ? inverted
            ? 'bg-white'
            : 'bg-gray-900'
          : 'bg-white border border-gray-300')
      }
    >
      {checked && <Check size={14} className={inverted ? 'text-gray-900' : 'text-white'} strokeWidth={2.5} />}
    </div>
  );
}

function defaultTimingFor(trigger, current) {
  if (trigger === 'appointment_reminder') {
    return current || { amount: 24, unit: 'hours', relation: 'before' };
  }
  return null;
}

function timingDescription(draft) {
  if (!draft.timing) return 'Immediately';
  const { amount, unit, relation } = draft.timing;
  if (relation === 'after_booking') return `${amount} ${unit} after booking`;
  return `${amount} ${unit} before appointment`;
}

function selectionSummary(scope) {
  if (!scope || scope.type === 'all_services') return 'All services';
  if (scope.type === 'service_only') return 'This service only';
  const categoriesCount = scope.categoryIds?.length || 0;
  const serviceCount = scope.serviceIds?.length || 0;
  if (categoriesCount && serviceCount) {
    const first = scope.categoryIds[0];
    const extraCategories = categoriesCount - 1;
    const categoryText = extraCategories > 0 ? `${first} + ${extraCategories}` : first;
    return `${categoryText} + ${serviceCount} service${serviceCount === 1 ? '' : 's'}`;
  }
  if (categoriesCount) {
    if (categoriesCount === 1) return scope.categoryIds[0];
    return `${categoriesCount} categories`;
  }
  if (serviceCount) return `${serviceCount} service${serviceCount === 1 ? '' : 's'}`;
  return 'No services selected';
}

function Field({ label, children }) {
  return (
    <label className="block">
      <div className="text-[13px] font-medium text-gray-700 mb-2">{label}</div>
      {children}
    </label>
  );
}
