"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Plus, Check, Trash2, Search, MessageCircleQuestion, Package } from "lucide-react";
import { Sheet, Toggle } from "@/components/ui";
import { productsCatalog, productCategories } from "@/lib/data/products";
import { useOffersStore } from "@/lib/store/offersStore";
import { nextId } from "@/lib/ids";
import type { DemoOffer, ProductPref, PrefProduct } from "@/lib/data/offers";

const catName = (id: string) => productsCatalog.find((p) => p.id === id)?.name ?? "";
const catProduct = (id: string) => productsCatalog.find((p) => p.id === id);

export default function ProductsModulePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const offer = useOffersStore((s) => s.offers.find((o) => o.id === params.id));
  const updateOffer = useOffersStore((s) => s.updateOffer);
  const [view, setView] = useState<"list" | "edit">("list");
  const [draft, setDraft] = useState<ProductPref | null>(null);
  const [picking, setPicking] = useState(false);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);

  if (!offer) {
    return (
      <div className="flex h-full flex-col bg-surface">
        <Header title="Product preferences" onBack={() => router.push("/app/services")} />
        <div className="pt-12 text-center text-[13px] text-muted">Offer not found</div>
      </div>
    );
  }

  if (offer.type === "class") {
    return (
      <ClassKitModule
        offer={offer}
        onBack={() => router.push(`/app/services/${offer.id}`)}
        updateOffer={updateOffer}
      />
    );
  }

  const base = Number(offer.price) || 0;
  const prefs = offer.productPrefs ?? [];
  const setPrefs = (next: ProductPref[]) => updateOffer(offer.id, { productPrefs: next });
  const newPref = () => { setDraft({ id: nextId("pref"), question: "", selectMode: "single", required: true, products: [] }); setPicking(false); setView("edit"); };
  const editPref = (p: ProductPref) => { setDraft({ ...p, products: p.products.map((x) => ({ ...x })) }); setPicking(false); setView("edit"); };
  const savePref = () => { if (!draft || !draft.products.length) return; setPrefs([...prefs.filter((p) => p.id !== draft.id), draft]); setView("list"); setDraft(null); };
  const removePref = (id: string) => setPrefs(prefs.filter((p) => p.id !== id));

  // ---- Edit (setup) ----
  if (view === "edit" && draft) {
    const setD = (patch: Partial<ProductPref>) => setDraft({ ...draft, ...patch });
    const toggleProduct = (id: string) =>
      setD({ products: draft.products.some((p) => p.id === id) ? draft.products.filter((p) => p.id !== id) : [...draft.products, { id, price: "" }] });

    if (picking) {
      const groups = productCategories.map((c) => ({ c, items: productsCatalog.filter((p) => p.category === c) })).filter((g) => g.items.length);
      return (
        <div className="flex h-full flex-col bg-surface">
          <Header title="Product preferences" sub={offer.name} onBack={() => setPicking(false)} />
          <div className="px-4 pb-2 pt-1">
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input placeholder="Search your product catalog" disabled className="h-11 w-full rounded-xl border border-border bg-canvas pl-10 pr-4 text-[14px] text-muted outline-none" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-4 pb-6">
            {groups.map((g) => (
              <div key={g.c} className="pb-3">
                <p className="px-1 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-wider text-muted">{g.c}</p>
                <div className="space-y-2">
                  {g.items.map((p) => {
                    const on = draft.products.some((x) => x.id === p.id);
                    return (
                      <button key={p.id} onClick={() => toggleProduct(p.id)} className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left ${on ? "border-navy" : "border-border"}`}>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[14px] font-medium text-navy">{p.name}</span>
                          <span className="block text-[12px] text-muted">£{p.basePrice} catalog price</span>
                        </span>
                        <span className={`flex h-7 w-7 items-center justify-center rounded-md ${on ? "bg-navy text-white" : "border-2 border-border"}`}>{on && <Check size={15} strokeWidth={3} />}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="shrink-0 border-t border-border px-5 pb-5 pt-3">
            <button onClick={() => setPicking(false)} className="h-12 w-full rounded-full bg-navy text-[15px] font-semibold text-white">Done{draft.products.length ? ` · ${draft.products.length} selected` : ""}</button>
          </div>
        </div>
      );
    }

    const editing = draft.products.find((p) => p.id === editingProduct);
    return (
      <div className="flex h-full flex-col bg-surface">
        <Header title="Product preferences" sub={offer.name} onBack={() => { setView("list"); setDraft(null); }} />
        <div className="flex-1 space-y-5 overflow-y-auto px-5 pb-8 pt-3">
          <label className="block">
            <FieldLabel>Question shown to client</FieldLabel>
            <input value={draft.question} onChange={(e) => setD({ question: e.target.value })} placeholder="e.g. Which oil would you like?"
              className="h-12 w-full rounded-xl border border-border bg-canvas px-4 text-[14px] text-navy outline-none placeholder:text-muted focus:border-navy focus:ring-1 focus:ring-navy" />
          </label>

          <div>
            <FieldLabel>Selection type</FieldLabel>
            <div className="flex rounded-xl border border-border bg-canvas p-1">
              {([["single", "Single select"], ["multi", "Multi-select"]] as const).map(([v, l]) => (
                <button key={v} onClick={() => setD({ selectMode: v })} className={`flex-1 rounded-lg py-2 text-[13px] font-semibold ${draft.selectMode === v ? "bg-white text-navy shadow-card" : "text-secondary"}`}>{l}</button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <FieldLabel>Products</FieldLabel>
              {draft.products.length > 0 && <button onClick={() => setPicking(true)} className="pb-2 text-[13px] font-medium text-navy">Edit selection</button>}
            </div>
            {draft.products.length === 0 ? (
              <button onClick={() => setPicking(true)} className="flex h-14 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border text-[14px] font-medium text-navy">
                <Plus size={16} /> Choose products from catalog
              </button>
            ) : (
              <div className="space-y-2">
                {draft.products.map((p) => {
                  const cp = catProduct(p.id);
                  return (
                    <div key={p.id} className="flex items-center gap-3 rounded-2xl border border-border px-4 py-3">
                      <span className="min-w-0 flex-1">
                        <span className="block text-[14px] font-medium text-navy">{cp?.name}</span>
                        <span className="block text-[12px] text-muted">{cp?.category} · catalog £{cp?.basePrice}</span>
                      </span>
                      <button onClick={() => setEditingProduct(p.id)} className="flex shrink-0 items-center gap-1 text-[13px] font-medium text-muted">
                        {p.price ? `+£${p.price}` : "Included"}<ChevronRight size={15} />
                      </button>
                      <button onClick={() => setD({ products: draft.products.filter((x) => x.id !== p.id) })} aria-label="Remove" className="shrink-0 text-muted hover:text-danger"><Trash2 size={15} /></button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <button onClick={() => setD({ required: !draft.required })} className="flex w-full items-center justify-between text-left">
            <span>
              <span className="block text-[15px] font-semibold text-navy">Required</span>
              <span className="block text-[12px] text-muted">Client must pick {draft.selectMode === "single" ? "one" : "at least one"}</span>
            </span>
            <Toggle on={draft.required} />
          </button>

          {draft.products.length > 0 && (
            <div className="rounded-2xl border border-border bg-canvas p-4">
              <p className="pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">Client preview</p>
              <p className="pb-3 text-[15px] font-semibold text-navy">{draft.question || "Your question text"}</p>
              <div className="space-y-2.5">
                {draft.products.map((p) => (
                  <div key={p.id} className="flex items-center gap-3">
                    <span className={`h-5 w-5 shrink-0 border-2 border-border ${draft.selectMode === "single" ? "rounded-full" : "rounded-md"}`} />
                    <span className="flex-1 text-[14px] text-navy">{catName(p.id)}</span>
                    {p.price ? <span className="text-[13px] text-muted">+£{p.price}</span> : null}
                  </div>
                ))}
              </div>
              <p className="pt-3 text-[12px] text-muted">{draft.selectMode === "single" ? "Choose one" : "Choose any"}{draft.required ? " · required" : ""}</p>
            </div>
          )}
        </div>
        <div className="flex shrink-0 gap-3 border-t border-border px-5 py-4">
          <button onClick={() => { setView("list"); setDraft(null); }} className="h-12 flex-1 rounded-full border border-border bg-surface text-[15px] font-semibold text-navy hover:bg-canvas">Back</button>
          <button onClick={savePref} disabled={!draft.products.length} className="h-12 flex-1 rounded-full bg-navy text-[15px] font-semibold text-white disabled:bg-border disabled:text-muted">Add</button>
        </div>

        <ProductSheet open={Boolean(editing)} product={editing} onClose={() => setEditingProduct(null)}
          onSave={(price, durationMin) => { if (editing) setD({ products: draft.products.map((x) => (x.id === editing.id ? { ...x, price, durationMin } : x)) }); setEditingProduct(null); }} />
      </div>
    );
  }

  // ---- List / empty ----
  return (
    <div className="flex h-full flex-col bg-surface">
      <Header title="Product preferences" sub={offer.name} onBack={() => router.push(`/app/services/${offer.id}`)}
        action={prefs.length > 0 ? <button onClick={newPref} className="flex h-9 items-center gap-1.5 rounded-full bg-navy px-3.5 text-[13px] font-semibold text-white"><Plus size={15} strokeWidth={1.75} />Add</button> : undefined} />
      <div className="flex-1 overflow-y-auto px-4 pb-8">
        {prefs.length === 0 ? (
          <div className="flex flex-col items-center px-6 pt-20 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-canvas"><MessageCircleQuestion size={28} className="text-muted" strokeWidth={1.5} /></span>
            <div className="mt-4 text-[16px] font-semibold text-navy">No product preferences yet</div>
            <div className="mt-1 text-[13px] text-muted">Ask clients to choose products — like which oil for a treatment.</div>
            <button onClick={newPref} className="mt-5 inline-flex h-11 items-center gap-1.5 rounded-full bg-navy px-5 text-[14px] font-semibold text-white"><Plus size={16} strokeWidth={1.75} />Set up products</button>
          </div>
        ) : (
          <div className="space-y-2 pt-2">
            {prefs.map((p) => {
              const cat = catProduct(p.products[0]?.id)?.category ?? "Products";
              const hasPrice = p.products.some((x) => x.price);
              const minAdd = Math.min(...p.products.map((x) => Number(x.price) || 0));
              const priceLabel = hasPrice ? `from £${base + minAdd}` : "Included";
              return (
                <button key={p.id} onClick={() => editPref(p)} className="flex w-full items-center gap-3 rounded-2xl border border-border px-4 py-3 text-left">
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14px] font-semibold text-navy">{p.question || cat}</span>
                    <span className="block truncate text-[12px] text-muted">{p.products.length} options · {p.selectMode === "single" ? "Single" : "Multi"} select · {p.required ? "Required" : "Preference only"}</span>
                  </span>
                  <span className="shrink-0 text-right text-[14px] font-semibold text-navy">{priceLabel}</span>
                  <button onClick={(e) => { e.stopPropagation(); removePref(p.id); }} aria-label="Remove" className="shrink-0 text-muted hover:text-danger"><Trash2 size={15} /></button>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function ClassKitModule({
  offer,
  onBack,
  updateOffer,
}: {
  offer: DemoOffer;
  onBack: () => void;
  updateOffer: (id: string, patch: Partial<DemoOffer>) => void;
}) {
  const [draft, setDraft] = useState("");
  const kitItems = offer.kitItems ?? [];

  const addItem = () => {
    const item = draft.trim();
    if (!item) return;
    updateOffer(offer.id, { kitItems: [...kitItems, item] });
    setDraft("");
  };
  const removeItem = (index: number) => updateOffer(offer.id, { kitItems: kitItems.filter((_, i) => i !== index) });

  return (
    <div className="flex h-full flex-col bg-surface">
      <Header title="Equipment & what to bring" sub={offer.name} onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-5 pb-6">
        <div className="rounded-2xl bg-canvas p-4">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface text-secondary">
              <Package size={19} strokeWidth={1.75} />
            </span>
            <span>
              <span className="block text-[16px] font-semibold text-navy">Kit, PPE and student items</span>
              <span className="mt-1 block text-[13px] leading-snug text-muted">List what students need to bring, what is supplied, or what the team should prepare.</span>
            </span>
          </div>

          <div className="mt-4 flex gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addItem()}
              placeholder="e.g. Scissors, hair net, apron"
              className="h-12 min-w-0 flex-1 rounded-xl border border-border bg-surface px-4 text-[14px] text-navy outline-none placeholder:text-muted focus:border-navy focus:ring-1 focus:ring-navy"
            />
            <button
              type="button"
              onClick={addItem}
              disabled={!draft.trim()}
              className="h-12 shrink-0 rounded-xl bg-navy px-4 text-[14px] font-semibold text-white disabled:bg-border disabled:text-muted"
            >
              Add kit
            </button>
          </div>
        </div>

        {kitItems.length === 0 ? (
          <div className="flex flex-col items-center px-6 pt-16 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-canvas">
              <Package size={28} className="text-muted" strokeWidth={1.5} />
            </span>
            <div className="mt-4 text-[16px] font-semibold text-navy">No kit items yet</div>
            <div className="mt-1 text-[13px] leading-snug text-muted">Add student kit, PPE, products or tools once they matter for this class.</div>
          </div>
        ) : (
          <div className="space-y-2 pt-5">
            {kitItems.map((item, index) => (
              <div key={`${item}-${index}`} className="flex items-center gap-3 rounded-2xl border border-border px-4 py-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-canvas text-[12px] font-semibold text-secondary">{index + 1}</span>
                <span className="min-w-0 flex-1 text-[14px] font-medium text-navy">{item}</span>
                <button onClick={() => removeItem(index)} aria-label="Remove kit item" className="p-1 text-muted hover:text-danger">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="shrink-0 border-t border-border px-5 pb-5 pt-3">
        <button onClick={onBack} className="h-12 w-full rounded-full bg-navy text-[15px] font-semibold text-white">
          Done
        </button>
      </div>
    </div>
  );
}

// ---- Per-product price + duration sheet (Figma 40962) ----------------------

function ProductSheet({ open, product, onClose, onSave }: { open: boolean; product?: PrefProduct; onClose: () => void; onSave: (price: string, durationMin?: number) => void }) {
  const cp = product ? catProduct(product.id) : undefined;
  const [mode, setMode] = useState<"included" | "add">(product?.price ? "add" : "included");
  const [amount, setAmount] = useState(product?.price ?? "");
  const [adjust, setAdjust] = useState(Boolean(product?.durationMin));
  const [dur, setDur] = useState(String(product?.durationMin ?? ""));

  const [seen, setSeen] = useState<string | null>(null);
  if (open && product && seen !== product.id) {
    setSeen(product.id); setMode(product.price ? "add" : "included"); setAmount(product.price ?? ""); setAdjust(Boolean(product.durationMin)); setDur(String(product.durationMin ?? ""));
  }
  if (!open && seen) setSeen(null);

  return (
    <Sheet open={open} onClose={onClose} title={cp?.name ?? ""} sub={cp ? `${cp.category} · catalog £${cp.basePrice}` : undefined}
      footer={<button onClick={() => onSave(mode === "add" ? amount || "0" : "", adjust ? Number(dur) || undefined : undefined)} className="h-12 w-full rounded-full bg-navy text-[15px] font-semibold text-white">Save</button>}>
      <div className="flex flex-col gap-5">
        <div>
          <FieldLabel>Price</FieldLabel>
          <div className="mb-2 flex rounded-xl border border-border bg-canvas p-1">
            {([["included", "Included"], ["add", "+ £"]] as const).map(([v, l]) => (
              <button key={v} onClick={() => setMode(v)} className={`flex-1 rounded-lg py-2 text-[13px] font-semibold ${mode === v ? "bg-white text-navy shadow-card" : "text-secondary"}`}>{l}</button>
            ))}
          </div>
          {mode === "add" && (
            <div className="flex items-center rounded-xl border border-border bg-canvas px-4">
              <span className="text-[15px] text-muted">£</span>
              <input type="number" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" className="h-12 flex-1 bg-transparent px-2 text-[15px] font-semibold text-navy outline-none placeholder:font-normal placeholder:text-muted" />
              <span className="text-[13px] text-muted">extra</span>
            </div>
          )}
        </div>
        <div>
          <div className="flex items-center justify-between">
            <span>
              <span className="block text-[15px] font-semibold text-navy">Adjust Duration</span>
              <span className="block text-[12px] text-muted">Add more time for this product</span>
            </span>
            <button type="button" onClick={() => setAdjust(!adjust)}><Toggle on={adjust} /></button>
          </div>
          {adjust && (
            <div className="mt-2 flex items-baseline rounded-xl border border-border bg-canvas px-4 py-3">
              <input type="number" inputMode="numeric" value={dur} onChange={(e) => setDur(e.target.value)} placeholder="0" className="w-full bg-transparent text-[16px] font-semibold text-navy outline-none placeholder:font-normal placeholder:text-muted" />
              <span className="text-[12px] text-muted">min extra</span>
            </div>
          )}
        </div>
      </div>
    </Sheet>
  );
}

function Header({ title, onBack, sub, action }: { title: string; onBack: () => void; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="flex h-16 items-center justify-between px-5">
      <div className="flex items-center">
        <button type="button" aria-label="Back" onClick={onBack} className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full text-navy hover:bg-canvas"><ChevronLeft size={22} /></button>
        <span className="ml-1">
          <span className="block text-[17px] font-semibold leading-tight text-navy">{title}</span>
          {sub ? <span className="block text-[11px] text-muted">{sub}</span> : null}
        </span>
      </div>
      {action}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="mb-2 block text-[13px] font-medium text-secondary">{children}</span>;
}
