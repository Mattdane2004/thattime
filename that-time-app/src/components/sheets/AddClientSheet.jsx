import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';
import SheetShell, { SheetCta, Chip, SheetSectionLabel } from './SheetShell';
import { clientSources } from '../../data/bookingOptions';

function Field({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <label className="block">
      <div className="text-[12px] font-medium text-gray-500 mb-1.5">{label}</div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-gray-50 rounded-xl px-4 h-12 text-[14px] text-gray-900 placeholder-gray-400 outline-none focus:ring-1 focus:ring-gray-900"
      />
    </label>
  );
}

function MiniToggle({ on, onChange }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={
        'rounded-full p-0.5 transition-colors shrink-0 ' + (on ? 'bg-gray-900' : 'bg-gray-200')
      }
      style={{ width: 44, height: 26 }}
      role="switch"
      aria-checked={on}
    >
      <span
        className={
          'block bg-white rounded-full transition-transform ' +
          (on ? 'translate-x-[18px]' : 'translate-x-0')
        }
        style={{ width: 22, height: 22 }}
      />
    </button>
  );
}

// "Add New Client" — deliberately minimal. Most clients join by booking
// through the app themselves; this flow exists for phone and walk-in
// onboarding. Everything beyond name + contact is optional and can be filled
// in later from the profile's Details screen.
export default function AddClientSheet({ open, onClose, onAdd }) {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [moreOpen, setMoreOpen] = useState(false);
  const [address, setAddress] = useState('');
  const [birthday, setBirthday] = useState('');
  const [pronouns, setPronouns] = useState('');
  const [occupation, setOccupation] = useState('');
  const [source, setSource] = useState('Phone');
  const [invite, setInvite] = useState(true);

  const reset = () => {
    setName('');
    setPhone('');
    setEmail('');
    setMoreOpen(false);
    setAddress('');
    setBirthday('');
    setPronouns('');
    setOccupation('');
    setSource('Phone');
    setInvite(true);
  };
  const close = () => {
    reset();
    onClose();
  };

  const save = () => {
    const trimmed = name.trim();
    const id = `new-${trimmed.toLowerCase().replace(/[^a-z]+/g, '-')}`;
    onAdd({
      id,
      initials: trimmed
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
      name: trimmed,
      phone,
      email,
      address,
      birthday,
      pronouns,
      occupation,
      clientSource: source,
      invited: invite,
      schedule: 'Added today',
      tags: [],
    });
    close();
    navigate(`/clients/${id}`);
  };

  return (
    <SheetShell
      open={open}
      onClose={close}
      title="New Client"
      subtitle="For phone or walk-in onboarding"
      footer={
        <SheetCta disabled={!name.trim()} onClick={save}>
          {invite && name.trim() ? 'Add & send invite' : 'Add Client'}
        </SheetCta>
      }
    >
      <div className="text-[12px] text-gray-500 bg-gray-50 rounded-xl px-3.5 py-3 mb-4 leading-relaxed">
        Most clients join when they book online — their profile builds itself. Add someone here
        when you're onboarding them by phone or in person.
      </div>

      <div className="space-y-3.5">
        <Field label="Full name" value={name} onChange={setName} placeholder="e.g. Maya Patel" />
        <Field label="Mobile" value={phone} onChange={setPhone} placeholder="(555) 000-0000" type="tel" />
        <Field label="Email (optional)" value={email} onChange={setEmail} placeholder="name@email.com" type="email" />
      </div>

      {/* Invite */}
      <div className="flex items-center justify-between border border-gray-200 rounded-2xl px-4 py-3.5 mt-4">
        <div className="min-w-0 pr-3">
          <div className="text-[13px] font-semibold text-gray-900">Invite them to ThatTime</div>
          <div className="text-[11px] text-gray-400 mt-0.5">
            They'll complete their own profile and can book, pay and reschedule themselves.
          </div>
        </div>
        <MiniToggle on={invite} onChange={setInvite} />
      </div>

      {/* More details — optional, collapsed by default */}
      <button
        onClick={() => setMoreOpen((v) => !v)}
        className="w-full flex items-center justify-between py-4 text-left"
      >
        <span className="text-[13px] font-semibold text-gray-900">More details</span>
        <span className="flex items-center gap-1.5 text-[12px] text-gray-400">
          Optional
          {moreOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </span>
      </button>
      {moreOpen && (
        <div className="space-y-3.5 pb-2">
          <Field label="Address" value={address} onChange={setAddress} placeholder="Street, city" />
          <Field label="Birthday" value={birthday} onChange={setBirthday} placeholder="e.g. 14 June" />
          <Field label="Pronouns" value={pronouns} onChange={setPronouns} placeholder="e.g. She / her" />
          <Field label="Occupation" value={occupation} onChange={setOccupation} placeholder="e.g. Teacher" />
          <SheetSectionLabel>How they found you</SheetSectionLabel>
          <div className="flex flex-wrap gap-2">
            {clientSources.map((s) => (
              <Chip key={s} selected={source === s} onClick={() => setSource(s)}>
                {s}
              </Chip>
            ))}
          </div>
        </div>
      )}
    </SheetShell>
  );
}
