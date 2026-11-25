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
function setupRoomInteract(cv) { cv.dataset.walk = '1'; }
// hold an arrow key to keep walking
const keysDown = {};
let keyWalk = null;
function keyWalkLoop(t0) {
  let last = t0;
  const step = t => {
    const dir = (keysDown.ArrowRight ? 1 : 0) - (keysDown.ArrowLeft ? 1 : 0);
    if (!dir || !$('#room')) { keyWalk = null; S.roomPhase = 0; const cv = $('#room'); if (cv) drawRoom(cv); updateRoomBar(); save(); return; }
    const was = nearSpots().map(s => s.id), before = nearSpots().map(s => s.id).join();
    S.roomX = Math.max(30, Math.min(985, S.roomX + dir * (t - last) * 0.32)); S.roomPhase = t / 90; S.facing = dir; last = t;
    const cv = $('#room'); if (cv) drawRoom(cv);
    if (nearSpots().map(s => s.id).join() !== before) { leftSpots(was); updateRoomBar(); }
    keyWalk = requestAnimationFrame(step);
  };
  keyWalk = requestAnimationFrame(step);
}
window.addEventListener('keydown', e => {
  if (!S || !$('#room') || document.activeElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName) || $('#modal').classList.contains('open')) return;
  if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
  e.preventDefault(); keysDown[e.key] = true;
  if (!keyWalk) keyWalkLoop(performance.now());
});
window.addEventListener('keyup', e => { delete keysDown[e.key]; });
window.addEventListener('blur', () => { delete keysDown.ArrowLeft; delete keysDown.ArrowRight; });

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
  return `<div class="walk muted small">⌨️ Use the ← → arrow keys on your keyboard to walk. Get close to things and buttons appear!</div>
    ${verbBar()}
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
  if (h.kind === 'dish') { pass(0.3); ateFood(h.food); fun2(5); S.dishes++; S.handsDirty && toast('🧼 Did you wash your hands first?'); log(`${h.icon} You ate the ${h.name.toLowerCase()} you made. Delicious!`, "good"); }
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

// ---------- action buttons: cook, cut, eat, drink, hold, read, write, draw, sing, dance, clean, sleep ----------
const VERBS = [['🍳', 'Cook', 'verbCook()'], ['🔪', 'Cut', 'verbCut()'], ['🍽️', 'Eat', 'verbEat()'], ['💧', 'Drink', 'verbDrink()'], ['🤲', 'Hold', 'verbHold()'], ['📖', 'Read', 'verbRead()'],
  ['✍️', 'Write', 'verbWrite()'], ['🖍️', 'Draw', 'verbDraw()'], ['🎤', 'Sing', 'verbSing()'], ['💃', 'Dance', 'verbDance()'], ['🧹', 'Clean', "homeAct('clean')"], ['😴', 'Sleep', "homeAct('sleep')"]];
function verbBar() { return `<div class="verbs">${VERBS.map(v => `<button class="verb" onclick="${v[2]}"><span>${v[0]}</span>${v[1]}</button>`).join('')}</div>`; }
function verbCook() {
  const near = nearSpots().map(s => s.id), cookable = S.hands.some(h => COOKS[handKey(h)]);
  if (cookable && near.includes('stove')) return putIn('stove');
  if (cookable && near.includes('microwave')) return putIn('microwave');
  if (cookable) return nope('Walk over to the stove or microwave to cook what you\'re holding!');
  recipeModal();
}
const CUTS = { veggies: ['Salad', '🥗', 22], bread: ['Sandwich', '🥪', 25], apples: ['Apple slices', '🍏', 14], bananas: ['Banana slices', '🍌', 13], cheese: ['Cheese slices', '🧀', 12], tortillas: ['Tortilla chips', '🌮', 12] };
function verbCut() {
  const list = S.hands.map((h, i) => [h, i]).filter(([h]) => h.kind === 'food' && (CUTS[h.id] || h.id === 'chicken'));
  if (!list.length) return nope('Hold some food to cut first! Grab veggies, bread, apples, bananas, cheese or chicken from the fridge or cabinet.');
  showModal(`<h2>🔪 What do you want to cut?</h2><p class="muted">Safety first: cut on a cutting board, keep your fingers curled back, and ask a grown-up to help with sharp knives!</p>
    <div class="grid actions">${list.map(([h, i]) => `<button class="action" onclick="closeModal();doCut(${i})"><span class="ic">${FOODS[h.id].icon}</span><b>${FOODS[h.id].name}</b><small>${h.id === 'chicken' ? 'cut into pieces (cooks faster)' : `makes ${CUTS[h.id][1]} ${CUTS[h.id][0]}`}</small></button>`).join('')}</div>`, [{ label: 'Cancel', cls: 'ghost' }]);
}
function doCut(i) {
  const h = S.hands[i]; if (!h) return;
  pass(5 / 60); addSkill('cook', 0.8);
  if (S.skills.cook < 10 && Math.random() < 0.1) { S.needs.health = clamp(S.needs.health - 3); log('🩹 Ouch! You nicked your finger. Curl your fingers back and go slow!', 'bad'); }
  if (h.id === 'chicken') { h.cut = true; log('🔪 You cut the chicken into pieces on a cutting board. Wash your hands after touching raw chicken!'); S.handsDirty = true; }
  else { const c = CUTS[h.id]; S.hands[i] = { kind: 'dish', name: c[0], icon: c[1], food: c[2] }; log(`🔪 You cut the ${FOODS[h.id].name.toLowerCase()} and made ${c[1]} ${c[0].toLowerCase()}!`); }
  S.dishes++; done();
}
function verbEat() {
  const i = S.hands.findIndex(handEdible);
  if (i >= 0) return eatHand(i);
  snackMenu();
}
function verbDrink() { const near = nearSpots().map(s => s.id); if (near.includes('sink') && S.tap && S.tap.what === 'sink') return sinkDo('drink'); drink('tap'); done(); }
function verbHold() {
  const opts = [];
  (S.pets || []).forEach((p, i) => opts.push([PET_TYPES[p.kind].icon, `Hold ${p.name}`, 'cuddle your pet', `holdPet(${i})`]));
  if (hasToy('teddy')) opts.push(['🧸', 'Hold your teddy bear', 'a big hug', "playToy('teddy')"]);
  const near = nearSpots().map(s => s.id);
  ['fridge', 'cabinet'].forEach(k => { if (near.includes(k)) opts.push([k === 'fridge' ? '🧊' : '🗄️', `Hold something from the ${k === 'fridge' ? 'fridge' : 'cabinet'}`, 'grab it', `grabFrom('${k}')`]); });
  if (S.hands.length) opts.push(['📥', 'Put something down', 'free your hands', 'putDownModal()']);
  if (!opts.length) return nope('Walk over to the fridge or cabinet to grab something to hold — or get a pet or teddy bear!');
  showModal(`<h2>🤲 Hold</h2><div class="grid actions">${opts.map(o => `<button class="action" onclick="closeModal();${o[3]}"><span class="ic">${o[0]}</span><b>${o[1]}</b><small>${o[2]}</small></button>`).join('')}</div>`, [{ label: 'Cancel', cls: 'ghost' }]);
}
function holdPet(i) { const p = S.pets[i]; pass(0.25, 'relax'); p.happy = clamp(p.happy + 12); fun2(8); log(`🤗 You held ${p.name} close. ${baseOf(p) === 'cat' ? 'They purred like a little engine!' : baseOf(p) === 'dog' ? 'They licked your face!' : baseOf(p) === 'fish' ? '...well, you smiled at them through the glass. 🐟' : 'They snuggled right in.'}`, 'good'); done(); }
function putDownModal() {
  const near = nearSpots().map(s => s.id), where = ['fridge', 'cabinet'].find(k => near.includes(k));
  if (where) return putIn(where);
  showModal(`<h2>📥 Put something down</h2><p class="muted">Walk to the fridge or snack cabinet to put food away. Or put it on the table:</p><div class="grid actions">${S.hands.map((h, i) => `<button class="action" onclick="closeModal();tableDrop(${i})"><span class="ic">${handIcon(h)}</span><b>${handName(h)}</b><small>put it in the kitchen</small></button>`).join('')}</div>`, [{ label: 'Cancel', cls: 'ghost' }]);
}
function tableDrop(i) { const h = S.hands[i]; S.hands.splice(i, 1); if (h.kind === 'snack') S.pantry[h.k] = (S.pantry[h.k] || 0) + 1; else if (h.kind === 'food') S.fridgeFood.push({ id: h.id, exp: h.exp, where: FOODS[h.id].cold ? 'fridge' : 'cabinet' }); else S.fridgeFood.push({ id: 'veggies', exp: S.day + 2, where: 'fridge', leftover: h.name }); log(`📥 You put the ${handName(h).toLowerCase()} away.`); render(); save(); }
function verbRead() {
  const opts = [['📕', 'Read a book', has('bookshelf') ? 'from your bookshelf · Writing skill' : 'a book you own · Writing skill', "homeAct('read')"]];
  if (S.lib && S.lib.books.length) opts.push(['📚', 'Read a library book', `${S.lib.books.length} borrowed`, 'readLibraryBook()']);
  opts.push(['📰', 'Read the newspaper', 'town news', "showNews('📰 The Maple Times')"]);
  opts.push(['💭', 'Read a comic book', 'just for fun', 'readComic()']);
  showModal(`<h2>📖 Read</h2><div class="grid actions">${opts.map(o => `<button class="action" onclick="closeModal();${o[3]}"><span class="ic">${o[0]}</span><b>${o[1]}</b><small>${o[2]}</small></button>`).join('')}</div>`, [{ label: 'Cancel', cls: 'ghost' }]);
}
function readComic() { pass(0.5, 'relax'); fun2(10); addSkill('write', 0.4); log(`💭 You read a comic about ${pickR(['a superhero dog', 'space pirates', 'a robot who loves pancakes', 'a girl who can talk to birds'])}. So funny!`); done(); }
const DIARY = ['Today I learned something new...', 'Something that made me happy today was...', 'One thing I want to do this year is...', 'My favorite thing about my friends is...', 'If I could have any job, I would be...', 'Something hard I did today was...'];
function verbWrite() {
  const ch = S.book ? S.book.chapters || 0 : 0;
  const opts = [['📔', 'Write in your diary', 'about your day · Writing skill', 'writeDiary()'], ['📝', 'Write a poem', 'be creative!', 'writePoem()'], ['📕', 'Write a book chapter', 'publish it later for money', 'writeChapter()']];
  if (has('desk')) opts.push(['🗒️', 'Do homework', 'at your desk', "homeAct('homework')"]);
  showModal(`<h2>✍️ Write</h2><div class="grid actions">${opts.map(o => `<button class="action" onclick="closeModal();${o[3]}"><span class="ic">${o[0]}</span><b>${o[1]}</b><small>${o[2]}</small></button>`).join('')}</div>`, [{ label: 'Cancel', cls: 'ghost' }]);
}
function writeDiary() { pass(0.5, 'relax'); addSkill('write', 1.2); fun2(6); S.diary = (S.diary || 0) + 1; log(`📔 Dear Diary... "${pickR(DIARY)}" You filled a whole page! (${S.diary} entries)`); done(); }
function writePoem() { pass(0.5, 'relax'); addSkill('write', 1.4); addSkill('art', 0.4); fun2(7); log(`📝 You wrote a poem: "${pickR(['The moon is a cookie, / the stars are the crumbs, / I eat them all up / when nighttime comes.', 'My dog has a tail / that wags like a flag, / he runs to the door / with his toy in a bag.', 'Rain on the window, / tap tap tap, / I read my book / with a cat on my lap.', 'Snowflakes falling, / soft and white, / I build a snowman / out in the light.'])}"`, 'good'); done(); }
function verbDraw() {
  if (S.inv && S.inv.canvases > 0) return showModal('<h2>🖍️ Draw or Paint?</h2>', [{ label: '🖍️ Draw for fun', cls: 'ghost', fn: drawPicture }, { label: '🖼️ Paint on a canvas (to sell)', cls: 'primary', fn: () => { paint(); } }]);
  drawPicture();
}
function drawPicture() { pass(0.5, 'relax'); addSkill('art', 1.2); fun2(8); log(`🖍️ You drew ${pickR(['your family', 'a dog eating spaghetti', 'your dream house', 'a rocket going to Mars', 'your pet', 'a rainbow over the town'])}. You stuck it on the fridge!`); done(); }
function verbSing() {
  pass(0.25, 'relax'); addSkill('music', 0.8); fun2(8);
  const inShower = S.tap && S.tap.what === 'shower';
  if (S.hour >= 22 || S.hour < 7) { S.lateNoise = true; log('🎤 You sang loudly... but it\'s late! Shhh, people are sleeping.'); }
  else log(inShower ? '🚿🎤 You sang in the shower! The echo made you sound like a pop star.' : `🎤 You sang "${pickR(['Happy Birthday', 'Twinkle Twinkle Little Star', 'a song you made up', 'your favorite radio song', 'The Alphabet Song'])}" at the top of your lungs!`);
  done();
}
function verbDance() { if (S.needs.energy < 10) return nope('Too tired to dance!'); pass(0.25, 'relax'); addSkill('fit', 0.6); fun2(12); S.needs.energy = clamp(S.needs.energy - 4); log(`💃 You turned on music and danced ${pickR(['the robot', 'like a chicken', 'a happy wiggle dance', 'the moonwalk', 'a twirly spin dance'])}!`); done(); }

// ---------- jobs at every place: interview right where you are ----------
function jobsHereCard(pid) {
  if (!pid || pid === 'jobcenter') return '';
  const jobs = JOBS.filter(j => workplaceOf(j) === pid).sort((a, b) => a.pay - b.pay);
  if (!jobs.length) return '';
  return `<details class="card jobshere" ${S.job ? '' : 'open'}><summary>💼 Jobs Here <span class="muted small">· ${jobs.length} jobs · ask for an interview right now! (weekdays 8 AM – 4 PM)</span></summary>
    <div class="mrows">${jobs.map(j => { const ok = meetsReqs(j), mine = S.job && S.job.id === j.id, cd = S.cooldown[j.id] && S.cooldown[j.id] > S.day;
      return mrow(ok ? '✅' : '💼', `${j.name} · $${j.pay}/hr`, `${EDU_NAMES[j.edu]}${j.req.length ? ' · ' + j.req.map(r => `${skillName(r.s)} ${r.lvl}`).join(', ') : ' · no skills needed'}${j.insurance ? ' · 🩺 insurance' : ''}`,
        mine ? b('Your job', '', 'ghost', true) : cd ? b(`Re-apply day ${S.cooldown[j.id]}`, '', 'ghost', true) : b('🤝 Interview', `startInterview(${j.id})`, ok ? 'primary' : 'ghost')); }).join('')}</div></details>`;
}
// the first time you visit a place that's hiring, the manager offers you an interview
function hiringWelcome(pid) {
  if (!S.visitedJobs) S.visitedJobs = {};
  if (S.visitedJobs[pid] || S.job) return;
  const jobs = JOBS.filter(j => workplaceOf(j) === pid && meetsReqs(j));
  S.visitedJobs[pid] = true;
  if (!jobs.length || isWeekend() || S.hour < 8 || S.hour > 16) return;
  const j = jobs.sort((a, b2) => b2.pay - a.pay)[0];
  queueModal(`<h2>👋 We're Hiring!</h2><p>The manager at the ${PLACES[pid].name} saw you come in: <b>"Hi! We need a ${j.name}. It pays $${j.pay}/hour. Want to do an interview right now?"</b></p><button class="btn primary" onclick="closeModal();startInterview(${j.id})">🤝 Yes, interview me!</button> <span class="muted small">(or tap OK to say no thanks)</span>`);
}
