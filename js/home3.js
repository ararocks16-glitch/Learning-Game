// ===================== HOME 3: chore chart, locks & doorbell camera, saving water, desk & bunk bed, snow day fun, lost & found =====================

function ensureHome3State() {
  if (!S.chart || S.chart.week !== weekNum()) S.chart = { week: weekNum(), days: {} };
  if (S.locked === undefined) S.locked = false;
  if (!S.water) S.water = { gallons: 0, shortShowers: true, tapOff: true };
  if (S.lost === undefined) S.lost = null;
}

// ---------- 1. chore chart with gold stars ----------
const CHORES = { bed: ['🛏️', 'Make bed'], dishes: ['🍽️', 'Dishes'], clean: ['🧹', 'Tidy up'], trash: ['🗑️', 'Trash'], laundry: ['🧺', 'Laundry'], pets: ['🐾', 'Pet care'] };
function chartMark(k) {
  ensureHome3State();
  const d = weekday(), day = S.chart.days[d] = S.chart.days[d] || [];
  if (day.includes(k)) return;
  day.push(k);
  if (day.length === 3) toast('⭐ Gold star! You did 3 chores today!');
}
function choreCount() { return Object.values(S.chart.days).reduce((t, d) => t + d.length, 0); }
function chartCard() {
  ensureHome3State();
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return `<details class="card" ${choreCount() ? '' : 'open'}><summary>📋 Chore Chart <span class="muted small">· ${choreCount()} chores this week${S.home === 'parents' ? ' · allowance on Saturday!' : ''}</span></summary>
    <div class="tablewrap"><table class="chart"><tr><th></th>${days.map(d => `<th>${d}</th>`).join('')}</tr>
    ${Object.entries(CHORES).map(([k, c]) => `<tr><td>${c[0]} ${c[1]}</td>${days.map((d, i) => `<td>${(S.chart.days[i] || []).includes(k) ? '⭐' : i === weekday() ? '⬜' : ''}</td>`).join('')}</tr>`).join('')}
    <tr><td><b>Gold star days</b></td>${days.map((d, i) => `<td>${(S.chart.days[i] || []).length >= 3 ? '🌟' : ''}</td>`).join('')}</tr></table></div>
    <p class="lesson">💡 Doing a few chores every day keeps your home nice — and it's way easier than one giant mess!</p></details>`;
}
function makeBed() { pass(5 / 60); S.mess = clamp(S.mess - 3); fun2(1); chartMark('bed'); log('🛏️ You made your bed. Your room looks neater already!'); }
function chartWeekly() {
  // called on Saturday morning at the parents' house: allowance! (idea 28)
  if (S.home !== 'parents') return;
  const n = choreCount();
  if (n >= 5) { const pay = 10 + Math.min(10, n - 5) * 2; earn(pay, 'Allowance from Mom & Dad'); log(`💵 Saturday allowance! Mom and Dad gave you ${money(pay)} for doing ${n} chores this week.`, 'good'); }
  else log(`💵 No allowance this week — you only did ${n} chores. Mom says: "Do at least 5 chores on your chart!"`, 'bad');
}

// ---------- 2. locking the door & doorbell camera ----------
function toggleLock() { S.locked = !S.locked; log(S.locked ? '🔒 You locked your front door.' : '🔓 You unlocked your front door.'); render(); save(); }
function leavingHome() {
  if (S.locked) return;
  const valuables = ['tv', 'laptop', 'console', 'bike', 'guitar'].filter(has);
  if (valuables.length && Math.random() < (has('doorcam') ? 0.003 : 0.03)) {
    const k = pickR(valuables), it = ITEMS.find(i => i.id === k);
    delete S.owned[k];
    queueModal(`<h2>😟 Your ${it.name} Is Gone!</h2><p>You left your door unlocked, and someone came in and took your ${it.icon} ${it.name}.</p><p>You called the police 👮 and made a report. They said they'll look for it.</p><p class="lesson">💡 Always lock your door when you leave! A doorbell camera helps too.</p>`);
    log(`😟 Someone took your ${it.name} because your door was unlocked. Always lock your door!`, 'bad');
  } else if (Math.random() < 0.3) log('🔓 Oops — you left your front door unlocked! Lock it next time (tap 🔒 at home).');
}
function lockChip() { return `<button class="chip ${S.locked ? 'good' : 'warn'}" onclick="toggleLock()">${S.locked ? '🔒 Door locked' : '🔓 Door unlocked — tap to lock'}</button>${has('doorcam') ? '<span class="chip">📹 Doorbell camera on</span>' : ''}`; }
function doorcamNewDay() {
  if (!has('doorcam') || Math.random() > 0.25) return;
  log(`📹 Doorbell camera: ${pickR(['the mail carrier dropped off your mail', 'a cat walked across your porch 🐈', 'your neighbor waved at the camera 👋', 'a delivery driver left a package', 'a squirrel stared at the camera for a whole minute 🐿️', 'kids selling cookies knocked, then left a flyer'])}.`);
}

// ---------- 3. saving water ----------
function homeShowerChoice() {
  if (!hasF('shower')) return nope('You don\'t have a shower or bathtub! Buy one at the 🛍️ Mall.');
  showModal(`<h2>🚿 Take a Shower</h2><div class="grid actions">
    <button class="action" onclick="closeModal();doShower(false)"><span class="ic">⏱️</span><b>Quick shower</b><small>5 minutes · uses 12 gallons of water</small></button>
    <button class="action" onclick="closeModal();doShower(true)"><span class="ic">🛀</span><b>Long shower</b><small>20 minutes · uses 50 gallons · relaxing</small></button></div>
    <p class="lesson">💡 A short shower gets you just as clean and saves lots of water and money!</p>`, [{ label: 'Cancel', cls: 'ghost' }]);
}
function doShower(long) {
  homeShower();
  S.water.gallons += long ? 50 : 12;
  if (long) fun2(5); else S.water.short = (S.water.short || 0) + 1;
  if (long) log('🛀 You took a long hot shower. Relaxing... but it used a lot of water.');
  done();
}
function waterBill() { return Math.round(S.water.gallons * 0.012 * 100) / 100; }
function waterCard() {
  return `<div class="card energy"><h3>🚰 Water <span class="muted small">· this week: ${Math.round(S.water.gallons)} gallons ≈ ${money(waterBill())}${S.home === 'parents' ? ' (your parents pay)' : ''}</span></h3>
    <div class="row"><button class="btn sm ${S.water.tapOff ? 'primary' : 'ghost'}" onclick="S.water.tapOff=!S.water.tapOff;render()">🪥 Turn off the tap while brushing: ${S.water.tapOff ? 'YES' : 'no'}</button></div>
    <p class="muted small">Leaving the tap running while you brush wastes about 4 gallons every time!</p></div>`;
}
function waterWeekly(bills) {
  const w = waterBill();
  if (S.home !== 'parents' && w > 0) { charge(w, 'Water bill'); bills.push([`Water bill (${Math.round(S.water.gallons)} gallons)`, w]); }
  if (S.water.gallons < 250) unlock('watersaver');
  S.water.gallons = 0;
}

// ---------- 4. desk & bunk bed ----------
function homework() {
  if (!has('desk')) return nope('You need a desk to do homework. Buy one at the Mall!');
  if (S.needs.energy < 15) return nope('You\'re too tired to study.');
  pass(1, 'study');
  const k = pickR(['math', 'write', 'sci']);
  addSkill(k, 2.2); addSkill(pickR(['math', 'write', 'sci']), 0.8);
  log(`📝 You sat at your desk and studied ${SKILLS[k].name.toLowerCase()} for an hour. A quiet desk helps you focus!`);
}
function drawFurniture3(c) {
  if (has('bunkbed') && has('bed')) {
    box3d(c, 26, 140, 142, 14, 0.06, '#6b4426', 'wood', 31);
    box3d(c, 30, 128, 134, 14, 0.06, '#e8e4da', 'fabric');
    box3d(c, 70, 122, 96, 18, 0.06, '#c0392b', 'fabric');
    pillow(c, 34, 116, 32, 14);
    box3d(c, 164, 120, 8, 150, 0.02, '#5d3a1f', 'wood', 33);
    c.strokeStyle = '#5d3a1f'; c.lineWidth = 3; for (let y = 160; y < 262; y += 22) { c.beginPath(); c.moveTo(166, y); c.lineTo(184, y); c.stroke(); }
    c.beginPath(); c.moveTo(184, 150); c.lineTo(184, 266); c.stroke();
  }
}

// ---------- 5. snow day fun ----------
function snowFunCard() {
  if (S.weather !== 'snowy' && !(seasonOf() === 'winter' && S.snowOnGround)) return '';
  return `<div class="card holiday"><h3>⛄ Snow Day Fun!</h3><div class="row">
    <button class="btn sm primary" onclick="buildSnowman()">⛄ Build a snowman</button>
    <button class="btn sm primary" onclick="snowballFight()">❄️ Snowball fight with neighbors</button>
    <button class="btn sm primary" onclick="sledding()">🛷 Go sledding (park hill)</button>
    <button class="btn sm ghost" onclick="hotCocoa()">☕ Hot cocoa</button></div>
    ${has('coat') || S.today.warm ? '' : '<p class="muted small">🥶 Bundle up! Without a winter coat you\'ll get cold fast.</p>'}</div>`;
}
function snowCheck() { if (S.hour < 7 || S.hour > 19) return nope('It\'s too dark to play outside.'); if (!has('coat') && !S.today.warm) { S.needs.health = clamp(S.needs.health - 5); toast('🥶 Brrr! You need a winter coat!', 'bad'); } return true; }
function buildSnowman() { if (!snowCheck()) return; pass(1, 'relax'); fun2(18); S.snowman = S.day; log(`⛄ You built a snowman with a carrot nose, rocks for eyes and an old scarf! You named it "${pickR(['Frosty', 'Mr. Chill', 'Snowbert', 'Flake', 'Sir Brr'])}".`, 'good'); done(); }
function snowballFight() { if (!snowCheck()) return; pass(1, 'relax'); fun2(22); S.needs.energy = clamp(S.needs.energy - 10); if (S.neighbors && S.neighbors.people) S.neighbors.people.forEach(n => n.rel = clamp(n.rel + 4)); log(`❄️ Snowball fight! ${S.neighbors && S.neighbors.people ? S.neighbors.people.map(n => n.name.split(' ')[0]).join(', ') + ' joined in.' : ''} You got hit ${2 + Math.floor(Math.random() * 6)} times but laughed the whole time!`, 'good'); done(); }
function sledding() { if (!snowCheck()) return; pass(1.5, 'relax'); fun2(26); S.needs.energy = clamp(S.needs.energy - 12); log('🛷 WHEEE! You raced down the big hill at the park on a sled about 20 times!', 'good'); done(); }
function hotCocoa() { pass(0.25, 'relax'); fun2(6); S.needs.thirst = clamp(S.needs.thirst + 20); log('☕ You warmed up with hot cocoa and tiny marshmallows.'); done(); }
function drawSnowman(c) {
  if (!S.snowman || seasonOf() !== 'winter' || S.day - S.snowman > 10) return;
  const x = 140, y = 150;
  [[0, 0, 9], [0, -13, 7], [0, -24, 5]].forEach(([dx, dy, r]) => { c.fillStyle = '#ffffff'; c.beginPath(); c.arc(x + dx, y + dy, r, 0, Math.PI * 2); c.fill(); c.strokeStyle = 'rgba(120,140,160,.5)'; c.lineWidth = 0.6; c.stroke(); });
  c.fillStyle = '#ff7043'; c.beginPath(); c.moveTo(x, y - 24); c.lineTo(x + 6, y - 23); c.lineTo(x, y - 22); c.fill();
  c.fillStyle = '#222'; c.fillRect(x - 6, y - 33, 12, 2); c.fillRect(x - 4, y - 39, 8, 6);
  c.fillStyle = '#c62828'; c.fillRect(x - 6, y - 19, 12, 2.5);
}

// ---------- 6. lost & found ----------
const LOSTABLE = { keys: ['🔑', 'keys'], wallet: ['👛', 'wallet'], phone: ['📱', 'phone'] };
const HIDING = ['in the couch cushions', 'in your coat pocket', 'under your bed', 'in the kitchen drawer', 'in the laundry basket', 'behind the toilet'];
function loseSomething() {
  if (S.lost || Math.random() > 0.02) return;
  const opts = ['keys', 'wallet'].concat(has('phone') ? ['phone'] : []);
  const k = pickR(opts);
  S.lost = { what: k, spot: Math.floor(Math.random() * HIDING.length), tried: [], day: S.day };
  log(`😱 Oh no! You can't find your ${LOSTABLE[k][0]} ${LOSTABLE[k][1]}! Search your home.`, 'bad');
}
function searchFor() {
  const L = S.lost; if (!L) return;
  if (S.loc !== 'home') return nope('Search for it at home first!');
  showModal(`<h2>🔍 Where did you put your ${LOSTABLE[L.what][1]}?</h2><p>Think hard... where were you last?</p>
    <div class="grid actions">${HIDING.map((h, i) => `<button class="action ${L.tried.includes(i) ? 'locked' : ''}" ${L.tried.includes(i) ? 'disabled' : ''} onclick="closeModal();lookIn(${i})"><span class="ic">🔍</span><b>Look ${h}</b><small>${L.tried.includes(i) ? 'not here' : '10 min'}</small></button>`).join('')}</div>`, [{ label: 'Stop looking', cls: 'ghost' }]);
}
function lookIn(i) {
  const L = S.lost; pass(10 / 60);
  if (i === L.spot) { log(`🎉 Found it! Your ${LOSTABLE[L.what][1]} was ${HIDING[i]}! 😅`, 'good'); S.lost = null; fun2(5); return done(); }
  L.tried.push(i); log(`🔍 Not ${HIDING[i]}...`); done(); searchFor();
}
function lostNewDay() {
  loseSomething();
  const L = S.lost;
  if (L && S.day - L.day >= 3 && Math.random() < 0.5) {
    const who = S.neighbors && S.neighbors.people ? pickR(S.neighbors.people).name : 'A kind stranger';
    log(`🤗 ${who} found your ${LOSTABLE[L.what][1]} ${pickR(['on the sidewalk', 'at the park', 'on the bus'])} and brought it back! There are so many kind people.`, 'good');
    S.lost = null;
  }
}
function lostBlocks(what) { return S.lost && S.lost.what === what; }
// a lost wallet stops shopping, lost keys keep you outside, a lost phone can't be used
const _spend3 = spend;
spend = function (a, l) { if (lostBlocks('wallet') && a > 0) { nope('👛 You lost your wallet! Search for it at home first.'); return false; } return _spend3(a, l); };
const _openDoor3 = openDoor;
openDoor = function () {
  if (lostBlocks('keys') && S.locked) return confirmModal('🔑 You lost your keys and your door is locked! Call a locksmith to let you in for <b>$80</b>?', () => { if (!_spend3(80, 'Locksmith')) return; S.locked = false; S.lost = null; log('🔐 The locksmith opened your door and made you a new key. Keep a spare key with a trusted neighbor!'); done(); });
  return _openDoor3();
};
const _openPhone3 = openPhone;
openPhone = function (app) { if (lostBlocks('phone')) return nope('📱 You lost your phone! Search for it at home.'); return _openPhone3(app); };
function lostChip() { return S.lost ? `<button class="chip warn" onclick="searchFor()">😱 Lost ${LOSTABLE[S.lost.what][0]} ${LOSTABLE[S.lost.what][1]}! (tap to search at home)</button>` : ''; }

// ---------- extra details in your room ----------
function drawRoomDetails(c) {
  // wall clock that shows the real game time
  const cx = 440, cy = 42;
  c.fillStyle = 'rgba(0,0,0,.15)'; c.beginPath(); c.arc(cx + 2, cy + 3, 17, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#5d4037'; c.beginPath(); c.arc(cx, cy, 17, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#fdfaf2'; c.beginPath(); c.arc(cx, cy, 14, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#333'; for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6; c.fillRect(cx + Math.cos(a) * 11.5 - 0.7, cy + Math.sin(a) * 11.5 - 0.7, k % 3 ? 1.2 : 2, k % 3 ? 1.2 : 2); }
  const hr = S.hour % 12, mn = (S.hour % 1) * 60;
  const hand = (ang, len, w) => { c.strokeStyle = '#222'; c.lineWidth = w; c.lineCap = 'round'; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.sin(ang) * len, cy - Math.cos(ang) * len); c.stroke(); };
  hand(hr / 12 * Math.PI * 2, 7, 2); hand(mn / 60 * Math.PI * 2, 11, 1.2);
  c.fillStyle = '#c62828'; c.beginPath(); c.arc(cx, cy, 1.6, 0, Math.PI * 2); c.fill();
  // a calendar on the wall with today's date
  const d = dateOf(), kx = 735, ky = 26;
  c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(kx + 2, ky + 3, 34, 40);
  c.fillStyle = '#ffffff'; c.fillRect(kx, ky, 34, 40); c.fillStyle = '#e53935'; c.fillRect(kx, ky, 34, 10);
  c.fillStyle = '#fff'; c.font = '800 7px system-ui, sans-serif'; c.textAlign = 'center'; c.fillText(MONTHS[d.m].slice(0, 3).toUpperCase(), kx + 17, ky + 8);
  c.fillStyle = '#222'; c.font = '900 16px system-ui, sans-serif'; c.fillText(String(d.d), kx + 17, ky + 29);
  c.fillStyle = '#9e9e9e'; for (let k = 0; k < 5; k++) c.fillRect(kx + 4 + k * 6, ky + 34, 4, 2);
  c.fillStyle = '#555'; c.beginPath(); c.arc(kx + 17, ky - 2, 1.5, 0, Math.PI * 2); c.fill(); c.textAlign = 'start';
  // a pendant lamp over the table
  if (has('table')) {
    c.strokeStyle = '#333'; c.lineWidth = 1; c.beginPath(); c.moveTo(526, 0); c.lineTo(526, 34); c.stroke();
    c.fillStyle = '#37474f'; c.beginPath(); c.moveTo(512, 46); c.lineTo(518, 34); c.lineTo(534, 34); c.lineTo(540, 46); c.closePath(); c.fill();
    const on = S.lightsOn && !S.powerOut;
    c.fillStyle = on ? '#fff8d6' : '#cfcfcf'; c.beginPath(); c.ellipse(526, 46, 13, 2.5, 0, 0, Math.PI * 2); c.fill();
    if (on && (S.hour < 7 || S.hour > 18)) { const g = c.createRadialGradient(526, 60, 4, 526, 120, 110); g.addColorStop(0, 'rgba(255,236,170,.35)'); g.addColorStop(1, 'rgba(255,236,170,0)'); c.fillStyle = g; c.beginPath(); c.moveTo(514, 47); c.lineTo(450, 250); c.lineTo(602, 250); c.lineTo(538, 47); c.fill(); }
  }
  // a cozy throw blanket on the couch
  if (has('couch')) {
    const bx = 478, by = 186;
    c.fillStyle = '#b5523b'; c.beginPath(); c.moveTo(bx, by); c.lineTo(bx + 26, by + 2); c.lineTo(bx + 28, by + 34); c.lineTo(bx + 3, by + 30); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(255,230,200,.6)'; c.lineWidth = 1; for (let k = 4; k < 28; k += 6) { c.beginPath(); c.moveTo(bx + k, by + 1); c.lineTo(bx + k + 1.5, by + 31); c.stroke(); c.beginPath(); c.moveTo(bx + 1, by + k); c.lineTo(bx + 27, by + k + 1.5); c.stroke(); }
    c.fillStyle = '#e8c9a8'; for (let k = 0; k < 7; k++) c.fillRect(bx + 3 + k * 3.6, by + 30 + k * 0.5, 1, 4);
  }
  // slippers by the bed
  if (hasF('mattress')) { [[120, 0], [134, 0.15]].forEach(([x, r]) => { c.save(); c.translate(x, 306); c.rotate(r); c.fillStyle = '#7e57c2'; c.beginPath(); c.ellipse(0, 0, 9, 4, 0, 0, Math.PI * 2); c.fill(); c.fillStyle = '#b39ddb'; c.beginPath(); c.ellipse(-3, -1, 5, 3, 0, 0, Math.PI * 2); c.fill(); c.restore(); }); }
  // a plant on top of the wardrobe (or on the floor)
  const px = has('wardrobe') ? 230 : 290, py = has('wardrobe') ? 104 : 262;
  c.fillStyle = '#c56b3d'; c.beginPath(); c.moveTo(px - 8, py - 12); c.lineTo(px + 8, py - 12); c.lineTo(px + 6, py); c.lineTo(px - 6, py); c.closePath(); c.fill();
  c.fillStyle = '#a4552f'; c.fillRect(px - 9, py - 14, 18, 3);
  [[-10, -30, -0.6], [0, -36, 0], [9, -30, 0.6], [-5, -26, -0.3], [5, -27, 0.35]].forEach(([dx, dy, a]) => { c.save(); c.translate(px, py - 13); c.rotate(a); c.fillStyle = '#3e8e41'; c.beginPath(); c.ellipse(0, dy / 2, 3.5, Math.abs(dy) / 2, 0, 0, Math.PI * 2); c.fill(); c.fillStyle = 'rgba(255,255,255,.2)'; c.fillRect(-0.4, dy, 0.8, Math.abs(dy)); c.restore(); });
}
