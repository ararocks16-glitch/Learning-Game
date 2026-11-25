// ===================== TOWN 4: horse riding, aquarium, bowling, roller rink, ice cream truck, car show, hospital visits, mini golf,
// water park, family camping, stargazing, farm seasons, new countries & passports, beach tides, nature walks =====================

function ensureTown4State() { if (!S.t4) S.t4 = { horse: 0, sky: [], plants: [], shells: [], bowlBest: 0, golfBest: 0, skate: 0, passport: 0 }; ensureLife4State(); }

// ---------- new places ----------
PLACES.farm.kind = 'place'; PLACES.farm.blurb = 'Horses, cows and chickens. Take riding lessons and help on the farm!';
Object.assign(PLACES, {
  bowling:   { kind: 'place', far: true, shop: true, town: 'maple', name: 'Strike Zone Bowling', icon: '🎳', r: [2460, 226, 200, 150], door: [2560, 386], blurb: 'Bowling lanes, shoes and snacks.' },
  rink:      { kind: 'place', far: true, shop: true, town: 'maple', name: 'Roller Rink', icon: '🛼', r: [2460, 414, 200, 140], door: [2560, 414], blurb: 'Roller skating with music and disco lights.' },
  minigolf:  { kind: 'place', far: true, shop: true, town: 'maple', name: 'Mini Golf', icon: '⛳', r: [2700, 226, 220, 150], door: [2810, 386], blurb: '9 holes with windmills and ramps.' },
  waterpark: { kind: 'place', far: true, shop: true, town: 'maple', name: 'Splash Water Park', icon: '🌊', r: [2700, 414, 260, 170], door: [2830, 414], blurb: 'Water slides, a lazy river and a wave pool (summer).' },
});
Object.assign(ENTRANCE, {
  bowling:   { facade: 'store', wall: '#ede7f6', door: 'double', doorCol: '#4527a0', signBg: '#4527a0', signFg: '#fff', hours: [10, 23], inside: '#2a1f4a', awning: '#7e57c2', keeper: true },
  rink:      { facade: 'store', wall: '#fce4ec', door: 'double', doorCol: '#ad1457', signBg: '#ec407a', signFg: '#fff', hours: [12, 22], inside: '#2b1830', awning: '#f06292', keeper: true },
  minigolf:  { facade: 'wood', wall: '#c8e6c9', door: 'swing', doorCol: '#2e7d32', signBg: '#2e7d32', signFg: '#fff', hours: [10, 21], inside: '#a5d6a7', keeper: true },
  waterpark: { facade: 'store', wall: '#b3e5fc', door: 'slide', doorCol: '#bfe3f5', signBg: '#0277bd', signFg: '#fff', hours: [10, 18], inside: '#e1f5fe', awning: '#29b6f6', keeper: true },
});
INTERIORS.bowling = c => {
  iWall(c, '#2a1f4a'); iFloor(c, 'wood', ['#c49a5a', '#e0bb7a']);
  for (let k = 0; k < 4; k++) { const x = 120 + k * 200; c.fillStyle = '#e7c58a'; c.beginPath(); c.moveTo(x, 380); c.lineTo(x + 140, 380); c.lineTo(x + 95, 150); c.lineTo(x + 45, 150); c.closePath(); c.fill(); c.fillStyle = '#5d4037'; c.fillRect(x + 40, 140, 60, 10); for (let p = 0; p < 4; p++) for (let q = 0; q <= p; q++) { c.fillStyle = '#fff'; c.beginPath(); c.ellipse(x + 70 - p * 5 + q * 10, 120 + p * 5, 3.5, 7, 0, 0, Math.PI * 2); c.fill(); c.fillStyle = '#e53935'; c.fillRect(x + 67 - p * 5 + q * 10, 118 + p * 5, 6, 1.5); } }
  iSign(c, 360, 30, 280, 30, '#7e57c2', '#fff', '🎳 STRIKE ZONE', 15);
};
INTERIORS.rink = c => {
  iWall(c, '#2b1830'); iFloor(c, 'wood', ['#8d6e63', '#bcaaa4']);
  const t = Date.now() / 500; for (let k = 0; k < 30; k++) { c.fillStyle = ['#ff4081', '#40c4ff', '#ffd740', '#69f0ae'][(k + Math.floor(t)) % 4]; c.beginPath(); c.arc(40 + k * 32, 40 + (k % 3) * 25, 4, 0, Math.PI * 2); c.fill(); }
  c.fillStyle = '#ccc'; c.beginPath(); c.arc(500, 90, 28, 0, Math.PI * 2); c.fill(); for (let k = 0; k < 16; k++) { c.fillStyle = k % 2 ? '#fff' : '#90a4ae'; c.fillRect(480 + (k % 4) * 10, 72 + Math.floor(k / 4) * 9, 9, 8); }
  iSign(c, 360, 130, 280, 26, '#ec407a', '#fff', '🛼 ROLLER RINK · ALL SKATE', 12);
};
INTERIORS.minigolf = c => {
  c.fillStyle = '#90caf9'; c.fillRect(0, 0, RW, RH); c.fillStyle = '#66bb6a'; c.fillRect(0, 170, RW, RH);
  [[150, 260, 160, 50], [420, 230, 180, 40], [700, 270, 200, 50]].forEach(([x, y, w, h]) => { c.fillStyle = '#2e7d32'; c.beginPath(); c.ellipse(x, y, w / 2, h / 2, 0, 0, Math.PI * 2); c.fill(); c.fillStyle = '#111'; c.beginPath(); c.arc(x + w / 3, y, 4, 0, Math.PI * 2); c.fill(); });
  c.fillStyle = '#d32f2f'; c.fillRect(470, 90, 40, 80); c.fillStyle = '#5d4037'; c.beginPath(); c.moveTo(462, 92); c.lineTo(490, 60); c.lineTo(518, 92); c.fill();
  c.save(); c.translate(490, 100); c.rotate(Date.now() / 1500); c.fillStyle = '#fff'; for (let k = 0; k < 4; k++) { c.rotate(Math.PI / 2); c.fillRect(0, -4, 45, 8); } c.restore();
};
INTERIORS.waterpark = c => {
  c.fillStyle = '#81d4fa'; c.fillRect(0, 0, RW, RH); c.fillStyle = '#ffe0b2'; c.fillRect(0, 220, RW, RH);
  c.fillStyle = '#29b6f6'; c.beginPath(); c.ellipse(350, 300, 260, 55, 0, 0, Math.PI * 2); c.fill();
  c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 2; for (let k = 0; k < 5; k++) { c.beginPath(); c.arc(250 + k * 50, 300, 20, Math.PI, 0); c.stroke(); }
  [['#ff7043', 700], ['#ab47bc', 820]].forEach(([col, x]) => { c.strokeStyle = col; c.lineWidth = 16; c.lineCap = 'round'; c.beginPath(); c.moveTo(x, 40); c.bezierCurveTo(x + 100, 80, x - 80, 160, x + 40, 280); c.stroke(); });
  fillR(c, 690, 30, 160, 12, '#78909c');
};
function fun4(n) { fun2(n); }

// ---------- 9. horse riding at the farm ----------
const RIDE = ['Brush and feed the horse', 'Walk', 'Trot', 'Canter', 'Jump a small fence'];
function horseCard() {
  const L = S.t4.horse;
  return `<div class="card"><h3>🐴 Horse Riding Lessons <span class="muted small">· $30 · 1 hr</span></h3><p>Your horse is <b>Maple</b>, a gentle brown mare. Level: <b>${RIDE[Math.min(L, 4)]}</b> (${L}/5)</p>
    <button class="btn sm primary" onclick="rideLesson()">🐴 Take a lesson</button><p class="muted small">Always wear a riding helmet and boots, and walk beside the horse, never behind it!</p></div>`;
}
function rideLesson() {
  if (S.hour < 8 || S.hour > 17) return nope('Lessons are 8 AM – 5 PM.');
  if (!spend(30, 'Riding lesson')) return;
  pass(1, 'awake'); addSkill('animal', 1.5); addSkill('fit', 1); fun2(18);
  const L = S.t4.horse;
  const msg = ['You brushed Maple\'s coat until it shined and gave her a carrot 🥕. She nuzzled you!', 'You walked Maple around the ring. Heels down, back straight!', 'Bumpity-bump! You learned to trot and post up and down.', 'Maple cantered smoothly around the ring. It felt like flying!', 'You and Maple jumped over a small fence together! 🎉'][Math.min(L, 4)];
  if (L < 5) S.t4.horse++;
  if (S.t4.horse === 5) { unlock('rider'); addPhoto('🐴', 'Jumping with Maple'); }
  log(`🐴 ${msg}`, 'good'); done();
}

// ---------- 32. seasons on the farm ----------
const FARM_SEASON = { spring: ['🐑', 'Bottle-feed the baby lambs', 'The baby lambs drank their milk and wagged their tails!'], summer: ['🌱', 'Pull weeds and pick berries', 'You pulled weeds in the hot sun and picked a basket of berries.'], fall: ['🍎', 'Harvest apples and pumpkins', 'You climbed a ladder to pick apples and loaded the wagon with pumpkins!'], winter: ['🐄', 'Feed the animals hay', 'You carried hay to the cows and broke the ice on the water trough.'] };
function farmChoreCard() {
  const f = FARM_SEASON[seasonOf()];
  return `<div class="card"><h3>🚜 ${SEASONS[seasonOf()].name} on the Farm</h3><p>Every season brings different farm work!</p><button class="btn sm primary" onclick="farmChore()">${f[0]} ${f[1]} (2 hrs · $15)</button></div>`;
}
function farmChore() {
  if (S.hour < 6 || S.hour > 17) return nope('Farm work happens in the daytime.');
  if (S.t4.farmDay === S.day) return nope('You already helped today!');
  S.t4.farmDay = S.day; const f = FARM_SEASON[seasonOf()];
  pass(2, 'work'); addSkill('animal', 1); addSkill('fit', 1); earn(15, 'Farm help');
  if (seasonOf() === 'fall') S.fridgeFood.push({ id: 'apples', exp: S.day + 12 }, { id: 'apples', exp: S.day + 12 });
  log(`${f[0]} ${f[2]} The farmer paid you $15.`, 'good'); done();
}

// ---------- 10. visit the aquarium (at the wildlife park) ----------
const AQUA = [['🦈', 'Shark tunnel', 'Sharks have been around since before the dinosaurs!'], ['🪼', 'Jellyfish room', 'Jellyfish have no brain, heart or bones!'], ['⭐', 'Touch pool', 'You gently touched a starfish — they can regrow their arms!'], ['🐧', 'Penguin feeding', 'Penguins can\'t fly, but they "fly" underwater!'], ['🐙', 'Octopus tank', 'An octopus has three hearts and blue blood!'], ['🐢', 'Sea turtle lagoon', 'Some sea turtles live over 100 years!']];
function aquariumCard() {
  return `<div class="card"><h3>🐠 The Aquarium <span class="muted small">· $14 · inside the Wildlife Park</span></h3><div class="row">${AQUA.map((a, i) => b(`${a[0]} ${a[1]}`, `aquaVisit(${i})`, 'ghost')).join('')}</div></div>`;
}
function aquaVisit(i) {
  if (S.t4.aquaDay !== S.day) { if (!spend(14, 'Aquarium ticket')) return; S.t4.aquaDay = S.day; }
  const a = AQUA[i]; pass(0.5, 'relax'); fun2(10); addSkill('sci', 0.8);
  if (typeof journalAdd === 'function') journalAdd(a[0], a[1].replace(/ (tunnel|room|pool|feeding|tank|lagoon)/, ''));
  log(`${a[0]} ${a[1]}: ${a[2]}`, 'good'); done();
}

// ---------- 18. bowling ----------
function bowlingCard() {
  return `<div class="card"><h3>🎳 Bowling <span class="muted small">· $8 a game + $3 shoe rental</span></h3><p>Your best score: <b>${S.t4.bowlBest || '—'}</b></p><button class="btn primary" onclick="startBowling()">🎳 Bowl a game (5 frames)</button></div>`;
}
function startBowling() { if (!spend(11, 'Bowling game & shoes')) return; S.t4.bowl = { frame: 0, score: 0, rolls: [] }; bowlFrame(); }
function bowlFrame() {
  const B = S.t4.bowl;
  if (B.frame >= 5) { pass(1, 'relax'); fun2(20); addSkill('fit', 0.8); S.t4.bowlBest = Math.max(S.t4.bowlBest, B.score); log(`🎳 Game over! Your score: ${B.score} (${B.rolls.join(', ')}). ${B.score >= 120 ? 'AMAZING! 🔥' : B.score >= 70 ? 'Nice game!' : 'Keep practicing!'}`, 'good'); S.t4.bowl = null; return done(); }
  showModal(`<h2>🎳 Frame ${B.frame + 1} of 5 · Score: ${B.score}</h2><p>Aim for the middle pin. How do you roll?</p><div class="grid actions">
    ${[['⬅️', 'Aim left', 'left'], ['⬆️', 'Aim center', 'center'], ['➡️', 'Aim right', 'right']].map(a => `<button class="action" onclick="bowlRoll('${a[2]}')"><span class="ic">${a[0]}</span><b>${a[1]}</b></button>`).join('')}</div>`, []);
}
function bowlRoll(aim) {
  const B = S.t4.bowl, skill = (S.skills.fit + 20) / 120;
  let pins = aim === 'center' ? Math.round(5 + Math.random() * 5 * skill + Math.random() * 2) : Math.round(2 + Math.random() * 6);
  pins = Math.min(10, pins);
  let second = 0, txt;
  if (pins === 10) { txt = 'STRIKE! 🎉 All 10 pins!'; B.score += 30; }
  else { second = Math.min(10 - pins, Math.round(Math.random() * (10 - pins) * (0.5 + skill / 2))); txt = pins + second === 10 ? `${pins} pins, then you picked up the SPARE! ✨` : `${pins} pins, then ${second} more.`; B.score += pins + second + (pins + second === 10 ? 10 : 0); }
  B.rolls.push(pins === 10 ? 'X' : pins + second === 10 ? `${pins}/` : pins + second); B.frame++;
  toast(`🎳 ${txt}`);
  bowlFrame();
}

// ---------- 19. roller rink ----------
const SKATE_LV = ['Holding the wall', 'Wobbly but moving', 'Skating smoothly', 'Skating backwards', 'Spins and tricks!'];
function rinkCard() {
  return `<div class="card"><h3>🛼 Roller Skating <span class="muted small">· $9 with skate rental · 1.5 hrs</span></h3><p>Your level: <b>${SKATE_LV[S.t4.skate]}</b></p><button class="btn primary" onclick="rollerSkate()">🛼 Skate to the music</button></div>`;
}
function rollerSkate() {
  if (!spend(9, 'Roller rink')) return;
  pass(1.5, 'relax'); addSkill('fit', 1.2); fun2(22);
  if (Math.random() < 0.25 && S.t4.skate < 2) { S.needs.health = clamp(S.needs.health - 2); log('🛼 You fell on your bottom! Everyone falls when they learn. You got back up and kept going.'); }
  else if (S.t4.skate < 4 && Math.random() < 0.6) { S.t4.skate++; log(`🛼 Level up: ${SKATE_LV[S.t4.skate]}! The disco ball sparkled while you skated to the music. 🪩`, 'good'); }
  else log(`🛼 You skated around and around to "${pickR(['a dance song', 'a 70s song', 'your favorite pop song'])}" under the disco lights! 🪩`, 'good');
  done();
}

// ---------- 20. the ice cream truck ----------
function iceTruckNewDay() { S.t4.truck = seasonOf() === 'summer' || (seasonOf() === 'spring' && S.weather === 'hot') ? (Math.random() < 0.5 ? 14 + Math.floor(Math.random() * 4) : null) : null; }
function iceTruckHere() { return S.t4.truck && S.hour >= S.t4.truck && S.hour < S.t4.truck + 1 && S.weather !== 'rainy'; }
function iceTruckChip() { return iceTruckHere() && S.loc === 'home' ? '<button class="chip warn" onclick="iceTruckCard_open()">🎵 Ding-ding! The ice cream truck is on your street! (tap)</button>' : ''; }
function iceTruckCard_open() {
  showModal(`<h2>🍦 The Ice Cream Truck!</h2><p>🎵 You hear the music and run outside. What do you want?</p><div class="grid actions">${[['🍦', 'Soft-serve cone', 3], ['🍫', 'Ice cream sandwich', 2], ['🍧', 'Rocket pop', 2], ['🍨', 'Sundae cup', 4]].map(t => `<button class="action" onclick="closeModal();iceTruckBuy('${t[1]}',${t[2]})"><span class="ic">${t[0]}</span><b>${t[1]}</b><small>${money(t[2])}</small></button>`).join('')}</div>`, [{ label: 'No thanks', cls: 'ghost' }]);
}
function iceTruckBuy(name, p) { if (!spend(p, name)) return; pass(0.2, 'relax'); fun2(12); ateFood(8); S.needs.thirst = clamp(S.needs.thirst + 8); log(`🍦 You got a ${name.toLowerCase()} from the ice cream truck. It dripped down your hand — so good!`, 'good'); done(); }
function drawIceTruck(c, t) {
  if (!S || !iceTruckHere()) return;
  const hp = PLACES[HOME_PLACE[S.home]]; if (!hp) return;
  const x = hp.r[0] + 20 + Math.sin(t / 4000) * 30, y = hp.r[1] + hp.r[3] + 14;
  c.fillStyle = '#fff'; c.fillRect(x, y - 10, 26, 12); c.fillStyle = '#f48fb1'; c.fillRect(x, y - 4, 26, 3); c.fillStyle = '#90caf9'; c.fillRect(x + 19, y - 8, 6, 4);
  c.fillStyle = '#222'; c.beginPath(); c.arc(x + 6, y + 2, 2.5, 0, Math.PI * 2); c.arc(x + 20, y + 2, 2.5, 0, Math.PI * 2); c.fill();
  c.font = '9px system-ui, "Apple Color Emoji", "Segoe UI Emoji"'; c.fillText('🍦', x + 6, y - 12);
}

// ---------- 21. car show ----------
function carShowCard() {
  const on = weekday() === 6 && Math.ceil(dateOf().d / 7) === 2 && ['summer', 'spring'].includes(seasonOf()) && S.hour >= 10 && S.hour < 16;
  return `<div class="card"><h3>🚗 Classic Car Show <span class="muted small">· 2nd Sunday in spring & summer, 10 AM – 4 PM</span></h3>${on ? `<div class="row"><button class="btn sm primary" onclick="carShow(false)">👀 Look at the cars (free)</button>${hasCar() ? '<button class="btn sm ghost" onclick="carShow(true)">🏆 Enter your car ($10)</button>' : ''}</div>` : '<p class="muted">Not today. Shiny old cars, race cars and fire trucks come to the park!</p>'}</div>`;
}
function carShow(enter) {
  if (enter && !spend(10, 'Car show entry')) return;
  pass(1.5, 'relax'); fun2(14); addSkill('build', 0.5);
  const fav = pickR(['a shiny red 1957 convertible', 'an old fire truck with a brass bell', 'a tiny 1960s bubble car', 'a race car with stripes', 'a 1930s car with big round headlights']);
  if (!enter) return log(`🚗 Car show: your favorite was ${fav}! You voted for it in "People's Choice."`, 'good'), done();
  const clean = S.car && S.car.dirty < 30, win = clean && Math.random() < 0.4;
  if (win) earn(50, 'Car show prize');
  log(win ? `🏆 Your sparkling-clean car won "Best Shine" at the car show! $50 prize!` : clean ? '🚗 Your car looked great, but the judges picked a classic car this time.' : '🚗 The judges said your car was a little dirty. Wash it before the next show!', win ? 'good' : '');
  done();
}

// ---------- 22. visiting sick kids at the hospital ----------
function hospitalVisitCard() {
  return `<div class="card"><h3>💌 Visit Kids in the Hospital</h3><p>Bring homemade cards and cheer up kids who are sick. ${S.m2 && S.m2.crafts.card && S.m2.crafts.card.n ? `You have ${S.m2.crafts.card.n} cards you made.` : 'You can make greeting cards at home (Craft Table), or draw some here.'}</p><button class="btn sm primary" onclick="visitKids()">💌 Visit (1 hr)</button></div>`;
}
function visitKids() {
  if (S.hour < 10 || S.hour > 18) return nope('Visiting hours are 10 AM – 6 PM.');
  pass(1, 'relax');
  const cards = S.m2 && S.m2.crafts.card && S.m2.crafts.card.n ? Math.min(3, S.m2.crafts.card.n) : 0;
  if (cards) S.m2.crafts.card.n -= cards;
  S.volunteerHours = (S.volunteerHours || 0) + 1; addSkill('comm', 1); fun2(15);
  log(`💌 You visited kids at the hospital${cards ? ` and gave them ${cards} cards you made` : ' and drew pictures with them'}. A little girl named ${pickR(['Mia', 'Sofia', 'Ava', 'Lily'])} said it was the best part of her week! ❤️`, 'good');
  done();
}

// ---------- 24. mini golf ----------
function minigolfCard() { return `<div class="card"><h3>⛳ Mini Golf <span class="muted small">· $10 · 9 holes</span></h3><p>Best score: <b>${S.t4.golfBest || '—'}</b> (par 27 — lower is better!)</p><button class="btn primary" onclick="startGolf()">⛳ Play 9 holes</button></div>`; }
const HOLES = ['a windmill 🌬️', 'a ramp', 'a loop-de-loop', 'a little bridge', 'a castle', 'a pirate ship 🏴‍☠️', 'a twisty tunnel', 'a waterfall', 'a giant clown mouth 🤡'];
function startGolf() { if (!spend(10, 'Mini golf')) return; S.t4.golf = { hole: 0, strokes: 0 }; golfHole(); }
function golfHole() {
  const G = S.t4.golf;
  if (G.hole >= 9) { pass(1.2, 'relax'); fun2(20); S.t4.golfBest = S.t4.golfBest ? Math.min(S.t4.golfBest, G.strokes) : G.strokes; log(`⛳ You finished mini golf with ${G.strokes} strokes (par 27). ${G.strokes <= 27 ? 'Under par — awesome! 🏆' : 'Fun game!'}`, 'good'); S.t4.golf = null; return done(); }
  showModal(`<h2>⛳ Hole ${G.hole + 1}: ${HOLES[G.hole]}</h2><p>Strokes so far: ${G.strokes}. How hard do you putt?</p><div class="grid actions">${[['🐢', 'Soft', 0], ['👌', 'Just right', 1], ['💥', 'Hard', 2]].map(p => `<button class="action" onclick="golfPutt(${p[2]})"><span class="ic">${p[0]}</span><b>${p[1]}</b></button>`).join('')}</div>`, []);
}
function golfPutt(power) {
  const G = S.t4.golf, good = power === 1 ? 0.28 + S.skills.fit / 400 : 0.12;
  const strokes = Math.random() < 0.06 + (power === 1 ? 0.06 : 0) ? 1 : Math.random() < good ? 2 : Math.random() < 0.6 ? 3 : 4 + Math.floor(Math.random() * 2);
  G.strokes += strokes; G.hole++;
  toast(strokes === 1 ? '⛳ HOLE IN ONE! 🎉' : `⛳ ${strokes} strokes`);
  golfHole();
}

// ---------- 25. water park ----------
function waterparkCard() {
  const open = seasonOf() === 'summer';
  return `<div class="card"><h3>🌊 Splash Water Park <span class="muted small">· ${open ? '$25 · open 10 AM – 6 PM' : 'closed until summer'}</span></h3>${open ? `<div class="grid actions">${[['🌀', 'Twister slide', 'big', 'You zoomed down the twisty slide and SPLASHED into the pool!'], ['🛟', 'Lazy river', 'easy', 'You floated around the lazy river on a tube. So relaxing!'], ['🌊', 'Wave pool', 'mid', 'Big waves knocked you over and you laughed every time!'], ['🪣', 'Giant tipping bucket', 'easy', 'The giant bucket tipped and dumped 500 gallons on everyone!']].map(r => `<button class="action" onclick="waterRide('${r[1]}','${r[2]}','${r[3].replace(/'/g, '\\u2019')}')"><span class="ic">${r[0]}</span><b>${r[1]}</b><small>${r[2] === 'big' ? 'needs swim level 2' : 'all swimmers'}</small></button>`).join('')}</div>` : '<p class="muted">See you in summer! ☀️</p>'}</div>`;
}
function waterRide(name, kind, msg) {
  if (seasonOf() !== 'summer') return nope('The water park is closed until summer.');
  if (S.t4.wpDay !== S.day) { if (!spend(25, 'Water park ticket')) return; S.t4.wpDay = S.day; }
  if (kind === 'big' && (!S.hob || S.hob.swim < 2)) return nope('The lifeguard says you need swim level 2 for the big slides. Take swim lessons at the Sports Park!');
  pass(0.75, 'relax'); fun2(18); S.needs.hygiene = clamp(S.needs.hygiene - 5); S.needs.thirst = clamp(S.needs.thirst - 8);
  log(`🌊 ${name}: ${msg}`, 'good'); done();
}

// ---------- 30. family camping trip ----------
function familyCampCard() {
  return `<div class="card"><h3>⛺ Family Camping Trip</h3><p>Bring Mom, Dad, Grandma and your brother and sister for a night under the stars! (Spring, summer or fall · starts 3–6 PM · $25 campsite)</p><button class="btn sm primary" onclick="familyCamp()">⛺ Go camping with family</button></div>`;
}
function familyCamp() {
  if (seasonOf() === 'winter') return nope('Too cold to camp in winter!');
  if (S.hour < 15 || S.hour > 18) return nope('Start your camping trip between 3 and 6 PM.');
  if (!spend(25, 'Family campsite')) return;
  pass(1, 'awake');
  const steps = ['⛺ You and Dad set up the tent (it took 3 tries!)', `🎣 You went fishing with ${S.family.bro ? S.family.bro.name : 'your brother'} and caught a ${pickR(['sunfish', 'little trout', 'boot (just kidding!)'])}`, '🔥 Mom built a campfire and you all made s\'mores', `✨ Grandma pointed out the Big Dipper and told stories about when she was little`, '🦉 You fell asleep listening to owls and crickets'];
  const h = 31 - S.hour; pass(Math.max(1, h - 1), 'sleep');
  Object.values(S.family).forEach(m => m.rel = clamp(m.rel + 15)); fun2(35); ateFood(40);
  addPhoto('⛺', 'Family camping trip');
  queueModal(`<h2>⛺ Family Camping Trip!</h2><ul class="notes">${steps.map(s => `<li>${s}</li>`).join('')}</ul>`);
  log('⛺ You went camping with your whole family. A night to remember!', 'good'); done();
}

// ---------- 31. stargazing ----------
const SKY = [['🌕', 'The full Moon', 'You can see craters on the Moon!'], ['🪐', 'Saturn', 'You could see Saturn\'s rings through the telescope!'], ['🟠', 'Jupiter', 'You spotted 4 of Jupiter\'s moons as tiny dots!'], ['🔴', 'Mars', 'Mars looks red because of rusty dust.'], ['✨', 'The Big Dipper', 'It looks like a giant spoon in the sky.'], ['🏹', 'Orion the Hunter', 'Look for the 3 stars in a row — Orion\'s belt!'], ['☄️', 'A shooting star', 'Make a wish! (It\'s really a tiny space rock burning up.)'], ['🌌', 'The Milky Way', 'That fuzzy band of light is billions of stars — our galaxy!'], ['⭐', 'The North Star', 'It always points north. Sailors used it to find their way.']];
function stargaze() {
  if (!has('telescope')) return nope('You need a telescope! Buy one at the Mall (Electronics).');
  if (S.hour >= 5 && S.hour < 20.5) return nope('Wait until it\'s dark (after 8:30 PM).');
  if (['rainy', 'cloudy', 'snowy'].includes(S.weather)) return nope('Too cloudy to see the stars tonight.');
  const dark = ['campground', 'trailhead', 'lake'].includes(placeId(S.loc));
  pass(1, 'relax'); fun2(12); addSkill('sci', 1.5);
  const seen = SKY.filter(s => !S.t4.sky.includes(s[1]));
  const s = (dark && seen.length ? pickR(seen) : pickR(SKY));
  if (!S.t4.sky.includes(s[1])) { S.t4.sky.push(s[1]); if (S.t4.sky.length >= 8) unlock('stargazer'); }
  log(`🔭 ${s[0]} ${s[1]}! ${s[2]}${dark ? ' (It\'s extra dark out here — you can see so many stars!)' : ''} (${S.t4.sky.length}/${SKY.length} found)`, 'good'); done();
}

// ---------- 33. more countries & passports ----------
const NEW_DESTS = [
  { id: 'mexico', name: 'Mexico City, Mexico', icon: '🇲🇽', price: 500, days: 4, facts: ['You climbed a giant ancient pyramid at Teotihuacán!', 'You ate real tacos al pastor from a street stand.', 'Mexico City was built on top of a lake long ago.'] },
  { id: 'canada', name: 'Toronto & Niagara Falls, Canada', icon: '🇨🇦', price: 450, days: 3, facts: ['You rode a boat right up to Niagara Falls and got soaked!', 'You tried poutine: fries with gravy and cheese curds.', 'Canada has more lakes than the rest of the world combined!'] },
  { id: 'london', name: 'London, England', icon: '🇬🇧', price: 850, days: 5, facts: ['You heard Big Ben\'s bell ring!', 'You watched the Changing of the Guard at Buckingham Palace.', 'You rode a red double-decker bus.'] },
  { id: 'rome', name: 'Rome, Italy', icon: '🇮🇹', price: 900, days: 5, facts: ['You stood inside the Colosseum — almost 2,000 years old!', 'You threw a coin in the Trevi Fountain for good luck.', 'You ate gelato every single day. 🍨'] },
  { id: 'egypt', name: 'Cairo, Egypt', icon: '🇪🇬', price: 1000, days: 6, facts: ['You saw the Great Pyramids and the Sphinx!', 'The Great Pyramid was the tallest building in the world for almost 4,000 years.', 'You rode a camel in the desert. 🐪'] },
];
NEW_DESTS.forEach(d => { if (!DESTS.some(x => x.id === d.id)) DESTS.push(d); });
Object.assign(TZ, { mexico: 0, canada: 1, london: 6, rome: 7, egypt: 8 });
if (typeof LANG_OF !== 'undefined') LANG_OF.mexico = 'spanish';
const INTERNATIONAL = ['paris', 'tokyo', 'kenya', 'mexico', 'canada', 'london', 'rome', 'egypt'];
const _bookTrip4 = bookTrip;
bookTrip = function (id) {
  if (INTERNATIONAL.includes(id) && !(S.t4.passport && S.day >= S.t4.passport)) return nope(S.t4.passport ? `Your passport isn't here yet. It arrives on ${dateText(S.t4.passport)}.` : '🛂 You need a passport to visit another country! Apply for one at the 📮 Post Office.');
  return _bookTrip4(id);
};
const _goOnTrip4 = goOnTrip;
goOnTrip = function (d, sec) { const r = _goOnTrip4(d, sec); addPhoto(d.icon, `Trip to ${d.name}`); return r; };
function passportCard() {
  const P = S.t4.passport;
  return `<div class="card"><h3>🛂 Passport</h3><p>${P ? (S.day >= P ? '✅ You have a passport! You can fly to other countries.' : `Your passport is being made. It arrives ${dateText(P)}.`) : 'You need a passport to travel to other countries. It costs $130 and takes 2 weeks to arrive.'}</p>${P ? '' : '<button class="btn sm primary" onclick="applyPassport()">🛂 Apply for a passport ($130)</button>'}</div>`;
}
function applyPassport() {
  if (!spend(130, 'Passport application')) return;
  pass(1); S.t4.passport = S.day + 14;
  log('📸 You filled out the form, got your passport photo taken (no smiling allowed!) and mailed it. Your passport arrives in 2 weeks.', 'good'); done();
}

// ---------- 34. beach tides, tide pools & seashells ----------
function tideNow() { const phase = ((S.day * 0.8 + S.hour / 12.4) % 1); return phase < 0.25 || phase > 0.75 ? 'low' : 'high'; }
const SHELLS = [['🐚', 'Conch shell'], ['🦪', 'Oyster shell'], ['🌀', 'Moon snail shell'], ['🪸', 'Sand dollar'], ['🐚', 'Scallop shell'], ['🦀', 'Hermit crab (you put it back!)'], ['⭐', 'Starfish (you put it back!)'], ['🟢', 'Sea glass']];
function tideCard() {
  const low = tideNow() === 'low';
  return `<div class="card"><h3>🌊 The Tide is ${low ? 'LOW' : 'HIGH'}</h3><p>${low ? 'The water pulled way back! Tide pools are showing on the rocks — look for crabs and starfish.' : 'The water is up high on the beach. Sandcastles near the water will get washed away!'}</p>
    <div class="row"><button class="btn sm primary" ${low ? '' : 'disabled'} onclick="tidePool()">🦀 Explore the tide pools</button><button class="btn sm ghost" onclick="shellHunt()">🐚 Look for seashells</button></div>
    ${S.t4.shells.length ? `<p class="muted small">Your shell collection: ${S.t4.shells.map(s => SHELLS.find(x => x[1] === s)[0]).join(' ')} (${S.t4.shells.length}/${SHELLS.length})</p>` : ''}
    <p class="lesson">💡 Tides are caused by the Moon pulling on the ocean! The tide goes in and out about twice a day.</p></div>`;
}
function tidePool() { if (tideNow() !== 'low') return nope('Wait for low tide!'); pass(0.75, 'relax'); fun2(12); addSkill('sci', 1); const a = pickR([['🦀', 'Shore crab'], ['⭐', 'Sea star'], ['🌺', 'Sea anemone'], ['🐌', 'Sea snail'], ['🐟', 'Tiny tide pool fish']]); if (typeof journalAdd === 'function') journalAdd(...a); log(`🦀 In the tide pools you found a ${a[1].toLowerCase()}! You looked closely, then left it right where it lives.`, 'good'); done(); }
function shellHunt() { pass(0.5, 'relax'); fun2(8); const s = pickR(SHELLS); if (!S.t4.shells.includes(s[1])) { S.t4.shells.push(s[1]); log(`🐚 You found a ${s[1].toLowerCase()}! New for your collection.`, 'good'); } else log(`🐚 You found another ${s[1].toLowerCase()}.`); done(); }

// ---------- 35. nature walks with real plants ----------
const PLANTS = {
  park: [['🌳', 'Red maple tree', 'Its leaves turn bright red in fall.'], ['🌼', 'Dandelion', 'Blow on the fluffy seeds and they fly away!'], ['🌳', 'White oak tree', 'Acorns grow on oak trees — squirrels love them!'], ['🍀', 'Clover', 'Finding a four-leaf clover is rare and lucky!']],
  campground: [['🌲', 'White pine', 'Its needles grow in bunches of five.'], ['🌿', 'Fern', 'Ferns are older than dinosaurs and have no flowers!'], ['🍄', 'Mushroom (don\'t touch or eat!)', 'Some wild mushrooms are poisonous. Look, don\'t touch!'], ['🍃', 'Poison ivy', '"Leaves of three, let it be!" It makes you itchy.']],
  trailhead: [['🌲', 'Blue spruce', 'A tall tree with bluish needles that loves cold mountains.'], ['🌸', 'Wildflowers', 'Mountain flowers bloom fast in the short summer.'], ['🪨', 'Moss', 'Moss soaks up water like a sponge.']],
  lake: [['🌾', 'Cattails', 'Ducks and birds hide and nest in cattails.'], ['🪷', 'Water lily', 'Its big leaves float on top of the water.'], ['🌳', 'Weeping willow', 'Its long branches droop down toward the water.']],
};
function natureWalkCard(pid) {
  if (!PLANTS[pid]) return '';
  return `<div class="card"><h3>🌿 Nature Walk</h3><p class="muted">Learn the names of real plants and trees. You've found ${S.t4.plants.length} kinds.</p><button class="btn sm primary" onclick="natureWalk()">🥾 Go for a nature walk (1 hr)</button></div>`;
}
function natureWalk() {
  const list = PLANTS[placeId(S.loc)]; if (!list) return;
  pass(1, 'relax'); fun2(8); addSkill('sci', 1); addSkill('fit', 0.5);
  const fresh = list.filter(p => !S.t4.plants.includes(p[1])), p = fresh.length ? pickR(fresh) : pickR(list);
  if (!S.t4.plants.includes(p[1])) { S.t4.plants.push(p[1]); if (S.t4.plants.length >= 10) unlock('botanist'); }
  log(`${p[0]} You found ${p[1].toLowerCase()}! ${p[2]}`, 'good'); done();
}

function town4NewDay() { ensureTown4State(); iceTruckNewDay(); }
function town4Cards(pid, isHome) {
  ensureTown4State();
  let out = '';
  if (pid === 'farm') out += horseCard() + farmChoreCard();
  if (pid === 'zoo') out += aquariumCard();
  if (pid === 'bowling') out += bowlingCard();
  if (pid === 'rink') out += rinkCard();
  if (pid === 'minigolf') out += minigolfCard();
  if (pid === 'waterpark') out += waterparkCard();
  if (pid === 'park') out += carShowCard();
  if (pid === 'hospital') out += hospitalVisitCard();
  if (pid === 'campground') out += familyCampCard();
  if (pid === 'postoffice') out += passportCard();
  if (pid === 'beach') out += tideCard();
  if (pid === 'vet') out += petCareCard(true);
  if (pid === 'library') out += libraryClubCard();
  if (pid === 'h_parents' && !isHome) out += `<div class="card"><h3>👵 Bake with Grandma</h3><p>Learn Grandma's secret family recipes!</p><button class="btn sm primary" onclick="bakeWithGrandma()">🍪 Bake together (2 hrs)</button></div>`;
  out += natureWalkCard(pid);
  if (has('telescope') && ['campground', 'trailhead', 'lake'].includes(pid)) out += '<div class="card"><h3>🔭 Stargazing</h3><p class="muted">It\'s extra dark out here — perfect for stars! (after 8:30 PM)</p><button class="btn sm primary" onclick="stargaze()">🔭 Look at the sky</button></div>';
  return out;
}
function homeCards4() {
  ensureTown4State();
  return wisdomCard() + bikeCard() + tankCard() + gardenClubCard() + petCareCard(false) + modelCard() + lifeSkillsCard() + photoWallCard()
    + `<div class="card"><h3>✨ More Things to Do</h3><div class="row">
      <button class="btn sm ghost" onclick="dressModal()">👕 Get dressed</button>
      <button class="btn sm ghost" onclick="sleepover()">🛏️ Sleepover (5–9 PM)</button>
      <button class="btn sm ghost" onclick="scienceKit()">🔬 Science experiment</button>
      <button class="btn sm ghost" onclick="packLunch()">🥪 Pack a lunch</button>
      ${has('telescope') ? '<button class="btn sm ghost" onclick="stargaze()">🔭 Stargaze</button>' : ''}
      ${S.home !== 'parents' ? '' : '<button class="btn sm ghost" onclick="bakeWithGrandma()">🍪 Bake with Grandma</button>'}
    </div></div>`;
}

// ---------- hooking into the rest of the game ----------
// you can only ride your bike around town after you learn how
const _transportFor4 = transportFor;
transportFor = function (len) {
  const noBike = S && has('bike') && !canDrive(len) && ((S.l4 && S.l4.bike < 3) || len > 2500);
  if (noBike) { S.owned.bike = false; const r = _transportFor4(len); S.owned.bike = true; return r; }
  return _transportFor4(len);
};
// new things to buy
const _toyBuy4 = toyBuy;
toyBuy = function (id) {
  if (id === 'sciencekit') { ensureLife4State(); S.l4.kits += 3; log('🔬 You bought a science kit with goggles and supplies for 3 experiments!'); return true; }
  if (id === 'modelkit') { ensureLife4State(); if (S.l4.model) { earn(25, 'Refund'); nope('Finish the model you\'re building first!'); return true; } const k = pickR(Object.keys(MODELS)); S.l4.model = { k, step: 0 }; log(`🛠️ You bought a ${MODELS[k][1].toLowerCase()} kit! Build it at home.`); return true; }
  return _toyBuy4(id);
};
ITEMS.push({ id: 'sciencekit', place: 'mall', cat: 'Toys', name: 'Science Experiment Kit', icon: '🔬', price: 15, consumable: true, desc: 'Goggles and supplies for 3 experiments: volcanoes, crystals, slime and more!' });
ITEMS.push({ id: 'modelkit', place: 'mall', cat: 'Toys', name: 'Model Kit', icon: '🛠️', price: 25, consumable: true, desc: 'Build a model car, airplane, boat, rocket or train.' });
ITEMS.push({ id: 'telescope', place: 'mall', cat: 'Electronics', name: 'Telescope', icon: '🔭', price: 150, desc: 'See the Moon\'s craters, Saturn\'s rings and more on clear nights.' });
ITEMS.push({ id: 'raincoat', place: 'mall', cat: 'Clothes', name: 'Raincoat & Rain Boots', icon: '🧥', price: 35, desc: 'Stay dry on rainy days. Get dressed in it before you go out!' });
PANTRY.cookies = { name: 'Cookies', icon: '🍪', food: 10, fun: 6, health: -1 };
ACHIEVEMENTS.push({ id: 'biker', icon: '🚲', name: 'Look, No Training Wheels!', desc: 'Learn to ride your bike.' }, { id: 'rider', icon: '🐴', name: 'Horse Rider', desc: 'Jump a fence on a horse.' }, { id: 'stargazer', icon: '🔭', name: 'Stargazer', desc: 'Find 8 things in the night sky.' }, { id: 'botanist', icon: '🌿', name: 'Plant Expert', desc: 'Learn 10 kinds of plants.' });
// counting change after you buy something in a store
const _buy4 = buy;
buy = function (id) {
  const before = S.money, it = ITEMS.find(i => i.id === id);
  _buy4(id);
  const spent = Math.round((before - S.money) * 100) / 100;
  if (spent > 0 && it && ['mall', 'cars', 'market', 'diner'].includes(it.place)) { ensureLife4State(); changeQuiz(spent); nextModal(); }
};
