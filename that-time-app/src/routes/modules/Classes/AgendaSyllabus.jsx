import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { BookOpen, Clock3, Trash2 } from 'lucide-react';
import BottomSheet from '../../../components/BottomSheet';
import ScreenHeader from '../../../components/ScreenHeader';
import { emptyClassDetails } from '../../../data/offerTypes';

const newAgendaId = () => 'ag_' + Math.random().toString(36).slice(2, 9);

export default function AgendaSyllabus() {
  const navigate = useNavigate();
  const { draft, updateDraft } = useOutletContext();
  const details = draft.classDetails || emptyClassDetails();
  const sessions = agendaSessions(details);
  const [editing, setEditing] = useState(null);

  const updateClass = (patch) => updateDraft({ classDetails: { ...details, ...patch } });

  const saveAgendaItems = (sessionId, items) => {
    const nextItems = items
      .filter((item) => item.title?.trim() || item.startTime || item.endTime || item.notes?.trim())
      .map((item) => ({ ...item, id: item.id || newAgendaId() }));

    if (sessionId === 'single') {
      updateClass({
        singleSession: {
          ...details.singleSession,
          agendaItems: nextItems,
        },
      });
      return;
    }

    updateClass({
      courseSessions: (details.courseSessions || []).map((session) =>
        session.id === sessionId ? { ...session, agendaItems: nextItems } : session,
      ),
    });
  };

  const removeAgendaItem = (sessionId, itemId) => {
    if (sessionId === 'single') {
      updateClass({
        singleSession: {
          ...details.singleSession,
          agendaItems: (details.singleSession?.agendaItems || []).filter((item) => item.id !== itemId),
        },
      });
      return;
    }

    updateClass({
      courseSessions: (details.courseSessions || []).map((session) =>
        session.id === sessionId
          ? { ...session, agendaItems: (session.agendaItems || []).filter((item) => item.id !== itemId) }
          : session,
      ),
    });
  };

  return (
    <>
      <ScreenHeader title="Agenda & syllabus" onBack={() => navigate('/class')} />
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-6 space-y-5">
        <div className="rounded-3xl bg-gray-50 p-5">
          <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center mb-4">
            <BookOpen size={20} className="text-gray-800" strokeWidth={1.75} />
          </div>
          <div className="text-[17px] font-semibold text-gray-900">Build the class agenda</div>
          <div className="text-[13px] text-gray-500 mt-1 leading-snug">
            Add modules, breaks, practical work, assessments, or learning outcomes after the class dates are set.
          </div>
        </div>

        {sessions.length === 0 ? (
          <div className="text-center px-6 pt-8">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 mx-auto flex items-center justify-center mb-4">
              <Clock3 size={22} className="text-gray-500" strokeWidth={1.75} />
            </div>
            <div className="text-[17px] font-semibold text-gray-900">Add class dates first</div>
            <div className="text-[14px] text-gray-500 mt-1 leading-snug">
              Once the schedule exists, you can add a timetable to each date.
            </div>
            <button
              onClick={() => navigate('/class/schedule')}
              className="mt-5 h-11 px-5 rounded-full bg-gray-900 text-white text-[14px] font-medium"
            >
              Edit schedule
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session, index) => (
              <section key={session.id} className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white flex flex-col items-center justify-center shrink-0">
                    <span className="text-[10px] text-gray-500">Day</span>
                    <span className="text-[13px] font-semibold text-gray-900">{index + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-semibold text-gray-900 truncate">{session.title}</div>
                    <div className="text-[12px] text-gray-500 mt-0.5 truncate">{session.dateLabel} · {session.time}</div>
                  </div>
                  <button
                    onClick={() => setEditing({ sessionId: session.id })}
                    className="h-9 px-3 rounded-full bg-white text-[12px] font-medium text-gray-700 hover:bg-gray-100"
                  >
                    Add
                  </button>
                </div>

                {(session.agendaItems || []).length === 0 ? (
                  <button
                    onClick={() => setEditing({ sessionId: session.id })}
                    className="w-full px-4 py-5 text-left text-[13px] text-gray-500 hover:bg-gray-50"
                  >
                    No agenda yet. Add intro, lunch, practical blocks, assessment, or wrap-up.
                  </button>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {session.agendaItems.map((item) => (
                      <div key={item.id} className="flex items-start gap-3 px-4 py-3">
                        <button
                          onClick={() => setEditing({ sessionId: session.id })}
                          className="flex-1 text-left min-w-0"
                        >
                          <div className="text-[14px] font-medium text-gray-900 truncate">{item.title || 'Agenda item'}</div>
                          <div className="text-[12px] text-gray-500 mt-0.5 truncate">
                            {timeRange(item)}{item.notes ? ` · ${item.notes}` : ''}
                          </div>
                        </button>
                        <button
                          onClick={() => removeAgendaItem(session.id, item.id)}
                          aria-label="Remove agenda item"
                          className="w-8 h-8 rounded-full flex items-center justify-center text-gray-300 hover:text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 size={15} strokeWidth={1.75} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>
        )}
      </div>

      <div className="px-5 pb-5 pt-3 shrink-0 bg-white border-t border-gray-100">
        <button
          onClick={() => navigate('/class')}
          className="w-full h-12 rounded-full bg-gray-900 hover:bg-gray-800 text-white text-[15px] font-medium transition-colors"
        >
          Done
        </button>
      </div>

      <AgendaSheet
        editing={editing}
        session={sessions.find((session) => session.id === editing?.sessionId)}
        onClose={() => setEditing(null)}
        onSave={(sessionId, items) => {
          saveAgendaItems(sessionId, items);
          setEditing(null);
        }}
      />
    </>
  );
}

function AgendaSheet({ editing, session, onClose, onSave }) {
  const [sections, setSections] = useState([]);

  useEffect(() => {
    if (!editing) return;
    const current = session?.agendaItems || [];
    setSections(current.length ? current : [emptyAgendaSection()]);
  }, [editing, session]);

  if (!editing) return null;

  const updateSection = (id, patch) => {
    setSections((current) => current.map((section) => (
      section.id === id ? { ...section, ...patch } : section
    )));
  };

  const addSection = () => {
    setSections((current) => [...current, emptyAgendaSection()]);
  };

  const removeSection = (id) => {
    setSections((current) => {
      const next = current.filter((section) => section.id !== id);
      return next.length ? next : [emptyAgendaSection()];
    });
  };

  return (
    <BottomSheet
      open={Boolean(editing)}
      onClose={onClose}
      title={session ? `${session.title} agenda` : 'Agenda'}
      footer={
        <button
          onClick={() => onSave(editing.sessionId, sections)}
          className="w-full h-12 rounded-full bg-gray-900 hover:bg-gray-800 text-white text-[15px] font-medium transition-colors"
        >
          Done
        </button>
      }
    >
      <div className="space-y-3">
        <AgendaTimeline session={session} sections={sections} />

        {sections.map((section, index) => (
          <div key={section.id} className="rounded-2xl bg-gray-50 p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-[12px] font-semibold text-gray-900 shrink-0">
                {index + 1}
              </div>
              <input
                value={section.title}
                onChange={(event) => updateSection(section.id, { title: event.target.value })}
                placeholder="Section title"
                className="flex-1 min-w-0 bg-transparent outline-none text-[15px] font-medium text-gray-900 placeholder:text-gray-400"
              />
              <button
                onClick={() => removeSection(section.id)}
                aria-label="Remove agenda section"
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-300 hover:text-rose-600 hover:bg-white"
              >
                <Trash2 size={15} strokeWidth={1.75} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="time"
                value={section.startTime}
                onChange={(event) => updateSection(section.id, { startTime: event.target.value })}
                className="h-11 rounded-xl bg-white px-3 text-[14px] outline-none focus:bg-gray-100"
              />
              <input
                type="time"
                value={section.endTime}
                onChange={(event) => updateSection(section.id, { endTime: event.target.value })}
                className="h-11 rounded-xl bg-white px-3 text-[14px] outline-none focus:bg-gray-100"
              />
            </div>

            <textarea
              value={section.notes}
              onChange={(event) => updateSection(section.id, { notes: event.target.value })}
              rows={2}
              placeholder="Notes"
              className="w-full rounded-xl bg-white px-3 py-2 text-[13px] outline-none resize-none focus:bg-gray-100 placeholder:text-gray-400"
            />
          </div>
        ))}

        <button
          onClick={addSection}
          className="w-full h-11 rounded-full border border-dashed border-gray-300 text-[14px] font-medium text-gray-700 hover:bg-gray-50"
        >
          Add section
        </button>
      </div>
    </BottomSheet>
  );
}

function AgendaTimeline({ session, sections }) {
  const { startTime, endTime } = timelineBounds(session);
  const startMinutes = minutesFromTime(startTime) ?? 0;
  const endMinutes = minutesFromTime(endTime) ?? startMinutes + 60;
  const totalMinutes = Math.max(1, endMinutes - startMinutes);
  const blocks = sections
    .map((section, index) => {
      const start = minutesFromTime(section.startTime);
      const end = minutesFromTime(section.endTime);
      if (start == null || end == null || end <= start) return null;

      const left = clamp(((start - startMinutes) / totalMinutes) * 100, 0, 100);
      const right = clamp(((end - startMinutes) / totalMinutes) * 100, 0, 100);
      const width = Math.max(4, right - left);
      return {
        id: section.id,
        index,
        left: Math.min(left, 100 - width),
        width,
      };
    })
    .filter(Boolean);

  return (
    <div className="pt-1 pb-2">
      <div className="flex items-center justify-between px-0.5">
        <span className="text-[21px] leading-none font-medium text-gray-400 tracking-normal">{startTime}</span>
        <span className="text-[21px] leading-none font-medium text-gray-400 tracking-normal">{endTime}</span>
      </div>
      <div className="relative h-4 mt-2" aria-hidden="true">
        <div className="absolute left-0 right-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-gray-200" />
        {blocks.map((block) => (
          <div
            key={block.id}
            className="absolute top-1/2 h-2 -translate-y-1/2 rounded-full bg-gray-400"
            style={{ left: `${block.left}%`, width: `${block.width}%` }}
          />
        ))}
      </div>
    </div>
  );
}

function emptyAgendaSection() {
  return {
    id: newAgendaId(),
    title: '',
    startTime: '',
    endTime: '',
    notes: '',
  };
}

function agendaSessions(details) {
  const course = (details.courseSessions || []).filter((session) => session.date);
  if (course.length) {
    return course.map((session) => ({
      id: session.id,
      title: session.moduleName || formatDate(session.date),
      dateLabel: formatDate(session.date),
      startTime: session.startTime || '09:00',
      endTime: session.endTime || '10:00',
      time: `${session.startTime || '09:00'}-${session.endTime || '10:00'}`,
      agendaItems: session.agendaItems || [],
    }));
  }

  const single = details.singleSession || {};
  const date = single.date || single.firstDate;
  if (!date) return [];
  return [{
    id: 'single',
    title: single.title || formatDate(date),
    dateLabel: formatDate(date),
    startTime: single.startTime || '09:00',
    endTime: single.endTime || '10:00',
    time: `${single.startTime || '09:00'}-${single.endTime || '10:00'}`,
    agendaItems: single.agendaItems || [],
  }];
}

function formatDate(value) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return 'Class date';
  return new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }).format(date);
}

function timeRange(item) {
  if (item.startTime && item.endTime) return `${item.startTime}-${item.endTime}`;
  if (item.startTime) return item.startTime;
  return 'No time set';
}

function timelineBounds(session) {
  if (!session) return { startTime: '09:00', endTime: '10:00' };
  if (session.startTime && session.endTime) {
    return { startTime: session.startTime, endTime: session.endTime };
  }

  const [startTime, endTime] = (session.time || '').split('-');
  return {
    startTime: startTime || '09:00',
    endTime: endTime || '10:00',
  };
}

function minutesFromTime(value) {
  if (!value) return null;
  const [hours, minutes] = value.split(':').map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  return hours * 60 + minutes;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
