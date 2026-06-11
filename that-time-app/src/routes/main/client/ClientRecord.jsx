import { useState } from 'react';
import {
  Plus,
  AlertTriangle,
  FileText,
  Link2,
  Eye,
  BellRing,
  Send,
  Download,
  Pencil,
  File,
  Flag,
} from 'lucide-react';
import { useMainActions } from '../../../components/sheets/MainActionsContext';
import SheetShell, { SheetCta, SheetSectionLabel } from '../../../components/sheets/SheetShell';
import { formTemplates } from '../../../data/bookingOptions';
import { useClient, SEVERITY_TONES, RESULT_TONES } from './useClient';
import { SectionHeader } from './clientShared';
import { AllergySheet, PatchTestSheet, NoteSheet } from './recordSheets';

function GroupHeader({ title, onAdd, addLabel = 'Add' }) {
  return (
    <div className="flex items-center justify-between mt-6 mb-2.5 first:mt-0">
      <span className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
        {title}
      </span>
      {onAdd && (
        <button
          onClick={onAdd}
          className="flex items-center gap-1 text-[12px] font-medium text-gray-500 hover:text-gray-900"
        >
          <Plus size={12} strokeWidth={2} />
          {addLabel}
        </button>
      )}
    </div>
  );
}

// Client record — the clinical/health side of the profile: allergies, patch
// tests, notes, forms and files, each structured and addable in place.
export default function ClientRecord() {
  const { clientId, client, allergies, patchTests, notes, files, staffAlert } = useClient();
  const { showToast, addClientExtra } = useMainActions();

  const [sheet, setSheet] = useState(null); // 'allergy' | 'patch' | 'note'
  const [viewing, setViewing] = useState(null);
  const [sendOpen, setSendOpen] = useState(false);
  const [template, setTemplate] = useState(null);
  const [reminded, setReminded] = useState(false);

  const firstName = client.name.split(' ')[0];
  const forms = client.forms;

  const formAction = (item) => {
    if (item.action === 'View') {
      return (
        <button
          onClick={() => setViewing(item)}
          className="shrink-0 flex items-center gap-1.5 bg-gray-100 rounded-full px-3 py-1.5 text-[12px] font-medium text-gray-700 hover:bg-gray-200"
        >
          <Eye size={12} strokeWidth={1.75} />
          View
        </button>
      );
    }
    if (item.action === 'Remind') {
      return reminded ? (
        <span className="shrink-0 bg-gray-100 rounded-full px-3 py-1.5 text-[12px] font-medium text-gray-400">
          Reminded
        </span>
      ) : (
        <button
          onClick={() => {
            setReminded(true);
            showToast(`Reminder sent to ${firstName}`);
          }}
          className="shrink-0 flex items-center gap-1.5 bg-amber-50 rounded-full px-3 py-1.5 text-[12px] font-medium text-amber-600 hover:bg-amber-100"
        >
          <BellRing size={12} strokeWidth={1.75} />
          Remind
        </button>
      );
    }
    return (
      <span className="shrink-0 bg-gray-100 rounded-full px-3 py-1.5 text-[12px] font-medium text-gray-400">
        Not Sent
      </span>
    );
  };

  return (
    <>
      <SectionHeader title="Client record" subtitle={client.name} />

      <div className="flex-1 overflow-y-auto bg-white px-4 pb-8">
        {/* Staff alert (if set) */}
        {staffAlert && (
          <div className="flex items-center gap-3 bg-gray-900 text-white rounded-2xl px-4 py-3.5 mb-1">
            <Flag size={15} strokeWidth={1.75} className="shrink-0" />
            <span className="flex-1 text-[13px] font-medium leading-snug">{staffAlert}</span>
          </div>
        )}

        {/* Allergies */}
        <GroupHeader title="Allergies" onAdd={() => setSheet('allergy')} />
        {allergies.length === 0 && (
          <div className="text-[12px] text-gray-400">None recorded</div>
        )}
        <div className="space-y-2.5">
          {allergies.map((a) => (
            <div key={a.id} className="bg-gray-50 rounded-2xl px-4 py-3.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[14px] font-semibold text-gray-900">{a.name}</span>
                <span
                  className={
                    'shrink-0 text-[11px] font-medium rounded-full px-2.5 py-1 ' +
                    SEVERITY_TONES[a.severity]
                  }
                >
                  {a.severity}
                </span>
              </div>
              <div className="text-[12px] text-gray-500 mt-1">
                {a.type}
                {a.reaction && ` · ${a.reaction}`}
              </div>
              {a.patchTestRequired && (
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-700 mt-2">
                  <AlertTriangle size={11} strokeWidth={1.75} />
                  Patch test required before chemical services
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Patch tests */}
        <GroupHeader title="Patch tests" onAdd={() => setSheet('patch')} />
        {patchTests.length === 0 && <div className="text-[12px] text-gray-400">None recorded</div>}
        <div className="space-y-2.5">
          {patchTests.map((t) => (
            <div key={t.id} className="bg-gray-50 rounded-2xl px-4 py-3.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[14px] font-semibold text-gray-900">{t.product}</span>
                <span
                  className={
                    'shrink-0 text-[11px] font-medium rounded-full px-2.5 py-1 ' +
                    RESULT_TONES[t.result]
                  }
                >
                  {t.result}
                </span>
              </div>
              <div className="text-[12px] text-gray-500 mt-1">
                {t.date} · {t.retest}
              </div>
            </div>
          ))}
        </div>

        {/* Notes */}
        <GroupHeader title="Notes" onAdd={() => setSheet('note')} />
        {notes.length === 0 && <div className="text-[12px] text-gray-400">No notes yet</div>}
        <div className="space-y-2.5">
          {notes.map((note, i) => (
            <div key={i} className="bg-gray-50 rounded-2xl px-4 py-3.5">
              <div className="text-[13px] text-gray-900 leading-snug">{note.text}</div>
              <div className="text-[11px] text-gray-400 mt-1">{note.time}</div>
            </div>
          ))}
        </div>
        <div className="text-[11px] text-gray-400 mt-2">
          Treatment notes live on each appointment — open one from Appointments.
        </div>

        {/* Forms */}
        <GroupHeader title="Forms" onAdd={() => setSendOpen(true)} addLabel="Send" />
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[12px] text-gray-400">{forms.summary}</span>
          <span className="flex items-center gap-1.5">
            <span className="text-[11px] font-medium bg-amber-50 text-amber-600 rounded-full px-2 py-0.5">
              {forms.pending}
            </span>
            <span className="text-[11px] font-medium bg-gray-100 text-gray-400 rounded-full px-2 py-0.5">
              {forms.notSent}
            </span>
          </span>
        </div>
        <div className="space-y-2.5">
          {forms.items.map((item) => (
            <div key={item.id} className="bg-gray-50 rounded-2xl px-4 py-3.5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[14px] font-semibold text-gray-900">{item.name}</div>
                  <div className="text-[12px] text-gray-500 mt-0.5">{item.meta}</div>
                  <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-1.5">
                    <Link2 size={11} strokeWidth={1.75} />
                    {item.linked}
                  </div>
                </div>
                {formAction(item)}
              </div>
            </div>
          ))}
        </div>

        {/* Files */}
        <GroupHeader
          title="Files"
          onAdd={() => {
            addClientExtra(clientId, 'files', {
              id: `f_${Date.now().toString(36)}`,
              name: 'New upload',
              meta: 'File · just now',
            });
            showToast('File added to profile');
          }}
        />
        {files.length === 0 && <div className="text-[12px] text-gray-400">No files yet</div>}
        <div className="space-y-2.5">
          {files.map((f) => (
            <div key={f.id} className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3.5">
              <div className="w-9 h-9 rounded-lg bg-gray-100 border border-gray-200/60 flex items-center justify-center shrink-0">
                <File size={15} className="text-gray-500" strokeWidth={1.75} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-medium text-gray-900 truncate">{f.name}</div>
                <div className="text-[12px] text-gray-400">{f.meta}</div>
              </div>
              <button
                onClick={() => showToast(`${f.name} downloaded`)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100"
                aria-label={`Download ${f.name}`}
              >
                <Download size={14} className="text-gray-400" strokeWidth={1.75} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Quick-add sheets */}
      <AllergySheet open={sheet === 'allergy'} onClose={() => setSheet(null)} clientId={clientId} clientName={client.name} />
      <PatchTestSheet open={sheet === 'patch'} onClose={() => setSheet(null)} clientId={clientId} clientName={client.name} />
      <NoteSheet open={sheet === 'note'} onClose={() => setSheet(null)} clientId={clientId} clientName={client.name} />

      {/* Form viewer */}
      <SheetShell
        open={Boolean(viewing)}
        onClose={() => setViewing(null)}
        title={viewing?.name}
        subtitle={viewing?.meta}
        footer={
          <div className="flex gap-2.5">
            <button
              onClick={() => showToast(`${viewing.name} downloaded as PDF`)}
              className="flex-1 flex items-center justify-center gap-1.5 border border-gray-200 rounded-full py-3.5 text-[13px] font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
            >
              <Download size={14} strokeWidth={1.75} />
              Download
            </button>
            <button
              onClick={() => showToast('Amendment opened — full editor comes later in the console')}
              className="flex-1 flex items-center justify-center gap-1.5 bg-gray-100 rounded-full py-3.5 text-[13px] font-semibold text-gray-900 hover:bg-gray-200 transition-colors"
            >
              <Pencil size={14} strokeWidth={1.75} />
              Amend
            </button>
          </div>
        }
      >
        <div className="bg-gray-50 rounded-2xl px-4 py-1 mb-3">
          {[
            { q: 'Any allergies or sensitivities?', a: 'Sensitive scalp · PPD allergy' },
            { q: 'Current medication?', a: 'None' },
            { q: 'Previous reactions to colour?', a: 'Mild irritation, 2023' },
            { q: 'Consent to treatment', a: 'Agreed' },
          ].map((row) => (
            <div key={row.q} className="py-3 border-b border-gray-100 last:border-0">
              <div className="text-[12px] text-gray-500">{row.q}</div>
              <div className="text-[13px] font-medium text-gray-900 mt-0.5">{row.a}</div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1 text-[11px] text-gray-400 mb-2">
          <Link2 size={11} strokeWidth={1.75} />
          {viewing?.linked} · Signed 15 Jan 2024
        </div>
      </SheetShell>

      {/* Send new form */}
      <SheetShell
        open={sendOpen}
        onClose={() => {
          setSendOpen(false);
          setTemplate(null);
        }}
        title="Send New Form"
        subtitle={client.name}
        footer={
          <SheetCta
            disabled={!template}
            onClick={() => {
              setSendOpen(false);
              setTemplate(null);
              showToast(`${template.name} sent to ${firstName}`);
            }}
          >
            Send form
          </SheetCta>
        }
      >
        {formTemplates.map((t) => (
          <button
            key={t.id}
            onClick={() => setTemplate(t)}
            className={
              'w-full flex items-center gap-3 rounded-2xl px-3.5 py-3 mb-2 border text-left transition-colors ' +
              (template?.id === t.id
                ? 'border-gray-900 border-[1.5px]'
                : 'border-gray-100 hover:bg-gray-50')
            }
          >
            <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
              <FileText size={15} className="text-gray-500" strokeWidth={1.75} />
            </div>
            <div>
              <div className="text-[14px] font-medium text-gray-900">{t.name}</div>
              <div className="text-[12px] text-gray-400">{t.meta}</div>
            </div>
          </button>
        ))}
      </SheetShell>
    </>
  );
}
