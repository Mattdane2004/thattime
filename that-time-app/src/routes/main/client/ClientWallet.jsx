import { useState } from 'react';
import { Plus, Minus, Gift, Award } from 'lucide-react';
import { useMainActions } from '../../../components/sheets/MainActionsContext';
import SheetShell, { SheetCta, Chip, SheetSectionLabel } from '../../../components/sheets/SheetShell';
import { useClient } from './useClient';
import { SectionHeader } from './clientShared';

// Wallet & loyalty — prototype-light: prepaid balance with transactions, and
// points/tier with a manual adjust.
export default function ClientWallet() {
  const { client } = useClient();
  const { showToast } = useMainActions();

  const [balance, setBalance] = useState(client.wallet.balance);
  const [transactions, setTransactions] = useState(client.wallet.transactions);
  const [points, setPoints] = useState(client.loyalty.points);
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState(null);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustBy, setAdjustBy] = useState(null);

  const firstName = client.name.split(' ')[0];

  return (
    <>
      <SectionHeader title="Wallet & loyalty" subtitle={client.name} />

      <div className="flex-1 overflow-y-auto bg-white px-4 pb-8">
        {/* Wallet */}
        <div className="bg-gray-900 rounded-2xl p-5 text-white">
          <div className="text-[12px] text-gray-400">Wallet balance</div>
          <div className="text-[30px] font-bold mt-1">£{balance}</div>
          <button
            onClick={() => setTopUpOpen(true)}
            className="flex items-center gap-1.5 bg-white text-gray-900 rounded-full px-4 py-2.5 text-[13px] font-semibold mt-4 hover:bg-gray-100 transition-colors"
          >
            <Plus size={14} strokeWidth={2} />
            Top up
          </button>
        </div>

        <SheetSectionLabel>Transactions</SheetSectionLabel>
        {transactions.length === 0 && (
          <div className="text-[12px] text-gray-400">No transactions yet</div>
        )}
        <div className="bg-gray-50 rounded-2xl px-4 py-1">
          {transactions.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
            >
              <div>
                <div className="text-[13px] font-medium text-gray-900">{t.label}</div>
                <div className="text-[11px] text-gray-400">{t.date}</div>
              </div>
              <span className="text-[13px] font-semibold text-gray-900">{t.amount}</span>
            </div>
          ))}
        </div>

        {/* Loyalty */}
        <SheetSectionLabel>Loyalty</SheetSectionLabel>
        <div className="border border-gray-200 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                <Award size={18} className="text-gray-700" strokeWidth={1.75} />
              </div>
              <div>
                <div className="text-[16px] font-bold text-gray-900">{points} points</div>
                <div className="text-[12px] text-gray-500">{client.loyalty.tier} tier</div>
              </div>
            </div>
            <button
              onClick={() => setAdjustOpen(true)}
              className="border border-gray-200 rounded-full px-3.5 py-2 text-[12px] font-semibold text-gray-900 hover:bg-gray-50"
            >
              Adjust
            </button>
          </div>
          <div className="text-[11px] text-gray-400 mt-3">{client.loyalty.caption}</div>
        </div>

        <div className="flex items-center gap-2.5 text-[11px] text-gray-400 mt-4">
          <Gift size={12} strokeWidth={1.75} />
          Wallet credit and points can be redeemed at checkout (coming with the loyalty pass).
        </div>
      </div>

      {/* Top up */}
      <SheetShell
        open={topUpOpen}
        onClose={() => setTopUpOpen(false)}
        title="Top up wallet"
        subtitle={client.name}
        footer={
          <SheetCta
            disabled={!topUpAmount}
            onClick={() => {
              setBalance((b) => b + topUpAmount);
              setTransactions((t) => [
                { id: `tx_${t.length}`, label: 'Wallet top-up', date: 'Today', amount: `+£${topUpAmount}` },
                ...t,
              ]);
              setTopUpOpen(false);
              setTopUpAmount(null);
              showToast(`£${topUpAmount} added to ${firstName}'s wallet`);
            }}
          >
            {topUpAmount ? `Top up £${topUpAmount}` : 'Top up'}
          </SheetCta>
        }
      >
        <SheetSectionLabel>Amount</SheetSectionLabel>
        <div className="flex flex-wrap gap-2">
          {[10, 20, 50, 100].map((a) => (
            <Chip key={a} selected={topUpAmount === a} onClick={() => setTopUpAmount(a)}>
              £{a}
            </Chip>
          ))}
        </div>
      </SheetShell>

      {/* Adjust points */}
      <SheetShell
        open={adjustOpen}
        onClose={() => setAdjustOpen(false)}
        title="Adjust points"
        subtitle={`${client.name} · ${points} points now`}
        footer={
          <SheetCta
            disabled={!adjustBy}
            onClick={() => {
              setPoints((p) => Math.max(0, p + adjustBy));
              setAdjustOpen(false);
              setAdjustBy(null);
              showToast(`${adjustBy > 0 ? '+' : ''}${adjustBy} points · saved`);
            }}
          >
            Apply
          </SheetCta>
        }
      >
        <SheetSectionLabel>Change</SheetSectionLabel>
        <div className="flex flex-wrap gap-2">
          {[-100, -50, 50, 100, 250].map((a) => (
            <Chip key={a} selected={adjustBy === a} onClick={() => setAdjustBy(a)}>
              {a > 0 ? (
                <span className="flex items-center gap-1">
                  <Plus size={11} strokeWidth={2} /> {a}
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Minus size={11} strokeWidth={2} /> {Math.abs(a)}
                </span>
              )}
            </Chip>
          ))}
        </div>
        <div className="text-[11px] text-gray-400 mt-3">
          e.g. goodwill points after a problem visit, or correcting a missed scan.
        </div>
      </SheetShell>
    </>
  );
}
