// ===================== HOBBIES & PETS: tricks, pet shows, shelter & fostering, bird journal, music lessons & recitals,
// art show, sports teams, swimming, cooking contest, game night, photography =====================

function ensureHobbyState() {
  if (!S.hob) S.hob = { ribbons: [], journal: [], foster: null, shelterHours: 0, lessons: {}, practiced: -1, team: null, swim: 0, photos: [], contests: [] };
}
const isSat = () => weekday() === 5;
const nthSat = n => isSat() && Math.ceil(dateOf().d / 7) === n;

// ---------- 7. pet tricks ----------
const TRICKS = { dog: ['Sit', 'Shake', 'Roll Over', 'Play Dead', 'High Five', 'Fetch'], cat: ['Come When Called', 'High Five', 'Sit'], bird: ['Step Up', 'Say "Hello"', 'Wave'], small: ['Come When Called', 'Spin'], reptile: [], fish: ['Follow Your Finger'] };
function teachTrick(i) {
  const p = S.pets[i]; if (!p) return;
  const list = TRICKS[baseOf(p)] || []; p.tricks = p.tricks || [];
  const next = list.find(t => !p.tricks.includes(t));
  if (!next) return nope(list.length ? `${p.name} already knows every trick! Amazing!` : `${p.name} doesn't really do tricks — but they love you!`);
  if (p.food < 30) return nope(`${p.name} is too hungry to learn. Feed them first!`);
  pass(0.5, 'relax'); p.happy = clamp(p.happy + 6); addSkill('animal', 1);
  if (Math.random() < 0.3 + S.skills.animal / 150 + p.tricks.length * -0.03) { p.tricks.push(next); log(`🦴 ${p.name} learned a new trick: "${next}"! Good ${baseOf(p) === 'dog' ? 'dog' : 'pet'}! 🎉`, 'good'); }
  else log(`🦴 You practiced "${next}" with ${p.name} using treats. Almost! Practice makes perfect.`);
  done();
}
function petTricksCard() {
  if (!S.pets || !S.pets.length || S.loc !== 'home') return '';
  return `<div class="card"><h3>🦴 Pet Tricks</h3><div class="mrows">${S.pets.map((p, i) => mrow(PET_TYPES[p.kind].icon, p.name, (p.tricks && p.tricks.length ? `Knows: ${p.tricks.join(', ')}` : 'No tricks yet') + ` · ${(TRICKS[baseOf(p)] || []).length} to learn`, b('Teach (30 min)', `teachTrick(${i})`, 'ghost', !(TRICKS[baseOf(p)] || []).length))).join('')}</div></div>`;
}

// ---------- 8. pet shows ----------
function petShowCard() {
  if (!S.pets || !S.pets.length) return '';
  const today = nthSat(2) && S.hour >= 9 && S.hour < 14;
  return `<div class="card holiday"><h3>🎀 Maple Pet Show <span class="muted small">· 2nd Saturday of each month, 9 AM – 2 PM</span></h3>
    ${today ? `<p>The show is happening now! Entry fee ${money(15)}.</p><div class="row">${S.pets.map((p, i) => b(`${PET_TYPES[p.kind].icon} Enter ${p.name}`, `petShow(${i})`)).join('')}</div>` : '<p class="muted">Come back on the 2nd Saturday of the month! Judges look at how happy, clean and well-trained your pet is.</p>'}
    ${S.hob.ribbons.length ? `<p>Your ribbons: ${S.hob.ribbons.map(r => r[0]).join(' ')}</p>` : ''}</div>`;
}
function petShow(i) {
  const p = S.pets[i];
  if (S.hob.lastShow === S.day) return nope('You already entered the show today.');
  if (!spend(15, 'Pet show entry')) return;
  S.hob.lastShow = S.day; pass(2, 'relax');
  const score = p.happy * 0.35 + p.clean * 0.25 + p.health * 0.2 + (p.tricks || []).length * 8 + Math.random() * 25;
  const place = score > 95 ? 0 : score > 80 ? 1 : score > 65 ? 2 : 3;
  const R = [['🥇', 'Blue Ribbon — 1st place!', 50], ['🥈', 'Red Ribbon — 2nd place!', 25], ['🥉', 'Yellow Ribbon — 3rd place!', 10], ['🎗️', 'a "Good Try" ribbon', 0]][place];
  S.hob.ribbons.push([R[0], p.name]); if (R[2]) earn(R[2], 'Pet show prize');
  fun2(15); p.happy = clamp(p.happy + 10);
  if (place === 0) unlock('bestinshow');
  log(`🎀 Pet show: ${p.name} ${(p.tricks || []).length ? `did "${p.tricks[0]}" for the judges and ` : ''}won ${R[1]}${R[2] ? ` (${money(R[2])} prize)` : ''}`, 'good');
  done();
}

// ---------- 9. animal shelter: walk dogs & foster kittens ----------
function shelterCard() {
  const F = S.hob.foster;
  return `<div class="card"><h3>🏠 Maple Animal Shelter <span class="muted small">· in the pet shop's back room</span></h3>
    <div class="mrows">${mrow('🐕', 'Walk shelter dogs', `1 hr · volunteer · you've helped ${S.hob.shelterHours} hrs`, b('Walk dogs', 'shelterWalk()'))}
    ${mrow('🐱', 'Foster kittens', F ? `You're fostering ${F.n} kittens! ${Math.max(0, F.until - S.day)} days until they're ready for adoption.` : 'Care for kittens at home for a week until they find forever homes', b(F ? 'Fostering ✅' : 'Foster', 'startFoster()', 'primary', !!F))}</div>
    <p class="lesson">💡 Shelters need volunteers to help animals find loving families. Adopt, don't shop!</p></div>`;
}
function shelterWalk() { if (S.hour < 8 || S.hour > 18) return nope('The shelter is open 8 AM – 6 PM.'); pass(1, 'awake'); S.hob.shelterHours++; S.volunteerHours = (S.volunteerHours || 0) + 1; addSkill('animal', 1.5); fun2(10); log(`🐕 You walked ${pickR(['Buddy', 'Luna', 'Max', 'Daisy', 'Rex'])} and ${pickR(['Coco', 'Bear', 'Pepper', 'Milo'])} from the shelter. Their tails wagged the whole time!`, 'good'); if (S.volunteerHours >= 20) unlock('helper'); done(); }
function startFoster() { if (S.home === 'parents' && S.family.mom.rel < 60) return nope('Mom says no kittens right now. Build up your relationship first!'); S.hob.foster = { n: 2 + Math.floor(Math.random() * 3), until: S.day + 7, fed: S.day }; log(`🐱 You brought home ${S.hob.foster.n} tiny foster kittens! Feed them every day at home.`, 'good'); done(); }
function feedKittens() { const F = S.hob.foster; if (!F) return; if (F.fed === S.day) return nope('You already fed the kittens today.'); F.fed = S.day; pass(0.5, 'relax'); fun2(10); chartMark('pets'); log('🍼 You fed the kittens and played with them. They purred and fell asleep in a pile!'); done(); }
function fosterNewDay() {
  const F = S.hob.foster; if (!F) return;
  if (S.day - F.fed > 1) { F.until++; log('🐱 The foster kittens are hungry! Feed them at home.', 'bad'); }
  if (S.day >= F.until) { log(`🏡 All ${F.n} of your foster kittens got adopted by loving families! You helped save them. ❤️`, 'good'); S.hob.foster = null; unlock('foster'); fun2(20); }
}

// ---------- 10. bird feeder & nature journal ----------
const BIRDS = [['🐦', 'Robin'], ['🐦', 'Blue Jay'], ['🐦', 'Cardinal'], ['🐦', 'Chickadee'], ['🐦', 'Sparrow'], ['🐦', 'Goldfinch'], ['🐦', 'Woodpecker'], ['🐦', 'Hummingbird'], ['🦉', 'Barn Owl'], ['🦅', 'Hawk'], ['🦆', 'Mallard Duck'], ['🐦', 'Mourning Dove']];
const WILD = { park: [['🦆', 'Mallard Duck'], ['🐿️', 'Gray Squirrel'], ['🐢', 'Pond Turtle']], campground: [['🦌', 'Deer'], ['🦊', 'Red Fox'], ['🦉', 'Great Horned Owl']], lake: [['🐟', 'Rainbow Trout'], ['🐸', 'Bullfrog'], ['🦢', 'Swan']], beach: [['🦀', 'Crab'], ['🐦', 'Seagull'], ['🐬', 'Dolphin']], trailhead: [['🦅', 'Bald Eagle'], ['🐐', 'Mountain Goat'], ['🐻', 'Black Bear (far away!)']] };
function journalAdd(icon, name) { if (S.hob.journal.some(j => j[1] === name)) return false; S.hob.journal.push([icon, name, S.day]); log(`📓 New in your nature journal: ${icon} ${name}! (${S.hob.journal.length} kinds spotted)`, 'good'); if (S.hob.journal.length >= 12) unlock('naturalist'); return true; }
function watchBirds() {
  if (!has('birdfeeder')) return nope('Hang a bird feeder first (Mall)!');
  if (S.hour < 6 || S.hour > 19) return nope('The birds are sleeping. Try in the morning!');
  pass(0.5, 'relax'); fun2(7);
  const bird = pickR(BIRDS.slice(0, seasonOf() === 'winter' ? 6 : BIRDS.length));
  if (!journalAdd(...bird)) log(`🐦 A ${bird[1]} came to your bird feeder again.`);
  done();
}
function spotWildlife() {
  const list = WILD[placeId(S.loc)]; if (!list) return nope('Go to the park, lake, beach, mountain or campground to spot animals!');
  pass(0.75, 'relax'); fun2(6); addSkill('animal', 0.6);
  const a = pickR(list); if (!journalAdd(...a)) log(`👀 You saw a ${a[1]} again.`);
  done();
}
function journalCard() {
  if (!S.hob.journal.length) return '';
  return `<div class="card"><h3>📓 Nature Journal (${S.hob.journal.length})</h3><div class="row">${S.hob.journal.map(j => `<span class="chip">${j[0]} ${j[1]}</span>`).join('')}</div></div>`;
}

// ---------- 11. music lessons & recitals ----------
const INSTRUMENTS = { piano: ['🎹', 'Piano', 'keyboard'], drums: ['🥁', 'Drums', 'drumset'], violin: ['🎻', 'Violin', 'violin'], guitar: ['🎸', 'Guitar', 'guitar'] };
function musicCard() {
  return `<div class="card"><h3>🎼 Music Lessons <span class="muted small">· ${money(30)} a lesson · 1 hr</span></h3>
    <div class="mrows">${Object.entries(INSTRUMENTS).map(([k, ins]) => mrow(ins[0], ins[1], `${S.hob.lessons[k] || 0} lessons${has(ins[2]) ? ' · you own one ✅' : ` · buy a ${ins[1].toLowerCase()} at the Mall to practice at home`}`, b('Take a lesson', `musicLesson('${k}')`))).join('')}</div>
    <p class="muted small">🎤 Recital at the 🎭 Theater on the last Saturday of each month (needs 5 lessons).</p></div>`;
}
function musicLesson(k) { if (S.hour < 9 || S.hour > 19) return nope('Lessons are 9 AM – 7 PM.'); if (!spend(30, `${INSTRUMENTS[k][1]} lesson`)) return; pass(1, 'study'); S.hob.lessons[k] = (S.hob.lessons[k] || 0) + 1; addSkill('music', 2.5); log(`${INSTRUMENTS[k][0]} Your teacher showed you a new song on the ${INSTRUMENTS[k][1].toLowerCase()}! (${S.hob.lessons[k]} lessons)`); done(); }
function practiceMusic() {
  const own = Object.entries(INSTRUMENTS).filter(([k, ins]) => has(ins[2]));
  if (!own.length) return nope('Buy an instrument at the Mall to practice at home.');
  if (S.powerOut && own.every(([k]) => k === 'piano')) return nope('The power is out! Your keyboard needs electricity.');
  const [k, ins] = own[Math.floor(Math.random() * own.length)];
  pass(0.5, 'relax'); addSkill('music', 1.3); fun2(6);
  S.hob.streak = S.hob.practiced === S.day - 1 ? (S.hob.streak || 0) + 1 : S.hob.practiced === S.day ? S.hob.streak : 1; S.hob.practiced = S.day;
  if (k === 'drums' && (S.hour >= 21 || S.hour < 8)) S.lateNoise = true;
  log(`${ins[0]} You practiced ${ins[1].toLowerCase()} for 30 minutes. Practice streak: ${S.hob.streak} day${S.hob.streak > 1 ? 's' : ''}! 🔥`);
}
function recitalToday() { const d = dateOf(); return isSat() && d.d + 7 > MDAYS[d.m]; }
function recitalCard() {
  if (!recitalToday()) return '';
  const total = Object.values(S.hob.lessons).reduce((a, b2) => a + b2, 0);
  return `<div class="card holiday"><h3>🎤 Music Recital Tonight! (6 PM)</h3>${total >= 5 ? '<button class="btn sm primary" onclick="recital()">🎶 Perform in the recital</button>' : `<p class="muted">You need 5 music lessons to perform (you have ${total}).</p>`}</div>`;
}
function recital() {
  if (S.hob.recital === S.day) return nope('You already performed today!');
  if (S.hour < 17 || S.hour > 20) return nope('The recital starts at 6 PM.');
  pass(1.5, 'relax'); S.hob.recital = S.day;
  const m = S.skills.music, good = m + (S.hob.streak || 0) * 3 + Math.random() * 30;
  fun2(25); S.family.mom.rel = clamp(S.family.mom.rel + 8); S.family.grandma.rel = clamp(S.family.grandma.rel + 8);
  queueModal(`<h2>🎤 Your Recital</h2><p>You walked on stage, bowed, and played your song. ${good > 70 ? 'You didn\'t miss a single note! 🌟 Everyone gave you a STANDING OVATION!' : good > 45 ? 'You missed one note, but kept going like a pro. Big applause! 👏' : 'You were nervous and made a few mistakes, but you finished! The crowd clapped loudly anyway. 👏'}</p><p>👵 Grandma recorded the whole thing on her phone.</p><p class="lesson">💡 Being brave enough to perform is a big deal. Practicing every day makes it easier!</p>`);
  unlock('performer'); done();
}

// ---------- 12. art show ----------
function artShowCard() {
  const on = nthSat(1);
  return `<div class="card"><h3>🖼️ Town Art Fair <span class="muted small">· 1st Saturday of each month at City Hall</span></h3>
    ${on ? `<p>The art fair is today! Enter one of your paintings (you have ${S.inv.paintings.length}).</p><button class="btn sm primary" ${S.inv.paintings.length ? '' : 'disabled'} onclick="artShow()">🖼️ Enter a painting</button>` : '<p class="muted">Paint pictures at home (Art supplies from the Mall), then bring one to the fair.</p>'}</div>`;
}
function artShow() {
  if (S.hob.artShow === S.day) return nope('You already entered today!');
  if (!S.inv.paintings.length) return nope('You need a painting. Paint one at home first!');
  pass(2, 'relax'); S.hob.artShow = S.day;
  const pt = S.inv.paintings[0], score = S.skills.art + Math.random() * 40;
  const R = score > 85 ? ['🥇', 'Best in Show', 75] : score > 65 ? ['🥈', '2nd place', 40] : score > 45 ? ['🥉', '3rd place', 20] : ['🎗️', 'Honorable Mention', 0];
  if (R[2]) earn(R[2], 'Art fair prize');
  S.hob.ribbons.push([R[0], 'art']); fun2(15); addSkill('art', 1);
  log(`🖼️ Art fair: your painting${pt && pt.title ? ` "${pt.title}"` : ''} won ${R[0]} ${R[1]}!${R[2] ? ` Prize: ${money(R[2])}` : ''} A judge said: "${pickR(['Such beautiful colors!', 'I love the details!', 'Very creative!', 'This makes me happy!'])}"`, 'good');
  done();
}

// ---------- 13. sports teams ----------
const TEAM_SPORTS = ['soccer', 'basketball', 'baseball', 'volleyball', 'hockey'];
function teamCard() {
  const T = S.hob.team, sp = TEAM_SPORTS.filter(k => SPORTS[k]);
  if (!T) return `<div class="card"><h3>🏆 Join a Team <span class="muted small">· $40 a season · 8 games</span></h3><p class="muted">Practice Tuesdays & Thursdays (4–7 PM). Games on Saturdays (9 AM – noon).</p><div class="row">${sp.map(k => b(`${SPORTS[k].icon} ${SPORTS[k].name}`, `joinTeam('${k}')`, 'ghost')).join('')}</div></div>`;
  const prac = (weekday() === 1 || weekday() === 3) && S.hour >= 16 && S.hour < 19, game = isSat() && S.hour >= 9 && S.hour < 12;
  return `<div class="card"><h3>${SPORTS[T.sport].icon} The Maple ${T.name} <span class="muted small">· ${SPORTS[T.sport].name}</span></h3>
    <p>Record: <b>${T.w} wins – ${T.l} losses</b> · Game ${T.w + T.l}/8 · Practices this season: ${T.prac}</p>
    <div class="row"><button class="btn sm ${prac ? 'primary' : 'ghost'}" ${prac && T.pracDay !== S.day ? '' : 'disabled'} onclick="teamPractice()">🏃 Go to practice</button>
    <button class="btn sm ${game ? 'primary' : 'ghost'}" ${game && T.gameDay !== S.day ? '' : 'disabled'} onclick="teamGame()">🏟️ Play the game</button></div></div>`;
}
function joinTeam(k) { if (!spend(40, 'Team season fee')) return; S.hob.team = { sport: k, name: pickR(['Tigers', 'Rockets', 'Sharks', 'Comets', 'Falcons', 'Thunder']), w: 0, l: 0, prac: 0 }; log(`🏆 You joined the Maple ${S.hob.team.name} ${SPORTS[k].name.toLowerCase()} team! You got a jersey with your name on it.`, 'good'); done(); }
function teamPractice() { const T = S.hob.team; if (S.needs.energy < 20) return nope('Too tired for practice!'); pass(1.5, 'awake'); T.prac++; T.pracDay = S.day; addSkill(T.sport, 3); addSkill('fit', 1); S.needs.energy = clamp(S.needs.energy - 10); log(`🏃 Team practice: you ran drills and practiced plays with the ${T.name}. Coach says "Nice hustle!"`); done(); }
function teamGame() {
  const T = S.hob.team; if (S.needs.energy < 20) return nope('Too tired to play!');
  pass(2, 'awake'); T.gameDay = S.day; S.needs.energy = clamp(S.needs.energy - 15); addSkill(T.sport, 2); fun2(18);
  const win = Math.random() < 0.3 + S.sports[T.sport] / 200 + Math.min(T.prac, 8) * 0.03;
  const us = 1 + Math.floor(Math.random() * 5), them = win ? Math.max(0, us - 1 - Math.floor(Math.random() * 2)) : us + 1;
  if (win) T.w++; else T.l++;
  log(win ? `🎉 The ${T.name} WON ${us}–${them}! ${pickR(['You made a great play!', 'Your team cheered so loud!', 'Everyone got ice cream after!'])}` : `😕 The ${T.name} lost ${us}–${them}. Coach says: "Good effort. We'll get them next week!"`, win ? 'good' : '');
  if (T.w + T.l >= 8) {
    const champ = T.w >= 6;
    queueModal(`<h2>${champ ? '🏆 Champions!' : '🏅 Season Over'}</h2><p>The Maple ${T.name} finished ${T.w}–${T.l}.</p><p>${champ ? 'You won the league championship! Everyone got a giant trophy! 🏆' : 'Everyone got a participation medal and had a pizza party! 🍕'}</p><p class="lesson">💡 Being on a team teaches you to work together, cheer for others and never give up.</p>`);
    if (champ) unlock('champions');
    S.hob.team = null;
  }
  done();
}

// ---------- 14. swimming lessons & the town pool ----------
const SWIM_LEVELS = ['Can\'t swim yet', 'Bubbles (put your face in)', 'Floater (float on your back)', 'Paddler (doggy paddle)', 'Swimmer (freestyle!)', 'Shark (deep end & diving)'];
function poolCard() {
  const open = seasonOf() === 'summer' || seasonOf() === 'spring';
  return `<div class="card"><h3>🏊 Town Pool <span class="muted small">· ${open ? 'open 10 AM – 7 PM' : 'indoor lessons only (pool closed for the season)'}</span></h3>
    <p>Your level: <b>${SWIM_LEVELS[S.hob.swim]}</b> (${S.hob.swim}/5)</p>
    <div class="row"><button class="btn sm primary" ${S.hob.swim >= 5 ? 'disabled' : ''} onclick="swimLesson()">🏊 Swim lesson (${money(15)})</button>
    <button class="btn sm ghost" ${open && S.hob.swim >= 3 ? '' : 'disabled'} onclick="freeSwim()">💦 Free swim (${money(4)})</button></div>
    <p class="muted small">Pool rules: 🚫 No running · 👥 Swim with a buddy · 🛟 Listen to the lifeguard · 🤿 Only dive in the deep end</p></div>`;
}
function swimLesson() {
  if (S.hour < 9 || S.hour > 18) return nope('Lessons are 9 AM – 6 PM.');
  if (!spend(15, 'Swim lesson')) return;
  pass(1, 'awake'); addSkill('fit', 1.5); addSkill('swimming', 2.5); S.needs.hygiene = clamp(S.needs.hygiene - 5);
  S.hob.swimLessons = (S.hob.swimLessons || 0) + 1;
  if (S.hob.swimLessons % 3 === 0 && S.hob.swim < 5) { S.hob.swim++; log(`🏊 LEVEL UP! You are now a "${SWIM_LEVELS[S.hob.swim]}"!`, 'good'); if (S.hob.swim === 5) unlock('swimmer'); }
  else log(`🏊 Swim lesson: you practiced ${pickR(['kicking with a kickboard', 'blowing bubbles', 'floating on your back', 'treading water', 'freestyle arms'])}.`);
  done();
}
function freeSwim() { if (!spend(4, 'Pool entry')) return; pass(1.5, 'relax'); fun2(20); addSkill('fit', 1); addSkill('swimming', 1.2); S.needs.thirst = clamp(S.needs.thirst - 10); log('💦 You swam, did cannonballs and played Marco Polo with other kids!', 'good'); done(); }

// ---------- 15. cooking contest ----------
function cookoffCard() {
  const on = nthSat(3) && S.hour >= 10 && S.hour < 15;
  return `<div class="card holiday"><h3>👩‍🍳 Town Cook-Off <span class="muted small">· 3rd Saturday of each month, 10 AM – 3 PM at the Park</span></h3>
    ${on ? `<p>Pick a recipe to make for the judges! (uses ingredients from your kitchen)</p><div class="row">${RECIPES.map(r => b(`${r.icon} ${r.name}`, `cookoff('${r.id}')`, 'ghost', !r.needs.every(n => countFood(n) > 0))).join('')}</div>` : '<p class="muted">Practice your recipes at home and buy ingredients at the Supermarket!</p>'}</div>`;
}
function cookoff(id) {
  if (S.hob.cookoff === S.day) return nope('You already entered today!');
  const r = RECIPES.find(x => x.id === id);
  if (!r.needs.every(n => countFood(n) > 0)) return nope('You don\'t have all the ingredients!');
  r.needs.forEach(n => useFood(n)); pass(2, 'awake'); S.hob.cookoff = S.day; addSkill('cook', 2);
  const score = S.skills.cook + Math.random() * 35 + (r.extra && countFood(r.extra) ? 8 : 0);
  const R = score > 90 ? ['🥇', 'FIRST PLACE', 100] : score > 70 ? ['🥈', 'second place', 50] : score > 50 ? ['🥉', 'third place', 20] : ['🎗️', 'a "Tasty Try" ribbon', 0];
  if (R[2]) earn(R[2], 'Cook-off prize'); S.hob.ribbons.push([R[0], 'cooking']); fun2(15);
  log(`👩‍🍳 Cook-off: the judges tasted your ${r.name} ${r.icon}. "${pickR(['Delicious!', 'Just the right amount of flavor!', 'I want seconds!', 'Very creative!'])}" You won ${R[0]} ${R[1]}!${R[2] ? ` (${money(R[2])})` : ''}`, 'good');
  done();
}

// ---------- 16. board game night ----------
function gameNight() {
  if (!hasToy('boardgame')) return nope('You need a board game (Mall → Toys) to host game night!');
  if (S.hour < 17 || S.hour >= 22) return nope('Game night is from 5 to 10 PM.');
  if (S.today.gameNight) return nope('You already had game night today!');
  const guests = [];
  if (S.neighbors && S.neighbors.people) S.neighbors.people.slice(0, 2).forEach(n => guests.push([n.name.split(' ')[0], n, 'rel']));
  if (S.family.sis) guests.push([S.family.sis.name, S.family.sis, 'rel']);
  (S.friends || []).slice(0, 2).forEach(f => guests.push([f.name, f, 'f']));
  pass(2.5, 'relax'); S.today.gameNight = true; fun2(26); addSkill('comm', 1); addSkill('math', 0.6);
  guests.forEach(([n, o, k]) => o[k] = clamp(o[k] + 8));
  const winner = pickR([S.name, ...guests.map(g => g[0])]);
  log(`🎲 Game night! ${guests.map(g => g[0]).join(', ')} came over. You played ${pickR(['a building-cities game', 'charades', 'a trivia game', 'a word game'])} and ${winner === S.name ? 'YOU won! 🏆' : `${winner} won!`} Everyone laughed so much.`, 'good');
  S.dishes += 3; done();
}

// ---------- 17. photography ----------
function takePhoto() {
  if (!has('camera')) return nope('You need a camera! Buy one at the Mall (Electronics).');
  const pid = placeId(S.loc), p = PLACES[pid];
  const subject = S.loc === 'home' ? (S.pets && S.pets.length ? `${S.pets[0].name} being cute` : 'your cozy room') : eventToday() ? `the ${eventToday().name}` : S.weather === 'snowy' ? `${p.name} covered in snow` : S.rainbow ? `a rainbow over ${p.name}` : p.name;
  if (S.hob.photos.some(ph => ph.subject === subject)) return nope('You already took that picture! Try somewhere new.');
  pass(0.25, 'relax'); fun2(6); addSkill('art', 0.8);
  S.hob.photos.push({ subject, icon: S.loc === 'home' ? '🏠' : p.icon, day: S.day, season: seasonOf() });
  log(`📷 Click! You took a photo of ${subject}. (${S.hob.photos.length} in your album)`, 'good');
  if (S.hob.photos.length >= 15) unlock('photographer');
  done();
}
function albumCard() {
  if (!S.hob.photos.length) return '';
  return `<div class="card"><h3>📸 Photo Album (${S.hob.photos.length})</h3><div class="album">${S.hob.photos.slice(-24).map(ph => `<div class="photo ${ph.season}"><span>${ph.icon}</span><small>${esc(ph.subject)}<br>${dateText(ph.day)}</small></div>`).join('')}</div></div>`;
}
function photoButton() { return has('camera') ? `<button class="btn ghost sm" onclick="takePhoto()">📷 Take a photo</button>` : ''; }

function hobbiesNewDay() { ensureHobbyState(); fosterNewDay(); }
