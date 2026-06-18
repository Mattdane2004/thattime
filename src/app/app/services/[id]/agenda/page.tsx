"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Clock, Plus, Trash2 } from "lucide-react";
import { ScreenHeader, Sheet, FieldLabel, fieldInput } from "@/components/ui";
import { useOffersStore } from "@/lib/store/offersStore";
import { nextId } from "@/lib/ids";
import type { ClassAgendaItem, DemoOffer } from "@/lib/data/offers";

const fallbackDates = ["2026-05-14", "2026-05-15", "2026-05-16"];

export default function AgendaModulePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const offer = useOffersStore((s) => s.offers.find((o) => o.id === params.id));
  const updateOffer = useOffersStore((s) => s.updateOffer);
  const [sheetDate, setSheetDate] = useState<string | null>(null);
  const [draft, setDraft] = useState(() => emptyDraft("09:00", "10:00"));

  const sessions = useMemo(() => (offer ? classSessions(offer) : []), [offer]);

  if (!offer) {
    return (
      <div className="flex h-full flex-col bg-surface">
        <ScreenHeader title="Agenda" onBack={() => router.push("/app/services")} border />
        <div className="pt-12 text-center text-[13px] text-muted">Offer not found</div>
      </div>
    );
  }

  const items = offer.agenda ?? [];
  const activeSession = sessions.find((session) => session.date === sheetDate);
  const activeItems = sheetDate ? items.filter((item) => item.date === sheetDate) : [];

  const openAgenda = (date: string, startTime: string, endTime: string) => {
    setDraft(emptyDraft(startTime, endTime));
    setSheetDate(date);
  };

  const addSection = () => {
    if (!sheetDate || !draft.title.trim()) return;
    updateOffer(offer.id, {
      agenda: [
        ...items,
        {
          id: nextId("agenda"),
          date: sheetDate,
          title: draft.title.trim(),
          startTime: draft.startTime,
          endTime: draft.endTime,
          notes: draft.notes.trim(),
        },
      ],
    });
    setDraft(emptyDraft(activeSession?.startTime ?? "09:00", activeSession?.endTime ?? "10:00"));
  };

  const removeSection = (id: string) => {
    updateOffer(offer.id, { agenda: items.filter((item) => item.id !== id) });
  };

  return (
    <div className="flex h-full flex-col bg-surface">
      <ScreenHeader title="Agenda & syllabus" onBack={() => router.push(`/app/services/${offer.id}`)} border />
      <div className="flex-1 overflow-y-auto px-5 pb-6 pt-4">
        <div className="rounded-2xl bg-canvas p-4">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface text-secondary">
              <CalendarDays size={17} strokeWidth={1.75} />
            </span>
            <span>
              <span className="block text-[16px] font-semibold text-navy">Build the class agenda</span>
              <span className="mt-1 block text-[13px] leading-snug text-muted">
                Add modules, breaks, learning outcomes and day-by-day timings.
              </span>
            </span>
          </div>
        </div>

        <div className="space-y-3 pt-5">
          {sessions.map((session, index) => {
            const dayItems = items.filter((item) => item.date === session.date);
            return (
              <section key={session.date} className="overflow-hidden rounded-2xl border border-border bg-surface">
                <div className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
                  <span>
                    <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">Day {index + 1}</span>
                    <span className="block text-[15px] font-semibold text-navy">{formatDate(session.date)}</span>
                    <span className="mt-0.5 block text-[12px] text-muted">{session.startTime}-{session.endTime}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => openAgenda(session.date, session.startTime, session.endTime)}
                    className="flex h-9 items-center gap-1.5 rounded-full bg-navy px-3.5 text-[13px] font-semibold text-white"
                  >
                    <Plus size={15} strokeWidth={1.75} />
                    Add
                  </button>
                </div>

                {dayItems.length === 0 ? (
                  <div className="px-4 py-5 text-[13px] text-muted">No agenda yet for this date.</div>
                ) : (
                  <ol className="divide-y divide-border/60">
                    {dayItems.map((item) => (
                      <li key={item.id} className="flex items-start gap-3 px-4 py-3">
                        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-canvas text-secondary">
                          <Clock size={14} strokeWidth={1.75} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[14px] font-semibold text-navy">{item.title}</span>
                          <span className="block text-[12px] text-muted">{item.startTime}-{item.endTime}</span>
                          {item.notes && <span className="mt-1 block text-[12px] leading-snug text-muted">{item.notes}</span>}
                        </span>
                        <button type="button" onClick={() => removeSection(item.id)} aria-label="Remove section" className="p-1 text-muted hover:text-danger">
                          <Trash2 size={15} />
                        </button>
                      </li>
                    ))}
                  </ol>
                )}
              </section>
            );
          })}
        </div>
      </div>

      <div className="shrink-0 border-t border-border px-5 pb-5 pt-3">
        <button onClick={() => router.push(`/app/services/${offer.id}`)} className="h-12 w-full rounded-full bg-navy text-[15px] font-semibold text-white">
          Done
        </button>
      </div>

      <Sheet
        open={Boolean(sheetDate)}
        onClose={() => setSheetDate(null)}
        title={activeSession ? `${formatDate(activeSession.date)} agenda` : "Agenda"}
        sub={activeSession ? `${activeSession.startTime}-${activeSession.endTime}` : undefined}
        footer={<button onClick={() => setSheetDate(null)} className="h-12 w-full rounded-full bg-navy text-[15px] font-semibold text-white">Done</button>}
      >
        <div className="space-y-5">
          {activeItems.length > 0 && (
            <div>
              <FieldLabel>Sections added</FieldLabel>
              <div className="space-y-2">
                {activeItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 rounded-xl border border-border px-3 py-2.5">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-medium text-navy">{item.title}</span>
                      <span className="block text-[12px] text-muted">{item.startTime}-{item.endTime}</span>
                    </span>
                    <button type="button" onClick={() => removeSection(item.id)} aria-label="Remove section" className="p-1 text-muted hover:text-danger">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-border bg-canvas p-4">
            <div className="pb-4 text-[15px] font-semibold text-navy">Add agenda section</div>
            <div className="space-y-4">
              <label className="block">
                <FieldLabel>Section title</FieldLabel>
                <input
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  placeholder="e.g. Demo and guided practice"
                  className={fieldInput}
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <FieldLabel>Start</FieldLabel>
                  <input type="time" value={draft.startTime} onChange={(e) => setDraft({ ...draft, startTime: e.target.value })} className={fieldInput} />
                </label>
                <label className="block">
                  <FieldLabel>End</FieldLabel>
                  <input type="time" value={draft.endTime} onChange={(e) => setDraft({ ...draft, endTime: e.target.value })} className={fieldInput} />
                </label>
              </div>

              <label className="block">
                <FieldLabel>Notes</FieldLabel>
                <textarea
                  value={draft.notes}
                  onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                  placeholder="Add learning outcomes, break notes or internal prep."
                  rows={4}
                  className="w-full resize-none rounded-xl border border-border bg-surface px-4 py-3 text-[14px] text-navy outline-none placeholder:text-muted focus:border-navy focus:ring-1 focus:ring-navy"
                />
              </label>

              <button
                type="button"
                onClick={addSection}
                disabled={!draft.title.trim()}
                className="h-11 w-full rounded-full bg-navy text-[14px] font-semibold text-white disabled:bg-border disabled:text-muted"
              >
                Add section
              </button>
            </div>
          </div>
        </div>
      </Sheet>
    </div>
  );
}

function emptyDraft(startTime: string, endTime: string): Pick<ClassAgendaItem, "title" | "startTime" | "endTime" | "notes"> {
  return { title: "", startTime, endTime, notes: "" };
}

function classSessions(offer: DemoOffer) {
  const details = offer.classDetails;
  const dates = details?.dates?.length ? details.dates : fallbackDates;
  return dates.map((date) => {
    const time = details?.dateTimes?.[date] ?? { startTime: details?.startTime ?? "09:00", endTime: details?.endTime ?? "10:00" };
    return { date, startTime: time.startTime, endTime: time.endTime };
  });
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short" }).format(new Date(`${date}T00:00:00`));
}
