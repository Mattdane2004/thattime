"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { ScreenHeader } from "@/components/app/ScreenHeader";
import { FieldLabel, fieldInput, Toggle } from "@/components/app/WizardChrome";
import { useTeamStore } from "@/lib/store/teamStore";

// Member schedule — weekly working hours (toggle a day, set start/end) and
// time off. Shifts feed calendar availability and online booking.

export default function MemberSchedulePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const member = useTeamStore((s) => s.members.find((m) => m.id === params.id));
  const setWeeklyDay = useTeamStore((s) => s.setWeeklyDay);
  const addTimeOff = useTeamStore((s) => s.addTimeOff);
  const removeTimeOff = useTeamStore((s) => s.removeTimeOff);

  const [adding, setAdding] = useState(false);
  const [label, setLabel] = useState("Holiday");
  const [date, setDate] = useState("");

  if (!member) {
    return (
      <div className="flex h-full flex-col bg-surface">
        <ScreenHeader title="Schedule" onBack={() => router.push("/app/team")} border />
        <div className="pt-12 text-center text-[13px] text-muted">Team member not found</div>
      </div>
    );
  }

  const hours = member.schedule.weekly
    .filter((d) => d.enabled)
    .reduce((sum, d) => sum + (Number(d.end.slice(0, 2)) - Number(d.start.slice(0, 2))), 0);

  return (
    <div className="flex h-full flex-col bg-surface">
      <ScreenHeader title={`${member.name.split(" ")[0]}'s schedule`} onBack={() => router.push(`/app/team/${member.id}`)} border />
      <div className="flex-1 overflow-y-auto px-4 pb-8 pt-4">
        <div className="rounded-2xl bg-canvas px-4 py-3 text-[13px] text-secondary">
          {hours}h scheduled per week · {member.schedule.timezone}
        </div>

        <div className="mb-2 mt-5 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted">Working hours</div>
        <div className="overflow-hidden rounded-2xl border border-border">
          {member.schedule.weekly.map((d, i) => (
            <div key={d.day} className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? "border-t border-border" : ""}`}>
              <button
                onClick={() => setWeeklyDay(member.id, d.day, { enabled: !d.enabled })}
                className="flex items-center gap-3"
                aria-label={`Toggle ${d.day}`}
              >
                <Toggle on={d.enabled} />
                <span className={`w-10 text-left text-[13px] font-semibold ${d.enabled ? "text-navy" : "text-muted"}`}>{d.day}</span>
              </button>
              {d.enabled ? (
                <div className="flex flex-1 items-center justify-end gap-2">
                  <input
                    type="time"
                    value={d.start}
                    onChange={(e) => setWeeklyDay(member.id, d.day, { start: e.target.value })}
                    className="h-9 rounded-lg bg-canvas px-2 text-[12px] text-navy outline-none focus:ring-1 focus:ring-navy"
                  />
                  <span className="text-[12px] text-muted">–</span>
                  <input
                    type="time"
                    value={d.end}
                    onChange={(e) => setWeeklyDay(member.id, d.day, { end: e.target.value })}
                    className="h-9 rounded-lg bg-canvas px-2 text-[12px] text-navy outline-none focus:ring-1 focus:ring-navy"
                  />
                </div>
              ) : (
                <span className="flex-1 text-right text-[12px] text-muted">Day off</span>
              )}
            </div>
          ))}
        </div>

        <div className="mb-2 mt-5 flex items-center justify-between px-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">Time off</span>
          <button onClick={() => setAdding((v) => !v)} className="flex items-center gap-1 text-[12px] font-semibold text-navy">
            <Plus size={13} />Add
          </button>
        </div>

        {adding && (
          <div className="mb-3 space-y-3 rounded-2xl border border-border p-4">
            <label className="block">
              <FieldLabel>Reason</FieldLabel>
              <div className="flex gap-2">
                {["Holiday", "Sick leave", "Personal", "Training"].map((r) => (
                  <button
                    key={r}
                    onClick={() => setLabel(r)}
                    className={`rounded-full border px-3 py-1.5 text-[12px] font-medium ${
                      label === r ? "border-navy bg-navy text-white" : "border-border text-secondary"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </label>
            <label className="block">
              <FieldLabel>Date</FieldLabel>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={fieldInput} />
            </label>
            <button
              onClick={() => {
                if (!date) return;
                addTimeOff(member.id, {
                  label,
                  date: new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
                });
                setAdding(false);
                setDate("");
              }}
              disabled={!date}
              className="h-11 w-full rounded-full bg-navy text-[13px] font-semibold text-white disabled:bg-border disabled:text-muted"
            >
              Add time off
            </button>
          </div>
        )}

        <div className="space-y-2">
          {member.schedule.timeOff.length === 0 && !adding && (
            <div className="rounded-2xl border border-dashed border-border px-4 py-5 text-center text-[12px] text-muted">
              No time off booked. Time off blocks bookings on those days.
            </div>
          )}
          {member.schedule.timeOff.map((t) => (
            <div key={t.id} className="flex items-center justify-between rounded-2xl border border-border px-4 py-3">
              <span>
                <span className="block text-[13px] font-medium text-navy">{t.label}</span>
                <span className="block text-[12px] text-muted">{t.date}</span>
              </span>
              <button onClick={() => removeTimeOff(member.id, t.id)} aria-label="Remove time off" className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-canvas">
                <X size={15} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
