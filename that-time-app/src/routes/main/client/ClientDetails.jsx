import { useNavigate } from 'react-router-dom';
import { Chip, SheetSectionLabel } from '../../../components/sheets/SheetShell';
import { useMainActions } from '../../../components/sheets/MainActionsContext';
import { clientSources } from '../../../data/bookingOptions';
import { useClient } from './useClient';
import { SectionHeader } from './clientShared';
import { useState } from 'react';

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

// Details — everything we *can* know about a client, none of it required.
// Filled in over time, not forced at add time.
export default function ClientDetails() {
  const navigate = useNavigate();
  const { clientId, client } = useClient();
  const { showToast } = useMainActions();
  const d = client.details || {};

  const [name, setName] = useState(client.name);
  const [phone, setPhone] = useState(d.phone || '');
  const [email, setEmail] = useState(d.email || '');
  const [address, setAddress] = useState(d.address || '');
  const [birthday, setBirthday] = useState(d.birthday || '');
  const [pronouns, setPronouns] = useState(d.pronouns || '');
  const [occupation, setOccupation] = useState(d.occupation || '');
  const [emergencyName, setEmergencyName] = useState(d.emergencyContact?.name || '');
  const [emergencyPhone, setEmergencyPhone] = useState(d.emergencyContact?.phone || '');
  const [source, setSource] = useState(client.source === 'app' ? null : 'Phone');

  return (
    <>
      <SectionHeader title="Details" subtitle={client.name} />

      <div className="flex-1 overflow-y-auto bg-white px-4 pb-8">
        <div className="text-[12px] text-gray-400 mb-4">
          Everything here is optional — capture what's useful, skip the rest.
        </div>

        <SheetSectionLabel>Contact</SheetSectionLabel>
        <div className="space-y-3.5">
          <Field label="Full name" value={name} onChange={setName} placeholder="Full name" />
          <Field label="Mobile" value={phone} onChange={setPhone} placeholder="(555) 000-0000" type="tel" />
          <Field label="Email" value={email} onChange={setEmail} placeholder="name@email.com" type="email" />
          <Field label="Address" value={address} onChange={setAddress} placeholder="Street, city" />
        </div>

        <SheetSectionLabel>Personal</SheetSectionLabel>
        <div className="space-y-3.5">
          <Field label="Birthday" value={birthday} onChange={setBirthday} placeholder="e.g. 14 June" />
          <Field label="Pronouns" value={pronouns} onChange={setPronouns} placeholder="e.g. She / her" />
          <Field label="Occupation" value={occupation} onChange={setOccupation} placeholder="e.g. Teacher" />
        </div>

        <SheetSectionLabel>Emergency contact</SheetSectionLabel>
        <div className="space-y-3.5">
          <Field label="Name" value={emergencyName} onChange={setEmergencyName} placeholder="Who to call" />
          <Field label="Phone" value={emergencyPhone} onChange={setEmergencyPhone} placeholder="(555) 000-0000" type="tel" />
        </div>

        <SheetSectionLabel>How they found you</SheetSectionLabel>
        {client.source === 'app' ? (
          <div className="text-[13px] text-gray-500 bg-gray-50 rounded-xl px-3.5 py-3">
            Joined via the app · {client.joined} — source is set automatically.
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {clientSources.map((s) => (
              <Chip key={s} selected={source === s} onClick={() => setSource(s)}>
                {s}
              </Chip>
            ))}
          </div>
        )}
      </div>

      <div className="shrink-0 bg-white border-t border-gray-50 px-4 pb-6 pt-3">
        <button
          onClick={() => {
            showToast('Details saved');
            navigate(`/clients/${clientId}`);
          }}
          className="w-full bg-gray-900 text-white rounded-full py-4 text-[14px] font-semibold hover:bg-gray-800 transition-colors"
        >
          Save changes
        </button>
      </div>
    </>
  );
}
