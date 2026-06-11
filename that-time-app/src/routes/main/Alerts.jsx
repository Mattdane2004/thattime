import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  MoreVertical,
  X,
  Check,
  Pencil,
  CalendarClock,
  Heart,
  BookOpen,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { useMainActions } from '../../components/sheets/MainActionsContext';
import { feedFilters, feedGroups } from '../../data/activityFeed';

// Notification badge icon per item type.
const BADGE_ICONS = {
  cancel: X,
  booking: Check,
  feedback: Pencil,
  reschedule: CalendarClock,
};

// Standard notification — avatar with a small badge icon.
function StandardItem({ item }) {
  const Badge = BADGE_ICONS[item.icon] || Check;
  return (
    <div className="bg-gray-50 rounded-2xl px-4 py-4 flex gap-3.5">
      <div className="relative shrink-0">
        <div className="w-11 h-11 rounded-full bg-gray-200 flex items-center justify-center text-[12px] font-semibold text-gray-600">
          {item.initials}
        </div>
        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-white border border-gray-200 flex items-center justify-center">
          <Badge size={9} className="text-gray-700" strokeWidth={2} />
        </span>
      </div>
      <div className="min-w-0">
        <div className="text-[12px] text-gray-500">{item.title}</div>
        <div className="text-[14px] text-gray-900 leading-snug mt-1">{item.text}</div>
      </div>
    </div>
  );
}

// Message request — accept / decline inline, stays in context.
function MessageRequestItem({ item }) {
  const { showToast } = useMainActions();
  const [decision, setDecision] = useState(null);

  return (
    <div className="bg-gray-50 rounded-2xl px-4 py-4">
      <div className="flex gap-3.5">
        <div className="w-11 h-11 rounded-full bg-gray-200 flex items-center justify-center text-[12px] font-semibold text-gray-600 shrink-0">
          {item.initials}
        </div>
        <div className="min-w-0">
          <div className="text-[12px] text-gray-500">{item.title}</div>
          <div className="text-[14px] text-gray-900 leading-snug mt-1">{item.text}</div>
        </div>
      </div>
      {decision ? (
        <div className="text-[12px] text-gray-400 mt-3 ml-[58px]">
          {decision === 'accepted' ? 'Accepted — they can message you now' : 'Declined'}
        </div>
      ) : (
        <div className="flex gap-2.5 mt-3 ml-[58px]">
          <button
            onClick={() => {
              setDecision('accepted');
              showToast('Chloe can now message you');
            }}
            className="flex-1 bg-gray-900 text-white rounded-full py-2.5 text-[12px] font-semibold hover:bg-gray-800 transition-colors"
          >
            Accept
          </button>
          <button
            onClick={() => {
              setDecision('declined');
              showToast('Message request declined');
            }}
            className="flex-1 border border-gray-200 text-gray-900 rounded-full py-2.5 text-[12px] font-semibold hover:bg-gray-100 transition-colors"
          >
            Decline
          </button>
        </div>
      )}
    </div>
  );
}

// Platform update — icon tile + deep link into the feature.
function UpdateItem({ item }) {
  const navigate = useNavigate();
  const { showToast } = useMainActions();

  return (
    <div className="bg-gray-900 rounded-2xl px-4 py-4 flex gap-3.5 items-start text-white">
      <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
        <Sparkles size={18} strokeWidth={1.75} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[12px] text-gray-400">{item.title}</div>
        <div className="text-[14px] leading-snug mt-1">{item.text}</div>
        <button
          onClick={() =>
            item.to ? navigate(item.to) : showToast('Release notes coming to the console')
          }
          className="flex items-center gap-1 bg-white text-gray-900 rounded-full px-3.5 py-2 text-[12px] font-semibold mt-3 hover:bg-gray-100 transition-colors"
        >
          {item.cta}
          <ChevronRight size={13} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

// Blog post — icon tile + read action.
function BlogItem({ item }) {
  const { showToast } = useMainActions();

  return (
    <button
      onClick={() => showToast('Opening blog post…')}
      className="w-full bg-gray-50 rounded-2xl px-4 py-4 flex gap-3.5 items-start text-left hover:bg-gray-100 transition-colors"
    >
      <div className="w-11 h-11 rounded-xl bg-gray-200 flex items-center justify-center shrink-0">
        <BookOpen size={17} className="text-gray-600" strokeWidth={1.75} />
      </div>
      <div className="min-w-0">
        <div className="text-[12px] text-gray-500">{item.title}</div>
        <div className="text-[14px] font-medium text-gray-900 leading-snug mt-1">{item.text}</div>
        <div className="text-[11px] text-gray-400 mt-1.5">{item.meta} · Read</div>
      </div>
    </button>
  );
}

// Favourite — heart badge.
function FavouriteItem({ item }) {
  return (
    <div className="bg-gray-50 rounded-2xl px-4 py-4 flex gap-3.5">
      <div className="relative shrink-0">
        <div className="w-11 h-11 rounded-full bg-gray-200 flex items-center justify-center text-[12px] font-semibold text-gray-600">
          {item.initials}
        </div>
        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-gray-900 flex items-center justify-center">
          <Heart size={9} className="text-white fill-white" strokeWidth={2} />
        </span>
      </div>
      <div className="min-w-0">
        <div className="text-[12px] text-gray-500">{item.title}</div>
        <div className="text-[14px] text-gray-900 leading-snug mt-1">{item.text}</div>
      </div>
    </div>
  );
}

const ITEM_RENDERERS = {
  'message-request': MessageRequestItem,
  update: UpdateItem,
  blog: BlogItem,
  favourite: FavouriteItem,
};

export default function Alerts() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');

  const filteredGroups = feedGroups
    .map((group) => ({
      ...group,
      items:
        filter === 'All' ? group.items : group.items.filter((item) => item.category === filter),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <>
      <div className="shrink-0 bg-white flex items-center justify-between px-4 h-14">
        <div className="flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="-ml-2 w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100"
            aria-label="Back"
          >
            <ChevronLeft size={22} />
          </button>
          <span className="text-[16px] font-bold text-gray-900 ml-1">Notifications</span>
        </div>
        <button
          onClick={() => navigate('/notifications')}
          className="w-9 h-9 rounded-full bg-gray-900 flex items-center justify-center hover:bg-gray-800"
          aria-label="Notification settings"
        >
          <MoreVertical size={16} className="text-white" />
        </button>
      </div>

      <div className="shrink-0 bg-white px-4 pb-3 flex items-center gap-2 overflow-x-auto">
        {feedFilters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={
              'shrink-0 rounded-full px-3.5 py-2 text-[12px] font-medium transition-colors ' +
              (filter === f ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-500')
            }
          >
            {f}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto bg-white px-4 pb-8">
        {filteredGroups.length === 0 && (
          <div className="flex flex-col items-center text-center pt-16">
            <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mb-3">
              <Check size={18} className="text-gray-400" strokeWidth={1.75} />
            </div>
            <div className="text-[14px] font-medium text-gray-900">Nothing here yet</div>
            <div className="text-[12px] text-gray-400 mt-1">
              {filter} notifications will show up here.
            </div>
          </div>
        )}
        {filteredGroups.map((group) => (
          <div key={group.label}>
            <div className="text-[15px] font-bold text-gray-900 pt-3 pb-3">{group.label}</div>
            <div className="space-y-3">
              {group.items.map((item) => {
                const Renderer = ITEM_RENDERERS[item.kind] || StandardItem;
                return <Renderer key={item.id} item={item} />;
              })}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
