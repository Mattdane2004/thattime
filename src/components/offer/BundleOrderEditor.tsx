"use client";

import { useState } from "react";
import { Reorder, useDragControls } from "framer-motion";
import {
  GripVertical, Scissors, MoreVertical, ArrowUp, ArrowDown,
  Link2, Clock, CalendarDays, ArrowDownToLine,
} from "lucide-react";
import { Sheet } from "@/components/ui";
import type { DemoOffer } from "@/lib/data/offers";
import { backToBack, syncBundleLinks, type BundleLink, type BundleLinkKind } from "@/lib/store/wizardStore";
import { estimateBundle, bundleTimelineLabel, fmtDuration, serviceDuration } from "@/lib/data/bundles";

// Shared "Order & gaps" editor (Figma 12231-52864) used by both the creation
// wizard (on the draft) and the dashboard order route (on the saved offer).
// `links[i]` is the after-config of `serviceIds[i]`: how it connects to the
// next service — back-to-back, an extra-time gap, linked (concurrent), or a
// separate-day booking. Drag to reorder (framer Reorder) or use the per-service
// sheet's move up/down.

const arrayMove = <T,>(arr: T[], from: number, to: number): T[] => {
  const next = arr.slice();
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
};

const priceLabel = (o: DemoOffer | undefined) => (!o ? "—" : o.price === "0" ? "Free" : `£${o.price}`);
const metaLabel = (o: DemoOffer | undefined) => `${fmtDuration(serviceDuration(o))} · ${priceLabel(o)}`;

export function BundleOrderEditor({
  serviceIds,
  links,
  offers,
  onChange,
}: {
  serviceIds: string[];
  links: BundleLink[];
  offers: DemoOffer[];
  onChange: (serviceIds: string[], links: BundleLink[]) => void;
}) {
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const est = estimateBundle(serviceIds, links, offers);
  const offerOf = (id: string) => offers.find((o) => o.id === id);

  // Drag reorder — links follow their service, then re-validate the tail.
  const handleReorder = (newIds: string[]) => {
    const newLinks = newIds.map((id) => links[serviceIds.indexOf(id)] ?? backToBack());
    onChange(newIds, syncBundleLinks(newIds, newLinks));
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= serviceIds.length) return;
    const ids = arrayMove(serviceIds, from, to);
    const lks = arrayMove(links, from, to);
    onChange(ids, syncBundleLinks(ids, lks));
    setEditIndex(to);
  };

  const setKind = (i: number, kind: BundleLinkKind) => {
    const link: BundleLink = { kind };
    if (kind === "gap") link.gapMin = links[i]?.gapMin ?? 30;
    if (kind === "separate") link.gapDays = links[i]?.gapDays ?? 1;
    onChange(serviceIds, syncBundleLinks(serviceIds, links.map((l, idx) => (idx === i ? link : l))));
  };

  const patchLink = (i: number, patch: Partial<BundleLink>) =>
    onChange(serviceIds, links.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));

  return (
    <>
      {/* Estimated timeline */}
      <div className="mb-5 rounded-2xl bg-canvas px-4 py-3.5">
        <div className="text-[12px] text-muted">Estimated bundle timeline</div>
        <div className="mt-0.5 text-[24px] font-bold tracking-tight text-navy">{bundleTimelineLabel(est)}</div>
      </div>

      <Reorder.Group axis="y" values={serviceIds} onReorder={handleReorder} className="list-none">
        {serviceIds.map((id, i) => (
          <OrderRow
            key={id}
            id={id}
            offer={offerOf(id)}
            link={links[i]}
            prevLink={i > 0 ? links[i - 1] : undefined}
            onEdit={() => setEditIndex(i)}
          />
        ))}
      </Reorder.Group>

      {editIndex !== null && serviceIds[editIndex] && (
        <LinkSheet
          index={editIndex}
          isLast={editIndex === serviceIds.length - 1}
          isFirst={editIndex === 0}
          total={serviceIds.length}
          name={offerOf(serviceIds[editIndex])?.name ?? "Service"}
          nextName={offerOf(serviceIds[editIndex + 1])?.name}
          link={links[editIndex] ?? backToBack()}
          onClose={() => setEditIndex(null)}
          onMove={(dir) => move(editIndex, editIndex + dir)}
          onKind={(k) => setKind(editIndex, k)}
          onPatch={(p) => patchLink(editIndex, p)}
        />
      )}
    </>
  );
}

// Timeline for the bundle dashboard Overview (Figma 12231-53053).
// Pass `onEdit` to make each row tappable (shows a 3-dot); omit for read-only.
export function BundleTimeline({
  serviceIds, links, offers, onEdit,
}: {
  serviceIds: string[];
  links: BundleLink[];
  offers: DemoOffer[];
  onEdit?: (index: number) => void;
}) {
  const est = estimateBundle(serviceIds, links, offers);
  const offerOf = (id: string) => offers.find((o) => o.id === id);
  return (
    <>
      <div className="mb-3 rounded-2xl bg-surface px-4 py-3">
        <div className="text-[12px] text-muted">Estimated bundle timeline</div>
        <div className="mt-0.5 text-[22px] font-bold tracking-tight text-navy">{bundleTimelineLabel(est)}</div>
      </div>
      {serviceIds.map((id, i) => {
        const linkedBelow = links[i]?.kind === "linked";
        const linkedAbove = i > 0 && links[i - 1]?.kind === "linked";
        const grouped = linkedBelow || linkedAbove;
        const offer = offerOf(id);
        return (
          <div key={`${id}-${i}`}>
            <div className="flex items-stretch gap-2.5">
              <div className={`w-1 shrink-0 ${grouped ? "bg-navy/30" : "bg-transparent"} ${linkedAbove ? "" : "rounded-t-full"} ${linkedBelow ? "" : "rounded-b-full"}`} />
              <div className="flex flex-1 items-center gap-2.5 rounded-2xl bg-surface px-2.5 py-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-canvas text-muted">
                  <GripVertical size={16} />
                </span>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-canvas">
                  <Scissors size={15} className="text-navy" strokeWidth={1.75} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-semibold text-navy">{offer?.name ?? "Service"}</span>
                  <span className="block text-[12px] text-muted">{metaLabel(offer)}</span>
                </span>
                {onEdit && (
                  <button
                    type="button"
                    aria-label="Edit order and timing"
                    onClick={() => onEdit(i)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-muted hover:bg-canvas"
                  >
                    <MoreVertical size={16} />
                  </button>
                )}
              </div>
            </div>
            <Connector link={links[i]} linkedAbove={linkedAbove} />
          </div>
        );
      })}
    </>
  );
}

// ── Row + connector ─────────────────────────────────────────────────────────

function OrderRow({
  id, offer, link, prevLink, onEdit,
}: {
  id: string;
  offer: DemoOffer | undefined;
  link: BundleLink | undefined;
  prevLink: BundleLink | undefined;
  onEdit: () => void;
}) {
  const controls = useDragControls();
  const linkedBelow = link?.kind === "linked";
  const linkedAbove = prevLink?.kind === "linked";
  const grouped = linkedBelow || linkedAbove;

  return (
    <Reorder.Item value={id} dragListener={false} dragControls={controls} className="list-none">
      <div className="flex items-stretch gap-2.5">
        {/* Grouping rail — continuous accent across linked services */}
        <div
          className={`w-1 shrink-0 ${grouped ? "bg-navy/30" : "bg-transparent"} ${
            linkedAbove ? "" : "rounded-t-full"
          } ${linkedBelow ? "" : "rounded-b-full"}`}
        />
        <div className="flex flex-1 items-center gap-2.5 rounded-2xl bg-canvas px-2.5 py-2.5">
          <button
            type="button"
            aria-label="Drag to reorder"
            onPointerDown={(e) => controls.start(e)}
            className="flex h-9 w-9 shrink-0 cursor-grab touch-none items-center justify-center rounded-xl bg-surface text-muted active:cursor-grabbing"
          >
            <GripVertical size={16} />
          </button>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface">
            <Scissors size={15} className="text-navy" strokeWidth={1.75} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[14px] font-semibold text-navy">{offer?.name ?? "Service"}</span>
            <span className="block text-[12px] text-muted">{metaLabel(offer)}</span>
          </span>
          <button
            type="button"
            aria-label="Edit order and timing"
            onClick={onEdit}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-muted hover:bg-surface"
          >
            <MoreVertical size={16} />
          </button>
        </div>
      </div>
      <Connector link={link} linkedAbove={linkedAbove} />
    </Reorder.Item>
  );
}

/**
 * Connector rendered below a row, describing `link` (what happens after it).
 * `linkedAbove` means this row is the LAST in a linked group, so the "Linked"
 * caption drops in below it (Figma 12231-52864). A `linked` connector instead
 * bridges the rail unbroken to the next service.
 */
function Connector({ link, linkedAbove }: { link: BundleLink | undefined; linkedAbove: boolean }) {
  const kind = link?.kind ?? "back_to_back";

  // This row runs concurrently with the next — keep the rail solid and the gap
  // tight so the linked pair reads as one unit.
  if (kind === "linked") {
    return (
      <div className="flex items-stretch gap-2.5">
        <div className="w-1 shrink-0 bg-navy/30" />
        <div className="h-1.5 flex-1" />
      </div>
    );
  }

  // Sits just below the final service of a linked group.
  const linkedCaption = linkedAbove ? (
    <div className="flex items-center gap-1.5 pb-0.5 pl-3.5 pt-1">
      <Link2 size={12} className="text-navy" />
      <span className="text-[12px] font-medium text-secondary">Linked · runs at the same time</span>
    </div>
  ) : null;

  if (kind === "gap") {
    return (
      <>
        {linkedCaption}
        <div className="flex items-center gap-2.5 py-3 pl-3.5">
          <span className="flex flex-col gap-[3px]">
            {[0, 1, 2].map((d) => <span key={d} className="h-1 w-1 rounded-full bg-border" />)}
          </span>
          <span className="text-[12px] font-medium text-secondary">{fmtDuration(link?.gapMin ?? 0)} extra time</span>
        </div>
      </>
    );
  }
  if (kind === "separate") {
    return (
      <>
        {linkedCaption}
        <div className="flex items-center gap-3 py-4">
          <span className="h-px flex-1 bg-border" />
          <span className="rounded-full bg-canvas px-2.5 py-0.5 text-[11px] font-semibold text-secondary">
            {link?.gapDays ?? 1}-day gap · new booking
          </span>
          <span className="h-px flex-1 bg-border" />
        </div>
      </>
    );
  }
  // back_to_back — unlinked neighbours, give them clear breathing room.
  return <>{linkedCaption}<div className="h-4" /></>;
}

// ── Per-service editor sheet ─────────────────────────────────────────────────

const KIND_OPTS: { key: BundleLinkKind; label: string; desc: string; icon: typeof Clock }[] = [
  { key: "back_to_back", label: "Back-to-back", desc: "The next service runs straight after.", icon: ArrowDownToLine },
  { key: "gap", label: "Add time", desc: "Leave a break before the next service.", icon: Clock },
  { key: "linked", label: "Link", desc: "Performed at the same time as the next service.", icon: Link2 },
  { key: "separate", label: "Separate day", desc: "Booked as a separate appointment, days later.", icon: CalendarDays },
];

const GAP_CHIPS = [15, 30, 45, 60, 90];
const DAY_CHIPS = [1, 2, 3, 7];

export function LinkSheet({
  index, isFirst, isLast, total, name, nextName, link, onClose, onMove, onKind, onPatch,
}: {
  index: number;
  isFirst: boolean;
  isLast: boolean;
  total: number;
  name: string;
  nextName?: string;
  link: BundleLink;
  onClose: () => void;
  onMove: (dir: -1 | 1) => void;
  onKind: (k: BundleLinkKind) => void;
  onPatch: (p: Partial<BundleLink>) => void;
}) {
  // The last row has no following service — only a trailing buffer makes sense.
  const opts = isLast ? KIND_OPTS.filter((o) => o.key === "back_to_back" || o.key === "gap") : KIND_OPTS;

  const footer = (
    <button onClick={onClose} className="h-12 w-full rounded-full bg-navy text-[15px] font-semibold text-white">Done</button>
  );

  return (
    <Sheet open onClose={onClose} title={name} sub={`Service ${index + 1} of ${total}`} footer={footer}>
      {/* Reorder */}
      <div className="mb-5 flex gap-3">
        <button
          onClick={() => onMove(-1)}
          disabled={isFirst}
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-surface text-[14px] font-semibold text-navy disabled:opacity-40"
        >
          <ArrowUp size={16} /> Move up
        </button>
        <button
          onClick={() => onMove(1)}
          disabled={isLast}
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-surface text-[14px] font-semibold text-navy disabled:opacity-40"
        >
          <ArrowDown size={16} /> Move down
        </button>
      </div>

      <div className="mb-2 text-[13px] font-medium text-secondary">
        {isLast ? "After this service" : nextName ? `Before “${nextName}”` : "Before the next service"}
      </div>
      <div className="space-y-2">
        {opts.map(({ key, label, desc, icon: Icon }) => {
          const on = link.kind === key;
          return (
            <button
              key={key}
              onClick={() => onKind(key)}
              className={`flex w-full items-center gap-3 rounded-2xl border px-3.5 py-3 text-left ${on ? "border-navy bg-navy/5" : "border-border"}`}
            >
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${on ? "bg-navy text-white" : "bg-canvas text-secondary"}`}>
                <Icon size={16} strokeWidth={1.75} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-semibold text-navy">{label}</span>
                <span className="block text-[12px] text-muted">{desc}</span>
              </span>
              <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${on ? "bg-navy" : "border-2 border-border"}`}>
                {on && <span className="h-2 w-2 rounded-full bg-white" />}
              </span>
            </button>
          );
        })}
      </div>

      {link.kind === "gap" && (
        <div className="mt-5">
          <div className="mb-2 text-[13px] font-medium text-secondary">Extra time</div>
          <div className="flex flex-wrap gap-2">
            {GAP_CHIPS.map((m) => (
              <button
                key={m}
                onClick={() => onPatch({ gapMin: m })}
                className={`rounded-full px-3.5 py-2 text-[13px] font-medium ${(link.gapMin ?? 30) === m ? "bg-navy text-white" : "bg-canvas text-secondary"}`}
              >
                {fmtDuration(m)}
              </button>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-border bg-canvas px-4">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              step={5}
              value={link.gapMin ?? 30}
              onChange={(e) => onPatch({ gapMin: Math.max(0, Number(e.target.value) || 0) })}
              className="h-12 flex-1 bg-transparent text-[15px] font-semibold text-navy outline-none"
            />
            <span className="text-[14px] text-muted">minutes</span>
          </div>
        </div>
      )}

      {link.kind === "separate" && (
        <div className="mt-5">
          <div className="mb-2 text-[13px] font-medium text-secondary">Days between bookings</div>
          <div className="flex flex-wrap gap-2">
            {DAY_CHIPS.map((d) => (
              <button
                key={d}
                onClick={() => onPatch({ gapDays: d })}
                className={`rounded-full px-3.5 py-2 text-[13px] font-medium ${(link.gapDays ?? 1) === d ? "bg-navy text-white" : "bg-canvas text-secondary"}`}
              >
                {d} day{d > 1 ? "s" : ""}
              </button>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-border bg-canvas px-4">
            <input
              type="number"
              inputMode="numeric"
              min={1}
              value={link.gapDays ?? 1}
              onChange={(e) => onPatch({ gapDays: Math.max(1, Number(e.target.value) || 1) })}
              className="h-12 flex-1 bg-transparent text-[15px] font-semibold text-navy outline-none"
            />
            <span className="text-[14px] text-muted">days later</span>
          </div>
        </div>
      )}
    </Sheet>
  );
}
