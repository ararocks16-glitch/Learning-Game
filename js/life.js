// ===================== EVERYDAY REAL LIFE =====================
// Water, getting sick, the cold, chores & trash day, real groceries & recipes,
// haircuts, emergencies (smoke alarm, power outage, 911) and volunteering.

NEEDS.thirst = { name: 'Water', icon: '💧' };

function ensureLifeState() {
  const n = S.needs;
  if (n.thirst === undefined) { S.needs = { food: n.food, thirst: 80, energy: n.energy, hygiene: n.hygiene, bladder: n.bladder, fun: n.fun, health: n.health }; }
  if (S.mess === undefined) { S.mess = 10; S.dishes = 0; S.trash = 10; S.bin = 0; S.eco = 0; }
  if (!S.fridgeFood) S.fridgeFood = [];
  if (S.hairDays === undefined) S.hairDays = 10;
  if (S.lightsOn === undefined) S.lightsOn = true;
  if (S.volunteerHours === undefined) S.volunteerHours = 0;
  if (S.medicine === undefined) S.medicine = 0;
  if (S.taxRefundDone === false) S.taxRefundDone = true;   // replaced by yearly taxes
}

// ---------- every hour ----------
const THIRST = { awake: 5, work: 5.5, study: 5, sport: 11, relax: 4, sleep: 1.4 };
function lifeTick(h, mode) {
  const n = S.needs;
  n.thirst = clamp(n.thirst - THIRST[mode] * h * (S.weather === 'hot' ? 1.5 : 1));
  if (n.thirst <= 0) { n.health -= 2 * h; n.energy -= 1 * h; }
  // being sick
  const ill = S.ill && ILLNESS[S.ill.type];
  if (ill && mode !== 'sleep') { n.energy -= ill.energy * h; n.fun -= ill.fun * h; if (mode === 'sport') n.health -= 2 * h; }
  // cold outside in winter without a coat
  if (seasonOf() === 'winter' && mode !== 'sleep' && !atHome() && !S.insideOf && !has('coat')) {
    n.health -= 1.2 * h; n.fun -= 1.5 * h; S.gotCold = (S.gotCold || 0) + h;
  }
  // a messy home is no fun
  if (atHome() && mode !== 'sleep' && S.mess > 60) n.fun -= 0.6 * h;
  // electricity
  useKwh(h, mode);
}

// ---------- every day ----------
function lifeNewDay() {
  ensureLifeState();
  S.hairDays++;
  // chores pile up
  const pets = (S.pets || []).length;
  S.mess = clamp(S.mess + 6 + pets * 3);
  S.trash = clamp(S.trash + 12);
  if (S.trash >= 100) { S.mess = clamp(S.mess + 10); }
  if ((S.mess > 85 || S.dishes > 10) && !S.bugs && Math.random() < 0.4) { S.bugs = true; log('🐜 Ants found the dirty dishes and crumbs! Clean up and buy bug spray at the Supermarket.', 'bad'); queueModal('<h2>🐜 Ants in the Kitchen!</h2><p>Dirty dishes and crumbs attracted ants. Gross!</p><p class="lesson">💡 Wash dishes and take out the trash so bugs don\'t move in. Bug spray from the Supermarket gets rid of them.</p>'); }
  if (S.bin > 4) { log('🦨 Your outside trash bin is overflowing and smelly! Put it at the curb on Tuesday morning.', 'bad'); }
  // trash day happened yesterday?
  // food goes bad
  const spoiled = S.fridgeFood.filter(f => f.exp <= S.day);
  if (spoiled.length) {
    const names = [...new Set(spoiled.map(f => FOODS[f.id].name.toLowerCase()))];
    log(`🤢 Some food went bad: ${names.join(', ')}. Throw it out! (Eat fresh food before it expires.)`, 'bad');
    S.fridgeFood = S.fridgeFood.filter(f => f.exp > S.day);
    S.trash = clamp(S.trash + 5);
  }
  if (!hasF('fridge')) S.fridgeFood = S.fridgeFood.filter(f => !FOODS[f.id].cold);
  // getting sick
  if (S.ill) {
    S.ill.days--;
    if (S.ill.days <= 0) { log(`😊 You're all better! No more ${ILLNESS[S.ill.type].name.toLowerCase()}.`, 'good'); S.ill = null; }
  } else {
    const se = seasonOf();
    let cold = 0.025 + (se === 'winter' ? 0.04 : se === 'fall' ? 0.015 : 0) + (S.needs.hygiene < 30 ? 0.04 : 0) + (S.gotCold > 2 ? 0.1 : 0);
    let flu = se === 'winter' && S.fluShot !== dateOf().year ? 0.025 : 0;
    if (perk('safety')) cold *= 0.9;
    if (Math.random() < flu) getSick('flu');
    else if (Math.random() < cold) getSick('cold');
  }
  S.gotCold = 0;
  if (S.powerOut) { S.powerOut -= 24; if (S.powerOut <= 0) S.powerOut = 0; }
}

// ---------- water & drinks ----------
function drink(where) {
  pass(2 / 60);
  S.needs.thirst = clamp(S.needs.thirst + (where === 'fountain' ? 40 : 60));
  S.needs.bladder = clamp(S.needs.bladder - 10);
  log(where === 'fountain' ? '🚰 You drank from the water fountain.' : where === 'bottle' ? '🥤 You drank from your water bottle.' : '💧 You drank a big glass of water. Refreshing!');
}
function quickDrink() {
  if (atHome() && S.doorOpen) drink('tap');
  else if (S.insideOf) drink('fountain');
  else if (has('bottle')) drink('bottle');
  else return nope('There\'s no water here! Go inside somewhere, or buy a reusable water bottle at the Mall.');
  done();
}
function drinkSoda() {
  if (!spend(2, 'Soda')) return;
  S.needs.thirst = clamp(S.needs.thirst + 30); S.needs.bladder = clamp(S.needs.bladder - 10); fun2(5); S.needs.health = clamp(S.needs.health - 1); S.plaque = (S.plaque || 0) + 0.4;
  log('🥤 You drank a soda. Sweet and fizzy... but water is healthier for your body and teeth!'); done();
}

// ---------- getting sick ----------
const ILLNESS = {
  cold:    { name: 'Cold', icon: '🤧', days: 5, energy: 0.8, fun: 0.8, perf: 10, about: 'A runny nose, sneezing and a sore throat.' },
  flu:     { name: 'Flu', icon: '🤒', days: 8, energy: 1.6, fun: 1.2, perf: 25, about: 'A fever, aches and feeling super tired.' },
  stomach: { name: 'Stomach Bug', icon: '🤢', days: 2, energy: 1, fun: 1.5, perf: 20, about: 'A tummy ache from germs. Wash your hands!' },
  arm:     { name: 'Broken Arm', icon: '🦾', days: 21, energy: 0, fun: 0.5, perf: 15, about: 'Your arm is in a cast. No sports until it heals!' },
};
function getSick(type) {
  if (S.ill) return;
  const t = ILLNESS[type];
  S.ill = { type, days: t.days };
  log(`${t.icon} You got a ${t.name.toLowerCase()}. ${t.about}`, 'bad');
  queueModal(`<h2>${t.icon} You Have a ${t.name}</h2><p>${t.about}</p>
    <ul class="notes"><li>😴 Rest and sleep a lot</li><li>💊 Take medicine (from the Supermarket)</li><li>🩺 A doctor can help you get better faster</li>${type !== 'arm' ? '<li>📞 You can call in sick to work</li>' : '<li>🚫 No sports until your cast comes off</li>'}<li>💧 Drink lots of water</li></ul>
    <p class="muted">It should take about ${t.days} days to get better.</p>`);
}
function takeMedicine() {
  if (!S.ill) return nope('You\'re not sick. Only take medicine when you need it!');
  if (S.ill.type === 'arm') return nope('Medicine won\'t fix a broken arm. It needs time to heal.');
  if (S.medicine < 1) return nope('You don\'t have any medicine. Buy some at the Supermarket.');
  if (S.today.tookMeds) return nope('You already took medicine today. Always follow the directions on the box!');
  S.medicine--; S.today.tookMeds = true; S.ill.days = Math.max(0, S.ill.days - 1); S.needs.health = clamp(S.needs.health + 6);
  log('💊 You took your medicine with a glass of water. You feel a little better.'); done();
}
function sportsInjury() {
  if (S.ill || Math.random() > 0.02) return false;
  S.ill = { type: 'arm', days: 21 };
  const insured = S.insurance || (S.job && JOBS[S.job.id].insurance);
  const bill = insured ? 150 : 1200;
  charge(bill, 'Emergency room: broken arm');
  log(`🦾 Ouch! You fell and broke your arm. The emergency room put on a cast. Bill: ${money(bill)}.`, 'bad');
  queueModal(`<h2>🦾 You Broke Your Arm!</h2><p>You fell while playing. The emergency room took an X-ray and put your arm in a cast.</p><p>Bill: <b>${money(bill)}</b>${insured ? ' (insurance paid most of it)' : ''}</p><p>No sports for 3 weeks while it heals.</p><p class="lesson">💡 Accidents happen. This is why health insurance matters.</p>`);
  return true;
}
function fluShot() {
  if (S.fluShot === dateOf().year) return nope('You already got your flu shot this year.');
  const insured = S.insurance || (S.job && JOBS[S.job.id].insurance);
  if (!spend(insured ? 0 : 25, 'Flu shot')) return;
  pass(0.5); S.fluShot = dateOf().year;
  log('💉 You got a flu shot. Much less chance of getting the flu this winter!', 'good'); done();
}

// ---------- chores ----------
function doDishes() {
  if (!S.dishes) return nope('No dirty dishes. Nice!');
  pass(Math.min(1, S.dishes * 0.08)); S.dishes = 0; S.mess = clamp(S.mess - 10); S.handsDirty = false;
  if (S.bugs && S.mess < 40) { S.bugs = false; log('🐜 The ants left once the kitchen was clean.'); }
  log('🍽️ You washed all the dishes. Sparkly!'); choreAllowance(); done();
}
function vacuum() {
  pass(0.75); S.mess = clamp(S.mess - 45); fun2(3);
  log('🧹 You vacuumed and tidied up. Your place looks great!'); choreAllowance(); done();
}
function choreAllowance() {
  if (S.home === 'parents' && !S.today.allowance) { S.today.allowance = true; earn(5, 'Chore money from Mom'); log('👩 Mom gave you $5 for helping with chores!'); }
}
const SORT_ITEMS = [
  ['🥫', 'Empty soup can', 'recycle'], ['📰', 'Old newspaper', 'recycle'], ['🍾', 'Glass bottle', 'recycle'], ['📦', 'Cardboard box (flattened)', 'recycle'],
  ['🍌', 'Banana peel', 'compost'], ['🍎', 'Apple core', 'compost'], ['☕', 'Coffee grounds', 'compost'], ['🥚', 'Egg shells', 'compost'],
  ['🍫', 'Candy wrapper', 'trash'], ['🧻', 'Used tissue', 'trash'], ['🍕', 'Greasy pizza box', 'trash'], ['🥤', 'Chip bag', 'trash'],
];
function takeOutTrash() {
  if (S.trash < 10) return nope('The trash is almost empty.');
  const pick = [...SORT_ITEMS].sort(() => Math.random() - 0.5).slice(0, 4);
  showModal(`<h2>🗑️ Sort the Trash</h2><p>Before you take it out, put each thing in the right bin!</p>
    <div class="sortgrid">${pick.map((it, i) => `<div class="sortrow"><span>${it[0]} ${it[1]}</span><div><label><input type="radio" name="s${i}" value="trash">🗑️ Trash</label><label><input type="radio" name="s${i}" value="recycle">♻️ Recycle</label><label><input type="radio" name="s${i}" value="compost">🍂 Compost</label></div></div>`).join('')}</div>`,
    [{ label: 'Done sorting', cls: 'primary', keepOpen: true, fn: () => {
      let right = 0; const notes = [];
      pick.forEach((it, i) => { const v = (document.querySelector(`input[name="s${i}"]:checked`) || {}).value; if (v === it[2]) right++; else notes.push(`${it[0]} ${it[1]} goes in <b>${{ trash: '🗑️ trash', recycle: '♻️ recycling', compost: '🍂 compost' }[it[2]]}</b>.`); });
      closeModal();
      pass(0.2); S.trash = 0; S.bin += 1; S.eco += right; S.mess = clamp(S.mess - 5);
      if (S.eco >= 20) unlock('eco');
      log(`🗑️ You took out the trash and sorted it: ${right}/4 right.`, right === 4 ? 'good' : '');
      showModal(`<h2>${right === 4 ? '🌍 Perfect sorting!' : `♻️ ${right} out of 4`}</h2>${notes.length ? `<ul class="notes">${notes.map(n => `<li>${n}</li>`).join('')}</ul>` : '<p>Everything went in the right bin. The planet thanks you!</p>'}
        <p class="lesson">💡 Recycling turns old things into new things. Compost turns food scraps into dirt for gardens. Trash goes to a landfill.</p>
        <p class="muted">The trash truck comes on <b>Tuesday mornings</b>. Roll your bin to the curb before 8 AM!</p>`, [{ label: 'OK' }]);
      done(false);
    } }]);
}
function binsToCurb() {
  if (weekday() !== 1 || S.hour >= 8) return nope('Trash day is Tuesday. Put the bin out before 8 AM!');
  if (!S.bin) return nope('Your outside bin is already empty.');
  S.today.binOut = true; pass(0.1);
  log('🚛 You rolled the bin to the curb. The garbage truck will pick it up this morning!');
  S.bin = 0; done();
}
function bugSpray() {
  if (!S.bugs) return nope('No bugs right now!');
  if (!S.bugSpray) return nope('You need bug spray from the Supermarket.');
  S.bugSpray--; S.bugs = false; pass(0.2); log('🐜 You sprayed the ants. They\'re gone! Now keep the kitchen clean so they don\'t come back.'); done();
}

// ---------- real groceries & recipes ----------
const FOODS = {
  milk:    { name: 'Milk', icon: '🥛', price: 4, units: 4, shelf: 7, cold: true, snack: [10, 20] },
  eggs:    { name: 'Eggs', icon: '🥚', price: 5, units: 6, shelf: 21, cold: true },
  bread:   { name: 'Bread', icon: '🍞', price: 3, units: 4, shelf: 5 },
  cheese:  { name: 'Cheese', icon: '🧀', price: 6, units: 4, shelf: 20, cold: true, snack: [10, 0] },
  apples:  { name: 'Apples', icon: '🍎', price: 4, units: 4, shelf: 12, snack: [12, 5] },
  bananas: { name: 'Bananas', icon: '🍌', price: 3, units: 5, shelf: 6, snack: [12, 0] },
  chicken: { name: 'Chicken', icon: '🍗', price: 9, units: 2, shelf: 3, cold: true },
  veggies: { name: 'Veggies', icon: '🥦', price: 5, units: 4, shelf: 6, cold: true },
  pasta:   { name: 'Pasta', icon: '🍝', price: 2, units: 4, shelf: 365 },
  sauce:   { name: 'Tomato Sauce', icon: '🥫', price: 3, units: 3, shelf: 365 },
  rice:    { name: 'Rice', icon: '🍚', price: 3, units: 5, shelf: 365 },
  tortillas: { name: 'Tortillas', icon: '🫓', price: 3, units: 4, shelf: 10 },
};
const RECIPES = [
  { id: 'spaghetti', name: 'Spaghetti', icon: '🍝', needs: ['pasta', 'sauce'], extra: 'cheese', food: 55, hours: 0.75 },
  { id: 'pancakes', name: 'Pancakes', icon: '🥞', needs: ['eggs', 'milk'], food: 45, hours: 0.5 },
  { id: 'tacos', name: 'Tacos', icon: '🌮', needs: ['tortillas', 'chicken', 'cheese'], extra: 'veggies', food: 60, hours: 0.75 },
  { id: 'omelet', name: 'Cheese Omelet', icon: '🍳', needs: ['eggs', 'cheese'], extra: 'veggies', food: 40, hours: 0.4 },
  { id: 'grilled', name: 'Grilled Cheese', icon: '🥪', needs: ['bread', 'cheese'], food: 40, hours: 0.3 },
  { id: 'chickenrice', name: 'Chicken & Rice', icon: '🍛', needs: ['chicken', 'rice', 'veggies'], food: 65, hours: 1, health: 5 },
  { id: 'salad', name: 'Garden Salad', icon: '🥗', needs: ['veggies', 'apples'], food: 30, hours: 0.3, health: 6 },
  { id: 'smoothie', name: 'Fruit Smoothie', icon: '🍹', needs: ['bananas', 'milk'], extra: 'apples', food: 25, hours: 0.2, thirst: 35, noStove: true },
];
const countFood = id => S.fridgeFood.filter(f => f.id === id).length;
function useFood(id) { const list = S.fridgeFood.filter(f => f.id === id).sort((a, b) => a.exp - b.exp); if (!list.length) return false; S.fridgeFood.splice(S.fridgeFood.indexOf(list[0]), 1); return true; }
function buyFood(id) {
  const f = FOODS[id];
  if (S.hour < 7 || S.hour > 22) return nope('The store is closed.');
  if (!spend(f.price, f.name)) return;
  for (let k = 0; k < f.units; k++) S.fridgeFood.push({ id, exp: S.day + f.shelf });
  log(`${f.icon} You bought ${f.name.toLowerCase()} (${f.units}). ${f.shelf < 365 ? `Good for ${f.shelf} days.` : 'It won\'t go bad.'}`);
  if (f.cold && !hasF('fridge')) toast('⚠️ No fridge at home — this will spoil fast!', 'bad');
  render();
}
function recipeModal() {
  if (!S.fridgeFood.length) return nope('Your kitchen is empty! Buy real groceries in the Supermarket\'s grocery aisle.');
  showModal(`<h2>👩‍🍳 Cook a Recipe</h2><p class="muted">Better Cooking skill = tastier food. You need a stove (except for smoothies).</p>
    <div class="grid actions">${RECIPES.map(r => { const ok = r.needs.every(n => countFood(n) > 0) && (r.noStove || hasF('stove')); return `<button class="action ${ok ? '' : 'locked'}" ${ok ? '' : 'disabled'} onclick="cookRecipe('${r.id}')"><span class="ic">${r.icon}</span><b>${r.name}</b><small>${r.needs.map(n => `${countFood(n) ? '✅' : '❌'}${FOODS[n].icon}`).join(' ')}${r.extra ? ` + ${FOODS[r.extra].icon}?` : ''}</small></button>`; }).join('')}</div>`, [{ label: 'Close', cls: 'ghost' }]);
}
function cookRecipe(id) {
  const r = RECIPES.find(x => x.id === id);
  closeModal();
  if (!r.noStove && !hasF('stove')) return nope('You need a stove.');
  if (!r.needs.every(n => countFood(n) > 0)) return nope('You\'re missing ingredients.');
  r.needs.forEach(useFood);
  const bonus = r.extra && useFood(r.extra);
  if (S.powerOut && !r.noStove) return nope('The power is out! The stove doesn\'t work.');
  pass(r.hours);
  const skill = S.skills.cook;
  ateFood(r.food + (bonus ? 10 : 0));
  if (r.thirst) S.needs.thirst = clamp(S.needs.thirst + r.thirst);
  S.needs.health = clamp(S.needs.health + (r.health || 2));
  S.dishes += 2; S.mess = clamp(S.mess + 4); S.trash = clamp(S.trash + 4);
  addSkill('cook', 2.5);
  const taste = skill > 60 ? 'Restaurant quality! 🤩' : skill > 30 ? 'Really tasty!' : Math.random() < 0.4 ? 'A little burnt... but you ate it.' : 'Pretty good!';
  fun2(skill > 30 ? 10 : 4);
  log(`${r.icon} You cooked ${r.name.toLowerCase()}${bonus ? ` with extra ${FOODS[r.extra].name.toLowerCase()}` : ''}. ${taste}`, 'good');
  if (!r.noStove && skill < 30 && Math.random() < 0.12) smokeAlarm();
  done();
}
function eatFresh(id) {
  const f = FOODS[id];
  if (!useFood(id)) return;
  pass(0.1); ateFood(f.snack[0]); S.needs.thirst = clamp(S.needs.thirst + (f.snack[1] || 0)); S.needs.health = clamp(S.needs.health + 1); S.trash = clamp(S.trash + 1);
  log(`${f.icon} You had some ${f.name.toLowerCase()}.`); closeModal(); done();
}
function fridgeChips() {
  if (!S.fridgeFood.length) return '<span class="muted small">Your fridge and cupboard are empty.</span>';
  const ids = [...new Set(S.fridgeFood.map(f => f.id))];
  return ids.map(id => { const list = S.fridgeFood.filter(f => f.id === id); const soon = Math.min(...list.map(f => f.exp)) - S.day; return `<span class="chip ${soon <= 1 ? 'warn' : ''}">${FOODS[id].icon} ${list.length}${FOODS[id].shelf < 365 ? ` · ${soon <= 0 ? 'today!' : soon + 'd'}` : ''}</span>`; }).join('');
}
function groceryAisle() {
  return `<div class="card money"><h3>🛒 Grocery Aisle</h3><p class="muted">Buy real ingredients and cook recipes at home. Fresh food goes bad after a few days — check the dates!</p>
    <div class="grid shop">${Object.entries(FOODS).map(([id, f]) => `<div class="card item"><div class="jt"><b>${f.icon} ${f.name}</b><span class="pay">${money(f.price)}</span></div><p class="muted small">${f.units} ${f.units > 1 ? 'servings' : 'serving'} · ${f.shelf < 365 ? `fresh for ${f.shelf} days` : 'keeps a long time'}${f.cold ? ' · 🧊 keep cold' : ''} · you have ${countFood(id)}</p><button class="btn primary sm" onclick="buyFood('${id}')">Buy</button></div>`).join('')}</div>
    <div class="row" style="margin-top:8px"><button class="btn sm ghost" onclick="buyExtra('medicine')">💊 Medicine $12</button><button class="btn sm ghost" onclick="buyExtra('bugspray')">🐜 Bug spray $8</button><button class="btn sm ghost" onclick="buyExtra('newspaper')">📰 Newspaper $1</button><button class="btn sm ghost" onclick="drinkSoda()">🥤 Soda $2</button><button class="btn sm ghost" onclick="buyExtra('water')">💧 Bottled water $1</button></div></div>`;
}
function buyExtra(what) {
  const p = { medicine: 12, bugspray: 8, newspaper: 1, water: 1 }[what];
  if (!spend(p, { medicine: 'Medicine', bugspray: 'Bug spray', newspaper: 'Newspaper', water: 'Bottled water' }[what])) return;
  if (what === 'medicine') { S.medicine += 6; log('💊 You bought medicine (6 doses). Only take it when you\'re sick!'); }
  if (what === 'bugspray') { S.bugSpray = (S.bugSpray || 0) + 1; log('🐜 You bought bug spray.'); }
  if (what === 'water') { S.needs.thirst = clamp(S.needs.thirst + 45); S.trash = clamp(S.trash + 2); log('💧 You drank a bottle of water. (A reusable bottle makes less trash!)'); }
  if (what === 'newspaper') { showNews('📰 The Maple Times'); return; }
  done();
}

// ---------- haircuts ----------
function hairChip() { return S.hairDays > 40 ? `<span class="chip warn">💇 Your hair is getting long (${S.hairDays} days)</span>` : ''; }
function haircut(color) {
  const price = color ? 45 : 25;
  showModal(`<h2>${color ? '🎨 Hair Color' : '💇 Haircut'}</h2><p>${color ? 'Pick a new hair color!' : 'Pick a style, or keep the same one with a fresh trim.'}</p>
    <div class="styles">${(color ? LOOKS.hair : LOOKS.style).map(v => color ? `<button class="sw" style="background:${v}" onclick="doHaircut('${v}', true)" aria-label="hair color"></button>` : `<button class="st ${S.look.style === v ? 'sel' : ''}" onclick="doHaircut('${v}', false)">${STYLE_NAMES[v]}</button>`).join('')}</div>
    <p class="muted">Cost: ${money(price)}</p>`, [{ label: 'Never mind', cls: 'ghost' }]);
}
function doHaircut(v, color) {
  closeModal();
  if (!spend(color ? 45 : 25, color ? 'Hair coloring' : 'Haircut')) return;
  pass(color ? 1.5 : 0.75);
  if (color) S.look.hair = v; else { S.look.style = v; S.hairDays = 0; }
  fun2(8); addSkill('comm', 0.5);
  log(color ? '🎨 You got your hair colored. Looking fresh!' : `💇 You got a haircut (${STYLE_NAMES[v]}). Looking sharp for interviews!`, 'good');
  done();
}

// ---------- emergencies ----------
function smokeAlarm() {
  queueModal(`<h2>🚨 BEEP BEEP BEEP!</h2><p>The smoke alarm is going off! Some food burned on the stove and the kitchen is smoky.</p><p><b>What should you do?</b></p>
    <div class="row"><button class="btn primary" onclick="emergencyAnswer('smoke','stove')">Turn off the stove and open a window</button>
    <button class="btn ghost" onclick="emergencyAnswer('smoke','911')">Call 911</button>
    <button class="btn ghost" onclick="emergencyAnswer('smoke','ignore')">Ignore it</button></div>`);
}
function emergencyAnswer(kind, ans) {
  closeModal();
  const right = { smoke: 'stove', hurt: '911', keys: 'friend' }[kind];
  const why = {
    smoke: 'Burnt food makes smoke, but it\'s not a fire. Turn off the heat and let the smoke out. If there\'s a REAL fire you can\'t put out, get outside and call 911!',
    hurt: 'When someone is badly hurt, call 911 right away. Stay with them until help comes.',
    keys: 'Losing your keys is annoying, but it\'s NOT an emergency. 911 is only for fires, crimes and people who are hurt or in danger.',
  }[kind];
  if (ans === right) {
    log('✅ You handled the emergency the right way!', 'good'); S.volunteerHours += kind === 'hurt' ? 1 : 0; addSkill('aid', 1.5);
    if (kind === 'hurt') { S.community = (S.community || 0) + 5; addNews('🦸 Local hero calls 911, helps hurt bike rider'); unlock('hero'); }
  } else {
    if (kind === 'smoke' && ans === 'ignore') { S.mess = clamp(S.mess + 25); fun2(-10); }
    log('❌ Not quite the best choice in that emergency.', 'bad');
  }
  showModal(`<h2>${ans === right ? '✅ Good thinking!' : '🤔 Hmm, not quite'}</h2><p>${why}</p>${!has('smokedetector') && kind === 'smoke' ? '<p class="lesson">💡 Smoke detectors save lives! Every home should have one. (Mall, $25)</p>' : ''}`, [{ label: 'OK' }]);
  done(false);
}
function startPowerOutage() {
  S.powerOut = 6 + Math.floor(Math.random() * 10);
  log(`🔌 The storm knocked out the power! Lights, TV and stove won't work for a while.`, 'bad');
  addNews('🔌 Storm causes power outage across Maple Town');
  if (S.powerOut > 12) { const lost = S.fridgeFood.filter(f => FOODS[f.id].cold).length; S.fridgeFood = S.fridgeFood.filter(f => !FOODS[f.id].cold); if (lost) log(`🧊 The power was out so long that the food in your fridge spoiled (${lost} items).`, 'bad'); }
  queueModal(`<h2>🔌 Power Outage!</h2><p>A thunderstorm knocked out the electricity for about <b>${S.powerOut} hours</b>.</p><ul class="notes"><li>💡 No lights, TV or video games</li><li>🍳 The stove doesn't work</li><li>🧊 Keep the fridge closed so food stays cold!</li></ul>${has('flashlight') ? '<p>🔦 Good thing you have a flashlight!</p>' : '<p class="lesson">💡 Keep a flashlight at home for emergencies (Mall, $10).</p>'}`);
}
function emergencyEvent() {
  if (Math.random() < 0.5) {
    queueModal(`<h2>🚑 Someone Needs Help!</h2><p>A person fell off their bike right in front of you. They hurt their leg badly and can't get up.</p><p><b>What should you do?</b></p>
      <div class="row"><button class="btn primary" onclick="emergencyAnswer('hurt','911')">Call 911 and stay with them</button><button class="btn ghost" onclick="emergencyAnswer('hurt','walk')">Walk away</button><button class="btn ghost" onclick="emergencyAnswer('hurt','post')">Take a video for social media</button></div>`);
  } else {
    queueModal(`<h2>🔑 You Lost Your Keys!</h2><p>You can't find your house keys anywhere. What should you do?</p>
      <div class="row"><button class="btn ghost" onclick="emergencyAnswer('keys','911')">Call 911</button><button class="btn primary" onclick="emergencyAnswer('keys','friend')">Retrace your steps and ask family for the spare</button></div>`);
  }
}

// ---------- volunteering ----------
const VOLUNTEER = {
  park: ['🧤', 'Park Cleanup', 'Pick up litter and plant flowers', 'eco'],
  petshop: ['🐶', 'Animal Shelter Helper', 'Walk and feed shelter animals', 'animal'],
  library: ['📖', 'Read to Kids', 'Story time for little kids', 'write'],
  cityhall: ['🥫', 'Food Bank', 'Pack food boxes for families in need', 'lead'],
  hospital: ['💐', 'Hospital Volunteer', 'Bring flowers and books to patients', 'aid'],
};
function volunteerCard(pid) {
  const v = VOLUNTEER[pid]; if (!v) return '';
  return `<div class="card money"><h3>🤝 Volunteer</h3><div class="mrows">${mrow(v[0], v[1], `${v[2]} · 2 hrs · no pay, but it helps your town · you've volunteered ${S.volunteerHours} hrs`, b('Help out', `volunteer('${pid}')`))}</div>
    <p class="lesson">💡 Volunteering helps people, and bosses like to hire people who volunteer!</p></div>`;
}
function volunteer(pid) {
  if (S.needs.energy < 20) return nope('You\'re too tired to volunteer.');
  const v = VOLUNTEER[pid];
  pass(2, pid === 'park' ? 'sport' : 'work');
  S.volunteerHours += 2; S.community = (S.community || 0) + 2;
  if (v[3] === 'eco') S.eco = (S.eco || 0) + 3; else addSkill(v[3], 1.5);
  addSkill('comm', 1); fun2(10);
  if (isDate(3, 22) && pid === 'park') { fun2(10); log('🌍 Happy Earth Day! You helped make the park beautiful.', 'good'); }
  log(`🤝 You volunteered: ${v[1]}. People really appreciated it! (${S.volunteerHours} hrs total)`, 'good');
  if (S.volunteerHours >= 20) unlock('helper');
  if (Math.random() < 0.3) meetFriend('volunteering');
  done();
}

// ---------- winter coat chip ----------
function coldChip() { return seasonOf() === 'winter' && !has('coat') ? '<span class="chip warn">🥶 It\'s freezing outside! Buy a winter coat at the Mall.</span>' : ''; }
