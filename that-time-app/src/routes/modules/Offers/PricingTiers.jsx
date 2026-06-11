// Pricing Tiers — Advanced section 1 of 7.
// Three optional tiers stacked as expandable cards:
//   A) Early Bird   — discount for booking N hours/days/weeks ahead
//   B) Member       — fixed price for clients tagged "Member"
//   C) Course       — bundled price across the series (recurring only)
// Plus a Priority rule that only appears when 2+ tiers are active.

import { useNavigate, useOutletContext } from 'react-router-dom';
import { Info, Lock } from 'lucide-react';
import ScreenHeader from '../../../components/ScreenHeader';
import TextField from '../../../components/TextField';
import Toggle from '../../../components/Toggle';
import { emptyClassDetails } from '../../../data/offerTypes';
import { emptyAdvancedOptions } from '../../../data/advancedOptions';

// ── Small reusable bits ───────────────────────────────────────────────────

function SectionLabel({ children }) {
  return (
    <div className="text-[12px] font-semibold uppercase tracking-wider text-gray-500 mb-2">
      {children}
    </div>
  );
}

function Segmented({ options, value, onChange }) {
  return (
    <div className="grid gap-2 bg-gray-50 rounded-2xl p-1" style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}>
      {options.map((o) => {
        const active = value === o.key;
        return (
          <button
            key={o.key}
            onClick={() => onChange(o.key)}
            className={
              'h-10 rounded-xl text-[13px] font-medium transition-colors ' +
              (active ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100')
            }
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function PillGroup({ options, value, onChange }) {
  return (
    <div className="flex gap-1.5">
      {options.map((o) => {
        const active = value === o.key;
        return (
          <button
            key={o.key}
            onClick={() => onChange(o.key)}
            className={
              'flex-1 h-11 rounded-xl text-[13px] font-medium transition-colors ' +
              (active ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 hover:bg-gray-100')
            }
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function HelperText({ children, tone = 'muted' }) {
  const cls =
    tone === 'info'
      ? 'text-[12.5px] text-blue-700 bg-blue-50 px-3 py-2.5 rounded-xl flex items-start gap-2'
      : 'text-[12px] text-gray-500 leading-relaxed';
  if (tone === 'info') {
    return (
      <div className={cls}>
        <Info size={14} className="shrink-0 mt-0.5" strokeWidth={1.75} />
        <span>{children}</span>
      </div>
    );
  }
  return <div className={cls}>{children}</div>;
}

// Tier card — collapsed shows toggle row only; expanded reveals fields.
function TierCard({ title, description, enabled, onToggle, children }) {
  return (
    <div className="bg-gray-50 rounded-2xl">
      <div className="flex items-center gap-4 p-4">
        <div className="flex-1">
          <div className="text-[15px] font-medium text-gray-900">{title}</div>
          <div className="text-[13px] text-gray-500 mt-0.5">{description}</div>
        </div>
        <Toggle checked={enabled} onChange={onToggle} />
      </div>
      {enabled && (
        <div className="px-4 pb-4 pt-1 space-y-3">{children}</div>
      )}
    </div>
  );
}

// ── Math helpers for the live preview text ────────────────────────────────

function fmtMoney(n) {
  if (!Number.isFinite(n)) return '—';
  return Number.isInteger(n) ? `£${n}` : `£${n.toFixed(2)}`;
}

function earlyBirdPrice(tier, base) {
  if (tier.discountType === 'percent') {
    const pct = Number(tier.percentOff);
    if (!base || !pct) return null;
    return base * (1 - pct / 100);
  }
  return Number(tier.price) || null;
}

// ── Screen ────────────────────────────────────────────────────────────────

export default function PricingTiers() {
  const navigate = useNavigate();
  const { draft, updateDraft } = useOutletContext();

  const ao = draft.advancedOptions || emptyAdvancedOptions();
  const tiers = ao.pricingTiers || emptyAdvancedOptions().pricingTiers;
  const basePrice = Number(draft.price) || 0;

  // Course tier only renders for recurring classes — depends on the schedule
  // chosen in step 3 of the wizard.
  const schedule = (draft.classDetails || emptyClassDetails()).schedule;
  const isRecurring = Boolean(schedule?.recurrence && schedule.recurrence !== 'never');

  // Auto-populated session count from the series end mode, if set.
  const seriesSessionHint =
    schedule?.endMode === 'sessions' && schedule.endSessions
      ? Number(schedule.endSessions)
      : null;

  const setTiers = (patch) =>
    updateDraft({
      advancedOptions: { ...ao, pricingTiers: { ...tiers, ...patch } },
    });

  const setEarlyBird = (patch) => setTiers({ earlyBird: { ...tiers.earlyBird, ...patch } });
  const setMember    = (patch) => setTiers({ member:    { ...tiers.member,    ...patch } });
  const setCourse    = (patch) => setTiers({ course:    { ...tiers.course,    ...patch } });

  // Priority rule only appears when 2+ tiers are active.
  const activeCount =
    (tiers.earlyBird?.enabled ? 1 : 0) +
    (tiers.member?.enabled ? 1 : 0) +
    (tiers.course?.enabled && isRecurring ? 1 : 0);

  // ── Live preview computations ───────────────────────────────────────────
  const ebPrice = earlyBirdPrice(tiers.earlyBird, basePrice);
  const ebWindow =
    tiers.earlyBird.windowValue
      ? `${tiers.earlyBird.windowValue} ${tiers.earlyBird.windowUnit}${tiers.earlyBird.windowValue === '1' ? '' : 's'}`
      : null;

  const courseSessions = Number(tiers.course.sessionCount) || seriesSessionHint || 0;
  const coursePrice = Number(tiers.course.price) || 0;
  const courseDropTotal = basePrice * courseSessions;
  const courseSavings = courseDropTotal - coursePrice;
  const coursePerSession = courseSessions > 0 ? coursePrice / courseSessions : 0;

  return (
    <>
      <ScreenHeader title="Pricing tiers" onBack={() => navigate('/service')} />

      <div className="flex-1 overflow-y-auto px-5 pt-2 pb-6 space-y-6">

        {/* Sub-header */}
        <div className="text-[14px] text-gray-500 leading-relaxed">
          {basePrice > 0
            ? `Your base price is ${fmtMoney(basePrice)}. Add tiers to offer different rates.`
            : 'Set a base price first in class basics, then come back to add tiers.'}
        </div>

        {/* ── Base price (read-only) ───────────────────────────────────── */}
        <div>
          <SectionLabel>Base price</SectionLabel>
          <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-3">
            <Lock size={16} className="text-gray-400 shrink-0" strokeWidth={1.75} />
            <div className="flex-1">
              <div className="text-[16px] font-semibold text-gray-900">
                {basePrice > 0 ? `${fmtMoney(basePrice)} per participant` : 'Not set'}
              </div>
              <div className="text-[12px] text-gray-500 mt-0.5">Edit base price in class basics</div>
            </div>
          </div>
        </div>

        {/* ── Tier A — Early bird ──────────────────────────────────────── */}
        <div>
          <SectionLabel>Tiered pricing</SectionLabel>
          <div className="space-y-3">
            <TierCard
              title="Early bird"
              description="Discount for clients who book ahead"
              enabled={tiers.earlyBird.enabled}
              onToggle={(v) => setEarlyBird({ enabled: v })}
            >
              {/* Discount type */}
              <div>
                <div className="text-[12px] text-gray-500 mb-1.5">Discount type</div>
                <Segmented
                  options={[
                    { key: 'fixed',   label: 'Fixed price' },
                    { key: 'percent', label: 'Percentage off' },
                  ]}
                  value={tiers.earlyBird.discountType}
                  onChange={(v) => setEarlyBird({ discountType: v })}
                />
              </div>

              {/* Price input — fixed vs percent */}
              {tiers.earlyBird.discountType === 'fixed' ? (
                <TextField
                  label="Early bird price (£)"
                  type="number"
                  value={tiers.earlyBird.price}
                  onChange={(v) => setEarlyBird({ price: v })}
                  placeholder={basePrice ? String(Math.max(0, basePrice - 5)) : '12'}
                />
              ) : (
                <TextField
                  label="Discount (%)"
                  type="number"
                  value={tiers.earlyBird.percentOff}
                  onChange={(v) => setEarlyBird({ percentOff: v })}
                  placeholder="20"
                />
              )}

              {/* Booking window */}
              <div>
                <div className="text-[12px] text-gray-500 mb-1.5">Booking window</div>
                <div className="flex gap-2">
                  <div className="w-24">
                    <TextField
                      label=""
                      type="number"
                      value={tiers.earlyBird.windowValue}
                      onChange={(v) => setEarlyBird({ windowValue: v })}
                      placeholder="2"
                    />
                  </div>
                  <div className="flex-1">
                    <PillGroup
                      options={[
                        { key: 'hours', label: 'Hours' },
                        { key: 'days',  label: 'Days' },
                        { key: 'weeks', label: 'Weeks' },
                      ]}
                      value={tiers.earlyBird.windowUnit}
                      onChange={(v) => setEarlyBird({ windowUnit: v })}
                    />
                  </div>
                </div>
                <div className="text-[12px] text-gray-400 mt-1.5">
                  Available when booked {tiers.earlyBird.windowValue || 'N'} {tiers.earlyBird.windowUnit} or more before class
                </div>
              </div>

              {/* Preview */}
              {ebPrice != null && ebWindow && basePrice > 0 && (
                <div className="bg-white rounded-xl px-3 py-2.5 text-[12.5px] text-gray-700">
                  Clients who book <span className="font-medium">{ebWindow} before</span> will pay{' '}
                  <span className="font-semibold text-gray-900">{fmtMoney(ebPrice)}</span> instead of{' '}
                  <span className="line-through text-gray-400">{fmtMoney(basePrice)}</span>
                </div>
              )}
            </TierCard>

            {/* ── Tier B — Member pricing ─────────────────────────────── */}
            <TierCard
              title="Member pricing"
              description="Special rate for tagged members"
              enabled={tiers.member.enabled}
              onToggle={(v) => setMember({ enabled: v })}
            >
              <TextField
                label="Member price (£)"
                type="number"
                value={tiers.member.price}
                onChange={(v) => setMember({ price: v })}
                placeholder={basePrice ? String(Math.max(0, basePrice - 5)) : '10'}
              />
              <HelperText tone="info">
                Applied automatically to clients with the &ldquo;Member&rdquo; tag on their profile.
              </HelperText>
            </TierCard>

            {/* ── Tier C — Course pricing (recurring only) ────────────── */}
            {isRecurring && (
              <TierCard
                title="Course pricing"
                description="Bundle the series at a single price"
                enabled={tiers.course.enabled}
                onToggle={(v) => setCourse({ enabled: v })}
              >
                <TextField
                  label="Course price (£)"
                  type="number"
                  value={tiers.course.price}
                  onChange={(v) => setCourse({ price: v })}
                  placeholder={basePrice && seriesSessionHint ? String(Math.round(basePrice * seriesSessionHint * 0.85)) : '120'}
                />
                <TextField
                  label="Sessions included"
                  type="number"
                  value={tiers.course.sessionCount}
                  onChange={(v) => setCourse({ sessionCount: v })}
                  placeholder={seriesSessionHint ? String(seriesSessionHint) : '6'}
                />
                {seriesSessionHint && !tiers.course.sessionCount && (
                  <div className="text-[12px] text-gray-400">
                    Auto-filled from your series — edit if you want a different bundle size.
                  </div>
                )}

                {/* Savings preview */}
                {coursePrice > 0 && courseSessions >= 2 && basePrice > 0 && (
                  <div className="bg-white rounded-xl px-3 py-2.5 text-[12.5px] text-gray-700">
                    That&rsquo;s <span className="font-semibold text-gray-900">{fmtMoney(coursePerSession)} per session</span>
                    {courseSavings > 0 && (
                      <> — saving <span className="font-semibold text-emerald-700">{fmtMoney(courseSavings)}</span> vs drop-in rate</>
                    )}
                    {courseSavings <= 0 && (
                      <> — <span className="text-amber-700">no saving vs drop-in</span> at this price</>
                    )}
                  </div>
                )}
              </TierCard>
            )}
          </div>
        </div>

        {/* ── Priority rule (only when 2+ tiers active) ───────────────── */}
        {activeCount >= 2 && (
          <div>
            <SectionLabel>If a client qualifies for multiple tiers</SectionLabel>
            <Segmented
              options={[
                { key: 'lowest', label: 'Use lowest price' },
                { key: 'member', label: 'Use member price' },
              ]}
              value={tiers.priorityRule}
              onChange={(v) => setTiers({ priorityRule: v })}
            />
            <div className="text-[12px] text-gray-500 mt-2 leading-relaxed">
              {tiers.priorityRule === 'lowest'
                ? 'When a client matches more than one tier, charge whichever is cheapest.'
                : 'Member price always wins when a client is tagged as a member, even if another tier is cheaper.'}
            </div>
          </div>
        )}

      </div>

      {/* Sticky footer */}
      <div className="px-5 pb-5 pt-3 shrink-0 bg-white border-t border-gray-100">
        <button
          onClick={() => navigate('/service')}
          className="w-full h-12 rounded-full bg-gray-900 hover:bg-gray-800 text-white text-[15px] font-medium transition-colors"
        >
          Done
        </button>
      </div>
    </>
  );
}
