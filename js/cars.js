// ===================== CARS, TRAFFIC, GAS, LICENSE, AIRPORT =====================

const hasCar = () => has('car') || has('newcar');
function ensureCarState() {
  if (S.license === undefined) S.license = hasCar() || S.skills.drive >= 20 && false;
  if (hasCar() && S.license === false && !S.licenseChecked) { S.license = true; }
  S.licenseChecked = true;
  if (S.fuel === undefined) S.fuel = 100;
  if (!S.car) S.car = { miles: has('newcar') ? 0 : 62000, oilAt: has('newcar') ? 0 : 62000, dirty: 10 };
  if (!S.gasPrice) S.gasPrice = 3.6;
}
const isRush = () => weekday() < 5 && ((S.hour >= 7 && S.hour < 9) || (S.hour >= 16 && S.hour < 18.5));
const fuelFor = len => len / 90;   // % of a tank
function canDrive(len) { return hasCar() && S.license && S.skills.drive >= 20 && S.fuel >= fuelFor(len) && !S.carBroken; }
function afterDrive(info) {
  if (info.icon !== '🚙') return;
  S.fuel = Math.max(0, S.fuel - fuelFor(info.len));
  S.car.miles += Math.round(info.len / 25);
  if (S.fuel < 15) toast('⛽ Your gas tank is almost empty! Fill up at the gas station.', 'bad');
  if (S.car.miles - S.car.oilAt > 6000 && !S.carBroken) {
    S.carBroken = true;
    charge(900, 'Engine repair');
    queueModal('<h2>💥 Engine Trouble!</h2><p>Your car\'s engine broke down because the oil wasn\'t changed for too long. The repair cost <b>$900</b>.</p><p class="lesson">💡 Get an oil change about every 3,000 miles. A $45 oil change is much cheaper than a new engine!</p>');
    log('💥 Your engine broke from old oil! $900 repair.', 'bad');
  } else if (Math.random() < 0.015) flatTire();
}
function flatTire() {
  queueModal(`<h2>🛞 Flat Tire!</h2><p>Bump bump bump... you got a flat tire. What do you do?</p>
    <div class="row"><button class="btn primary" onclick="fixTire(true)">🔧 Change it with the spare (Building skill)</button><button class="btn ghost" onclick="fixTire(false)">🚛 Call a tow truck ($90)</button></div>`);
}
function fixTire(self) {
  closeModal();
  if (self && S.skills.build >= 20) { pass(1); addSkill('build', 2); log('🔧 You changed the flat tire yourself! Then you bought a new tire for $60.', 'good'); charge(60, 'New tire'); }
  else { if (self) log('🔧 You tried, but couldn\'t get the lug nuts off. You had to call a tow truck.', 'bad'); pass(1.5); charge(90, 'Tow truck'); charge(60, 'New tire'); log('🚛 The tow truck took your car to the shop for a new tire. $150 total.'); }
  done();
}
function carsNewDay() {
  ensureCarState();
  S.gasPrice = Math.round((3.1 + Math.random() * 1.5) * 100) / 100;
  if (hasCar()) { S.car.dirty = clamp(S.car.dirty + 6 + (S.weather === 'rainy' || S.weather === 'snowy' ? 20 : 0)); }
  S.carBroken = false;
}
function fillTank() {
  if (!hasCar()) return nope('You don\'t have a car.');
  const gal = Math.round((100 - S.fuel) / 100 * 12 * 10) / 10;
  if (gal < 0.5) return nope('Your tank is already full!');
  const cost = Math.round(gal * S.gasPrice * 100) / 100;
  if (!spend(cost, 'Gas for car')) return;
  pass(0.2); S.fuel = 100;
  log(`⛽ You filled up ${gal} gallons at $${S.gasPrice.toFixed(2)}/gallon = ${money(cost)}.`); done();
}
function carWash() { if (!hasCar()) return nope('You don\'t have a car.'); if (!spend(10, 'Car wash')) return; pass(0.3); S.car.dirty = 0; fun2(4); log('🧽 Your car went through the car wash. Shiny!'); done(); }
function oilChange() { if (!hasCar()) return nope('You don\'t have a car.'); if (!spend(45, 'Oil change')) return; pass(0.75); S.car.oilAt = S.car.miles; log('🛢️ Oil changed! Your engine is happy. Next one in 3,000 miles.', 'good'); done(); }
function carCard() {
  if (!hasCar()) return '';
  const oilLeft = 3000 - (S.car.miles - S.car.oilAt);
  return `<div class="card energy"><h3>🚙 Your Car <span class="muted small">· ${S.car.miles.toLocaleString()} miles</span></h3>
    <div class="pbar"><span>⛽ Gas</span><div class="bar small"><div class="fill ${S.fuel < 15 ? 'low' : S.fuel < 40 ? 'mid' : 'ok'}" style="width:${S.fuel}%"></div></div></div>
    <div class="pbar"><span>🧽 Clean</span><div class="bar small"><div class="fill ${S.car.dirty > 70 ? 'low' : 'ok'}" style="width:${100 - S.car.dirty}%"></div></div></div>
    <p class="muted small">🛢️ ${oilLeft > 0 ? `Oil change due in ${oilLeft.toLocaleString()} miles` : `<b class="neg">Oil change overdue by ${(-oilLeft).toLocaleString()} miles!</b>`} · 🪪 ${S.license ? 'Licensed driver' : 'No license!'}</p></div>`;
}

// ---------- driver's license ----------
const ROAD_QUESTIONS = [
  ['What does a red octagon (8-sided) sign mean?', ['Stop completely', 'Slow down a little', 'Speed up']],
  ['A traffic light turns yellow. You should…', ['Slow down and stop if it\'s safe', 'Speed up to beat the red', 'Honk your horn']],
  ['A school bus stops with flashing red lights. You…', ['Stop and wait', 'Drive around it quickly', 'Honk']],
  ['When should you wear a seatbelt?', ['Every single time', 'Only on the highway', 'Only at night']],
  ['Can you text while driving?', ['No, never', 'Only at red lights', 'Yes, if you\'re careful']],
  ['Someone is walking in the crosswalk. You…', ['Stop and let them cross', 'Honk so they hurry', 'Drive around them']],
  ['An ambulance with sirens is behind you. You…', ['Pull over to the right and stop', 'Speed up', 'Stay where you are']],
  ['What does a green light mean?', ['Go, if the way is clear', 'Stop', 'Park here']],
  ['The speed limit near a school is usually…', ['20–25 mph', '50 mph', '70 mph']],
  ['Before changing lanes you should…', ['Check mirrors, look over your shoulder, and signal', 'Just turn the wheel', 'Close your eyes']],
];
function writtenTest() {
  if (S.permit || S.license) return nope('You already passed the written test!');
  if (!spend(10, 'Written driving test fee')) return;
  const qs = [...ROAD_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 5);
  showModal(`<h2>📝 Written Driving Test</h2><p>Answer at least 4 out of 5 right to get your learner's permit.</p>
    ${qs.map((q, i) => { const opts = q[1].map((o, k) => [o, k]).sort(() => Math.random() - 0.5); return `<div class="quiz"><b>${i + 1}. ${q[0]}</b>${opts.map(([o, k]) => `<label><input type="radio" name="q${i}" value="${k}"> ${o}</label>`).join('')}</div>`; }).join('')}`,
    [{ label: 'Turn in my test', cls: 'primary', keepOpen: true, fn: () => {
      let right = 0; qs.forEach((q, i) => { const v = (document.querySelector(`input[name="q${i}"]:checked`) || {}).value; if (v === '0') right++; });
      closeModal(); pass(0.75, 'study');
      if (right >= 4) { S.permit = true; addSkill('drive', 3); log(`📝 You got ${right}/5 right and passed! You have a learner's permit.`, 'good'); showModal(`<h2>✅ You Passed! (${right}/5)</h2><p>You got your <b>learner's permit</b>. Practice driving (take Driving classes at the College) until your Driving skill is 20, then take the road test here.</p>`, [{ label: 'OK' }]); }
      else { log(`📝 You got ${right}/5. You need 4 to pass. Study the road rules and try again!`, 'bad'); showModal(`<h2>❌ Not this time (${right}/5)</h2><p>You need 4 out of 5. Here are the right answers:</p><ul class="notes">${qs.map(q => `<li>${q[0]} <b>${q[1][0]}</b></li>`).join('')}</ul>`, [{ label: 'OK' }]); }
      done(false);
    } }]);
}
function roadTest() {
  if (S.license) return nope('You already have your license!');
  if (!S.permit) return nope('Pass the written test first.');
  if (S.skills.drive < 20) return nope(`You need Driving skill 20 for the road test (you have ${Math.round(S.skills.drive)}). Take Driving classes at the College.`);
  if (!spend(25, 'Road test fee')) return;
  pass(1);
  const pass2 = Math.random() < 0.45 + S.skills.drive / 100;
  if (pass2) {
    S.license = true; unlock('licensed');
    log('🪪 You passed the road test! You have your driver\'s license!', 'good');
    showModal(`<h2>🪪 You Got Your Driver's License!</h2><p>The examiner said you did great: full stops, used your signals, and checked your mirrors.</p><p>Now you can buy a car at the Bike & Car Shop.</p>`, [{ label: 'Yay!' }]);
    addNews(`🪪 ${S.name} passes driving test on ${dateText()}`);
  } else {
    const oops = pickR(['you rolled through a stop sign', 'you forgot to signal before turning', 'you drove too fast in the school zone', 'you bumped the curb while parking']);
    log(`🚗 You didn't pass the road test because ${oops}. Practice and try again!`, 'bad');
    showModal(`<h2>😬 Not This Time</h2><p>The examiner said ${oops}.</p><p class="lesson">💡 Lots of people need two or three tries. Practice and come back!</p>`, [{ label: 'OK' }]);
  }
  done(false);
}

// ---------- traffic lights & stop signs ----------
function lightGreen(horiz, t) { const ph = (t / 1000) % 12; return horiz ? ph < 5 : ph >= 6 && ph < 11; }
function lightColor(horiz, t) { const ph = (t / 1000) % 12; if (horiz) return ph < 5 ? 'g' : ph < 6 ? 'y' : 'r'; return ph >= 6 && ph < 11 ? 'g' : ph >= 11 ? 'y' : 'r'; }
function carMustStop(car, t) {
  if (car.t < 0.78 || car.t > 0.95 || !isTownNode(car.to)) return false;
  const P0 = NODES[car.from], P1 = NODES[car.to];
  const horiz = P0[1] === P1[1];
  if (!isTownNode(car.to) || neighbors(car.to).length < 3) return false;
  return !lightGreen(horiz, t);
}
function drawTrafficLights(c, t, inView) {
  NODES.forEach((n, i) => {
    if (!inView(n[0], n[1], 40) || neighbors(i).length < 3) return;
    if (isTownNode(i)) {
      [[-1, -1, true], [1, 1, true], [1, -1, false], [-1, 1, false]].forEach(([dx, dy, horiz]) => {
        const x = n[0] + dx * (ROAD_W / 2 + 6), y = n[1] + dy * (ROAD_W / 2 + 6);
        fillR(c, x - 1, y - 2, 2, 8, '#333');
        fillR(c, x - 3.5, y - 14, 7, 13, '#222', 2);
        const col = lightColor(horiz, t);
        [['r', '#ff3b30', -11], ['y', '#ffcc00', -7.5], ['g', '#34c759', -4]].forEach(([k, cc, oy]) => circ(c, x, y + oy, 1.5, col === k ? cc : 'rgba(80,80,80,.9)'));
      });
    } else {
      const x = n[0] + ROAD_W / 2 + 8, y = n[1] - ROAD_W / 2 - 8;
      fillR(c, x - 1, y, 2, 12, '#666');
      c.fillStyle = '#d32f2f'; c.beginPath(); for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2 + Math.PI / 8; c.lineTo(x + Math.cos(a) * 6, y + Math.sin(a) * 6); } c.closePath(); c.fill();
      txt(c, 'STOP', x, y + 0.5, '#fff', 3.4, 900);
    }
  });
}

// ---------- airport & trips ----------
const DESTS = [
  { id: 'nyc', name: 'New York City', icon: '🗽', price: 450, days: 3, facts: ['You saw the Statue of Liberty!', 'You rode the subway under the city.', 'You ate a giant slice of pizza in Times Square.'] },
  { id: 'grand', name: 'Grand Canyon', icon: '🏜️', price: 350, days: 3, facts: ['The canyon is over a mile deep!', 'You watched the sunset turn the rocks red and orange.', 'You hiked part of the Bright Angel Trail.'] },
  { id: 'orlando', name: 'Orlando Theme Parks', icon: '🎢', price: 500, days: 4, facts: ['You rode the tallest roller coaster!', 'You met your favorite characters.', 'You watched fireworks over the castle.'] },
  { id: 'hawaii', name: 'Hawaii', icon: '🌺', price: 700, days: 5, facts: ['You snorkeled with sea turtles!', 'You saw a real volcano.', 'You learned to hula dance at a luau.'] },
  { id: 'paris', name: 'Paris, France', icon: '🗼', price: 900, days: 5, facts: ['You went up the Eiffel Tower!', 'You saw the Mona Lisa at the Louvre.', 'You ate fresh croissants every morning.'] },
  { id: 'tokyo', name: 'Tokyo, Japan', icon: '🏯', price: 1100, days: 6, facts: ['You rode a super fast bullet train!', 'You saw Mount Fuji.', 'You ate sushi and ramen.'] },
  { id: 'kenya', name: 'Safari in Kenya', icon: '🦁', price: 1300, days: 7, facts: ['You saw lions, elephants and giraffes in the wild!', 'You watched a huge herd of zebras.', 'You slept in a tent under a sky full of stars.'] },
];
const HOTEL_NIGHT = 90;
function viewAirport() {
  return `<p>Fly anywhere in the world! You need a 🧳 suitcase (Mall). Hotels cost about ${money(HOTEL_NIGHT)} a night.</p>
    <div class="grid shop">${DESTS.map(d => { const total = d.price + d.days * HOTEL_NIGHT; return `<div class="card item"><div class="jt"><b>${d.icon} ${d.name}</b><span class="pay">${money(total)}</span></div>
      <p class="muted small">✈️ Ticket ${money(d.price)} + 🏨 ${d.days} nights · ${d.days} days away${S.trips && S.trips[d.id] ? ' · ✅ been here' : ''}</p>
      <button class="btn primary sm" onclick="bookTrip('${d.id}')">Book trip</button></div>`; }).join('')}</div>
    <p class="lesson">💡 Bills still come while you're away, your pets need care, and if you have a job you need vacation days!</p>`;
}
function bookTrip(id) {
  const d = DESTS.find(x => x.id === id), total = d.price + d.days * HOTEL_NIGHT;
  if (!has('suitcase')) return nope('You need a suitcase to pack your things! Buy one at the Mall.');
  if (S.money < total) return nope(`This trip costs ${money(total)} in total. Save up!`);
  if (S.hour < 6 || S.hour > 20) return nope('All flights today have left. Come back in the morning!');
  const j = S.job; let workDays = 0;
  if (j) for (let k = 0; k < d.days; k++) if (worksOn(S.day + k)) workDays++;
  const pets = (S.pets || []).length;
  showModal(`<h2>${d.icon} Trip to ${d.name}</h2>
    <table class="stub"><tr><td>✈️ Plane tickets</td><td>${money(d.price)}</td></tr><tr><td>🏨 Hotel (${d.days} nights)</td><td>${money(d.days * HOTEL_NIGHT)}</td></tr>${pets ? `<tr><td>🐾 Pet sitter (${d.days} days)</td><td>${S.family.mom.rel >= 50 ? 'Free — Mom will help!' : money(20 * pets * d.days)}</td></tr>` : ''}<tr class="total"><td>Total</td><td>${money(total + (pets && S.family.mom.rel < 50 ? 20 * pets * d.days : 0))}</td></tr></table>
    ${j && workDays ? `<p>${j.pto >= workDays ? `🏖️ You'll use <b>${workDays} vacation days</b> from work (you have ${j.pto}).` : `<b class="neg">⚠️ You only have ${j.pto} vacation days but would miss ${workDays} work days. Your boss will be upset!</b>`}</p>` : ''}
    <h3>🛂 Airport Security Quiz</h3><p>Which of these can't go in your carry-on bag?</p>
    <label class="quiz"><input type="radio" name="sec" value="1"> A big bottle of water</label><label class="quiz"><input type="radio" name="sec" value="0"> A book</label><label class="quiz"><input type="radio" name="sec" value="0"> Socks</label>`,
    [{ label: 'Cancel', cls: 'ghost' }, { label: '✈️ Fly!', cls: 'primary', keepOpen: true, fn: () => { const right = (document.querySelector('input[name="sec"]:checked') || {}).value === '1'; closeModal(); goOnTrip(d, right); } }]);
}
function goOnTrip(d, securityRight) {
  const pets = (S.pets || []).length, sitter = pets && S.family.mom.rel < 50 ? 20 * pets * d.days : 0;
  if (!spend(d.price, `Plane tickets to ${d.name}`)) return;
  charge(d.days * HOTEL_NIGHT, `Hotel in ${d.name}`); if (sitter) charge(sitter, 'Pet sitter');
  if (!securityRight) log('🛂 Airport security took your big water bottle. Liquids in carry-ons must be tiny (3.4 oz)!', 'bad');
  const j = S.job;
  log(`✈️ You flew to ${d.name}!`, 'good');
  for (let k = 0; k < d.days; k++) {
    if (j && worksToday() && !S.today.worked && j.pto > 0) { j.pto--; S.today.worked = true; j.weekHours += 8; }
    pass(24, 'relax');
    const n = S.needs; n.food = 85; n.thirst = 85; n.hygiene = 85; n.bladder = 85; n.energy = Math.max(n.energy, 60); n.fun = clamp(n.fun + 15); n.health = Math.max(n.health, 70);
    (S.pets || []).forEach(p => { p.food = 80; p.clean = 80; p.happy = Math.max(p.happy, 55); p.walked = true; });
    log(`${d.icon} Day ${k + 1} in ${d.name}: ${d.facts[k % d.facts.length]}`, 'good');
  }
  S.needs.energy = 35;
  S.trips = S.trips || {}; S.trips[d.id] = true;
  S.inv.prints = S.inv.prints || []; S.inv.prints.push({ kind: 'print', q: 70, seed: Math.random(), souvenir: d.name });
  unlock('jetsetter');
  addNews(`✈️ Local traveler back from ${d.name}`);
  queueModal(`<h2>${d.icon} Welcome Back!</h2><p>What a trip to <b>${d.name}</b>!</p><ul class="notes">${d.facts.map(f => `<li>${f}</li>`).join('')}</ul><p>🖼️ You brought home a souvenir poster to hang on your wall. 😴 You have jet lag — get some sleep!</p>`);
  done();
}
function drawPlane(c, x, y, s, ang = 0) {
  c.save(); c.translate(x, y); c.rotate(ang); c.scale(s, s);
  c.fillStyle = 'rgba(0,0,0,.2)'; c.beginPath(); c.ellipse(4, 8, 30, 6, 0, 0, Math.PI * 2); c.fill();
  fillR(c, -30, -4, 60, 8, '#f5f5f5', 4); tri(c, [[-6, -2], [8, -2], [-10, -26]], '#cfd8dc'); tri(c, [[-6, 2], [8, 2], [-10, 26]], '#b0bec5');
  tri(c, [[-30, -2], [-22, -2], [-32, -12]], '#1e88e5'); fillR(c, 24, -2, 6, 4, '#90caf9', 2);
  for (let k = 0; k < 6; k++) circ(c, -14 + k * 6, 0, 1, '#1e88e5');
  c.restore();
}

// ---------- new places on Maple Town's east road ----------
Object.assign(PLACES, {
  gasstation: { kind: 'place', far: true, shop: true, town: 'maple', name: 'Gas Station', icon: '⛽', r: [1720, 240, 180, 140], door: [1810, 386], blurb: 'Gas, car wash, oil changes and snacks.' },
  salon:      { kind: 'place', far: true, shop: true, town: 'maple', name: 'Snip & Style Salon', icon: '💇', r: [1300, 414, 170, 140], door: [1385, 414], blurb: 'Haircuts and hair color.' },
  dmv:        { kind: 'place', far: true, shop: true, town: 'maple', name: 'License Office', icon: '🪪', r: [1500, 414, 190, 140], door: [1595, 414], blurb: 'Take the written test and the road test to get your driver\'s license.' },
  airport:    { kind: 'place', far: true, shop: true, name: 'Maple Airport', icon: '✈️', r: [5470, 230, 620, 340], door: [5470, 400], blurb: 'Fly to faraway cities for vacation!' },
});
road([4300, 400], [5450, 400]);
road([5450, 400], [5470, 400]);
Object.assign(ENTRANCE, {
  gasstation: { facade: 'store', wall: '#fff3e0', door: 'slide', doorCol: '#bfe3f5', signBg: '#e53935', signFg: '#fff', hours: [0, 24], inside: '#fbf7f0', awning: '#e53935', keeper: true },
  salon:      { facade: 'store', wall: '#fce4ec', door: 'swing', doorCol: '#ad1457', signBg: '#ad1457', signFg: '#fff', hours: [9, 19], inside: '#fff4f8', awning: '#f06292', keeper: true },
  dmv:        { facade: 'brick', wall: '#9e9e9e', door: 'double', doorCol: '#37474f', signBg: '#1565c0', signFg: '#fff', hours: [8, 17], inside: '#eef2f5', keeper: true },
  airport:    { facade: 'glass', wall: '#cfe3f0', door: 'slide', doorCol: '#bfe3f5', signBg: '#0d47a1', signFg: '#fff', hours: [0, 24], inside: '#eef4f8', keeper: true },
});
const _drawShopOld = drawShop;
drawShop = function (c, id, lod) {
  if (id !== 'airport' && id !== 'gasstation') return _drawShopOld(c, id, lod);
  const [x, y, w, h] = PLACES[id].r;
  if (id === 'gasstation') {
    fillR(c, x, y + 40, w, h - 40, '#9e9e9e');
    fillR(c, x + 10, y + 20, 110, 10, '#e53935', 2); fillR(c, x + 16, y + 30, 4, 60, '#bbb'); fillR(c, x + 110, y + 30, 4, 60, '#bbb');
    [[30, 70], [80, 70]].forEach(([dx, dy]) => { fillR(c, x + dx, y + dy, 14, 22, '#eceff1', 2); fillR(c, x + dx + 3, y + dy + 4, 8, 5, '#4caf50'); });
    shadow(c, x + 125, y + 50, 50, 50); fillR(c, x + 125, y + 50, 50, 50, '#fff3e0'); win(c, x + 130, y + 60, 40, 18); fillR(c, x + 143, y + 80, 14, 20, '#bfe3f5', 2);
    signBoard(c, x + 124, y + 42, 52, 10, '#e53935', '#fff', 'GAS & SNACKS', 5);
    fillR(c, x + 150, y + 4, 6, 30, '#666'); fillR(c, x + 134, y, 38, 20, '#fff', 3); txt(c, `$${(S && S.gasPrice || 3.6).toFixed(2)}`, x + 153, y + 10, '#e53935', 9, 900);
    carShape(c, x + 55, y + 100, '#1e88e5');
    return;
  }
  // airport: runway, terminal, tower, planes
  fillR(c, x, y, w, h, '#a5c98d', 6);
  fillR(c, x + 140, y + 230, 470, 46, '#4d535b', 4); c.strokeStyle = '#fff'; c.lineWidth = 2; c.setLineDash([16, 12]); c.beginPath(); c.moveTo(x + 150, y + 253); c.lineTo(x + 600, y + 253); c.stroke(); c.setLineDash([]);
  for (let k = 0; k < 6; k++) fillR(c, x + 146, y + 234 + k * 7, 10, 3, '#fff');
  fillR(c, x + 40, y + 120, 200, 70, '#bdbdbd', 4);
  shadow(c, x + 40, y + 60, 200, 64); fillR(c, x + 40, y + 60, 200, 64, '#cfe3f0'); winGrid(c, x + 40, y + 68, 200, 50, 8, 2, 18, 16, '#9fc4dd', '#eceff1');
  signBoard(c, x + 80, y + 64, 120, 12, '#0d47a1', '#fff', 'MAPLE AIRPORT', 7);
  fillR(c, x + 270, y + 30, 16, 90, '#eceff1'); fillR(c, x + 260, y + 18, 36, 18, '#4fc3f7', 3); fillR(c, x + 258, y + 14, 40, 5, '#37474f');
  drawPlane(c, x + 120, y + 150, 0.9, 0); drawPlane(c, x + 380, y + 150, 0.9, 0);
  for (let k = 0; k < 8; k++) carShape(c, x + 30 + k * 26, y + 210, ['#e53935', '#1e88e5', '#fdd835', '#43a047'][k % 4], false);
};
INTERIORS.gasstation = c => {
  iWall(c, '#fbf7f0'); iFloor(c, 'tile', ['#e6e1d8']); iLights(c, 'strip', [250, 750]);
  iShelf(c, 40, 80, 240, 188, 'grocery', 101, '#9aa3aa'); iShelf(c, 300, 80, 200, 188, 'grocery', 102, '#9aa3aa');
  box3d(c, 540, 110, 110, 158, 0.04, '#cfd8dc', 'metal'); for (let k = 0; k < 4; k++) { c.fillStyle = 'rgba(190,230,250,.5)'; c.fillRect(546, 118 + k * 36, 98, 30); for (let j = 0; j < 6; j++) { c.fillStyle = ['#e53935', '#1e88e5', '#43a047', '#fdd835'][(j + k) % 4]; c.fillRect(550 + j * 15, 126 + k * 36, 10, 20); } }
  iCounter(c, 700, 200, 270, 68, '#37474f', { register: 900, mat: 'solid' });
  iWindow(c, 700, 50, 260, 110); for (let k = 0; k < 2; k++) { fillR(c, 740 + k * 120, 110, 30, 45, '#eceff1', 3); fillR(c, 745 + k * 120, 116, 20, 10, '#4caf50'); }
  iSign(c, 300, 30, 200, 26, '#e53935', '#fff', `⛽ GAS $${S.gasPrice.toFixed(2)}`, 13);
  iPeople(c, [[800, 196, 1.8, staff('#e53935', 30)]]);
};
INTERIORS.salon = c => {
  iWall(c, '#fff4f8'); iFloor(c, 'checker', ['#ffffff', '#f8bbd0']); iLights(c, 'pendant', [250, 500, 750]);
  for (let k = 0; k < 3; k++) {
    const x = 120 + k * 260;
    c.fillStyle = '#c9a54a'; rrect(c, x - 40, 40, 100, 120, 50); c.fill(); const mg = c.createLinearGradient(x - 34, 46, x + 54, 154); mg.addColorStop(0, '#eef6fb'); mg.addColorStop(1, '#b8cfdd'); c.fillStyle = mg; rrect(c, x - 34, 46, 88, 108, 44); c.fill();
    box3d(c, x - 30, 220, 70, 22, 0.06, '#1d1d1d', 'fabric'); box3d(c, x - 24, 180, 58, 40, 0.03, '#1d1d1d', 'fabric'); metal(c, x, 242, 10, 26, 2, '#c0c6cb');
    drawPerson(c, x + 5, 232, 1.6, guest(70 + k)); drawPerson(c, x + 70, 262, 1.8, staff('#ad1457', 31 + k));
  }
  iPlant(c, 960, 0.8);
};
INTERIORS.dmv = c => {
  iWall(c, '#eef2f5'); iFloor(c, 'tile', ['#d7dde0']); iLights(c, 'strip', [200, 500, 800]);
  fillR(c, 420, 30, 160, 50, '#111', 4); txt(c, 'NOW SERVING', 500, 44, '#ffcc00', 10, 900); txt(c, `A-${(S.day * 7) % 90 + 10}`, 500, 66, '#ff3b30', 20, 900);
  for (let k = 0; k < 3; k++) { iCounter(c, 120 + k * 260, 200, 200, 68, '#607d8b', { register: 250 + k * 260, mat: 'solid' }); drawPerson(c, 180 + k * 260, 196, 1.7, staff('#1565c0', 33 + k)); }
  // eye chart
  wallShadow(c, 860, 30, 100, 130); fillR(c, 860, 30, 100, 130, '#fff'); ['E', 'F P', 'T O Z', 'L P E D', 'P E C F D'].forEach((l, i) => txt(c, l, 910, 50 + i * 22, '#111', 18 - i * 3, 900));
  for (let k = 0; k < 6; k++) { box3d(c, 40 + k * 120, 300, 90, 10, 0.08, '#607d8b', 'solid'); }
  iPeople(c, [[300, 330, 2, guest(75)], [700, 335, 2, guest(76)]]);
};
INTERIORS.airport = c => {
  iWall(c, '#eef4f8'); iFloor(c, 'marble', ['#e4e8ec']); iLights(c, 'strip', [200, 500, 800]);
  iWindow(c, 40, 30, 920, 140);
  drawPlane(c, 520, 120, 2.4, 0);
  fillR(c, 360, 180, 280, 70, '#111', 4); txt(c, 'DEPARTURES', 500, 192, '#ffcc00', 11, 900);
  ['NYC  ON TIME', 'PARIS  BOARDING', 'TOKYO  10:45'].forEach((l, i) => txt(c, l, 500, 210 + i * 14, i === 1 ? '#34c759' : '#fff', 10, 800));
  iCounter(c, 60, 214, 240, 54, '#0d47a1', { register: 240, mat: 'solid' });
  for (let k = 0; k < 6; k++) box3d(c, 680 + k * 50, 260, 42, 10, 0.08, '#37474f', 'solid');
  // suitcases
  [[420, 300, '#e53935'], [600, 310, '#1e88e5']].forEach(([sx, sy, col]) => { box3d(c, sx, sy - 34, 30, 34, 0.05, col, 'solid'); metal(c, sx + 13, sy - 44, 4, 10, 1, '#555'); });
  iPeople(c, [[150, 210, 1.8, staff('#0d47a1', 36)], [440, 332, 2, guest(77)], [620, 338, 2, guest(78)]]);
};

// ---------- what you can do at each new place ----------
function viewGas() {
  return `<div class="card money"><h3>⛽ Gas Pumps <span class="muted small">· today: $${S.gasPrice.toFixed(2)}/gallon</span></h3>${hasCar() ? carCard() : '<p class="muted">You don\'t have a car yet.</p>'}
    <div class="row"><button class="btn primary sm" onclick="fillTank()">⛽ Fill the tank</button><button class="btn ghost sm" onclick="carWash()">🧽 Car wash $10</button><button class="btn ghost sm" onclick="oilChange()">🛢️ Oil change $45</button></div>
    <p class="lesson">💡 Gas prices change every day. Driving far uses more gas!</p></div>
    <div class="card"><h3>🍫 Snacks</h3><div class="row"><button class="btn sm ghost" onclick="buyExtra('water')">💧 Water $1</button><button class="btn sm ghost" onclick="drinkSoda()">🥤 Soda $2</button></div></div>`;
}
function viewSalon() {
  return `<p>Your hair grows every day. Right now it's been <b>${S.hairDays} days</b> since your last haircut.</p>
    <div class="grid actions"><button class="action" onclick="haircut(false)"><span class="ic">💇</span><b>Haircut</b><small>$25 · pick a new style</small></button>
    <button class="action" onclick="haircut(true)"><span class="ic">🎨</span><b>Hair Color</b><small>$45 · any color</small></button></div>
    <p class="lesson">💡 A fresh haircut helps you look your best at job interviews!</p>`;
}
function viewDmv() {
  return `<div class="card money"><h3>🪪 Get Your Driver's License</h3><div class="mrows">
    ${mrow('📝', 'Step 1: Written test', S.permit || S.license ? '✅ Passed — you have a learner\'s permit' : '$10 · 5 questions about road rules', S.permit || S.license ? '' : b('Take the test', 'writtenTest()'))}
    ${mrow('🚗', 'Step 2: Practice', `Driving skill ${Math.round(S.skills.drive)}/20 · take Driving classes at the College`, '')}
    ${mrow('🛣️', 'Step 3: Road test', S.license ? '✅ You have your license!' : '$25 · drive with an examiner', S.license ? '' : b('Take the road test', 'roadTest()', 'primary', !S.permit))}
    </div><p class="lesson">💡 You need a license to drive a car. It shows you know the rules and can drive safely.</p></div>`;
}
function interviewExtras(job, notes) {
  let s = 0;
  if (job.req.some(r => r.s === 'drive') && !S.license) { s -= 20; notes.push('🪪 They asked to see your driver\'s license. You don\'t have one yet! (−20)'); }
  if (S.volunteerHours >= 4) { const v = Math.min(8, Math.round(S.volunteerHours / 2)); s += v; notes.push(`🤝 They liked that you volunteer in your community. (+${v})`); }
  if (S.hairDays > 60) { s -= 6; notes.push('💇 Your hair looked really messy. Get a haircut! (−6)'); }
  if (S.ill && S.ill.type !== 'arm') { s -= 8; notes.push(`🤧 You were sneezing and coughing the whole time. (−8)`); }
  if (S.credit < 500 && JOBS.indexOf(job) >= 0 && job.cat === 'Office') { s -= 5; notes.push('📉 They checked your credit and it was poor. (−5)'); }
  return s;
}
