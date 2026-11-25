// ===================== CALENDAR, SEASONS, HOLIDAYS, EVENTS, VOTING, NEWS =====================

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MDAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const START_DOY = 151;   // Day 1 of the game is June 1st (right after graduation)
const SEASONS = {
  winter: { name: 'Winter', icon: '❄️' }, spring: { name: 'Spring', icon: '🌷' },
  summer: { name: 'Summer', icon: '☀️' }, fall: { name: 'Fall', icon: '🍂' },
};
WEATHER.snowy = { name: 'Snowy', icon: '🌨️' };

function dateOf(day = S.day) {
  const total = START_DOY + day - 1;
  let doy = total % 365, m = 0;
  while (doy >= MDAYS[m]) { doy -= MDAYS[m]; m++; }
  return { m, d: doy + 1, year: 2026 + Math.floor(total / 365) };
}
function dateText(day = S.day, long) { const { m, d } = dateOf(day); return `${long ? MONTHS[m] : MONTHS[m].slice(0, 3)} ${d}`; }
// how the land looks this season: [red, green, blue, how much]
let SEASON_LAND = null;
function updateSeasonLand() {
  const se = typeof S !== 'undefined' && S ? seasonOf() : 'summer';
  const next = se === 'winter' ? [236, 242, 248, 0.82] : se === 'fall' ? [196, 150, 70, 0.38] : se === 'spring' ? [140, 210, 110, 0.12] : null;
  if (JSON.stringify(next) !== JSON.stringify(SEASON_LAND)) { SEASON_LAND = next; if (typeof chunkCache !== 'undefined') chunkCache.forEach(m => m.clear()); if (typeof townCanvas !== 'undefined' && townCanvas) buildTown(); }
}
function seasonOf(day = S.day) { const m = dateOf(day).m; return m === 11 || m <= 1 ? 'winter' : m <= 4 ? 'spring' : m <= 7 ? 'summer' : 'fall'; }
const isDate = (m, d, day = S.day) => { const t = dateOf(day); return t.m === m && t.d === d; };
function weatherText() { return S.storm ? '⛈️ Thunderstorm' : `${WEATHER[S.weather].icon} ${WEATHER[S.weather].name}`; }

// ---------- holidays ----------
const HOLIDAYS = [
  { m: 0, d: 1, name: "New Year's Day", icon: '🎆', about: 'A brand new year! Fireworks light up the sky tonight.', closed: true },
  { m: 1, d: 14, name: "Valentine's Day", icon: '💝', about: 'Send cards to the people you care about.' },
  { m: 3, d: 5, name: 'Easter', icon: '🐣', about: 'The Easter egg hunt is at Lakeside Park, 9 AM – 1 PM!' },
  { m: 3, d: 22, name: 'Earth Day', icon: '🌍', about: 'A day to take care of our planet. Help clean up the park!' },
  { m: 6, d: 4, name: 'Independence Day', icon: '🎇', about: 'A parade in Maple Town and fireworks at night!', closed: true },
  { m: 9, d: 31, name: 'Halloween', icon: '🎃', about: 'Wear a costume and go trick-or-treating tonight!' },
  { m: 10, d: 26, name: 'Thanksgiving', icon: '🦃', about: 'A big family dinner at your parents\' house.', closed: true },
  { m: 11, d: 25, name: 'Christmas', icon: '🎄', about: 'Open presents with your family and friends at home in the morning!', closed: true },
];
function holidayToday(day = S.day) { return HOLIDAYS.find(h => isDate(h.m, h.d, day)) || null; }
function isBirthday(day = S.day) { return S.bday && isDate(S.bday.m, S.bday.d, day); }

// ---------- town events at Lakeside Park ----------
const TOWN_EVENTS = [
  { id: 'springfair', name: 'Spring Fair', icon: '🌷', m: 3, from: 18, to: 19 },
  { id: 'parade', name: 'Independence Day Parade', icon: '🎺', m: 6, from: 4, to: 4 },
  { id: 'summerfair', name: 'Summer Fair', icon: '🎡', m: 6, from: 10, to: 12 },
  { id: 'fallfest', name: 'Fall Festival & Pumpkin Patch', icon: '🎃', m: 9, from: 10, to: 11 },
  { id: 'lights', name: 'Winter Lights & Ice Rink', icon: '⛸️', m: 11, from: 15, to: 24 },
];
function eventToday(day = S.day) { const { m, d } = dateOf(day); return TOWN_EVENTS.find(e => e.m === m && d >= e.from && d <= e.to) || null; }
function fireworksNow() { const h = holidayToday(); return h && (h.m === 0 || h.m === 6) && S.hour >= 20.5 && S.hour < 23.5; }
const EVENT_ACTIONS = {
  ride: ['🎡', 'Ride the Ferris Wheel', '$5 · 30 min', () => { if (!spend(5, 'Ferris wheel')) return; pass(0.5, 'relax'); fun2(15); log('🎡 From the top of the Ferris wheel you could see the whole town!'); }],
  games: ['🎯', 'Carnival Games', '$3 · win a prize?', () => { if (!spend(3, 'Carnival game')) return; pass(0.3, 'relax'); fun2(6); if (Math.random() < 0.35) { log('🧸 You won a giant teddy bear!', 'good'); fun2(10); } else log('🎯 So close! You didn\'t win this time.'); }],
  cotton: ['🍭', 'Cotton Candy', '$4', () => { if (!spend(4, 'Cotton candy')) return; S.needs.food = clamp(S.needs.food + 8); fun2(8); S.plaque = (S.plaque || 0) + 0.3; log('🍭 Sweet, fluffy cotton candy! (Brush your teeth later.)'); }],
  pumpkin: ['🎃', 'Carve a Pumpkin', '$8 · 1 hr · Art', () => { if (!spend(8, 'Pumpkin')) return; pass(1, 'relax'); addSkill('art', 2); fun2(12); log('🎃 You carved a spooky jack-o\'-lantern!'); }],
  hayride: ['🚜', 'Hayride', '$5', () => { if (!spend(5, 'Hayride')) return; pass(0.5, 'relax'); fun2(12); log('🚜 A bumpy hayride through the pumpkin patch!'); }],
  skate: ['⛸️', 'Ice Skating', '$6 · 1 hr', () => { if (!spend(6, 'Ice skating')) return; pass(1, 'sport'); addSkill('fit', 1); fun2(15); log(Math.random() < 0.4 ? '⛸️ You fell on the ice... then got right back up!' : '⛸️ You glided around the rink under the twinkly lights.'); }],
  parade: ['🎺', 'Watch the Parade', 'free · 1 hr', () => { pass(1, 'relax'); fun2(14); log('🎺 Marching bands, floats and a giant flag went by!'); }],
  flowers: ['🌷', 'Flower Show', 'free · 1 hr', () => { pass(1, 'relax'); fun2(8); addSkill('art', 0.5); log('🌷 You saw tulips in every color.'); }],
};
const EVENT_LIST = { springfair: ['flowers', 'ride', 'games', 'cotton'], parade: ['parade', 'cotton'], summerfair: ['ride', 'games', 'cotton'], fallfest: ['pumpkin', 'hayride', 'games'], lights: ['skate', 'cotton'] };
function fun2(n) { S.needs.fun = clamp(S.needs.fun + n); }

// ---------- elections ----------
const PROMISES = {
  busfare: 'Cut the bus fare in half', roads: 'Fix the roads so trips are faster', park: 'Build a new playground and splash pad',
  library: 'Give the library more books and tutors', safety: 'Hire more police so fewer bad things happen', jobs: 'Bring new businesses so jobs pay more',
};
const CANDIDATE_NAMES = ['Maria Lopez', 'James Carter', 'Aisha Khan', 'Tom Nguyen', 'Grace Okafor', 'Ben Miller', 'Sofia Rossi', 'David Kim'];
function electionDay(day = S.day) { return isDate(10, 3, day) || isDate(4, 5, day); }
function nextElectionDays() { for (let k = 0; k < 400; k++) if (electionDay(S.day + k)) return k; return 999; }
function setupElection() {
  const r = Math.random;
  const names = [...CANDIDATE_NAMES].sort(() => r() - 0.5).slice(0, 3);
  const prom = Object.keys(PROMISES).sort(() => r() - 0.5).slice(0, 3);
  S.election = { day: S.day + nextElectionDays(), candidates: names.map((n, i) => ({ name: n, promise: prom[i], look: randomLook(seeded(n.length * 31 + i)) })), voted: null };
}
function vote(i) {
  if (!S.registered) return nope('You need to register to vote first!');
  if (!electionDay()) return nope('Voting only happens on Election Day.');
  if (S.hour < 7 || S.hour > 20) return nope('The polls are open 7 AM to 8 PM.');
  if (S.election.voted != null) return nope('You already voted. One person, one vote!');
  S.election.voted = i;
  pass(0.5);
  unlock('voter');
  log(`🗳️ You voted for ${S.election.candidates[i].name}. You got an "I Voted" sticker!`, 'good');
  done();
}
function countVotes() {
  const e = S.election; if (!e) return;
  const votes = e.candidates.map(() => 3000 + Math.floor(Math.random() * 3000));
  if (e.voted != null) votes[e.voted] += 1;
  const win = votes.indexOf(Math.max(...votes));
  S.mayor = { name: e.candidates[win].name, perk: e.candidates[win].promise };
  const close = Math.abs(votes[0] - votes[1]) < 400;
  queueModal(`<h2>🗳️ Election Results</h2>
    <table class="stub">${e.candidates.map((c2, i) => `<tr class="${i === win ? 'plus' : ''}"><td>${i === win ? '🏆 ' : ''}${c2.name} — "${PROMISES[c2.promise]}"</td><td>${votes[i].toLocaleString()} votes</td></tr>`).join('')}</table>
    <p><b>${S.mayor.name}</b> is the new mayor! Their promise: <b>${PROMISES[S.mayor.perk]}</b>.</p>
    ${e.voted == null ? '<p class="lesson">💡 You didn\'t vote this time. Every vote counts — some elections are won by just a few votes!</p>' : `<p class="lesson">💡 You voted! ${close ? 'This one was really close — every vote mattered.' : 'Voting is how people choose their leaders.'}</p>`}`);
  log(`🗳️ ${S.mayor.name} won the election for mayor.`, 'good');
  addNews(`🗳️ ${S.mayor.name} wins mayor race, promises to "${PROMISES[S.mayor.perk].toLowerCase()}"`);
  S.election = null;
}
const perk = p => S.mayor && S.mayor.perk === p;

// ---------- news ----------
function addNews(h) { S.news = S.news || []; S.news.unshift({ day: S.day, text: h }); if (S.news.length > 25) S.news.length = 25; }
function makeForecast() {
  S.forecast = [];
  for (let k = 1; k <= 3; k++) S.forecast.push({ day: S.day + k, w: rollWeather(seasonOf(S.day + k)) });
}
const TOWN_NEWS = [
  'New bike lanes coming to Main Street', 'Lakeside Park ducks have 6 new ducklings', 'Library reading challenge starts this month',
  'Riverside Bakery wins "Best Bread" award', 'Seaside Bay lighthouse turns 135 years old', 'Snowpeak ski lifts get a new paint job',
  'Pinecrest Lumber Mill plants 500 new trees', 'Maple Town College adds coding classes', 'Wildlife Park welcomes a baby giraffe',
  'Farmers say this year\'s pumpkins are HUGE', 'Fire station holds a pancake breakfast fundraiser', 'Scientists say: drink more water!',
];

// ---------- every new day ----------
function rollWeather(se) {
  const r = Math.random();
  if (se === 'winter') return r < 0.35 ? 'snowy' : r < 0.7 ? 'cloudy' : 'sunny';
  if (se === 'summer') return r < 0.45 ? 'sunny' : r < 0.75 ? 'hot' : r < 0.88 ? 'cloudy' : 'rainy';
  if (se === 'spring') return r < 0.4 ? 'sunny' : r < 0.68 ? 'cloudy' : 'rainy';
  return r < 0.35 ? 'sunny' : r < 0.68 ? 'cloudy' : 'rainy';
}
function ensureCalendarState() {
  if (S.age === undefined) S.age = 18;
  if (!S.bday) { const d = 1 + Math.floor(Math.random() * 360); const t = { m: 0, d: 0 }; let doy = d; while (doy >= MDAYS[t.m]) { doy -= MDAYS[t.m]; t.m++; } t.d = doy + 1; S.bday = t; }
  if (!S.news) S.news = [];
  if (!S.forecast) makeForecast();
  if (S.registered === undefined) S.registered = false;
  if (!S.election) setupElection();
  updateSeasonLand();
}
function calendarNewDay() {
  ensureCalendarState();
  const se = seasonOf(), prevSe = seasonOf(S.day - 1);
  const wasRain = S.weather === 'rainy';
  // weather from yesterday's forecast
  const f = (S.forecast || []).find(x => x.day === S.day);
  S.weather = f ? f.w : rollWeather(se);
  makeForecast();
  S.storm = S.weather === 'rainy' && Math.random() < (se === 'summer' ? 0.5 : 0.25);
  S.rainbow = wasRain && S.weather === 'sunny' && Math.random() < 0.25;
  S.snowDay = S.weather === 'snowy' && Math.random() < 0.35;
  if (se !== prevSe) {
    updateSeasonLand();
    queueModal(`<h2>${SEASONS[se].icon} It's ${SEASONS[se].name}!</h2><p>${{
      winter: 'Snow is coming! Wear a warm coat when you go outside, or you\'ll get cold and sick.',
      spring: 'Flowers are blooming and it rains a lot. Bring an umbrella!',
      summer: 'Hot sunny days! Drink lots of water and watch out for sunburn.',
      fall: 'Leaves are turning orange and red. It\'s getting colder.' }[se]}</p>`);
    addNews(`${SEASONS[se].icon} ${SEASONS[se].name} is officially here`);
  }
  if (S.weather === 'hot') { S.hotStreak = (S.hotStreak || 0) + 1; if (S.hotStreak === 3) { addNews('🥵 Heat wave! Stay inside, drink water'); log('🥵 It\'s a heat wave! Drink lots of water.', 'bad'); } } else S.hotStreak = 0;
  if (S.snowDay) { log('❄️ SNOW DAY! Schools and many offices are closed today.', 'good'); addNews('❄️ Snow day! Schools closed'); }
  if (S.rainbow) log('🌈 Look! A rainbow after yesterday\'s rain.');
  if (S.storm) { addNews('⛈️ Thunderstorms today — stay safe indoors'); if (Math.random() < 0.3) startPowerOutage(); }
  // birthday
  if (isBirthday()) {
    S.age++;
    const gift = 25 + Math.floor(Math.random() * 50);
    earn(gift, 'Birthday money from family');
    fun2(25);
    const friends = (S.friends || []).filter(fr => fr.f > 40);
    queueModal(`<h2>🎂 Happy Birthday, ${esc(S.name)}!</h2><p>You are <b>${S.age}</b> years old today!</p><p>🎁 Your family sent you <b>${money(gift)}</b>.</p>${friends.length ? `<p>🥳 ${friends.slice(0, 3).map(fr => esc(fr.name)).join(', ')} wished you a happy birthday!</p>` : ''}`);
    log(`🎂 Happy birthday! You're ${S.age} now.`, 'good');
    if (S.age === 40 && !S.grayHair) { S.grayHair = true; S.look.hair = '#b8b2aa'; log('👴 You found your first gray hairs!'); }
    if (S.age === 65) queueModal(`<h2>🎉 You can retire!</h2><p>At 65 you can stop working and live on your savings and a pension. Look for the Retire button on the Me screen.</p>`);
  }
  // holidays & events
  const h = holidayToday();
  if (h) {
    queueModal(`<h2>${h.icon} Happy ${h.name}!</h2><p>${h.about}</p>${h.closed ? '<p class="muted">Many offices are closed today. People with day jobs get a paid holiday!</p>' : ''}`);
    addNews(`${h.icon} Happy ${h.name}!`);
  }
  const ev = eventToday();
  if (ev && dateOf().d === ev.from) { addNews(`${ev.icon} The ${ev.name} opens today at Lakeside Park!`); log(`${ev.icon} The ${ev.name} is at Lakeside Park!`, 'good'); }
  // elections
  if (S.election && S.day > S.election.day) countVotes();
  if (!S.election) setupElection();
  if (S.election && S.election.day - S.day === 7) addNews(`🗳️ Election for mayor in one week! Register at City Hall`);
  if (electionDay()) { addNews('🗳️ It\'s Election Day! Polls open 7 AM – 8 PM at City Hall'); log('🗳️ It\'s Election Day! Vote at City Hall.'); }
  // a bit of town news
  if (Math.random() < 0.5) addNews('🗞️ ' + TOWN_NEWS[Math.floor(Math.random() * TOWN_NEWS.length)]);
  const fw = S.forecast[0];
  addNews(`🌦️ Tomorrow: ${WEATHER[fw.w].icon} ${WEATHER[fw.w].name}`);
  if (dateOf().m === 3 && dateOf().d === 1) addNews('🧾 Reminder: taxes are due April 15!');
}

function giftExchange() {
  const gave = S.giftsBought || 0;
  const got = 2 + Math.floor(Math.random() * 3);
  earn(20 * got, 'Holiday gift cards');
  fun2(20);
  queueModal(`<h2>🎁 Gift Time!</h2><p>You opened <b>${got}</b> presents (including ${money(20 * got)} in gift cards)!</p>${gave ? `<p>You gave ${gave} gift${gave > 1 ? 's' : ''}. Everyone loved them! ❤️</p>` : '<p class="lesson">💡 Next year, buy gifts at the Mall before the holiday. Giving feels great too!</p>'}`);
  (S.friends || []).forEach(f => f.f = clamp(f.f + (gave ? 15 : 0)));
  if (S.family) Object.values(S.family).forEach(m => m.rel = clamp(m.rel + (gave ? 15 : 0)));
  S.giftsBought = 0;
}

// ---------- holiday things to do ----------
function holidayCard() {
  const h = holidayToday(), bd = isBirthday();
  const acts = [];
  if (h && h.m === 1) acts.push(['💌', 'Send Valentine cards', '$3 each to friends & family', 'sendCards()']);
  if (h && h.m === 9) { acts.push(['🧛', has('costume') ? 'You have a costume ✅' : 'Buy a costume at the Mall', '', '']); if (S.hour >= 17.5 && S.hour < 21.5) acts.push(['🍬', 'Go trick-or-treating', '2 hrs · candy!', 'trickOrTreat()']); }
  if (h && h.m === 10) acts.push(['🦃', 'Thanksgiving dinner', 'at your parents\' house', "travelTo(S.home === 'parents' ? 'home' : 'h_parents')"]);
  if (h && (h.m === 0 || h.m === 6) && S.hour >= 18) acts.push(['🎆', 'Watch the fireworks', 'after 8:30 PM · free', 'watchFireworks()']);
  if (h && h.m === 3) acts.push(['🌍', 'Earth Day park cleanup', 'at Lakeside Park', "setTab('park')"]);
  if (!h && !bd) {
    const { m, d } = dateOf();
    if (m === 11 && d < 25) acts.push(['🎁', 'Buy holiday gifts', '$20 each at the Mall', "setTab('mall')"]);
    if (!acts.length) return '';
  }
  return `<div class="card holiday"><h3>${bd ? '🎂 It\'s your birthday!' : h ? `${h.icon} ${h.name}` : '🎁 Holidays are coming!'}</h3>
    ${h ? `<p class="muted">${h.about}</p>` : ''}
    <div class="row">${acts.map(a => a[3] ? `<button class="btn sm primary" onclick="${a[3]}">${a[0]} ${a[1]}</button>` : `<span class="chip">${a[0]} ${a[1]}</span>`).join('')}</div></div>`;
}
function sendCards() {
  const n = (S.friends || []).length + 3;
  if (!spend(3 * n, 'Valentine cards')) return;
  pass(0.5); (S.friends || []).forEach(f => f.f = clamp(f.f + 10)); if (S.family) Object.values(S.family).forEach(m => m.rel = clamp(m.rel + 10));
  log(`💌 You sent ${n} Valentine cards. Everyone felt loved!`, 'good'); fun2(8); done();
}
function trickOrTreat() {
  if (S.today.tricked) return nope('You already went trick-or-treating!');
  S.today.tricked = true;
  pass(2, 'awake');
  const candy = has('costume') ? 30 + Math.floor(Math.random() * 20) : 8;
  S.candy = (S.candy || 0) + candy; S.plaque = (S.plaque || 0) + 2; fun2(has('costume') ? 25 : 8);
  log(has('costume') ? `🎃 Trick or treat! You got ${candy} pieces of candy. Your costume was a hit!` : `🎃 Without a costume, people only gave you ${candy} candies.`, 'good');
  done();
}
function watchFireworks() {
  if (!fireworksNow()) return nope('The fireworks start at 8:30 PM.');
  pass(1, 'relax'); fun2(20); log('🎆 Boom! Crackle! The fireworks were amazing!', 'good'); done();
}
function viewParkEvent() {
  const ev = eventToday(); if (!ev) return '';
  return `<div class="card holiday"><h3>${ev.icon} ${ev.name}</h3><p class="muted">It's happening right now here at Lakeside Park!</p>
    <div class="grid actions">${EVENT_LIST[ev.id].map(k => { const a = EVENT_ACTIONS[k]; return `<button class="action" onclick="eventAct('${k}')"><span class="ic">${a[0]}</span><b>${a[1]}</b><small>${a[2]}</small></button>`; }).join('')}</div></div>`;
}
function eventAct(k) { const before = S.money + S.hour; EVENT_ACTIONS[k][3](); if (S.money + S.hour !== before) done(); else render(); }

// ---------- City Hall: voting and taxes ----------
function viewCivic() {
  const e = S.election;
  const days = nextElectionDays();
  return `<div class="card money"><h3>🗳️ Elections</h3>
    ${S.mayor ? `<p>Current mayor: <b>${S.mayor.name}</b> · Promise: <i>${PROMISES[S.mayor.perk]}</i></p>` : '<p>The town will choose a new mayor soon.</p>'}
    <p>${electionDay() ? '<b>🗳️ Today is Election Day!</b> Polls are open 7 AM – 8 PM.' : `Next Election Day: <b>${dateText(S.day + days, true)}</b> (${days} days).`}</p>
    ${!S.registered ? `<button class="btn primary sm" onclick="registerVote()">📝 Register to vote</button>` : '<span class="chip good">✅ You are registered to vote</span>'}
    ${e ? `<div class="grid two" style="margin-top:8px">${e.candidates.map((c2, i) => `<div class="card cand"><img class="avatar" src="${avatarURL(c2.look, 48)}" alt=""><div><b>${c2.name}</b><p class="muted small">"I will ${PROMISES[c2.promise].toLowerCase()}!"</p>
      ${electionDay() && S.registered && e.voted == null ? `<button class="btn primary sm" onclick="vote(${i})">Vote</button>` : e.voted === i ? '<span class="chip good">✅ Your vote</span>' : ''}</div></div>`).join('')}</div>` : ''}
    <p class="lesson">💡 In a democracy, people vote to choose their leaders. You have to register first!</p></div>
    ${taxCard()}`;
}
function registerVote() { S.registered = true; pass(0.25); log('📝 You registered to vote. Now you can vote on Election Day!', 'good'); done(); }

// ---------- drawing seasons, weather and fireworks on the map ----------
const leaves = [];
function drawSeasonFx(c, t, dt, vx0, vy0, vw, vh) {
  const se = seasonOf();
  if (se === 'winter') { c.fillStyle = 'rgba(245,250,255,.12)'; c.fillRect(vx0, vy0, vw, vh); }
  if (se === 'fall') { c.fillStyle = 'rgba(220,120,40,.05)'; c.fillRect(vx0, vy0, vw, vh); }
  if (se === 'spring') { c.fillStyle = 'rgba(255,210,235,.05)'; c.fillRect(vx0, vy0, vw, vh); }
  c.save(); c.setTransform(dprNow, 0, 0, dprNow, 0, 0);
  if (S.weather === 'snowy') {
    c.fillStyle = 'rgba(255,255,255,.85)';
    for (let i = 0; i < 160; i++) { const x = (i * 83.7 + Math.sin(t / 900 + i) * 20 + t * 0.01) % (cssW + 20), y = (i * 47.3 + t * (0.03 + (i % 5) * 0.008)) % (cssH + 20); c.beginPath(); c.arc(x, y, 1.2 + (i % 3) * 0.6, 0, Math.PI * 2); c.fill(); }
  }
  if (se === 'fall') {
    for (let i = 0; i < 26; i++) { const x = (i * 131 + t * 0.02 + Math.sin(t / 700 + i) * 30) % (cssW + 20), y = (i * 61 + t * 0.025) % (cssH + 20); c.fillStyle = ['#d9622b', '#e8a33a', '#b5432a'][i % 3]; c.beginPath(); c.ellipse(x, y, 4, 2, t / 400 + i, 0, Math.PI * 2); c.fill(); }
  }
  if (S.storm && Math.sin(t / 1300) > 0.985) { c.fillStyle = 'rgba(255,255,255,.45)'; c.fillRect(0, 0, cssW, cssH); }
  if (S.rainbow && S.hour < 13 && darkness() < 0.2) {
    const cx = cssW * 0.5, cy = cssH * 1.15, r = cssH * 0.95;
    ['#ff0000', '#ff8c00', '#ffee00', '#00c000', '#0080ff', '#4b0082', '#8f00ff'].forEach((col, k) => { c.strokeStyle = col; c.globalAlpha = 0.18; c.lineWidth = 9; c.beginPath(); c.arc(cx, cy, r - k * 9, Math.PI * 1.08, Math.PI * 1.92); c.stroke(); });
    c.globalAlpha = 1;
  }
  if (fireworksNow()) {
    for (let k = 0; k < 4; k++) {
      const ph = ((t / 1600) + k * 0.27) % 1, bx = cssW * (0.2 + k * 0.2), by = cssH * (0.18 + (k % 2) * 0.12);
      const col = ['#ff4d6d', '#ffd23f', '#4dd2ff', '#9b5de5'][k];
      if (ph < 0.3) { c.fillStyle = col; c.beginPath(); c.arc(bx, cssH - ph / 0.3 * (cssH - by), 2, 0, Math.PI * 2); c.fill(); }
      else { const rr2 = (ph - 0.3) * 120; c.globalAlpha = 1 - (ph - 0.3) / 0.7; for (let a = 0; a < 16; a++) { c.fillStyle = col; c.beginPath(); c.arc(bx + Math.cos(a / 16 * Math.PI * 2) * rr2, by + Math.sin(a / 16 * Math.PI * 2) * rr2 + (ph - 0.3) * 20, 2.2, 0, Math.PI * 2); c.fill(); } c.globalAlpha = 1; }
    }
  }
  c.restore();
}
// fair rides and decorations in the park during events
function drawParkEvent(c, t) {
  const ev = eventToday(); if (!ev) return;
  const [x, y] = [PLACES.park.r[0], PLACES.park.r[1]];
  if (ev.id === 'summerfair' || ev.id === 'springfair') {
    const cx = x + 40, cy = y + 60;
    c.strokeStyle = '#555'; c.lineWidth = 2; c.beginPath(); c.moveTo(cx - 14, cy + 40); c.lineTo(cx, cy); c.lineTo(cx + 14, cy + 40); c.stroke();
    c.strokeStyle = '#e53935'; c.lineWidth = 2; c.beginPath(); c.arc(cx, cy, 30, 0, Math.PI * 2); c.stroke();
    for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2 + t / 3000; c.strokeStyle = '#bbb'; c.lineWidth = 1; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(a) * 30, cy + Math.sin(a) * 30); c.stroke(); fillR(c, cx + Math.cos(a) * 30 - 4, cy + Math.sin(a) * 30, 8, 6, ['#ffd23f', '#4dd2ff', '#ff4d6d', '#7ed957'][k % 4], 2); }
  }
  [[90, 140], [120, 150], [150, 140]].forEach(([dx, dy], k) => { tri(c, [[x + dx - 12, y + dy], [x + dx, y + dy - 16], [x + dx + 12, y + dy]], ['#e53935', '#1e88e5', '#ffd23f'][k]); fillR(c, x + dx - 12, y + dy, 24, 12, '#fff'); });
  if (ev.id === 'fallfest') for (let k = 0; k < 10; k++) circ(c, x + 20 + k * 17, y + 170, 5, '#ef7d1a');
  if (ev.id === 'lights') { fillR(c, x + 20, y + 120, 90, 50, 'rgba(200,235,255,.9)', 20); for (let k = 0; k < 20; k++) circ(c, x + 10 + k * 10, y + 10 + (k % 2) * 4, 2, ['#ff4d6d', '#ffd23f', '#4dd2ff', '#7ed957'][k % 4]); }
  if (ev.id === 'parade') for (let k = 0; k < 4; k++) { const px = ((t / 30 + k * 120) % 1200); fillR(c, px, 392, 40, 16, ['#e53935', '#1e88e5', '#ffffff', '#ffd23f'][k], 4); }
}
