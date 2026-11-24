// ===================== YOUR HOME =====================
// Stuff you need (toilet, fridge, bed...), furniture, decorations,
// paintings on the walls, and a picture of the inside of your home.

// What each home already has when you move in.
const HOME_INCLUDES = {
  parents: ['toilet', 'shower', 'fridge', 'stove', 'mattress', 'table', 'washer'],
  shared:  ['toilet', 'shower', 'fridge', 'stove'],
  studio:  ['toilet', 'shower'],
  onebed:  ['toilet', 'shower'],
  small:   [],
  family:  [],
  mansion: [],
};
const WALL_SLOTS = { parents: 2, shared: 2, studio: 3, onebed: 4, small: 5, family: 6, mansion: 8 };
const WALL_COLORS = ['#f6ecd2', '#dbeaf7', '#d9f0dd', '#f7dcdc', '#e6ddf5', '#fde3c4', '#e9e9e9', '#cfe4e8'];
const ESSENTIALS = [
  ['toilet', '🚽', 'Toilet', 'Without one you have to go to a public restroom!'],
  ['shower', '🚿', 'Shower', 'Or a bathtub. You need one to get clean at home.'],
  ['fridge', '🧊', 'Fridge', 'Without one, most of your food goes bad overnight.'],
  ['stove', '🍳', 'Stove', 'You need it to cook meals.'],
  ['mattress', '🛏️', 'Bed', 'Sleeping on the floor gives you less energy.'],
];
const PANTRY = {
  fruit:  { name: 'Fruit',        icon: '🍎', food: 15, fun: 0, health: 3, perish: true },
  chips:  { name: 'Chips',        icon: '🥔', food: 12, fun: 6, health: -1 },
  cereal: { name: 'Cereal & milk', icon: '🥣', food: 25, fun: 2, health: 1, perish: true },
  pizza:  { name: 'Frozen pizza', icon: '🍕', food: 40, fun: 6, health: -1, perish: true, hot: true },
};

function hasF(f) {
  if (f === 'mattress') return has('mattress') || has('bed') || (HOME_INCLUDES[S.home] || []).includes('mattress');
  if (f === 'shower') return has('shower') || has('bathtub') || (HOME_INCLUDES[S.home] || []).includes('shower');
  return has(f) || (HOME_INCLUDES[S.home] || []).includes(f);
}
const atHome = () => S.loc === 'home';
function quickToilet() {
  if (atHome() && !homeToilet()) return;
  useToilet(); done();
}

function ensureHomeState() {
  if (S.supplies === undefined) S.supplies = 12;
  if (!S.pantry) S.pantry = { fruit: 0, chips: 0, cereal: 0, pizza: 0 };
  if (!S.walls) S.walls = [];
  if (!S.wallColor) S.wallColor = WALL_COLORS[0];
  // older saves: don't take away a toilet people already had
  if (!S.homeV2) {
    S.homeV2 = true;
    if (S.home !== 'parents') ['toilet', 'shower', 'fridge', 'stove', 'mattress'].forEach(f => S.owned[f] = true);
  }
}

function cozy() {
  let c = 0;
  ITEMS.forEach(it => { if (it.cozy && (has(it.id) || (HOME_INCLUDES[S.home] || []).includes(it.id))) c += it.cozy; });
  S.walls.forEach(w => c += w.kind === 'famous' ? 8 : w.kind === 'print' ? 1 : 1 + Math.round(w.q / 25));
  if (S.wallColor !== WALL_COLORS[0]) c += 1;
  return c;
}

// ---------- daily ----------
function homeNewDay() {
  if (!hasF('fridge')) {
    const lost = [];
    if (S.groceries > 2) { lost.push(`${S.groceries - 2} meals`); S.groceries = 2; }
    Object.entries(PANTRY).forEach(([k, p]) => { if (p.perish && S.pantry[k] > 0) { lost.push(`${S.pantry[k]} ${p.name.toLowerCase()}`); S.pantry[k] = 0; } });
    if (lost.length) log(`🤢 Your food went bad overnight (${lost.join(', ')}). You need a fridge! Buy one at the 🛍️ Mall.`, 'bad');
  }
}

// ---------- bathroom & supplies ----------
function homeToilet() {
  if (!hasF('toilet')) { nope('There\'s no toilet in your home! Buy one at the 🛍️ Mall, or use a public restroom.'); return false; }
  if (S.home !== 'parents') {
    if (S.supplies <= 0) {
      S.needs.hygiene = clamp(S.needs.hygiene - 15); S.needs.fun = clamp(S.needs.fun - 5);
      log('🧻 Oh no — you ran out of toilet paper! Buy Household Supplies at the 🛒 Supermarket.', 'bad');
    } else S.supplies--;
  }
  return true;
}
function homeShower() {
  if (!hasF('shower')) return nope('You don\'t have a shower or bathtub! Buy one at the 🛍️ Mall.');
  pass(0.5);
  const soap = S.home === 'parents' || S.supplies > 0;
  if (S.home !== 'parents' && S.supplies > 0) S.supplies--;
  S.needs.hygiene = soap ? 100 : 75;
  S.today.showered = true;
  log(soap ? '🚿 You took a shower. Squeaky clean!' : '🚿 You showered, but you\'re out of soap and shampoo. Only kind of clean. (Buy Household Supplies!)');
}
function takeBath() {
  if (!has('bathtub')) return nope('You need a bathtub.');
  pass(1, 'relax');
  S.needs.hygiene = 100; S.needs.fun = clamp(S.needs.fun + 12); S.today.showered = true;
  if (S.home !== 'parents' && S.supplies > 0) S.supplies--;
  log('🛁 You took a long bubble bath. So relaxing!');
}

// ---------- pantry ----------
function snackMenu() {
  const items = Object.entries(PANTRY).filter(([k]) => S.pantry[k] > 0);
  if (!items.length) return nope('No snacks at home. Buy some at the 🛒 Supermarket.');
  showModal(`<h2>🍿 What do you want to eat?</h2><div class="grid actions">${items.map(([k, p]) => `<button class="action" onclick="eatSnack('${k}')"><span class="ic">${p.icon}</span><b>${p.name}</b><small>You have ${S.pantry[k]}${p.hot ? ' · needs a stove or microwave' : ''}</small></button>`).join('')}</div>`,
    [{ label: 'Never mind', cls: 'ghost' }]);
}
function eatSnack(k) {
  const p = PANTRY[k];
  if (p.hot && !hasF('stove') && !has('microwave')) { nope('You need a stove or microwave to heat it up.'); return; }
  closeModal();
  S.pantry[k]--;
  pass(p.hot ? 0.4 : 0.2);
  ateFood(p.food);
  S.needs.fun = clamp(S.needs.fun + p.fun);
  S.needs.health = clamp(S.needs.health + p.health);
  log(`${p.icon} You ate ${p.name.toLowerCase()}.${p.health < 0 ? ' Tasty, but not very healthy.' : ''}`);
  done();
}

// ---------- buying ----------
function homeBuy(id) {
  const adds = { supplies: () => { S.supplies += 20; log('🧻 You bought household supplies: toilet paper, soap and shampoo (20 uses).'); },
    fruit: () => { S.pantry.fruit += 4; log('🍎 You bought fruit (4 snacks).'); },
    chips: () => { S.pantry.chips += 3; log('🥔 You bought chips (3 snacks).'); },
    cereal: () => { S.pantry.cereal += 5; log('🥣 You bought cereal and milk (5 breakfasts).'); },
    pizza: () => { S.pantry.pizza += 2; log('🍕 You bought frozen pizza (2 meals).'); } };
  if (!adds[id]) return false;
  adds[id]();
  if (!hasF('fridge') && ['fruit', 'cereal', 'pizza'].includes(id)) toast('⚠️ You have no fridge. This will go bad overnight!', 'bad');
  return true;
}
function afterBuyHome(it) {
  if (it.id === 'groceries' && !hasF('fridge')) toast('⚠️ No fridge at home: only 2 meals will stay fresh overnight!', 'bad');
  if (it.hang) {
    if (S.walls.length >= WALL_SLOTS[S.home]) { S.inv.prints = (S.inv.prints || []); S.inv.prints.push({ kind: it.hang, q: it.hang === 'famous' ? 99 : 40, seed: Math.random() }); log(`🖼️ Your walls are full, so you put the ${it.name} in storage.`); }
    else { S.walls.push({ kind: it.hang, q: it.hang === 'famous' ? 99 : 40, seed: Math.random() }); log(`🖼️ You hung the ${it.name} on your wall.`); }
    delete S.owned[it.id];
    checkDecor();
  }
}

// ---------- walls & paintings ----------
function hangPainting(i) {
  if (S.walls.length >= WALL_SLOTS[S.home]) return nope(`Your walls are full (${WALL_SLOTS[S.home]} spots). Bigger homes have more wall space!`);
  const q = S.inv.paintings.splice(i, 1)[0];
  S.walls.push({ kind: 'mine', q, seed: Math.random() });
  log('🖼️ You hung up your own painting. It looks great on the wall!', 'good');
  checkDecor();
  done();
}
function hangPrint(i) {
  if (S.walls.length >= WALL_SLOTS[S.home]) return nope('Your walls are full.');
  S.walls.push(S.inv.prints.splice(i, 1)[0]);
  checkDecor(); done();
}
function takeDown(i) {
  const w = S.walls.splice(i, 1)[0];
  if (w.kind === 'mine') S.inv.paintings.push(w.q);
  else { S.inv.prints = S.inv.prints || []; S.inv.prints.push(w); }
  log('🖼️ You took a painting off the wall.');
  done();
}
function paintWalls(col) {
  if (S.home === 'parents' && S.wallColor === col) return;
  if (!spend(30, 'Wall paint')) return;
  pass(3, 'study');
  S.wallColor = col;
  S.needs.fun = clamp(S.needs.fun + 5);
  log('🎨 You painted your walls a new color. Looks fresh!', 'good');
  done();
}
function checkDecor() {
  if (S.walls.length >= 3) unlock('decorator');
  if (cozy() >= 25) unlock('cozy');
}

function homeWelcome() {
  const missing = ESSENTIALS.filter(([f]) => !hasF(f));
  const inc = (HOME_INCLUDES[S.home] || []).length;
  queueModal(`<h2>${home().icon} Welcome to your new home!</h2>
    <p>${inc ? 'It comes with: ' + HOME_INCLUDES[S.home].map(f => ({ toilet: '🚽 toilet', shower: '🚿 shower', fridge: '🧊 fridge', stove: '🍳 stove', mattress: '🛏️ bed', table: '🪑 table', washer: '🧺 washer' }[f])).join(', ') + '.' : 'It\'s completely <b>empty</b>!'}</p>
    ${missing.length ? `<p>You still need to buy:</p><ul class="notes">${missing.map(([, i, n, why]) => `<li>${i} <b>${n}</b>: ${why}</li>`).join('')}</ul><p>Shop for them at the 🛍️ Mall.</p>` : '<p>You already have everything you need!</p>'}
    <p class="lesson">💡 When you move out, you have to buy lots of things your parents had: furniture, appliances, even toilet paper!</p>`);
}

// ---------- the home screen section ----------
function homeSection() {
  const missing = ESSENTIALS.filter(([f]) => !hasF(f));
  const slots = WALL_SLOTS[S.home];
  const pantry = Object.entries(PANTRY).filter(([k]) => S.pantry[k] > 0).map(([k, p]) => `${p.icon} ${S.pantry[k]}`).join(' · ');
  return `<div class="roomwrap"><canvas id="room" aria-label="The inside of your home"></canvas></div>
    <div class="row info">
      <span class="chip">⭐ Coziness: <b>${cozy()}</b></span>
      <span class="chip">${hasF('fridge') ? '🧊' : '⚠️'} Meals: <b>${S.groceries}</b>${pantry ? ' · ' + pantry : ''}</span>
      ${S.home !== 'parents' ? `<span class="chip ${S.supplies < 4 ? 'warn' : ''}">🧻 Supplies: <b>${S.supplies}</b> uses</span>` : ''}
    </div>
    ${missing.length ? `<div class="card needbuy"><b>🛍️ Your home is missing:</b> ${missing.map(([, i, n]) => `${i} ${n}`).join(', ')}. <span class="muted">Buy them at the Mall.</span></div>` : ''}
    <details class="card walls"><summary>🖼️ Your walls (${S.walls.length}/${slots} spots) · 🎨 paint colors</summary>
      <div class="mrows">
        ${S.walls.map((w, i) => mrow('🖼️', w.kind === 'mine' ? `Your painting (quality ${w.q})` : w.kind === 'famous' ? 'Famous painting' : 'Art print', 'On the wall', b('Take down', `takeDown(${i})`, 'ghost'))).join('')}
        ${S.inv.paintings.map((q, i) => mrow('🎨', `Your painting (quality ${q})`, 'In storage · hang it up or sell it at the Mall', b('Hang up', `hangPainting(${i})`, 'primary', S.walls.length >= slots))).join('')}
        ${(S.inv.prints || []).map((w, i) => mrow('🖼️', w.kind === 'famous' ? 'Famous painting' : 'Art print', 'In storage', b('Hang up', `hangPrint(${i})`, 'primary', S.walls.length >= slots))).join('')}
        ${!S.walls.length && !S.inv.paintings.length ? mrow('🎨', 'No paintings yet', 'Buy Art Supplies at the Mall and paint at home, or buy art prints.', '') : ''}
        ${mrow('🖌️', 'Paint your walls ($30 · 3 hrs)', 'Pick a color', `<div class="swatches">${WALL_COLORS.map(c => `<button class="sw ${S.wallColor === c ? 'sel' : ''}" style="background:${c}" onclick="paintWalls('${c}')" aria-label="Paint walls ${c}"></button>`).join('')}</div>`)}
      </div></details>`;
}

// ---------- drawing the room ----------
function artSeed(seed) { let s = Math.floor(seed * 1e9) || 1; return () => (s = (s * 16807) % 2147483647) / 2147483647; }
function drawArt(c, x, y, w, h, art) {
  const r = artSeed(art.seed);
  const frame = art.kind === 'famous' ? '#c9a227' : art.kind === 'print' ? '#222' : '#8a5a34';
  c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(x + 3, y + 4, w, h);
  c.fillStyle = frame; c.fillRect(x - 4, y - 4, w + 8, h + 8);
  if (art.kind === 'famous') { c.strokeStyle = '#f5dd7a'; c.lineWidth = 1.5; c.strokeRect(x - 2, y - 2, w + 4, h + 4); }
  c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
  const subject = Math.floor(r() * 3);
  const neat = Math.min(1, art.q / 70);
  const hue = Math.floor(r() * 360);
  if (subject === 0) { // landscape with sun
    const sky = c.createLinearGradient(0, y, 0, y + h); sky.addColorStop(0, `hsl(${(hue + 200) % 360},60%,${70 + 10 * neat}%)`); sky.addColorStop(1, `hsl(${(hue + 30) % 360},80%,80%)`);
    c.fillStyle = sky; c.fillRect(x, y, w, h);
    c.fillStyle = `hsl(${(hue + 40) % 360},90%,60%)`; c.beginPath(); c.arc(x + w * (0.25 + r() * 0.5), y + h * 0.4, h * 0.14, 0, Math.PI * 2); c.fill();
    for (let k = 0; k < 3; k++) {
      c.fillStyle = `hsl(${(hue + 100 + k * 15) % 360},${40 + k * 10}%,${45 - k * 8}%)`;
      c.beginPath(); c.moveTo(x, y + h);
      for (let i = 0; i <= 6; i++) c.lineTo(x + w * i / 6, y + h * (0.55 + k * 0.12) - r() * h * 0.18 * (1.3 - neat * 0.5));
      c.lineTo(x + w, y + h); c.fill();
    }
  } else if (subject === 1) { // flowers in a vase
    c.fillStyle = `hsl(${hue},35%,85%)`; c.fillRect(x, y, w, h);
    c.fillStyle = `hsl(${(hue + 180) % 360},45%,45%)`; c.beginPath(); c.ellipse(x + w / 2, y + h * 0.78, w * 0.14, h * 0.18, 0, 0, Math.PI * 2); c.fill();
    for (let i = 0; i < 6; i++) {
      const fx = x + w / 2 + (r() - 0.5) * w * 0.6, fy = y + h * (0.2 + r() * 0.35);
      c.strokeStyle = '#3e7d3a'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x + w / 2, y + h * 0.65); c.lineTo(fx, fy); c.stroke();
      c.fillStyle = `hsl(${(hue + r() * 120) % 360},80%,${55 + neat * 10}%)`;
      for (let p = 0; p < 5; p++) { c.beginPath(); c.arc(fx + Math.cos(p * 1.26) * 3.5, fy + Math.sin(p * 1.26) * 3.5, 3, 0, Math.PI * 2); c.fill(); }
      c.fillStyle = '#ffd23f'; c.beginPath(); c.arc(fx, fy, 2, 0, Math.PI * 2); c.fill();
    }
  } else { // abstract shapes
    c.fillStyle = `hsl(${hue},30%,${88 - neat * 10}%)`; c.fillRect(x, y, w, h);
    for (let i = 0; i < 7; i++) {
      c.fillStyle = `hsla(${(hue + i * (40 + neat * 30)) % 360},75%,55%,.75)`;
      if (r() < 0.5) { c.beginPath(); c.arc(x + r() * w, y + r() * h, 4 + r() * h * 0.25, 0, Math.PI * 2); c.fill(); }
      else c.fillRect(x + r() * w * 0.8, y + r() * h * 0.8, 6 + r() * w * 0.3, 4 + r() * h * 0.3);
    }
  }
  c.restore();
}

function drawRoom(cv) {
  const W = 1000, H = 360;
  const cssW = cv.parentElement.clientWidth;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  cv.style.height = (cssW * H / W) + 'px';
  cv.width = Math.round(cssW * dpr); cv.height = Math.round(cssW * dpr * H / W);
  const c = cv.getContext('2d');
  c.setTransform(cv.width / W, 0, 0, cv.width / W, 0, 0);
  const FLOOR = 260;
  const own = f => hasF(f);
  const ghost = (x, y, w, h, label) => {
    c.save(); c.setLineDash([6, 5]); c.strokeStyle = 'rgba(80,80,80,.55)'; c.lineWidth = 2; c.strokeRect(x, y, w, h); c.restore();
    txt(c, label, x + w / 2, y + h / 2, 'rgba(70,70,70,.8)', 13, 700);
  };
  // walls
  c.fillStyle = S.wallColor; c.fillRect(0, 0, 790, FLOOR);
  const wg = c.createLinearGradient(0, 0, 0, FLOOR); wg.addColorStop(0, 'rgba(255,255,255,.15)'); wg.addColorStop(1, 'rgba(0,0,0,.08)');
  c.fillStyle = wg; c.fillRect(0, 0, 790, FLOOR);
  if (S.home === 'mansion') { c.fillStyle = '#c9a227'; c.fillRect(0, 22, 790, 4); }
  // bathroom tiles
  c.fillStyle = '#e8f1f5'; c.fillRect(790, 0, 210, FLOOR);
  c.strokeStyle = 'rgba(120,150,170,.35)'; c.lineWidth = 1;
  for (let y = 0; y < FLOOR; y += 20) { c.beginPath(); c.moveTo(790, y); c.lineTo(1000, y); c.stroke(); }
  for (let x = 790; x < 1000; x += 20) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, FLOOR); c.stroke(); }
  c.fillStyle = '#9aa7b0'; c.fillRect(784, 0, 8, FLOOR);
  // floors
  c.fillStyle = '#b98b5a'; c.fillRect(0, FLOOR, 790, H - FLOOR);
  c.strokeStyle = 'rgba(80,50,20,.25)';
  for (let y = FLOOR + 14; y < H; y += 14) { c.beginPath(); c.moveTo(0, y); c.lineTo(790, y); c.stroke(); }
  for (let i = 0; i < 40; i++) { const y = FLOOR + Math.floor(i / 8) * 14; const x = (i % 8) * 100 + (Math.floor(i / 8) % 2) * 50; c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 14); c.stroke(); }
  c.fillStyle = '#d7e0e4'; c.fillRect(790, FLOOR, 210, H - FLOOR);
  c.strokeStyle = 'rgba(100,120,130,.3)';
  for (let x = 790; x < 1000; x += 25) { c.beginPath(); c.moveTo(x, FLOOR); c.lineTo(x, H); c.stroke(); }
  c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(0, FLOOR, 1000, 5);
  c.fillStyle = '#f4f1ea'; c.fillRect(0, FLOOR - 8, 784, 8);

  // window (shows the time of day)
  const night = S.hour < 6 || S.hour >= 20;
  const sky = c.createLinearGradient(0, 40, 0, 150);
  if (night) { sky.addColorStop(0, '#0d1b3e'); sky.addColorStop(1, '#2a3d6b'); }
  else if (S.weather === 'rainy') { sky.addColorStop(0, '#8a96a8'); sky.addColorStop(1, '#b8c2cf'); }
  else { sky.addColorStop(0, '#7cc4f5'); sky.addColorStop(1, '#cfeaff'); }
  c.fillStyle = '#fff'; c.fillRect(40, 36, 128, 118);
  c.fillStyle = sky; c.fillRect(46, 42, 116, 106);
  if (night) { c.fillStyle = '#fff'; for (let i = 0; i < 10; i++) c.fillRect(50 + (i * 37) % 108, 46 + (i * 23) % 60, 2, 2); c.beginPath(); c.arc(140, 64, 9, 0, Math.PI * 2); c.fill(); }
  else if (S.weather !== 'rainy') { c.fillStyle = '#ffd23f'; c.beginPath(); c.arc(70, 66, 11, 0, Math.PI * 2); c.fill(); }
  c.fillStyle = '#5ea34f'; c.fillRect(46, 128, 116, 20);
  c.fillStyle = '#fff'; c.fillRect(101, 42, 6, 106); c.fillRect(46, 92, 116, 6);
  if (has('curtains')) { c.fillStyle = '#b0413e'; c.fillRect(26, 30, 22, 132); c.fillRect(160, 30, 22, 132); c.fillStyle = '#7a2b29'; c.fillRect(22, 26, 164, 7); }

  // paintings on the walls
  const spots = [[218, 50, 70, 54], [330, 40, 86, 64], [440, 60, 60, 46], [520, 44, 70, 54], [620, 36, 60, 46], [700, 40, 64, 50], [236, 128, 50, 40], [452, 128, 54, 40]];
  S.walls.forEach((w, i) => { const sp = spots[i]; if (sp) drawArt(c, ...sp, w); });

  // ---------- bedroom ----------
  if (has('wardrobe')) { c.fillStyle = '#7a5230'; c.fillRect(190, 120, 70, 140); c.fillStyle = '#8e6440'; c.fillRect(194, 124, 30, 132); c.fillRect(228, 124, 28, 132); c.fillStyle = '#d4af37'; c.fillRect(220, 186, 3, 10); c.fillRect(229, 186, 3, 10); }
  if (has('lamp')) {
    c.fillStyle = '#555'; c.fillRect(176, 160, 4, 100); c.fillRect(166, 256, 24, 4);
    c.fillStyle = '#f3e3b0'; c.beginPath(); c.moveTo(162, 160); c.lineTo(194, 160); c.lineTo(186, 138); c.lineTo(170, 138); c.fill();
    if (night) { const g = c.createRadialGradient(178, 160, 4, 178, 170, 120); g.addColorStop(0, 'rgba(255,230,150,.45)'); g.addColorStop(1, 'rgba(255,230,150,0)'); c.fillStyle = g; c.fillRect(60, 60, 240, 220); }
  }
  if (has('bed')) {
    c.fillStyle = '#6b4226'; c.fillRect(20, 188, 14, 82); c.fillRect(20, 225, 150, 40);
    c.fillStyle = '#f5f5f5'; c.fillRect(34, 214, 136, 18);
    c.fillStyle = '#3f6fb5'; c.fillRect(70, 212, 100, 26); c.fillStyle = '#5585cc'; c.fillRect(70, 212, 100, 6);
    c.fillStyle = '#fff'; c.beginPath(); c.ellipse(52, 212, 16, 8, 0, 0, Math.PI * 2); c.fill();
  } else if (hasF('mattress')) {
    c.fillStyle = '#e9e4da'; c.fillRect(25, 238, 140, 22); c.fillStyle = '#8fa9c9'; c.fillRect(70, 234, 95, 14);
    c.fillStyle = '#fff'; c.beginPath(); c.ellipse(45, 236, 14, 7, 0, 0, Math.PI * 2); c.fill();
  } else ghost(25, 220, 140, 40, '🛏️ No bed');

  // ---------- living room ----------
  if (has('rug')) { c.fillStyle = '#a34b5a'; c.beginPath(); c.ellipse(420, 300, 130, 28, 0, 0, Math.PI * 2); c.fill(); c.strokeStyle = '#e8c07a'; c.lineWidth = 3; c.beginPath(); c.ellipse(420, 300, 115, 22, 0, 0, Math.PI * 2); c.stroke(); }
  if (has('bookshelf')) {
    c.fillStyle = '#6b4226'; c.fillRect(280, 110, 64, 150);
    for (let s = 0; s < 4; s++) { c.fillStyle = '#4e2f1a'; c.fillRect(284, 146 + s * 36, 56, 3); for (let k = 0; k < 7; k++) { c.fillStyle = ['#c0392b', '#2f80ed', '#27ae60', '#f39c12', '#8e44ad', '#16a085', '#e67e22'][(k + s) % 7]; c.fillRect(286 + k * 7.5, 120 + s * 36, 6, 25 - (k % 3) * 3 + 1); } }
  }
  if (has('couch')) {
    c.fillStyle = '#4b7f8c'; c.fillRect(352, 200, 140, 40); c.fillStyle = '#5c94a3'; c.fillRect(358, 216, 128, 28);
    c.fillStyle = '#3f6c77'; c.fillRect(346, 210, 16, 46); c.fillRect(482, 210, 16, 46); c.fillRect(356, 244, 132, 14);
    c.fillStyle = '#ffd166'; c.fillRect(368, 206, 26, 18);
  }
  if (has('aquarium')) {
    c.fillStyle = '#4e342e'; c.fillRect(505, 210, 70, 50); c.fillStyle = 'rgba(80,170,230,.8)'; c.fillRect(505, 166, 70, 44);
    c.fillStyle = '#f39c12'; c.beginPath(); c.ellipse(530, 184, 6, 3, 0, 0, Math.PI * 2); c.fill(); c.fillStyle = '#e74c3c'; c.beginPath(); c.ellipse(552, 194, 5, 3, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#2e7d32'; c.fillRect(512, 196, 3, 14); c.fillRect(566, 192, 3, 18);
  }
  if (has('tv')) {
    c.fillStyle = '#5d4037'; c.fillRect(380, 150, 90, 8);
    c.fillStyle = '#111'; c.fillRect(378, 96, 94, 54); c.fillStyle = night ? '#4a7fd1' : '#2c3e50'; c.fillRect(382, 100, 86, 46);
    if (has('console')) { c.fillStyle = '#222'; c.fillRect(440, 160, 26, 8); }
  }
  if (has('desk')) {
    c.fillStyle = '#8d6e63'; c.fillRect(588, 196, 84, 8); c.fillRect(592, 204, 6, 56); c.fillRect(662, 204, 6, 56);
    if (has('laptop')) { c.fillStyle = '#90a4ae'; c.fillRect(612, 190, 36, 6); c.fillStyle = '#263238'; c.fillRect(616, 166, 28, 24); c.fillStyle = '#4fc3f7'; c.fillRect(619, 169, 22, 18); }
  } else if (has('laptop')) { c.fillStyle = '#263238'; c.fillRect(610, 240, 28, 20); }
  if (has('plant')) { c.fillStyle = '#c0703c'; c.fillRect(560, 236, 22, 24); c.fillStyle = '#3e8e41'; c.beginPath(); c.arc(571, 224, 14, 0, Math.PI * 2); c.arc(562, 214, 9, 0, Math.PI * 2); c.arc(580, 212, 9, 0, Math.PI * 2); c.fill(); }
  if (has('fan')) { c.fillStyle = '#ddd'; c.fillRect(270, 230, 4, 30); c.beginPath(); c.arc(272, 222, 12, 0, Math.PI * 2); c.fill(); c.strokeStyle = '#999'; c.lineWidth = 1; c.beginPath(); c.arc(272, 222, 12, 0, Math.PI * 2); c.stroke(); }

  // ---------- kitchen ----------
  if (own('fridge')) {
    c.fillStyle = '#eceff1'; c.fillRect(690, 100, 56, 160); c.strokeStyle = '#b0bec5'; c.lineWidth = 2; c.strokeRect(690, 100, 56, 160);
    c.beginPath(); c.moveTo(690, 158); c.lineTo(746, 158); c.stroke(); c.fillStyle = '#90a4ae'; c.fillRect(738, 120, 3, 26); c.fillRect(738, 170, 3, 34);
    c.fillStyle = '#ff7043'; c.fillRect(700, 176, 10, 8); c.fillStyle = '#42a5f5'; c.fillRect(714, 190, 12, 9);
  } else ghost(690, 100, 56, 160, '🧊 ?');
  if (own('stove')) {
    c.fillStyle = '#cfd8dc'; c.fillRect(620, 196, 64, 64); c.fillStyle = '#37474f'; c.fillRect(620, 190, 64, 8); c.fillRect(628, 214, 48, 32);
    c.fillStyle = '#263238'; [[636, 192], [668, 192]].forEach(([x, y]) => { c.beginPath(); c.ellipse(x, y, 10, 3, 0, 0, Math.PI * 2); c.fill(); });
    if (has('microwave')) { c.fillStyle = '#b0bec5'; c.fillRect(626, 150, 52, 32); c.fillStyle = '#263238'; c.fillRect(630, 154, 32, 24); }
  } else {
    if (!has('desk')) ghost(620, 196, 64, 64, '🍳 ?');
    if (has('microwave')) { c.fillStyle = '#b0bec5'; c.fillRect(626, 226, 52, 32); c.fillStyle = '#263238'; c.fillRect(630, 230, 32, 24); }
  }
  if (own('table')) {
    c.fillStyle = '#a1887f'; c.fillRect(470, 266, 110, 8); c.fillRect(478, 274, 6, 44); c.fillRect(566, 274, 6, 44);
    c.fillStyle = '#8d6e63'; c.fillRect(450, 250, 6, 68); c.fillRect(450, 286, 22, 5); c.fillRect(594, 250, 6, 68); c.fillRect(578, 286, 22, 5);
    if (S.groceries > 0) { c.fillStyle = '#ff7043'; c.beginPath(); c.arc(520, 262, 6, 0, Math.PI * 2); c.fill(); c.fillStyle = '#fdd835'; c.beginPath(); c.arc(532, 262, 5, 0, Math.PI * 2); c.fill(); }
  }

  // ---------- bathroom ----------
  c.fillStyle = '#8d6e63'; c.fillRect(784, 120, 8, 140);
  if (has('bathtub')) {
    c.fillStyle = '#fff'; c.beginPath(); c.roundRect ? c.roundRect(890, 214, 104, 46, 10) : c.rect(890, 214, 104, 46); c.fill(); c.strokeStyle = '#cfd8dc'; c.lineWidth = 2; c.stroke();
    c.fillStyle = 'rgba(180,225,250,.9)'; c.fillRect(896, 216, 92, 10); c.fillStyle = '#fff'; [[910, 214], [930, 212], [950, 215]].forEach(([x, y]) => { c.beginPath(); c.arc(x, y, 6, 0, Math.PI * 2); c.fill(); });
  }
  if (hasF('shower') && (has('shower') || !has('bathtub'))) {
    c.fillStyle = 'rgba(200,230,245,.55)'; c.fillRect(912, 60, 82, 150); c.strokeStyle = '#90a4ae'; c.lineWidth = 2; c.strokeRect(912, 60, 82, 150);
    c.fillStyle = '#90a4ae'; c.fillRect(950, 60, 4, 20); c.beginPath(); c.ellipse(952, 82, 12, 4, 0, 0, Math.PI * 2); c.fill();
  } else if (!hasF('shower')) ghost(912, 100, 82, 150, '🚿 ?');
  if (own('toilet')) {
    c.fillStyle = '#fff'; c.fillRect(812, 186, 28, 40); c.strokeStyle = '#cfd8dc'; c.lineWidth = 1.5; c.strokeRect(812, 186, 28, 40);
    c.beginPath(); c.ellipse(842, 232, 26, 10, 0, 0, Math.PI * 2); c.fillStyle = '#fff'; c.fill(); c.stroke();
    c.fillRect(830, 236, 22, 24); c.strokeRect(830, 236, 22, 24);
    c.fillStyle = '#b0bec5'; c.fillRect(818, 192, 10, 3);
    if (S.supplies > 0 || S.home === 'parents') { c.fillStyle = '#fff'; c.beginPath(); c.arc(872, 200, 8, 0, Math.PI * 2); c.fill(); c.strokeStyle = '#ccc'; c.stroke(); c.fillStyle = '#bbb'; c.beginPath(); c.arc(872, 200, 3, 0, Math.PI * 2); c.fill(); }
  } else ghost(806, 190, 66, 70, '🚽 ?');
  if (own('washer')) {
    c.fillStyle = '#f5f5f5'; c.fillRect(800, 120, 56, 56); c.strokeStyle = '#bbb'; c.lineWidth = 1.5; c.strokeRect(800, 120, 56, 56);
    c.fillStyle = '#90caf9'; c.beginPath(); c.arc(828, 152, 16, 0, Math.PI * 2); c.fill(); c.strokeStyle = '#78909c'; c.stroke();
  }
  // sink & mirror
  c.fillStyle = '#b3e5fc'; c.fillRect(812, 30, 44, 56); c.strokeStyle = '#90a4ae'; c.lineWidth = 3; c.strokeRect(812, 30, 44, 56);

  // you!
  if (atHome()) drawPerson(c, 300, 330, 2.3, S.look);

  // night darkness (lamp glow drawn above)
  if (night) { c.fillStyle = has('lamp') ? 'rgba(20,30,60,.18)' : 'rgba(20,30,60,.35)'; c.fillRect(0, 0, W, H); }
}
