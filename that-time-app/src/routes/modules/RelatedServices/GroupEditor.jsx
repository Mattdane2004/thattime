import { useState } from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import ScreenHeader from '../../../components/ScreenHeader';
import BasicsForm from './forms/BasicsForm';
import DiscountForm from './forms/DiscountForm';
import AudienceForm, { emptyAudience } from './forms/AudienceForm';

export default function GroupEditor() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { draft, updateDraft } = useOutletContext();

  const group = (draft.related || []).find((r) => r.id === id);
  const [query, setQuery] = useState('');

  if (!group) {
    return (
      <>
        <ScreenHeader title="Group not found" onBack={() => navigate('/service/related')} />
        <div className="flex-1 flex items-center justify-center text-[14px] text-gray-500">
          This group no longer exists.
        </div>
      </>
    );
  }

  const update = (patch) => {
    updateDraft({
      related: (draft.related || []).map((r) => (r.id === id ? { ...r, ...patch } : r)),
    });
  };

  const remove = () => {
    updateDraft({ related: (draft.related || []).filter((r) => r.id !== id) });
    navigate('/service/related');
  };

  return (
    <>
      <ScreenHeader
        title={group.name || 'Edit group'}
        onBack={() => navigate('/service/related')}
      />
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-6 space-y-8">
        <BasicsForm
          name={group.name}
          onNameChange={(v) => update({ name: v })}
          serviceIds={group.serviceIds || []}
          onServiceIdsChange={(ids) => update({ serviceIds: ids })}
          query={query}
          onQueryChange={setQuery}
        />

        <div className="h-px bg-gray-100" />

        <DiscountForm
          discountMode={group.discountMode || 'none'}
          onDiscountModeChange={(m) => update({ discountMode: m, discountAmount: m === 'none' ? '' : group.discountAmount })}
          discountAmount={group.discountAmount || ''}
          onDiscountAmountChange={(v) => update({ discountAmount: v })}
          showPopular={!!group.showPopular}
          onShowPopularChange={(v) => update({ showPopular: v })}
        />

        <div className="h-px bg-gray-100" />

        <div>
          <div className="text-[15px] font-semibold text-gray-900 mb-1">Audience</div>
          <AudienceForm
            audience={group.audience || emptyAudience()}
            onAudienceChange={(a) => update({ audience: a })}
          />
        </div>

        <button
          onClick={remove}
          className="w-full text-[14px] text-red-500 py-2 hover:text-red-600 transition-colors"
        >
          Delete group
        </button>
      </div>
    </>
  );
}
