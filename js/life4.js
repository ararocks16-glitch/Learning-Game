// ===================== LIFE 4: height chart, getting dressed & uniforms, wisdom tooth, photo wall, baking with Grandma, sleepovers,
// pets growing up, aquarium care, science experiments, bike lessons, life-skill lessons, real homework, book club, model kits,
// gardening club, lunch breaks, carpooling, counting change =====================

function ensureLife4State() {
  if (!S.l4) S.l4 = { heights: [], photos: [], recipes: [], models: [], kits: 0, sci: 0, bike: 0, lessons: {}, tank: { clean: 90 }, gardenRibbons: 0, lunch: null, carpool: false };
  if (!S.adultHeight) S.adultHeight = 60 + Math.floor(Math.random() * 14);
  if (!S.outfit) { S.outfit = 'casual'; S.baseLook = { shirt: S.look.shirt, pants: S.look.pants }; }
  if (S.l4.bike === 0 && has('bike') && !S.l4.bikeChecked) S.l4.bike = 3;
  S.l4.bikeChecked = true;
  if (!S.l4.heights.length) S.l4.heights.push({ age: S.age, h: heightAt(S.age) });
}

// ---------- 1. growing taller: a height chart on the wall ----------
function heightAt(age) { const a = S.adultHeight; return age >= 21 ? (age >= 65 ? a - Math.floor((age - 60) / 10) : a) : a - (21 - age) * 0.6; }
function inchesText(h) { return `${Math.floor(h / 12)} ft ${Math.round(h % 12)} in`; }
function heightBirthday() { ensureLife4State(); const h = heightAt(S.age); const last = S.l4.heights[S.l4.heights.length - 1]; S.l4.heights.push({ age: S.age, h }); if (h > last.h) log(`📏 Mom measured you against the wall: you're ${inchesText(h)} tall now — you grew ${Math.round((h - last.h) * 10) / 10} inches!`, 'good'); else log(`📏 You measured yourself on your height chart: ${inchesText(h)}.`); }
function drawHeightChart(c) {
  if (!S.l4) return;
  const x = 773, top = 58, bot = 188;
  c.fillStyle = '#fff8e1'; c.fillRect(x, top, 14, bot - top); c.strokeStyle = '#bcaaa4'; c.lineWidth = 0.6; c.strokeRect(x, top, 14, bot - top);
  c.fillStyle = '#8d6e63'; for (let k = 0; k <= 14; k++) c.fillRect(x, top + k * (bot - top) / 14, k % 2 ? 4 : 8, 0.7);
  S.l4.heights.slice(-6).forEach((e, i) => { const y = bot - (e.h - 40) / 40 * (bot - top); c.fillStyle = ['#e53935', '#1e88e5', '#43a047', '#fb8c00', '#8e24aa', '#00897b'][i % 6]; c.fillRect(x - 3, y, 20, 1.6); });
}

// ---------- 2 & 26. getting dressed, and work uniforms ----------
const OUTFITS = {
  casual:   ['👕', 'Everyday clothes', null],
  rain:     ['🧥', 'Raincoat & rain boots', { shirt: '#fdd835', pants: '#1e3a5f' }, 'raincoat'],
  warm:     ['🧣', 'Winter coat & hat', { shirt: '#c62828', pants: '#3d4650' }, 'coat'],
  fancy:    ['👔', 'Nice outfit', { shirt: '#f5f5f5', pants: '#1e1e1e' }],
  pajamas:  ['🩳', 'Pajamas', { shirt: '#90caf9', pants: '#90caf9' }],
  swim:     ['🩱', 'Swimsuit', { shirt: '#00acc1', pants: '#00acc1' }],
  work:     ['🦺', 'Work uniform', null],
};
const UNIFORMS = { Food: ['#ffffff', '#212121'], Health: ['#4db6ac', '#4db6ac'], Trades: ['#ff9800', '#3e5a7a'], 'Public Service': ['#1a3a6b', '#1a3a6b'], Stores: ['#c62828', '#3d4650'], Transport: ['#455a64', '#263238'], Hospitality: ['#5d4037', '#212121'], Animals: ['#6d8b3a', '#5d4037'], Sports: ['#1565c0', '#eceff1'] };
function outfitColors(k) {
  if (k === 'work') { const job = S.job && JOBS[S.job.id]; const u = job && UNIFORMS[job.cat]; return u ? { shirt: u[0], pants: u[1] } : { shirt: '#f5f5f5', pants: '#24395e' }; }
  if (k === 'casual') return S.baseLook;
  return OUTFITS[k][2];
}
function wearOutfit(k, quiet) {
  ensureLife4State();
  const o = OUTFITS[k];
  if (o[3] && !has(o[3])) return nope(`You don't have a ${o[3] === 'raincoat' ? 'raincoat' : 'winter coat'}. Buy one at the Mall!`);
  if (k === 'fancy' && S.clothes < 2) return nope('You need a nice outfit from the Mall first.');
  if (k === 'work' && !S.job) return nope('You don\'t have a job yet!');
  if (S.outfit === 'casual' || !S.baseLook) S.baseLook = { shirt: S.look.shirt, pants: S.look.pants };
  Object.assign(S.look, outfitColors(k)); S.outfit = k;
  if (k === 'warm') S.today.warm = true;
  if (!quiet) { pass(5 / 60); log(`${o[0]} You got dressed: ${o[1].toLowerCase()}.`); done(); }
}
function dressModal() {
  ensureLife4State();
  const w = S.weather, tip = w === 'rainy' ? '🌧️ It\'s raining — wear rain gear!' : seasonOf() === 'winter' ? '❄️ It\'s cold — bundle up!' : w === 'hot' ? '☀️ It\'s hot — wear something cool!' : '';
  showModal(`<h2>👕 What will you wear?</h2>${tip ? `<p><b>${tip}</b></p>` : ''}<div class="grid actions">${Object.entries(OUTFITS).map(([k, o]) => `<button class="action ${S.outfit === k ? 'sel' : ''}" onclick="closeModal();wearOutfit('${k}')"><span class="ic">${o[0]}</span><b>${o[1]}</b><small>${o[3] && !has(o[3]) ? 'buy at the Mall' : k === 'work' ? (S.job ? 'for your job' : 'get a job first') : S.outfit === k ? 'wearing now' : ''}</small></button>`).join('')}</div>`, [{ label: 'Cancel', cls: 'ghost' }]);
}
function outfitTick(h, mode) {
  if (!S.outfit || mode === 'sleep') return;
  const outside = !atHome() && !S.insideOf;
  if (outside && S.weather === 'rainy' && S.outfit !== 'rain' && !S.today.soaked && Math.random() < 0.5) { S.today.soaked = true; S.needs.hygiene = clamp(S.needs.hygiene - 10); fun2(-6); log('🌧️ You got SOAKED in the rain! Wear your raincoat and boots next time.', 'bad'); }
  if (outside && S.outfit === 'pajamas' && !S.today.pjOut) { S.today.pjOut = true; fun2(-4); log('😳 You went out in your pajamas! People giggled. Get dressed before you leave!'); }
}

// ---------- 3. wisdom tooth (you're too old for baby teeth, so this is the grown-up version!) ----------
function toothNewDay() {
  if (S.l4.wisdom || S.age < 18 || Math.random() > 0.004) return;
  S.l4.wisdom = 'sore';
  log('🦷 Ouch! One of your back teeth is sore. It\'s a wisdom tooth coming in. Go see the dentist at the Hospital!', 'bad');
}
function wisdomCard() {
  if (S.l4.wisdom !== 'sore') return '';
  return `<div class="card warnbox"><h3>🦷 Sore Wisdom Tooth</h3><p>Grown-ups get extra teeth in the back called wisdom teeth. Yours needs to come out!</p><button class="btn sm primary" onclick="pullWisdom()">🦷 Have the dentist take it out (${insured() ? '$40' : '$250'})</button></div>`;
}
function pullWisdom() {
  if (!spend(insured() ? 40 : 250, 'Wisdom tooth removal')) return;
  pass(2); S.l4.wisdom = 'out'; S.needs.health = clamp(S.needs.health - 5);
  queueModal('<h2>🦷 All Done!</h2><p>The dentist took out your wisdom tooth. Your cheeks are a little puffy like a chipmunk 🐿️ — eat soft food like ice cream and soup for a few days!</p><p>That night you found a note from Mom under your pillow: <b>"From the Tooth Fairy — for being brave!"</b> with $5. 😄</p>');
  earn(5, 'A note under your pillow'); done();
}

// ---------- 4. family photo wall ----------
function addPhoto(icon, caption) { ensureLife4State(); S.l4.photos.push({ icon, caption, day: S.day }); if (S.l4.photos.length > 24) S.l4.photos.shift(); }
function drawPhotoWall(c) {
  if (!S.l4 || !S.l4.photos.length) return;
  const ph = S.l4.photos.slice(-6);
  ph.forEach((p, i) => {
    const x = 282 + (i % 3) * 24, y = 30 + Math.floor(i / 3) * 28;
    c.fillStyle = 'rgba(0,0,0,.15)'; c.fillRect(x + 1.5, y + 2, 20, 23);
    c.fillStyle = ['#5d4037', '#f5f5f5', '#d4af37'][i % 3]; c.fillRect(x, y, 20, 23);
    c.fillStyle = ['#bbdefb', '#c8e6c9', '#ffe0b2', '#f8bbd0'][i % 4]; c.fillRect(x + 2.5, y + 2.5, 15, 18);
    c.font = '10px system-ui, "Apple Color Emoji", "Segoe UI Emoji"'; c.textAlign = 'center'; c.fillText(p.icon, x + 10, y + 16); c.textAlign = 'start';
  });
}
function photoWallCard() {
  if (!S.l4 || !S.l4.photos.length) return '';
  return `<div class="card"><h3>🖼️ Family Photo Wall</h3><div class="album">${S.l4.photos.slice().reverse().map(p => `<div class="photo"><span>${p.icon}</span><small>${esc(p.caption)}<br>${dateText(p.day)}</small></div>`).join('')}</div></div>`;
}

// ---------- 5. baking with Grandma ----------
const GRANDMA_RECIPES = [['🍪', 'Secret chocolate chip cookies', 'The secret: a pinch of cinnamon and brown butter!'], ['🥧', 'Apple pie', 'Cut the apples thin and add a little lemon juice.'], ['🍞', 'Banana bread', 'Use the brownest, spottiest bananas — they\'re sweetest!'], ['🧁', 'Lemon cupcakes', 'Zest the lemon before you squeeze it.'], ['🥞', 'Fluffy pancakes', 'Don\'t stir too much — lumps are OK!']];
function bakeWithGrandma() {
  if (S.hour < 9 || S.hour > 19) return nope('Grandma bakes in the daytime.');
  ensureLife4State();
  const next = GRANDMA_RECIPES.find(r => !S.l4.recipes.includes(r[1])) || pickR(GRANDMA_RECIPES);
  const isNew = !S.l4.recipes.includes(next[1]);
  pass(2, 'relax'); S.family.grandma.rel = clamp(S.family.grandma.rel + 12); addSkill('cook', 2); fun2(15); ateFood(15);
  if (isNew) S.l4.recipes.push(next[1]);
  S.pantry.cookies = (S.pantry.cookies || 0) + 4;
  addPhoto('👵', `Baking ${next[1].toLowerCase()} with Grandma`);
  log(`${next[0]} You baked ${next[1].toLowerCase()} with Grandma! ${isNew ? `She told you her secret: "${next[2]}"` : 'It came out perfect!'} She sent 4 treats home with you.`, 'good');
  done();
}

// ---------- 6. sleepovers ----------
function sleepover() {
  const fr = (S.friends || []).filter(f => f.f > 30);
  if (!fr.length) return nope('Invite a close friend — make friends first, then hang out with them a lot!');
  if (S.hour < 17 || S.hour > 21) return nope('Sleepovers start between 5 and 9 PM.');
  showModal(`<h2>🛏️ Who's sleeping over?</h2><div class="guestpick">${fr.map((f, i) => `<button class="guest" onclick="closeModal();doSleepover(${S.friends.indexOf(f)})"><img class="avatar" src="${avatarURL(f.look, 56)}" alt=""><b>${esc(f.name)}</b><small>Age ${f.age}</small></button>`).join('')}</div>`, [{ label: 'Cancel', cls: 'ghost' }]);
}
function doSleepover(i) {
  const f = S.friends[i];
  pass(3, 'relax'); fun2(30); f.f = clamp(f.f + 25); S.mess = clamp(S.mess + 15); S.lateNoise = S.home !== 'parents' && Math.random() < 0.4;
  const movie = pickR(['Space Puppies 3', 'Penguin Party', 'Robot Pals', 'Captain Kindness']);
  const h = S.hour < 7 ? 7 - S.hour : 31 - S.hour; pass(h, 'sleep');
  ateFood(30);
  addPhoto('🛏️', `Sleepover with ${f.name}`);
  queueModal(`<h2>🛏️ Sleepover with ${esc(f.name)}!</h2><p>You built a giant blanket fort with couch cushions 🏰, made popcorn 🍿 and watched "${movie}" with flashlights.</p><p>You stayed up telling jokes until you both fell asleep. In the morning you made pancakes! 🥞</p>`);
  log(`🛏️ ${f.name} slept over! Blanket fort, movie and pancakes. Best friends forever! 💛`, 'good');
  done();
}

// ---------- 7. pets grow up & need checkups ----------
function petStage(p) { const b = baseOf(p); const young = b === 'dog' ? ['Puppy', 'Dog', 'Senior dog'] : b === 'cat' ? ['Kitten', 'Cat', 'Senior cat'] : b === 'bird' ? ['Chick', 'Bird', 'Senior bird'] : ['Baby', 'Grown-up', 'Senior']; return p.age < 270 ? young[0] : p.age < 2900 ? young[1] : young[2]; }
function petCareCard(atVet) {
  if (!S.pets || !S.pets.length) return '';
  const yr = dateOf().year;
  return `<div class="card"><h3>🐾 Growing Up & Checkups</h3><div class="mrows">${S.pets.map((p, i) => mrow(PET_TYPES[p.kind].icon, `${esc(p.name)} · ${petStage(p)}`, `${p.age > 365 ? Math.floor(p.age / 365) + ' years' : p.age + ' days'} old · yearly checkup: ${p.checkup === yr ? '✅ done' : '❗ due this year'}`, atVet ? b(p.checkup === yr ? 'Done ✅' : '🩺 Checkup ($60)', `petCheckup(${i})`, 'primary', p.checkup === yr) : '')).join('')}</div>${atVet ? '' : '<p class="muted small">Take your pets to the 🏥 Vet once a year for a checkup and shots.</p>'}</div>`;
}
function petCheckup(i) {
  const p = S.pets[i]; if (!spend(60, `Checkup for ${p.name}`)) return;
  pass(1); p.checkup = dateOf().year; p.health = 100;
  log(`🩺 The vet checked ${p.name}'s ears, teeth and heart and gave them their yearly shots. ${p.name} got a treat for being brave!`, 'good'); done();
}
function petAgeNewDay() {
  (S.pets || []).forEach(p => {
    if (p.age === 270) log(`🎉 ${p.name} is all grown up now! No longer a ${petStage({ ...p, age: 1 }).toLowerCase()}.`, 'good');
    if (p.checkup !== dateOf().year && dateOf().m >= 6 && Math.random() < 0.01) { p.health = clamp(p.health - 8); log(`🐾 ${p.name} seems a little under the weather. Have they had their yearly vet checkup?`); }
  });
}

// ---------- 8. aquarium care ----------
function hasTank() { return has('aquarium') || (S.pets || []).some(p => baseOf(p) === 'fish'); }
function tankCard() {
  if (!hasTank() || S.loc !== 'home') return '';
  const t = S.l4.tank;
  return `<div class="card"><h3>🐠 Aquarium Care</h3><div class="pbar"><span>💧 Water</span><div class="bar small"><div class="fill ${t.clean < 30 ? 'low' : t.clean < 60 ? 'mid' : 'ok'}" style="width:${t.clean}%"></div></div></div>
    <div class="row"><button class="btn sm ghost" onclick="tankAct('test')">🧪 Test the water</button><button class="btn sm primary" onclick="tankAct('clean')">🧽 Clean the tank (1 hr)</button><button class="btn sm ghost" onclick="tankAct('pinch')">🤏 Feed a pinch</button><button class="btn sm ghost" onclick="tankAct('lots')">🥄 Feed a LOT</button></div></div>`;
}
function tankAct(k) {
  const t = S.l4.tank;
  if (k === 'test') { pass(0.1); log(`🧪 Water test: ${t.clean > 70 ? 'perfect! Clear water, good pH 🟢' : t.clean > 40 ? 'a little dirty — clean it soon 🟡' : 'too dirty! The fish need clean water NOW 🔴'}`); addSkill('sci', 0.5); }
  if (k === 'clean') { pass(1); t.clean = 100; addSkill('animal', 1); log('🧽 You scrubbed the glass, vacuumed the gravel and changed some of the water. Sparkly clean! The fish zoom around happily.', 'good'); }
  if (k === 'pinch') { pass(0.05); t.fed = S.day; (S.pets || []).filter(p => baseOf(p) === 'fish').forEach(p => p.food = 100); log('🤏 You fed the fish a small pinch. They ate it all in 2 minutes — just right!'); }
  if (k === 'lots') { pass(0.05); t.clean = Math.max(0, t.clean - 30); log('🥄 Too much food! The extra food sank and made the water cloudy. Fish only need a pinch they can eat in 2 minutes.', 'bad'); }
  done();
}
function tankNewDay() { if (hasTank()) { S.l4.tank.clean = Math.max(0, S.l4.tank.clean - 4); if (S.l4.tank.clean < 25 && Math.random() < 0.3) log('🐠 Your aquarium water is getting dirty and green. Clean the tank!', 'bad'); } }

// ---------- 11. science experiments at home ----------
const EXPERIMENTS = {
  volcano: ['🌋', 'Baking Soda Volcano', ['Build a volcano out of clay around a cup', 'Add 2 spoons of baking soda', 'Add a squirt of dish soap and red food coloring', 'Pour in the vinegar... and stand back!'], 'WHOOSH! Red foam bubbled out like lava! (Baking soda + vinegar make a gas called carbon dioxide.)'],
  crystals: ['💎', 'Grow Salt Crystals', ['Ask a grown-up for hot water', 'Stir in salt until no more will dissolve', 'Hang a string into the jar', 'Wait a few days and watch'], 'Sparkly crystals grew on the string! (When the water evaporates, the salt makes crystal shapes.)'],
  slime: ['🟢', 'Make Slime', ['Pour glue into a bowl', 'Add a little water and food coloring', 'Slowly add contact solution and stir', 'Knead it with your hands'], 'Stretchy, squishy slime! (The glue molecules link together like a chain.)'],
  egg: ['🥚', 'Egg in Vinegar', ['Put a raw egg in a cup', 'Cover it with vinegar', 'Watch the bubbles form', 'Wait 2 days and gently squeeze it'], 'The shell disappeared and the egg became bouncy! (Vinegar dissolves the shell.)'],
  rainbow: ['🌈', 'Walking Rainbow', ['Line up 5 cups, some with colored water', 'Fold paper towels into strips', 'Bridge the cups with the paper towels', 'Watch the colors walk and mix'], 'The colors climbed the paper and mixed into a rainbow! (Water moves up tiny gaps — that\'s called capillary action.)'],
};
function scienceKit() {
  if (!(S.l4.kits > 0)) return nope('You need a Science Kit! Buy one at the Mall (Toys aisle).');
  showModal(`<h2>🔬 Science Experiments</h2><p class="muted">You have ${S.l4.kits} experiment kit${S.l4.kits > 1 ? 's' : ''}. Safety goggles on! 🥽</p><div class="grid actions">${Object.entries(EXPERIMENTS).map(([k, e]) => `<button class="action" onclick="closeModal();doExperiment('${k}',0)"><span class="ic">${e[0]}</span><b>${e[1]}</b></button>`).join('')}</div>`, [{ label: 'Cancel', cls: 'ghost' }]);
}
function doExperiment(k, step) {
  const e = EXPERIMENTS[k];
  if (step < e[2].length) return showModal(`<h2>${e[0]} ${e[1]}</h2><p class="muted">Step ${step + 1} of ${e[2].length}</p><p style="font-size:1.1rem">${e[2][step]}</p>`, [{ label: step + 1 < e[2].length ? 'Next step ▶' : 'Do it! ✨', cls: 'primary', fn: () => doExperiment(k, step + 1) }]);
  S.l4.kits--; S.l4.sci++; pass(1, 'study'); addSkill('sci', 2.5); fun2(15);
  log(`${e[0]} ${e[1]}: ${e[3]}`, 'good');
  queueModal(`<h2>${e[0]} It Worked!</h2><p>${e[3]}</p>`); done();
}

// ---------- 12. learning to ride a bike ----------
function bikeCard() {
  if (!has('bike') || S.l4.bike >= 3) return '';
  const L = ['Training wheels on', 'Training wheels off — with a grown-up holding on', 'Riding by yourself (wobbly!)', 'Bike pro!'];
  return `<div class="card"><h3>🚲 Learn to Ride Your Bike</h3><p>Level: <b>${L[S.l4.bike]}</b> (${S.l4.bike}/3). You can ride your bike around town once you finish!</p><button class="btn sm primary" onclick="bikePractice()">🚲 Practice (1 hr)</button>${has('helmet') ? '' : '<p class="muted small">⛑️ Wear a helmet! (Car Shop)</p>'}</div>`;
}
function bikePractice() {
  if (S.hour < 8 || S.hour > 19) return nope('Practice in the daytime.');
  pass(1, 'awake'); addSkill('fit', 1); fun2(10);
  if (Math.random() < 0.3 && S.l4.bike > 0) { S.needs.health = clamp(S.needs.health - (has('helmet') ? 1 : 5)); log(`🩹 You wobbled and fell over! ${has('helmet') ? 'Your helmet protected you.' : 'You scraped your knee.'} Get back on and try again!`); return done(); }
  S.l4.bike++;
  log(['', '🚲 You took the training wheels off! Dad held the back of the seat while you pedaled.', '🚲 Dad let go... and you kept going all by yourself!', '🎉 You can ride your bike! Now you can bike anywhere in town.'][S.l4.bike], 'good');
  if (S.l4.bike >= 3) { unlock('biker'); addPhoto('🚲', 'Learned to ride a bike!'); }
  done();
}

// ---------- 13. life-skill lessons: tie shoes, tell time, count money ----------
function lifeSkillsCard() {
  const L = S.l4.lessons;
  return `<div class="card"><h3>🎓 Life Skills Practice</h3><div class="row">
    <button class="btn sm ${L.shoes ? 'ghost' : 'primary'}" onclick="lessonShoes()">👟 Tie your shoes ${L.shoes ? '✅' : ''}</button>
    <button class="btn sm ${L.time ? 'ghost' : 'primary'}" onclick="lessonTime()">🕐 Tell time ${L.time ? '✅' : ''}</button>
    <button class="btn sm ${L.money ? 'ghost' : 'primary'}" onclick="lessonMoney()">🪙 Count money ${L.money ? '✅' : ''}</button></div></div>`;
}
function lessonShoes() {
  const steps = ['Cross the laces into an X', 'Tuck one under and pull tight', 'Make a bunny ear loop', 'Wrap the other lace around the loop', 'Push it through the hole', 'Pull both loops tight'];
  const shuffled = steps.map((s, i) => [s, i]).sort(() => Math.random() - 0.5);
  S.l4.shoeOrder = [];
  showModal(`<h2>👟 Tie Your Shoes</h2><p>Tap the steps in the right order!</p><div class="nicelist" id="shoesteps">${shuffled.map(([s, i]) => `<button class="btn sm ghost" onclick="shoeStep(${i}, this)">${s}</button>`).join('')}</div>`, [{ label: 'Cancel', cls: 'ghost' }]);
}
function shoeStep(i, el) {
  if (i !== S.l4.shoeOrder.length) { el.classList.add('danger'); toast('Not that one yet — what comes next?', 'bad'); return; }
  S.l4.shoeOrder.push(i); el.disabled = true; el.textContent = '✅ ' + el.textContent;
  if (S.l4.shoeOrder.length === 6) { closeModal(); S.l4.lessons.shoes = true; pass(0.1); fun2(8); log('👟 You tied your shoes with a perfect double knot! 🎉', 'good'); done(); }
}
function lessonTime() {
  const h = 1 + Math.floor(Math.random() * 12), m = [0, 15, 30, 45][Math.floor(Math.random() * 4)];
  const right = `${h}:${String(m).padStart(2, '0')}`;
  const opts = [right, `${(h % 12) + 1}:${String(m).padStart(2, '0')}`, `${h}:${String((m + 30) % 60).padStart(2, '0')}`].sort(() => Math.random() - 0.5);
  S.l4.timeAns = right;
  showModal(`<h2>🕐 What time is it?</h2><canvas id="lclock" width="160" height="160" style="display:block;margin:0 auto"></canvas><div class="row" style="justify-content:center">${opts.map(o => `<button class="btn primary" onclick="answerTime('${o}')">${o}</button>`).join('')}</div>`, [{ label: 'Cancel', cls: 'ghost' }]);
  const c = $('#lclock').getContext('2d'), cx = 80, cy = 80;
  c.fillStyle = '#fff'; c.beginPath(); c.arc(cx, cy, 70, 0, Math.PI * 2); c.fill(); c.strokeStyle = '#333'; c.lineWidth = 4; c.stroke();
  c.fillStyle = '#222'; c.font = '700 14px system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle';
  for (let k = 1; k <= 12; k++) { const a = k / 12 * Math.PI * 2; c.fillText(k, cx + Math.sin(a) * 55, cy - Math.cos(a) * 55); }
  const hand = (ang, len, w, col) => { c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.sin(ang) * len, cy - Math.cos(ang) * len); c.stroke(); };
  hand(((h % 12) + m / 60) / 12 * Math.PI * 2, 32, 6, '#222'); hand(m / 60 * Math.PI * 2, 50, 3, '#1565c0');
}
function answerTime(o) { closeModal(); if (o === S.l4.timeAns) { S.l4.lessons.time = true; addSkill('math', 1); fun2(5); log(`🕐 Correct! It's ${o}. The short hand shows the hour, the long hand shows the minutes.`, 'good'); } else log(`🕐 Not quite — it was ${S.l4.timeAns}. The short hand is the hour, the long hand is the minutes. Try again!`); done(); }
function lessonMoney() {
  const coins = []; const kinds = [['🪙 quarter', 25], ['🪙 dime', 10], ['🪙 nickel', 5], ['🪙 penny', 1]];
  let total = 0; for (let k = 0; k < 5; k++) { const c = pickR(kinds); coins.push(c[0]); total += c[1]; }
  const ans = total, opts = [ans, ans + 5, Math.max(1, ans - 10)].sort(() => Math.random() - 0.5);
  S.l4.moneyAns = ans;
  showModal(`<h2>🪙 Count the Money</h2><p>You have: <b>${coins.join(', ')}</b></p><p class="muted small">Quarter = 25¢ · Dime = 10¢ · Nickel = 5¢ · Penny = 1¢</p><div class="row">${opts.map(o => `<button class="btn primary" onclick="answerMoney(${o})">${o}¢</button>`).join('')}</div>`, [{ label: 'Cancel', cls: 'ghost' }]);
}
function answerMoney(o) { closeModal(); if (o === S.l4.moneyAns) { S.l4.lessons.money = true; addSkill('math', 1); log(`🪙 Yes! That's ${o}¢. You're great with money!`, 'good'); } else log(`🪙 Close! It was ${S.l4.moneyAns}¢. Add the big coins first, then the small ones.`); done(); }

// ---------- 14. real homework questions ----------
function realHomework() {
  if (!has('desk')) return nope('You need a desk to do homework. Buy one at the Mall!');
  const qs = [];
  for (let k = 0; k < 3; k++) { const a = 2 + Math.floor(Math.random() * 11), b2 = 2 + Math.floor(Math.random() * 11), op = pickR(['+', '−', '×']); const ans = op === '+' ? a + b2 : op === '−' ? Math.max(a, b2) - Math.min(a, b2) : a * b2; qs.push({ q: op === '−' ? `${Math.max(a, b2)} − ${Math.min(a, b2)} = ?` : `${a} ${op} ${b2} = ?`, ans: String(ans), kind: 'math' }); }
  SPELL.slice().sort(() => Math.random() - 0.5).slice(0, 2).forEach(w => qs.push({ q: 'Which is spelled right?', opts: w.slice().sort(() => Math.random() - 0.5), ans: w[0], kind: 'write' }));
  S.l4.hw = qs;
  showModal(`<h2>📝 Homework</h2>${qs.map((q, i) => `<div class="quiz"><b>${i + 1}. ${q.q}</b>${q.opts ? q.opts.map(o => `<label><input type="radio" name="hw${i}" value="${o}"> ${o}</label>`).join('') : `<input type="number" id="hw${i}" style="width:90px;padding:4px 8px">`}</div>`).join('')}`, [{ label: 'Cancel', cls: 'ghost' }, { label: 'Turn it in ✏️', cls: 'primary', fn: gradeHomework }]);
}
function gradeHomework() {
  let right = 0; S.l4.hw.forEach((q, i) => { const v = q.opts ? (document.querySelector(`input[name="hw${i}"]:checked`) || {}).value : ($(`#hw${i}`) || {}).value; if (String(v).trim() === q.ans) right++; });
  pass(1, 'study'); addSkill('math', 0.6 * right); addSkill('write', 0.4 * right);
  const grade = ['F', 'D', 'C', 'B', 'A', 'A+'][right];
  log(`📝 Homework: ${right}/5 right — grade ${grade}! ${right === 5 ? '⭐ Perfect score!' : 'Check your mistakes and learn from them.'}`, right >= 4 ? 'good' : '');
  queueModal(`<h2>📝 Grade: ${grade}</h2><ul class="notes">${S.l4.hw.map(q => `<li>${q.q.replace('= ?', '=')} <b>${q.ans}</b></li>`).join('')}</ul>`);
  done();
}

// ---------- 15. library storytime & book club ----------
function libraryClubCard() {
  const club = weekday() === 3 && S.hour >= 16 && S.hour < 18;
  return `<div class="card"><h3>📖 Storytime & Book Club</h3><div class="mrows">
    ${mrow('🧸', 'Read to little kids at storytime', 'Volunteer · 1 hr · they love silly voices!', b('Read aloud', 'storytime()'))}
    ${mrow('📚', 'Book club', 'Thursdays 4–6 PM · talk about a book you finished', b(club ? 'Join' : 'Thursdays only', 'bookClub()', 'primary', !club))}</div></div>`;
}
function storytime() { if (S.hour < 9 || S.hour > 17) return nope('Storytime is during the day.'); pass(1, 'awake'); addSkill('comm', 1); addSkill('write', 0.6); fun2(10); S.volunteerHours = (S.volunteerHours || 0) + 1; log(`🧸 You read "${pickR(['The Very Hungry Caterpillar', 'Goodnight Moon', 'a book about trucks', 'a story about a brave little duck'])}" to the little kids using funny voices. They giggled the whole time!`, 'good'); done(); }
function bookClub() {
  if (!(S.lib && S.lib.read > (S.l4.clubRead || 0))) return nope('Finish reading a library book first so you have something to talk about!');
  S.l4.clubRead = S.lib.read; pass(1.5, 'relax'); addSkill('comm', 1.5); fun2(12);
  (S.friends || []).slice(0, 2).forEach(f => f.f = clamp(f.f + 8));
  log(`📚 Book club: everyone shared their favorite part of the book. ${pickR(['You all agreed the ending was a surprise!', 'There was a big debate about the main character!', 'You picked next month\'s book together.'])}`, 'good'); done();
}

// ---------- 16. model kits ----------
const MODELS = { car: ['🏎️', 'Model race car'], plane: ['🛩️', 'Model airplane'], ship: ['⛵', 'Model sailboat'], rocket: ['🚀', 'Model rocket'], train: ['🚂', 'Model steam train'] };
function modelCard() {
  const cur = S.l4.model;
  return `<div class="card"><h3>🛠️ Model Building</h3>${cur ? `<p>Building: ${MODELS[cur.k][0]} ${MODELS[cur.k][1]} — step ${cur.step}/3 (${['glue the pieces', 'paint it', 'add the stickers'][cur.step]})</p><button class="btn sm primary" onclick="buildModel()">🛠️ Keep building (1 hr)</button>` : '<p class="muted">Buy a model kit at the Mall (Toys aisle).</p>'}
    ${S.l4.models.length ? `<p>Your shelf: ${S.l4.models.map(k => MODELS[k][0]).join(' ')}</p>` : ''}</div>`;
}
function buildModel() {
  const cur = S.l4.model; if (!cur) return;
  pass(1, 'relax'); addSkill('build', 1.5); addSkill('art', 0.6); fun2(8);
  log(`🛠️ You ${['glued all the tiny pieces together (carefully!)', 'painted it with a tiny brush', 'added the stickers and decals'][cur.step]}.`);
  cur.step++;
  if (cur.step >= 3) { S.l4.models.push(cur.k); log(`🎉 Your ${MODELS[cur.k][1].toLowerCase()} is finished! It's on your shelf now.`, 'good'); S.l4.model = null; }
  done();
}

// ---------- 17. gardening club ----------
function gardenClubCard() {
  if (gardenSize() === 0 || S.loc !== 'home') return '';
  const judge = weekday() === 6 && dateOf().d > MDAYS[dateOf().m] - 7 && ['spring', 'summer'].includes(seasonOf());
  return `<div class="card"><h3>🌷 Street Gardening Club</h3><p class="muted">Every spring and summer month, the judges walk down the street on the last Sunday and pick the prettiest garden. Ribbons won: ${S.l4.gardenRibbons} 🎀</p>${judge ? '<button class="btn sm primary" onclick="gardenJudge()">🌷 Show the judges your garden!</button>' : ''}</div>`;
}
function gardenJudge() {
  if (S.l4.judged === S.day) return nope('The judges already came today.');
  S.l4.judged = S.day; pass(0.5);
  const live = S.garden.filter(p => !p.dead).length, flowers = S.garden.filter(p => !p.dead && p.kind === 'sunflower').length;
  const score = live * 15 + flowers * 15 + (has('fence') ? 10 : 0) + (S.mess < 40 ? 10 : 0) + Math.random() * 20;
  if (score >= 60) { S.l4.gardenRibbons++; earn(30, 'Gardening club prize'); log('🎀 The judges loved your garden! You won the "Prettiest Garden on the Street" ribbon and $30!', 'good'); }
  else log(`🌷 The judges said your garden is off to a nice start. Plant more (sunflowers are pretty!) and keep it watered.`);
  done();
}

// ---------- 27. lunch break at work ----------
function packLunch() {
  if (S.l4.lunch === S.day) return nope('You already packed a lunch today!');
  const items = ['bread', 'cheese', 'apples', 'bananas'].filter(id => countFood(id) > 0);
  if (!items.length) return nope('Nothing to pack! Buy bread, cheese or fruit at the Supermarket.');
  useFood(items[0]); if (items[1]) useFood(items[1]);
  S.l4.lunch = S.day; pass(0.2);
  log(`🥪 You packed a lunch (${items.slice(0, 2).map(i => FOODS[i].name.toLowerCase()).join(' and ')}) in a lunch box. That saves money!`); done();
}
function lunchAtWork() {
  if (S.l4.lunch === S.day) { ateFood(35); log('🥪 Lunch break: you ate the lunch you packed. Yum, and it was free!'); }
  else { charge(9, 'Lunch at work'); ateFood(35); log('🍔 Lunch break: you forgot to pack a lunch, so you bought one for $9. Packing lunch saves money!'); }
}

// ---------- 28. carpooling ----------
function carpoolCard() {
  if (!S.job || !S.job.coworkers || !S.job.coworkers.length) return '';
  const w = S.job.coworkers[0];
  return `<div class="card"><h3>🚗 Carpool</h3><p>${S.l4.carpool ? `✅ You carpool with ${esc(w.name)}. You take turns driving and share gas money!` : `Your coworker ${esc(w.name)} lives near you. Ride together to save gas and have someone to talk to!`}</p><button class="btn sm ${S.l4.carpool ? 'ghost' : 'primary'}" onclick="S.l4.carpool=!S.l4.carpool;log(S.l4.carpool?'🚗 You started carpooling with ${esc(w.name).replace(/'/g, '')}!':'🚗 You stopped carpooling.');render()">${S.l4.carpool ? 'Stop carpooling' : 'Start carpooling'}</button></div>`;
}
function carpoolRide(dest) {
  if (!S.l4 || !S.l4.carpool || !S.job || dest !== workplaceOf(JOBS[S.job.id])) return false;
  const w = S.job.coworkers && S.job.coworkers[0]; if (!w) return false;
  if (hasCar()) S.fuel = Math.min(100, S.fuel + 3);
  fun2(3); if (Math.random() < 0.2) log(`🚗 Carpool: you and ${w.name} sang along to the radio on the way to work. 🎶`);
  return true;
}

// ---------- 29. counting your change at the store ----------
function changeQuiz(price) {
  if (Math.random() > 0.35 || price >= 500) return;
  const paid = price < 5 ? 5 : price < 10 ? 10 : price < 20 ? 20 : price < 50 ? 50 : price < 100 ? 100 : Math.ceil(price / 100) * 100;
  const change = Math.round((paid - price) * 100) / 100;
  const wrong = Math.random() < 0.25, given = wrong ? Math.round((change - 1) * 100) / 100 : change;
  S.l4.changeQ = { change, given, wrong };
  queueModal(`<h2>💵 Count Your Change</h2><p>The total was <b>${money(price)}</b>. You paid with a <b>$${paid} bill</b>.</p><p>The cashier gave you <b>${money(given)}</b> back. Is that right?</p>
    <div class="row"><button class="btn primary" onclick="closeModal();changeAnswer(true)">✅ Yes, that's right</button><button class="btn ghost" onclick="closeModal();changeAnswer(false)">❌ No, that's wrong</button></div><p class="muted small">Hint: ${paid} − ${price} = ?</p>`);
}
function changeAnswer(saysRight) {
  const q = S.l4.changeQ; if (!q) return;
  const correct = saysRight === !q.wrong;
  if (correct) { addSkill('math', 0.8); if (q.wrong) { earn(1, 'Correct change'); log(`💵 Good catch! The cashier gave you $1 too little. They said sorry and gave you the right change: ${money(q.change)}.`, 'good'); } else log(`💵 You counted your change: ${money(q.change)}. Correct!`, 'good'); }
  else log(q.wrong ? `💵 Oops — the cashier gave you $1 too little and you didn't notice. Always count your change!` : `💵 Actually, ${money(q.change)} WAS right. Count carefully: subtract the price from what you paid.`);
  S.l4.changeQ = null; done();
}

function life4NewDay() { ensureLife4State(); toothNewDay(); petAgeNewDay(); tankNewDay(); if (isBirthday()) { heightBirthday(); addPhoto('🎂', `Turning ${S.age}`); } }

// ---------- the "Do Work" button: go to your job, then do your job's tasks ----------
const WORK_TASKS = {
  Food: ['🧑‍🍳 Prep the ingredients', '🍳 Cook the orders', '🍽️ Serve the customers', '🧽 Clean the kitchen'],
  Stores: ['📦 Stock the shelves', '🛒 Help customers find things', '💵 Run the cash register', '🧹 Tidy the aisles'],
  Office: ['📧 Answer emails', '📊 Make a report', '📞 Call customers', '🗂️ File papers'],
  Health: ['🩺 Check on patients', '💊 Help with medicine', '📝 Update the charts', '🧼 Clean and sanitize'],
  Education: ['📚 Plan the lesson', '👩‍🏫 Teach the class', '✏️ Grade papers', '🤝 Help students one-on-one'],
  Trades: ['📏 Measure twice', '🔨 Build and fix', '🦺 Check safety gear', '🧹 Clean up the work site'],
  Transport: ['🗺️ Check the route', '📦 Load up', '🛣️ Drive safely', '✅ Deliver everything'],
  Tech: ['💻 Write code', '🐞 Fix bugs', '🧪 Test everything', '🤝 Team meeting'],
  Arts: ['🎨 Brainstorm ideas', '🎭 Practice and rehearse', '✨ Create', '🎤 Show your work'],
  Science: ['🔬 Set up the experiment', '📈 Collect data', '🧪 Test the samples', '📝 Write up the results'],
  Animals: ['🥕 Feed the animals', '🧽 Clean the pens', '🩺 Check their health', '🐾 Exercise and play with them'],
  'Public Service': ['📻 Morning team meeting', '🚶 Help people in town', '📋 Write reports', '🛡️ Safety check'],
  Sports: ['🏃 Warm up', '⚽ Practice drills', '🏆 Coach or play', '🧊 Cool down and stretch'],
  Hospitality: ['🛎️ Greet guests', '🛏️ Get rooms ready', '📞 Answer questions', '🧹 Tidy the lobby'],
};
const TASK_CHEERS = ['Great job! 👏', 'Nailed it! ✅', 'Your boss noticed! 👀', 'Smooth work! 😎', 'Done and done! 💪'];
function atWork() { return S.job && placeId(S.loc) === workplaceOf(JOBS[S.job.id]); }
function canWorkNow() { const j = S.job; if (!j) return false; const sh = shiftNow(); return worksToday() && !S.today.worked && !S.today.sick && S.day >= j.startDay && S.hour >= sh.from && S.hour < sh.to; }
async function goToJob() {
  const j = S.job; if (!j) return;
  const sh = shiftNow();
  if (S.day < j.startDay) return nope('Your first day is tomorrow!');
  if (!worksToday()) return nope('You don\'t work today. Enjoy your day off! 🎉');
  if (S.today.worked) return nope('You already worked today.');
  if (S.hour < sh.from - 1.5) return nope(`It's too early. Your shift starts at ${fmtTime(sh.from + 0.5)}.`);
  await travelTo(workplaceOf(JOBS[j.id]));
  S.insideOf = workplaceOf(JOBS[j.id]); render();
}
function doWork() {
  if (!S.job) return nope('Get a job first!');
  if (!atWork()) return nope('Go to your workplace first!');
  if (!canWorkNow()) { const sh = shiftNow(); return nope(S.today.worked ? 'You already worked today. Great job!' : S.hour < shiftNow().from ? `Your shift starts at ${fmtTime(sh.from + 0.5)}.` : !worksToday() ? 'You don\'t work today.' : 'It\'s too late to start your shift today.'); }
  S.workTasks = 0;
  showWorkTasks();
}
function showWorkTasks() {
  const job = JOBS[S.job.id], list = WORK_TASKS[job.cat] || WORK_TASKS.Office, n = S.workTasks || 0;
  showModal(`<h2>💼 Work: ${esc(jobTitle(S.job))}</h2><p class="muted">Do your tasks one at a time. Lunch break comes after task 2!</p>
    <div class="mrows">${list.map((t, i) => mrow(i < n ? '✅' : i === n ? '👉' : '⬜', t, i < n ? 'Done!' : i === n ? '2 hours' : '', i === n ? b('Do it', `workTask()`) : '')).join('')}</div>
    ${n >= list.length ? '<p><b>All done! 🎉</b> Time to clock out.</p>' : ''}`,
    n >= list.length ? [{ label: '🕔 Clock out', cls: 'primary', fn: () => { goWork(); } }] : [{ label: 'Take a break (come back later)', cls: 'ghost' }]);
}
function workTask() {
  const list = WORK_TASKS[JOBS[S.job.id].cat] || WORK_TASKS.Office;
  S.workTasks = (S.workTasks || 0) + 1;
  toast(`${list[S.workTasks - 1]} — ${pickR(TASK_CHEERS)}`);
  showWorkTasks();
}
function doWorkCard(pid) {
  if (!S.job || workplaceOf(JOBS[S.job.id]) !== pid) return '';
  const ok = canWorkNow();
  return `<div class="card job"><h3>💼 You work here: ${esc(jobTitle(S.job))}</h3>
    <p class="muted">${S.today.worked ? '✅ You already worked today. See you next shift!' : ok ? 'Your shift is now! Press the button to start working.' : `Shift: ${SHIFTS[shiftOf(JOBS[S.job.id])].label}`}</p>
    <button class="btn primary big" ${ok ? '' : 'disabled'} onclick="doWork()">💼 Do Work</button></div>`;
}
