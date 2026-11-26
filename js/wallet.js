// ===================== WALLET & BANK: real money that never vanishes =====================
// S.money = your BANK ACCOUNT (checking). Every paycheck and every dollar you earn is deposited here.
// S.cash  = the CASH in your wallet. Take it out at an ATM, spend it, or put it back in the bank.
// Every move is written on your bank statement, so you can always see where your money went.
// This file loads AFTER ui.js so it can wrap the screens.

const ATM_PLACES = { bank: 'Maple Bank', mall: 'the Mall', market: 'the Supermarket', cityhall: 'City Hall', hospital: 'the Hospital', jobcenter: 'the Job Center' };

function ensureWalletState() {
  if (S.cash === undefined) {
    // everyone starts with a little cash in their wallet
    const c = Math.min(20, Math.max(0, Math.floor(S.money)));
    S.cash = c; S.money -= c;
  }
  if (S.payCash === undefined) S.payCash = true;
  if (!S.ledger) S.ledger = [];
}
const _ensureRealLifeW = ensureRealLife;
ensureRealLife = function () { _ensureRealLifeW(); ensureWalletState(); };

// ---------- the bank statement keeps more history ----------
function ledger(amount, label, cash) {
  if (!S || !S.ledger || !amount) return;
  S.ledger.unshift({ day: S.day, hour: S.hour, amount: Math.round(amount * 100) / 100, label, bal: Math.round(S.money * 100) / 100, cash: cash ? Math.round((S.cash || 0) * 100) / 100 : undefined });
  if (S.ledger.length > 250) S.ledger.length = 250;
}

// ---------- paying for things: cash first (if you have it), then your debit card ----------
const _spendW = spend;
spend = function (a, l) {
  if (!(a > 0)) return _spendW(a, l);
  const cash = S.cash || 0;
  if (S.payCash && cash >= a) {
    S.cash = Math.round((cash - a) * 100) / 100;
    S.week.expenses += a; S.week.lines.push({ label: l + ' (cash)', amount: -a });
    trackSpend(l, a); ledger(-a, l, true);
    return true;
  }
  if (S.money >= a) return _spendW(a, l);
  if (S.money + cash >= a) {
    // not enough in the bank: use the cash in your wallet for the rest
    const fromCash = Math.round((a - Math.max(0, S.money)) * 100) / 100;
    S.cash = Math.round((cash - fromCash) * 100) / 100;
    S.money += fromCash;
    toast(`👛 You used ${money(fromCash)} of your cash too.`);
    return _spendW(a, l);
  }
  nope(`You need ${money(a)} but only have ${money(Math.max(0, S.money))} in the bank${cash > 0 ? ' and ' + money(cash) + ' cash' : ''}.`);
  return false;
};
// how much you can spend right now (bank + cash)
function canPay(a) { return S.money + (S.cash || 0) >= a; }

// ---------- the bank: every move goes on your statement ----------
const _bankW = bank;
bank = function (action, amt) {
  if (action === 'cashout' || action === 'cashin') return atm(action, amt);
  const m = S.money;
  _bankW(action, amt);
  const d = Math.round((S.money - m) * 100) / 100;
  if (d) {
    ledger(d, { deposit: 'Moved to your savings account 🐷', withdraw: 'Moved from savings to checking', borrow: 'Borrowed from the bank (a loan you pay back)', repay: 'Paid back part of your loan' }[action] || 'Bank');
    save(); render();
  }
};

function atHereATM() { return ATM_PLACES[S.loc] && !S.traveling ? ATM_PLACES[S.loc] : ''; }
function atm(action, amt) {
  const where = atHereATM();
  if (!where) return nope('🏧 There\'s no ATM here. Find one at the Bank, the Mall, the Supermarket, City Hall, the Hospital or the Job Center.');
  if (action === 'cashout') {
    if (amt === 'all') amt = Math.floor(Math.max(0, S.money));
    if (!(amt > 0)) return nope('There\'s no money in your bank account to take out.');
    if (amt > S.money) return nope(`You only have ${money(Math.max(0, S.money))} in your bank account.`);
    S.money -= amt; S.cash = (S.cash || 0) + amt;
    ledger(-amt, `🏧 ATM at ${where}: took out cash`);
    log(`🏧 You took ${money(amt)} cash out of the ATM at ${where}. It's in your wallet now. 👛`);
  } else {
    if (amt === 'all') amt = Math.floor((S.cash || 0) * 100) / 100;
    if (!(amt > 0)) return nope('Your wallet is empty.');
    if (amt > (S.cash || 0)) return nope(`You only have ${money(S.cash || 0)} cash.`);
    S.cash -= amt; S.money += amt;
    ledger(amt, `🏧 ATM at ${where}: put cash in the bank`);
    log(`🏧 You put ${money(amt)} cash into your bank account. It's safe there!`, 'good');
  }
  save(); render();
  if ($('#modal').classList.contains('open') && $('#walletBox')) walletModal();
}

// show cash as real bills and coins
function billsPicture(n) {
  let left = Math.round(n * 100), out = [];
  for (const [v, t] of [[10000, '$100'], [2000, '$20'], [1000, '$10'], [500, '$5'], [100, '$1'], [25, '25¢'], [10, '10¢'], [5, '5¢'], [1, '1¢']]) {
    const k = Math.floor(left / v); left -= k * v;
    if (k) out.push(`<span class="bill ${v < 100 ? 'coin' : ''}">${t}${k > 1 ? ' × ' + k : ''}</span>`);
  }
  return out.join(' ') || '<span class="muted">Empty!</span>';
}

function walletModal() {
  const where = atHereATM();
  const amts = [20, 50, 100, 500];
  showModal(`<div id="walletBox"><h2>👛 Your Money</h2>
    <div class="grid two">
      <div class="card"><h3>🏦 Bank Account</h3><p class="big ${S.money < 0 ? 'neg' : ''}">${money(S.money)}</p>
        <p class="muted small">Your pay goes here automatically (direct deposit). Your debit card spends from here. It's safe even if you lose your wallet!</p></div>
      <div class="card"><h3>👛 Cash in Your Wallet</h3><p class="big">${money(S.cash || 0)}</p><p>${billsPicture(S.cash || 0)}</p>
        <p class="muted small">Cash you carry with you. Take some out at an ATM.</p></div>
    </div>
    <p>🐷 Savings: <b>${money(S.savings)}</b>${S.loan > 0 ? ` · 💳 You owe the bank: <b class="neg">${money(S.loan)}</b>` : ''} · Everything together: <b>${money(S.money + (S.cash || 0) + S.savings)}</b></p>
    <label class="row"><input type="checkbox" ${S.payCash ? 'checked' : ''} onchange="S.payCash=this.checked;save();render()"> Pay with cash first when I have enough (otherwise my debit card pays)</label>
    ${where ? `<div class="card"><h3>🏧 ATM at ${where}</h3>
      <p class="muted small">Take out cash:</p><div class="row">${amts.map(a => `<button class="btn primary sm" onclick="atm('cashout',${a})">${money(a)}</button>`).join('')}</div>
      <p class="muted small">Put cash back in the bank:</p><div class="row">${[20, 50].map(a => `<button class="btn ghost sm" onclick="atm('cashin',${a})">${money(a)}</button>`).join('')}<button class="btn ghost sm" onclick="atm('cashin','all')">All my cash</button></div></div>`
      : '<p class="muted">🏧 To take out or put in cash, go to an ATM: at the Bank, the Mall, the Supermarket, City Hall, the Hospital or the Job Center.</p>'}
    </div>`, [{ label: '📜 Where did my money go?', cls: 'ghost', keepOpen: true, fn: () => moneyWhereModal() }, { label: 'Close', cls: 'primary' }]);
}

// ---------- where did my money go? ----------
function moneyGroup(label) {
  const L = label.toLowerCase();
  if (/paid you|paycheck|pay for today|salary|pension|bonus|tip/.test(L)) return '💼 Pay from work';
  if (/loan|borrow/.test(L)) return '💳 Loans';
  if (/savings/.test(L)) return '🐷 Savings';
  if (/atm/.test(L)) return '🏧 ATM cash';
  if (/rent|mortgage|electric|water|utilit|insurance|phone|internet|bill|tax|fee/.test(L)) return '🧾 Bills & taxes';
  if (/food|grocer|snack|meal|restaurant|diner|pizza|lunch|dinner|breakfast|ice cream|cocoa|bakery|drink|soda/.test(L)) return '🍎 Food';
  if (/doctor|hospital|dentist|medicine|vet|emergency/.test(L)) return '🩺 Doctor & health';
  if (/gas|bus|taxi|car|flight|ticket|trip/.test(L)) return '🚌 Getting around & trips';
  return null;
}
function moneyWhereHtml(days) {
  const from = S.day - days;
  const rows = S.ledger.filter(r => r.day > from);
  const ins = {}, outs = {};
  let tin = 0, tout = 0;
  for (const r of rows) {
    if (/ATM/.test(r.label)) continue;   // moving your own money between bank and wallet isn't earning or spending
    const g = moneyGroup(r.label) || (r.amount > 0 ? '💰 ' + r.label.replace(/\s*\(.*\)$/, '').slice(0, 40) : '🛍️ Shopping & other');
    if (r.amount > 0) { ins[g] = (ins[g] || 0) + r.amount; tin += r.amount; } else { outs[g] = (outs[g] || 0) - r.amount; tout -= r.amount; }
  }
  const list = (o) => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, v]) => `<li>${esc(k)} <b>${money(v)}</b></li>`).join('') || '<li class="muted">Nothing yet</li>';
  return `<div class="grid two"><div><h4>➕ Money in: ${money(tin)}</h4><ul class="notes">${list(ins)}</ul></div><div><h4>➖ Money out: ${money(tout)}</h4><ul class="notes">${list(outs)}</ul></div></div>`;
}
function moneyWhereModal() {
  const rows = S.ledger.slice(0, 40);
  showModal(`<h2>📜 Where Did My Money Go?</h2><p class="muted">The last 7 days:</p>${moneyWhereHtml(7)}
    <h3>Every dollar, newest first</h3>
    <div class="tablewrap"><table class="stub statement"><tr><th>When</th><th>What</th><th>Amount</th><th>Bank after</th></tr>${rows.map(r => `<tr class="${r.amount < 0 ? 'minus' : 'plus'}"><td>${dateText(r.day)} ${fmtTime(r.hour)}</td><td>${r.cash !== undefined ? '<small class="muted">👛 CASH</small><br>' : ''}${esc(r.label)}</td><td>${r.amount < 0 ? '−' : '+'}${money(Math.abs(r.amount))}</td><td>${money(r.bal)}</td></tr>`).join('') || '<tr><td colspan="4" class="muted">No activity yet.</td></tr>'}</table></div>
    <p class="lesson">💡 Money never just disappears: it's in your bank, your wallet, your savings, or it went to something on this list. Bills like rent are paid every Monday.</p>`, [{ label: '👛 Back to my wallet', cls: 'ghost', keepOpen: true, fn: () => walletModal() }, { label: 'Close', cls: 'primary' }]);
}
function moneyWhereCard() {
  return `<div class="card"><h3>👛 Bank ${money(S.money)} · Cash ${money(S.cash || 0)}</h3>
    <p class="muted small">Your pay is deposited in your bank account. Take out cash at an ATM. Here's this week:</p>${moneyWhereHtml(7)}
    <div class="row"><button class="btn primary sm" onclick="walletModal()">👛 Open my wallet</button><button class="btn ghost sm" onclick="moneyWhereModal()">📜 Every dollar</button></div></div>`;
}
const _jarsCardW = jarsCard;
jarsCard = function () { return moneyWhereCard() + _jarsCardW(); };

// the bank statement shows only bank money (cash you spend isn't on it)
statementCard = (function (orig) {
  return function () {
    const all = S.ledger; S.ledger = all.filter(r => r.cash === undefined);
    try { return orig(); } finally { S.ledger = all; }
  };
})(statementCard);

// the bank's page gets the ATM too
const _viewBankW = viewBank;
viewBank = function () {
  return `<div class="card"><h3>🏧 ATM & Checking Account</h3><p>🏦 Bank account: <b>${money(S.money)}</b> · 👛 Cash: <b>${money(S.cash || 0)}</b></p>
    <div class="row">${[20, 50, 100, 500].map(a => `<button class="btn primary sm" onclick="atm('cashout',${a})">Take out ${money(a)}</button>`).join('')}<button class="btn ghost sm" onclick="atm('cashin','all')">Put all my cash in</button></div></div>` + _viewBankW();
};

// net worth counts the cash in your wallet
const _netWorthW = netWorth;
netWorth = function () { return _netWorthW() + (S.cash || 0); };

// the money at the top of the screen
const _renderW = render;
render = function () {
  _renderW();
  if (!S) return;
  const c = document.querySelector('#hud .cash');
  if (c) c.innerHTML = `<button class="walletbtn" onclick="walletModal()" title="Open your wallet"><div class="big ${S.money < 0 ? 'neg' : ''}">🏦 ${money(S.money)}</div><div class="muted">👛 cash ${money(S.cash || 0)}${S.savings > 0 ? ' · 🐷 ' + money(S.savings) : ''}${S.loan > 0 ? ' · 💳 owe ' + money(S.loan) : ''}</div></button>`;
};
const _quickBarW = quickBar;
quickBar = function () { return S ? _quickBarW() + '<button class="qb" onclick="walletModal()"><span>👛</span>Wallet</button>' : ''; };

// ---------- saving that never quietly fails ----------
const BACKUP_KEY = SAVE_KEY + '_backup';
let saveWarned = false;
function save() {
  if (!S) return;
  try {
    const txt = JSON.stringify(S);
    localStorage.setItem(SAVE_KEY, txt);
    localStorage.setItem(BACKUP_KEY, txt);
  } catch (e) {
    if (!saveWarned) { saveWarned = true; toast('⚠️ Your game could not be saved in this browser! (Is it a private window?)', 'bad'); }
  }
}
function load() {
  for (const k of [SAVE_KEY, BACKUP_KEY]) {
    try { const s = localStorage.getItem(k); if (s) { const v = JSON.parse(s); if (v && v.needs) return v; } } catch (e) { /* try the backup */ }
  }
  return null;
}
// save when you leave or switch tabs, so nothing is lost
window.addEventListener('pagehide', () => save());
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') save(); });

// starting a new life also clears the backup copy
const _resetGameW = resetGame;
resetGame = function () {
  confirmModal('Start a brand new life? Your current game will be erased.', () => {
    try { localStorage.removeItem(SAVE_KEY); localStorage.removeItem(BACKUP_KEY); } catch (e) { /* ignore */ }
    S = null; modalQueue.length = 0;
    showSetup();
  });
};
