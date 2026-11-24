// ===================== BUILD YOUR OWN HOUSE =====================
// Buy land, design a house, and watch workers build it day by day.

const LOTS = {
  lot_country: { name: 'Countryside Lot', icon: '🌾', r: [-1580, 236, 200, 144], door: [-1480, 386], price: 25000, about: 'Quiet land out in the country, on the road west of town.' },
  lot_river:   { name: 'Riverview Lot',   icon: '🏞️', r: [352, -720, 180, 150], door: [344, -645], price: 40000, about: 'Land by the river, north of Maple Town.' },
  lot_sea:     { name: 'Seaview Lot',     icon: '🌊', r: [4380, 2926, 180, 130], door: [4470, 2918], price: 60000, about: 'Land in Seaside Bay, close to the beach.' },
};
const HOUSE_STYLES = {
  cottage:   { name: 'Cozy Cottage', icon: '🏡', base: 60000, roof: '#7f5539', days: 10 },
  modern:    { name: 'Modern House', icon: '🏢', base: 90000, roof: '#37474f', days: 14, flat: true },
  farmhouse: { name: 'Farmhouse', icon: '🏚️', base: 75000, roof: '#b03a2e', days: 12 },
  cabin:     { name: 'Log Cabin', icon: '🪵', base: 55000, roof: '#4e342e', days: 9, logs: true },
  castle:    { name: 'Mini Castle', icon: '🏰', base: 250000, roof: '#5b6b80', days: 30, castle: true },
};
const BUILD_STAGES = ['🧱 Pouring the foundation', '🪚 Building the frame', '🏠 Putting on the roof', '🎨 Painting and finishing'];
Object.entries(LOTS).forEach(([id, l]) => { PLACES[id] = { kind: 'land', far: true, name: l.name, icon: l.icon, r: l.r, door: l.door, blurb: l.about }; });
(function clearLots() {
  for (let i = VHOUSES.length - 1; i >= 0; i--) { const h = VHOUSES[i]; if (Object.values(LOTS).some(l => overlap([h.x, h.y, h.w, h.h], l.r, 10))) VHOUSES.splice(i, 1); }
})();

function ensureBuildState() {
  const b2 = S.build;
  if (b2 && b2.done) registerCustomHome();
}
function registerCustomHome() {
  const b2 = S.build, st = HOUSE_STYLES[b2.style];
  HOMES.custom = { name: `Your ${st.name}`, icon: st.icon, type: 'buy', price: b2.cost, upkeep: 40 + b2.beds * 25, comfort: 4 + b2.beds, desc: `The ${st.name.toLowerCase()} you designed and built yourself!`, custom: true };
  HOME_PLACE.custom = b2.lot;
  PLACES[b2.lot].kind = 'home';
  HOME_INCLUDES.custom = ['toilet', 'shower'];
  WALL_SLOTS.custom = 4 + b2.beds;
  DOOR_STYLE.custom = { kind: st.castle ? 'grand' : 'house', wall: b2.color, door: b2.door, num: String(7 + b2.beds) };
}

function viewLand() {
  return `<div class="card money"><h3>🏗️ Build Your Own House</h3>
    ${S.build ? `<p>You own the <b>${LOTS[S.build.lot].name}</b>. ${S.build.done ? '✅ Your house is finished!' : S.build.style ? `🚧 Building: ${Math.round(S.build.progress)}% done.` : 'Design your house next!'}</p>
      ${!S.build.style ? `<button class="btn primary sm" onclick="designHouse()">✏️ Design my house</button>` : ''}
      ${S.build.done && S.home !== 'custom' ? `<button class="btn primary sm" onclick="moveIntoCustom()">🔑 Move in</button>` : ''}
      ${S.build.style && !S.build.done ? `<button class="btn ghost sm" onclick="travelTo('${S.build.lot}')">👷 Go watch the builders</button>` : ''}`
    : `<p class="muted">Buy land, then design your dream house. Builders take a few weeks to build it.</p>
      <div class="grid shop">${Object.entries(LOTS).map(([id, l]) => `<div class="card item"><div class="jt"><b>${l.icon} ${l.name}</b><span class="pay">${money(l.price)}</span></div><p class="muted small">${l.about}</p><button class="btn primary sm" onclick="buyLand('${id}')">Buy land</button></div>`).join('')}</div>`}
    <p class="lesson">💡 Building a house takes land, a design, money, and time. Builders follow steps: foundation, frame, roof, then finishing.</p></div>`;
}
function buyLand(id) {
  const l = LOTS[id];
  if (S.build) return nope('You already own land.');
  confirmModal(`Buy the <b>${l.name}</b> for <b>${money(l.price)}</b>?`, () => {
    if (!spend(l.price, `Bought land: ${l.name}`)) return;
    S.build = { lot: id, style: null, progress: 0, done: false };
    log(`🌾 You bought the ${l.name}! Now design your house.`, 'good');
    done(); designHouse();
  });
}
let designPick = { style: 'cottage', beds: 2, color: '#f7d794', door: '#b03a2e' };
function houseCost(d = designPick) { return HOUSE_STYLES[d.style].base + d.beds * 15000; }
function designHouse() {
  const d = designPick;
  showModal(`<h2>✏️ Design Your House</h2>
    <div class="cc-row"><span class="cc-label">Style</span><div class="styles">${Object.entries(HOUSE_STYLES).map(([k, s]) => `<button class="st ${d.style === k ? 'sel' : ''}" onclick="designPick.style='${k}';closeModal();designHouse()">${s.icon} ${s.name}</button>`).join('')}</div></div>
    <div class="cc-row"><span class="cc-label">Bedrooms</span><div class="styles">${[1, 2, 3, 4, 5].map(n => `<button class="st ${d.beds === n ? 'sel' : ''}" onclick="designPick.beds=${n};closeModal();designHouse()">${n}</button>`).join('')}</div></div>
    <div class="cc-row"><span class="cc-label">Wall color</span><div class="swatches">${['#f7d794', '#a7d8f0', '#f8c6c6', '#d6f0b5', '#e4d4f7', '#fde2b8', '#f2f2f2', '#c8b39a'].map(c => `<button class="sw ${d.color === c ? 'sel' : ''}" style="background:${c}" onclick="designPick.color='${c}';closeModal();designHouse()" aria-label="wall color"></button>`).join('')}</div></div>
    <div class="cc-row"><span class="cc-label">Front door</span><div class="swatches">${['#b03a2e', '#2c5f8a', '#2e6b4a', '#f2b705', '#3e2723', '#7e57c2'].map(c => `<button class="sw ${d.door === c ? 'sel' : ''}" style="background:${c}" onclick="designPick.door='${c}';closeModal();designHouse()" aria-label="door color"></button>`).join('')}</div></div>
    <canvas id="housepreview" width="320" height="200" style="width:100%;max-width:320px;border-radius:10px;background:#cfeaff"></canvas>
    <p>Cost to build: <b>${money(houseCost())}</b> · Takes about <b>${HOUSE_STYLES[d.style].days + d.beds * 2} days</b></p>`,
    [{ label: 'Later', cls: 'ghost' }, { label: `🏗️ Start building (${money(houseCost())})`, cls: 'primary', fn: startBuilding }]);
  const cv = $('#housepreview'); if (cv) { const c = cv.getContext('2d'); c.scale(2, 2); c.fillStyle = '#8fd17a'; c.fillRect(0, 70, 160, 30); drawCustomHouse(c, 20, 10, 120, 85, { ...d, progress: 100 }); }
}
function startBuilding() {
  const d = designPick, cost = houseCost();
  if (S.mortgage && S.money < cost) return nope('You already have a mortgage. Pay it off or save up cash first.');
  if (S.money < cost) {
    // a construction loan: 10% down, the bank pays the builders, you pay back weekly for 10 years
    const down = Math.round(cost * 0.1), total = Math.round((cost - down) * 1.45), weekly = Math.round(total / 520);
    return showModal(`<h2>🏦 Construction Loan</h2><p>You have ${money(S.money)}, but building costs <b>${money(cost)}</b>.</p>
      <p>The bank can lend you the rest: <b>${money(down)}</b> down now, then <b>${money(weekly)}/week</b> for 10 years (${money(total + down)} total with interest).</p>
      <p class="lesson">💡 Banks want a credit score of 620+ and a payment under 40% of your pay (you earn ${money(weeklyIncome())}/week).</p>`,
      [{ label: 'No thanks', cls: 'ghost' }, { label: 'Get the loan', cls: 'primary', fn: () => {
        if (S.credit < 620) { queueModal(`<h2>🏦 Loan Denied</h2><p>Your credit score is <b>${S.credit}</b>. Banks want at least <b>620</b>.</p>`); return done(); }
        if (weeklyIncome() * 0.4 < weekly) { queueModal(`<h2>🏦 Loan Denied</h2><p>Your income is too low for ${money(weekly)}/week. You need to earn at least ${money(weekly / 0.4)}/week.</p>`); return done(); }
        if (!spend(down, 'Construction loan down payment')) return;
        S.mortgage = { balance: total, weekly };
        beginConstruction(d, cost);
      } }]);
  }
  if (!spend(cost, 'House construction')) return;
  beginConstruction(d, cost);
}
function beginConstruction(d, cost) {
  Object.assign(S.build, { style: d.style, beds: d.beds, color: d.color, door: d.door, cost: cost + LOTS[S.build.lot].price, progress: 0, daysTotal: HOUSE_STYLES[d.style].days + d.beds * 2 });
  log(`🏗️ The builders started building your ${HOUSE_STYLES[d.style].name}!`, 'good');
  addNews(`🏗️ Construction begins on a new ${HOUSE_STYLES[d.style].name.toLowerCase()}`);
  refreshLotChunks(); done();
}
function buildNewDay() {
  const b2 = S.build; if (!b2 || !b2.style || b2.done) return;
  const rain = S.weather === 'rainy' || S.weather === 'snowy';
  if (rain) { log('🌧️ Bad weather today — the builders couldn\'t work on your house.'); return; }
  if (weekday() >= 5) return;
  b2.progress = Math.min(100, b2.progress + 100 / (b2.daysTotal * 5 / 7));
  const stage = Math.min(3, Math.floor(b2.progress / 25));
  if (stage !== b2.stage) { b2.stage = stage; log(`👷 House update: ${BUILD_STAGES[stage]}...`); }
  if (b2.progress >= 100) {
    b2.done = true; registerCustomHome(); unlock('builder');
    queueModal(`<h2>🏡 Your House Is Finished!</h2><p>The builders finished your <b>${HOUSE_STYLES[b2.style].name}</b> with ${b2.beds} bedroom${b2.beds > 1 ? 's' : ''}!</p><p>Go to 🔑 Real Estate or visit your land to move in.</p>`);
    addNews(`🏡 New ${HOUSE_STYLES[b2.style].name.toLowerCase()} finished!`);
  }
  refreshLotChunks();
}
function moveIntoCustom() {
  if (!S.build || !S.build.done) return;
  if (S.home !== 'parents' && home().type === 'buy') return nope('Sell your other house first.');
  if (!petsOkFor('custom')) return;
  S.home = 'custom'; S.loc = 'home'; S.doorOpen = false; S.missedRent = 0; S.mortgage = null;
  homeWelcome(); unlock('homeowner'); unlock('moved_out');
  log('🔑 You moved into the house you built yourself!', 'good'); done();
}
function refreshLotChunks() {
  if (!S.build) return;
  const [x, y, w, h] = LOTS[S.build.lot].r;
  for (let cy = Math.floor((y - 60) / CHUNK); cy <= Math.floor((y + h + 60) / CHUNK); cy++)
    for (let cx = Math.floor((x - 60) / CHUNK); cx <= Math.floor((x + w + 60) / CHUNK); cx++) chunkCache.forEach(m => m.delete(cx + ',' + cy));
}
function viewLot(id) {
  const b2 = S.build;
  if (!b2 || b2.lot !== id) return `<p>${LOTS[id].about} This land is for sale at 🔑 Real Estate for <b>${money(LOTS[id].price)}</b>.</p>`;
  if (!b2.style) return `<p>This is your land! Design a house to build here.</p><button class="btn primary" onclick="designHouse()">✏️ Design my house</button>`;
  if (b2.done) return `<p>Your ${HOUSE_STYLES[b2.style].name} is finished!</p>${S.home !== 'custom' ? '<button class="btn primary" onclick="moveIntoCustom()">🔑 Move in</button>' : ''}`;
  return `<div class="roomwrap"><canvas id="buildcv" aria-label="Your house being built"></canvas></div>
    <p>🚧 <b>${Math.round(b2.progress)}%</b> done · ${BUILD_STAGES[Math.min(3, Math.floor(b2.progress / 25))]}</p>
    <div class="bar"><div class="fill ok" style="width:${b2.progress}%"></div></div>
    <p class="muted small">Builders work on weekdays when the weather is nice.</p>`;
}
function drawBuildView(cv) {
  const b2 = S.build;
  const cssW = cv.parentElement.clientWidth, dpr = Math.min(2, window.devicePixelRatio || 1);
  cv.style.height = (cssW * RH / RW) + 'px'; cv.width = Math.round(cssW * dpr); cv.height = Math.round(cssW * dpr * RH / RW);
  const c = cv.getContext('2d'); c.setTransform(cv.width / RW, 0, 0, cv.width / RW, 0, 0);
  const g = c.createLinearGradient(0, 0, 0, 260); g.addColorStop(0, '#5aa9e6'); g.addColorStop(1, '#cfe8fa'); c.fillStyle = g; c.fillRect(0, 0, RW, 260);
  c.fillStyle = '#7fbf6a'; c.fillRect(0, 260, RW, 120); c.fillStyle = '#b98b5a'; c.fillRect(280, 262, 440, 30);
  drawCustomHouse(c, 300, 20, 400, 270, b2);
  // workers and machines
  drawPerson(c, 230, 330, 2, { skin: '#c4885a', hair: '#2a1c14', style: 'short', shirt: '#f57c00', pants: '#24395e' });
  drawPerson(c, 780, 335, 2, { skin: '#f3c9a0', hair: '#8a5230', style: 'ponytail', shirt: '#f57c00', pants: '#24395e' });
  [[230, 252], [780, 257]].forEach(([hx, hy]) => { c.fillStyle = '#fdd835'; c.beginPath(); c.arc(hx, hy, 15, Math.PI, 0); c.fill(); c.fillRect(hx - 19, hy - 2, 38, 4); });
  if (b2.progress < 50) { fillR(c, 820, 230, 120, 50, '#fbc02d', 6); fillR(c, 900, 200, 30, 30, '#333', 4); circ(c, 845, 285, 14, '#222'); circ(c, 915, 285, 14, '#222'); }
  fillR(c, 60, 270, 120, 18, '#c9a06a'); fillR(c, 70, 254, 100, 16, '#c9a06a');
  drawPerson(c, 120, 350, 2.3, S.look);
}
// a drawing of the custom house (used on the map, in the preview and on the building site)
function drawCustomHouse(c, x, y, w, h, b2) {
  const st = HOUSE_STYLES[b2.style || 'cottage'], p = b2.progress == null ? 100 : b2.progress;
  const bx = x + w * 0.12, bw = w * 0.76, by = y + h * 0.42, bh = h * 0.5;
  c.fillStyle = '#9e9e9e'; c.fillRect(bx - 4, by + bh - 4, bw + 8, 8);                       // foundation
  if (p < 25) { c.fillStyle = 'rgba(150,150,150,.5)'; c.fillRect(bx, by + bh - 4 - (p / 25) * 6, bw, 6); return; }
  if (p < 50) {                                                                              // wooden frame
    c.strokeStyle = '#c9a06a'; c.lineWidth = Math.max(1.5, w / 80);
    const top = by + bh - (bh * Math.min(1, (p - 25) / 20));
    for (let k = 0; k <= 6; k++) { c.beginPath(); c.moveTo(bx + bw * k / 6, by + bh); c.lineTo(bx + bw * k / 6, top); c.stroke(); }
    c.beginPath(); c.moveTo(bx, top); c.lineTo(bx + bw, top); c.moveTo(bx, by + bh / 2); c.lineTo(bx + bw, by + bh / 2); c.stroke();
    return;
  }
  const painted = p >= 75;
  const wall = painted ? b2.color : '#d7ccc8';
  if (st.castle) { c.fillStyle = wall; c.fillRect(bx, by - bh * 0.2, bw, bh * 1.2); [bx - w * 0.06, bx + bw - w * 0.06].forEach(tx => { c.fillStyle = tone(wall, -0.1); c.fillRect(tx, by - bh * 0.6, w * 0.12, bh * 1.6); tri(c, [[tx - 4, by - bh * 0.6], [tx + w * 0.06, by - bh * 1.1], [tx + w * 0.12 + 4, by - bh * 0.6]], st.roof); }); for (let k = 0; k < 6; k++) c.fillRect(bx + k * bw / 6, by - bh * 0.3, bw / 12, bh * 0.1); }
  else { c.fillStyle = wall; c.fillRect(bx, by, bw, bh); }
  if (st.logs && painted) for (let k = 0; k < 8; k++) { c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(bx, by + k * bh / 8, bw, 2); }
  if (p >= 62) {
    if (st.flat) { c.fillStyle = st.roof; c.fillRect(bx - 6, by - 8, bw + 12, 10); }
    else if (!st.castle) tri(c, [[bx - w * 0.06, by + 2], [bx + bw / 2, y + h * 0.05], [bx + bw + w * 0.06, by + 2]], st.roof);
  }
  if (painted) {
    const n = Math.min(4, (b2.beds || 2) + 1);
    for (let k = 0; k < n; k++) { const wx = bx + bw * (k + 0.5) / (n + 0.5) - w * 0.03; c.fillStyle = '#fff'; c.fillRect(wx - 1, by + bh * 0.18 - 1, w * 0.07 + 2, h * 0.11 + 2); c.fillStyle = '#bfe3f5'; c.fillRect(wx, by + bh * 0.18, w * 0.07, h * 0.11); }
    c.fillStyle = b2.door; c.fillRect(bx + bw - w * 0.16, by + bh - h * 0.22, w * 0.09, h * 0.22);
  }
}
// the lots on the big map
const _drawFarPlaceOld = drawFarPlace;
drawFarPlace = function (c, id, lod) {
  if (!LOTS[id]) return _drawFarPlaceOld(c, id, lod);
  const [x, y, w, h] = LOTS[id].r;
  const mine = S && S.build && S.build.lot === id;
  c.fillStyle = mine && S.build.style ? '#c9b48a' : '#9fd987'; c.fillRect(x, y, w, h);
  c.strokeStyle = '#8b6b45'; c.lineWidth = 1.5; c.setLineDash([4, 4]); c.strokeRect(x + 2, y + 2, w - 4, h - 4); c.setLineDash([]);
  if (mine && S.build.style) drawCustomHouse(c, x + 10, y, w - 20, h - 10, S.build);
  else { fillR(c, x + w / 2 - 1, y + h - 50, 2, 30, '#6d4c41'); signBoard(c, x + w / 2 - 30, y + h - 66, 60, 18, mine ? '#2e7d32' : '#fff', mine ? '#fff' : '#c62828', mine ? 'YOUR LAND' : 'FOR SALE', 8); }
};
