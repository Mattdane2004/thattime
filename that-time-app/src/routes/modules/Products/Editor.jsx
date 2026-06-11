import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams, useOutletContext } from 'react-router-dom';
import { Plus, Trash2, ChevronRight } from 'lucide-react';
import ScreenHeader from '../../../components/ScreenHeader';
import AddAnotherSheet from '../../../components/AddAnotherSheet';
import OptionSheet from './OptionSheet';
import { productsCatalog } from '../../../data/demoProductsCatalog';
import { offerBasePath } from '../../routeBase';

const STAGED_KEY = '__stagedProductPicker';

const emptyOption = (productId) => ({
  productId,
  priceMode: 'included',
  priceAmount: '',
  durationMode: 'same',
  durationAdd: '',
});

const statusChipFor = (opt) => {
  const hasPrice = opt.priceMode === 'add' && opt.priceAmount !== '';
  const hasDur = opt.durationMode === 'add' && opt.durationAdd !== '';
  if (!hasPrice && !hasDur) return { text: 'Included', empty: true };
  const parts = [];
  if (hasPrice) parts.push(`+£${opt.priceAmount}`);
  if (hasDur) parts.push(`+${opt.durationAdd} min`);
  return { text: parts.join(' · '), empty: false };
};

const requiredHelper = (selectionType, required) => {
  if (selectionType === 'single') return required ? 'Client must pick one' : 'Client can skip';
  return required ? 'Client must pick at least one' : 'Client can skip entirely';
};

export default function ProductsEditor() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { draft, updateDraft } = useOutletContext();
  const isNew = id === 'new';
  const existing = isNew ? null : (draft.products || []).find((p) => p.id === id);
  const basePath = offerBasePath(draft, location);

  const [question, setQuestion] = useState(existing?.question || '');
  const [selectionType, setSelectionType] = useState(existing?.selectionType || 'single');
  const [required, setRequired] = useState(existing?.required ?? true);
  const [options, setOptions] = useState(existing?.options || []);
  const [showSaved, setShowSaved] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);

  // Pull staged selections back from picker
  useEffect(() => {
    const raw = sessionStorage.getItem(STAGED_KEY);
    if (!raw) return;
    try {
      const ids = JSON.parse(raw);
      const existingIds = new Set(options.map((o) => o.productId));
      const newOptions = ids.map((pid) => {
        const found = options.find((o) => o.productId === pid);
        return found || emptyOption(pid);
      });
      if (newOptions.length !== options.length || newOptions.some((o) => !existingIds.has(o.productId))) {
        setOptions(newOptions);
      }
      sessionStorage.removeItem(STAGED_KEY);
    } catch {
      sessionStorage.removeItem(STAGED_KEY);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openPicker = () => {
    sessionStorage.setItem(STAGED_KEY, JSON.stringify(options.map((o) => o.productId)));
    navigate(`${basePath}/products/picker`);
  };

  const updateOption = (productId, patch) =>
    setOptions((prev) => prev.map((o) => (o.productId === productId ? { ...o, ...patch } : o)));

  const removeOption = (productId, e) => {
    e?.stopPropagation();
    setOptions((prev) => prev.filter((o) => o.productId !== productId));
  };

  const blankForm = () => {
    setQuestion('');
    setSelectionType('single');
    setRequired(true);
    setOptions([]);
  };

  const save = () => {
    const record = { id: existing?.id || crypto.randomUUID(), question, selectionType, required, options };
    const list = isNew
      ? [...(draft.products || []), record]
      : (draft.products || []).map((p) => (p.id === id ? record : p));
    updateDraft({ products: list });
    if (isNew) {
      setShowSaved(true);
    } else {
      navigate(`${basePath}/products`);
    }
  };

  const remove = () => {
    updateDraft({ products: (draft.products || []).filter((p) => p.id !== id) });
    navigate(`${basePath}/products`);
  };

  const addAnother = () => {
    blankForm();
    setShowSaved(false);
  };

  const done = () => {
    setShowSaved(false);
    navigate(`${basePath}/products`);
  };

  const canSave = question.trim() && options.length > 0;
  const editingOption = options.find((o) => o.productId === editingProductId);

  return (
    <>
      <ScreenHeader title={isNew ? 'New product question' : 'Edit product question'} onBack={() => navigate(`${basePath}/products`)} />
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-6 space-y-6">

        {/* Question */}
        <div>
          <div className="text-[13px] font-medium text-gray-700 mb-2">Question shown to client</div>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g. Which oil would you like?"
            className="w-full bg-gray-50 rounded-2xl px-4 py-3.5 text-[15px] outline-none placeholder:text-gray-300"
          />
        </div>

        {/* Selection type */}
        <div>
          <div className="text-[13px] font-medium text-gray-700 mb-2">Selection type</div>
          <div className="grid grid-cols-2 gap-2 bg-gray-50 rounded-2xl p-1">
            {[{ k: 'single', label: 'Single select' }, { k: 'multi', label: 'Multi-select' }].map((t) => (
              <button
                key={t.k}
                onClick={() => setSelectionType(t.k)}
                className={'py-2.5 rounded-xl text-[14px] font-medium transition-colors ' + (selectionType === t.k ? 'bg-white text-gray-900' : 'text-gray-500')}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Products section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-[13px] font-medium text-gray-700">Products</div>
            <button
              onClick={openPicker}
              className="text-[13px] font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              {options.length > 0 ? 'Edit selection' : 'Choose from catalog'}
            </button>
          </div>
          {options.length === 0 ? (
            <button
              onClick={openPicker}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-dashed border-gray-200 text-[14px] text-gray-500 hover:bg-gray-50 transition-colors"
            >
              <Plus size={15} strokeWidth={2} />
              Choose products from catalog
            </button>
          ) : (
            <div className="space-y-2">
              {options.map((opt) => {
                const product = productsCatalog.find((p) => p.id === opt.productId);
                if (!product) return null;
                const chip = statusChipFor(opt);
                return (
                  <div key={opt.productId} className="flex items-center bg-gray-50 rounded-2xl">
                    <button
                      onClick={() => setEditingProductId(opt.productId)}
                      className="flex-1 flex items-center gap-3 p-4 text-left hover:bg-gray-100 rounded-2xl transition-colors min-w-0"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-[14px] font-medium text-gray-900 truncate">{product.name}</div>
                        <div className="text-[12px] text-gray-500 mt-0.5 truncate">
                          {product.category} · catalog £{product.basePrice}
                        </div>
                      </div>
                      <div className={'text-[13px] font-medium shrink-0 ' + (chip.empty ? 'text-gray-400' : 'text-gray-900')}>
                        {chip.text}
                      </div>
                      <ChevronRight size={15} className="text-gray-300 shrink-0" strokeWidth={2} />
                    </button>
                    <button
                      onClick={() => removeOption(opt.productId)}
                      className="text-gray-400 hover:text-gray-600 transition-colors p-3 pr-4"
                      aria-label="Remove"
                    >
                      <Trash2 size={14} strokeWidth={1.75} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Required toggle */}
        <div className="flex items-center justify-between py-1">
          <div>
            <div className="text-[15px] text-gray-900">Required</div>
            <div className="text-[13px] text-gray-500 mt-0.5">{requiredHelper(selectionType, required)}</div>
          </div>
          <button
            onClick={() => setRequired((v) => !v)}
            className={'w-10 rounded-full transition-colors ' + (required ? 'bg-gray-900' : 'bg-gray-200')}
            style={{ height: '22px' }}
          >
            <div className={'w-4 h-4 rounded-full bg-white shadow-sm mx-0.5 transition-transform ' + (required ? 'translate-x-5' : 'translate-x-0')} />
          </button>
        </div>

        {/* Client preview */}
        {options.length > 0 && (
          <ClientPreview
            question={question}
            selectionType={selectionType}
            required={required}
            options={options}
          />
        )}

        {!isNew && (
          <button onClick={remove} className="w-full text-[14px] text-red-500 py-2 hover:text-red-600 transition-colors">
            Delete product question
          </button>
        )}
      </div>

      <div className="px-5 pb-5 pt-3 shrink-0 bg-white border-t border-gray-100">
        <button
          onClick={save}
          disabled={!canSave}
          className={'w-full h-12 rounded-full text-[15px] font-medium transition-colors ' + (canSave ? 'bg-gray-900 hover:bg-gray-800 text-white' : 'bg-gray-100 text-gray-400')}
        >
          Save
        </button>
      </div>

      <OptionSheet
        open={!!editingProductId}
        option={editingOption}
        onClose={() => setEditingProductId(null)}
        onSave={(patch) => updateOption(editingProductId, patch)}
      />

      <AddAnotherSheet open={showSaved} onAddAnother={addAnother} onDone={done} label="product question" />
    </>
  );
}

function ClientPreview({ question, selectionType, required, options }) {
  const helperText =
    selectionType === 'single'
      ? required ? 'Choose one' : 'Optional — choose one or skip'
      : required ? 'Choose one or more' : 'Optional — you can skip';

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
      <div className="px-4 pt-3 pb-2 flex items-center justify-between bg-gray-50">
        <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest">Client preview</div>
      </div>
      <div className="px-4 py-4">
        <div className="text-[15px] font-semibold text-gray-900 mb-3">
          {question || 'Your question text'}
        </div>
        <div className="space-y-2">
          {options.map((opt) => {
            const product = productsCatalog.find((p) => p.id === opt.productId);
            if (!product) return null;
            const hasPrice = opt.priceMode === 'add' && opt.priceAmount !== '';
            const hasDur = opt.durationMode === 'add' && opt.durationAdd !== '';
            return (
              <div key={opt.productId} className="flex items-center gap-3 py-1">
                <div className={'w-5 h-5 shrink-0 border-2 border-gray-300 ' + (selectionType === 'single' ? 'rounded-full' : 'rounded')} />
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] text-gray-900 truncate">{product.name}</div>
                  {hasDur && (
                    <div className="text-[11px] text-gray-500 mt-0.5">+{opt.durationAdd} min</div>
                  )}
                </div>
                {hasPrice && (
                  <div className="text-[13px] font-medium text-gray-700 shrink-0">+£{opt.priceAmount}</div>
                )}
              </div>
            );
          })}
        </div>
        <div className="text-[11px] text-gray-400 mt-3 pt-3 border-t border-gray-100">{helperText}</div>
      </div>
    </div>
  );
}
