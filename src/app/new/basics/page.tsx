"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Search, Plus } from "lucide-react";
import { ScreenHeader, Sheet } from "@/components/ui";
import { WizardFooter, WizardTitle, FieldLabel, fieldInput, TOTAL_STEPS } from "@/components/ui";
import { useWizardStore } from "@/lib/store/wizardStore";
import { useCategoriesStore } from "@/lib/store/categoriesStore";
import { categorySwatches, tintFromHex } from "@/lib/tokens/categories";
import { serviceIcons, iconCategories, iconFor } from "@/lib/data/serviceIcons";
import type { OfferType } from "@/lib/types";

// Wizard step 1 — "The basics" (Figma 12216:32064): tappable icon, name,
// category row, description. The icon opens the Icons sheet; the category row
// opens the Category sheet (with a "New category" sub-sheet).

const HINTS: Record<OfferType, { hint: string; placeholder: string }> = {
  service: { hint: "Give this service a name and a category.", placeholder: "e.g. Classic haircut" },
  class: { hint: "Give this class or course a name and a category.", placeholder: "e.g. Beginner yoga" },
  bundle: { hint: "Give this bundle a name and a category.", placeholder: "e.g. Cut + colour package" },
  subscription: { hint: "Give this membership a name and a category.", placeholder: "e.g. Monthly cuts membership" },
};

export default function BasicsPage() {
  const router = useRouter();
  const draft = useWizardStore((s) => s.draft);
  const updateDraft = useWizardStore((s) => s.updateDraft);
  const categories = useCategoriesStore((s) => s.categories);

  const [iconSheet, setIconSheet] = useState(false);
  const [catSheet, setCatSheet] = useState(false);

  const type = draft.type ?? "service";
  const meta = HINTS[type];
  const selectedCat = categories.find((c) => c.name === draft.category);
  const accent = selectedCat?.color ?? "#9CA3AF";
  const Icon = iconFor(draft.icon);
  const canContinue = Boolean(draft.name.trim() && draft.category);

  const onContinue = () => {
    if (!canContinue) return;
    if (type === "subscription") router.push("/new/subscription-type");
    else if (type === "bundle") router.push("/new/bundle-services");
    else if (type === "class") router.push("/new/class-participants");
    else router.push("/new/locations");
  };

  return (
    <>
      <ScreenHeader onClose={() => router.push("/app/hub")} rightAction={<span className="text-[13px] text-muted">Help</span>} />
      <div className="flex-1 overflow-y-auto px-5">
        <WizardTitle title="The basics" subtitle={meta.hint} />

        <div className="space-y-5 pb-6">
          <div>
            <FieldLabel>Icon</FieldLabel>
            <button
              type="button"
              onClick={() => setIconSheet(true)}
              className="flex items-center gap-4 text-left"
            >
              <span
                className="flex h-14 w-14 items-center justify-center rounded-2xl"
                style={{ backgroundColor: tintFromHex(accent, 0.16) }}
              >
                <Icon size={24} style={{ color: accent }} strokeWidth={1.75} />
              </span>
              <span className="text-[14px] font-medium text-secondary">Tap to change icon</span>
            </button>
          </div>

          <label className="block">
            <FieldLabel>Name</FieldLabel>
            <input
              value={draft.name}
              onChange={(e) => updateDraft({ name: e.target.value })}
              placeholder={meta.placeholder}
              className={fieldInput}
            />
          </label>

          <div>
            <FieldLabel>Category</FieldLabel>
            <button
              type="button"
              onClick={() => setCatSheet(true)}
              className={`${fieldInput} flex items-center justify-between`}
            >
              {selectedCat ? (
                <span className="flex items-center gap-2 text-navy">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: selectedCat.color }} />
                  {selectedCat.name}
                </span>
              ) : (
                <span className="text-muted">Choose a category</span>
              )}
              <ChevronRight size={18} className="text-muted" />
            </button>
          </div>

          <label className="block">
            <FieldLabel>Description</FieldLabel>
            <textarea
              value={draft.description}
              onChange={(e) => updateDraft({ description: e.target.value })}
              placeholder="Short description shown to clients"
              rows={4}
              className="w-full resize-none rounded-xl border border-border bg-canvas px-4 py-3 text-[14px] text-navy outline-none placeholder:text-muted focus:ring-1 focus:ring-navy"
            />
          </label>
        </div>
      </div>

      <WizardFooter
        step={1}
        total={TOTAL_STEPS[type]}
        onBack={() => router.push("/new/type")}
        onNext={onContinue}
        disabled={!canContinue}
      />

      <IconSheet
        open={iconSheet}
        current={draft.icon}
        accent={accent}
        onClose={() => setIconSheet(false)}
        onSave={(icon) => {
          updateDraft({ icon });
          setIconSheet(false);
        }}
      />

      <CategorySheet
        open={catSheet}
        selected={draft.category}
        onClose={() => setCatSheet(false)}
        onSelect={(name) => updateDraft({ category: name })}
      />
    </>
  );
}

// ---- Icons sheet -----------------------------------------------------------

function IconSheet({
  open,
  current,
  accent,
  onClose,
  onSave,
}: {
  open: boolean;
  current: string;
  accent: string;
  onClose: () => void;
  onSave: (icon: string) => void;
}) {
  const [picked, setPicked] = useState(current);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<string>("All");

  // Re-sync the local pick whenever the sheet is (re)opened.
  const [seenOpen, setSeenOpen] = useState(false);
  if (open && !seenOpen) {
    setSeenOpen(true);
    setPicked(current);
    setQuery("");
    setFilter("All");
  }
  if (!open && seenOpen) setSeenOpen(false);

  const q = query.trim().toLowerCase();
  const visible = serviceIcons.filter((i) => {
    if (filter !== "All" && !i.cats.includes(filter)) return false;
    if (q && !i.label.toLowerCase().includes(q)) return false;
    return true;
  });
  const Preview = iconFor(picked);

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Icons"
      footer={
        <button
          type="button"
          onClick={() => onSave(picked)}
          className="h-12 w-full rounded-full bg-navy text-[15px] font-semibold text-white"
        >
          Save
        </button>
      }
    >
      <div className="flex flex-col gap-4">
        <span
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{ backgroundColor: tintFromHex(accent, 0.16) }}
        >
          <Preview size={26} style={{ color: accent }} strokeWidth={1.75} />
        </span>

        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for icon"
            className="h-11 w-full rounded-xl border border-border bg-white pl-10 pr-4 text-[14px] text-navy outline-none placeholder:text-muted focus:ring-1 focus:ring-navy"
          />
        </div>

        <div className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-1">
          {iconCategories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setFilter(c)}
              className={`shrink-0 rounded-full px-4 py-2 text-[13px] font-medium ${
                filter === c ? "bg-navy text-white" : "bg-canvas text-secondary"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div>
          <p className="pb-2 text-[13px] font-medium text-secondary">Choose an icon</p>
          {visible.length === 0 ? (
            <p className="py-6 text-center text-[13px] text-muted">No icons match “{query}”.</p>
          ) : (
            <div className="grid grid-cols-5 gap-2.5">
              {visible.map(({ key, label, Icon }) => {
                const on = picked === key;
                return (
                  <button
                    key={key}
                    type="button"
                    aria-label={label}
                    onClick={() => setPicked(key)}
                    className={`flex aspect-square items-center justify-center rounded-2xl border-2 ${
                      on ? "border-navy bg-canvas" : "border-transparent bg-canvas"
                    }`}
                  >
                    <Icon size={20} className="text-navy" strokeWidth={1.75} />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Sheet>
  );
}

// ---- Category sheet (+ New category sub-sheet) -----------------------------

function CategorySheet({
  open,
  selected,
  onClose,
  onSelect,
}: {
  open: boolean;
  selected: string;
  onClose: () => void;
  onSelect: (name: string) => void;
}) {
  const categories = useCategoriesStore((s) => s.categories);
  const addCategory = useCategoriesStore((s) => s.addCategory);
  const [query, setQuery] = useState("");
  const [newSheet, setNewSheet] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState(categorySwatches[0]);

  const q = query.trim().toLowerCase();
  const visible = categories.filter((c) => !q || c.name.toLowerCase().includes(q));

  const createCategory = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    addCategory({ name: trimmed, color });
    onSelect(trimmed);
    setName("");
    setColor(categorySwatches[0]);
    setNewSheet(false);
  };

  return (
    <>
      <Sheet
        open={open}
        onClose={onClose}
        title="Category"
        footer={
          <button
            type="button"
            onClick={onClose}
            className="h-12 w-full rounded-full bg-navy text-[15px] font-semibold text-white"
          >
            Done
          </button>
        }
      >
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search categories…"
              className="h-11 w-full rounded-xl border border-border bg-canvas pl-10 pr-4 text-[14px] text-navy outline-none placeholder:text-muted focus:ring-1 focus:ring-navy"
            />
          </div>

          <div className="overflow-hidden rounded-2xl bg-canvas">
            {visible.map((cat, i) => {
              const on = selected === cat.name;
              return (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => onSelect(cat.name)}
                  className={`flex w-full items-center gap-3 px-4 py-3.5 text-left ${
                    i > 0 ? "border-t border-border/60" : ""
                  }`}
                >
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className={`flex-1 text-[15px] ${on ? "font-semibold text-navy" : "text-navy"}`}>{cat.name}</span>
                  {on && <span className="h-2 w-2 rounded-full bg-navy" />}
                </button>
              );
            })}
            {visible.length === 0 && (
              <p className="px-4 py-6 text-center text-[13px] text-muted">No categories match “{query}”.</p>
            )}
          </div>

          <button
            type="button"
            onClick={() => setNewSheet(true)}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border text-[14px] font-medium text-navy"
          >
            <Plus size={16} /> New category
          </button>
        </div>
      </Sheet>

      <Sheet
        open={newSheet}
        onClose={() => setNewSheet(false)}
        title="New category"
        footer={
          <button
            type="button"
            onClick={createCategory}
            disabled={!name.trim()}
            className="h-12 w-full rounded-full bg-navy text-[15px] font-semibold text-white disabled:opacity-40"
          >
            Add category
          </button>
        }
      >
        <div className="flex flex-col gap-5">
          <label className="block">
            <FieldLabel>Name</FieldLabel>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Spa & wellness"
              className={fieldInput}
              autoFocus
            />
          </label>

          <div>
            <FieldLabel>Colour</FieldLabel>
            <div className="flex flex-wrap gap-3">
              {categorySwatches.map((sw) => (
                <button
                  key={sw}
                  type="button"
                  aria-label={`Colour ${sw}`}
                  onClick={() => setColor(sw)}
                  className={`h-9 w-9 rounded-full ${color === sw ? "ring-2 ring-navy ring-offset-2" : ""}`}
                  style={{ backgroundColor: sw }}
                />
              ))}
            </div>
          </div>
        </div>
      </Sheet>
    </>
  );
}
