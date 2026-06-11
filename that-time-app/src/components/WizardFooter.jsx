export default function WizardFooter({ step, total = 4, onBack, onNext, nextLabel = 'Next', nextDisabled = false }) {
  return (
    <div className="px-5 pb-5 pt-4 shrink-0">
      <div className="flex items-center justify-between mb-4">
        <div className="text-[13px] text-gray-500">Step {step} of {total}</div>
        <div className="flex gap-1.5">
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              className={'h-1 w-7 rounded-full ' + (i < step ? 'bg-gray-900' : 'bg-gray-200')}
            />
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        {onBack && (
          <button
            onClick={onBack}
            className="flex-1 h-12 rounded-full border border-gray-200 text-[15px] font-medium hover:bg-gray-50"
          >
            Back
          </button>
        )}
        <button
          onClick={onNext}
          disabled={nextDisabled}
          className={
            'flex-1 h-12 rounded-full text-[15px] font-medium text-white transition-colors ' +
            (nextDisabled ? 'bg-gray-300' : 'bg-gray-900 hover:bg-gray-800')
          }
        >
          {nextLabel}
        </button>
      </div>
    </div>
  );
}
