import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext, useSearchParams } from 'react-router-dom';
import { Users } from 'lucide-react';
import ScreenHeader from '../../../../components/ScreenHeader';
import StaffPricingSheet from './StaffPricingSheet';
import { staff as fallbackStaff } from '../../../../data/staff';
import { offerTypeMeta } from '../../../../data/offerTypes';

const formatPriceStatus = (override) => {
  if (!override) return { text: 'Same as base', empty: true };
  if (override.priceMode === 'full') return { text: `£${override.price || '—'}`, empty: false };
  const sign = (override.priceDelta ?? 0) >= 0 ? '+' : '−';
  const abs = Math.abs(override.priceDelta || 0);
  return { text: `${sign}£${abs}`, empty: false };
};

export default function StaffList() {
  const navigate = useNavigate();
  const { draft, updateDraft, teamMembers = fallbackStaff } = useOutletContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const [openStaffId, setOpenStaffId] = useState(null);
  const meta = offerTypeMeta(draft.type);

  useEffect(() => {
    const sid = searchParams.get('staffId');
    if (sid) {
      setOpenStaffId(sid);
      const next = new URLSearchParams(searchParams);
      next.delete('staffId');
      setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const assignedStaff = teamMembers.filter((s) => (draft.staff || []).includes(s.id));
  const overrides = (draft.variants || []).filter((v) => v.type === 'staff');
  const overrideFor = (staffId) => overrides.find((v) => v.staffId === staffId);

  if (assignedStaff.length === 0) {
    return (
      <>
        <ScreenHeader title="Staff pricing" onBack={() => navigate('/service/variants')} />
        <div className="flex-1 overflow-y-auto px-5 pt-4 pb-6">
          <div className="flex flex-col items-center text-center pt-10">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <Users size={24} className="text-gray-400" strokeWidth={1.5} />
            </div>
            <div className="text-[18px] font-semibold text-gray-900 mb-1">No staff on this {meta.noun}</div>
            <div className="text-[14px] text-gray-500 leading-snug max-w-[260px]">
              Add staff to this {meta.noun} first, then come back to set their pricing.
            </div>
            <button
              onClick={() => navigate('/service/staff')}
              className="mt-6 h-11 px-6 rounded-full bg-gray-900 text-white text-[14px] font-medium hover:bg-gray-800 transition-colors"
            >
              Add staff
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <ScreenHeader title="Staff pricing" onBack={() => navigate('/service/variants')} />
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-6">
        <p className="text-[14px] text-gray-500 mb-4 leading-snug">
          Tap a team member to set their pricing for this {meta.noun}.
        </p>
        <div className="space-y-2">
          {assignedStaff.map((s) => {
            const status = formatPriceStatus(overrideFor(s.id));
            return (
              <button
                key={s.id}
                onClick={() => setOpenStaffId(s.id)}
                className="w-full flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl text-left hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-gray-100 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-[15px] font-medium text-gray-900">{s.name}</div>
                  <div className="text-[13px] text-gray-500 mt-0.5">{s.role}</div>
                </div>
                <div className={'text-[14px] font-medium shrink-0 ' + (status.empty ? 'text-gray-400' : 'text-gray-900')}>
                  {status.text}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <StaffPricingSheet
        open={!!openStaffId}
        staffId={openStaffId}
        onClose={() => setOpenStaffId(null)}
        draft={draft}
        updateDraft={updateDraft}
        teamMembers={teamMembers}
      />
    </>
  );
}
