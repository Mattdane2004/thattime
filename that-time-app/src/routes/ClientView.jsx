import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Smartphone, ArrowLeftRight } from 'lucide-react';

export default function ClientView() {
  const navigate = useNavigate();

  return (
    <>
      <div className="shrink-0 flex items-center px-4 h-14 bg-white">
        <button
          onClick={() => navigate(-1)}
          className="-ml-2 w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100"
          aria-label="Back"
        >
          <ChevronLeft size={22} />
        </button>
        <div className="flex-1 ml-1 text-[11px] font-semibold uppercase tracking-widest text-gray-500">
          Client view · B2C
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-white flex items-start justify-center px-6 pt-14">
        <div className="flex flex-col items-center text-center max-w-[300px]">
          <div className="w-16 h-16 rounded-2xl bg-gray-900 text-white flex items-center justify-center mb-5">
            <Smartphone size={24} strokeWidth={1.75} />
          </div>
          <div className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-1">
            Coming soon
          </div>
          <div className="text-[22px] font-semibold text-gray-900 leading-tight">
            That Time for clients
          </div>
          <div className="text-[14px] text-gray-500 mt-2 leading-relaxed">
            The B2C app where clients discover businesses, book services, and manage their appointments.
            Built on the same data you're configuring here — so a service becomes bookable the moment it's
            published.
          </div>
          <button
            onClick={() => navigate('/hub')}
            className="mt-8 h-11 px-5 rounded-full bg-gray-900 text-white text-[14px] font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
          >
            <ArrowLeftRight size={14} strokeWidth={2} />
            Switch back to business
          </button>
        </div>
      </div>
    </>
  );
}
