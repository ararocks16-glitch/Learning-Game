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
  if (atHome() && !S.doorOpen) S.doorOpen = true;   // hurry inside!
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
  const fresh = Object.keys(FOODS).filter(k => FOODS[k].snack && countFood(k) > 0);
  if (!items.length && !fresh.length) return nope('No snacks at home. Buy some at the 🛒 Supermarket.');
  showModal(`<h2>🍿 What do you want to eat?</h2><div class="grid actions">${items.map(([k, p]) => `<button class="action" onclick="eatSnack('${k}')"><span class="ic">${p.icon}</span><b>${p.name}</b><small>You have ${S.pantry[k]}${p.hot ? ' · needs a stove or microwave' : ''}</small></button>`).join('')}${fresh.map(k => `<button class="action" onclick="eatFresh('${k}')"><span class="ic">${FOODS[k].icon}</span><b>${FOODS[k].name}</b><small>You have ${countFood(k)}</small></button>`).join('')}</div>`,
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
  const fg = c.createLinearGradient(x - 5, y - 5, x + w + 5, y + h + 5);
  fg.addColorStop(0, tone(frame, 0.3)); fg.addColorStop(0.5, frame); fg.addColorStop(1, tone(frame, -0.35));
  c.fillStyle = fg; c.fillRect(x - 6, y - 6, w + 12, h + 12);
  c.strokeStyle = tone(frame, -0.4, 0.8); c.lineWidth = 1; c.strokeRect(x - 1.5, y - 1.5, w + 3, h + 3);
  if (art.kind === 'famous') { c.strokeStyle = '#f5dd7a'; c.lineWidth = 1.2; c.strokeRect(x - 4, y - 4, w + 8, h + 8); }
  if (art.kind === 'print') { c.fillStyle = '#f5f3ee'; c.fillRect(x - 1, y - 1, w + 2, h + 2); x += 4; y += 4; w -= 8; h -= 8; }
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
