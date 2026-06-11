import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext, useSearchParams } from 'react-router-dom';
import { ImageIcon, ChevronRight } from 'lucide-react';
import ScreenHeader from '../../components/ScreenHeader';
import HelpTrigger from '../../components/HelpTrigger';
import WizardFooter from '../../components/WizardFooter';
import TextField from '../../components/TextField';
import Toggle from '../../components/Toggle';
import IconSheet from '../sheets/IconSheet';
import NewCategorySheet from '../sheets/NewCategorySheet';
import CategorySheet from '../sheets/CategorySheet';
import { tintFromHex } from '../../data/categories';
import { serviceIconByName, ICON_WEIGHT } from '../../data/serviceIcons';
import { basicsNextFor, emptyClassDetails, offerTypeMeta, wizardTotalFor, wizardTotalForDraft } from '../../data/offerTypes';

export default function Basics() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { draft, updateDraft, categories } = useOutletContext();
  const queryType = searchParams.get('type');
  const meta = offerTypeMeta(draft.type);
  const isClass = draft.type === 'class';
  const isSubscription = draft.type === 'subscription';
  const details = draft.classDetails || emptyClassDetails();
  const privateListing = details.visibilityMode !== 'marketplace' || Boolean(details.visibility?.hidden);
  const canContinue = Boolean(draft.name.trim() && draft.category);
  const [iconSheetOpen, setIconSheetOpen] = useState(false);
  const [newCategoryOpen, setNewCategoryOpen] = useState(false);
  const [categorySheetOpen, setCategorySheetOpen] = useState(false);
  const activeCategory = categories.find((c) => c.name === draft.category);

  useEffect(() => {
    if (queryType && queryType !== draft.type) updateDraft({ type: queryType });
  }, [draft.type, queryType, updateDraft]);

  const updateClass = (patch) =>
    updateDraft({ classDetails: { ...details, ...patch } });

  const setPrivateListing = (privateOn) => {
    updateClass({
      visibilityMode: privateOn ? 'private_link' : 'marketplace',
      visibility: { ...(details.visibility || {}), hidden: privateOn },
    });
  };

  return (
    <>
      <ScreenHeader title="" onBack={isSubscription ? () => navigate('/new/subscription-type') : undefined} onClose={isSubscription ? undefined : () => navigate('/services')} rightAction={<HelpTrigger helpKey="basics" />} />
      <div className="flex-1 overflow-y-auto px-5">
        <div className="pt-2 pb-6">
          <div className="text-[26px] leading-tight font-semibold tracking-tight">The basics</div>
          <div className="text-[14px] text-gray-500 mt-1">
            {meta.basicsHint}
          </div>
        </div>

        <div className="space-y-6 pb-6">
          {(() => {
            const SavedIcon = draft.iconKey?.name ? serviceIconByName[draft.iconKey.name] : null;
            const tintBg = activeCategory ? tintFromHex(activeCategory.color, 0.14) : undefined;
            const iconColor = activeCategory ? activeCategory.color : undefined;
            return (
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIconSheetOpen(true)}
                  className="w-16 h-16 rounded-2xl flex items-center justify-center transition-colors"
                  style={{ backgroundColor: tintBg || '#F3F4F6' }}
                >
                  {SavedIcon ? (
                    <SavedIcon size={28} weight={ICON_WEIGHT} color={iconColor || '#111827'} />
                  ) : (
                    <ImageIcon size={20} className="text-gray-500" strokeWidth={1.75} />
                  )}
                </button>
                <div className="text-[13px] text-gray-500">Tap to change icon</div>
              </div>
            );
          })()}

          <TextField
            label="Name"
            value={draft.name}
            onChange={(v) => updateDraft({ name: v })}
            placeholder={meta.namePlaceholder}
          />

          <div>
            <div className="text-[13px] font-medium text-gray-700 mb-2">Category</div>
            <button
              onClick={() => setCategorySheetOpen(true)}
              className="w-full flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3.5 text-left hover:bg-gray-100 transition-colors"
            >
              {activeCategory ? (
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: activeCategory.color || '#94a3b8' }}
                />
              ) : null}
              <span
                className={
                  'flex-1 text-[15px] truncate ' +
                  (activeCategory ? 'text-gray-900' : 'text-gray-400')
                }
              >
                {activeCategory ? activeCategory.name : 'Choose a category'}
              </span>
              <ChevronRight size={16} className="text-gray-400 shrink-0" strokeWidth={1.75} />
            </button>
          </div>

          {isClass && (
            <div className="rounded-2xl bg-gray-50 p-4 flex items-center gap-4">
              <div className="flex-1">
                <div className="text-[15px] font-medium text-gray-900">Private listing</div>
                <div className="text-[12px] text-gray-500 mt-1 leading-snug">
                  Hide this class from the public marketplace. You can still share it by link or invite.
                </div>
              </div>
              <Toggle checked={privateListing} onChange={setPrivateListing} />
            </div>
          )}

          {!isClass && (
            <TextField
              label="Description"
              value={draft.description}
              onChange={(v) => updateDraft({ description: v })}
              rows={4}
              placeholder="Short description shown to clients"
            />
          )}

          {isClass && (
            <TextField
              label="Short description"
              value={draft.description}
              onChange={(v) => updateDraft({ description: v })}
              rows={3}
              placeholder="Optional short description shown to clients"
            />
          )}
        </div>
      </div>
      <WizardFooter
        step={isSubscription ? 2 : 1}
        total={draft.type === 'class' ? wizardTotalForDraft(draft) : wizardTotalFor(draft.type)}
        onBack={isSubscription ? () => navigate('/new/subscription-type') : undefined}
        onNext={() => navigate(basicsNextFor(draft))}
        nextDisabled={!canContinue}
      />
      <IconSheet open={iconSheetOpen} onClose={() => setIconSheetOpen(false)} />
      <CategorySheet
        open={categorySheetOpen}
        onClose={() => setCategorySheetOpen(false)}
        onCreate={() => setNewCategoryOpen(true)}
      />
      <NewCategorySheet
        open={newCategoryOpen}
        onClose={() => setNewCategoryOpen(false)}
        onCreated={(name) => updateDraft({ category: name })}
      />
    </>
  );
}
