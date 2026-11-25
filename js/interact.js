// ===================== WALK AROUND YOUR HOME: get close to things and buttons appear =====================
// Grab / Put in (fridge, snack cabinet, stove, microwave), Play (toys), Use + Flush (toilet), Use + Turn off (sink, shower).

function ensureInteractState() {
  if (S.roomX === undefined) S.roomX = 300;
  if (!S.hands) S.hands = [];
  if (!S.cooked) S.cooked = {};
  if (S.tap === undefined) S.tap = null;
  if (S.toiletUsed === undefined) S.toiletUsed = false;
}
const MAX_HANDS = 4;
// what can be cooked, and what it turns into: [dish name, icon, food points, where]
const COOKS = {
  eggs: ['Scrambled eggs', '🍳', 30, 'stove'], pasta: ['Hot pasta', '🍝', 40, 'stove'], rice: ['Rice bowl', '🍚', 35, 'both'], chicken: ['Roast chicken', '🍗', 50, 'stove'],
  veggies: ['Steamed veggies', '🥦', 25, 'both'], bread: ['Toast', '🍞', 18, 'stove'], tortillas: ['Quesadilla', '🌮', 35, 'stove'], milk: ['Warm milk', '🥛', 8, 'microwave'],
  'snack:pizza': ['Hot pizza', '🍕', 40, 'both'],
};

// ---------- the things in your room (x range on the floor) ----------
const SPOTS = [
  { id: 'bed', name: 'Bed', icon: '🛏️', x: [20, 180], show: () => hasF('mattress') },
  { id: 'teddy', name: 'Teddy Bear', icon: '🧸', x: [120, 180], show: () => hasToy('teddy') },
  { id: 'bricks', name: 'Building Bricks', icon: '🧱', x: [190, 245], show: () => hasToy('bricks') },
  { id: 'books', name: 'Bookshelf', icon: '📚', x: [280, 352], show: () => has('bookshelf') },
  { id: 'rccar', name: 'Race Car', icon: '🏎️', x: [365, 410], show: () => hasToy('rccar') },
  { id: 'couch', name: 'Couch & TV', icon: '🛋️', x: [336, 512], show: () => has('couch') || has('tv') },
  { id: 'ball', name: 'Bouncy Ball', icon: '🔴', x: [440, 465], show: () => hasToy('ball') },
  { id: 'table', name: 'Table', icon: '🍽️', x: [468, 584], show: () => has('table') },
  { id: 'train', name: 'Train Set', icon: '🚂', x: [544, 636], show: () => hasToy('trainset') },
  { id: 'cabinet', name: 'Snack Cabinet', icon: '🗄️', x: [556, 614], show: () => true },
  { id: 'stove', name: 'Stove', icon: '🍳', x: [618, 684], show: () => hasF('stove') },
  { id: 'microwave', name: 'Microwave', icon: '📦', x: [618, 684], show: () => has('microwave') },
  { id: 'fridge', name: 'Refrigerator', icon: '🧊', x: [688, 748], show: () => hasF('fridge') },
  { id: 'washer', name: 'Washing Machine', icon: '🧺', x: [748, 795], show: () => hasF('washer') },
  { id: 'sink', name: 'Sink', icon: '🚰', x: [798, 880], show: () => true },
  { id: 'toilet', name: 'Toilet', icon: '🚽', x: [800, 880], show: () => hasF('toilet') },
  { id: 'shower', name: 'Shower', icon: '🚿', x: [900, 998], show: () => hasF('shower') },
];
const nearSpots = () => SPOTS.filter(s => s.show() && S.roomX >= s.x[0] - 25 && S.roomX <= s.x[1] + 25);

// ---------- walking ----------
let roomWalk = null;
function walkTo(x) {
  ensureInteractState();
  x = Math.max(30, Math.min(985, x));
  const was = nearSpots().map(s => s.id);
  cancelAnimationFrame(roomWalk && roomWalk.raf);
  const start = performance.now(), from = S.roomX, dur = Math.min(1400, Math.abs(x - from) * 3.2);
  const step = t => {
    const k = dur ? Math.min(1, (t - start) / dur) : 1;
    S.roomX = from + (x - from) * k; S.roomPhase = (t / 90);
    const cv = $('#room'); if (cv) drawRoom(cv);
    if (k < 1) roomWalk = { raf: requestAnimationFrame(step) };
    else { roomWalk = null; S.roomPhase = 0; if (cv) drawRoom(cv); leftSpots(was); updateRoomBar(); save(); }
  };
  roomWalk = { raf: requestAnimationFrame(step) };
}
function leftSpots(was) {
  const now = nearSpots().map(s => s.id);
  if (was.includes('toilet') && !now.includes('toilet') && S.toiletUsed) { S.toiletUsed = false; S.mess = clamp(S.mess + 3); fun2(-2); log('🤢 Eww! You forgot to FLUSH the toilet. Always flush after you go!', 'bad'); }
}
function roomStep(dir) { walkTo(S.roomX + dir * 90); }
function setupRoomInteract(cv) {
  if (cv.dataset.walk) return;
  cv.dataset.walk = '1'; cv.style.cursor = 'pointer';
  cv.addEventListener('click', e => { const r = cv.getBoundingClientRect(); walkTo((e.clientX - r.left) / r.width * RW); });
}
window.addEventListener('keydown', e => {
  if (!S || !$('#room') || document.activeElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName) || $('#modal').classList.contains('open')) return;
  if (e.key === 'ArrowLeft') { roomStep(-1); e.preventDefault(); }
  if (e.key === 'ArrowRight') { roomStep(1); e.preventDefault(); }
});

// ---------- the button bar under your room ----------
function roomBar() { return `<div id="roombar" class="roombar">${roomBarHtml()}</div>`; }
function updateRoomBar() { const el = $('#roombar'); if (el) el.innerHTML = roomBarHtml(); }
function rb(label, fn, cls = 'primary', dis = false) { return `<button class="btn sm ${cls}" ${dis ? 'disabled' : ''} onclick="${fn}">${label}</button>`; }
function roomBarHtml() {
  ensureInteractState();
  const near = nearSpots();
  const parts = [];
  near.forEach(s => {
    const btns = spotButtons(s.id);
    if (btns.length) parts.push(`<div class="spot"><b>${s.icon} ${s.name}</b>${btns.join('')}</div>`);
  });
  const hands = S.hands.length ? `<div class="hands"><b>🤲 Your stuff:</b> ${S.hands.map((h, i) => `<span class="chip">${handIcon(h)} ${handName(h)} ${handEdible(h) ? `<button class="btn sm ghost" onclick="eatHand(${i})">Eat</button>` : ''}</span>`).join('')}</div>` : '<div class="hands muted small">🤲 Your hands are empty.</div>';
  const water = S.tap ? `<div class="waterwarn">💧 The ${S.tap.what} is running! ${Math.round(tapGallons())} gallons so far — ${S.tap.what === 'shower' ? 'you pay for every gallon!' : 'turn it off!'} ${rb('🚱 Turn off', 'tapOff()', 'primary')}</div>` : '';
  return `<div class="walk"><button class="btn sm ghost" onclick="roomStep(-1)" aria-label="Walk left">◀ Walk</button><span class="muted small">Tap the room or use ← → to walk around. Get close to things!</span><button class="btn sm ghost" onclick="roomStep(1)" aria-label="Walk right">Walk ▶</button></div>
    ${water}${parts.length ? `<div class="spots">${parts.join('')}</div>` : '<p class="muted small">Walk up to something to use it.</p>'}${hands}`;
}
function spotButtons(id) {
  const B = [];
  if (id === 'bed') B.push(rb('😴 Sleep', "homeAct('sleep')"), rb('💤 Nap', "homeAct('nap')", 'ghost'), rb('🛏️ Make bed', 'makeBed();done()', 'ghost'));
  if (['teddy', 'bricks', 'rccar', 'ball', 'train'].includes(id)) B.push(rb('▶ Play', `playToy('${id === 'train' ? 'trainset' : id}')`));
  if (id === 'books') B.push(rb('📖 Read', "homeAct('read')"));
  if (id === 'couch') { if (has('tv')) B.push(rb('📺 Watch TV', "homeAct('tv')")); if (has('console')) B.push(rb('🎮 Video games', "homeAct('games')", 'ghost')); }
  if (id === 'cabinet' || id === 'fridge') B.push(rb('✋ Grab', `grabFrom('${id}')`), rb('📥 Put in', `putIn('${id}')`, 'ghost', !S.hands.length));
  if (id === 'stove' || id === 'microwave') { const d = S.cooked[id]; B.push(rb('📥 Put in', `putIn('${id}')`, 'ghost', !S.hands.length || !!d), rb(d ? `✋ Grab ${d.icon} ${d.name}` : '✋ Grab', `grabFrom('${id}')`, d ? 'primary' : 'ghost', !d)); }
  if (id === 'washer') B.push(rb('🧺 Do laundry', "homeAct('laundry')"));
  if (id === 'sink') { if (S.tap && S.tap.what === 'sink') B.push(rb('🧼 Wash hands', "sinkDo('hands')"), rb('🪥 Brush teeth', "sinkDo('teeth')", 'ghost'), rb('💧 Drink', "sinkDo('drink')", 'ghost'), rb('🚱 Turn off', 'tapOff()')); else B.push(rb('🚰 Use', "tapOn('sink')", 'primary', !!S.tap)); }
  if (id === 'toilet') B.push(S.toiletUsed ? rb('🚽 Flush', 'flush()') : rb('🚽 Use', 'toiletUse()'));
  if (id === 'shower') B.push(S.tap && S.tap.what === 'shower' ? rb('🚱 Turn off', 'tapOff()') : rb('🚿 Use', "tapOn('shower')", 'primary', !!S.tap));
  return B;
}

// ---------- your stuff (what you're holding) ----------
function handIcon(h) { return h.kind === 'dish' ? h.icon : h.kind === 'snack' ? PANTRY[h.k].icon : FOODS[h.id].icon; }
function handName(h) { return h.kind === 'dish' ? h.name : h.kind === 'snack' ? PANTRY[h.k].name : FOODS[h.id].name; }
function handEdible(h) { return h.kind === 'dish' || (h.kind === 'snack' && !PANTRY[h.k].hot) || (h.kind === 'food' && FOODS[h.id].snack); }
function handKey(h) { return h.kind === 'snack' ? 'snack:' + h.k : h.id; }
function eatHand(i) {
  const h = S.hands[i]; if (!h || !handEdible(h)) return;
  S.hands.splice(i, 1);
  if (h.kind === 'dish') { pass(0.3); ateFood(h.food); fun2(5); S.dishes++; S.handsDirty && toast('🧼 Did you wash your hands first?'); log(`${h.icon} You ate the ${h.name.toLowerCase()} you cooked. Delicious!`, 'good'); }
  else if (h.kind === 'snack') { S.pantry[h.k] = (S.pantry[h.k] || 0) + 1; eatSnack(h.k); }
  else { const f = FOODS[h.id]; pass(0.1); ateFood(f.snack[0]); S.needs.thirst = clamp(S.needs.thirst + (f.snack[1] || 0)); S.trash = clamp(S.trash + 1); log(`${f.icon} You ${h.id === 'milk' ? 'drank a glass of' : 'ate some'} ${f.name.toLowerCase()}.`); }
  done();
}
function holdRoom() { if (S.hands.length >= MAX_HANDS) { nope(`Your hands are full! You can only carry ${MAX_HANDS} things. Put something down first.`); return false; } return true; }

// ---------- grab & put in ----------
function cabinetFood() { return S.fridgeFood.filter(f => f.where === 'cabinet' || (!f.where && !FOODS[f.id].cold)); }
function fridgeFoodOnly() { return S.fridgeFood.filter(f => f.where === 'fridge' || (!f.where && FOODS[f.id].cold)); }
function grabFrom(where) {
  if (where === 'stove' || where === 'microwave') {
    const d = S.cooked[where]; if (!d) return nope(`The ${where} is empty.`);
    if (!holdRoom()) return;
    S.hands.push(d); delete S.cooked[where]; log(`✋ You took the ${d.icon} ${d.name.toLowerCase()} out of the ${where}. Careful, it's hot!`); render(); save(); return;
  }
  const foods = where === 'fridge' ? fridgeFoodOnly() : cabinetFood();
  const ids = [...new Set(foods.map(f => f.id))];
  const snacks = where === 'cabinet' ? Object.keys(PANTRY).filter(k => S.pantry[k] > 0 && !(k === 'pizza')) : where === 'fridge' ? Object.keys(PANTRY).filter(k => S.pantry[k] > 0 && k === 'pizza') : [];
  if (!ids.length && !snacks.length) return nope(`The ${where === 'fridge' ? 'fridge' : 'snack cabinet'} is empty! Buy food at the 🛒 Supermarket.`);
  showModal(`<h2>${where === 'fridge' ? '🧊 Inside the Fridge' : '🗄️ Inside the Snack Cabinet'}</h2><p class="muted">Tap something to grab it.</p>
    <div class="grid actions">${ids.map(id => { const list = foods.filter(f => f.id === id), soon = Math.min(...list.map(f => f.exp)) - S.day; return `<button class="action" onclick="grabFood('${id}','${where}')"><span class="ic">${FOODS[id].icon}</span><b>${FOODS[id].name}</b><small>${list.length} · ${FOODS[id].shelf >= 365 ? "won't spoil" : soon <= 0 ? 'eat today!' : `good for ${soon} days`}</small></button>`; }).join('')}
    ${snacks.map(k => `<button class="action" onclick="grabSnack('${k}')"><span class="ic">${PANTRY[k].icon}</span><b>${PANTRY[k].name}</b><small>${S.pantry[k]} left</small></button>`).join('')}</div>`, [{ label: 'Close the door', cls: 'ghost' }]);
}
function grabFood(id, where) {
  if (!holdRoom()) return;
  const pool = where === 'fridge' ? fridgeFoodOnly() : cabinetFood();
  const f = pool.filter(x => x.id === id).sort((a, b2) => a.exp - b2.exp)[0]; if (!f) return;
  S.fridgeFood.splice(S.fridgeFood.indexOf(f), 1);
  S.hands.push({ kind: 'food', id, exp: f.exp });
  closeModal(); log(`✋ You grabbed ${FOODS[id].icon} ${FOODS[id].name.toLowerCase()}.`); render(); save();
}
function grabSnack(k) { if (!holdRoom()) return; S.pantry[k]--; S.hands.push({ kind: 'snack', k }); closeModal(); log(`✋ You grabbed ${PANTRY[k].icon} ${PANTRY[k].name.toLowerCase()}.`); render(); save(); }
function putIn(where) {
  if (!S.hands.length) return nope('Your hands are empty.');
  const ok = S.hands.map((h, i) => [h, i]).filter(([h]) => where === 'stove' || where === 'microwave' ? !!COOKS[handKey(h)] && ['both', where].includes(COOKS[handKey(h)][3]) : h.kind !== 'dish' || where === 'fridge');
  if (!ok.length) return nope(where === 'stove' || where === 'microwave' ? `Nothing you're holding can be cooked in the ${where}. Try eggs, pasta, rice, chicken, veggies, bread or frozen pizza!` : 'You can\'t put that in there.');
  showModal(`<h2>📥 Put in the ${({ fridge: 'Fridge', cabinet: 'Snack Cabinet', stove: 'Stove', microwave: 'Microwave' })[where]}</h2><p class="muted">Your stuff:</p>
    <div class="grid actions">${ok.map(([h, i]) => `<button class="action" onclick="putItem(${i},'${where}')"><span class="ic">${handIcon(h)}</span><b>${handName(h)}</b><small>${where === 'stove' || where === 'microwave' ? `cooks into ${COOKS[handKey(h)][1]} ${COOKS[handKey(h)][0]}` : 'put it away'}</small></button>`).join('')}</div>`, [{ label: 'Cancel', cls: 'ghost' }]);
}
function putItem(i, where) {
  const h = S.hands[i]; if (!h) return;
  closeModal();
  if (where === 'stove' || where === 'microwave') {
    if (S.powerOut) return nope('🔌 The power is out! It won\'t turn on.');
    const c = COOKS[handKey(h)];
    S.hands.splice(i, 1);
    pass(where === 'microwave' ? 0.1 : 0.3); addSkill('cook', where === 'stove' ? 1 : 0.4); S.kwh = (S.kwh || 0) + (where === 'stove' ? 0.5 : 0.15);
    const burnt = where === 'stove' && S.skills.cook < 15 && Math.random() < 0.2;
    S.cooked[where] = { kind: 'dish', name: burnt ? `Burnt ${c[0].toLowerCase()}` : c[0], icon: burnt ? '🔥' : c[1], food: burnt ? Math.round(c[2] / 2) : c[2] };
    log(burnt ? `🔥 Oops, you cooked it too long! It's a little burnt.` : `${c[1]} You cooked ${c[0].toLowerCase()} in the ${where}. Grab it when you're ready!`, burnt ? 'bad' : 'good');
  } else if (h.kind === 'snack') { S.hands.splice(i, 1); S.pantry[h.k] = (S.pantry[h.k] || 0) + 1; log(`📥 You put the ${PANTRY[h.k].name.toLowerCase()} away.`); }
  else if (h.kind === 'dish') { S.hands.splice(i, 1); S.fridgeFood.push({ id: 'veggies', exp: S.day + 3, where: 'fridge', leftover: h.name }); log(`📥 You put the leftover ${h.name.toLowerCase()} in the fridge.`); }
  else {
    S.hands.splice(i, 1);
    let exp = h.exp;
    if (where === 'cabinet' && FOODS[h.id].cold) { exp = Math.min(exp, S.day + 1); toast(`⚠️ ${FOODS[h.id].name} needs to stay cold! It will spoil soon in the cabinet.`, 'bad'); }
    S.fridgeFood.push({ id: h.id, exp, where });
    log(`📥 You put the ${FOODS[h.id].name.toLowerCase()} in the ${where === 'fridge' ? 'fridge' : 'cabinet'}.`);
  }
  done();
}

// ---------- water: sink & shower (you pay for water at home!) ----------
const TAP_RATE = { sink: 1.5, shower: 2.5 };   // gallons for every second the water runs
let tapTimer = null;
function tapGallons() { return S.tap ? (Date.now() - S.tap.since) / 1000 * TAP_RATE[S.tap.what] : 0; }
function tapOn(what) {
  if (S.tap) return nope('Turn the other water off first!');
  if (what === 'shower' && !hasF('shower')) return nope('You don\'t have a shower!');
  S.tap = { what, since: Date.now(), did: [] };
  clearInterval(tapTimer); tapTimer = setInterval(() => { if (!S.tap) return clearInterval(tapTimer); updateRoomBar(); }, 1000);
  log(what === 'shower' ? '🚿 You turned on the shower. The water is warm!' : '🚰 You turned on the sink.');
  updateRoomBar();
}
function sinkDo(what) {
  if (!S.tap || S.tap.what !== 'sink') return nope('Turn on the water first!');
  if (what === 'hands') { washHands(); }
  if (what === 'teeth') { brushTeeth(); }
  if (what === 'drink') { S.needs.thirst = clamp(S.needs.thirst + 35); pass(2 / 60); log('💧 You drank a glass of cold water. Refreshing!'); }
  S.tap.did.push(what);
  render();
}
function tapOff() {
  const T = S.tap; if (!T) return;
  const secs = Math.max(1, (Date.now() - T.since) / 1000), gal = secs * TAP_RATE[T.what];
  S.tap = null; clearInterval(tapTimer);
  const home = S.home !== 'parents';
  S.water.gallons += gal;
  if (T.what === 'shower') {
    const mins = Math.min(30, Math.round(secs));
    pass(Math.max(5, mins) / 60);
    if (mins >= 3) { const soap = S.home === 'parents' || S.supplies > 0; if (S.home !== 'parents' && S.supplies > 0) S.supplies--; S.needs.hygiene = soap ? 100 : 75; S.today.showered = true; if (mins > 15) fun2(4); }
    else S.needs.hygiene = clamp(S.needs.hygiene + mins * 15);
    log(`🚿 You turned off the shower after ${mins} minute${mins > 1 ? 's' : ''}. ${mins < 3 ? 'That was too quick to get really clean!' : mins <= 8 ? 'Squeaky clean, and you saved water! 👏' : `You used about ${Math.round(gal)} gallons of water.`}${home ? ` (about ${money(gal * 0.012)} on your water bill)` : ''}`, mins >= 3 && mins <= 8 ? 'good' : '');
  } else {
    log(`🚱 You turned off the sink.${!T.did.length ? ' (You didn\'t even use it!)' : ''}${gal > 20 ? ` You let ${Math.round(gal)} gallons run — try turning it off faster!` : ' Good job saving water! 💧'}`);
  }
  done();
}
function toiletUse() { if (S.toiletUsed) return nope('Flush first!'); useToilet(); S.toiletUsed = true; render(); }
function flush() { S.toiletUsed = false; S.water.gallons += 1.6; pass(1 / 60); log('🚽 WHOOSH! You flushed the toilet. Now wash your hands at the sink! 🧼'); render(); save(); }
// leaving home with the water on is a big waste
function leavingWithWater() {
  if (S.tap) { const gal = tapGallons() + 150; S.water.gallons += gal; S.tap = null; clearInterval(tapTimer); log(`😱 You left the ${'water'} running when you left home! About ${Math.round(gal)} gallons went down the drain. That makes the water bill much bigger!`, 'bad'); }
  if (S.toiletUsed) { S.toiletUsed = false; log('🤢 You left without flushing the toilet! Gross!', 'bad'); }
}

// ---------- search in shops ----------
function shopSearchBar() {
  return `<div class="searchbar"><input type="search" id="shopq" placeholder="🔍 Search for what you want to buy..." oninput="shopSearch(this.value)" aria-label="Search this store"></div>`;
}
function shopSearch(q) {
  q = q.trim().toLowerCase();
  document.querySelectorAll('#view .card.item, #view .mrow, #view .action').forEach(el => {
    if (el.closest('.searchbar')) return;
    el.style.display = !q || el.textContent.toLowerCase().includes(q) ? '' : 'none';
  });
}
const TIP_PLACES = ['diner', 'icecream', 'cocoa', 'pancake', 'bakery', 'fishmarket', 'skilodge'];
function tipJar(pid) {
  if (!TIP_PLACES.includes(pid)) return '';
  return `<div class="card"><h3>💵 Tip Jar <span class="muted small">· optional</span></h3><p class="muted small">Tips say "thank you" to the workers. You don't have to, but it's kind!</p><div class="row">${[1, 2, 5].map(a => rb(`Tip ${money(a)}`, `leaveTip(${a})`, 'ghost')).join('')}</div></div>`;
}
function leaveTip(a) { if (!spend(a, 'Tip')) return; fun2(2); log(`💵 You put ${money(a)} in the tip jar. The worker smiled and said "Thank you so much!" 😊`, 'good'); done(); }

// ---------- drawing: snack cabinet, cooking steam, running water, what you're holding ----------
function drawKitchenBits(c) {
  // a wall-mounted snack cabinet
  box3d(c, 558, 44, 54, 58, 0.03, '#8d6e63', 'wood', 51);
  c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 1; c.strokeRect(561, 47, 23, 52); c.strokeRect(587, 47, 22, 52);
  knob(c, 581, 74, 1.8, '#d4af37'); knob(c, 590, 74, 1.8, '#d4af37');
  // steam when food is cooking
  const t = Date.now() / 300;
  [['stove', 650, 180], ['microwave', 650, 126]].forEach(([k, x, y]) => {
    if (!S.cooked || !S.cooked[k]) return;
    c.strokeStyle = 'rgba(255,255,255,.75)'; c.lineWidth = 2; c.lineCap = 'round';
    for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(x - 10 + i * 10, y); c.bezierCurveTo(x - 16 + i * 10, y - 8, x - 4 + i * 10, y - 14, x - 10 + i * 10, y - 22); c.stroke(); }
    c.fillStyle = '#ffd54f'; c.beginPath(); c.arc(x + 26, y - 6, 3, 0, Math.PI * 2); c.fill();
  });
  // running water
  if (S.tap) {
    c.strokeStyle = 'rgba(120,190,240,.85)'; c.lineWidth = 2.2;
    if (S.tap.what === 'sink') { c.beginPath(); c.moveTo(841, 87); c.lineTo(841, 98); c.stroke(); c.fillStyle = 'rgba(200,230,255,.8)'; c.beginPath(); c.ellipse(841, 98, 6, 1.6, 0, 0, Math.PI * 2); c.fill(); }
    else { c.lineWidth = 1; for (let k = 0; k < 14; k++) { const x = 941 + k * 1.4; c.beginPath(); c.moveTo(x, 80); c.lineTo(x + (k - 7) * 1.6, 250); c.stroke(); } c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(905, 60, 92, 200); }
  }
  if (S.toiletUsed) { c.fillStyle = '#5d4037'; c.font = '700 10px system-ui'; c.fillText('🚽 flush!', 826, 168); }
}
function drawHeld(c, px) {
  if (!S.hands || !S.hands.length) return;
  c.font = '18px system-ui, "Apple Color Emoji", "Segoe UI Emoji"'; c.textAlign = 'center';
  S.hands.slice(0, 2).forEach((h, i) => c.fillText(handIcon(h), px + (i ? -22 : 22), 296));
  c.textAlign = 'start';
}
