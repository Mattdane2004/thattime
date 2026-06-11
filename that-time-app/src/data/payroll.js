const money = (value) => Math.round(Number(value || 0));

export const payrollPeriod = {
  id: 'pay_2026_05_18',
  label: '18 May - 24 May',
  payDate: 'Fri 29 May',
  state: 'needs_review',
};

export const pastPayRuns = [
  { id: 'pay_2026_05_11', label: '11 May - 17 May', total: 4682, state: 'paid', paidAt: '24 May' },
  { id: 'pay_2026_05_04', label: '4 May - 10 May', total: 4390, state: 'paid', paidAt: '17 May' },
  { id: 'pay_2026_04_27', label: '27 Apr - 3 May', total: 4215, state: 'approved', paidAt: 'Ready' },
  { id: 'pay_2026_04_20', label: '20 Apr - 26 Apr', total: 0, state: 'skipped', paidAt: 'Skipped' },
];

export const payrollOverrides = {
  s1: { sales: 1840, tips: 92, bankStatus: 'ready', timesheetStatus: 'approved', walletBalance: 428 },
  s2: { sales: 1510, tips: 75, bankStatus: 'ready', timesheetStatus: 'approved', walletBalance: 366 },
  s3: { sales: 2360, tips: 118, bankStatus: 'missing', timesheetStatus: 'approved', walletBalance: 0, adjustment: -80 },
  s4: { sales: 1685, tips: 84, bankStatus: 'ready', timesheetStatus: 'pending', walletBalance: 312 },
  s5: { sales: 360, tips: 18, bankStatus: 'ready', timesheetStatus: 'approved', walletBalance: 146 },
  s6: { sales: 2010, tips: 101, bankStatus: 'ready', timesheetStatus: 'approved', walletBalance: 524 },
  s7: { sales: 540, tips: 27, bankStatus: 'verifying', timesheetStatus: 'pending', walletBalance: 84 },
  s8: { sales: 0, tips: 0, bankStatus: 'missing', timesheetStatus: 'none', walletBalance: 0 },
};

export const payslips = [
  { id: 'ps_24_may', label: '18 May - 24 May', date: '29 May 2026', gross: 756, deductions: 0, net: 756, state: 'Ready' },
  { id: 'ps_17_may', label: '11 May - 17 May', date: '22 May 2026', gross: 712, deductions: 0, net: 712, state: 'Paid' },
  { id: 'ps_10_may', label: '4 May - 10 May', date: '15 May 2026', gross: 689, deductions: 0, net: 689, state: 'Paid' },
];

export function formatMoney(value) {
  return `£${money(value).toLocaleString('en-GB')}`;
}

export function bankStatusLabel(status) {
  if (status === 'ready') return 'Bank ready';
  if (status === 'verifying') return 'Bank verifying';
  if (status === 'missing') return 'Bank needed';
  return 'No payout';
}

export function payrollStateLabel(state) {
  if (state === 'needs_review') return 'Needs review';
  if (state === 'approved') return 'Approved';
  if (state === 'paid') return 'Paid';
  if (state === 'skipped') return 'Skipped';
  return 'Draft';
}

export function memberPayrollProfile(member = {}) {
  const override = payrollOverrides[member.id] || {};
  const hasPay = (member.payment?.model || member.payment?.type) !== 'none' && member.payment?.includedInPayRuns !== false;
  return {
    sales: override.sales ?? estimatedSales(member),
    tips: override.tips ?? Math.round(Number(member.rota?.thisWeekHours || 0) * 2),
    bankStatus: hasPay ? (override.bankStatus || bankStatusFromMember(member)) : 'none',
    timesheetStatus: override.timesheetStatus || (hasPay ? 'approved' : 'none'),
    walletBalance: override.walletBalance ?? 0,
    adjustment: override.adjustment || 0,
  };
}

export function calculatePayrollLine(member = {}) {
  const profile = memberPayrollProfile(member);
  const payment = member.payment || {};
  const model = payment.model || (payment.type === 'contractor' ? 'commission' : 'hourly');
  const hours = Number(member.rota?.thisWeekHours || 0);
  const rate = numericRate(payment);
  const wages = wageAmount(model, rate, payment.ratePeriod || payment.terms?.ratePeriod || 'hourly', hours);
  const commissionPercent = Number(payment.commission || payment.terms?.commission || 0);
  const commissionEnabled = Boolean(
    payment.commissionEnabled ||
    payment.terms?.commissionEnabled ||
    ['commission', 'hybrid'].includes(model) ||
    commissionPercent > 0,
  );
  const commission = commissionEnabled ? money(profile.sales * (commissionPercent / 100)) : 0;
  const rentEnabled = Boolean(
    payment.chairRentEnabled ||
    payment.terms?.chairRentEnabled ||
    ['chair_rent', 'hybrid'].includes(model),
  );
  const chairRent = rentEnabled ? numericRent(payment) : 0;
  const sessionPay = fixedSessionPay(member, payment, model, commissionPercent);
  const tips = payment.tips === false ? 0 : profile.tips;
  const gross = wages + sessionPay + commission + tips;
  const deductions = chairRent + Math.abs(Math.min(0, profile.adjustment));
  const net = gross - deductions + Math.max(0, profile.adjustment);
  const checks = confidenceChecks({ member, profile, net, model });

  return {
    memberId: member.id,
    memberName: member.name,
    role: member.role,
    model,
    hours,
    sales: profile.sales,
    wages: wages + sessionPay,
    commission,
    tips,
    chairRent,
    adjustment: profile.adjustment,
    gross,
    deductions,
    net,
    bankStatus: profile.bankStatus,
    timesheetStatus: profile.timesheetStatus,
    checks,
    payoutStatus: checks.some((check) => check.blocking) ? 'Blocked' : 'Ready',
  };
}

export function buildPayrollPrototype(members = []) {
  const lines = members
    .filter((member) => member.active || member.status === 'pending' || member.status === 'needs_setup')
    .map(calculatePayrollLine);
  const totals = lines.reduce((sum, line) => ({
    gross: sum.gross + line.gross,
    deductions: sum.deductions + line.deductions,
    net: sum.net + line.net,
    wages: sum.wages + line.wages,
    commission: sum.commission + line.commission,
    tips: sum.tips + line.tips,
    rent: sum.rent + line.chairRent,
    blocked: sum.blocked + (line.payoutStatus === 'Blocked' ? 1 : 0),
  }), { gross: 0, deductions: 0, net: 0, wages: 0, commission: 0, tips: 0, rent: 0, blocked: 0 });
  const tasks = payrollTasks(lines);
  const staffBalances = lines.map((line) => ({
    ...line,
    balance: memberPayrollProfile({ id: line.memberId }).walletBalance + Math.max(0, line.net),
  }));

  return {
    period: payrollPeriod,
    lines,
    totals,
    tasks,
    staffBalances,
    pastRuns: pastPayRuns,
  };
}

function payrollTasks(lines) {
  const tasks = [];
  lines.forEach((line) => {
    if (line.bankStatus === 'missing') {
      tasks.push({ id: `${line.memberId}_bank`, type: 'payout', title: 'Bank account needed', memberName: line.memberName, detail: 'They can add bank details from Wallet.', severity: 'high' });
    }
    if (line.bankStatus === 'verifying') {
      tasks.push({ id: `${line.memberId}_verify`, type: 'payout', title: 'Bank verification pending', memberName: line.memberName, detail: 'Payout is held until verification completes.', severity: 'medium' });
    }
    if (line.timesheetStatus === 'pending') {
      tasks.push({ id: `${line.memberId}_time`, type: 'timesheet', title: 'Timesheet needs approval', memberName: line.memberName, detail: `${line.hours} hours waiting for approval.`, severity: 'medium' });
    }
    if (line.chairRent > 0) {
      tasks.push({ id: `${line.memberId}_rent`, type: 'rent', title: 'Chair rent deduction', memberName: line.memberName, detail: `${formatMoney(line.chairRent)} will be deducted this run.`, severity: 'low' });
    }
    if (line.commission > 0) {
      tasks.push({ id: `${line.memberId}_commission`, type: 'commission', title: 'Commission ready', memberName: line.memberName, detail: `${formatMoney(line.commission)} from ${formatMoney(line.sales)} sales.`, severity: 'low' });
    }
  });
  return tasks.sort((a, b) => severityRank(a.severity) - severityRank(b.severity)).slice(0, 8);
}

function confidenceChecks({ profile, net, model }) {
  const checks = [];
  if (profile.bankStatus === 'missing') checks.push({ label: 'Missing bank account', blocking: true });
  if (profile.bankStatus === 'verifying') checks.push({ label: 'Bank verification pending', blocking: true });
  if (profile.timesheetStatus === 'pending') checks.push({ label: 'Timesheet unapproved', blocking: true });
  if ((model === 'commission' || model === 'no_base') && profile.sales === 0) checks.push({ label: 'No completed sales', blocking: false });
  if (net < 0) checks.push({ label: 'Negative balance', blocking: true });
  if (!checks.length) checks.push({ label: 'Ready to pay', blocking: false });
  return checks;
}

function bankStatusFromMember(member) {
  if (member.payment?.payoutStatus === 'Ready') return 'ready';
  if (member.payment?.payoutStatus === 'Bank details needed') return 'missing';
  if (member.onboarding?.payoutSetup === 'not_required') return 'none';
  return 'missing';
}

function estimatedSales(member) {
  const hours = Number(member.rota?.thisWeekHours || 0);
  return Math.round(hours * 52);
}

function numericRate(payment = {}) {
  const direct = Number(payment.rate || payment.terms?.rate || 0);
  if (direct > 0) return direct;
  const match = String(payment.payRate || '').match(/(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : 0;
}

function numericRent(payment = {}) {
  const direct = Number(payment.rentAmount || payment.terms?.rentAmount || 0);
  if (direct > 0) return direct;
  const match = String(payment.payRate || '').match(/(\d+(?:\.\d+)?)/);
  return match && /rent/i.test(String(payment.payRate || '')) ? Number(match[1]) : 0;
}

function wageAmount(model, rate, period, hours) {
  if (!rate || ['commission', 'chair_rent', 'no_base', 'none'].includes(model)) return 0;
  if (model === 'per_session') return 0;
  if (period === 'yearly') return money(rate / 52);
  if (period === 'monthly') return money((rate * 12) / 52);
  if (period === 'weekly') return money(rate);
  return money(rate * hours);
}

function fixedSessionPay(member, payment, model, commissionPercent) {
  const rateText = String(payment.payRate || '').toLowerCase();
  const rate = numericRate(payment);
  if (!rate || commissionPercent > 0) return 0;
  if (model !== 'per_session' && !['commission', 'chair_rent', 'hybrid'].includes(model) && !/session|class/.test(rateText)) return 0;
  if (model !== 'per_session' && !/session|class/.test(rateText)) return 0;
  const sessions = (member.schedule?.weekly || []).filter((shift) => shift.enabled).length || Math.max(1, Math.round(Number(member.rota?.thisWeekHours || 0) / 6));
  return money(rate * sessions);
}

function severityRank(severity) {
  if (severity === 'high') return 0;
  if (severity === 'medium') return 1;
  return 2;
}
