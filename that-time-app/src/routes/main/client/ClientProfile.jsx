import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Star,
  Calendar,
  MessageSquare,
  Phone,
  Flag,
  AlertTriangle,
  CreditCard,
  Sparkles,
  FileText,
  Pencil,
  StickyNote,
  Syringe,
  Tag,
  Merge,
  Ban,
  Trash2,
  Wallet,
  Settings,
  IdCard,
} from 'lucide-react';
import { useMainActions } from '../../../components/sheets/MainActionsContext';
import ConfirmSheet from '../../../components/sheets/ConfirmSheet';
import SheetShell from '../../../components/sheets/SheetShell';
import { useClient } from './useClient';
import { AllergySheet, PatchTestSheet, StaffAlertSheet, TagSheet, NoteSheet } from './recordSheets';

const TAG_TONES = {
  light: 'bg-gray-100 text-gray-500',
  mid: 'bg-gray-500 text-white',
  dark: 'bg-gray-900 text-white',
};

// Client profile — a calm index. Identity and what-you-need-at-the-chair up
// top, everything else one tap away in focused sections.
export default function ClientProfile() {
  const navigate = useNavigate();
  const {
    clientId,
    client,
    blocked,
    allergies,
    patchTests,
    notes,
    tags,
    staffAlert,
  } = useClient();
  const {
    openAction,
    showToast,
    blockClient,
    unblockClient,
    removeClient,
    collectedPayments,
  } = useMainActions();

  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [sheet, setSheet] = useState(null); // 'note' | 'allergy' | 'patch' | 'alert' | 'tag'

  const severeAllergy = allergies.find((a) => a.severity === 'Severe');
  const outstanding = client.bookings.items.find(
    (b) => b.unpaid && !collectedPayments.includes(`${client.id}_${b.id}`),
  );
  const next = client.overview.nextAppointment;
  const firstName = client.name.split(' ')[0];

  const sections = [
    {
      icon: Calendar,
      label: 'Appointments',
      meta: next ? `Next ${next.detail.split('·')[0].trim()}` : client.bookings.pastCount,
      to: 'appointments',
    },
    {
      icon: FileText,
      label: 'Client record',
      meta: [
        allergies.length && `${allergies.length} allerg${allergies.length === 1 ? 'y' : 'ies'}`,
        patchTests.length && `${patchTests.length} patch test${patchTests.length === 1 ? '' : 's'}`,
        notes.length && `${notes.length} note${notes.length === 1 ? '' : 's'}`,
      ]
        .filter(Boolean)
        .join(' · ') || 'Notes, allergies, forms, files',
      to: 'record',
    },
    {
      icon: Wallet,
      label: 'Wallet & loyalty',
      meta: `£${client.wallet.balance} · ${client.loyalty.points} pts`,
      to: 'wallet',
    },
    {
      icon: Star,
      label: 'Reviews',
      meta: client.reviews.items.length
        ? `${client.reviews.average} · ${client.reviews.items.length} reviews`
        : 'No reviews yet',
      to: 'reviews',
    },
    {
      icon: Settings,
      label: 'Settings',
      meta: 'Payments, notifications, booking rules',
      to: 'settings',
    },
  ];

  const menuItems = [
    { icon: StickyNote, label: 'Add note', onClick: () => setSheet('note') },
    { icon: AlertTriangle, label: 'Add allergy', onClick: () => setSheet('allergy') },
    { icon: Syringe, label: 'Add patch test', onClick: () => setSheet('patch') },
    { icon: Flag, label: staffAlert ? 'Edit staff alert' : 'Add staff alert', onClick: () => setSheet('alert') },
    { icon: Tag, label: 'Add tag', onClick: () => setSheet('tag') },
    { divider: true },
    { icon: Pencil, label: 'Edit details', onClick: () => navigate(`/clients/${clientId}/details`) },
    {
      icon: Merge,
      label: 'Merge profiles',
      onClick: () => {
        navigate('/clients');
        showToast('Use ⋯ → Merge duplicate clients');
      },
    },
    blocked
      ? {
          icon: Ban,
          label: 'Unblock client',
          onClick: () => {
            unblockClient(clientId);
            showToast(`${client.name} unblocked`);
          },
        }
      : {
          icon: Ban,
          label: 'Block client',
          onClick: () => {
            blockClient(clientId);
            showToast(`${client.name} blocked`);
          },
        },
    { icon: Trash2, label: 'Delete client', onClick: () => setDeleteOpen(true) },
  ];

  return (
    <>
      {/* Header */}
      <div className="shrink-0 bg-white flex items-center justify-between px-4 h-14">
        <button
          onClick={() => navigate('/clients')}
          className="-ml-2 w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100"
          aria-label="Back to clients"
        >
          <ChevronLeft size={22} />
        </button>
        <button
          onClick={() => setMenuOpen(true)}
          className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center hover:bg-gray-100"
          aria-label="Client options"
        >
          <MoreHorizontal size={16} className="text-gray-700" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto bg-white px-4 pb-8">
        {/* Identity */}
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-[15px] font-semibold text-gray-500 shrink-0">
            {client.initials}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[18px] font-bold text-gray-900 truncate">{client.name}</span>
              <span
                className={
                  'shrink-0 text-[10px] font-semibold rounded-full px-2 py-0.5 ' +
                  (blocked ? 'bg-gray-500 text-white' : 'bg-gray-900 text-white')
                }
              >
                {blocked ? 'Blocked' : 'Active'}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              {client.rating && (
                <span className="flex items-center gap-1 text-[12px] font-medium text-gray-900">
                  <Star size={11} className="fill-gray-900 text-gray-900" />
                  {client.rating}
                </span>
              )}
              <span className="text-[12px] text-gray-400">
                {client.source === 'app' ? 'Joined via app' : 'Added by you'} · {client.joined}
              </span>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                {tags.map((tag) => (
                  <span
                    key={tag.label}
                    className={'text-[10px] font-medium rounded-md px-2 py-0.5 ' + (TAG_TONES[tag.tone] || TAG_TONES.light)}
                  >
                    {tag.label}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Primary actions */}
        <div className="flex items-center gap-2.5 mt-4">
          <button
            onClick={() => openAction('appointment', { client: client.name })}
            disabled={blocked}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-900 text-white rounded-full h-12 text-[13px] font-semibold hover:bg-gray-800 transition-colors disabled:bg-gray-100 disabled:text-gray-300"
          >
            <Calendar size={15} strokeWidth={1.75} />
            Book
          </button>
          <button
            onClick={() => navigate(`/messages/${client.conversationId}`)}
            className="flex-1 flex items-center justify-center gap-2 border border-gray-200 rounded-full h-12 text-[13px] font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
          >
            <MessageSquare size={15} strokeWidth={1.75} />
            Message
          </button>
          <button
            onClick={() => showToast(`Calling ${firstName}…`)}
            className="shrink-0 w-12 h-12 border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
            aria-label="Call client"
          >
            <Phone size={16} className="text-gray-900" strokeWidth={1.75} />
          </button>
        </div>

        {/* At the chair — only what matters right now */}
        <div className="space-y-2.5 mt-5">
          {staffAlert && (
            <button
              onClick={() => setSheet('alert')}
              className="w-full flex items-center gap-3 bg-gray-900 text-white rounded-2xl px-4 py-3.5 text-left"
            >
              <Flag size={15} strokeWidth={1.75} className="shrink-0" />
              <span className="flex-1 text-[13px] font-medium leading-snug">{staffAlert}</span>
            </button>
          )}
          {severeAllergy && (
            <button
              onClick={() => navigate(`/clients/${clientId}/record`)}
              className="w-full flex items-center gap-3 bg-gray-100 rounded-2xl px-4 py-3.5 text-left"
            >
              <AlertTriangle size={15} strokeWidth={1.75} className="shrink-0 text-gray-900" />
              <span className="flex-1 text-[13px] font-medium text-gray-900 leading-snug">
                Severe allergy · {severeAllergy.name}
                {severeAllergy.patchTestRequired && ' — patch test required'}
              </span>
              <ChevronRight size={15} className="text-gray-400 shrink-0" />
            </button>
          )}
          {next && (
            <button
              onClick={() => navigate(`/clients/${clientId}/appointments`)}
              className="w-full flex items-center gap-3 border border-gray-200 rounded-2xl px-4 py-3.5 text-left hover:bg-gray-50 transition-colors"
            >
              <Calendar size={15} strokeWidth={1.75} className="shrink-0 text-gray-700" />
              <span className="flex-1 min-w-0">
                <span className="block text-[13px] font-semibold text-gray-900">
                  Next · {next.service}
                </span>
                <span className="block text-[11px] text-gray-500 mt-0.5">{next.detail}</span>
              </span>
              <ChevronRight size={15} className="text-gray-400 shrink-0" />
            </button>
          )}
          {outstanding && (
            <button
              onClick={() =>
                navigate(
                  `/checkout?client=${encodeURIComponent(client.name)}&service=${encodeURIComponent(
                    `${outstanding.service} (outstanding)`,
                  )}&price=${outstanding.unpaid.replace('£', '')}&collect=${client.id}_${outstanding.id}`,
                )
              }
              className="w-full flex items-center gap-3 border border-gray-300 bg-gray-50 rounded-2xl px-4 py-3.5 text-left hover:bg-gray-100 transition-colors"
            >
              <CreditCard size={15} strokeWidth={1.75} className="shrink-0 text-gray-700" />
              <span className="flex-1 text-[13px] font-medium text-gray-900">
                {outstanding.unpaid} outstanding · {outstanding.service}
              </span>
              <span className="shrink-0 text-[12px] font-semibold text-gray-900">Collect</span>
            </button>
          )}
          {client.topUp && (
            <button
              onClick={() =>
                openAction('appointment', { client: client.name, service: client.topUp.service })
              }
              className="w-full flex items-center gap-3 border border-gray-200 rounded-2xl px-4 py-3.5 text-left hover:bg-gray-50 transition-colors"
            >
              <Sparkles size={15} strokeWidth={1.75} className="shrink-0 text-gray-700" />
              <span className="flex-1 min-w-0">
                <span className="block text-[13px] font-semibold text-gray-900">{client.topUp.title}</span>
                <span className="block text-[11px] text-gray-500 mt-0.5">{client.topUp.detail}</span>
              </span>
              <span className="shrink-0 text-[12px] font-semibold text-gray-900">Book</span>
            </button>
          )}
        </div>

        {/* Sections */}
        <div className="mt-6 border border-gray-100 rounded-2xl overflow-hidden">
          {sections.map(({ icon: Icon, label, meta, to }, i) => (
            <button
              key={to}
              onClick={() => navigate(`/clients/${clientId}/${to}`)}
              className={
                'w-full flex items-center gap-3.5 px-4 py-4 text-left hover:bg-gray-50 transition-colors ' +
                (i > 0 ? 'border-t border-gray-50' : '')
              }
            >
              <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                <Icon size={16} className="text-gray-700" strokeWidth={1.75} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-semibold text-gray-900">{label}</div>
                <div className="text-[12px] text-gray-400 truncate">{meta}</div>
              </div>
              <ChevronRight size={16} className="text-gray-300 shrink-0" />
            </button>
          ))}
        </div>

        {/* Details */}
        <button
          onClick={() => navigate(`/clients/${clientId}/details`)}
          className="w-full flex items-center gap-3.5 px-4 py-4 mt-3 border border-gray-100 rounded-2xl text-left hover:bg-gray-50 transition-colors"
        >
          <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
            <IdCard size={16} className="text-gray-700" strokeWidth={1.75} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[14px] font-semibold text-gray-900">Details</div>
            <div className="text-[12px] text-gray-400 truncate">
              {client.details.phone || 'Add contact info, birthday, pronouns…'}
            </div>
          </div>
          <ChevronRight size={16} className="text-gray-300 shrink-0" />
        </button>
      </div>

      {/* ⋯ menu */}
      <SheetShell
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        title={client.name}
        subtitle={blocked ? 'Blocked' : `${client.source === 'app' ? 'Joined via app' : 'Added by you'} · ${client.joined}`}
      >
        {menuItems.map((item, i) =>
          item.divider ? (
            <div key={`d${i}`} className="border-t border-gray-100 my-2" />
          ) : (
            <button
              key={item.label}
              onClick={() => {
                setMenuOpen(false);
                item.onClick();
              }}
              className="w-full flex items-center gap-3.5 py-3 text-left"
            >
              <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                <item.icon size={15} className="text-gray-900" strokeWidth={1.75} />
              </div>
              <span className="text-[14px] font-medium text-gray-900">{item.label}</span>
            </button>
          ),
        )}
      </SheetShell>

      <ConfirmSheet
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title={`Delete ${client.name}?`}
        message="Their profile, bookings, notes and forms will be removed. This can't be undone."
        confirmLabel="Delete client"
        onConfirm={() => {
          removeClient(clientId);
          showToast(`${client.name} deleted`);
          navigate('/clients');
        }}
      />

      {/* Quick-add sheets */}
      <NoteSheet open={sheet === 'note'} onClose={() => setSheet(null)} clientId={clientId} clientName={client.name} />
      <AllergySheet open={sheet === 'allergy'} onClose={() => setSheet(null)} clientId={clientId} clientName={client.name} />
      <PatchTestSheet open={sheet === 'patch'} onClose={() => setSheet(null)} clientId={clientId} clientName={client.name} />
      <StaffAlertSheet
        open={sheet === 'alert'}
        onClose={() => setSheet(null)}
        clientId={clientId}
        clientName={client.name}
        current={staffAlert}
      />
      <TagSheet
        open={sheet === 'tag'}
        onClose={() => setSheet(null)}
        clientId={clientId}
        clientName={client.name}
        existingTags={tags}
      />
    </>
  );
}
