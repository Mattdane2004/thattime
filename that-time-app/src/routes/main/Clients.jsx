import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  UserPlus,
  ArrowUpDown,
  SlidersHorizontal,
  ChevronDown,
  Star,
  MoreHorizontal,
  CheckSquare,
  Upload,
  Merge,
  FileSpreadsheet,
  FileText,
  Pencil,
  Ban,
  Trash2,
  Check,
  Building2,
  Flag,
} from 'lucide-react';
import MainHeader from '../../components/MainHeader';
import MainTabBar from '../../components/MainTabBar';
import SheetShell, { SheetCta } from '../../components/sheets/SheetShell';
import ConfirmSheet from '../../components/sheets/ConfirmSheet';
import { useMainActions } from '../../components/sheets/MainActionsContext';
import { clientList } from '../../data/clientsDirectory';
import { clientSortOptions } from '../../data/bookingOptions';
import { getClientDetail } from '../../data/clientsDirectory';

const TAG_TONES = {
  light: 'bg-gray-100 text-gray-500',
  mid: 'bg-gray-500 text-white',
  dark: 'bg-gray-900 text-white',
};

function sortClients(list, sort) {
  const copy = [...list];
  switch (sort) {
    case 'name':
      return copy.sort((a, b) => a.name.localeCompare(b.name));
    case 'rating':
      return copy.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
    case 'newest':
      return copy.reverse();
    default:
      return copy;
  }
}

export default function Clients() {
  const navigate = useNavigate();
  const {
    openAction,
    showToast,
    extraClients,
    addClient,
    removedClients,
    removeClient,
    blockedClients,
    blockClient,
    unblockClient,
    clientExtras,
  } = useMainActions();
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('recent');
  const [filter, setFilter] = useState('All');
  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importSource, setImportSource] = useState(null);
  const [mergeOpen, setMergeOpen] = useState(false);
  const [cardMenu, setCardMenu] = useState(null); // client whose ⋯ is open
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState([]);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const all = [...extraClients, ...clientList]
    .filter((c) => !removedClients.includes(c.id))
    .map((c) =>
      blockedClients.includes(c.id)
        ? { ...c, muted: true, tags: [{ label: 'Blocked', tone: 'mid' }] }
        : c,
    );

  const visible = sortClients(
    all.filter((c) => {
      if (!c.name.toLowerCase().includes(query.trim().toLowerCase())) return false;
      if (
        filter !== 'All' &&
        !c.tags.some((t) => t.label === filter) &&
        !(clientExtras[c.id]?.tags || []).some((t) => t.label === filter)
      )
        return false;
      return true;
    }),
    sort,
  );

  const duplicates = all.filter((c) => c.name === 'Christopher Garcia');
  const sortLabel = clientSortOptions.find((o) => o.id === sort)?.label;
  // Filter options come from the tags actually in use (plus session tags).
  const filterOptions = [
    'All',
    ...new Set(
      all.flatMap((c) => [
        ...c.tags.map((t) => t.label),
        ...((clientExtras[c.id]?.tags || []).map((t) => t.label)),
      ]),
    ),
  ];
  const hasAlert = (c) =>
    clientExtras[c.id]?.staffAlert !== undefined
      ? Boolean(clientExtras[c.id]?.staffAlert)
      : Boolean(getClientDetail(c.id)?.staffAlert) && clientList.some((x) => x.id === c.id);

  const toggleSelected = (id) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const exitSelect = () => {
    setSelectMode(false);
    setSelected([]);
  };

  const runImport = () => {
    ['Nina Patel', 'Oliver Grant', 'Grace Lee'].forEach((name, i) =>
      addClient({
        id: `imp-${name.toLowerCase().replace(/[^a-z]+/g, '-')}`,
        initials: name.split(' ').map((w) => w[0]).join(''),
        name,
        schedule: 'Imported today',
        tags: [{ label: 'Imported', tone: 'light' }],
        importIndex: i,
      }),
    );
    setImportOpen(false);
    setImportSource(null);
    showToast('3 clients imported');
  };

  return (
    <>
      <MainHeader title="Clients" />

      <div className="shrink-0 bg-white px-4 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-full px-4 h-12">
            <Search size={16} className="text-gray-400 shrink-0" strokeWidth={1.75} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, phone, or email"
              className="flex-1 bg-transparent text-[13px] text-gray-900 placeholder-gray-400 outline-none min-w-0"
            />
          </div>
          <button
            onClick={() => openAction('client')}
            className="shrink-0 flex items-center gap-1.5 bg-gray-900 text-white rounded-full px-4 h-12 text-[13px] font-semibold hover:bg-gray-800 transition-colors"
          >
            <UserPlus size={15} strokeWidth={1.75} />
            Add
          </button>
        </div>

        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={() => setSortOpen(true)}
            className="flex items-center gap-1.5 bg-gray-100 rounded-full px-3.5 py-2 text-[12px] font-medium text-gray-700"
          >
            <ArrowUpDown size={13} strokeWidth={1.75} />
            {sortLabel}
            <ChevronDown size={13} strokeWidth={1.75} />
          </button>
          <button
            onClick={() => setFilterOpen(true)}
            className={
              'flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-medium transition-colors ' +
              (filter !== 'All' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700')
            }
          >
            <SlidersHorizontal size={13} strokeWidth={1.75} />
            {filter === 'All' ? 'Filter' : filter}
            <ChevronDown size={13} strokeWidth={1.75} />
          </button>
          <div className="flex-1" />
          <button
            onClick={() => setManageOpen(true)}
            className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
            aria-label="Manage clients"
          >
            <MoreHorizontal size={16} className="text-gray-700" />
          </button>
        </div>

        <div className="text-[12px] text-gray-400 mt-3">
          {selectMode
            ? `${selected.length} selected`
            : `${visible.length} client${visible.length === 1 ? '' : 's'}`}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-white px-4 pb-6 space-y-3">
        {visible.map((client) => (
          <div
            key={client.id}
            onClick={() =>
              selectMode ? toggleSelected(client.id) : navigate(`/clients/${client.id}`)
            }
            className="w-full bg-gray-50 rounded-2xl px-4 py-4 flex items-start gap-3.5 text-left hover:bg-gray-100 transition-colors cursor-pointer"
          >
            {selectMode && (
              <span
                className={
                  'mt-2.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ' +
                  (selected.includes(client.id)
                    ? 'bg-gray-900 border-gray-900'
                    : 'border-gray-300 bg-white')
                }
              >
                {selected.includes(client.id) && <Check size={12} className="text-white" />}
              </span>
            )}
            <div
              className={
                'w-11 h-11 rounded-full bg-gray-200 flex items-center justify-center text-[12px] font-semibold shrink-0 ' +
                (client.muted ? 'text-gray-400' : 'text-gray-600')
              }
            >
              {client.initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className={
                    'text-[14px] font-semibold ' +
                    (client.muted ? 'text-gray-400' : 'text-gray-900')
                  }
                >
                  {client.name}
                </span>
                {hasAlert(client) && (
                  <Flag size={11} className="text-gray-900 fill-gray-900 shrink-0" aria-label="Staff alert" />
                )}
                {client.rating && (
                  <span
                    className={
                      'flex items-center gap-0.5 text-[12px] font-medium ' +
                      (client.muted ? 'text-gray-400' : 'text-gray-700')
                    }
                  >
                    <Star size={11} className="fill-current" />
                    {client.rating}
                  </span>
                )}
              </div>
              <div
                className={
                  'text-[12px] mt-0.5 ' + (client.muted ? 'text-gray-300' : 'text-gray-500')
                }
              >
                {client.schedule}
              </div>
              {client.tags.length > 0 && (
                <div className="flex items-center gap-1.5 mt-2">
                  {client.tags.map((tag) => (
                    <span
                      key={tag.label}
                      className={
                        'text-[10px] font-medium rounded-md px-2 py-0.5 ' + TAG_TONES[tag.tone]
                      }
                    >
                      {tag.label}
                    </span>
                  ))}
                </div>
              )}
            </div>
            {!selectMode && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCardMenu(client);
                }}
                className="shrink-0 w-8 h-8 -mr-1 rounded-full flex items-center justify-center hover:bg-gray-200"
                aria-label={`Options for ${client.name}`}
              >
                <MoreHorizontal size={15} className="text-gray-400" />
              </button>
            )}
          </div>
        ))}
        {visible.length === 0 && (
          <div className="text-center text-[13px] text-gray-400 pt-12">No clients match</div>
        )}
      </div>

      {/* Bulk action bar */}
      {selectMode && (
        <div className="shrink-0 bg-white border-t border-gray-100 px-4 py-3 flex items-center gap-2.5">
          <button
            onClick={() => {
              showToast(`${selected.length} clients updated`);
              exitSelect();
            }}
            disabled={selected.length === 0}
            className="flex-1 flex items-center justify-center gap-1.5 bg-gray-100 rounded-full py-3 text-[13px] font-semibold text-gray-900 disabled:text-gray-300"
          >
            <Pencil size={14} strokeWidth={1.75} />
            Edit
          </button>
          <button
            onClick={() => setBulkDeleteOpen(true)}
            disabled={selected.length === 0}
            className="flex-1 flex items-center justify-center gap-1.5 bg-gray-900 text-white rounded-full py-3 text-[13px] font-semibold disabled:bg-gray-100 disabled:text-gray-300"
          >
            <Trash2 size={14} strokeWidth={1.75} />
            Delete
          </button>
          <button
            onClick={exitSelect}
            className="shrink-0 px-4 py-3 text-[13px] font-medium text-gray-500"
          >
            Cancel
          </button>
        </div>
      )}

      <MainTabBar />

      {/* Sort */}
      <SheetShell open={sortOpen} onClose={() => setSortOpen(false)} title="Sort by">
        {clientSortOptions.map((o) => (
          <button
            key={o.id}
            onClick={() => {
              setSort(o.id);
              setSortOpen(false);
            }}
            className="w-full flex items-center justify-between py-3.5 border-b border-gray-50 last:border-0 text-left"
          >
            <span className="text-[14px] font-medium text-gray-900">{o.label}</span>
            {sort === o.id && <span className="text-[12px] text-gray-400">Selected</span>}
          </button>
        ))}
      </SheetShell>

      {/* Filter */}
      <SheetShell open={filterOpen} onClose={() => setFilterOpen(false)} title="Filter clients">
        {filterOptions.map((f) => (
          <button
            key={f}
            onClick={() => {
              setFilter(f);
              setFilterOpen(false);
            }}
            className="w-full flex items-center justify-between py-3.5 border-b border-gray-50 last:border-0 text-left"
          >
            <span className="text-[14px] font-medium text-gray-900">{f}</span>
            {filter === f && <span className="text-[12px] text-gray-400">Selected</span>}
          </button>
        ))}
      </SheetShell>

      {/* Manage clients (⋯) */}
      <SheetShell open={manageOpen} onClose={() => setManageOpen(false)} title="Manage clients">
        {[
          {
            icon: CheckSquare,
            label: 'Select clients',
            desc: 'Bulk edit or delete',
            onClick: () => {
              setManageOpen(false);
              setSelectMode(true);
            },
          },
          {
            icon: Upload,
            label: 'Import client list',
            desc: 'CSV, Excel or another platform',
            onClick: () => {
              setManageOpen(false);
              setImportOpen(true);
            },
          },
          {
            icon: Merge,
            label: 'Merge duplicate clients',
            desc: duplicates.length > 1 ? '1 possible duplicate found' : 'No duplicates found',
            onClick: () => {
              setManageOpen(false);
              setMergeOpen(true);
            },
          },
          {
            icon: FileSpreadsheet,
            label: 'Export as Excel',
            desc: `${all.length} clients`,
            onClick: () => {
              setManageOpen(false);
              showToast(`Exported ${all.length} clients as Excel`);
            },
          },
          {
            icon: FileText,
            label: 'Export as CSV',
            desc: `${all.length} clients`,
            onClick: () => {
              setManageOpen(false);
              showToast(`Exported ${all.length} clients as CSV`);
            },
          },
        ].map(({ icon: Icon, label, desc, onClick }) => (
          <button
            key={label}
            onClick={onClick}
            className="w-full flex items-center gap-3.5 py-3.5 border-b border-gray-50 last:border-0 text-left"
          >
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
              <Icon size={17} className="text-gray-900" strokeWidth={1.75} />
            </div>
            <div>
              <div className="text-[14px] font-semibold text-gray-900">{label}</div>
              <div className="text-[12px] text-gray-500">{desc}</div>
            </div>
          </button>
        ))}
      </SheetShell>

      {/* Import */}
      <SheetShell
        open={importOpen}
        onClose={() => {
          setImportOpen(false);
          setImportSource(null);
        }}
        title="Import client list"
        subtitle="Bring your existing clients with you"
        footer={
          <SheetCta disabled={!importSource} onClick={runImport}>
            {importSource ? 'Import 3 clients' : 'Import'}
          </SheetCta>
        }
      >
        {[
          { id: 'file', icon: Upload, label: 'Upload CSV or Excel', desc: 'We map the columns for you' },
          { id: 'platform', icon: Building2, label: 'From another platform', desc: 'Fresha, Booksy, Square…' },
        ].map(({ id, icon: Icon, label, desc }) => (
          <button
            key={id}
            onClick={() => setImportSource(id)}
            className={
              'w-full flex items-center gap-3.5 rounded-2xl px-4 py-4 mb-2.5 border text-left transition-colors ' +
              (importSource === id
                ? 'border-gray-900 border-[1.5px]'
                : 'border-gray-100 hover:bg-gray-50')
            }
          >
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
              <Icon size={17} className="text-gray-900" strokeWidth={1.75} />
            </div>
            <div>
              <div className="text-[14px] font-semibold text-gray-900">{label}</div>
              <div className="text-[12px] text-gray-500">{desc}</div>
            </div>
          </button>
        ))}
        {importSource && (
          <div className="bg-gray-50 rounded-2xl px-4 py-3.5 text-[12px] text-gray-600">
            Found <span className="font-semibold text-gray-900">3 clients</span> ready to import —
            Nina Patel, Oliver Grant and Grace Lee. Duplicates will be skipped.
          </div>
        )}
      </SheetShell>

      {/* Merge duplicates */}
      <SheetShell
        open={mergeOpen}
        onClose={() => setMergeOpen(false)}
        title="Merge duplicates"
        footer={
          duplicates.length > 1 ? (
            <SheetCta
              onClick={() => {
                removeClient('christopher-garcia-2');
                setMergeOpen(false);
                showToast('Merged 2 profiles into one');
              }}
            >
              Merge into one profile
            </SheetCta>
          ) : null
        }
      >
        {duplicates.length > 1 ? (
          <>
            <div className="text-[13px] text-gray-500 mb-3">
              These two profiles look like the same person. Merging keeps all bookings, notes and
              forms on one profile.
            </div>
            {duplicates.map((c, i) => (
              <div
                key={c.id}
                className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3.5 mb-2"
              >
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-[12px] font-semibold text-gray-600 shrink-0">
                  {c.initials}
                </div>
                <div className="flex-1">
                  <div className="text-[14px] font-semibold text-gray-900">{c.name}</div>
                  <div className="text-[12px] text-gray-500">{c.schedule}</div>
                </div>
                <span className="text-[11px] font-medium bg-gray-100 text-gray-500 rounded-full px-2 py-0.5">
                  {i === 0 ? 'Keep' : 'Merge in'}
                </span>
              </div>
            ))}
          </>
        ) : (
          <div className="text-center py-10">
            <div className="text-[14px] font-medium text-gray-900">No duplicates found</div>
            <div className="text-[12px] text-gray-400 mt-1">Your client list is clean.</div>
          </div>
        )}
      </SheetShell>

      {/* Per-client ⋯ */}
      <SheetShell
        open={Boolean(cardMenu)}
        onClose={() => setCardMenu(null)}
        title={cardMenu?.name}
        subtitle={cardMenu?.schedule}
      >
        {[
          {
            icon: Pencil,
            label: 'Edit profile',
            onClick: () => {
              const id = cardMenu.id;
              setCardMenu(null);
              navigate(`/clients/${id}`);
            },
          },
          blockedClients.includes(cardMenu?.id)
            ? {
                icon: Ban,
                label: 'Unblock client',
                onClick: () => {
                  unblockClient(cardMenu.id);
                  showToast(`${cardMenu.name} unblocked`);
                  setCardMenu(null);
                },
              }
            : {
                icon: Ban,
                label: 'Block client',
                desc: "They won't be able to book with you",
                onClick: () => {
                  blockClient(cardMenu.id);
                  showToast(`${cardMenu.name} blocked`);
                  setCardMenu(null);
                },
              },
          {
            icon: Trash2,
            label: 'Delete client',
            desc: 'Removes their profile and history',
            onClick: () => {
              setDeleteTarget(cardMenu);
              setCardMenu(null);
            },
          },
        ].map(({ icon: Icon, label, desc, onClick }) => (
          <button
            key={label}
            onClick={onClick}
            className="w-full flex items-center gap-3.5 py-3.5 border-b border-gray-50 last:border-0 text-left"
          >
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
              <Icon size={17} className="text-gray-900" strokeWidth={1.75} />
            </div>
            <div>
              <div className="text-[14px] font-semibold text-gray-900">{label}</div>
              {desc && <div className="text-[12px] text-gray-500">{desc}</div>}
            </div>
          </button>
        ))}
      </SheetShell>

      {/* Delete confirmation */}
      <ConfirmSheet
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title={`Delete ${deleteTarget?.name}?`}
        message="Their profile, bookings, notes and forms will be removed. This can't be undone."
        confirmLabel="Delete client"
        onConfirm={() => {
          removeClient(deleteTarget.id);
          showToast(`${deleteTarget.name} deleted`);
        }}
      />
      <ConfirmSheet
        open={bulkDeleteOpen}
        onClose={() => setBulkDeleteOpen(false)}
        title={`Delete ${selected.length} clients?`}
        message="Their profiles, bookings, notes and forms will be removed. This can't be undone."
        confirmLabel={`Delete ${selected.length} clients`}
        onConfirm={() => {
          selected.forEach(removeClient);
          showToast(`${selected.length} clients deleted`);
          exitSelect();
        }}
      />
    </>
  );
}
