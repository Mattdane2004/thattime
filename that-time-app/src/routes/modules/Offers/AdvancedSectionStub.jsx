// Temporary placeholder for the 8 Advanced Options sub-sections while they
// are being designed and built one at a time.
// Resolves the section name from the URL so each row navigates to a
// meaningful screen instead of erroring out.

import { useLocation, useNavigate } from 'react-router-dom';
import { Construction } from 'lucide-react';
import ScreenHeader from '../../../components/ScreenHeader';

const SECTION_NAMES = {
  '/class/bookings':              'Bookings & attendees',
  '/class/models':                'Models & practice clients',
  '/class/certificates':          'Certificates',
  '/service/pricing-tiers':       'Pricing tiers',
  '/service/additional-staff':    'Additional staff',
  '/service/booking-rules':       'Booking rules',
  '/service/requirements':        'Requirements',
  '/service/visibility':          'Visibility',
  '/service/online-link':         'Online class link',
  '/service/class-forms':         'Forms',
  '/service/class-notifications': 'Notifications',
};

const SECTION_DESCRIPTIONS = {
  '/class/bookings': 'Student bookings, attendance, session messages, and attendee lists will live here.',
  '/class/models': 'Configure live models, model sourcing, consent, preparation instructions, and session matching.',
  '/class/certificates': 'Manage completion certificates, qualification evidence, and upload requirements.',
};

export default function AdvancedSectionStub() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const name = SECTION_NAMES[pathname] || 'Section';
  const description = SECTION_DESCRIPTIONS[pathname] || "We'll wire this section up next. Tap back to return to advanced options.";

  return (
    <>
      <ScreenHeader title={name} onBack={() => navigate(-1)} />
      <div className="flex-1 overflow-y-auto bg-white flex items-start justify-center px-6 pt-14">
        <div className="flex flex-col items-center text-center max-w-[280px]">
          <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-5">
            <Construction size={24} className="text-gray-700" strokeWidth={1.75} />
          </div>
          <div className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-1">
            Up next
          </div>
          <div className="text-[22px] font-semibold text-gray-900 leading-tight">
            {name}
          </div>
          <div className="text-[14px] text-gray-500 mt-2 leading-relaxed">
            {description}
          </div>
          <button
            onClick={() => navigate(-1)}
            className="mt-8 h-11 px-6 rounded-full bg-gray-900 text-white text-[14px] font-medium hover:bg-gray-800 transition-colors"
          >
            Back
          </button>
        </div>
      </div>
    </>
  );
}
