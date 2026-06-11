import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Plus, Trash2, Pencil, Check } from 'lucide-react';
import ScreenHeader from '../../../components/ScreenHeader';
import TextField from '../../../components/TextField';

const PRESETS = [
  { label: 'Early bird', note: 'Discounted rate for advance bookings' },
  { label: 'Adult', note: '' },
  { label: 'Child', note: 'Under 16' },
  { label: 'Concession', note: 'Student / senior discount' },
  { label: 'Online', note: 'Virtual attendees' },
];

function uid() {
  return 'tt_' + Math.random().toString(36).slice(2, 8);
}

export default function ClassTickets() {
  const navigate = useNavigate();
  const { draft, updateDraft } = useOutletContext();
  const tickets = draft.ticketTypes || [];
  const [sheet, setSheet] = useState(null); // null | 'new' | ticketId
  const virtualEnabled = draft.locations?.remote?.enabled;

  const openNew = (preset = null) => {
    setSheet({ mode: 'new', id: uid(), label: preset?.label || '', price: '', maxSpots: '', note: preset?.note || '' });
  };

  const openEdit = (ticket) => {
    setSheet({ mode: 'edit', ...ticket });
  };

  const saveSheet = (data) => {
    const { mode, ...ticket } = data;
    if (mode === 'new') {
      updateDraft({ ticketTypes: [...tickets, ticket] });
    } else {
      updateDraft({ ticketTypes: tickets.map((t) => (t.id === ticket.id ? ticket : t)) });
    }
    setSheet(null);
  };

  const remove = (id) => {
    updateDraft({ ticketTypes: tickets.filter((t) => t.id !== id) });
  };

  // Presets not yet added
  const unusedPresets = PRESETS.filter((p) => !tickets.some((t) => t.label === p.label));

  return (
    <>
      <ScreenHeader title="Ticket types" onBack={() => navigate('/service')} />
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-6">
        <p className="text-[14px] text-gray-500 mb-5 leading-snug">
          Add different price tiers for your class — early bird rates, adult/child pricing, or separate online tickets.
        </p>

        {/* Virtual hint */}
        {virtualEnabled && !tickets.some((t) => t.label === 'Online') && (
          <div className="bg-gray-50 rounded-2xl p-4 mb-5 flex items-start gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 shrink-0" />
            <p className="text-[13px] text-gray-600 leading-snug">
              You have <span className="font-medium">Online / Virtual</span> enabled. Add an Online ticket type to charge a different price for remote attendees.
            </p>
          </div>
        )}

        {/* Ticket list */}
        {tickets.length > 0 && (
          <div className="mb-5 space-y-2">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-[15px] font-medium text-gray-900 truncate">{ticket.label || 'Unnamed'}</div>
                  <div className="text-[13px] text-gray-500 mt-0.5">
                    {ticket.price ? `£${ticket.price}` : 'No price set'}
                    {ticket.maxSpots ? ` · ${ticket.maxSpots} spots` : ''}
                    {ticket.note ? ` · ${ticket.note}` : ''}
                  </div>
                </div>
                <button
                  onClick={() => openEdit(ticket)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-white transition-colors"
                >
                  <Pencil size={15} strokeWidth={1.75} />
                </button>
                <button
                  onClick={() => remove(ticket.id)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-white transition-colors"
                >
                  <Trash2 size={15} strokeWidth={1.75} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Quick-add presets */}
        {unusedPresets.length > 0 && (
          <div className="mb-5">
            <div className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Quick add
            </div>
            <div className="flex flex-wrap gap-2">
              {unusedPresets.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => openNew(preset)}
                  className="flex items-center gap-1.5 h-8 px-3 rounded-full bg-gray-100 text-[13px] font-medium text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  <Plus size={13} strokeWidth={2.5} />
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Custom add */}
        <button
          onClick={() => openNew()}
          className="w-full flex items-center justify-center gap-2 h-12 rounded-2xl border-2 border-dashed border-gray-200 text-[14px] font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700 transition-colors"
        >
          <Plus size={16} strokeWidth={2} />
          Add custom ticket type
        </button>
      </div>

      <div className="px-5 pb-5 pt-3 shrink-0 bg-white border-t border-gray-100">
        <button
          onClick={() => navigate('/service')}
          className="w-full h-12 rounded-full bg-gray-900 hover:bg-gray-800 text-white text-[15px] font-medium transition-colors"
        >
          Done · {tickets.length} ticket type{tickets.length === 1 ? '' : 's'}
        </button>
      </div>

      {/* Edit / add sheet */}
      {sheet && (
        <TicketSheet
          data={sheet}
          onSave={saveSheet}
          onClose={() => setSheet(null)}
        />
      )}
    </>
  );
}

function TicketSheet({ data, onSave, onClose }) {
  const [label, setLabel] = useState(data.label);
  const [price, setPrice] = useState(data.price);
  const [maxSpots, setMaxSpots] = useState(data.maxSpots);
  const [note, setNote] = useState(data.note);

  const canSave = label.trim() && price;

  const handleSave = () => {
    onSave({ mode: data.mode, id: data.id, label: label.trim(), price, maxSpots, note });
  };

  return (
    <>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 z-20" onClick={onClose} />

      {/* Sheet */}
      <div className="absolute bottom-0 left-0 right-0 z-30 bg-white rounded-t-3xl px-5 pt-5 pb-6 space-y-4">
        <div className="flex items-center justify-between mb-1">
          <div className="text-[17px] font-semibold">
            {data.mode === 'new' ? 'New ticket type' : 'Edit ticket type'}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
          >
            ✕
          </button>
        </div>

        <TextField label="Label" value={label} onChange={setLabel} placeholder="e.g. Early bird" />

        <div className="grid grid-cols-2 gap-3">
          <TextField label="Price (£)" type="number" value={price} onChange={setPrice} placeholder="15" />
          <TextField label="Max spots" type="number" value={maxSpots} onChange={setMaxSpots} placeholder="Optional" />
        </div>

        <TextField
          label="Note (optional)"
          value={note}
          onChange={setNote}
          placeholder="Short note shown to clients"
        />

        <button
          onClick={handleSave}
          disabled={!canSave}
          className={
            'w-full h-12 rounded-full flex items-center justify-center gap-2 text-[15px] font-medium transition-colors ' +
            (canSave ? 'bg-gray-900 hover:bg-gray-800 text-white' : 'bg-gray-100 text-gray-400')
          }
        >
          <Check size={16} strokeWidth={2.5} />
          {data.mode === 'new' ? 'Add ticket type' : 'Save changes'}
        </button>
      </div>
    </>
  );
}
