export const NOTIFICATION_TRIGGERS = [
  { key: 'appointment_confirmed', label: 'Appointment confirmed', timing: false },
  { key: 'appointment_reminder', label: 'Appointment reminder', timing: true },
  { key: 'appointment_cancelled', label: 'Appointment cancelled', timing: false },
  { key: 'appointment_rescheduled', label: 'Appointment rescheduled', timing: false },
  { key: 'form_request', label: 'Form request', timing: false },
];

export const CHANNELS = [
  { key: 'sms', label: 'SMS' },
  { key: 'email', label: 'Email' },
  { key: 'push', label: 'Push' },
  { key: 'whatsapp', label: 'WhatsApp' },
];

const baseChannels = ({ sms = false, email = true, push = false, whatsapp = false } = {}) => ({
  sms: { enabled: sms, body: '' },
  email: { enabled: email, subject: '', body: '' },
  push: { enabled: push, title: '', body: '' },
  whatsapp: { enabled: whatsapp, body: '' },
});

const allServices = { type: 'all_services', categoryIds: [], serviceIds: [] };

export const demoNotifications = [
  {
    id: 'notif_confirm',
    name: 'Appointment confirmation',
    type: 'default',
    status: 'on',
    trigger: 'appointment_confirmed',
    timing: null,
    scope: allServices,
    channels: baseChannels({ sms: true, email: true, push: true }),
    baseMessage:
      'Hi {{client_name}}, your {{service_name}} is confirmed for {{appointment_date}} at {{appointment_time}} with {{staff_member}}.',
    variables: ['client_name', 'service_name', 'appointment_date', 'appointment_time', 'staff_member'],
    createdFromNotificationId: null,
    serviceOverrides: [],
    updatedAt: 'Today',
  },
  {
    id: 'notif_reminder',
    name: 'Appointment reminder',
    type: 'default',
    status: 'on',
    trigger: 'appointment_reminder',
    timing: { amount: 24, unit: 'hours', relation: 'before' },
    scope: allServices,
    channels: baseChannels({ sms: true, email: true, whatsapp: true }),
    baseMessage:
      'Reminder: {{client_name}}, your {{service_name}} is tomorrow at {{appointment_time}}. Manage your booking: {{reschedule_link}}',
    variables: ['client_name', 'service_name', 'appointment_time', 'reschedule_link'],
    createdFromNotificationId: null,
    serviceOverrides: [],
    updatedAt: 'Today',
  },
  {
    id: 'notif_cancelled',
    name: 'Appointment cancelled',
    type: 'default',
    status: 'on',
    trigger: 'appointment_cancelled',
    timing: null,
    scope: allServices,
    channels: baseChannels({ email: true, push: true }),
    baseMessage:
      'Hi {{client_name}}, your {{service_name}} on {{appointment_date}} has been cancelled. Book again here: {{reschedule_link}}',
    variables: ['client_name', 'service_name', 'appointment_date', 'reschedule_link'],
    createdFromNotificationId: null,
    serviceOverrides: [],
    updatedAt: 'Yesterday',
  },
  {
    id: 'notif_rescheduled',
    name: 'Appointment rescheduled',
    type: 'default',
    status: 'on',
    trigger: 'appointment_rescheduled',
    timing: null,
    scope: allServices,
    channels: baseChannels({ sms: true, email: true, push: true }),
    baseMessage:
      'Your {{service_name}} has moved to {{appointment_date}} at {{appointment_time}}. See details: {{reschedule_link}}',
    variables: ['service_name', 'appointment_date', 'appointment_time', 'reschedule_link'],
    createdFromNotificationId: null,
    serviceOverrides: [],
    updatedAt: 'Yesterday',
  },
  {
    id: 'notif_form_request',
    name: 'Form request',
    type: 'default',
    status: 'on',
    trigger: 'form_request',
    timing: null,
    scope: allServices,
    channels: baseChannels({ sms: true, email: true }),
    baseMessage:
      'Hi {{client_name}}, please complete your form before {{service_name}}: {{form_link}}',
    variables: ['client_name', 'service_name', 'form_link'],
    createdFromNotificationId: null,
    serviceOverrides: [],
    updatedAt: 'Yesterday',
  },
  {
    id: 'notif_colour_prep',
    name: 'Colour prep instructions',
    type: 'custom',
    status: 'on',
    trigger: 'appointment_reminder',
    timing: { amount: 48, unit: 'hours', relation: 'before' },
    scope: { type: 'selected_categories', categoryIds: ['Colour'], serviceIds: [] },
    channels: baseChannels({ email: true, whatsapp: true }),
    baseMessage:
      'Hi {{client_name}}, before your colour appointment please avoid heavy styling products and bring any reference photos.',
    variables: ['client_name'],
    createdFromNotificationId: null,
    serviceOverrides: [],
    updatedAt: '2 days ago',
  },
];

export function createBlankNotification(service) {
  return {
    id: `notif_${Date.now()}`,
    name: service ? `${service.name} notification` : 'New notification',
    type: 'custom',
    status: 'on',
    trigger: 'appointment_confirmed',
    timing: null,
    scope: service
      ? { type: 'service_only', categoryIds: [], serviceIds: [service.id] }
      : { type: 'all_services', categoryIds: [], serviceIds: [] },
    channels: baseChannels({ email: true }),
    baseMessage:
      'Hi {{client_name}}, your {{service_name}} is confirmed for {{appointment_date}} at {{appointment_time}}.',
    variables: ['client_name', 'service_name', 'appointment_date', 'appointment_time'],
    createdFromNotificationId: null,
    serviceOverrides: [],
    updatedAt: 'Just now',
  };
}

export function duplicateForService(notification, service) {
  return {
    ...notification,
    id: `notif_${Date.now()}`,
    name: `${notification.name} - ${service.name}`,
    type: 'custom',
    scope: { type: 'service_only', categoryIds: [], serviceIds: [service.id] },
    createdFromNotificationId: notification.id,
    serviceOverrides: [],
    updatedAt: 'Just now',
  };
}

export function triggerLabel(key) {
  return NOTIFICATION_TRIGGERS.find((t) => t.key === key)?.label || key;
}

export function enabledChannels(notification) {
  return CHANNELS.filter((channel) => notification.channels?.[channel.key]?.enabled);
}

export function scopeLabel(scope) {
  if (!scope || scope.type === 'all_services') return 'All services';
  if (scope.type === 'selected_categories') {
    const count = scope.categoryIds?.length || 0;
    return `${count} categor${count === 1 ? 'y' : 'ies'}`;
  }
  const count = scope.serviceIds?.length || 0;
  return scope.type === 'service_only'
    ? 'This service only'
    : `${count} service${count === 1 ? '' : 's'}`;
}

export function timingLabel(notification) {
  const timing = notification.timing;
  if (!timing) return 'Immediately';
  return `${timing.amount} ${timing.unit} ${timing.relation}`;
}

export function appliesToService(notification, service) {
  const scope = notification.scope;
  if (!scope || scope.type === 'all_services') return true;
  if (scope.type === 'selected_categories') return scope.categoryIds?.includes(service.category);
  return scope.serviceIds?.includes(service.id);
}

export function isMutedForService(notification, serviceId) {
  return notification.serviceOverrides?.some((o) => o.serviceId === serviceId && o.muted);
}

export function renderTemplate(template) {
  const sample = {
    client_name: 'Amelia',
    service_name: 'Classic haircut',
    appointment_date: 'Fri 8 May',
    appointment_time: '10:30',
    staff_member: 'Sofia',
    location: 'Soho salon',
    form_link: 'thattime.app/form',
    reschedule_link: 'thattime.app/manage',
    cancellation_link: 'thattime.app/cancel',
  };

  return (template || '').replace(/\{\{(.*?)\}\}/g, (_, key) => sample[key.trim()] || `{{${key}}}`);
}
