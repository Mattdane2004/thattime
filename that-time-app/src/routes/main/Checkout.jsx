import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ChevronLeft,
  Plus,
  X,
  CreditCard,
  Banknote,
  Landmark,
  Gift,
  Scissors,
  ShoppingBag,
  Percent,
  CheckCircle2,
  Mail,
} from 'lucide-react';
import SheetShell, { SheetCta, Chip, SheetSectionLabel } from '../../components/sheets/SheetShell';
import { useMainActions } from '../../components/sheets/MainActionsContext';
import {
  bookableServices,
  retailProducts,
  checkoutDiscounts,
} from '../../data/bookingOptions';

// Checkout — the single place every payment happens: build the basket, apply
// discount and tip, then take one or more payments (split allowed) by card,
// cash, bank transfer or gift card. Completes automatically once fully paid.

const TIP_OPTIONS = [
  { id: 0, label: 'No tip' },
  { id: 10, label: '10%' },
  { id: 15, label: '15%' },
  { id: 20, label: '20%' },
  { id: 'custom', label: 'Custom' },
];

const PAYMENT_METHODS = [
  { id: 'Card', icon: CreditCard, hint: 'The card reader will prompt the client.' },
  { id: 'Cash', icon: Banknote, hint: null },
  { id: 'Bank transfer', icon: Landmark, hint: null },
  { id: 'Gift card', icon: Gift, hint: null },
];

const money = (v) => `£${Number.isInteger(v) ? v : v.toFixed(2)}`;
const parsePrice = (p) => Number(String(p).replace(/[^0-9.]/g, '')) || 0;

export default function Checkout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast, advanceUpNext, markCollected } = useMainActions();

  const client = searchParams.get('client') || 'Walk-in';
  const fromUpNext = searchParams.get('from') === 'upnext';
  const collectId = searchParams.get('collect');
  const initialService = searchParams.get('service');
  const initialPrice = parsePrice(searchParams.get('price'));

  const [items, setItems] = useState(() =>
    initialService
      ? [
          {
            id: 'origin',
            name: initialService.split(' · ')[0],
            meta: 'Appointment',
            price: initialPrice,
            type: 'service',
          },
        ]
      : [],
  );
  const [discount, setDiscount] = useState(null);
  const [tip, setTip] = useState(0);
  const [customTip, setCustomTip] = useState('');
  const [payments, setPayments] = useState([]); // { id, method, amount, detail }
  const [done, setDone] = useState(false);
  const [addServicesOpen, setAddServicesOpen] = useState(false);
  const [addProductsOpen, setAddProductsOpen] = useState(false);
  const [discountOpen, setDiscountOpen] = useState(false);
  // Per-method payment sheet
  const [methodSheet, setMethodSheet] = useState(null); // method id
  const [payAmount, setPayAmount] = useState('');
  const [giftCode, setGiftCode] = useState('');
  const [bankRef, setBankRef] = useState('');

  const subtotal = items.reduce((sum, i) => sum + i.price, 0);
  const discountAmount = !discount
    ? 0
    : discount.type === 'percent'
      ? (subtotal * discount.value) / 100
      : Math.min(discount.value, subtotal);
  const tipBase = subtotal - discountAmount;
  const tipAmount =
    tip === 'custom' ? parsePrice(customTip) : tip ? (tipBase * tip) / 100 : 0;
  const total = tipBase + tipAmount;
  const paid = payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = Math.max(0, Math.round((total - paid) * 100) / 100);

  const initials = client
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const addItem = (entry, type) =>
    setItems((all) => [
      ...all,
      {
        id: `${entry.id}_${all.length}`,
        name: entry.name,
        meta: type === 'service' ? entry.duration : entry.meta,
        price: parsePrice(entry.price),
        type,
      },
    ]);

  const openMethod = (id) => {
    setMethodSheet(id);
    setPayAmount(remaining ? String(remaining) : '');
    setGiftCode('');
    setBankRef('');
  };

  const addPayment = () => {
    const entered = parsePrice(payAmount);
    if (entered <= 0) return;
    const amount = Math.min(entered, remaining);
    const change = entered - amount;
    const detail =
      methodSheet === 'Gift card'
        ? giftCode.trim().toUpperCase()
        : methodSheet === 'Bank transfer'
          ? bankRef.trim()
          : null;
    const next = [
      ...payments,
      { id: `pay_${payments.length}`, method: methodSheet, amount, detail },
    ];
    setPayments(next);
    setMethodSheet(null);
    const nowPaid = next.reduce((s, p) => s + p.amount, 0);
    if (nowPaid >= total - 0.005) {
      setDone(true);
      showToast(`${money(total)} paid in full`);
      if (collectId) markCollected(collectId);
    } else if (change > 0.005) {
      showToast(`Change due ${money(change)} · ${money(total - nowPaid)} remaining`);
    } else {
      showToast(`${money(amount)} taken · ${money(total - nowPaid)} remaining`);
    }
  };

  const finish = () => {
    if (fromUpNext) {
      advanceUpNext();
      navigate(`/review-client?name=${encodeURIComponent(client)}`, { replace: true });
    } else {
      navigate(-1);
    }
  };

  // ----- Success state ----------------------------------------------------------
  if (done) {
    return (
      <>
        <div className="shrink-0 bg-white h-14" />
        <div className="flex-1 overflow-y-auto bg-white px-6 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center mb-5">
            <CheckCircle2 size={30} className="text-white" strokeWidth={2} />
          </div>
          <div className="text-[26px] font-bold text-gray-900">{money(total)}</div>
          <div className="text-[13px] text-gray-500 mt-1.5">{client}</div>
          <div className="mt-5 w-full max-w-[260px] bg-gray-50 rounded-2xl px-4 py-1">
            {payments.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0 text-[13px]"
              >
                <span className="text-gray-500">
                  {p.method}
                  {p.detail ? ` · ${p.detail}` : ''}
                </span>
                <span className="font-medium text-gray-900">{money(p.amount)}</span>
              </div>
            ))}
          </div>
          <div className="text-[12px] text-gray-400 mt-3">
            {items.length} item{items.length === 1 ? '' : 's'}
            {discountAmount > 0 && ` · ${discount.label}`}
            {tipAmount > 0 && ` · ${money(tipAmount)} tip`}
          </div>
          <button
            onClick={() => showToast(`Receipt emailed to ${client.split(' ')[0]}`)}
            className="flex items-center gap-2 border border-gray-200 rounded-full px-5 py-3 text-[13px] font-semibold text-gray-900 mt-6 hover:bg-gray-50 transition-colors"
          >
            <Mail size={15} strokeWidth={1.75} />
            Email receipt
          </button>
        </div>
        <div className="shrink-0 bg-white px-4 pb-6 pt-3">
          <button
            onClick={finish}
            className="w-full bg-gray-900 text-white rounded-full py-4 text-[14px] font-semibold hover:bg-gray-800 transition-colors"
          >
            {fromUpNext ? 'Rate the visit' : 'Done'}
          </button>
        </div>
      </>
    );
  }

  // ----- Checkout -----------------------------------------------------------------
  return (
    <>
      <div className="shrink-0 bg-white flex items-center px-4 h-14">
        <button
          onClick={() => navigate(-1)}
          className="-ml-2 w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100"
          aria-label="Back"
        >
          <ChevronLeft size={22} />
        </button>
        <span className="text-[16px] font-bold text-gray-900 ml-1">Checkout</span>
      </div>

      <div className="flex-1 overflow-y-auto bg-white px-4 pb-6">
        {/* Client */}
        <div className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3.5">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-[12px] font-semibold text-gray-600 shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="text-[14px] font-semibold text-gray-900">{client}</div>
            <div className="text-[12px] text-gray-500">
              {items.length} item{items.length === 1 ? '' : 's'} · {money(subtotal)}
            </div>
          </div>
        </div>

        {/* Items */}
        <SheetSectionLabel>Items</SheetSectionLabel>
        {items.length === 0 && (
          <div className="text-[13px] text-gray-400 border border-dashed border-gray-200 rounded-2xl px-4 py-5 text-center">
            Nothing here yet — add a service or product below.
          </div>
        )}
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 border-b border-gray-50 py-3">
            <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
              {item.type === 'service' ? (
                <Scissors size={15} className="text-gray-700" strokeWidth={1.75} />
              ) : (
                <ShoppingBag size={15} className="text-gray-700" strokeWidth={1.75} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-medium text-gray-900">{item.name}</div>
              <div className="text-[12px] text-gray-400">{item.meta}</div>
            </div>
            <span className="text-[14px] font-semibold text-gray-900">{money(item.price)}</span>
            <button
              onClick={() => setItems((all) => all.filter((i) => i.id !== item.id))}
              className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100"
              aria-label={`Remove ${item.name}`}
            >
              <X size={14} className="text-gray-400" />
            </button>
          </div>
        ))}
        <div className="flex gap-2.5 mt-3">
          <button
            onClick={() => setAddServicesOpen(true)}
            className="flex-1 flex items-center justify-center gap-1.5 border border-gray-200 rounded-full py-3 text-[13px] font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
          >
            <Plus size={14} strokeWidth={2} />
            Service
          </button>
          <button
            onClick={() => setAddProductsOpen(true)}
            className="flex-1 flex items-center justify-center gap-1.5 border border-gray-200 rounded-full py-3 text-[13px] font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
          >
            <Plus size={14} strokeWidth={2} />
            Product
          </button>
        </div>

        {/* Discount */}
        <SheetSectionLabel>Discount</SheetSectionLabel>
        <button
          onClick={() => setDiscountOpen(true)}
          className="w-full flex items-center gap-3 border border-gray-200 rounded-2xl px-4 py-3.5 text-left hover:bg-gray-50 transition-colors"
        >
          <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
            <Percent size={15} className="text-gray-700" strokeWidth={1.75} />
          </div>
          <div className="flex-1">
            <div className="text-[14px] font-medium text-gray-900">
              {discount ? discount.label : 'Add discount'}
            </div>
            {discount && (
              <div className="text-[12px] text-gray-400">−{money(discountAmount)}</div>
            )}
          </div>
          {discount && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                setDiscount(null);
              }}
              className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100"
              aria-label="Remove discount"
            >
              <X size={14} className="text-gray-400" />
            </span>
          )}
        </button>

        {/* Tip */}
        <SheetSectionLabel>Tip</SheetSectionLabel>
        <div className="flex flex-wrap gap-2">
          {TIP_OPTIONS.map((o) => (
            <Chip key={o.id} selected={tip === o.id} onClick={() => setTip(o.id)}>
              {o.label}
            </Chip>
          ))}
        </div>
        {tip === 'custom' && (
          <div className="flex items-center bg-gray-50 rounded-xl px-4 mt-3">
            <span className="text-[15px] font-semibold text-gray-400 mr-1">£</span>
            <input
              value={customTip}
              onChange={(e) => setCustomTip(e.target.value.replace(/[^0-9.]/g, ''))}
              placeholder="0.00"
              inputMode="decimal"
              className="flex-1 bg-transparent h-12 text-[15px] font-semibold text-gray-900 placeholder-gray-300 outline-none min-w-0"
            />
          </div>
        )}

        {/* Summary */}
        <div className="bg-gray-50 rounded-2xl px-4 py-1 mt-6">
          {[
            { label: 'Subtotal', value: money(subtotal) },
            discountAmount > 0 && {
              label: `Discount · ${discount.label}`,
              value: `−${money(discountAmount)}`,
            },
            tipAmount > 0 && { label: 'Tip', value: `+${money(tipAmount)}` },
            paid > 0 && { label: 'Paid so far', value: `−${money(paid)}` },
          ]
            .filter(Boolean)
            .map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between py-3 border-b border-gray-100 text-[13px]"
              >
                <span className="text-gray-500">{row.label}</span>
                <span className="font-medium text-gray-900">{row.value}</span>
              </div>
            ))}
          <div className="flex items-center justify-between py-3.5">
            <span className="text-[14px] font-semibold text-gray-900">
              {paid > 0 ? 'Remaining' : 'Total'}
            </span>
            <span className="text-[18px] font-bold text-gray-900">
              {money(paid > 0 ? remaining : total)}
            </span>
          </div>
        </div>

        {/* Payments taken so far */}
        {payments.length > 0 && (
          <>
            <SheetSectionLabel>Payments</SheetSectionLabel>
            {payments.map((p) => (
              <div key={p.id} className="flex items-center gap-3 border-b border-gray-50 py-3">
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-medium text-gray-900">{p.method}</div>
                  {p.detail && <div className="text-[12px] text-gray-400">{p.detail}</div>}
                </div>
                <span className="text-[14px] font-semibold text-gray-900">{money(p.amount)}</span>
                <button
                  onClick={() => setPayments((all) => all.filter((x) => x.id !== p.id))}
                  className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100"
                  aria-label={`Remove ${p.method} payment`}
                >
                  <X size={14} className="text-gray-400" />
                </button>
              </div>
            ))}
          </>
        )}

        {/* Payment methods */}
        <SheetSectionLabel>
          {paid > 0 ? `Take remaining ${money(remaining)} with` : 'Payment method'}
        </SheetSectionLabel>
        <div className="grid grid-cols-2 gap-2.5">
          {PAYMENT_METHODS.map(({ id, icon: Icon }) => (
            <button
              key={id}
              onClick={() => openMethod(id)}
              disabled={items.length === 0 || remaining <= 0}
              className="flex items-center gap-2.5 rounded-2xl px-4 py-3.5 border border-gray-200 text-left hover:bg-gray-50 transition-colors disabled:opacity-40"
            >
              <Icon size={17} className="text-gray-900" strokeWidth={1.75} />
              <span className="text-[13px] font-medium text-gray-900">{id}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Status bar */}
      <div className="shrink-0 bg-white border-t border-gray-50 px-4 pb-6 pt-3">
        <div className="w-full bg-gray-50 text-gray-500 rounded-full py-4 text-[13px] font-medium text-center">
          {items.length === 0
            ? 'Add items to take a payment'
            : `${money(remaining)} to pay — choose a payment method`}
        </div>
      </div>

      {/* Per-method payment sheet */}
      <SheetShell
        open={Boolean(methodSheet)}
        onClose={() => setMethodSheet(null)}
        title={methodSheet || ''}
        subtitle={`${money(remaining)} remaining`}
        footer={
          <SheetCta
            disabled={
              parsePrice(payAmount) <= 0 || (methodSheet === 'Gift card' && !giftCode.trim())
            }
            onClick={addPayment}
          >
            {parsePrice(payAmount) >= remaining
              ? `Charge ${money(remaining)}`
              : `Add ${money(Math.min(parsePrice(payAmount), remaining))} · split payment`}
          </SheetCta>
        }
      >
        {methodSheet === 'Cash' && (
          <>
            <SheetSectionLabel>Cash received</SheetSectionLabel>
            <div className="flex items-center bg-gray-50 rounded-2xl px-5 py-3.5">
              <span className="text-[22px] font-bold text-gray-400 mr-1">£</span>
              <input
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                placeholder="0.00"
                inputMode="decimal"
                autoFocus
                className="flex-1 bg-transparent text-[22px] font-bold text-gray-900 placeholder-gray-300 outline-none min-w-0"
              />
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {[
                { label: `Exact · ${money(remaining)}`, value: remaining },
                { label: '£10', value: 10 },
                { label: '£20', value: 20 },
                { label: '£50', value: 50 },
              ].map((o) => (
                <Chip
                  key={o.label}
                  selected={parsePrice(payAmount) === o.value}
                  onClick={() => setPayAmount(String(o.value))}
                >
                  {o.label}
                </Chip>
              ))}
            </div>
            {parsePrice(payAmount) > remaining && (
              <div className="text-[12px] text-gray-500 bg-gray-50 rounded-xl px-3.5 py-3 mt-3">
                Change due: {money(parsePrice(payAmount) - remaining)}
              </div>
            )}
            {parsePrice(payAmount) > 0 && parsePrice(payAmount) < remaining && (
              <div className="text-[12px] text-gray-500 bg-gray-50 rounded-xl px-3.5 py-3 mt-3">
                {money(remaining - parsePrice(payAmount))} will still be due — take the rest with
                another method.
              </div>
            )}
          </>
        )}

        {methodSheet === 'Gift card' && (
          <>
            <SheetSectionLabel>Gift card code</SheetSectionLabel>
            <input
              value={giftCode}
              onChange={(e) => setGiftCode(e.target.value)}
              placeholder="e.g. GIFT-4F2A-9QXL"
              autoFocus
              className="w-full bg-gray-50 rounded-xl px-4 h-12 text-[14px] font-medium tracking-wide text-gray-900 placeholder-gray-400 outline-none focus:ring-1 focus:ring-gray-900 uppercase"
            />
            {giftCode.trim() && (
              <div className="text-[12px] text-gray-500 bg-gray-50 rounded-xl px-3.5 py-3 mt-3">
                Balance on card: £60 — enough for {money(Math.min(60, remaining))} of this bill.
              </div>
            )}
            <SheetSectionLabel>Amount to redeem</SheetSectionLabel>
            <div className="flex items-center bg-gray-50 rounded-xl px-4">
              <span className="text-[15px] font-semibold text-gray-400 mr-1">£</span>
              <input
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                inputMode="decimal"
                className="flex-1 bg-transparent h-12 text-[15px] font-semibold text-gray-900 outline-none min-w-0"
              />
            </div>
          </>
        )}

        {methodSheet === 'Bank transfer' && (
          <>
            <SheetSectionLabel>Transfer to</SheetSectionLabel>
            <div className="bg-gray-50 rounded-2xl px-4 py-1">
              {[
                { label: 'Account name', value: 'Salon Soho Ltd' },
                { label: 'Sort code', value: '20-00-00' },
                { label: 'Account number', value: '1234 5678' },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0 text-[13px]"
                >
                  <span className="text-gray-500">{row.label}</span>
                  <span className="font-medium text-gray-900">{row.value}</span>
                </div>
              ))}
            </div>
            <SheetSectionLabel>Payment reference</SheetSectionLabel>
            <input
              value={bankRef}
              onChange={(e) => setBankRef(e.target.value)}
              placeholder={`e.g. ${client.split(' ')[0].toUpperCase()}-0403`}
              className="w-full bg-gray-50 rounded-xl px-4 h-12 text-[14px] text-gray-900 placeholder-gray-400 outline-none focus:ring-1 focus:ring-gray-900"
            />
            <SheetSectionLabel>Amount</SheetSectionLabel>
            <div className="flex items-center bg-gray-50 rounded-xl px-4">
              <span className="text-[15px] font-semibold text-gray-400 mr-1">£</span>
              <input
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                inputMode="decimal"
                className="flex-1 bg-transparent h-12 text-[15px] font-semibold text-gray-900 outline-none min-w-0"
              />
            </div>
          </>
        )}

        {methodSheet === 'Card' && (
          <>
            <SheetSectionLabel>Amount to charge</SheetSectionLabel>
            <div className="flex items-center bg-gray-50 rounded-2xl px-5 py-3.5">
              <span className="text-[22px] font-bold text-gray-400 mr-1">£</span>
              <input
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                inputMode="decimal"
                autoFocus
                className="flex-1 bg-transparent text-[22px] font-bold text-gray-900 placeholder-gray-300 outline-none min-w-0"
              />
            </div>
            <div className="text-[12px] text-gray-400 mt-3">
              The card reader will prompt the client to tap or insert.
            </div>
          </>
        )}
      </SheetShell>

      {/* Add service */}
      <SheetShell
        open={addServicesOpen}
        onClose={() => setAddServicesOpen(false)}
        title="Add service"
        footer={<SheetCta onClick={() => setAddServicesOpen(false)}>Done</SheetCta>}
      >
        {bookableServices.map((s) => (
          <button
            key={s.id}
            onClick={() => addItem(s, 'service')}
            className="w-full flex items-center justify-between py-3.5 border-b border-gray-50 last:border-0 text-left"
          >
            <div>
              <div className="text-[14px] font-medium text-gray-900">{s.name}</div>
              <div className="text-[12px] text-gray-400">{s.duration} · {s.category}</div>
            </div>
            <span className="flex items-center gap-2 text-[14px] font-semibold text-gray-900">
              {s.price}
              <Plus size={15} className="text-gray-400" />
            </span>
          </button>
        ))}
      </SheetShell>

      {/* Add product */}
      <SheetShell
        open={addProductsOpen}
        onClose={() => setAddProductsOpen(false)}
        title="Add product"
        footer={<SheetCta onClick={() => setAddProductsOpen(false)}>Done</SheetCta>}
      >
        {retailProducts.map((p) => (
          <button
            key={p.id}
            onClick={() => addItem(p, 'product')}
            className="w-full flex items-center justify-between py-3.5 border-b border-gray-50 last:border-0 text-left"
          >
            <div>
              <div className="text-[14px] font-medium text-gray-900">{p.name}</div>
              <div className="text-[12px] text-gray-400">{p.meta}</div>
            </div>
            <span className="flex items-center gap-2 text-[14px] font-semibold text-gray-900">
              {money(p.price)}
              <Plus size={15} className="text-gray-400" />
            </span>
          </button>
        ))}
      </SheetShell>

      {/* Discount picker */}
      <SheetShell
        open={discountOpen}
        onClose={() => setDiscountOpen(false)}
        title="Add discount"
        subtitle={`Subtotal ${money(subtotal)}`}
      >
        {checkoutDiscounts.map((d) => (
          <button
            key={d.id}
            onClick={() => {
              setDiscount(d);
              setDiscountOpen(false);
            }}
            className="w-full flex items-center justify-between py-3.5 border-b border-gray-50 last:border-0 text-left"
          >
            <span className="text-[14px] font-medium text-gray-900">{d.label}</span>
            <span className="text-[13px] text-gray-400">
              −{money(d.type === 'percent' ? (subtotal * d.value) / 100 : Math.min(d.value, subtotal))}
            </span>
          </button>
        ))}
        {discount && (
          <button
            onClick={() => {
              setDiscount(null);
              setDiscountOpen(false);
            }}
            className="w-full text-center py-3.5 text-[13px] font-medium text-gray-400 hover:text-gray-900"
          >
            Remove discount
          </button>
        )}
      </SheetShell>
    </>
  );
}
