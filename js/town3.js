// ===================== TOWN 3: fire & police tours, museum, farmers' market, marching in the parade, road work, storm warnings,
// teen jobs, job references, sales tax, charity, time zones & jet lag, learning languages =====================

function ensureTown3State() {
  if (!S.t3) S.t3 = { tours: [], facts: [], refs: [], donated: {}, langs: {}, jetlag: 0, paradeRole: null, teen: {} };
  ensureHobbyState(); ensureHome3State();
}

// ---------- 18. fire station & police station tours ----------
PLACES.firestation.kind = 'place';
PLACES.firestation.blurb = 'Take a tour and learn how firefighters keep everyone safe.';
Object.assign(PLACES, {
  police:  { kind: 'place', far: true, shop: true, town: 'maple', name: 'Police Station', icon: '👮', r: [2220, 414, 180, 140], door: [2310, 414], blurb: 'Take a tour and meet the police officers and their K-9 dog.' },
  museum:  { kind: 'place', far: true, shop: true, town: 'maple', name: 'Maple Museum', icon: '🏛️', r: [2200, 226, 220, 150], door: [2310, 386], blurb: 'Dinosaurs, space, art and history!' },
});
Object.assign(ENTRANCE, {
  police: { facade: 'brick', wall: '#cfd8dc', door: 'double', doorCol: '#0d47a1', signBg: '#0d47a1', signFg: '#fff', hours: [0, 24], inside: '#eef2f5', keeper: true },
  museum: { facade: 'stone', wall: '#efe9dc', door: 'double', doorCol: '#5d4037', signBg: '#5d4037', signFg: '#fff', hours: [9, 17], inside: '#f5f1e8', keeper: true },
});
INTERIORS.police = c => {
  iWall(c, '#eef2f5'); iFloor(c, 'tile', ['#cfd8dc']); iLights(c, 'strip', [250, 750]);
  iCounter(c, 300, 190, 400, 78, '#0d47a1', { register: 600, mat: 'solid' });
  iSign(c, 340, 40, 320, 30, '#0d47a1', '#fff', '👮 MAPLE POLICE · HERE TO HELP', 13);
  box3d(c, 60, 120, 150, 148, 0.04, '#90a4ae', 'metal'); iSign(c, 70, 100, 130, 20, '#263238', '#fff', 'LOST & FOUND', 10);
  drawPerson(c, 820, 262, 2, { skin: '#c4885a', hair: '#141414', style: 'buzz', shirt: '#1a3a6b', pants: '#1e1e1e' });
};
INTERIORS.museum = c => {
  iWall(c, '#f5f1e8'); iFloor(c, 'marble', ['#e7e1d3']); iLights(c, 'spot', [200, 500, 800]);
  c.strokeStyle = '#a8916a'; c.lineWidth = 8; c.lineCap = 'round';           // a big dinosaur skeleton
  const bones = [[120, 200, 200, 150], [200, 150, 300, 140], [300, 140, 380, 170], [380, 170, 420, 230], [200, 150, 180, 90], [180, 90, 150, 70], [230, 150, 220, 262], [320, 150, 330, 262]];
  bones.forEach(([a, b2, c2, d]) => { c.beginPath(); c.moveTo(a, b2); c.lineTo(c2, d); c.stroke(); });
  for (let k = 0; k < 8; k++) { c.beginPath(); c.moveTo(210 + k * 12, 148); c.quadraticCurveTo(215 + k * 12, 175, 205 + k * 12, 195); c.stroke(); }
  c.fillStyle = '#a8916a'; c.beginPath(); c.ellipse(140, 66, 26, 16, -0.3, 0, Math.PI * 2); c.fill(); fillR(c, 100, 262, 340, 8, '#5d4037', 2); c.fillStyle = '#333'; c.beginPath(); c.arc(132, 62, 3, 0, Math.PI * 2); c.fill();
  [[560, 70, '#1a237e'], [700, 70, '#2e7d32'], [840, 70, '#b71c1c']].forEach(([x, y, col]) => { fillR(c, x, y, 100, 80, '#8d6e63', 3); fillR(c, x + 6, y + 6, 88, 68, col, 2); circ(c, x + 50, y + 40, 18, 'rgba(255,255,255,.4)'); });
  iSign(c, 560, 170, 380, 26, '#5d4037', '#fff', '🦕 DINOSAURS · 🚀 SPACE · 🎨 ART', 12);
};
const TOURS = {
  firestation: { name: 'Fire Station', icon: '🚒', facts: ['Firefighters can get dressed in their gear in about 1 minute!', 'The fire truck carries 500 gallons of water.', 'Firefighters check smoke detectors and teach fire safety at schools.', 'Their gear weighs about 45 pounds — like carrying a big dog!'], perk: 'You got to sit in the fire truck and ring the bell! 🔔' },
  police:      { name: 'Police Station', icon: '👮', facts: ['Police officers help people every day — like finding lost kids and pets.', 'The K-9 dog, Ranger, can smell things 10,000 times better than you!', 'If you\'re ever lost, find a police officer or a mom with kids to help you.', 'Call 911 only for real emergencies.'], perk: 'You met Ranger the K-9 dog and got a junior officer sticker! ⭐' },
};
function tourCard(pid) {
  const T = TOURS[pid]; if (!T) return '';
  return `<div class="card"><h3>${T.icon} ${T.name} Tour</h3><p>Free tours every day from 10 AM to 4 PM. Learn what they do to keep our town safe!</p><button class="btn primary" onclick="takeTour('${pid}')">🚶 Take the tour (1 hr)</button>${pid === 'police' ? '<p class="muted small">🔎 Lost something? Ask at the Lost & Found desk.</p>' + (S.lost ? '<button class="btn sm ghost" onclick="askLostFound()">Ask the Lost & Found</button>' : '') : ''}</div>`;
}
function takeTour(pid) {
  if (S.hour < 10 || S.hour > 16) return nope('Tours are from 10 AM to 4 PM.');
  const T = TOURS[pid]; pass(1, 'relax'); fun2(12); addSkill('aid', 0.8);
  const first = !S.t3.tours.includes(pid); if (first) S.t3.tours.push(pid);
  queueModal(`<h2>${T.icon} ${T.name} Tour</h2><ul class="notes">${T.facts.map(f => `<li>${f}</li>`).join('')}</ul><p>${T.perk}</p>`);
  log(`${T.icon} You took a tour of the ${T.name}! ${T.perk}`, 'good');
  if (S.t3.tours.length >= 2) unlock('helpers'); done();
}
function askLostFound() { if (!S.lost) return; pass(0.25); if (Math.random() < 0.5) { log(`👮 "Is this yours?" Someone turned in your ${LOSTABLE[S.lost.what][1]}! You got it back.`, 'good'); S.lost = null; } else log('👮 Nobody has turned it in yet. Keep looking at home, and check back later!'); done(); }

// ---------- 19. the museum ----------
const EXHIBITS = {
  dino:    ['🦕', 'Dinosaur Hall', 'sci', ['T. rex had teeth as long as bananas!', 'Some dinosaurs had feathers, like birds.', 'Dinosaurs lived over 65 million years ago.', 'The longest dinosaur was as long as 3 school buses!']],
  space:   ['🚀', 'Space Gallery', 'sci', ['A day on Venus is longer than its year!', 'The Moon is slowly moving away from Earth.', 'Astronauts grow a little taller in space.', 'Jupiter could fit 1,300 Earths inside it!']],
  art:     ['🎨', 'Art Gallery', 'art', ['Some famous painters only sold one painting in their whole life.', 'Artists mix just 3 colors — red, yellow and blue — to make almost any color.', 'Mosaics are pictures made of tiny tiles.', 'People have been painting on cave walls for 40,000 years!']],
  history: ['🏰', 'Town History', 'write', ['Maple Town started as a tiny farm village by the river.', 'The first school here had just one room for all the kids!', 'People used to send messages with horses — now we text!', 'The town clock tower is over 100 years old.']],
};
function viewMuseum() {
  const free = weekday() === 6 && dateOf().d <= 7;
  return `<p>Tickets: ${free ? '<b>FREE today</b> (1st Sunday of the month!)' : money(10)} · open 9 AM – 5 PM</p>
    <div class="grid actions">${Object.entries(EXHIBITS).map(([k, e]) => `<button class="action" onclick="visitExhibit('${k}')"><span class="ic">${e[0]}</span><b>${e[1]}</b><small>1 hr · ${SKILLS[e[2]].name}</small></button>`).join('')}</div>
    ${S.t3.facts.length ? `<div class="card"><h3>🧠 Facts you learned (${S.t3.facts.length})</h3><ul class="notes">${S.t3.facts.slice(-6).map(f => `<li>${f}</li>`).join('')}</ul></div>` : ''}`;
}
function visitExhibit(k) {
  const e = EXHIBITS[k], free = weekday() === 6 && dateOf().d <= 7;
  if (S.t3.museumDay !== S.day) { if (!free && !spend(10, 'Museum ticket')) return; S.t3.museumDay = S.day; }
  pass(1, 'relax'); fun2(10); addSkill(e[2], 1.8);
  const fact = e[3].find(f => !S.t3.facts.includes(f)) || pickR(e[3]);
  if (!S.t3.facts.includes(fact)) S.t3.facts.push(fact);
  log(`${e[0]} ${e[1]}: ${fact}`, 'good'); if (S.t3.facts.length >= 10) unlock('smartypants'); done();
}

// ---------- 20. farmers' market (Saturday mornings at the park) ----------
const FARM_STALLS = [['🍯', 'Local honey', 8, 'Sweet and made by bees right here!'], ['💐', 'Fresh flowers', 10, 'Makes your home happy'], ['🍓', 'Fresh berries', 6, 'Picked this morning'], ['🥖', 'Homemade bread', 5, 'Still warm!'], ['🥚', 'Farm eggs', 6, 'From happy chickens']];
function farmersMarketCard() {
  if (!(isSat() && S.hour >= 8 && S.hour < 13)) return '<div class="card"><h3>🥕 Farmers\' Market</h3><p class="muted">Every Saturday 8 AM – 1 PM here at the park: fresh food from local farms, and you can sell your garden veggies!</p></div>';
  return `<div class="card money holiday"><h3>🥕 Farmers' Market — open now!</h3><div class="mrows">${FARM_STALLS.map((s, i) => mrow(s[0], s[1], `${money(s[2])} · ${s[3]}`, b('Buy', `farmBuy(${i})`))).join('')}
    ${mrow('🧺', 'Sell your garden veggies', `You have ${S.inv.veggies} · farmers' market pays $2 each`, b('Sell', 'farmSell()', 'primary', !S.inv.veggies))}</div>
    <p class="lesson">💡 Buying local helps farmers in your town, and the food is super fresh!</p></div>`;
}
function farmBuy(i) {
  const s = FARM_STALLS[i]; if (!spend(s[2], s[1])) return; pass(0.2, 'relax');
  if (i === 1) { S.vasesDay = S.day; fun2(8); }
  else { const id = { 0: null, 2: 'apples', 3: 'bread', 4: 'eggs' }[i]; if (id) { const f = FOODS[id]; for (let k = 0; k < f.units; k++) S.fridgeFood.push({ id, exp: S.day + f.shelf + 3 }); } else fun2(4); }
  log(`${s[0]} You bought ${s[1].toLowerCase()} at the farmers' market. ${s[3]}`); done();
}
function farmSell() { const n = S.inv.veggies, v = n * 2; pass(1, 'awake'); S.inv.veggies = 0; addSkill('sales', 1.5); sideEarn(v, 'Farmers\' market sales'); log(`🧺 You sold ${n} homegrown veggies at the farmers' market for ${money(v)}!`, 'good'); done(); }

// ---------- 21. marching in the parade ----------
const PARADE_ROLES = { band: ['🎺', 'March in the band', 'Needs Music skill 20'], float: ['🎉', 'Ride on the town float', 'Wave to the crowd!'], banner: ['🚩', 'Carry the big banner', 'Lead the whole parade!'], dog: ['🐕', 'Walk your dog in the pet section', 'Needs a dog'] };
function paradeCard() {
  const ev = eventToday();
  const pr = S.t3.paradeRole;
  return `<div class="card"><h3>🎺 Be in the Parade!</h3><p>The Independence Day Parade is on July 4th. Sign up to be in it!${pr ? ` You signed up to: <b>${PARADE_ROLES[pr][1].toLowerCase()}</b>.` : ''}</p>
    <div class="row">${Object.entries(PARADE_ROLES).map(([k, r]) => b(`${r[0]} ${r[1]}`, `paradeSignup('${k}')`, pr === k ? 'primary' : 'ghost')).join('')}</div>
    ${ev && ev.id === 'parade' && pr ? '<button class="btn primary" onclick="marchParade()">🎺 It\'s parade day — go march!</button>' : ''}</div>`;
}
function paradeSignup(k) {
  if (k === 'band' && S.skills.music < 20) return nope('You need Music skill 20 to march in the band. Take music lessons!');
  if (k === 'dog' && !(S.pets || []).some(p => baseOf(p) === 'dog')) return nope('You need a dog for the pet section!');
  S.t3.paradeRole = k; log(`🎺 You signed up for the parade: ${PARADE_ROLES[k][1].toLowerCase()}!`); done();
}
function marchParade() {
  const ev = eventToday(); if (!ev || ev.id !== 'parade') return nope('The parade is on July 4th!');
  if (S.t3.marched === S.day) return nope('You already marched today!');
  pass(2, 'awake'); S.t3.marched = S.day; fun2(30);
  const k = S.t3.paradeRole;
  log({ band: '🎺 You marched down Main Street playing music with the band. Boom, boom, TA-DA!', float: '🎉 You rode on the giant float and waved to everyone. People cheered and threw confetti!', banner: '🚩 You carried the big banner at the front of the parade. The whole town followed you!', dog: '🐕 Your dog marched in the pet section wearing a little flag bandana. So cute!' }[k], 'good');
  unlock('parade'); done();
}

// ---------- 22. road construction ----------
const ROADWORK_SPOTS = [[330, 400], [740, 400], [520, 170], [520, 620], [1000, 400], [330, 620]];
function roadworkNewDay() {
  if (S.roadwork && S.day > S.roadwork.until) { log('🚧 The road work is finished! The new road is smooth.'); S.roadwork = null; }
  if (!S.roadwork && Math.random() < 0.04) { const sp = pickR(ROADWORK_SPOTS); S.roadwork = { x: sp[0], y: sp[1], until: S.day + 3 + Math.floor(Math.random() * 5) }; log('🚧 Road work! Workers are fixing potholes on a town street. Trips will take a little longer (detour).'); addNews('🚧 Road crews start fixing potholes downtown'); }
}
const _travelInfo3 = travelInfo;
travelInfo = function (from, to) {
  const info = _travelInfo3(from, to);
  if (S && S.roadwork && info.hours > 0.05) { info.hours *= 1.15; info.detour = true; }
  return info;
};
function drawRoadwork(c) {
  const R = S && S.roadwork; if (!R) return;
  const gx = TOWN.x + R.x, gy = TOWN.y + R.y;
  for (let k = -2; k <= 2; k++) { const x = gx + k * 14, y = gy - 10; c.fillStyle = '#ff6f00'; c.beginPath(); c.moveTo(x - 4, y + 8); c.lineTo(x, y - 6); c.lineTo(x + 4, y + 8); c.fill(); c.fillStyle = '#fff'; c.fillRect(x - 2.5, y + 1, 5, 2); }
  c.fillStyle = '#ffb300'; c.fillRect(gx - 22, gy + 4, 44, 7); c.fillStyle = '#222'; for (let k = 0; k < 4; k++) c.fillRect(gx - 20 + k * 11, gy + 4, 5, 7);
}
const _drawSeasonFx3 = drawSeasonFx;
drawSeasonFx = function (c, ...rest) { try { drawRoadwork(c); } catch (e) { } return _drawSeasonFx3(c, ...rest); };

// ---------- 23. tornado & hurricane warnings ----------
function stormWarning() {
  const se = seasonOf();
  const kind = se === 'fall' ? 'hurricane' : 'tornado';
  const alert = has('weatherradio') || has('phone');
  S.t3.warning = { kind, day: S.day };
  queueModal(`<h2>${kind === 'tornado' ? '🌪️ TORNADO WARNING' : '🌀 HURRICANE WARNING'}</h2>
    <p>${alert ? (has('weatherradio') ? '📻 BEEP BEEP BEEP! Your weather radio sounds an alarm.' : '📱 Your phone buzzes loudly with an emergency alert!') : '📢 The town sirens are wailing!'}</p>
    <p>${kind === 'tornado' ? 'A tornado was spotted near Maple Town! What do you do?' : 'A hurricane is coming with strong winds and heavy rain! What do you do?'}</p>
    <div class="grid actions"><button class="action" onclick="closeModal();stormAnswer(true)"><span class="ic">🏠</span><b>${kind === 'tornado' ? 'Go to the basement or a small room with no windows' : 'Stay inside away from windows, with your emergency kit'}</b><small>the safe choice</small></button>
    <button class="action" onclick="closeModal();stormAnswer(false)"><span class="ic">🪟</span><b>Go look out the window</b><small>to see it</small></button></div>`);
}
function stormAnswer(safe) {
  pass(1);
  const kit = has('emergencykit');
  if (safe) { log(`✅ You stayed safe in an inside room${kit ? ' with your emergency kit (water, flashlight, snacks)' : ''} until the storm passed. Smart thinking!`, 'good'); unlock('stormsafe'); }
  else { S.needs.health = clamp(S.needs.health - 12); log('😨 Glass from the window cracked and you got a scratch! NEVER watch a storm through a window — go to a safe inside room.', 'bad'); }
  if (Math.random() < 0.4 && typeof breakSomething === 'function') { S.mess = clamp(S.mess + 15); log('🌳 The storm knocked branches into your yard. Time to clean up!'); }
  if (!kit) log('💡 Tip: keep an emergency kit at home (Mall) with water, food, a flashlight and batteries.');
  done();
}
function warningNewDay() {
  const se = seasonOf();
  if ((se === 'spring' || se === 'summer' || se === 'fall') && Math.random() < 0.006) stormWarning();
}

// ---------- 24. teen & part-time jobs ----------
const TEEN_JOBS = {
  paper:     { icon: '🗞️', name: 'Paper route', where: 'home', hours: [5, 8], len: 1, pay: 14, need: () => true, note: '5–8 AM from home · faster with a bike' },
  dogwalk:   { icon: '🦮', name: 'Dog walking route', where: 'park', hours: [15, 18], len: 1.5, pay: 20, need: () => S.skills.animal >= 10, note: '3–6 PM at the park · needs Animal Care 10' },
  lifeguard: { icon: '🛟', name: 'Lifeguard', where: 'beach', hours: [11, 15], len: 4, pay: 64, need: () => S.hob.swim >= 4 && ['summer', 'spring'].includes(seasonOf()), note: 'Summer, 11 AM–3 PM at the beach · needs swim level 4' },
  counselor: { icon: '🏕️', name: 'Camp counselor', where: 'campground', hours: [9, 12], len: 6, pay: 80, need: () => S.skills.aid >= 15 && seasonOf() === 'summer', note: 'Summer, 9 AM–noon start at the campground · needs First Aid 15' },
};
function teenJobsCard() {
  return `<div class="card money"><h3>🧢 Part-Time & Teen Jobs <span class="muted small">· no interview needed</span></h3><div class="mrows">${Object.entries(TEEN_JOBS).map(([k, t]) => mrow(t.icon, `${t.name} · ${money(t.pay)}`, `${t.note}${S.t3.teen[k] ? ` · done ${S.t3.teen[k]} times` : ''}`, b('How it works', `toast('Go to the ${t.where === 'home' ? 'Home' : PLACES[t.where].name} at the right time and tap the job there!')`, 'ghost'))).join('')}</div></div>`;
}
function teenJobsAt(pid) {
  const here = Object.entries(TEEN_JOBS).filter(([k, t]) => t.where === pid || (pid === 'home' && t.where === 'home'));
  if (!here.length) return '';
  return `<div class="card money"><h3>🧢 Part-Time Work</h3><div class="mrows">${here.map(([k, t]) => mrow(t.icon, `${t.name} · ${money(t.pay)}`, t.note, b('Work', `doTeenJob('${k}')`, 'primary', S.hour < t.hours[0] || S.hour >= t.hours[1] || S.t3.teenDay === S.day + k))).join('')}</div></div>`;
}
function doTeenJob(k) {
  const t = TEEN_JOBS[k];
  if (S.hour < t.hours[0] || S.hour >= t.hours[1]) return nope(`${t.name} happens ${t.note.split('·')[0]}.`);
  if (!t.need()) return nope(`You can't do this yet: ${t.note}.`);
  if (S.t3.teenDay === S.day + k) return nope('You already did that job today!');
  if (S.needs.energy < 20) return nope('Too tired to work.');
  const len = k === 'paper' && has('bike') ? 0.6 : t.len;
  pass(len, 'work'); S.t3.teenDay = S.day + k; S.t3.teen[k] = (S.t3.teen[k] || 0) + 1;
  sideEarn(t.pay, t.name);
  if (k === 'dogwalk') addSkill('animal', 1.5); if (k === 'lifeguard') addSkill('aid', 1.2); if (k === 'counselor') { addSkill('lead', 1.5); addSkill('aid', 1); }
  log(`${t.icon} ${{ paper: 'You tossed newspapers onto 40 porches before sunrise!', dogwalk: 'You walked Biscuit, Ziggy and Moose around the park. Muddy paws everywhere!', lifeguard: 'You watched the swimmers carefully and blew your whistle at kids running on the sand.', counselor: 'You led campers on a nature hike and taught them to tie knots.' }[k]} You earned ${money(t.pay)}.`, 'good');
  done();
}

// ---------- 25. job references ----------
function addReference(job, good) {
  S.t3.refs.push({ job: job.name, good, boss: S.job && S.job.boss ? S.job.boss.name : 'your boss', day: S.day });
  log(good ? `📄 ${S.job && S.job.boss ? S.job.boss.name : 'Your boss'} wrote you a great reference letter: "A hard worker who is always on time!"` : '📄 Your old boss won\'t give you a good reference. Future bosses might ask about this job.', good ? 'good' : 'bad');
}
function quitJob() {
  if (!S.job) return;
  const j = JOBS[S.job.id];
  confirmModal(`Quit your job as <b>${j.name}</b>? You'll get paid for hours you already worked.`, () => {
    const sj = S.job;
    if (sj.weekHours > 0) payday(true);
    if (sj.daysWorked >= 10) addReference(j, sj.goodDays >= sj.daysWorked * 0.4 && sj.warnings < 2);
    else log('📄 You only worked there a short time, so you don\'t have a reference from this job.');
    log(`👋 You quit your job as ${j.name}.`);
    S.job = null;
    done();
  });
}
const _fire3 = fire;
fire = function (reason) { if (S.job && S.job.daysWorked >= 3) addReference(JOBS[S.job.id], false); return _fire3(reason); };
const _interviewExtras3 = interviewExtras;
interviewExtras = function (job, notes) {
  let s = _interviewExtras3(job, notes);
  const good = S.t3.refs.filter(r => r.good).length, bad = S.t3.refs.filter(r => !r.good).length;
  if (good) { s += Math.min(10, good * 5); notes.push(`✅ They called your references. Your old boss said great things about you!`); }
  if (bad) { s -= Math.min(10, bad * 5); notes.push(`⚠️ They called an old boss who said you weren't a good worker.`); }
  const langs = Object.entries(S.t3.langs).filter(([k, v]) => v >= 40);
  if (langs.length) { s += 5; notes.push(`✅ You speak ${langs.map(([k]) => LANGS[k].name).join(' and ')}! Bosses love workers who know more than one language.`); }
  return s;
};
function refsCard() {
  if (!S.t3.refs.length) return '';
  return `<div class="card"><h3>📄 Job References</h3><div class="mrows">${S.t3.refs.map(r => mrow(r.good ? '⭐' : '⚠️', r.job, r.good ? `${r.boss} says you're a great worker` : `${r.boss} wasn't happy with your work`, '')).join('')}</div></div>`;
}

// ---------- 26. sales tax at stores ----------
const SALES_TAX = 0.08;
function withTax(p) { return Math.round(p * (1 + SALES_TAX) * 100) / 100; }
function taxedPlace(it) { return ['mall', 'cars'].includes(it.place); }

// ---------- 27. charity ----------
const CAUSES = {
  trees:   ['🌳', 'Plant Trees Club', 10, 'plants 1 tree', 'trees planted'],
  shelter: ['🐾', 'Animal Shelter', 10, 'feeds 5 shelter pets for a day', 'pet meals'],
  food:    ['🥫', 'Maple Food Bank', 10, 'gives 8 meals to families', 'meals given'],
  books:   ['📚', 'Library Book Drive', 15, 'buys 1 new library book', 'books bought'],
};
function charityCard() {
  const D = S.t3.donated;
  return `<div class="card"><h3>💚 Give to Charity</h3><p class="muted small">See exactly what your money does!</p>
    <div class="mrows">${Object.entries(CAUSES).map(([k, c]) => mrow(c[0], c[1], `${money(c[2])} ${c[3]}${D[k] ? ` · you've helped: ${D[k] * (k === 'shelter' ? 5 : k === 'food' ? 8 : 1)} ${c[4]}` : ''}`, b(`Give ${money(c[2])}`, `donate('${k}')`))).join('')}</div>
    <p class="lesson">💡 Many people give a little of their money to help others. Even small gifts add up!</p></div>`;
}
function donate(k) {
  const c = CAUSES[k]; if (!spend(c[2], `Donation: ${c[1]}`)) return;
  S.t3.donated[k] = (S.t3.donated[k] || 0) + 1; fun2(6);
  const total = Object.entries(S.t3.donated).reduce((t, [kk, n]) => t + n * CAUSES[kk][2], 0);
  log(`💚 You gave ${money(c[2])} to the ${c[1]}. Your gift ${c[3]}! (You've given ${money(total)} total)`, 'good');
  if (total >= 100) unlock('generous');
  if (S.taxYear) S.taxYear.charity = (S.taxYear.charity || 0) + c[2];
  done();
}

// ---------- 29. time zones & jet lag ----------
const TZ = { nyc: 0, grand: -2, orlando: 0, hawaii: -6, paris: 6, tokyo: 13, kenya: 8 };
const _goOnTrip3 = goOnTrip;
goOnTrip = function (d, sec) {
  const tz = TZ[d.id] || 0;
  const r = _goOnTrip3(d, sec);
  if (tz) {
    const there = ((S.hour + tz) % 24 + 24) % 24;
    log(`🕐 Time zones! In ${d.name} the clocks are ${Math.abs(tz)} hours ${tz > 0 ? 'AHEAD of' : 'BEHIND'} Maple Town. When you landed it was ${fmtTime(there)} there.`);
    if (Math.abs(tz) >= 5) { S.t3.jetlag = 2; log('😵 Jet lag! Your body thinks it\'s a different time. You\'ll feel extra tired for a couple of days.', 'bad'); }
  }
  const L = LANG_OF[d.id];
  if (L && (S.t3.langs[L] || 0) >= 20) { fun2(10); log(`🗣️ You used your ${LANGS[L].name} on the trip! You said "${LANGS[L].phrases[1][0]}" and "${LANGS[L].phrases[2][0]}" — the people there smiled big!`, 'good'); }
  return r;
};
function jetlagTick(h, mode) { if (S.t3 && S.t3.jetlag > 0 && mode !== 'sleep') S.needs.energy = clamp(S.needs.energy - 1.2 * h); }

// ---------- 30. learning languages ----------
const LANGS = {
  spanish:  { name: 'Spanish', flag: '🇪🇸', phrases: [['Hola', 'Hello'], ['Gracias', 'Thank you'], ['Por favor', 'Please'], ['¿Cómo estás?', 'How are you?'], ['Me llamo...', 'My name is...'], ['¡Buenos días!', 'Good morning!']] },
  french:   { name: 'French', flag: '🇫🇷', phrases: [['Bonjour', 'Hello'], ['Merci', 'Thank you'], ['S\'il vous plaît', 'Please'], ['Comment ça va ?', 'How are you?'], ['Je m\'appelle...', 'My name is...'], ['Au revoir', 'Goodbye']] },
  japanese: { name: 'Japanese', flag: '🇯🇵', phrases: [['Konnichiwa', 'Hello'], ['Arigatou', 'Thank you'], ['Onegaishimasu', 'Please'], ['Genki desu ka?', 'How are you?'], ['Watashi no namae wa...', 'My name is...'], ['Sayounara', 'Goodbye']] },
  swahili:  { name: 'Swahili', flag: '🇰🇪', phrases: [['Jambo', 'Hello'], ['Asante', 'Thank you'], ['Tafadhali', 'Please'], ['Habari yako?', 'How are you?'], ['Jina langu ni...', 'My name is...'], ['Kwaheri', 'Goodbye']] },
};
const LANG_OF = { paris: 'french', tokyo: 'japanese', kenya: 'swahili' };
function langCard() {
  return `<div class="card"><h3>🗣️ Language Classes <span class="muted small">· ${money(25)} · 2 hrs</span></h3>
    <div class="mrows">${Object.entries(LANGS).map(([k, L]) => { const lv = S.t3.langs[k] || 0, known = L.phrases.slice(0, Math.min(L.phrases.length, Math.floor(lv / 12) + (lv > 0 ? 1 : 0))); return mrow(L.flag, `${L.name} · level ${Math.round(lv)}`, known.length ? known.map(p => `"${p[0]}" = ${p[1]}`).join(' · ') : 'Learn to say hello, thank you and more!', b('Take a class', `langClass('${k}')`)); }).join('')}</div>
    <p class="lesson">💡 Kids who learn a second language can talk to more people — and it's great for your brain!</p></div>`;
}
function langClass(k) {
  if (S.hour < 8 || S.hour > 19) return nope('Language classes are 8 AM – 7 PM.');
  if (!spend(25, `${LANGS[k].name} class`)) return;
  pass(2, 'study');
  const before = S.t3.langs[k] || 0, now = S.t3.langs[k] = Math.min(100, before + 6 + S.skills.comm / 25);
  const L = LANGS[k], idx = Math.min(L.phrases.length - 1, Math.floor(now / 12));
  addSkill('comm', 1);
  log(`${L.flag} ${L.name} class! You learned: "${L.phrases[idx][0]}" means "${L.phrases[idx][1]}".`, 'good');
  if (now >= 40 && before < 40) unlock('bilingual');
  done();
}

function town3NewDay() {
  ensureTown3State();
  roadworkNewDay(); warningNewDay(); lostNewDay(); doorcamNewDay(); hobbiesNewDay();
  if (S.t3.jetlag > 0) S.t3.jetlag--;
  if (weekday() === 5) chartWeekly();
}
