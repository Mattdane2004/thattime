import { useRef, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Check, FileText, Trash2, Upload } from 'lucide-react';
import BottomSheet from '../../../components/BottomSheet';
import ScreenHeader from '../../../components/ScreenHeader';
import TextField from '../../../components/TextField';
import ProductSelect from '../../../components/ProductSelect';
import { emptyClassDetails } from '../../../data/offerTypes';

const ACCESS_OPTIONS = [
  { key: 'before_booking', label: 'Before booking', desc: 'Visible on the class page before checkout.' },
  { key: 'after_booking', label: 'After booking/payment', desc: 'Released once the student has booked.' },
  { key: 'internal', label: 'Internal only', desc: 'Staff reference material, hidden from clients.' },
];

const TYPE_OPTIONS = [
  { key: 'pdf', label: 'PDF / handout' },
  { key: 'pre_read', label: 'Pre-read' },
  { key: 'prep', label: 'Preparation' },
  { key: 'course_structure', label: 'Course structure' },
  { key: 'other', label: 'Other' },
];

const newMaterialId = () => 'mat_' + Math.random().toString(36).slice(2, 9);

export default function CourseMaterials() {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const { draft, updateDraft } = useOutletContext();
  const details = draft.classDetails || emptyClassDetails();
  const materials = details.courseMaterials || [];
  const targetOptions = materialTargetOptions(details);
  const [editingId, setEditingId] = useState(null);

  const updateClass = (patch) =>
    updateDraft({ classDetails: { ...details, ...patch } });

  const addFiles = (files) => {
    const next = Array.from(files || []).map((file) => ({
      id: newMaterialId(),
      title: file.name.replace(/\.[^.]+$/, ''),
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type || 'application/octet-stream',
      materialType: inferMaterialType(file),
      access: 'after_booking',
      target: 'course',
      notes: '',
      uploadedAt: 'Just now',
    }));
    if (!next.length) return;
    updateClass({ courseMaterials: [...materials, ...next] });
  };

  const updateMaterial = (id, patch) =>
    updateClass({
      courseMaterials: materials.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    });

  const removeMaterial = (id) => {
    updateClass({ courseMaterials: materials.filter((item) => item.id !== id) });
    if (editingId === id) setEditingId(null);
  };

  const editing = materials.find((item) => item.id === editingId);

  return (
    <>
      <ScreenHeader title="Course materials" onBack={() => navigate('/class')} />
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-6 space-y-5">
        <div className="rounded-3xl bg-gray-50 p-5">
          <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center mb-4">
            <Upload size={19} className="text-gray-800" strokeWidth={1.75} />
          </div>
          <div className="text-[17px] font-semibold text-gray-900">Upload student materials</div>
          <div className="text-[13px] text-gray-500 mt-1 leading-snug">
            Add PDFs, pre-reads, preparation documents, course outlines, or internal teaching files.
          </div>
          <input
            ref={inputRef}
            type="file"
            multiple
            className="hidden"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg,.txt"
            onChange={(event) => {
              addFiles(event.target.files);
              event.target.value = '';
            }}
          />
          <button
            onClick={() => inputRef.current?.click()}
            className="mt-5 w-full h-12 rounded-full bg-gray-900 hover:bg-gray-800 text-white text-[15px] font-medium transition-colors"
          >
            Upload files
          </button>
        </div>

        {materials.length === 0 ? (
          <div className="text-center px-6 pt-7">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 mx-auto flex items-center justify-center mb-4">
              <FileText size={22} className="text-gray-500" strokeWidth={1.75} />
            </div>
            <div className="text-[17px] font-semibold text-gray-900">No materials yet</div>
            <div className="text-[14px] text-gray-500 mt-1 leading-snug">
              Materials are optional, but useful for pre-course reading, what to bring, and course structure.
            </div>
          </div>
        ) : (
          <section className="space-y-2">
            {materials.map((material) => (
              <div key={material.id} className="flex items-center gap-2">
                <button
                  onClick={() => setEditingId(material.id)}
                  className="flex-1 flex items-center gap-3 bg-white border border-gray-100 rounded-2xl p-4 text-left hover:bg-gray-50 transition-colors min-w-0"
                >
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                    <FileText size={17} className="text-gray-700" strokeWidth={1.75} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-medium text-gray-900 truncate">{material.title || material.fileName}</div>
                    <div className="text-[12px] text-gray-500 mt-0.5 truncate">
                      {typeLabel(material.materialType)} · {targetLabel(material.target, targetOptions)} · {accessLabel(material.access)} · {formatFileSize(material.fileSize)}
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => removeMaterial(material.id)}
                  aria-label="Remove material"
                  className="w-10 h-10 rounded-full text-gray-300 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center"
                >
                  <Trash2 size={15} strokeWidth={1.75} />
                </button>
              </div>
            ))}
          </section>
        )}
      </div>

      <div className="px-5 pb-5 pt-3 shrink-0 bg-white border-t border-gray-100">
        <button
          onClick={() => navigate('/class')}
          className="w-full h-12 rounded-full bg-gray-900 hover:bg-gray-800 text-white text-[15px] font-medium transition-colors"
        >
          Done
        </button>
      </div>

      <MaterialSheet
        material={editing}
        targetOptions={targetOptions}
        onClose={() => setEditingId(null)}
        onChange={(patch) => editing && updateMaterial(editing.id, patch)}
      />
    </>
  );
}

function MaterialSheet({ material, targetOptions, onClose, onChange }) {
  if (!material) return null;
  return (
    <BottomSheet
      open={Boolean(material)}
      onClose={onClose}
      title="Edit material"
      footer={
        <button
          onClick={onClose}
          className="w-full h-12 rounded-full bg-gray-900 hover:bg-gray-800 text-white text-[15px] font-medium transition-colors"
        >
          Done
        </button>
      }
    >
      <div className="space-y-5">
        <TextField
          label="Title"
          value={material.title}
          onChange={(title) => onChange({ title })}
          placeholder="Course handbook"
        />
        <ProductSelect
          label="Attach to"
          value={material.target || 'course'}
          onChange={(target) => onChange({ target })}
          options={targetOptions}
        />
        <div>
          <div className="text-[12px] font-semibold uppercase tracking-wider text-gray-500 mb-2">Material type</div>
          <div className="grid grid-cols-2 gap-2">
            {TYPE_OPTIONS.map((option) => (
              <OptionButton
                key={option.key}
                active={material.materialType === option.key}
                label={option.label}
                onClick={() => onChange({ materialType: option.key })}
              />
            ))}
          </div>
        </div>
        <div>
          <div className="text-[12px] font-semibold uppercase tracking-wider text-gray-500 mb-2">Access</div>
          <div className="space-y-2">
            {ACCESS_OPTIONS.map((option) => (
              <button
                key={option.key}
                onClick={() => onChange({ access: option.key })}
                className={
                  'w-full flex items-center gap-3 rounded-2xl p-4 text-left border transition-colors ' +
                  (material.access === option.key ? 'border-gray-900 bg-gray-50' : 'border-gray-100 hover:bg-gray-50')
                }
              >
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-medium text-gray-900">{option.label}</div>
                  <div className="text-[12px] text-gray-500 mt-0.5 leading-snug">{option.desc}</div>
                </div>
                {material.access === option.key && <Check size={17} className="text-gray-900" strokeWidth={2.5} />}
              </button>
            ))}
          </div>
        </div>
        <TextField
          label="Notes"
          value={material.notes}
          onChange={(notes) => onChange({ notes })}
          rows={4}
          placeholder="What students should do with this material"
        />
        <div className="rounded-2xl bg-gray-50 px-4 py-3 text-[12px] text-gray-500">
          {material.fileName} · {formatFileSize(material.fileSize)} · {material.uploadedAt}
        </div>
      </div>
    </BottomSheet>
  );
}

function OptionButton({ active, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className={
        'min-h-11 rounded-xl px-3 text-[12px] font-medium transition-colors ' +
        (active ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100')
      }
    >
      {label}
    </button>
  );
}

function inferMaterialType(file) {
  if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) return 'pdf';
  if (/prep|prepare|bring/i.test(file.name)) return 'prep';
  if (/read|theory/i.test(file.name)) return 'pre_read';
  if (/structure|outline|agenda/i.test(file.name)) return 'course_structure';
  return 'other';
}

function typeLabel(value) {
  return TYPE_OPTIONS.find((option) => option.key === value)?.label || 'Material';
}

function accessLabel(value) {
  return ACCESS_OPTIONS.find((option) => option.key === value)?.label || 'After booking';
}

function targetLabel(value = 'course', options = []) {
  return options.find((option) => option.key === value)?.label || 'Whole class';
}

function materialTargetOptions(details) {
  const options = [{ key: 'course', label: 'Whole class/course' }];
  const sessions = materialSessions(details);

  sessions.forEach((session, index) => {
    const sessionLabel = `Day ${index + 1} · ${session.label}`;
    options.push({ key: `session:${session.id}`, label: sessionLabel });
    (session.agendaItems || []).forEach((item) => {
      if (!item.id) return;
      options.push({
        key: `agenda:${item.id}`,
        label: `${sessionLabel} · ${item.title || 'Agenda section'}`,
      });
    });
  });

  return options;
}

function materialSessions(details) {
  const courseSessions = (details.courseSessions || []).filter((session) => session.date);
  if (courseSessions.length) {
    return courseSessions.map((session) => ({
      id: session.id,
      label: formatDate(session.date),
      agendaItems: session.agendaItems || [],
    }));
  }

  const single = details.singleSession || {};
  const date = single.date || single.firstDate;
  if (!date) return [];
  return [{
    id: 'single',
    label: formatDate(date),
    agendaItems: single.agendaItems || [],
  }];
}

function formatDate(value) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return 'Class date';
  return new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }).format(date);
}

function formatFileSize(size = 0) {
  if (!size) return 'Unknown size';
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}
