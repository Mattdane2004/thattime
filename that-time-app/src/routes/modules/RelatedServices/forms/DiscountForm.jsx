export default function DiscountForm({
  discountMode,
  onDiscountModeChange,
  discountAmount,
  onDiscountAmountChange,
  showPopular,
  onShowPopularChange,
}) {
  return (
    <div className="space-y-6">
      <div>
        <div className="text-[13px] font-medium text-gray-700 mb-2">Discount when added together</div>
        <div className="grid grid-cols-3 gap-2 bg-gray-50 rounded-2xl p-1">
          {[
            { k: 'none', label: 'None' },
            { k: 'percent', label: '% off' },
            { k: 'flat', label: '£ off' },
          ].map((m) => (
            <button
              key={m.k}
              onClick={() => onDiscountModeChange(m.k)}
              className={
                'py-2.5 rounded-xl text-[14px] font-medium transition-colors ' +
                (discountMode === m.k ? 'bg-white text-gray-900' : 'text-gray-500')
              }
            >
              {m.label}
            </button>
          ))}
        </div>
        {discountMode !== 'none' && (
          <div className="flex items-center gap-2 bg-gray-50 rounded-2xl px-4 py-3.5 mt-2">
            <span className="text-[18px] text-gray-500">{discountMode === 'percent' ? '%' : '£'}</span>
            <input
              type="number"
              value={discountAmount}
              onChange={(e) => onDiscountAmountChange(e.target.value)}
              placeholder="0"
              className="flex-1 text-[18px] font-medium bg-transparent outline-none placeholder:text-gray-300"
            />
          </div>
        )}
        <div className="text-[12px] text-gray-500 mt-2 leading-snug">
          Applies to any service in this group when added to a booking alongside the base service.
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0 pr-4">
          <div className="text-[15px] text-gray-900">Popularity badge</div>
          <div className="text-[12px] text-gray-500 mt-0.5 leading-snug">
            Show "12 clients added this last month" under each suggestion.
          </div>
        </div>
        <button
          onClick={() => onShowPopularChange(!showPopular)}
          className={
            'w-11 h-[26px] rounded-full relative shrink-0 transition-colors ' +
            (showPopular ? 'bg-gray-900' : 'bg-gray-200')
          }
        >
          <div
            className={
              'absolute top-0.5 w-[22px] h-[22px] rounded-full bg-white shadow-sm transition-transform ' +
              (showPopular ? 'translate-x-[22px]' : 'translate-x-0.5')
            }
          />
        </button>
      </div>
    </div>
  );
}
