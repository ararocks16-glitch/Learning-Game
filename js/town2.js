// ===================== TOWN & MONEY 2: bank statement & checks, savings jars, mailbox, yard sale, coupons, library card,
// sit-down restaurant, checkups & glasses, movies, post office & online shopping, bus schedules, recycling center =====================

function ensureTown2State() {
  if (!S.ledger) S.ledger = [];
  if (!S.jars) S.jars = [];
  if (!S.mail) S.mail = [];
  if (!S.coupons) S.coupons = [];
  if (!S.lib) S.lib = { card: false, books: [], read: 0, fines: 0 };
  if (S.vision === undefined) S.vision = Math.random() < 0.35 ? 'blurry' : 'good';
  if (!S.packages) S.packages = [];
  if (S.inv && !S.inv.cardboard) S.inv.cardboard = 0;
  ensureHome2State(); ensurePeople2State();
}

// ---------- 17. bank statement (every dollar in and out) ----------
function ledger(amount, label) {
  if (!S || !S.ledger || !amount) return;
  S.ledger.unshift({ day: S.day, hour: S.hour, amount: Math.round(amount * 100) / 100, label, bal: Math.round(S.money * 100) / 100 });
  if (S.ledger.length > 60) S.ledger.length = 60;
}
const _earn2 = earn, _spend2 = spend, _charge2 = charge;
earn = function (a, l) { _earn2(a, l); ledger(a, l); };
spend = function (a, l) { const ok = _spend2(a, l); if (ok) ledger(-a, l); return ok; };
charge = function (a, l) { _charge2(a, l); ledger(-a, l); };
function cardWord(label) { return /pay|paycheck|salary|pension/i.test(label) ? 'DIRECT DEPOSIT' : /rent|mortgage|bill|insurance|loan|tax/i.test(label) ? 'AUTO-PAY' : 'DEBIT CARD'; }
function statementCard() {
  const rows = S.ledger.slice(0, 15);
  return `<div class="card"><h3>💳 Your Bank Statement</h3><p class="muted small">Your debit card takes money right out of your account. Every purchase shows up here!</p>
    <div class="tablewrap"><table class="stub statement"><tr><th>When</th><th>What</th><th>Amount</th><th>Balance</th></tr>${rows.map(r => `<tr class="${r.amount < 0 ? 'minus' : 'plus'}"><td>${dateText(r.day)} ${fmtTime(r.hour)}</td><td><small class="muted">${cardWord(r.label)}</small><br>${esc(r.label)}</td><td>${r.amount < 0 ? '−' : '+'}${money(Math.abs(r.amount))}</td><td>${money(r.bal)}</td></tr>`).join('') || '<tr><td colspan="4" class="muted">No activity yet.</td></tr>'}</table></div>
    <button class="btn sm ghost" onclick="writeCheck()">✍️ Write a check</button></div>`;
}
// writing a real check
const ONES = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
function numWords(n) {
  if (n === 0) return 'zero';
  if (n < 20) return ONES[n];
  if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? '-' + ONES[n % 10] : '');
  if (n < 1000) return ONES[Math.floor(n / 100)] + ' hundred' + (n % 100 ? ' ' + numWords(n % 100) : '');
  return numWords(Math.floor(n / 1000)) + ' thousand' + (n % 1000 ? ' ' + numWords(n % 1000) : '');
}
const CHECK_TO = [['🐾 Maple Animal Shelter', 'a donation'], ['👵 Grandma', 'a birthday gift'], ['🏫 Maple School', 'the school fundraiser'], ['🌳 Park Cleanup Club', 'new trees']];
function writeCheck(step) {
  if (step === undefined) return showModal(`<h2>✍️ Write a Check</h2><p>A check is a paper note that tells your bank to pay someone.</p>
    <label>Pay to: <select id="chkTo">${CHECK_TO.map((c, i) => `<option value="${i}">${c[0]} (${c[1]})</option>`).join('')}</select></label>
    <label>Amount ($): <input id="chkAmt" type="number" min="1" max="500" value="20"></label>`, [{ label: 'Cancel', cls: 'ghost' }, { label: 'Write it', cls: 'primary', keepOpen: true, fn: () => writeCheck(1) }]);
  const to = CHECK_TO[+$('#chkTo').value], amt = Math.floor(+$('#chkAmt').value || 0);
  if (amt < 1) return toast('Write an amount of at least $1.', 'bad');
  if (amt > S.money) return toast('You don\'t have that much in your account! A check with no money behind it "bounces".', 'bad');
  closeModal();
  S.checkNo = (S.checkNo || 100) + 1;
  spend(amt, `Check #${S.checkNo} to ${to[0].slice(3)}`);
  if (to[0].includes('Grandma')) S.family.grandma.rel = clamp(S.family.grandma.rel + 10);
  else { unlock('helper'); fun2(6); }
  queueModal(`<h2>✍️ Check #${S.checkNo}</h2><div class="check"><div class="crow"><b>${esc(S.name)}</b><span>No. ${S.checkNo}<br>Date: ${dateText(S.day, true)}</span></div>
    <div class="crow">Pay to the order of: <u>${to[0].slice(3)}</u><span class="camt">$ ${amt}.00</span></div>
    <div class="cwords"><u>${numWords(amt)[0].toUpperCase() + numWords(amt).slice(1)} and 00/100</u> dollars</div>
    <div class="crow"><span>Memo: ${to[1]}</span><span class="csig">${esc(S.name)}</span></div></div>
    <p class="lesson">💡 You write the amount two ways — numbers AND words — so nobody can change it. Then you sign it!</p>`);
  log(`✍️ You wrote check #${S.checkNo} for ${money(amt)} to ${to[0].slice(3)} for ${to[1]}.`, 'good');
  done();
}

// ---------- 18. saving goals (piggy-bank jars) ----------
const JAR_IDEAS = [['🚲', 'New bike', 250], ['🏖️', 'Beach trip', 150], ['🎮', 'Video game', 60], ['🎸', 'Guitar', 150], ['🐶', 'Puppy', 300], ['🚗', 'First car', 3000], ['🎁', 'Holiday gifts', 100]];
function jarsCard() {
  return `<div class="card"><h3>🫙 Saving Goals</h3><p class="muted small">Put money in a jar for something special. Watch it fill up!</p>
    <div class="jars">${S.jars.map((j, i) => { const pct = Math.min(100, j.saved / j.target * 100); return `<div class="jar"><div class="jarglass"><div class="jarfill" style="height:${pct}%"></div><span>${j.icon}</span></div><b>${esc(j.name)}</b><small>${money(j.saved)} / ${money(j.target)}</small>
      ${pct >= 100 ? `<button class="btn sm primary" onclick="openJar(${i})">🎉 Open it!</button>` : `<div class="row">${[5, 20, 50].map(a => `<button class="btn sm ghost" onclick="toJar(${i},${a})">+$${a}</button>`).join('')}</div>`}</div>`; }).join('')}
    ${S.jars.length < 3 ? `<div class="jar new"><b>➕ New goal</b>${JAR_IDEAS.filter(x => !S.jars.some(j => j.name === x[1])).slice(0, 5).map(x => `<button class="btn sm ghost" onclick="newJar('${x[1]}')">${x[0]} ${x[1]} (${money(x[2])})</button>`).join('')}</div>` : ''}</div>
    <p class="lesson">💡 Saving a little every week adds up. That's how people buy big things without borrowing!</p></div>`;
}
function newJar(name) { const x = JAR_IDEAS.find(j => j[1] === name); S.jars.push({ icon: x[0], name: x[1], target: x[2], saved: 0 }); log(`🫙 You started saving for: ${x[0]} ${x[1]}!`); done(); }
function toJar(i, a) { const j = S.jars[i]; a = Math.min(a, j.target - j.saved); if (!spend(a, `Saved in jar: ${j.name}`)) return; j.saved += a; if (j.saved >= j.target) { log(`🎉 Your "${j.name}" jar is full! You reached your goal!`, 'good'); unlock('saver'); } render(); save(); }
function openJar(i) { const j = S.jars[i]; earn(j.saved, `Opened savings jar: ${j.name}`); log(`🫙 You opened your ${j.name} jar and got ${money(j.saved)} back. Time to buy it!`, 'good'); S.jars.splice(i, 1); done(); }

// ---------- 19. the mailbox ----------
function addMail(m) { ensureTown2State(); S.mail.unshift({ id: Date.now() + Math.random(), day: S.day, read: false, ...m }); if (S.mail.length > 25) S.mail.length = 25; }
const JUNK = ['🏷️ "AMAZING DEALS on mattresses!" (an ad)', '🍕 A pizza menu from Tony\'s', '📰 A free town newsletter', '🚗 "You may already be a WINNER!" (it\'s just an ad — be careful of tricks!)', '🛋️ A furniture store catalog'];
function mailNewDay() {
  if (weekday() === 6) return; // no mail on Sunday
  const r = Math.random();
  if (r < 0.25) addMail({ kind: 'junk', from: 'Junk mail', text: pickR(JUNK) });
  else if (r < 0.4) { const ids = Object.keys(FOODS), id = pickR(ids); addMail({ kind: 'coupon', from: '🛒 Maple Supermarket', text: `COUPON: $1 off ${FOODS[id].name}!`, coupon: id }); }
  else if (r < 0.46 && (S.friends || []).length) { const fr = pickR(S.friends); addMail({ kind: 'card', from: `🙂 ${fr.name}`, text: `A postcard from ${pickR(['the beach 🏖️', 'the mountains ⛰️', 'Seaside Bay 🌊', 'a road trip 🚗', 'summer camp ⛺'])}! "Wish you were here!"` }); }
  else if (r < 0.5 && hasCar()) addMail({ kind: 'bill', from: '🚓 Maple Town Parking', text: 'Parking ticket: your car was parked in a no-parking zone.', bill: { amount: 35, due: S.day + 10 } });
  else if (r < 0.53) addMail({ kind: 'bill', from: '📚 Kids Science Magazine', text: 'Your yearly magazine subscription is ready to renew. Pay to keep getting it — or just don\'t, and it will stop.', bill: { amount: 24, due: S.day + 14, optional: true } });
  if (dateOf().d === 1 && has('phone')) addMail({ kind: 'bill', from: '📱 Maple Mobile', text: 'Your phone bill for this month.', bill: { amount: 45, due: S.day + 14 } });
  if (isBirthday()) { addMail({ kind: 'card', from: '👵 Grandma', text: `Happy birthday, sweetie! 🎂 Here's a little something. Love, Grandma`, money: 20 }); addMail({ kind: 'card', from: '👩 Mom & 👨 Dad', text: 'Happy birthday! We love you so much! ❤️', money: 10 }); }
  // late bills
  S.mail.filter(m => m.bill && !m.bill.paid && !m.bill.late && S.day > m.bill.due).forEach(m => {
    if (m.bill.optional) { m.bill.late = true; m.text += ' (Not renewed.)'; return; }
    m.bill.late = true; m.bill.amount += 15; credit(-15, 'a bill was paid late');
    addMail({ kind: 'bill', from: m.from, text: `⚠️ LATE NOTICE! You didn't pay on time. A $15 late fee was added.`, bill: m.bill, notice: true });
    log(`⚠️ A bill from ${m.from} is late! There's a $15 late fee and your credit score went down.`, 'bad');
  });
  // packages arrive
  S.packages.filter(p => S.day >= p.day).forEach(p => addMail({ kind: 'package', from: '📦 Delivery', text: `Your package arrived: ${p.icon} ${p.name}!`, item: p.id }));
  S.packages = S.packages.filter(p => S.day < p.day);
}
function unreadMail() { return S.mail ? S.mail.filter(m => !m.read || (m.bill && !m.bill.paid && !m.bill.late && !m.notice) || (m.item && !m.opened)).length : 0; }
function mailbox() {
  ensureTown2State();
  if (S.loc !== 'home') return nope('Your mailbox is at home.');
  if (!S.mail.length) return nope('📭 Your mailbox is empty.');
  S.mail.forEach(m => m.read = true);
  showModal(`<h2>📬 Your Mailbox</h2><div class="mails">${S.mail.slice(0, 12).map((m, i) => `<div class="mail ${m.kind}">
    <b>${esc(m.from)}</b> <span class="muted small">${dateText(m.day)}</span><div>${esc(m.text).replace(/\n/g, '<br>')}</div>
    ${m.money && !m.cashed ? `<button class="btn sm primary" onclick="mailAct(${i},'cash')">💵 Take the $${m.money}</button>` : ''}
    ${m.bill && !m.bill.paid ? `<div class="muted small">Amount: <b>${money(m.bill.amount)}</b> · due ${dateText(m.bill.due)}</div><button class="btn sm primary" onclick="mailAct(${i},'pay')">Pay ${money(m.bill.amount)}</button>` : m.bill ? '<span class="chip good">✅ Paid</span>' : ''}
    ${m.coupon && !m.clipped ? `<button class="btn sm ghost" onclick="mailAct(${i},'clip')">✂️ Clip coupon</button>` : ''}
    ${m.item && !m.opened ? `<button class="btn sm primary" onclick="mailAct(${i},'open')">📦 Open package</button>` : ''}
    ${m.gift ? `<div class="muted small">🎁 They also sent ${m.gift}!</div>` : ''}
    ${m.kind === 'junk' && !m.recycled ? `<button class="btn sm ghost" onclick="mailAct(${i},'recycle')">♻️ Recycle it</button>` : ''}</div>`).join('')}</div>
    <p class="lesson">💡 Always open your mail! Bills have due dates. Paying late costs extra and hurts your credit score.</p>`, [{ label: 'Close', cls: 'ghost' }]);
  save();
}
function mailAct(i, what) {
  const m = S.mail[i];
  if (what === 'cash') { m.cashed = true; earn(m.money, `Birthday money from ${m.from}`); log(`💵 You got ${money(m.money)} from ${m.from}!`, 'good'); }
  if (what === 'pay') { if (!spend(m.bill.amount, `Bill: ${m.from}`)) return; m.bill.paid = true; S.mail.forEach(x => { if (x.bill === m.bill) x.bill.paid = true; }); credit(2, 'paid a bill on time'); log(`✅ You paid ${money(m.bill.amount)} to ${m.from}.`); }
  if (what === 'clip') { m.clipped = true; S.coupons.push(m.coupon); log(`✂️ You clipped a coupon for ${FOODS[m.coupon].name}. It will be used at the Supermarket!`); }
  if (what === 'open') { m.opened = true; deliverItem(m.item); S.inv.cardboard++; }
  if (what === 'recycle') { m.recycled = true; S.inv.cardboard += 0.2; log('♻️ You recycled the junk mail.'); }
  done(); mailbox();
}

// ---------- 20. yard sale ----------
function yardSale() {
  if (weekday() !== 5) return nope('Yard sales happen on Saturdays! Come back on Saturday morning.');
  if (S.hour < 7 || S.hour > 12) return nope('Start your yard sale between 7 AM and noon.');
  if (S.today.yardSale) return nope('You already had a yard sale today.');
  const items = ITEMS.filter(i => has(i.id) && !i.consumable && !['car', 'newcar', 'phone'].includes(i.id) && i.price < 2000);
  if (!items.length) return nope('You don\'t have any stuff to sell!');
  showModal(`<h2>🏷️ Yard Sale</h2><p>Pick the things you don't need anymore. Neighbors will come and buy them!</p>
    <div class="sortgrid">${items.map(i => `<label class="sortrow"><span>${i.icon} ${i.name} <small class="muted">(cost ${money(i.price)} new)</small></span><input type="checkbox" value="${i.id}" class="ys"></label>`).join('')}</div>
    <p>How will you price things?</p>
    <div class="row"><label><input type="radio" name="ysp" value="0.25"> 🏷️ Cheap (sells fast)</label><label><input type="radio" name="ysp" value="0.4" checked> 🏷️ Fair</label><label><input type="radio" name="ysp" value="0.6"> 🏷️ Pricey (fewer buyers)</label></div>`,
    [{ label: 'Cancel', cls: 'ghost' }, { label: '🏷️ Open the yard sale (4 hrs)', cls: 'primary', fn: runYardSale }]);
}
function runYardSale() {
  const picks = [...document.querySelectorAll('.ys:checked')].map(x => x.value);
  const p = +(document.querySelector('input[name="ysp"]:checked') || { value: 0.4 }).value;
  if (!picks.length) return nope('You didn\'t pick anything to sell.');
  pass(4, 'awake'); S.today.yardSale = true; addSkill('sales', 2);
  const chance = { 0.25: 0.95, 0.4: 0.7, 0.6: 0.4 }[p];
  const sold = [], kept = [];
  picks.forEach(id => { const it = ITEMS.find(i => i.id === id); if (Math.random() < chance) { const v = Math.round(it.price * p); sold.push([it, v]); delete S.owned[id]; } else kept.push(it); });
  const total = sold.reduce((t, s) => t + s[1], 0);
  if (total) sideEarn(total, 'Yard sale');
  const buyers = (S.neighbors && S.neighbors.people ? S.neighbors.people.map(n => n.name.split(' ')[0]) : []).concat(['a mom with a stroller', 'a college kid', 'an old man in a hat']);
  log(`🏷️ Yard sale! You sold ${sold.length} thing${sold.length === 1 ? '' : 's'} for ${money(total)}.${kept.length ? ` Nobody bought: ${kept.map(k => k.name).join(', ')}.` : ''}`, 'good');
  queueModal(`<h2>🏷️ Yard Sale Results</h2><ul class="notes">${sold.map(([it, v]) => `<li>✅ ${pickR(buyers)} bought your ${it.icon} ${it.name} for ${money(v)}</li>`).join('')}${kept.map(it => `<li>❌ Nobody bought the ${it.icon} ${it.name}</li>`).join('')}</ul><p><b>Total: ${money(total)}</b></p><p class="lesson">💡 Used things sell for much less than new. Lower prices sell faster!</p>`);
  done();
}

// ---------- 21. sales and coupons at the Supermarket ----------
function saleToday(id) {
  const ids = Object.keys(FOODS), seed = S.day * 7;
  const a = ids[seed % ids.length], b2 = ids[(seed + 5) % ids.length], c = ids[(seed + 9) % ids.length];
  if (id === a) return 'bogo'; if (id === b2 || id === c) return 'off30'; return null;
}
function foodPrice(id) { const f = FOODS[id]; return saleToday(id) === 'off30' ? Math.round(f.price * 0.7 * 100) / 100 : f.price; }
function buyFood(id) {
  const f = FOODS[id];
  if (S.hour < 7 || S.hour > 22) return nope('The store is closed.');
  let price = foodPrice(id); const sale = saleToday(id);
  const ci = S.coupons.indexOf(id); let used = false;
  if (ci >= 0) { price = Math.max(0, price - 1); used = true; }
  if (!spend(price, f.name)) return;
  if (used) S.coupons.splice(ci, 1);
  const units = f.units * (sale === 'bogo' ? 2 : 1);
  for (let k = 0; k < units; k++) S.fridgeFood.push({ id, exp: S.day + f.shelf });
  log(`${f.icon} You bought ${f.name.toLowerCase()} (${units}).${sale === 'bogo' ? ' 🏷️ Buy one, get one FREE!' : sale ? ' 🏷️ On sale — 30% off!' : ''}${used ? ' ✂️ You used a coupon: $1 off!' : ''}`);
  if (f.cold && !hasF('fridge')) toast('⚠️ No fridge at home — this will spoil fast!', 'bad');
  render();
}
function groceryAisle() {
  return `<div class="card money"><h3>🛒 Grocery Aisle</h3><p class="muted">Buy real ingredients and cook recipes at home. Look for the 🏷️ sale tags!${S.coupons.length ? ` · ✂️ You have ${S.coupons.length} coupon${S.coupons.length > 1 ? 's' : ''}` : ''}</p>
    <div class="grid shop">${Object.entries(FOODS).map(([id, f]) => { const sale = saleToday(id), coup = S.coupons.includes(id); return `<div class="card item ${sale ? 'onsale' : ''}"><div class="jt"><b>${f.icon} ${f.name}</b><span class="pay">${sale === 'off30' ? `<s class="muted">${money(f.price)}</s> ` : ''}${money(foodPrice(id))}</span></div>
      ${sale ? `<span class="chip good">🏷️ ${sale === 'bogo' ? 'Buy 1 Get 1 FREE' : '30% OFF'}</span>` : ''}${coup ? '<span class="chip">✂️ coupon $1 off</span>' : ''}
      <p class="muted small">${f.units} serving${f.units > 1 ? 's' : ''} · ${f.shelf < 365 ? `fresh for ${f.shelf} days` : 'won\'t spoil'}${f.cold ? ' · keep cold' : ''}</p><button class="btn sm primary" onclick="buyFood('${id}')">Buy</button></div>`; }).join('')}</div>
    <div class="row" style="margin-top:8px"><button class="btn sm ghost" onclick="buyExtra('medicine')">💊 Medicine $12</button><button class="btn sm ghost" onclick="buyExtra('bugspray')">🐜 Bug spray $8</button><button class="btn sm ghost" onclick="buyExtra('newspaper')">📰 Newspaper $1</button><button class="btn sm ghost" onclick="buyExtra('water')">💧 Water $1</button></div>
    <p class="lesson">💡 Sales and coupons save money — but only buy what you'll really eat before it spoils!</p></div>`;
}

// ---------- 22. library card ----------
const LIB_BOOKS = [
  ['🦖', 'Dinosaurs of the World', 'sci', 3], ['🚀', 'A Kid\'s Guide to Space', 'sci', 4], ['🐉', 'The Dragon of Maple Hill', 'write', 5], ['🕵️', 'The Missing Cupcake Mystery', 'write', 4],
  ['🔢', 'Math Puzzles & Brain Games', 'math', 3], ['🍳', 'Cooking for Beginners', 'cook', 3], ['🎨', 'Draw Anything!', 'art', 3], ['💻', 'Coding for Kids', 'comp', 4],
  ['🐾', 'Caring for Pets', 'animal', 3], ['🏰', 'Knights and Castles (History)', 'write', 4], ['💰', 'Money Smarts', 'math', 3], ['⚽', 'Soccer Skills', 'comm', 2],
];
function libraryCard() {
  const L = S.lib;
  if (!L.card) return `<div class="card"><h3>🪪 Library Card</h3><p>A library card is FREE! Borrow up to 3 books for 2 weeks.</p><button class="btn sm primary" onclick="getLibCard()">🪪 Get my free library card</button></div>`;
  return `<div class="card"><h3>📚 Borrow Books <span class="muted small">· ${L.books.length}/3 checked out${L.fines ? ` · fines owed ${money(L.fines)}` : ''}</span></h3>
    ${L.books.length ? `<p><b>Your books:</b></p><div class="mrows">${L.books.map((bk, i) => { const B = LIB_BOOKS[bk.i], late = S.day > bk.due; return mrow(B[0], B[1], `${late ? `⚠️ ${S.day - bk.due} days late!` : `due ${dateText(bk.due)}`} · read ${bk.read}/${B[3]} hrs`, b('Return', `returnBook(${i})`, late ? 'primary' : 'ghost')); }).join('')}</div>` : ''}
    <div class="mrows">${LIB_BOOKS.map((B, i) => S.lib.books.some(x => x.i === i) ? '' : mrow(B[0], B[1], `${B[3]} hrs to read · ${SKILLS[B[2]] ? SKILLS[B[2]].name : ''}`, b('Borrow', `borrowBook(${i})`, 'ghost', L.books.length >= 3 || L.fines > 5))).join('')}</div>
    ${L.fines ? `<button class="btn sm primary" onclick="payFines()">Pay fines (${money(L.fines)})</button>` : ''}
    <p class="lesson">💡 Libraries are free, but return books on time! Late books cost 25¢ a day.</p></div>`;
}
function getLibCard() { S.lib.card = true; pass(0.2); log('🪪 You got a library card! Now you can borrow books for free.', 'good'); done(); }
function borrowBook(i) { if (S.lib.books.length >= 3) return nope('You can only borrow 3 books at a time.'); if (S.lib.fines > 5) return nope('Pay your library fines first.'); S.lib.books.push({ i, due: S.day + 14, read: 0 }); log(`📚 You borrowed "${LIB_BOOKS[i][1]}". It's due back in 2 weeks.`); done(); }
function returnBook(i) { const bk = S.lib.books[i], late = Math.max(0, S.day - bk.due); if (late) { S.lib.fines += late * 0.25; log(`⚠️ "${LIB_BOOKS[bk.i][1]}" was ${late} days late. Fine: ${money(late * 0.25)}.`, 'bad'); } else log(`📚 You returned "${LIB_BOOKS[bk.i][1]}" on time. Thanks!`); S.lib.books.splice(i, 1); done(); }
function payFines() { if (!spend(S.lib.fines, 'Library fines')) return; S.lib.fines = 0; log('📚 You paid your library fines.'); done(); }
function readLibraryBook() {
  const L = S.lib; if (!L.books.length) return nope('You don\'t have any library books. Borrow some at the 📚 Library — it\'s free!');
  const bk = L.books.find(x => x.read < LIB_BOOKS[x.i][3]) || L.books[0];
  const B = LIB_BOOKS[bk.i];
  if (bk.read >= B[3]) return nope('You finished all your books! Return them and borrow new ones.');
  pass(1, 'relax'); bk.read++; addSkill(B[2], 1.2); fun2(5);
  if (S.vision === 'blurry' && !S.look.glasses && Math.random() < 0.4) { log('😣 The words look blurry and you got a headache. Maybe you need an eye exam at the 🏥 Hospital?', 'bad'); S.needs.fun = clamp(S.needs.fun - 4); }
  if (bk.read >= B[3]) { L.read++; log(`📖 You finished "${B[1]}"! ${pickR(['What a great ending!', 'You learned so much!', 'You couldn\'t put it down!'])}`, 'good'); if (L.read >= 5) unlock('bookworm'); }
  else log(`📖 You read "${B[1]}" for an hour (${bk.read}/${B[3]}).`);
  done();
}
function libraryNewDay() { S.lib.books.forEach(bk => { if (S.day === bk.due + 1) addMail({ kind: 'junk', from: '📚 Maple Library', text: `Overdue notice: "${LIB_BOOKS[bk.i][1]}" was due yesterday. Please return it soon! (25¢ a day)` }); }); }

// ---------- 23. sit-down restaurant ----------
const MENU = { main: [['🍔', 'Cheeseburger & fries', 12, 55], ['🍝', 'Spaghetti & meatballs', 14, 60], ['🥗', 'Big garden salad', 10, 40], ['🍗', 'Chicken tenders', 11, 50], ['🥞', 'Pancake stack', 9, 45]], side: [['🥤', 'Lemonade', 3, 0], ['🧃', 'Apple juice', 3, 0], ['💧', 'Water (free)', 0, 0]], dessert: [['🍰', 'Chocolate cake', 6, 10], ['🍨', 'Ice cream sundae', 5, 10], ['', 'No dessert', 0, 0]] };
function sitDown() {
  if (S.hour < 7 || S.hour > 21) return nope('The diner is closed.');
  const server = pickR(['Rosa', 'Mike', 'Jen', 'Carlos', 'Tasha']);
  S.server = server;
  showModal(`<h2>🍽️ Table for One!</h2><p>The host sat you at a booth. Your server <b>${server}</b> brings you a menu: "Hi! What can I get you?"</p>
    ${Object.entries(MENU).map(([k, list]) => `<p><b>${{ main: 'Main dish', side: 'Drink', dessert: 'Dessert' }[k]}</b></p><div class="row">${list.map((m, i) => `<label class="chip"><input type="radio" name="m_${k}" value="${i}" ${i === 0 && k !== 'dessert' ? 'checked' : i === 2 && k === 'dessert' ? 'checked' : ''}> ${m[0]} ${m[1]} ${m[2] ? money(m[2]) : ''}</label>`).join('')}</div>`).join('')}`,
    [{ label: 'Leave', cls: 'ghost' }, { label: '📝 Order', cls: 'primary', fn: orderFood }]);
}
function orderFood() {
  const pick = k => MENU[k][+(document.querySelector(`input[name="m_${k}"]:checked`) || { value: 0 }).value];
  const items = [pick('main'), pick('side'), pick('dessert')].filter(m => m[2] > 0 || m[1].includes('Water'));
  const sub = items.reduce((t, m) => t + m[2], 0), tax = Math.round(sub * 0.08 * 100) / 100;
  if (S.money < sub + tax) return nope('You don\'t have enough money for that order!');
  pass(0.75, 'relax');
  items.forEach(m => { if (m[3]) ateFood(m[3]); });
  S.needs.thirst = clamp(S.needs.thirst + 30); fun2(12);
  S.bill = { sub, tax, items };
  showModal(`<h2>🧾 Your Bill</h2><p>${S.server}: "How was everything?" 😊 It was delicious!</p>
    <table class="stub">${items.map(m => `<tr><td>${m[0]} ${m[1]}</td><td>${money(m[2])}</td></tr>`).join('')}<tr><td>Sales tax (8%)</td><td>${money(tax)}</td></tr><tr><td><b>Total</b></td><td><b>${money(sub + tax)}</b></td></tr></table>
    <p>How much do you want to tip ${S.server}?</p><div class="row">${[0, 15, 18, 20].map(p => `<button class="btn sm ${p === 18 ? 'primary' : 'ghost'}" onclick="closeModal();payBill(${p})">${p}% (${money(Math.round(sub * p) / 100)})</button>`).join('')}</div>
    <p class="lesson">💡 In the U.S., servers earn a lot of their pay from tips. 15–20% is normal for good service.</p>`, []);
}
function payBill(p) {
  const B = S.bill, tip = Math.round(B.sub * p) / 100;
  spend(B.sub + B.tax + tip, `Diner meal + ${p}% tip`);
  log(p >= 15 ? `😊 You left a ${p}% tip. ${S.server} said "Thank you so much! Come back soon!"` : `😕 You didn't leave a tip. ${S.server} looked a little sad. Servers count on tips!`, p >= 15 ? 'good' : '');
  if (p >= 18) addSkill('comm', 0.5);
  S.bill = null; done();
}

// ---------- 24. checkups and glasses ----------
function insured() { return S.insurance || (S.job && JOBS[S.job.id].insurance); }
function checkupCard() {
  const yr = dateOf().year, done1 = S.checkupYear === yr;
  return `<div class="card"><h3>🩺 Yearly Checkup & 👓 Eye Exam</h3>
    <p>Checkup: ${done1 ? '✅ done this year' : `once a year · ${insured() ? 'free with insurance' : '$140'}`}</p>
    <button class="btn sm primary" ${done1 ? 'disabled' : ''} onclick="checkup()">🩺 Get my checkup</button>
    <p style="margin-top:8px">Eye exam: ${insured() ? '$15' : '$75'}${S.eyeChecked ? (S.vision === 'blurry' ? ' · you need glasses' : ' · your eyes are great!') : ''}</p>
    <button class="btn sm ghost" onclick="eyeExam()">👁️ Eye exam</button>
    ${S.eyeChecked && S.vision === 'blurry' ? `<p>Pick your glasses (${insured() ? '$50' : '$150'}):</p><div class="swatches">${['#222222', '#8d5a2b', '#c62828', '#1565c0', '#8e24aa', '#f2b705'].map(col => `<button class="sw ${S.look.glasses === col ? 'sel' : ''}" style="background:${col}" onclick="buyGlasses('${col}')" aria-label="glasses"></button>`).join('')}</div>` : ''}</div>`;
}
function checkup() {
  if (S.checkupYear === dateOf().year) return nope('You already had your checkup this year!');
  pass(1);
  S.checkupYear = dateOf().year; S.needs.health = clamp(S.needs.health + 10);
  if (!insured()) addMail({ kind: 'bill', from: '🏥 Maple Hospital', text: 'Bill for your yearly checkup. (Health insurance would have paid for this!)', bill: { amount: 140, due: S.day + 21 } });
  const tips = [];
  if (S.needs.food < 50) tips.push('Eat more healthy meals — fruits and veggies!');
  if (S.needs.thirst < 50) tips.push('Drink more water every day.');
  if (S.needs.energy < 50) tips.push('Get more sleep — 8 hours a night!');
  if (S.plaque > 30) tips.push('Brush your teeth twice a day.');
  if (S.skills.fit < 30) tips.push('Exercise a little every day.');
  if (!tips.length) tips.push('You\'re super healthy. Keep it up!');
  queueModal(`<h2>🩺 Your Checkup</h2><p>The doctor checked your height, weight, heart and ears. 👂❤️</p><p><b>Doctor's advice:</b></p><ul class="notes">${tips.map(t => `<li>${t}</li>`).join('')}</ul>${!insured() ? '<p class="muted">📬 The bill will come in the mail.</p>' : ''}<p class="lesson">💡 Checkups help doctors catch small problems before they get big.</p>`);
  log('🩺 You had your yearly checkup.'); done();
}
function eyeExam() {
  if (!spend(insured() ? 15 : 75, 'Eye exam')) return;
  pass(0.75); S.eyeChecked = true;
  log(S.vision === 'blurry' ? '👁️ Eye exam: the letters on the bottom of the chart were blurry. You\'re nearsighted — glasses will help you see clearly!' : '👁️ Eye exam: you read the tiny letters at the bottom! Your eyes are perfect.');
  done();
}
function buyGlasses(col) { if (!spend(insured() ? 50 : 150, 'Glasses')) return; S.look.glasses = col; pass(0.5); log('👓 You got new glasses! WOW — everything is so sharp and clear now!', 'good'); done(); }

// ---------- 25. the movie theater ----------
const MOVIES = [['🐶', 'Space Puppies 3', 'G', 'An animated adventure'], ['🦸', 'Captain Kindness', 'PG', 'A superhero movie'], ['🐉', 'The Last Dragon Egg', 'PG', 'A fantasy adventure'], ['🤖', 'Robot Pals', 'G', 'A funny cartoon'], ['🏴‍☠️', 'Pirates of Pudding Island', 'PG', 'A silly pirate comedy'], ['🧊', 'Penguin Party', 'G', 'A cute animated movie']];
const SHOWTIMES = [13, 16, 19, 21.5];
function moviesToday() { return [0, 2, 4].map(k => MOVIES[(S.day + k) % MOVIES.length]); }
function movieCard() {
  const next = SHOWTIMES.find(t => t > S.hour);
  return `<div class="card"><h3>🎬 Now Playing</h3><p class="muted small">Showtimes: ${SHOWTIMES.map(t => fmtTime(t)).join(' · ')} · Tickets ${money(12)} (matinee before 5 PM: ${money(8)})</p>
    <div class="mrows">${moviesToday().map((m, i) => mrow(m[0], `${m[1]} (${m[2]})`, `${m[3]} · 2 hrs`, b(next ? `🎟️ ${fmtTime(next)} show` : 'No more shows', `watchMovie(${i})`, 'primary', !next))).join('')}</div></div>`;
}
function watchMovie(i) {
  const next = SHOWTIMES.find(t => t > S.hour); if (!next) return nope('No more shows tonight.');
  const m = moviesToday()[i], price = next < 17 ? 8 : 12;
  showModal(`<h2>🎟️ ${m[0]} ${m[1]}</h2><p>Ticket: ${money(price)} · The show starts at <b>${fmtTime(next)}</b>${next - S.hour > 0.5 ? ` (you'll wait ${travelTime(next - S.hour)})` : ''}.</p>
    <p>Snacks?</p><div class="row"><label class="chip"><input type="checkbox" id="mvPop"> 🍿 Popcorn $7</label><label class="chip"><input type="checkbox" id="mvDrink"> 🥤 Drink $4</label></div>`,
    [{ label: 'Cancel', cls: 'ghost' }, { label: 'Buy ticket', cls: 'primary', fn: () => { const pop = $('#mvPop').checked, dr = $('#mvDrink').checked; goMovie(m, next, price + (pop ? 7 : 0) + (dr ? 4 : 0), pop, dr); } }]);
}
function goMovie(m, start, cost, pop, dr) {
  if (!spend(cost, `Movie: ${m[1]}`)) return;
  pass(start - S.hour, 'relax');
  if (pop) { ateFood(15); S.needs.thirst = clamp(S.needs.thirst - 5); }
  if (dr) S.needs.thirst = clamp(S.needs.thirst + 25);
  pass(1, 'relax');
  S.movie = { m, pop };
  if (has('phone') && Math.random() < 0.5) return showModal(`<h2>📱 Bzzzt!</h2><p>In the middle of the movie, your phone buzzes! What do you do?</p>`, [{ label: '🔕 Silence it and keep watching', cls: 'primary', fn: () => endMovie(true) }, { label: '📞 Answer it', cls: 'ghost', fn: () => endMovie(false) }]);
  endMovie(true);
}
function endMovie(polite) {
  const m = S.movie.m; pass(1, 'relax'); fun2(polite ? 28 : 15);
  log(polite ? `🎬 You watched "${m[1]}". ${pickR(['The ending was amazing!', 'Everyone laughed at the funny parts!', 'Best movie ever!'])}` : '🤫 You answered your phone and people said "SHHH!" Turn your phone off at the movies — it\'s polite!', polite ? 'good' : 'bad');
  S.movie = null; done();
}

// ---------- 26. post office & online shopping ----------
function viewPostOffice() {
  const pp = S.penpal;
  return `<p>Mail letters and packages anywhere in the world! Open 8 AM – 6 PM.</p>
    <div class="grid two">
      <div class="card"><h3>✉️ Pen Pal</h3>${pp ? `<p>${PENPALS[pp.i].flag} ${PENPALS[pp.i].name} from ${PENPALS[pp.i].country} · ${pp.letters} letters so far${pp.waiting ? ' · waiting for a reply...' : ''}</p><button class="btn sm primary" ${pp.waiting ? 'disabled' : ''} onclick="writeLetter()">✍️ Write a letter ($1.50 stamp)</button>` : '<p>Make a friend in another country!</p><button class="btn sm primary" onclick="getPenpal()">✉️ Find a pen pal</button>'}</div>
      <div class="card"><h3>💌 Send a Postcard</h3><p>Send Grandma a postcard. She loves mail! (75¢ stamp)</p><button class="btn sm primary" onclick="sendPostcard()">💌 Send to Grandma</button></div>
      <div class="card"><h3>📦 Mail a Gift</h3><p>Mail a wrapped gift to a friend (${money(9)} shipping). ${S.giftsBought ? `You have ${S.giftsBought} gift${S.giftsBought > 1 ? 's' : ''}.` : 'Buy a wrapped gift at the Mall first.'}</p>${(S.friends || []).map((f, i) => b(`📦 ${f.name}`, `mailGift(${i})`, 'ghost', !S.giftsBought)).join('')}</div>
      <div class="card"><h3>🛒 Shop Online</h3><p>Order from your phone or laptop. Packages arrive at your mailbox in 2–4 days.</p><button class="btn sm ghost" onclick="shopOnline()">Open the online store</button></div>
    </div>`;
}
function sendPostcard() { if (!spend(0.75, 'Stamp')) return; pass(0.25); S.family.grandma.rel = clamp(S.family.grandma.rel + 8); log('💌 You mailed Grandma a postcard. She\'ll put it on her fridge!', 'good'); setTimeout(() => { if (has('phone')) text('👵 Grandma', 'I got your postcard! It made my whole day ❤️'); }, 0); done(); }
function mailGift(i) { const fr = S.friends[i]; if (!S.giftsBought) return nope('Buy a wrapped gift at the Mall first.'); if (!spend(9, 'Shipping a package')) return; S.giftsBought--; fr.f = clamp(fr.f + 15); pass(0.25); log(`📦 You mailed a gift to ${fr.name}. It will arrive in a few days!`, 'good'); done(); }
function shopOnline() {
  if (!has('phone') && !has('laptop') && !has('computer')) return nope('You need a phone or a laptop to shop online.');
  const list = ITEMS.filter(i => i.place === 'mall' && !i.consumable && !has(i.id) && !i.clothes && i.price < 2000).slice(0, 40);
  showModal(`<h2>🛒 Maple Online Store</h2><p class="muted">Online prices are often 10% cheaper, but you pay shipping (${money(6)}, free over $50) and wait 2–4 days.</p>
    <div class="mrows">${list.map(i => { const p = Math.round(i.price * 0.9); return mrow(i.icon, i.name, `${money(p)} online (store: ${money(i.price)})`, b('Order', `closeModal();orderOnline('${i.id}')`)); }).join('')}</div>`, [{ label: 'Close', cls: 'ghost' }]);
}
function orderOnline(id) {
  const it = ITEMS.find(i => i.id === id), p = Math.round(it.price * 0.9), ship = p >= 50 ? 0 : 6;
  if (S.packages.some(x => x.id === id)) return nope('You already ordered that! It\'s on the way.');
  if (!spend(p + ship, `Online order: ${it.name}`)) return;
  const days = 2 + Math.floor(Math.random() * 3);
  S.packages.push({ id, name: it.name, icon: it.icon, day: S.day + days });
  log(`📦 You ordered ${it.icon} ${it.name} online${ship ? ` (+${money(ship)} shipping)` : ' (free shipping!)'}. It will arrive in about ${days} days.`, 'good');
  done();
}
function deliverItem(id) {
  const it = ITEMS.find(i => i.id === id); if (!it) return;
  if (!toyBuy(id)) { S.owned[id] = true; log(`📦 You opened the box: ${it.icon} ${it.name}! (Recycle the cardboard box ♻️)`, 'good'); }
  afterBuyHome(it);
}

// ---------- 27. bus schedules ----------
function nextBus(h = S.hour) {
  if (h < 5) return 5;
  const every = h >= 6 && h < 22 ? 1 / 3 : 1;
  const start = h >= 6 && h < 22 ? 6 : h >= 22 ? 22 : 5;
  const n = Math.ceil((h - start) / every - 1e-6);
  return start + n * every;
}
const _transportFor2 = transportFor;
transportFor = function (len) {
  const t = _transportFor2(len);
  if (t.icon !== '🚌' || !S) return t;
  const nb = nextBus(), wait = nb - S.hour;
  if (S.hour >= 23.5 || S.hour < 4.5) return { how: 'walked', icon: '🚶', speed: 800, cost: 0, wait: 0, noBus: true };
  return { ...t, wait: Math.max(0.02, wait) + 0.03, nextBus: nb };
};
function busText(info) {
  if (info.noBus) return '<p class="muted small">🚌 The buses stopped for the night (they run 5 AM – 11:30 PM), so you\'d have to walk.</p>';
  if (!info.nextBus) return '';
  const mins = Math.round((info.nextBus - S.hour) * 60);
  return `<p class="muted small">🚌 Next bus at <b>${fmtTime(info.nextBus)}</b> (${mins <= 1 ? 'right now!' : `in ${mins} min`}). Buses come every 20 minutes in the day and every hour at night.</p>`;
}

// ---------- 28. recycling center ----------
function viewRecycling() {
  return `<p>Bring your cans, bottles and cardboard here. Everything gets turned into new stuff! ♻️ Open 7 AM – 7 PM.</p>
    <div class="card money"><h3>♻️ Drop Off</h3><div class="mrows">
      ${mrow('🥫', 'Cans & bottles', `You have ${S.inv.cans} · 10¢ each here`, b('Turn in', 'recycleCans()', 'primary', !S.inv.cans))}
      ${mrow('📦', 'Cardboard boxes', `You have ${Math.floor(S.inv.cardboard)} · 25¢ each`, b('Turn in', 'recycleCardboard()', 'primary', S.inv.cardboard < 1))}
      ${mrow('🔋', 'Old batteries & electronics', 'Free · keeps poison out of the dirt and water', b('Drop off', 'recycleElectronics()', 'ghost'))}
    </div><p class="lesson">💡 Recycling one can saves enough energy to run a TV for 3 hours!</p></div>`;
}
function recycleCans() { const v = Math.round(S.inv.cans * 10) / 100; pass(0.25); sideEarn(v, 'Recycling center'); S.recycled = (S.recycled || 0) + S.inv.cans; log(`♻️ You turned in ${S.inv.cans} cans and bottles for ${money(v)}!`, 'good'); S.inv.cans = 0; if (S.recycled >= 50) unlock('recycler'); done(); }
function recycleCardboard() { const n = Math.floor(S.inv.cardboard), v = n * 0.25; pass(0.25); sideEarn(v, 'Cardboard recycling'); S.inv.cardboard -= n; log(`📦 You recycled ${n} cardboard boxes for ${money(v)}.`, 'good'); done(); }
function recycleElectronics() { pass(0.25); S.eco = (S.eco || 0) + 3; log('🔋 You dropped off old batteries safely. They won\'t leak into the ground. Good for the Earth! 🌎', 'good'); done(); }

// ---------- new places on the map ----------
Object.assign(PLACES, {
  postoffice: { kind: 'place', far: true, shop: true, town: 'maple', name: 'Post Office', icon: '📮', r: [1960, 236, 170, 140], door: [2045, 386], blurb: 'Mail letters and packages, pen pals and postcards.' },
  recycling:  { kind: 'place', far: true, shop: true, town: 'maple', name: 'Recycling Center', icon: '♻️', r: [1960, 414, 200, 150], door: [2060, 414], blurb: 'Turn in cans, bottles and cardboard for money.' },
});
Object.assign(ENTRANCE, {
  postoffice: { facade: 'brick', wall: '#e8e2d6', door: 'double', doorCol: '#1a3a6b', signBg: '#1a3a6b', signFg: '#fff', hours: [8, 18], inside: '#f3efe6', keeper: true },
  recycling:  { facade: 'store', wall: '#c8e6c9', door: 'slide', doorCol: '#bfe3f5', signBg: '#2e7d32', signFg: '#fff', hours: [7, 19], inside: '#eef5ee', awning: '#43a047', keeper: true },
});
INTERIORS.postoffice = c => {
  iWall(c, '#f3efe6'); iFloor(c, 'tile', ['#d9d4c8']); iLights(c, 'strip', [250, 750]);
  iCounter(c, 80, 190, 520, 78, '#1a3a6b', { register: 300, mat: 'solid' });
  for (let k = 0; k < 4; k++) for (let j = 0; j < 6; j++) { fillR(c, 660 + j * 46, 60 + k * 46, 40, 40, '#b0a58f', 3); fillR(c, 664 + j * 46, 64 + k * 46, 32, 32, '#d8cfb9', 2); circ(c, 690 + j * 46, 80 + k * 46, 2.5, '#6d5d3a'); }
  iSign(c, 120, 40, 260, 30, '#1a3a6b', '#fff', '📮 MAPLE POST OFFICE', 15);
  [[140, 150], [220, 160], [420, 155]].forEach(([x, y]) => { fillR(c, x, y, 50, 36, '#c8a26b', 2); fillR(c, x + 22, y, 6, 36, '#a27b45'); });
};
INTERIORS.recycling = c => {
  iWall(c, '#eef5ee'); iFloor(c, 'tile', ['#c9c9c9']); iLights(c, 'strip', [250, 750]);
  [['#1e88e5', 'CANS'], ['#43a047', 'GLASS'], ['#8d6e63', 'CARDBOARD'], ['#fdd835', 'PLASTIC']].forEach(([col, t], k) => { box3d(c, 60 + k * 170, 140, 140, 128, 0.04, col, 'metal'); iSign(c, 70 + k * 170, 112, 120, 22, '#263238', '#fff', t, 11); });
  iCounter(c, 760, 200, 200, 68, '#2e7d32', { register: 900, mat: 'solid' });
  iSign(c, 360, 30, 280, 30, '#2e7d32', '#fff', '♻️ REDUCE · REUSE · RECYCLE', 13);
};

// ---------- once a day / once a week ----------
function realNewDay() {
  ensureTown2State();
  brokenNewDay(); roommateNewDay(); wildNewDay(); siblingNewDay(); grandmaNewDay(); penpalNewDay(); mailNewDay(); libraryNewDay();
}
function realWeekly(bills) {
  const share = roommateShare();
  if (share) earn(share, `Roommate ${S.roommates[0].name.split(' ')[0]}'s share`);
  if (S.business && S.business.staff && S.business.staff.length) { const pay = staffPayroll(); charge(pay, 'Payroll for your workers'); bills.push([`Payroll: ${S.business.staff.length} workers`, pay]); }
  studentLoanWeekly(bills);
  pensionWeekly();
}
