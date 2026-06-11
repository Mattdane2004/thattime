import Toggle from './Toggle';

export default function DepositControl({ draft, updateDraft }) {
  const { depositEnabled, depositType = 'fixed', depositAmount, price } = draft;

  const effective =
    depositType === 'percent' && price && depositAmount
      ? ((Number(price) * Number(depositAmount)) / 100).toFixed(2)
      : null;

  const prefix = depositType === 'percent' ? '%' : '£';
  const placeholder = depositType === 'percent' ? '20' : '10';

  return (
    <div className="bg-gray-50 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-4 p-4">
        <div className="flex-1">
          <div className="text-[15px] font-medium">Require deposit</div>
          <div className="text-[13px] text-gray-500 mt-0.5">Charge a deposit at booking</div>
        </div>
        <Toggle
          checked={depositEnabled}
          onChange={(v) => updateDraft({ depositEnabled: v })}
        />
      </div>
      {depositEnabled && (
        <div className="p-4 pt-0 space-y-3">
          <div className="grid grid-cols-2 gap-2 bg-white rounded-xl p-1">
            {[
              { key: 'fixed', label: 'Fixed amount' },
              { key: 'percent', label: 'Percentage' },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => updateDraft({ depositType: t.key })}
                className={
                  'py-2 rounded-lg text-[13px] font-medium transition-colors ' +
                  (depositType === t.key
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:bg-gray-50')
                }
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="bg-white rounded-xl px-4 py-3 flex items-baseline gap-2">
            <span className="text-[18px] text-gray-500">{prefix}</span>
            <input
              type="number"
              value={depositAmount}
              onChange={(e) => updateDraft({ depositAmount: e.target.value })}
              placeholder={placeholder}
              className="flex-1 min-w-0 text-[18px] font-medium bg-transparent outline-none"
            />
          </div>
          {effective && (
            <div className="text-[12px] text-gray-500 leading-snug">
              ≈ £{effective} charged on a £{price} service
            </div>
          )}
        </div>
      )}
    </div>
  );
}
