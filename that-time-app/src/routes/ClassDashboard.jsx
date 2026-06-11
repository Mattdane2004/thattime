import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  AlertCircle,
  Award,
  Bell,
  CalendarDays,
  Camera,
  ChevronRight,
  ClipboardList,
  Eye,
  FileText,
  ListChecks,
  MapPin,
  Megaphone,
  Package,
  Plus,
  Settings2,
  Users,
} from 'lucide-react';
import ScreenHeader from '../components/ScreenHeader';
import Toggle from '../components/Toggle';
import NameSheet from './sheets/NameSheet';
import IconSheet from './sheets/IconSheet';
import { emptyClassDetails } from '../data/offerTypes';
import { formsChip, notificationsChip, requirementsChip } from '../data/advancedOptions';
import {
  bookingStructureLabel,
  classReadiness,
  deliveryMethodLabel,
  priceForRoute,
  isPrivateGroupClass,
} from '../data/classFlow';

export default function ClassDashboard() {
  const navigate = useNavigate();
  const { draft, updateDraft, upsertSavedOffer } = useOutletContext();
  const [sheet, setSheet] = useState(null);
  const details = draft.classDetails || emptyClassDetails();
  const readiness = classReadiness(draft);

  const publish = () => {
    if (!readiness.canPublish) return;
    const published = {
      ...draft,
      id: draft.id && !draft.id.startsWith('draft') ? draft.id : `class_${Date.now()}`,
      status: 'published',
    };
    updateDraft(published);
    upsertSavedOffer?.(published);
    navigate('/services?type=class');
  };

  const summaryRows = [
    { label: 'Schedule', desc: 'Dates, repeats and agenda', icon: CalendarDays, path: '/class/schedule', meta: scheduleMeta(details) },
    { label: 'Delivery', desc: 'Location, online or travel rules', icon: MapPin, path: '/class/location', meta: deliveryMethodLabel(details.deliveryMethod) },
    { label: 'Instructors', desc: 'Who can teach this class', icon: Users, path: '/class/staff', meta: staffMeta(details) },
    { label: 'Attendees', desc: 'Capacity, bookings and roster', icon: Users, path: '/class/bookings', meta: attendeeMeta(details) },
  ];

  const advancedGroups = [
    {
      title: 'Student preparation',
      desc: 'What students need before, during, and after the class.',
      rows: [
        { label: 'Requirements & prerequisites', desc: 'Age limits, eligibility, qualifications and insurance', icon: ListChecks, path: '/class/requirements', meta: requirementsChip(draft.advancedOptions) },
        { label: 'Equipment & what to bring', desc: 'Kit, tools, PPE and student checklist items', icon: Package, path: '/class/equipment', meta: equipmentMeta(draft) },
        { label: 'Forms & waivers', desc: 'Consultation forms, waivers, health checks and pre-course questions', icon: ClipboardList, path: '/class/forms', meta: formsChip(draft.advancedOptions) },
        { label: 'Agenda & syllabus', desc: 'Modules, breaks, learning outcomes and day-by-day timetable', icon: CalendarDays, path: '/class/agenda', meta: agendaMeta(details) },
        { label: 'Materials', desc: 'PDFs, pre-reads, prep guides and after-class resources', icon: FileText, path: '/class/materials', meta: materialMeta(details) },
        { label: 'Completion & certificates', desc: 'Simple issue rules and certificate naming', icon: Award, path: '/class/certificates', meta: details.certificateSettings?.enabled ? 'Enabled' : 'Optional' },
      ],
    },
    {
      title: 'Delivery controls',
      desc: 'Operational rules that support the class without changing the core setup.',
      rows: [
        { label: 'Models & practice clients', desc: 'Custom criteria, evidence requests, safeguards and application link', icon: Megaphone, path: '/class/models', meta: modelMeta(details) },
        { label: 'Resources, rooms & equipment', desc: 'Rooms, equipment, setup needs and internal resource notes', icon: Package, path: '/class/resources', meta: resourceMeta(draft) },
        { label: 'Products & kits', desc: 'Student kits, required products and optional add-ons', icon: Package, path: '/class/products', meta: productMeta(draft) },
        { label: 'Notifications', desc: 'Class reminders, cancellation messages and student updates', icon: Bell, path: '/class/notifications', meta: notificationsChip(draft.advancedOptions) },
        { label: 'Policies, payments & rules', desc: 'Lead time, cancellation, rescheduling, deposits and payment methods', icon: Settings2, path: '/class/settings', meta: 'Default rules' },
      ],
    },
  ];

  const setPrivateListing = (privateListing) =>
    updateDraft({
      classDetails: {
        ...details,
        visibilityMode: privateListing ? 'private_link' : 'marketplace',
        visibility: { ...(details.visibility || {}), hidden: privateListing },
      },
    });

  return (
    <>
      <ScreenHeader title="" onBack={() => navigate('/services?type=class')} />
      <div className="flex-1 overflow-y-auto">
        <div className="px-5 pt-2 pb-5">
          <div className="flex items-start gap-3">
            <button
              onClick={() => setSheet('icon')}
              aria-label="Change icon"
              className="w-12 h-12 rounded-2xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center shrink-0 transition-colors"
            >
              <Users size={20} className="text-gray-700" strokeWidth={1.75} />
            </button>
            <button onClick={() => setSheet('details')} className="min-w-0 flex-1 text-left">
              <div className="text-[26px] leading-tight font-semibold tracking-tight truncate">
                {draft.name || 'Untitled class'}
              </div>
              <div className="text-[14px] text-gray-500 mt-1">
                {draft.status === 'published' ? 'Live class' : 'Draft class'} · {bookingStructureLabel(details)}
              </div>
            </button>
            <span className={'px-3 py-1 rounded-full text-[12px] font-medium shrink-0 ' + (draft.status === 'published' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700')}>
              {draft.status === 'published' ? 'Live' : 'Draft'}
            </span>
          </div>
        </div>

        <div className="px-5 pb-4">
          <VisibilityToggle
            privateListing={details.visibilityMode !== 'marketplace'}
            onChange={setPrivateListing}
          />
        </div>

        <div className="px-5 pb-5 space-y-4">
          <SummaryCard
            draft={draft}
            details={details}
            readiness={readiness}
            rows={summaryRows}
            navigate={navigate}
          />
        </div>

        <PhotoStrip photos={draft.photos} onOpen={() => navigate('/class/photos')} />

        <div className="pt-2 pb-5">
          <div className="px-5 pb-2 text-[15px] font-semibold text-gray-900">Advanced options</div>
          {advancedGroups.map((group) => (
            <AdvancedGroup key={group.title} group={group} navigate={navigate} />
          ))}
        </div>

        <div className="h-5" />
      </div>

      <div className="px-5 pb-5 pt-3 shrink-0 flex gap-2 bg-white border-t border-gray-100">
        <button
          onClick={() => navigate('/class/preview')}
          className="flex-1 h-12 rounded-full border border-gray-200 text-[15px] font-medium hover:bg-gray-50 transition-colors"
        >
          Preview
        </button>
        <button
          onClick={publish}
          disabled={!readiness.canPublish}
          className={'flex-1 h-12 rounded-full text-[15px] font-medium transition-colors ' + (readiness.canPublish ? 'bg-gray-900 hover:bg-gray-800 text-white' : 'bg-gray-200 text-gray-400')}
        >
          Publish
        </button>
      </div>

      <NameSheet open={sheet === 'details'} onClose={() => setSheet(null)} />
      <IconSheet open={sheet === 'icon'} onClose={() => setSheet(null)} />
    </>
  );
}

function AdvancedGroup({ group, navigate }) {
  return (
    <div className="pt-3">
      <div className="px-5 pb-1 flex items-baseline justify-between gap-3">
        <div className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider">
          {group.title}
        </div>
        <div className="text-[12px] text-gray-400 shrink-0">
          {group.rows.length} options
        </div>
      </div>
      <div className="px-2">
        {group.rows.map((row) => <DashboardRow key={row.label} row={row} navigate={navigate} />)}
      </div>
    </div>
  );
}

function VisibilityToggle({ privateListing, onChange }) {
  return (
    <div className="rounded-2xl bg-gray-50 px-4 py-3 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0">
        <Eye size={17} className="text-gray-700" strokeWidth={1.75} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-medium text-gray-900">Private listing</div>
        <div className="text-[12px] text-gray-500 truncate">
          {privateListing ? 'Hidden from marketplace; share by link or invite.' : 'Visible on the marketplace.'}
        </div>
      </div>
      <Toggle checked={privateListing} onChange={onChange} />
    </div>
  );
}

function SummaryCard({ draft, details, readiness, rows, navigate }) {
  return (
    <section className="rounded-3xl border border-gray-100 bg-white overflow-hidden">
      <button
        onClick={() => navigate('/class/pricing')}
        className="w-full px-6 pt-6 pb-5 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-baseline gap-2 flex-wrap">
          <div className={'text-[32px] font-semibold tracking-tight leading-none ' + (priceForRoute(draft, isPrivateGroupClass(details) ? 'private' : 'public') || details.pricingType === 'free' ? 'text-gray-900' : 'text-gray-300')}>
            {priceHeadline(draft, details)}
          </div>
          <div className="text-[15px] text-gray-500">{isPrivateGroupClass(details) ? 'private group' : 'per attendee'}</div>
        </div>
      </button>

      <div className="mx-6 h-px bg-gray-100" />

      {rows.map((row, index) => (
        <div key={row.label}>
          <SummaryRow row={row} navigate={navigate} />
          {index < rows.length - 1 && <div className="mx-6 h-px bg-gray-100" />}
        </div>
      ))}

      {readiness.issues.length > 0 && (
        <>
          <div className="mx-6 h-px bg-gray-100" />
          <div className="px-6 py-4 bg-amber-50/60">
            <div className="flex items-start gap-3">
              <AlertCircle size={17} className="text-amber-700 shrink-0 mt-0.5" strokeWidth={1.8} />
              <div className="min-w-0">
                <div className="text-[13px] font-medium text-amber-900">Setup needs attention</div>
                <button
                  onClick={() => navigate(readiness.issues[0].path)}
                  className="text-left text-[12px] text-amber-800 underline underline-offset-2 mt-0.5"
                >
                  {readiness.issues[0].label}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

function DashboardRow({ row, navigate }) {
  const Icon = row.icon;
  const onClick = row.action || (() => navigate(row.path));
  return (
    <button onClick={onClick} className="w-full px-3 py-4 flex items-center gap-4 rounded-xl text-left hover:bg-gray-50 transition-colors">
      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
        <Icon size={18} className="text-gray-700" strokeWidth={1.75} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <div className="text-[15px] text-gray-900 truncate">{row.label}</div>
          <div className="text-[11px] text-gray-400 truncate">{row.meta}</div>
        </div>
        <div className="text-[13px] text-gray-500 mt-0.5 truncate">{row.desc}</div>
      </div>
      <ChevronRight size={17} className="text-gray-400 shrink-0" strokeWidth={1.75} />
    </button>
  );
}

function SummaryRow({ row, navigate }) {
  const Icon = row.icon;
  return (
    <button
      onClick={() => navigate(row.path)}
      className="w-full flex items-center gap-3 px-6 py-4 text-left hover:bg-gray-50 transition-colors"
    >
      <Icon size={15} className="text-gray-500 shrink-0" strokeWidth={1.75} />
      <div className="flex-1 min-w-0">
        <div className="text-[15px] text-gray-900 truncate">{row.meta}</div>
        <div className="text-[12px] text-gray-400 mt-0.5 truncate">{row.label}</div>
      </div>
      <ChevronRight size={15} className="text-gray-300 shrink-0" strokeWidth={2} />
    </button>
  );
}

function PhotoStrip({ photos, onOpen }) {
  const empty = !photos || photos.length === 0;
  return (
    <div className="pb-5">
      <div className="px-5 pb-3 flex items-center justify-between">
        <div className="text-[15px] font-semibold text-gray-900">Photos & videos</div>
        <button onClick={onOpen} className="text-[13px] font-medium text-gray-500 hover:text-gray-900 transition-colors">
          {empty ? 'Add' : 'Manage'}
        </button>
      </div>

      {empty ? (
        <div className="flex gap-2 overflow-x-auto px-5 pb-1">
          {[0, 1, 2].map((item) => (
            <div key={item} className="shrink-0 w-[88px] h-[88px] rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50" />
          ))}
          <button
            onClick={onOpen}
            className="shrink-0 w-[88px] h-[88px] rounded-2xl bg-gray-50 hover:bg-gray-100 flex flex-col items-center justify-center gap-1.5 text-gray-400 transition-colors"
          >
            <Camera size={18} strokeWidth={1.75} />
            <span className="text-[11px] font-medium">Add</span>
          </button>
        </div>
      ) : (
        <div className="flex gap-2 overflow-x-auto px-5 pb-1">
          {photos.slice(0, 4).map((photo) => (
            <button
              key={photo.id}
              onClick={onOpen}
              className={'shrink-0 w-[88px] h-[88px] rounded-2xl flex items-center justify-center text-[11px] text-gray-600 hover:opacity-90 transition-opacity ' + photo.shade}
            >
              {photo.label}
            </button>
          ))}
          <button
            onClick={onOpen}
            aria-label="Add photo"
            className="shrink-0 w-[88px] h-[88px] rounded-2xl border-2 border-dashed border-gray-200 hover:bg-gray-50 flex items-center justify-center text-gray-400 transition-colors"
          >
            <Plus size={18} strokeWidth={1.75} />
          </button>
        </div>
      )}
    </div>
  );
}

function priceHeadline(draft, details) {
  if (details.pricingType === 'free') return 'Free';
  if (details.pricingType === 'poa') return 'POA';
  const price = isPrivateGroupClass(details) ? priceForRoute(draft, 'private') : priceForRoute(draft, 'public');
  return price ? `£${price}` : 'Add price';
}

function scheduleMeta(details) {
  if (details.classStructure === 'single_session') return details.repeatSetting === 'repeats' ? 'Repeating occurrence' : 'One-off session';
  return details.repeatSetting === 'repeating_intake' ? 'Repeating intake' : `${details.courseSessions?.length || 0} sessions`;
}

function staffMeta(details) {
  if (isPrivateGroupClass(details)) return 'Eligible staff';
  return 'Instructor per location';
}

function attendeeMeta(details) {
  if (isPrivateGroupClass(details)) return `${details.partySize?.min || 1}-${details.partySize?.max || 1} people`;
  return `${details.minParticipants || 1}-${details.capacity || 0} seats`;
}

function materialMeta(details) {
  const count = details.courseMaterials?.length || 0;
  return count ? `${count} files` : 'Optional';
}

function agendaMeta(details) {
  const sessionItems = (details.courseSessions || []).reduce((count, session) => count + (session.agendaItems?.length || 0), 0);
  const singleItems = details.singleSession?.agendaItems?.length || 0;
  const total = sessionItems + singleItems;
  return total ? `${total} item${total === 1 ? '' : 's'}` : 'Optional';
}

function equipmentMeta(draft) {
  const requirements = draft.advancedOptions?.requirements || {};
  const equipment = requirements.equipment?.items?.length || 0;
  const bring = requirements.bring?.items?.length || 0;
  const total = equipment + bring;
  return total ? `${total} item${total === 1 ? '' : 's'}` : 'Optional';
}

function modelMeta(details) {
  return details.modelSettings?.usesLiveModels ? 'Enabled' : 'Optional';
}

function resourceMeta(draft) {
  const count = draft.resources?.length || 0;
  return count ? `${count} resource${count === 1 ? '' : 's'}` : 'Optional';
}

function productMeta(draft) {
  const count = draft.products?.length || 0;
  return count ? `${count} product${count === 1 ? '' : 's'}` : 'Optional';
}
