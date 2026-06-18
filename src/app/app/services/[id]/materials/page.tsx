"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, FileText, Plus, Trash2, Upload } from "lucide-react";
import { ScreenHeader, Sheet, FieldLabel, fieldInput } from "@/components/ui";
import { useOffersStore } from "@/lib/store/offersStore";
import { nextId } from "@/lib/ids";
import type { ClassMaterial } from "@/lib/data/offers";

const materialTypes: { value: ClassMaterial["type"]; label: string }[] = [
  { value: "pdf", label: "PDF / handout" },
  { value: "pre_read", label: "Pre-read" },
  { value: "preparation", label: "Preparation" },
  { value: "course_structure", label: "Course structure" },
  { value: "other", label: "Other" },
];

const accessOptions: { value: ClassMaterial["access"]; label: string; desc: string }[] = [
  { value: "before_booking", label: "Before booking", desc: "Visible before students reserve a place." },
  { value: "after_booking", label: "After booking / payment", desc: "Shared once their place is confirmed." },
  { value: "internal", label: "Internal only", desc: "Only visible to your team." },
];

export default function MaterialsModulePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const offer = useOffersStore((s) => s.offers.find((o) => o.id === params.id));
  const updateOffer = useOffersStore((s) => s.updateOffer);
  const [editingId, setEditingId] = useState<string | null>(null);

  if (!offer) {
    return (
      <div className="flex h-full flex-col bg-surface">
        <ScreenHeader title="Materials" onBack={() => router.push("/app/services")} border />
        <div className="pt-12 text-center text-[13px] text-muted">Offer not found</div>
      </div>
    );
  }

  const materials = offer.materials ?? [];
  const editing = materials.find((item) => item.id === editingId);

  const updateMaterials = (next: ClassMaterial[]) => updateOffer(offer.id, { materials: next });
  const updateMaterial = (id: string, patch: Partial<ClassMaterial>) => {
    updateMaterials(materials.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };
  const removeMaterial = (id: string) => {
    updateMaterials(materials.filter((item) => item.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const addMaterial = () => {
    const item: ClassMaterial = {
      id: nextId("mat"),
      title: "Class preparation guide",
      attachTo: "Whole class",
      type: "preparation",
      access: "after_booking",
      notes: "",
      fileName: "class-preparation-guide.pdf",
    };
    updateMaterials([...materials, item]);
    setEditingId(item.id);
  };

  return (
    <div className="flex h-full flex-col bg-surface">
      <ScreenHeader
        title="Course materials"
        onBack={() => router.push(`/app/services/${offer.id}`)}
        border
        rightAction={materials.length > 0 ? (
          <button onClick={addMaterial} aria-label="Add material" className="flex h-9 w-9 items-center justify-center rounded-full bg-navy text-white">
            <Plus size={16} strokeWidth={2} />
          </button>
        ) : undefined}
      />

      <div className="flex-1 overflow-y-auto px-5 pb-6 pt-4">
        <button onClick={addMaterial} className="flex w-full items-start gap-3 rounded-2xl bg-canvas p-4 text-left">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface text-secondary">
            <Upload size={18} strokeWidth={1.75} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[16px] font-semibold text-navy">Upload student materials</span>
            <span className="mt-1 block text-[13px] leading-snug text-muted">Add PDFs, pre-reads, preparation guides and after-class resources.</span>
            <span className="mt-3 inline-flex h-9 items-center rounded-full bg-navy px-4 text-[13px] font-semibold text-white">Upload files</span>
          </span>
        </button>

        {materials.length === 0 ? (
          <div className="flex flex-col items-center px-6 pt-16 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-canvas">
              <BookOpen size={28} className="text-muted" strokeWidth={1.5} />
            </span>
            <div className="mt-4 text-[16px] font-semibold text-navy">No materials yet</div>
            <div className="mt-1 text-[13px] leading-snug text-muted">Upload the files students or staff need before, during or after the class.</div>
          </div>
        ) : (
          <div className="space-y-2 pt-5">
            {materials.map((item) => (
              <button key={item.id} onClick={() => setEditingId(item.id)} className="flex w-full items-center gap-3 rounded-2xl border border-border px-4 py-3 text-left">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-canvas text-secondary">
                  <FileText size={16} strokeWidth={1.75} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-semibold text-navy">{item.title}</span>
                  <span className="block truncate text-[12px] text-muted">{materialLabel(item.type)} · {accessLabel(item.access)}</span>
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); removeMaterial(item.id); }}
                  aria-label="Remove material"
                  className="p-1 text-muted hover:text-danger"
                >
                  <Trash2 size={15} />
                </button>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-border px-5 pb-5 pt-3">
        <button onClick={() => router.push(`/app/services/${offer.id}`)} className="h-12 w-full rounded-full bg-navy text-[15px] font-semibold text-white">
          Done
        </button>
      </div>

      <Sheet
        open={Boolean(editing)}
        onClose={() => setEditingId(null)}
        title="Edit material"
        sub={editing?.fileName}
        footer={<button onClick={() => setEditingId(null)} className="h-12 w-full rounded-full bg-navy text-[15px] font-semibold text-white">Done</button>}
      >
        {editing && (
          <div className="space-y-5">
            <label className="block">
              <FieldLabel>Title</FieldLabel>
              <input value={editing.title} onChange={(e) => updateMaterial(editing.id, { title: e.target.value })} className={fieldInput} />
            </label>

            <label className="block">
              <FieldLabel>Attach to</FieldLabel>
              <input value={editing.attachTo} onChange={(e) => updateMaterial(editing.id, { attachTo: e.target.value })} className={fieldInput} />
            </label>

            <div>
              <FieldLabel>Material type</FieldLabel>
              <div className="grid grid-cols-2 gap-2">
                {materialTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => updateMaterial(editing.id, { type: type.value })}
                    className={`min-h-11 rounded-xl border px-3 py-2 text-left text-[13px] font-semibold ${
                      editing.type === type.value ? "border-navy bg-navy text-white" : "border-border bg-canvas text-navy"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <FieldLabel>Access</FieldLabel>
              <div className="space-y-2">
                {accessOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => updateMaterial(editing.id, { access: option.value })}
                    className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left ${
                      editing.access === option.value ? "border-navy bg-canvas" : "border-border"
                    }`}
                  >
                    <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${editing.access === option.value ? "border-navy" : "border-muted"}`}>
                      {editing.access === option.value && <span className="h-2 w-2 rounded-full bg-navy" />}
                    </span>
                    <span>
                      <span className="block text-[14px] font-semibold text-navy">{option.label}</span>
                      <span className="block text-[12px] leading-snug text-muted">{option.desc}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <label className="block">
              <FieldLabel>Notes</FieldLabel>
              <textarea
                value={editing.notes}
                onChange={(e) => updateMaterial(editing.id, { notes: e.target.value })}
                placeholder="Add notes about how this material should be used."
                rows={4}
                className="w-full resize-none rounded-xl border border-border bg-canvas px-4 py-3 text-[14px] text-navy outline-none placeholder:text-muted focus:border-navy focus:ring-1 focus:ring-navy"
              />
            </label>

            <div className="rounded-xl border border-border px-4 py-3">
              <FieldLabel>Uploaded file</FieldLabel>
              <div className="flex items-center gap-3">
                <FileText size={16} className="text-secondary" />
                <span className="min-w-0 flex-1 truncate text-[14px] font-medium text-navy">{editing.fileName}</span>
              </div>
            </div>
          </div>
        )}
      </Sheet>
    </div>
  );
}

function materialLabel(type: ClassMaterial["type"]) {
  return materialTypes.find((item) => item.value === type)?.label ?? "Material";
}

function accessLabel(access: ClassMaterial["access"]) {
  return accessOptions.find((item) => item.value === access)?.label ?? "Access not set";
}
