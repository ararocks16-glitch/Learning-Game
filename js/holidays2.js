// ===================== PLAY REWARD & HOLIDAY EVENTS (be there, or you miss it!) =====================

// ---------- $5 of GAME money each day you play (not real money!) ----------
function playReward() {
  if (!S) return;
  const today = new Date().toDateString();
  if (S.playDay === today) return;
  S.playDay = today; S.playDays = (S.playDays || 0) + 1;
  earn(5, 'Reward for playing today');
  log(`🎉 Thanks for playing today! You got $5 of game money. (Day ${S.playDays} of playing)`, 'good');
  queueModal(`<h2>🎉 Welcome Back!</h2><p>Thanks for playing <b>The Big Game of Life</b> today!</p><p style="font-size:1.4rem">💵 +$5 game money</p><p class="muted">It's pretend money for the game only, not real money. Come back tomorrow for another $5! (You've played on ${S.playDays} different day${S.playDays > 1 ? 's' : ''}.)</p>`);
  save();
}

// ---------- holiday events ----------
// Each one happens at one place, at certain hours. Be there to join — if you miss it, you miss it!
const YEAR = () => dateOf().year;
const isMD = (m, d) => { const t = dateOf(); return t.m === m && t.d === d; };
const atHomeOrParents = () => S.loc === 'home' || placeId(S.loc) === 'h_parents';
const HEVENTS = [
  { id: 'xmas', icon: '🎄', name: 'Christmas Morning: Open Presents!', when: () => isMD(11, 25), from: 8, to: 20, where: 'home', whereText: 'at home (or your parents\' house)',
    about: 'Your family and friends come over. Everyone opens presents together by the tree!', join: () => christmasPresents(true), missed: () => christmasPresents(false) },
  { id: 'thanks', icon: '🦃', name: 'Thanksgiving Dinner & Present Give-Out', when: () => isMD(10, 26), from: 12, to: 19, where: 'h_parents', whereText: 'at your parents\' house',
    about: 'A big turkey dinner, then everyone you know gives each other presents.', join: () => thanksgivingGiveOut(), missed: () => log('🦃 You missed Thanksgiving dinner and the present give-out. Everyone missed you! Maybe next year.') },
  { id: 'easter', icon: '🐣', name: 'Easter Egg Hunt', when: () => isMD(3, 5), from: 9, to: 13, where: 'park', whereText: 'at Lakeside Park',
    about: 'Hundreds of colorful eggs are hidden all over the park. Some have prizes inside!', join: () => eggHunt(), missed: () => log('🐣 You missed the Easter egg hunt at the park. Other kids found all the eggs!') },
  { id: 'nye', icon: '🎆', name: 'New Year\'s Eve Countdown Party', when: () => isMD(11, 31), from: 20, to: 24, where: 'park', whereText: 'at Lakeside Park',
    about: 'Music, hot cocoa and a giant countdown to midnight with fireworks!', join: () => newYearsParty(), missed: () => log('🎆 You missed the New Year\'s Eve party. You heard the fireworks from far away.') },
  { id: 'valentine', icon: '💝', name: 'Valentine\'s Card Party', when: () => isMD(1, 14), from: 15, to: 19, where: 'cityhall', whereText: 'at City Hall',
    about: 'Everyone brings cards and candy hearts to share with friends.', join: () => valentineParty(), missed: () => log('💝 You missed the Valentine\'s card party. Your friends saved you one card though!') },
  { id: 'earth', icon: '🌍', name: 'Earth Day Park Cleanup', when: () => isMD(3, 22), from: 9, to: 13, where: 'park', whereText: 'at Lakeside Park',
    about: 'Pick up trash, plant trees and help the planet. Everyone gets a free tree to plant!', join: () => earthDay(), missed: () => log('🌍 You missed the Earth Day cleanup. The park still got cleaned — thanks to other helpers!') },
  { id: 'costume', icon: '🎃', name: 'Halloween Costume Contest', when: () => isMD(9, 31), from: 16, to: 19, where: 'cityhall', whereText: 'at City Hall',
    about: 'Show off your costume! Prizes for the scariest, funniest and most creative.', join: () => costumeContest(), missed: () => log('🎃 You missed the Halloween costume contest.') },
  { id: 'july4', icon: '🌭', name: 'Fourth of July Picnic', when: () => isMD(6, 4), from: 11, to: 16, where: 'park', whereText: 'at Lakeside Park',
    about: 'A big town picnic with hot dogs, watermelon, sack races and a tug-of-war!', join: () => july4Picnic(), missed: () => log('🌭 You missed the Fourth of July picnic. There\'s still the fireworks tonight!') },
  { id: 'bday', icon: '🎂', name: 'Your Birthday Party!', when: () => isBirthday(), from: 15, to: 20, where: 'home', whereText: 'at home',
    about: 'Your friends and family come over for cake, games and presents!', join: () => birthdayParty(), missed: () => log('🎂 You weren\'t home for your birthday party, so you missed it. Your family still sang to you on the phone!') },
];
function hevKey(e) { return `${YEAR()}-${e.id}`; }
function ensureHolidayState() { if (!S.hev) S.hev = {}; if (!S.townTree) S.townTree = { year: 0, ornaments: 0 }; }
function eventsToday() { return HEVENTS.filter(e => e.when()); }
function atEventPlace(e) { return e.where === 'home' ? atHomeOrParents() : placeId(S.loc) === e.where; }
function holidayEventCard(isHome, pid) {
  ensureHolidayState();
  return eventsToday().filter(e => e.where === 'home' ? isHome || pid === 'h_parents' : pid === e.where || (isHome && e.where === 'h_parents' && S.home === 'parents')).map(e => {
    const st = S.hev[hevKey(e)], open = S.hour >= e.from && S.hour < e.to;
    return `<div class="card holiday"><h3>${e.icon} ${e.name} <span class="muted small">· ${fmtTime(e.from)} – ${e.to === 24 ? 'midnight' : fmtTime(e.to)}</span></h3><p>${e.about}</p>
      ${st === 'done' ? '<p>✅ You were there! What a great day.</p>' : open ? `<button class="btn primary" onclick="joinEvent('${e.id}')">${e.icon} Join in!</button>` : S.hour < e.from ? `<p class="muted">It starts at ${fmtTime(e.from)}. Don't miss it!</p>` : '<p class="muted">It\'s over for this year.</p>'}</div>`;
  }).join('');
}
function joinEvent(id) {
  const e = HEVENTS.find(x => x.id === id); ensureHolidayState();
  if (S.hev[hevKey(e)] === 'done') return nope('You already did that!');
  if (!atEventPlace(e)) return nope(`Go ${e.whereText} to join!`);
  if (S.hour < e.from || S.hour >= e.to) return nope('It\'s not happening right now.');
  S.hev[hevKey(e)] = 'done';
  e.join(); unlock('holidayfun'); done();
}
// a reminder chip at the top on holiday days
function holidayChip() {
  ensureHolidayState();
  return eventsToday().filter(e => !S.hev[hevKey(e)] && S.hour < e.to).map(e => `<span class="chip warn">${e.icon} ${e.name}: ${e.whereText}, ${fmtTime(e.from)}–${e.to === 24 ? 'midnight' : fmtTime(e.to)}. Don't miss it!</span>`).join('');
}
// at midnight: anything you didn't go to is missed
function holidaysNewDay() {
  ensureHolidayState();
  const yesterday = S.day - 1;
  HEVENTS.forEach(e => {
    const was = (() => { const d0 = S.day; S.day = yesterday; const r = e.when(); S.day = d0; return r; })();
    if (!was) return;
    const k = `${dateOf(yesterday).year}-${e.id}`;
    if (S.hev[k] !== 'done') { S.hev[k] = 'missed'; e.missed(); }
  });
  const today = eventsToday();
  today.forEach(e => log(`${e.icon} Today: ${e.name} — ${e.whereText}, ${fmtTime(e.from)} to ${e.to === 24 ? 'midnight' : fmtTime(e.to)}. Be there or you'll miss it!`, 'good'));
}

// ---------- what happens at each event ----------
function presentPile(where) {
  const F = S.family, gifts = [];
  const pick = list => list[Math.floor(Math.random() * list.length)];
  [['👩 Mom', F.mom], ['👨 Dad', F.dad], ['👵 Grandma', F.grandma], [`👧 ${F.sis ? F.sis.name : 'Sis'}`, F.sis], [`👦 ${F.bro ? F.bro.name : 'Bro'}`, F.bro]].forEach(([who, m]) => { if (m) gifts.push([who, pick(['a cozy sweater 🧶', 'a new book 📚', 'a board game 🎲', 'fuzzy socks 🧦', 'a gift card ($20) 💳', 'art supplies 🎨', 'a puzzle 🧩', 'headphones 🎧'])]); });
  (S.friends || []).filter(f => f.f > 40).slice(0, 3).forEach(f => gifts.push([`🙂 ${f.name}`, pick(['a friendship bracelet 📿', 'a funny mug ☕', 'a comic book 💭', 'a keychain 🔑', 'candy 🍬'])]));
  return gifts;
}
function giveGiftItems(gifts) {
  let cash = 0;
  gifts.forEach(([who, g]) => {
    if (g.includes('$20')) cash += 20;
    if (g.includes('board game')) S.owned.toy_boardgame = true;
    if (g.includes('puzzle')) S.owned.toy_puzzle = true;
    if (g.includes('art supplies') && S.inv) S.inv.canvases = (S.inv.canvases || 0) + 2;
  });
  if (cash) earn(cash, 'Gift cards');
}
function christmasPresents(there) {
  const gifts = presentPile(), gave = S.giftsBought || 0;
  giveGiftItems(gifts);
  if (there) {
    fun2(35); S.giftsBought = 0;
    Object.values(S.family).forEach(m => m.rel = clamp(m.rel + 10));
    (S.friends || []).forEach(f => f.f = clamp(f.f + (gave ? 15 : 5)));
    queueModal(`<h2>🎄 Merry Christmas!</h2><p>Everyone sat around the tree in their pajamas with hot cocoa. You opened your presents together!</p>
      <ul class="notes">${gifts.map(([w, g]) => `<li>🎁 ${w} gave you <b>${g}</b></li>`).join('')}</ul>
      ${gave ? `<p>You gave ${gave} wrapped gift${gave > 1 ? 's' : ''} — everyone hugged you! 🤗</p>` : '<p class="muted">Tip: buy wrapped gifts at the Mall to give next year!</p>'}`);
    log('🎄 You opened presents with your family and friends on Christmas morning! Best day ever!', 'good');
  } else {
    addMail({ kind: 'package', from: '🎄 Your family & friends', text: `You weren't there on Christmas, so they mailed your presents: ${gifts.map(g => g[1]).join(', ')}. "We missed you! Merry Christmas! ❤️"` });
    log('🎄 You missed opening presents with everyone on Christmas. They mailed your presents to you instead — check your mailbox.');
  }
}
function thanksgivingGiveOut() {
  pass(3, 'relax'); ateFood(70); fun2(30);
  const gifts = presentPile(); giveGiftItems(gifts);
  const gave = S.giftsBought || 0; S.giftsBought = 0;
  Object.values(S.family).forEach(m => m.rel = clamp(m.rel + (gave ? 15 : 8)));
  queueModal(`<h2>🦃 Happy Thanksgiving!</h2><p>You ate turkey, mashed potatoes, corn and pumpkin pie 🥧. Everyone said what they're thankful for.</p>
    <p>Then came the present give-out! 🎁</p><ul class="notes">${gifts.map(([w, g]) => `<li>${w} gave you <b>${g}</b></li>`).join('')}</ul>
    ${gave ? `<p>You gave out ${gave} present${gave > 1 ? 's' : ''}. Giving feels great! ❤️</p>` : '<p class="muted">Next time, bring wrapped gifts (from the Mall) to give out too!</p>'}`);
  log('🦃 You had Thanksgiving dinner and the present give-out with everyone you know!', 'good');
}
function eggHunt() {
  const spots = ['🌳 Big tree', '🛝 Slide', '🪑 Bench', '🌷 Flower bed', '🗑️ Behind the trash can', '🪨 Big rock', '🦆 By the pond', '🌿 Tall grass', '⛲ Fountain', '🏠 Playhouse', '🌲 Pine tree', '🧺 Picnic table'];
  const eggs = new Set(); while (eggs.size < 6) eggs.add(Math.floor(Math.random() * spots.length));
  S.hunt = { spots, eggs: [...eggs], found: [], tries: 8, gold: [...eggs][0] };
  showHunt();
}
function showHunt() {
  const H = S.hunt;
  showModal(`<h2>🐣 Easter Egg Hunt!</h2><p>Where are the eggs hiding? You can look in <b>${H.tries}</b> more places. Found: ${H.found.length} 🥚</p>
    <div class="grid actions">${H.spots.map((s, i) => `<button class="action" ${H.found.includes(i) || (H.looked || []).includes(i) || !H.tries ? 'disabled' : ''} onclick="huntLook(${i})"><span class="ic">${H.found.includes(i) ? (i === H.gold ? '🌟' : '🥚') : (H.looked || []).includes(i) ? '❌' : '❓'}</span><b>${s}</b></button>`).join('')}</div>`,
    [{ label: H.tries ? 'Stop hunting' : 'Count my eggs!', cls: 'primary', fn: endHunt }]);
}
function huntLook(i) {
  const H = S.hunt; H.tries--;
  if (H.eggs.includes(i)) H.found.push(i); else (H.looked = H.looked || []).push(i);
  showHunt();
}
function endHunt() {
  const H = S.hunt; if (!H) return;
  pass(2, 'relax'); fun2(20 + H.found.length * 3);
  let prize = H.found.length * 2 + (H.found.includes(H.gold) ? 20 : 0);
  if (prize) earn(prize, 'Easter egg hunt prizes');
  log(`🐣 Egg hunt: you found ${H.found.length} eggs${H.found.includes(H.gold) ? ' — including the GOLDEN EGG 🌟' : ''}! Inside were candy and ${money(prize)} in coins!`, 'good');
  S.hunt = null; done();
}
function newYearsParty() {
  pass(Math.max(0.5, 24 - S.hour), 'relax'); fun2(30);
  showModal(`<h2>🎆 10... 9... 8... 3... 2... 1... HAPPY NEW YEAR!</h2><p>Fireworks lit up the whole sky! Everyone cheered and hugged.</p><p>What's your New Year's resolution?</p>
    <div class="grid actions">${[['📚', 'Read more books', 'write'], ['💪', 'Exercise more', 'fit'], ['💰', 'Save more money', 'math'], ['🤝', 'Be kinder to people', 'comm'], ['🎨', 'Learn something new', 'art']].map(r => `<button class="action" onclick="closeModal();resolution('${r[1]}','${r[2]}')"><span class="ic">${r[0]}</span><b>${r[1]}</b></button>`).join('')}</div>`, []);
}
function resolution(text, sk) { S.resolution = text; addSkill(sk, 1); log(`🎆 Your New Year's resolution: "${text}." You can do it!`, 'good'); done(); }
function valentineParty() { pass(2, 'relax'); fun2(18); const n = 2 + (S.friends || []).length; (S.friends || []).forEach(f => f.f = clamp(f.f + 8)); log(`💝 You traded Valentine's cards at the party and got ${n} cards and a bag of candy hearts! 💌`, 'good'); }
function earthDay() { pass(3, 'awake'); S.eco = (S.eco || 0) + 10; addSkill('sci', 1); fun2(15); if (S.inv) S.inv.seeds = (S.inv.seeds || 0) + 2; log('🌍 You picked up 3 bags of trash and planted a baby oak tree at the park! You got 2 free seed packs to grow at home. 🌱', 'good'); }
function costumeContest() {
  pass(1.5, 'relax'); fun2(18);
  if (!has('costume')) { log('🎃 You went to the costume contest, but you didn\'t have a costume! You cheered for everyone else. (Costumes are at the Mall.)'); return; }
  const win = Math.random() < 0.4 + S.skills.art / 200;
  if (win) earn(25, 'Costume contest prize');
  log(win ? `🏆 Your ${pickR(['vampire', 'robot', 'pumpkin', 'dinosaur', 'wizard'])} costume won "Most Creative"! You got $25!` : '🎃 You paraded in your costume. You didn\'t win this year, but everyone loved it!', 'good');
}
function july4Picnic() { pass(3, 'relax'); ateFood(45); fun2(25); S.needs.thirst = clamp(S.needs.thirst + 30); if (S.neighbors && S.neighbors.people) S.neighbors.people.forEach(n => n.rel = clamp(n.rel + 5)); log(`🌭 Fourth of July picnic: hot dogs, watermelon 🍉 and a sack race — you ${Math.random() < 0.5 ? 'WON the sack race! 🥇' : 'fell over laughing in the sack race!'}`, 'good'); }
function birthdayParty() {
  pass(3, 'relax'); fun2(40);
  const gifts = presentPile(); giveGiftItems(gifts);
  Object.values(S.family).forEach(m => m.rel = clamp(m.rel + 8)); (S.friends || []).forEach(f => f.f = clamp(f.f + 10));
  queueModal(`<h2>🎂 Happy Birthday, ${esc(S.name)}!</h2><p>Everyone sang "Happy Birthday" and you blew out ${S.age} candles in one breath! 🕯️</p><ul class="notes">${gifts.map(([w, g]) => `<li>🎁 ${w}: <b>${g}</b></li>`).join('')}</ul>`);
  log(`🎂 You had a birthday party with your family and friends! You're ${S.age} now!`, 'good');
}

// ---------- the big town Christmas tree at the park ----------
function townTreeCard(pid) {
  if (pid !== 'park' || dateOf().m !== 11 || dateOf().d > 25) return '';
  ensureHolidayState();
  const T = S.townTree; if (T.year !== YEAR()) { T.year = YEAR(); T.ornaments = 0; T.mine = 0; }
  const lit = dateOf().d >= 20 || T.ornaments >= 100;
  return `<div class="card holiday"><h3>🎄 The Big Town Christmas Tree</h3><p>A giant tree stands in the middle of the park! Everyone in town helps decorate it. ${lit ? '✨ The lights are ON and it sparkles all night!' : `It's ${Math.min(100, T.ornaments)}% decorated.`}</p>
    <div class="row"><button class="btn sm primary" onclick="decorateTownTree('ornament')">🔴 Hang ornaments (30 min)</button><button class="btn sm primary" onclick="decorateTownTree('lights')">💡 String lights (1 hr)</button><button class="btn sm ghost" onclick="decorateTownTree('star')" ${T.star ? 'disabled' : ''}>⭐ Put the star on top</button></div>
    ${T.mine ? `<p class="muted small">You've helped ${T.mine} times! 🎅</p>` : ''}</div>`;
}
function decorateTownTree(k) {
  if (S.hour < 9 || S.hour > 20) return nope('The tree decorating happens 9 AM – 8 PM.');
  const T = S.townTree;
  if (k === 'star') { if (T.ornaments < 60) return nope('Help decorate more first! The star goes on last.'); T.star = true; pass(0.5, 'relax'); fun2(20); log('⭐ The firefighters lifted you up in the bucket truck, and you put the STAR on top of the town tree! Everyone cheered! 🎄', 'good'); unlock('treestar'); return done(); }
  pass(k === 'lights' ? 1 : 0.5, 'relax'); fun2(10); T.ornaments += k === 'lights' ? 15 : 8; T.mine = (T.mine || 0) + 1;
  if (S.neighbors && S.neighbors.people) pickR(S.neighbors.people).rel += 2;
  log(k === 'lights' ? '💡 You helped wrap strings of twinkly lights around the giant town tree.' : `🔴 You hung ${pickR(['shiny red balls', 'paper snowflakes you made', 'candy canes', 'little wooden reindeer'])} on the town tree.`, 'good');
  done();
}
function drawTownTree(c, t) {
  if (!S || dateOf().m !== 11 || dateOf().d > 26 || !PLACES.park) return;
  const [px, py] = PLACES.park.r, x = px + 60, base = py + 184;
  c.fillStyle = 'rgba(0,0,0,.2)'; c.beginPath(); c.ellipse(x + 4, base + 4, 20, 5, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#6d4c41'; c.fillRect(x - 3, base - 8, 6, 10);
  [[40, 0], [32, 16], [24, 30], [15, 42]].forEach(([w, up], k) => { c.fillStyle = k % 2 ? '#2e7d32' : '#1b5e20'; c.beginPath(); c.moveTo(x - w / 2, base - 6 - up); c.lineTo(x + w / 2, base - 6 - up); c.lineTo(x, base - 34 - up); c.closePath(); c.fill(); });
  const T = S.townTree || {}, lit = dateOf().d >= 20 || (T.ornaments || 0) >= 100, n = Math.min(30, Math.round((T.ornaments || 0) / 3) + 6);
  for (let k = 0; k < n; k++) { const yy = base - 10 - (k * 7.3) % 66, ww = 18 - (base - 10 - yy) / 4.2; const xx = x + Math.sin(k * 2.4) * Math.max(2, ww); c.fillStyle = lit && (Math.floor(t / 400) + k) % 3 === 0 ? '#ffffff' : ['#ffeb3b', '#e53935', '#42a5f5', '#ff9800'][k % 4]; c.beginPath(); c.arc(xx, yy, 1.6, 0, Math.PI * 2); c.fill(); }
  if (T.star || dateOf().d >= 24) { c.fillStyle = '#ffd54f'; c.beginPath(); for (let k = 0; k < 10; k++) { const r = k % 2 ? 2 : 5, a = -Math.PI / 2 + k * Math.PI / 5; c.lineTo(x + Math.cos(a) * r, base - 82 + Math.sin(a) * r); } c.fill(); }
}
