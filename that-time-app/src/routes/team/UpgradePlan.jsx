import { useNavigate } from 'react-router-dom';
import ScreenHeader from '../../components/ScreenHeader';

// Shown before the quick-add flow when the business is on the Solo plan.
// Flip `businessPlan` to 'solo' in src/data/business.js to preview this gate.
export default function UpgradePlan() {
  const navigate = useNavigate();

  return (
    <>
      <ScreenHeader title="Upgrade plan" onBack={() => navigate(-1)} border />
      <div className="flex-1 overflow-y-auto bg-white px-5 pt-6 pb-8">
        <div className="rounded-3xl border border-gray-200 p-6">
          <div className="text-[12px] uppercase tracking-[0.12em] text-gray-500">Your plan</div>
          <div className="mt-2 text-[24px] font-semibold tracking-tight text-gray-950">You're on the Solo plan</div>
          <div className="mt-2 text-[14px] text-gray-500 leading-snug">
            Adding team members upgrades you to the Team plan.
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-gray-50 p-4">
              <div className="text-[13px] font-semibold text-gray-900">Solo</div>
              <div className="mt-1 text-[12px] text-gray-500 leading-snug">1 bookable person</div>
              <div className="mt-3 text-[20px] font-semibold text-gray-950">
                £29<span className="text-[13px] font-medium text-gray-500">/mo</span>
              </div>
            </div>
            <div className="rounded-2xl bg-gray-900 p-4 text-white">
              <div className="text-[13px] font-semibold">Team</div>
              <div className="mt-1 text-[12px] text-white/60 leading-snug">Up to 10 people</div>
              <div className="mt-3 text-[20px] font-semibold">
                £59<span className="text-[13px] font-medium text-white/60">/mo</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/team/new', { state: { upgraded: true } })}
            className="mt-6 w-full h-12 rounded-full bg-gray-900 hover:bg-gray-800 text-white text-[15px] font-medium transition-colors"
          >
            Upgrade and continue
          </button>
          <button
            onClick={() => navigate(-1)}
            className="mt-2 w-full h-12 rounded-full text-[14px] font-medium text-gray-500 hover:text-gray-900 transition-colors"
          >
            Not now
          </button>
        </div>
      </div>
    </>
  );
}
