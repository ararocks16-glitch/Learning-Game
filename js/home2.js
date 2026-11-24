// ===================== HOME LIFE 2: repairs, a real garden, decorating, roommates, moving day, wild animals, safety =====================

function ensureHome2State() {
  if (S.broken === undefined) S.broken = null;            // { kind, day, landlordDay }
  if (!S.decor) S.decor = { floor: 'wood', rug: null, curtains: null };
  if (S.roommates === undefined) S.roommates = [];
  if (S.moving === undefined) S.moving = null;
  if (!S.safety) S.safety = { drill: false, helmetTalk: false, seatbelt: false, crossing: 0 };
  (S.garden || []).forEach(p => { if (!p.kind) { p.kind = Object.keys(CROPS).find(k => CROPS[k].icon === p.crop) || 'carrot'; } });
}

// ---------- 2. things break at home ----------
const BREAKS = {
  sink:    { name: 'Leaky Kitchen Sink', icon: '🚰', pro: 'plumber', cost: 120, skill: 25, effect: 'Drip, drip, drip! Your water bill goes up and the floor gets wet.' },
  toilet:  { name: 'Clogged Toilet', icon: '🚽', pro: 'plumber', cost: 110, skill: 10, effect: 'You can\'t use the toilet at home until it\'s fixed!' },
  fridge:  { name: 'Broken Fridge', icon: '🧊', pro: 'appliance repair person', cost: 180, skill: 45, effect: 'Your fridge is warm — cold food spoils every day!' },
  washer:  { name: 'Broken Washing Machine', icon: '🧺', pro: 'appliance repair person', cost: 150, skill: 40, effect: 'You have to use the laundromat until it\'s fixed.' },
  heater:  { name: 'Broken Heater', icon: '🔥', pro: 'heating repair person', cost: 200, skill: 50, effect: 'Brr! Your home is freezing. You lose energy and fun.' },
  light:   { name: 'Flickering Light', icon: '💡', pro: 'electrician', cost: 90, skill: 20, effect: 'It\'s annoying and makes reading hard.' },
};
function homeCanBreak() { return S.home !== 'parents'; }
function breakSomething() {
  if (!homeCanBreak() || S.broken) return;
  const opts = Object.keys(BREAKS).filter(k => (k !== 'fridge' || hasF('fridge')) && (k !== 'washer' || hasF('washer')) && (k !== 'heater' || seasonOf() === 'winter'));
  const k = pickR(opts);
  S.broken = { kind: k, day: S.day };
  log(`🛠️ Uh oh! Something broke at home: ${BREAKS[k].icon} ${BREAKS[k].name}. Check Home to fix it.`, 'bad');
}
// broken things stop working
const _hasF_orig = hasF;
hasF = function (f) {
  if (S && S.broken && S.broken.kind === f && (f === 'fridge' || f === 'washer')) return false;
  return _hasF_orig(f);
};
function needsToolbox() { return has('toolbox'); }
function fixItMyself() {
  const b = S.broken; if (!b) return;
  const br = BREAKS[b.kind];
  if (!has('toolbox')) return nope('You need a 🧰 toolbox to fix things yourself. Buy one at the Mall.');
  if (S.needs.energy < 15) return nope('You\'re too tired to fix things right now.');
  pass(1.5);
  const chance = 0.35 + (S.skills.build - br.skill) / 60;
  if (Math.random() < chance) {
    addSkill('build', 2.5);
    log(`🔧 You fixed the ${br.name.toLowerCase()} yourself! You saved ${money(br.cost)}. Building skill up!`, 'good');
    S.broken = null;
  } else {
    addSkill('build', 1);
    log(`😓 You tried to fix the ${br.name.toLowerCase()}, but it's still broken. Watch a video and try again, or call a ${br.pro}.`, 'bad');
  }
  done();
}
function callRepair() {
  const b = S.broken; if (!b) return;
  const br = BREAKS[b.kind];
  if (HOMES[S.home].type === 'rent') {
    if (b.landlordDay) return nope('You already called the landlord. They\'ll come soon!');
    if (!has('phone')) return nope('You need a phone to call the landlord.');
    b.landlordDay = S.day + 1 + Math.floor(Math.random() * 2);
    log(`📞 You called your landlord. "We'll send someone to fix it in a day or two!" Renters don't pay for most repairs.`);
    return done();
  }
  if (S.hour < 8 || S.hour > 18) return nope(`The ${br.pro} only works 8 AM – 6 PM.`);
  if (!spend(br.cost, `${br.pro}: ${br.name}`)) return;
  pass(1.5);
  log(`👷 The ${br.pro} fixed your ${br.name.toLowerCase()}. Bill: ${money(br.cost)}. (Owning a home means paying for repairs!)`);
  S.broken = null; done();
}
function brokenCard() {
  const b = S.broken; if (!b || S.loc !== 'home') return '';
  const br = BREAKS[b.kind], renter = HOMES[S.home].type === 'rent';
  return `<div class="card warnbox"><h3>${br.icon} Broken: ${br.name}</h3><p>${br.effect}</p>
    <div class="row"><button class="btn sm primary" onclick="fixItMyself()">🔧 Fix it myself${has('toolbox') ? '' : ' (needs a toolbox)'}</button>
    <button class="btn sm ghost" onclick="callRepair()">${renter ? (b.landlordDay ? `📞 Landlord coming ${b.landlordDay <= S.day ? 'today' : 'tomorrow'}` : '📞 Call the landlord (free)') : `📞 Call a ${br.pro} (${money(br.cost)})`}</button></div>
    <p class="lesson">💡 ${renter ? 'When you rent, the landlord pays for most repairs. When you own a home, you pay!' : 'Homeowners save money for repairs. Learning to fix things yourself saves even more!'}</p></div>`;
}
function brokenNewDay() {
  const b = S.broken;
  if (!b) { if (Math.random() < 0.035) breakSomething(); return; }
  if (b.landlordDay && S.day >= b.landlordDay) { log(`👷 The landlord's repair person fixed your ${BREAKS[b.kind].name.toLowerCase()}.`, 'good'); S.broken = null; return; }
  if (b.kind === 'fridge') { const lost = S.fridgeFood.filter(f => FOODS[f.id].cold).length; if (lost) { S.fridgeFood = S.fridgeFood.filter(f => !FOODS[f.id].cold); log(`🧊 Your broken fridge was warm. ${lost} cold food items spoiled.`, 'bad'); } }
  if (b.kind === 'sink') { S.mess = clamp(S.mess + 6); S.kwh += 1; }
  if (b.kind === 'heater' && seasonOf() === 'winter') { S.needs.fun = clamp(S.needs.fun - 8); S.needs.energy = clamp(S.needs.energy - 6); }
}

// ---------- 3. a real garden ----------
const CROPS = {
  lettuce:    { icon: '🥬', name: 'Lettuce', days: 6, n: [3, 5], seasons: ['spring', 'summer', 'fall'] },
  carrot:     { icon: '🥕', name: 'Carrots', days: 8, n: [5, 8], seasons: ['spring', 'summer', 'fall'] },
  tomato:     { icon: '🍅', name: 'Tomatoes', days: 10, n: [6, 10], seasons: ['spring', 'summer'] },
  cucumber:   { icon: '🥒', name: 'Cucumbers', days: 9, n: [4, 7], seasons: ['spring', 'summer'] },
  corn:       { icon: '🌽', name: 'Corn', days: 12, n: [4, 6], seasons: ['summer'] },
  strawberry: { icon: '🍓', name: 'Strawberries', days: 14, n: [10, 16], seasons: ['spring', 'summer'] },
  pumpkin:    { icon: '🎃', name: 'Pumpkins', days: 18, n: [1, 3], seasons: ['summer', 'fall'] },
  sunflower:  { icon: '🌻', name: 'Sunflowers', days: 10, n: [2, 4], seasons: ['spring', 'summer'], flower: true },
};
function plant(kind) {
  ensureHome2State();
  const size = gardenSize();
  if (!size) return nope('You need a home with a yard to grow a garden.');
  S.garden = S.garden.filter(p => !p.dead);
  if (S.garden.length >= size) return nope('Your garden is full! Wait for your plants to grow.');
  if (S.inv.seeds < 1) return nope('You need seeds. Buy them at the 🛒 Supermarket.');
  const se = seasonOf();
  if (!kind) {
    if (se === 'winter') return nope('❄️ The ground is frozen! You can\'t plant in winter. Wait for spring.');
    return showModal(`<h2>🌱 What do you want to plant?</h2><p class="muted">It's ${SEASONS[se].name.toLowerCase()}. Some plants only grow in certain seasons!</p>
      <div class="grid actions">${Object.entries(CROPS).map(([k, c]) => { const ok = c.seasons.includes(se); return `<button class="action ${ok ? '' : 'locked'}" ${ok ? '' : 'disabled'} onclick="closeModal();plant('${k}')"><span class="ic">${c.icon}</span><b>${c.name}</b><small>${ok ? `Ready in ${c.days} days` : `Plant in ${c.seasons.join(' or ')}`}</small></button>`; }).join('')}</div>`,
      [{ label: 'Cancel', cls: 'ghost' }]);
  }
  const c = CROPS[kind];
  S.inv.seeds--; pass(0.5, 'awake');
  S.garden.push({ crop: c.icon, kind, planted: S.day, lastWatered: S.day, dead: false });
  log(`🌱 You planted ${c.name.toLowerCase()} seeds. Water them every day or two. Ready in about ${c.days} days!`);
  done();
}
function cropStage(p) {
  const c = CROPS[p.kind] || CROPS.carrot, g = (S.day - p.planted) / c.days;
  if (p.dead) return ['🥀', 'dried up'];
  if (g >= 1) return [c.icon, 'ready to pick!'];
  if (g >= 0.6) return ['🌿', `${c.days - (S.day - p.planted)} days left`];
  if (g >= 0.25) return ['🌱', `${c.days - (S.day - p.planted)} days left`];
  return ['🟫', 'just a seed'];
}
function harvest() {
  const ready = S.garden.filter(p => !p.dead && S.day - p.planted >= (CROPS[p.kind] || CROPS.carrot).days);
  const dead = S.garden.filter(p => p.dead);
  if (!ready.length && !dead.length) return nope('Nothing is ready yet. Keep watering!');
  pass(0.5, 'awake');
  const got = [];
  ready.forEach(p => {
    const c = CROPS[p.kind] || CROPS.carrot, n = c.n[0] + Math.floor(Math.random() * (c.n[1] - c.n[0] + 1));
    got.push(`${n} ${c.icon}`);
    if (c.flower) { fun2(8); S.vasesDay = S.day; }
    else { S.inv.veggies += n; S.fridgeFood.push({ id: 'veggies', exp: S.day + 7 }); }
  });
  S.garden = S.garden.filter(p => !ready.includes(p) && !p.dead);
  log(`🧺 You picked ${got.join(', ')} from your garden!${dead.length ? ` You cleared ${dead.length} dried-up plant${dead.length > 1 ? 's' : ''}.` : ''} Homegrown food tastes the best!`, 'good');
  if (ready.length) unlock('gardener');
  done();
}
function gardenCard() {
  const size = gardenSize(); if (!size || S.loc !== 'home') return '';
  ensureHome2State();
  const plots = [];
  for (let i = 0; i < size; i++) { const p = S.garden[i]; if (p) { const [ic, txt] = cropStage(p); plots.push(`<div class="plot"><span>${ic}</span><small>${(CROPS[p.kind] || CROPS.carrot).name}<br>${txt}</small></div>`); } else plots.push('<div class="plot empty"><span>⬜</span><small>empty</small></div>'); }
  const thirsty = S.garden.some(p => !p.dead && S.day - p.lastWatered >= 1);
  return `<div class="card"><h3>🌻 Your Garden <span class="muted small">· ${S.inv.seeds} seed packs${has('fence') ? ' · 🪵 fenced' : ''}</span></h3><div class="plots">${plots.join('')}</div>
    <div class="row"><button class="btn sm primary" onclick="plant()">🌱 Plant seeds</button><button class="btn sm ${thirsty ? 'primary' : 'ghost'}" onclick="water()">💧 Water${thirsty ? ' (thirsty!)' : ''}</button><button class="btn sm ghost" onclick="harvest()">🧺 Pick</button></div>
    ${has('fence') ? '' : '<p class="muted small">🦌 Deer sometimes nibble gardens. A fence (Mall) keeps them out.</p>'}</div>`;
}

// ---------- 4. decorate your room ----------
const FLOORS = { wood: ['🪵', 'Wood floor', 0], carpet: ['🟫', 'Soft carpet', 300], tile: ['⬜', 'Shiny tile', 250] };
const CARPET_COL = '#8d9db6';
const RUGS = { red: ['#b23a48', 'Red rug'], blue: ['#3d6ea8', 'Blue rug'], green: ['#4a8b5c', 'Green rug'], rainbow: ['rainbow', 'Rainbow rug'], round: ['#d9a35f', 'Round woven rug'] };
const CURTAINS = { white: '#f5f2ea', blue: '#5b8bd0', pink: '#ef9ab5', yellow: '#f2cf5b', green: '#6fae7c', purple: '#9a7bc8' };
function decorateCard() {
  if (S.home === 'parents' && false) return '';
  const d = S.decor;
  return `<details class="card"><summary>🛋️ Decorate your room (floor, rug, curtains)</summary>
    <div class="mrows">
    ${mrow('🪵', 'Floor', `Now: ${FLOORS[d.floor][1]}${HOMES[S.home].type === 'rent' ? ' · 🏢 renters can\'t change floors!' : ''}`, Object.entries(FLOORS).map(([k, f]) => b(`${f[0]} ${f[1]}${f[2] ? ` ${money(f[2])}` : ''}`, `setFloor('${k}')`, d.floor === k ? 'primary' : 'ghost', d.floor === k || HOMES[S.home].type === 'rent')).join(''))}
    ${mrow('🟥', 'Rug ($40)', d.rug ? `Now: ${RUGS[d.rug][1]}` : 'No rug', Object.entries(RUGS).map(([k, r]) => `<button class="sw ${d.rug === k ? 'sel' : ''}" style="background:${r[0] === 'rainbow' ? 'linear-gradient(90deg,#e53935,#fdd835,#43a047,#1e88e5,#8e24aa)' : r[0]}" onclick="setRug('${k}')" aria-label="${r[1]}"></button>`).join('') + (d.rug ? b('Remove', `setRug(null)`, 'ghost') : ''))}
    ${mrow('🪟', 'Curtains ($25)', d.curtains ? 'Pick a new color' : 'No curtains', Object.entries(CURTAINS).map(([k, col]) => `<button class="sw ${d.curtains === k ? 'sel' : ''}" style="background:${col}" onclick="setCurtains('${k}')" aria-label="${k} curtains"></button>`).join(''))}
    </div><p class="lesson">💡 Renters can add rugs and curtains, but they need the landlord's OK to change floors or walls.</p></details>`;
}
function setFloor(k) {
  if (HOMES[S.home].type === 'rent') return nope('You rent this place. The landlord says no new floors!');
  const f = FLOORS[k]; if (f[2] && !spend(f[2], `New floor: ${f[1]}`)) return;
  pass(4); S.decor.floor = k; log(`🔨 You put in a new ${f[1].toLowerCase()}. Looks amazing!`, 'good'); done();
}
function setRug(k) { if (k && !spend(40, 'Rug')) return; S.decor.rug = k; pass(0.25); if (k) log(`🟥 You put down a ${RUGS[k][1].toLowerCase()}. Cozy!`); done(); }
function setCurtains(k) { if (!spend(25, 'Curtains')) return; S.decor.curtains = k; pass(0.5); log(`🪟 You hung up ${k} curtains.`); done(); }
// drawing: floor, rug and curtains in your room
function drawDecorFloor(c, RW_, RH_, FY, BX) {
  if (!S.decor || S.decor.floor === 'wood') return false;
  if (S.decor.floor === 'carpet') {
    const g = c.createLinearGradient(0, FY, 0, RH_); g.addColorStop(0, tone(CARPET_COL, -0.15)); g.addColorStop(1, CARPET_COL);
    c.fillStyle = g; c.fillRect(0, FY, BX, RH_ - FY);
    c.fillStyle = 'rgba(255,255,255,.05)'; for (let i = 0; i < 900; i++) { const x = (i * 97.3) % BX, y = FY + (i * 53.7) % (RH_ - FY); c.fillRect(x, y, 1.5, 1.5); }
  } else {
    c.fillStyle = '#e9e6df'; c.fillRect(0, FY, BX, RH_ - FY);
    for (let y = FY, k = 0; y < RH_; k++) { const h = 12 + k * 5; for (let x = (k % 2) * 30; x < BX; x += 60) { c.fillStyle = (k + x / 60) % 2 ? '#f4f2ed' : '#dedad1'; c.fillRect(x, y, 59, h - 1); } y += h; }
  }
  return true;
}
function drawRug(c) {
  const r = S.decor && S.decor.rug; if (!r) return;
  const cx = 330, cy = 335;
  c.save();
  if (r === 'round') { c.fillStyle = '#d9a35f'; c.beginPath(); c.ellipse(cx, cy, 120, 26, 0, 0, Math.PI * 2); c.fill(); c.strokeStyle = 'rgba(120,70,20,.4)'; c.lineWidth = 2; for (let k = 1; k < 4; k++) { c.beginPath(); c.ellipse(cx, cy, 120 - k * 25, 26 - k * 5.5, 0, 0, Math.PI * 2); c.stroke(); } }
  else {
    c.beginPath(); c.moveTo(cx - 110, cy - 22); c.lineTo(cx + 110, cy - 22); c.lineTo(cx + 140, cy + 26); c.lineTo(cx - 140, cy + 26); c.closePath(); c.clip();
    if (r === 'rainbow') ['#e53935', '#fb8c00', '#fdd835', '#43a047', '#1e88e5', '#8e24aa'].forEach((col, k) => { c.fillStyle = col; c.fillRect(cx - 140, cy - 22 + k * 8, 280, 8); });
    else { c.fillStyle = RUGS[r][0]; c.fillRect(cx - 140, cy - 22, 280, 48); c.strokeStyle = 'rgba(255,255,255,.45)'; c.lineWidth = 2; c.strokeRect(cx - 120, cy - 15, 240, 34); c.fillStyle = 'rgba(255,255,255,.3)'; for (let k = 0; k < 6; k++) { c.beginPath(); c.arc(cx - 75 + k * 30, cy + 2, 4, 0, Math.PI * 2); c.fill(); } }
  }
  c.restore();
}
function drawCurtains(c) {
  const k = S.decor && S.decor.curtains; if (!k) return;
  const col = CURTAINS[k], WX = 40, WY = 36, WW = 132, WH = 124;
  c.fillStyle = '#8d6e63'; c.fillRect(WX - 20, WY - 14, WW + 40, 5);
  [[WX - 18, 1], [WX + WW + 18, -1]].forEach(([x, d]) => {
    const g = c.createLinearGradient(x, 0, x + d * 30, 0); g.addColorStop(0, tone(col, -0.12)); g.addColorStop(0.5, col); g.addColorStop(1, tone(col, -0.2));
    c.fillStyle = g; c.beginPath(); c.moveTo(x, WY - 10); c.lineTo(x + d * 32, WY - 10); c.quadraticCurveTo(x + d * 18, WY + WH * 0.5, x + d * 26, WY + WH + 12); c.lineTo(x, WY + WH + 12); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(0,0,0,.12)'; c.lineWidth = 1; for (let s = 1; s < 4; s++) { c.beginPath(); c.moveTo(x + d * s * 7, WY - 10); c.lineTo(x + d * s * 6, WY + WH + 12); c.stroke(); }
  });
}

// ---------- 5. roommates ----------
const ROOMMATE_TYPES = {
  tidy:     { label: 'super tidy 🧽', good: 'They cleaned the kitchen without being asked!', bad: 'They left you a note: "Please wash your dishes 🙂"' },
  messy:    { label: 'kind of messy 🧦', good: 'They made everyone nachos!', bad: 'They left their socks and dirty dishes everywhere.' },
  chef:     { label: 'loves to cook 👩‍🍳', good: 'They cooked dinner for you! Yum!', bad: 'They ate the leftovers you were saving.' },
  musician: { label: 'plays the drums 🥁', good: 'They taught you a cool song!', bad: 'They practiced drums late at night. You couldn\'t sleep!' },
  nightowl: { label: 'a night owl 🦉', good: 'They fed your pet while you were busy.', bad: 'They watched TV loudly at 2 AM.' },
};
function roommateRoom() { return ['onebed', 'small', 'family', 'mansion', 'custom'].includes(S.home); }
function findRoommate() {
  if (!roommateRoom()) return nope(S.home === 'shared' ? 'You already live with roommates!' : 'You need a home with an extra bedroom (a 1-bedroom apartment or a house).');
  if (S.roommates.length >= 1) return nope('You already have a roommate.');
  const cands = [0, 1, 2].map(() => ({ name: pickR(FIRST_NAMES) + ' ' + pickR(LAST_NAMES), look: randomLook(), type: pickR(Object.keys(ROOMMATE_TYPES)), job: pickR(['a barista', 'a nurse', 'a college student', 'a mechanic', 'a teacher', 'a cook', 'an artist']), rel: 50 }));
  S.roommateCands = cands;
  showModal(`<h2>🏠 Find a Roommate</h2><p>You put up an ad: "Room for rent — share the costs!" Three people want to move in:</p>
    <div class="mrows">${cands.map((r, i) => mrow(`<img class="avatar" style="width:40px;height:40px" src="${avatarURL(r.look, 40)}" alt="">`, r.name, `Works as ${r.job} · ${ROOMMATE_TYPES[r.type].label}`, b('Pick', `closeModal();pickRoommate(${i})`))).join('')}</div>
    <p class="lesson">💡 A roommate pays half the rent (or helps with the mortgage), but you share your space. Pick wisely!</p>`, [{ label: 'Cancel', cls: 'ghost' }]);
}
function pickRoommate(i) { const r = S.roommateCands[i]; S.roommates = [r]; S.roommateCands = null; pass(1); log(`🤝 ${r.name} moved in as your roommate! They're ${ROOMMATE_TYPES[r.type].label}.`, 'good'); done(); }
function roommateLeave() { const r = S.roommates[0]; if (!r) return; confirmModal(`Ask ${r.name} to move out?`, () => { S.roommates = []; log(`📦 ${r.name} moved out. You have the place to yourself again.`); done(); }); }
function roommateShare() {
  if (S.home === 'shared') return 0;
  if (!S.roommates.length) return 0;
  const h = HOMES[S.home];
  return Math.round(h.type === 'rent' ? h.rent / 2 : (S.mortgage ? S.mortgage.weekly / 3 : h.upkeep / 2) + 40);
}
function roommateNewDay() {
  if (S.home === 'shared' && !S.roommates.length) S.roommates = [{ name: pickR(FIRST_NAMES) + ' ' + pickR(LAST_NAMES), look: randomLook(), type: pickR(Object.keys(ROOMMATE_TYPES)), job: 'a college student', rel: 50, auto: true }];
  if (S.home !== 'shared' && !roommateRoom()) { if (S.roommates.length) S.roommates = []; return; }
  const r = S.roommates[0]; if (!r || Math.random() > 0.3) return;
  const T = ROOMMATE_TYPES[r.type], good = Math.random() < (r.type === 'tidy' ? 0.7 : 0.5);
  if (good) { r.rel = clamp(r.rel + 3); fun2(4); if (r.type === 'tidy') { S.dishes = 0; S.mess = clamp(S.mess - 20); } if (r.type === 'chef') S.needs.food = clamp(S.needs.food + 20); }
  else { r.rel = clamp(r.rel - 2); if (r.type === 'messy') { S.mess = clamp(S.mess + 15); S.dishes += 3; } if (r.type === 'chef' && S.fridgeFood.length) S.fridgeFood.pop(); if (r.type === 'musician' || r.type === 'nightowl') S.needs.energy = clamp(S.needs.energy - 12); }
  log(`🏠 Roommate ${r.name.split(' ')[0]}: ${good ? T.good : T.bad}`, good ? 'good' : '');
}
function roommateCard() {
  if (S.loc !== 'home') return '';
  const r = S.roommates[0];
  if (!r) return roommateRoom() ? `<div class="card"><h3>🏠 Roommate</h3><p class="muted">Have an extra room? A roommate can pay part of your housing costs.</p><button class="btn sm primary" onclick="findRoommate()">📝 Find a roommate</button></div>` : '';
  return `<div class="card"><h3>🏠 Your Roommate</h3><div class="mrows">${mrow(`<img class="avatar" style="width:40px;height:40px" src="${avatarURL(r.look, 40)}" alt="">`, r.name, `Works as ${r.job} · ${ROOMMATE_TYPES[r.type].label} · ❤️ ${Math.round(r.rel)}${roommateShare() ? ` · pays you ${money(roommateShare())}/week` : ''}`, r.auto ? '' : b('Move out', 'roommateLeave()', 'ghost'))}</div></div>`;
}

// ---------- 6. moving day ----------
function startMovingDay() {
  const stuff = ITEMS.filter(i => has(i.id) && !i.consumable).length + (S.furniture ? Object.keys(S.furniture).length : 0);
  S.moving = { boxes: 6 + stuff * 2, day: S.day };
  queueModal(`<h2>📦 Moving Day!</h2><p>You have about <b>${S.moving.boxes} boxes</b> of stuff to move to your new home. How will you move it?</p><p class="muted">Tap the 📦 Moving chip at the top to choose.</p>`);
}
function movingModal() {
  const m = S.moving; if (!m) return;
  const friends = (S.friends || []).filter(f => f.f > 30);
  showModal(`<h2>📦 Moving Day</h2><p>${m.boxes} boxes to move. How do you want to do it?</p>
    <div class="grid actions">
      <button class="action" onclick="closeModal();doMove('self')"><span class="ic">💪</span><b>Carry it all myself</b><small>Free · ${Math.ceil(m.boxes / 6)} hrs · super tiring</small></button>
      <button class="action" onclick="closeModal();doMove('truck')"><span class="ic">🚚</span><b>Rent a moving truck</b><small>$80 · 3 hrs</small></button>
      <button class="action ${friends.length ? '' : 'locked'}" ${friends.length ? '' : 'disabled'} onclick="closeModal();doMove('friends')"><span class="ic">🍕</span><b>Ask friends to help</b><small>${friends.length ? 'Buy them pizza ($30) · 2 hrs · fun!' : 'Make some friends first'}</small></button>
      <button class="action" onclick="closeModal();doMove('movers')"><span class="ic">👷</span><b>Hire movers</b><small>$350 · 1 hr · they do everything</small></button>
    </div>`, [{ label: 'Later', cls: 'ghost' }]);
}
function doMove(how) {
  const m = S.moving; if (!m) return;
  const cost = { self: 0, truck: 80, friends: 30, movers: 350 }[how];
  if (cost && !spend(cost, { truck: 'Moving truck rental', friends: 'Pizza for moving helpers', movers: 'Moving company' }[how])) return;
  const hrs = { self: Math.ceil(m.boxes / 6), truck: 3, friends: 2, movers: 1 }[how];
  pass(hrs, 'awake');
  if (how === 'self') { S.needs.energy = clamp(S.needs.energy - 30); log('💪 You carried every box yourself. Your arms are SO tired!'); if (Math.random() < 0.15 && has('tv')) log('📺 Oops — you bumped the TV on the door frame. Just a scratch!'); }
  if (how === 'truck') log('🚚 You drove a big moving truck and moved everything in 3 trips!');
  if (how === 'friends') { (S.friends || []).filter(f => f.f > 30).forEach(f => f.f = clamp(f.f + 10)); fun2(15); log('🍕 Your friends helped carry the couch up the stairs. Then you all ate pizza on the floor!', 'good'); }
  if (how === 'movers') log('👷 The movers wrapped everything in blankets and carried it all in. Easy!');
  S.moving = null; S.mess = 60;
  log('📦 All your boxes are in your new home. Time to unpack! (Vacuum & tidy to clean up.)');
  done();
}

// ---------- 29. wild animals ----------
function wildNewDay() {
  if (S.home === 'parents' && Math.random() < 0.5) return;
  if (S.trash > 80 && !has('trashlid') && S.day - (S.raccoonDay || -9) > 5 && Math.random() < 0.2) { S.raccoonDay = S.day; S.mess = clamp(S.mess + 10); log('🦝 Raccoons knocked over your trash can last night and spread garbage all over! (A locking trash lid from the Mall stops them.)', 'bad'); }
  else if (S.garden.some(p => !p.dead) && !has('fence') && seasonOf() !== 'winter' && Math.random() < 0.1) { const p = S.garden.filter(x => !x.dead); const v = p[Math.floor(Math.random() * p.length)]; v.dead = true; log(`🦌 A deer snuck into your yard and ate one of your plants! (A garden fence keeps deer out.)`, 'bad'); }
  else if (Math.random() < 0.05) log(pickR(['🐿️ A squirrel ran across your roof this morning.', '🦉 You heard an owl hooting last night.', '🐦 Birds were singing outside your window at sunrise.', '🦔 You saw a hedgehog in the yard!', '🐇 A bunny was eating clover on your lawn.']));
  if (S.hour >= 21 && placeId(S.loc) === 'campground' && Math.random() < 0.15) { S.needs.hygiene = clamp(S.needs.hygiene - 30); log('🦨 A skunk sprayed near your tent! Phew, you smell! Take a shower.', 'bad'); }
}

// ---------- 30. safety ----------
const DRILL_QS = [
  ['The smoke alarm goes off! What do you do first?', ['Get out of the house fast', 'Grab your toys', 'Hide under the bed'], 0],
  ['There is smoke in the hallway. How do you move?', ['Crawl low under the smoke', 'Run standing up tall', 'Open all the windows'], 0],
  ['Before you open a door during a fire, you should...', ['Feel it with the back of your hand — if it\'s hot, use another way out', 'Open it quickly', 'Knock on it'], 0],
  ['If your clothes catch on fire, you...', ['Stop, drop and roll', 'Run around', 'Jump in place'], 0],
  ['Once you get outside, you...', ['Go to your family meeting spot and stay out', 'Go back in for your pet', 'Hide in the garage'], 0],
];
function fireDrill() {
  pass(0.5);
  showModal(`<h2>🚒 Practice a Fire Drill</h2><p>Firefighters say every family should practice. Answer the questions!</p>
    ${DRILL_QS.map((q, i) => { const opts = q[1].map((o, k) => [o, k]).sort(() => Math.random() - 0.5); return `<div class="quiz"><b>${i + 1}. ${q[0]}</b>${opts.map(([o, k]) => `<label><input type="radio" name="fd${i}" value="${k}"> ${o}</label>`).join('')}</div>`; }).join('')}`,
    [{ label: 'Check my answers', cls: 'primary', fn: gradeDrill }]);
}
function gradeDrill() {
  let right = 0; DRILL_QS.forEach((q, i) => { const el = document.querySelector(`input[name="fd${i}"]:checked`); if (el && +el.value === q[2]) right++; });
  if (right === DRILL_QS.length) { S.safety.drill = true; unlock('safety'); log('🚒 Fire drill: 5/5! You know exactly what to do in a fire. Great job!', 'good'); }
  else log(`🚒 Fire drill: ${right}/${DRILL_QS.length}. Practice again until you get them all right!`);
  queueModal(`<h2>🚒 Fire Drill Results: ${right}/${DRILL_QS.length}</h2><ul class="notes">${DRILL_QS.map(q => `<li>✅ ${q[0]} <b>${q[1][q[2]]}</b></li>`).join('')}</ul><p class="lesson">💡 Pick a meeting spot outside, like the mailbox, where your family meets after getting out.</p>`);
  done();
}
// called after every trip
function safetyAfterTravel(info) {
  if (info.how === 'biked' && Math.random() < 0.04) {
    if (has('helmet')) log('🚲 You hit a bump and fell off your bike — but your helmet protected your head! Always wear a helmet.', 'good');
    else { S.needs.health = clamp(S.needs.health - 15); log('🤕 You fell off your bike and bumped your head! Ouch. ALWAYS wear a bike helmet (Mall).', 'bad'); }
  }
  if (info.how === 'drove' && !S.safety.seatbelt) { S.safety.seatbelt = true; queueModal('<h2>🚙 Buckle Up!</h2><p>Click! You put on your seatbelt before driving.</p><p class="lesson">💡 Seatbelts save lives. Everyone in the car buckles up, every time — even on short trips!</p>'); }
  if (info.how === 'walked' && Math.random() < 0.08) crossStreet();
}
function crossStreet() {
  queueModal(`<h2>🚶 Crossing the Street</h2><p>You get to a busy street. What do you do?</p>
    <div class="grid actions"><button class="action" onclick="closeModal();crossAnswer(true)"><span class="ic">👀</span><b>Stop, look left, right, then left again</b><small>and cross at the crosswalk</small></button>
    <button class="action" onclick="closeModal();crossAnswer(false)"><span class="ic">🏃</span><b>Run across fast</b><small>between parked cars</small></button></div>`);
}
function crossAnswer(ok) {
  if (ok) { S.safety.crossing++; log('👀 You looked both ways and crossed at the crosswalk. Safe and smart!', 'good'); }
  else { S.needs.fun = clamp(S.needs.fun - 5); log('🚗 HONK! A car had to stop fast. Always stop, look both ways, and use the crosswalk!', 'bad'); }
  done();
}
