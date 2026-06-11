import { createElement, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  Database,
  FileSpreadsheet,
  Table,
  Upload,
  Users,
} from 'lucide-react';
import ScreenHeader from '../components/ScreenHeader';

const FILE_TYPES = [
  {
    key: 'clients',
    title: 'Client data',
    desc: 'Names, contact details, notes, tags, and consent fields.',
    icon: Users,
    columns: ['First name', 'Last name', 'Email', 'Phone'],
  },
  {
    key: 'bookings',
    title: 'Booking data',
    desc: 'Past and future appointments, service names, dates, and statuses.',
    icon: CalendarDays,
    columns: ['Client email', 'Service', 'Date', 'Time'],
  },
];

function formatFileSize(bytes = 0) {
  if (!bytes) return '0 KB';
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function UploadCard({ item, file, onPick }) {
  const inputRef = useRef(null);
  const Icon = item.icon;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
          <Icon size={19} className="text-gray-800" strokeWidth={1.8} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="text-[16px] font-semibold text-gray-900">{item.title}</div>
              <div className="text-[13px] text-gray-500 mt-1 leading-snug">{item.desc}</div>
            </div>
            {file && <CheckCircle2 size={19} className="text-emerald-600 shrink-0" strokeWidth={2} />}
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {item.columns.map((column) => (
              <span
                key={column}
                className="px-2 py-1 rounded-full bg-gray-50 text-[11px] font-medium text-gray-500"
              >
                {column}
              </span>
            ))}
          </div>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(event) => onPick(event.target.files?.[0] || null)}
      />

      {file ? (
        <div className="mt-4 rounded-xl bg-emerald-50 px-3 py-3 flex items-center gap-3">
          <FileSpreadsheet size={18} className="text-emerald-700 shrink-0" strokeWidth={1.9} />
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-semibold text-emerald-950 truncate">{file.name}</div>
            <div className="text-[12px] text-emerald-700 mt-0.5">{formatFileSize(file.size)}</div>
          </div>
          <button
            onClick={() => inputRef.current?.click()}
            className="h-8 px-3 rounded-full bg-white text-[12px] font-medium text-emerald-800"
          >
            Replace
          </button>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          className="mt-4 w-full h-12 rounded-2xl border-2 border-dashed border-gray-200 text-[14px] font-medium text-gray-500 flex items-center justify-center gap-2 hover:border-gray-300 hover:text-gray-800 transition-colors"
        >
          <Upload size={16} strokeWidth={2} />
          Upload CSV
        </button>
      )}
    </div>
  );
}

function ImportStep({ icon, title, desc, active }) {
  return (
    <div className="flex items-start gap-3">
      <div
        className={
          'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ' +
          (active ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-400')
        }
      >
        {createElement(icon, { size: 17, strokeWidth: 1.9 })}
      </div>
      <div className="min-w-0">
        <div className="text-[14px] font-semibold text-gray-900">{title}</div>
        <div className="text-[12px] text-gray-500 mt-0.5 leading-snug">{desc}</div>
      </div>
    </div>
  );
}

function MappingPreview({ files, onBack }) {
  return (
    <>
      <div className="px-1 pb-5">
        <div className="w-12 h-12 rounded-2xl bg-gray-900 text-white flex items-center justify-center mb-4">
          <Table size={22} strokeWidth={2} />
        </div>
        <div className="text-[28px] leading-tight font-semibold tracking-tight text-gray-900">
          Match your columns
        </div>
        <div className="text-[14px] text-gray-500 mt-1 leading-snug">
          Check the key fields before importing. You can come back and replace either file.
        </div>
      </div>

      <div className="space-y-3">
        {FILE_TYPES.filter((item) => files[item.key]).map((item) => (
          <div key={item.key} className="bg-white border border-gray-100 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                <FileSpreadsheet size={18} className="text-gray-800" strokeWidth={1.8} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[15px] font-semibold text-gray-900">{item.title}</div>
                <div className="text-[12px] text-gray-500 truncate">{files[item.key].name}</div>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {item.columns.map((column) => (
                <div
                  key={column}
                  className="flex items-center justify-between gap-3 rounded-xl bg-gray-50 px-3 py-2.5"
                >
                  <div className="text-[13px] font-medium text-gray-900">{column}</div>
                  <div className="text-[12px] text-gray-500">Auto matched</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-2xl bg-white border border-gray-100 p-4">
        <div className="text-[15px] font-semibold text-gray-900">What happens next</div>
        <div className="text-[13px] text-gray-500 mt-1 leading-snug">
          That Time will create a preview, flag duplicate clients, and let you choose whether bookings should be added as past history or live appointments.
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <button
          onClick={onBack}
          className="h-12 rounded-full bg-white border border-gray-200 text-[14px] font-medium text-gray-700"
        >
          Back
        </button>
        <button
          onClick={onBack}
          className="h-12 rounded-full bg-gray-900 text-white text-[14px] font-medium"
        >
          Save import draft
        </button>
      </div>
    </>
  );
}

export default function ImportData() {
  const navigate = useNavigate();
  const [files, setFiles] = useState({ clients: null, bookings: null });
  const [stage, setStage] = useState('upload');
  const uploadedCount = FILE_TYPES.filter((item) => files[item.key]).length;
  const canReview = uploadedCount > 0;

  const updateFile = (key, file) => {
    if (!file) return;
    setFiles((current) => ({ ...current, [key]: file }));
  };

  return (
    <>
      <ScreenHeader
        title="Import data"
        onBack={() => (stage === 'upload' ? navigate('/hub') : setStage('upload'))}
        border
      />

      <div className="flex-1 overflow-y-auto bg-gray-50 px-4 pt-4 pb-8">
        {stage === 'match' ? (
          <MappingPreview files={files} onBack={() => setStage('upload')} />
        ) : (
          <>
            <div className="px-1 pb-5">
              <div className="w-12 h-12 rounded-2xl bg-gray-900 text-white flex items-center justify-center mb-4">
                <Database size={22} strokeWidth={2} />
              </div>
              <div className="text-[28px] leading-tight font-semibold tracking-tight text-gray-900">
                Bring your records with you
              </div>
              <div className="text-[14px] text-gray-500 mt-1 leading-snug">
                Upload CSV files for clients and bookings. We will help match columns before anything is imported.
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-4 space-y-4">
              <ImportStep
                icon={Upload}
                title="Upload CSV files"
                desc="Start with clients, bookings, or both."
                active
              />
              <ImportStep
                icon={Table}
                title="Match the columns"
                desc="Review names, dates, services, and contact fields."
                active={canReview}
              />
              <ImportStep
                icon={CheckCircle2}
                title="Review and import"
                desc="Spot-check records before they are added."
                active={!!files.clients && !!files.bookings}
              />
            </div>

            <div className="space-y-3">
              {FILE_TYPES.map((item) => (
                <UploadCard
                  key={item.key}
                  item={item}
                  file={files[item.key]}
                  onPick={(file) => updateFile(item.key, file)}
                />
              ))}
            </div>

            <div className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 flex items-start gap-3">
              <CircleAlert size={18} className="text-amber-700 shrink-0 mt-0.5" strokeWidth={1.9} />
              <div className="text-[12px] text-amber-900 leading-snug">
                Nothing changes until you review the matched columns and confirm the import.
              </div>
            </div>

            <button
              disabled={!canReview}
              onClick={() => setStage('match')}
              className={
                'mt-5 w-full h-12 rounded-full text-[15px] font-medium flex items-center justify-center gap-2 transition-colors ' +
                (canReview
                  ? 'bg-gray-900 text-white hover:bg-gray-800'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed')
              }
            >
              Continue to column matching
              <ArrowRight size={16} strokeWidth={2} />
            </button>
          </>
        )}
      </div>
    </>
  );
}
