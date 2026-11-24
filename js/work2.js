// ===================== WORK & MONEY: SHIFTS, DAYS OFF, CREDIT, TAXES, BUDGET, ELECTRICITY =====================

// ---------- job schedules ----------
const SHIFTS = {
  day:     { label: 'Day shift · Mon–Fri · start 6–9 AM', days: [1, 1, 1, 1, 1, 0, 0], from: 5, to: 11, late: 9.1 },
  early:   { label: 'Early shift · Mon–Fri · start 3–5 AM', days: [1, 1, 1, 1, 1, 0, 0], from: 2.5, to: 7, late: 5.1 },
  night:   { label: 'Night shift · Mon–Fri · start 8–10 PM', days: [1, 1, 1, 1, 1, 0, 0], from: 19, to: 23, late: 22.1 },
  weekend: { label: 'Weekend shift · Wed–Sun · start 9 AM–noon', days: [0, 0, 1, 1, 1, 1, 1], from: 8, to: 14, late: 12.1 },
};
const NIGHT_JOBS = ['Security Guard', 'Police Officer', '911 Dispatcher', 'Nurse', 'EMT', 'Paramedic', 'Truck Driver', 'Air Traffic Controller', 'Warehouse Worker', 'Hospital Cleaner'];
const EARLY_JOBS = ['Baker', 'Barista', 'Mail Carrier', 'Farmer', 'Farm Hand', 'Garbage Collector', 'Delivery Driver'];
const WEEKEND_JOBS = ['Server', 'Line Cook', 'Chef', 'Cashier', 'Sales Associate', 'Movie Theater Usher', 'Lifeguard', 'Golf Caddy', 'Dog Walker', 'Pet Store Clerk', 'Grocery Bagger', 'Busser', 'Dishwasher', 'Fast Food Worker', 'Street Performer', 'Musician', 'Actor', 'Dancer', 'Swim Instructor', 'Tennis Coach', 'Gym Front Desk', 'Florist', 'Taxi Driver'];
function shiftOf(job) {
  if (NIGHT_JOBS.includes(job.name)) return 'night';
  if (EARLY_JOBS.includes(job.name)) return 'early';
  if (WEEKEND_JOBS.includes(job.name)) return 'weekend';
  return 'day';
}
const ESSENTIAL = ['Health', 'Public Service'];
function worksOn(day) {
  const j = S.job; if (!j) return false;
  const job = JOBS[j.id], sh = SHIFTS[shiftOf(job)];
  if (!sh.days[weekday(day)]) return false;
  if (day === S.day && S.snowDay && !ESSENTIAL.includes(job.cat)) return false;
  const h = holidayToday(day);
  if (h && h.closed && shiftOf(job) === 'day') return false;
  return true;
}
const worksToday = () => worksOn(S.day);
function shiftNow() { return S.job ? SHIFTS[shiftOf(JOBS[S.job.id])] : SHIFTS.day; }

// ---------- vacation & sick days ----------
function ensureWorkState() {
  if (S.credit === undefined) S.credit = 600;
  if (!S.budget) S.budget = { Housing: 0, Food: 60, Transport: 20, Fun: 40, Shopping: 40, Bills: 40, Health: 20, Pets: 15 };
  if (!S.taxYear) S.taxYear = { year: dateOf().year, wages: 0, withheld: 0, side: 0 };
  if (S.kwh === undefined) S.kwh = 0;
  if (!S.thermostat) S.thermostat = 'normal';
  if (S.job && S.job.pto === undefined) giveBenefits(S.job);
  if (S.job && !S.job.boss) setupWorkplace(S.job);
}
function giveBenefits(j) { const ins = JOBS[j.id].insurance; j.pto = ins ? 10 : 0; j.sickDays = ins ? 6 : 3; }
function takeVacationDay() {
  const j = S.job; if (!j) return;
  if (!worksToday() || S.today.worked) return nope('You don\'t work today anyway!');
  if (!j.pto) return nope('You don\'t have any vacation days left. Jobs with benefits give paid vacation.');
  j.pto--; S.today.worked = true; j.weekHours += 8; fun2(12);
  log(`🏖️ You took a paid vacation day! (${j.pto} left this year)`, 'good'); done();
}
function useSickDay() {
  const j = S.job;
  if (!j || !j.sickDays) return false;
  if (!(S.ill || S.needs.health < 70)) return false;
  j.sickDays--; j.weekHours += 8;
  log(`📞 You used a paid sick day. Rest up! (${j.sickDays} left)`);
  return true;
}

// ---------- credit score ----------
function creditWord(c = S.credit) { return c < 580 ? 'Poor' : c < 670 ? 'Fair' : c < 740 ? 'Good' : c < 800 ? 'Very Good' : 'Excellent'; }
function credit(n, why) {
  const before = S.credit;
  S.credit = Math.max(300, Math.min(850, Math.round(S.credit + n)));
  if (Math.abs(n) >= 10) log(`📈 Credit score ${n > 0 ? 'went up' : 'went down'} to ${S.credit}: ${why}`, n > 0 ? 'good' : 'bad');
  if (S.credit >= 740 && before < 740) unlock('credit');
}
function creditCard() {
  const c = S.credit, pct = (c - 300) / 550 * 100;
  return `<div class="card"><h3>📈 Credit Score: ${c} <span class="muted">(${creditWord()})</span></h3>
    <div class="bar"><div class="fill ${c < 580 ? 'low' : c < 670 ? 'mid' : 'ok'}" style="width:${pct}%"></div></div>
    <p class="muted small">300 = Poor · 580 = Fair · 670 = Good · 740 = Very Good · 800+ = Excellent</p>
    <ul class="notes"><li>✅ Paying rent and bills on time makes it go up</li><li>❌ Missing rent, overdrafts and big debts make it go down</li><li>🏠 Landlords and banks check it. A good score means lower loan interest!</li></ul></div>`;
}
const loanRate = () => S.credit >= 740 ? 0.01 : S.credit >= 670 ? 0.015 : 0.02;

// ---------- yearly taxes ----------
function taxCalc() {
  const t = S.taxYear;
  const taxable = Math.max(0, t.wages - 3000);
  const owe = Math.round(taxable * 0.12 + taxable * 0.04 + t.side * 0.1);
  return { owe, refund: Math.round(t.withheld - owe) };
}
function taxSeason() { const { m, d } = dateOf(); return (m >= 0 && m < 3) || (m === 3 && d <= 15); }
function taxCard() {
  const t = S.taxYear, due = S.taxDue;
  if (!due) return `<div class="card money"><h3>🧾 Taxes</h3><p class="muted">Every spring (by <b>April 15</b>) you file a tax return for last year. Wages so far this year: ${money(t.wages)} · Side income: ${money(t.side)}</p></div>`;
  const c = taxCalc();
  return `<div class="card money"><h3>🧾 File Your Taxes</h3><p>It's tax season! File for ${due.year} by <b>April 15</b>.</p>
    <table class="stub"><tr><td>💼 Wages from jobs (W-2)</td><td>${money(due.wages)}</td></tr><tr><td>💰 Side income</td><td>${money(due.side)}</td></tr><tr><td>➖ Standard deduction</td><td>-${money(3000)}</td></tr>
    <tr><td>🧮 Tax you owe for the year</td><td>${money(due.owe)}</td></tr><tr><td>✅ Already taken from your paychecks</td><td>${money(due.withheld)}</td></tr>
    <tr class="total"><td>${due.refund >= 0 ? '🎉 Your refund' : '😬 You still owe'}</td><td>${money(Math.abs(due.refund))}</td></tr></table>
    <button class="btn primary sm" onclick="fileTaxes()">📝 File my taxes</button>
    <p class="lesson">💡 If more tax was taken from your paychecks than you owe, you get a refund. Side income isn't taxed until now, so you might owe!</p></div>`;
}
function fileTaxes() {
  const due = S.taxDue; if (!due) return;
  pass(1, 'study');
  if (due.refund >= 0) earn(due.refund, `Tax refund for ${due.year}`); else charge(-due.refund, `Taxes owed for ${due.year}`);
  log(due.refund >= 0 ? `🧾 You filed your taxes and got a ${money(due.refund)} refund!` : `🧾 You filed your taxes and paid the ${money(-due.refund)} you owed.`, 'good');
  S.taxDue = null; unlock('taxes'); credit(3, 'filed taxes on time'); done();
}
function taxNewDay() {
  const { m, d, year } = dateOf();
  if (m === 0 && d === 1) {
    const t = S.taxYear; const c = taxCalc();
    S.taxDue = { year: t.year, wages: Math.round(t.wages), side: Math.round(t.side), withheld: Math.round(t.withheld), owe: c.owe, refund: c.refund };
    S.taxYear = { year, wages: 0, withheld: 0, side: 0 };
    if (S.job) giveBenefits(S.job);
    if (S.taxDue.wages + S.taxDue.side > 0) queueModal(`<h2>🧾 Tax Season Is Here</h2><p>It's a new year! You need to file your ${S.taxDue.year} taxes by <b>April 15</b> at City Hall (or on your phone).</p>`);
    else S.taxDue = null;
  }
  if (m === 3 && d === 16 && S.taxDue) {
    charge(100, 'Late tax filing penalty');
    log('⚠️ You missed the April 15 tax deadline! $100 penalty. File right away at City Hall.', 'bad');
    credit(-15, 'late taxes');
  }
}

// ---------- budget ----------
const CATS = ['Housing', 'Food', 'Transport', 'Fun', 'Shopping', 'Bills', 'Health', 'Pets'];
const CAT_ICONS = { Housing: '🏠', Food: '🍎', Transport: '🚗', Fun: '🎉', Shopping: '🛍️', Bills: '🧾', Health: '🩺', Pets: '🐾' };
function catOf(label) {
  const l = label.toLowerCase();
  if (/rent|mortgage|property|move in|bought .*house|down payment|land|construction/.test(l)) return 'Housing';
  if (/grocer|meal|food|lunch|pancake|milk|egg|bread|cheese|apple|banana|chicken|veggie|pasta|sauce|rice|tortilla|fish|soda|water|ice cream|sundae|cocoa|cookie|cake|candy|marshmallow|pizza|chips|cereal|fruit|seafood/.test(l)) return 'Food';
  if (/bus|gas|car|tire|oil|tow|parking|flight|ticket to|license|test fee|bike/.test(l) && !/pet/.test(l)) return 'Transport';
  if (/pet|vet|dog|cat|toy/.test(l)) return 'Pets';
  if (/doctor|hospital|dentist|medicine|flu|insurance|emergency/.test(l)) return 'Health';
  if (/bill|utilit|electric|phone|internet|loan|fee|tax/.test(l)) return 'Bills';
  if (/ticket|movie|ride|game|lesson|surf|ski|tour|sled|skating|hayride|carnival|show|class|tuition|camp|spa|spring/.test(l)) return 'Fun';
  return 'Shopping';
}
function trackSpend(label, amount) {
  S.week.cats = S.week.cats || {};
  const c = catOf(label);
  S.week.cats[c] = (S.week.cats[c] || 0) + amount;
}
function budgetHtml(compact) {
  const cats = S.week.cats || {};
  return `<p class="muted small">Plan how much to spend each week. This week so far:</p>
    <table class="stub budget">${CATS.map(c => { const spent = cats[c] || 0, plan = S.budget[c] || 0, over = plan && spent > plan; return `<tr><td>${CAT_ICONS[c]} ${c}</td><td class="${over ? 'minus' : ''}">${money(spent)}${plan ? ` / ${money(plan)}` : ''} ${over ? '⚠️' : plan ? '✅' : ''}</td></tr>`; }).join('')}</table>
    ${compact ? '' : `<div class="budgetedit">${CATS.map(c => `<label>${CAT_ICONS[c]} ${c}<input type="number" min="0" step="5" id="bud_${c}" value="${S.budget[c] || 0}"></label>`).join('')}</div><button class="btn primary sm" onclick="saveBudget()">Save my budget</button>`}`;
}
function saveBudget() { CATS.forEach(c => { const v = Number(($('#bud_' + c) || {}).value || 0); S.budget[c] = Math.max(0, Math.round(v)); }); log('📊 You saved your weekly budget plan.', 'good'); unlock('budgeter'); save(); render(); }
function budgetReport() {
  const cats = S.week.cats || {};
  const rows = CATS.filter(c => (cats[c] || 0) > 0 || S.budget[c]).map(c => { const spent = cats[c] || 0, plan = S.budget[c] || 0; return `<tr class="${plan && spent > plan ? 'minus' : ''}"><td>${CAT_ICONS[c]} ${c}</td><td>${money(spent)}${plan ? ` of ${money(plan)} ${spent > plan ? '⚠️ over' : '✅'}` : ''}</td></tr>`; });
  return rows.length ? `<h3>📊 Your budget last week</h3><table class="stub">${rows.join('')}</table>` : '';
}

// ---------- electricity ----------
function useKwh(h, mode) {
  if (S.home === 'parents' && !S.kwhParents) { /* parents pay, but still count */ }
  const se = seasonOf();
  let k = hasF('fridge') ? 0.05 : 0;
  if (S.lightsOn) k += 0.08;
  if (se === 'winter') k += 0.25 * { eco: 0.6, normal: 1, toasty: 1.6 }[S.thermostat];
  if (S.weather === 'hot' && has('ac')) k += 0.35;
  if (S.weather === 'hot' && has('fan')) k += 0.03;
  if (S.powerOut) k = 0;
  S.kwh += k * h;
  if (atHome() && se === 'winter' && mode !== 'sleep') S.needs.fun = clamp(S.needs.fun + { eco: -0.4, normal: 0, toasty: 0.3 }[S.thermostat] * h);
  if (atHome() && S.weather === 'hot' && has('ac') && mode !== 'sleep') S.needs.fun = clamp(S.needs.fun + 0.8 * h);
}
function electricBill() { return Math.round(S.kwh * 1.3); }
function toggleLights() { S.lightsOn = !S.lightsOn; log(S.lightsOn ? '💡 You turned the lights on.' : '💡 You turned the lights off. Saving energy!'); render(); }
function setThermostat(v) { S.thermostat = v; log(`🌡️ Thermostat set to ${{ eco: 'Eco (a bit chilly, cheap)', normal: 'Normal', toasty: 'Toasty (warm, costs more)' }[v]}.`); render(); }
function energyCard() {
  const se = seasonOf();
  return `<div class="card energy"><h3>⚡ Energy <span class="muted small">· this week: ${S.kwh.toFixed(1)} kWh ≈ ${money(electricBill())}${S.home === 'parents' ? ' (your parents pay)' : ''}</span></h3>
    <div class="row"><button class="btn sm ${S.lightsOn ? 'primary' : 'ghost'}" onclick="toggleLights()">💡 Lights: ${S.lightsOn ? 'ON' : 'off'}</button>
    ${se === 'winter' ? `<span class="muted small">🌡️ Heat:</span>${['eco', 'normal', 'toasty'].map(v => `<button class="btn sm ${S.thermostat === v ? 'primary' : 'ghost'}" onclick="setThermostat('${v}')">${{ eco: '❄️ Eco', normal: '🙂 Normal', toasty: '🔥 Toasty' }[v]}</button>`).join('')}` : ''}
    ${S.powerOut ? '<span class="chip warn">🔌 The power is out!</span>' : ''}</div>
    <p class="muted small">Leaving lights on and blasting the heat or AC makes your electric bill bigger!</p></div>`;
}
