// ===================== MONEY 2: 38 more ways to make money =====================
// Each idea shows up at the place where you do it (Home, Mall, Park, Beach, Library...).

function ensureMoney2State() {
  if (!S.m2) S.m2 = { done: {}, crafts: {}, supplies: {}, hive: null, coop: null, vid: { subs: 0, count: 0, pending: 0, safe: false }, game: null, flips: [], shop: null, cards: { common: 0, rare: 0, ultra: 0 }, cardPrice: { common: 0.25, rare: 3, ultra: 25 }, cds: [], bnb: null, orders: [], request: null, pumpkin: 0, fishBest: 0, lostpet: null, earned: 0 };
}
const m2day = id => GIGS2[id] && GIGS2[id].weekly ? S.m2.done[id] !== undefined && Math.floor((S.m2.done[id] - 1) / 7) === weekNum() : S.m2.done[id] === S.day;
function m2mark(id) { S.m2.done[id] = S.day; }
function m2pay(amount, label) { amount = Math.round(amount * 100) / 100; if (amount > 0) { sideEarn(amount, label); S.m2.earned += amount; if (S.m2.earned >= 1000) unlock('hustler'); } return amount; }
const m2month = () => dateOf().m;
const schoolMonths = () => ![5, 6, 7].includes(m2month());
const isSun = () => weekday() === 6;
const nthDay = (wd, n) => weekday() === wd && Math.ceil(dateOf().d / 7) === n;

// ---------- simple jobs: [where, check (returns a reason it can't be done, or ''), hours, do it (returns the message)] ----------
const GIGS2 = {
  carwash: { weekly: true, icon: '🚗', name: 'Car wash fundraiser', where: ['home'], note: 'Saturdays 9 AM–3 PM · not in winter or rain · 3 hrs',
    check: () => weekday() !== 5 ? 'Only on Saturdays' : S.hour < 9 || S.hour >= 15 ? 'Open 9 AM – 3 PM' : seasonOf() === 'winter' || S.weather === 'rainy' || S.weather === 'snowy' ? 'Too cold or wet!' : '',
    hours: 3, go: () => { const n = 4 + Math.floor(Math.random() * 9); const p = m2pay(n * 8, 'Car wash'); fun2(10); return `🚗💦 You washed ${n} cars with sponges and a hose. ${money(p)} earned — and you got soaked!`; } },
  snowcone: { icon: '🍧', name: 'Snow-cone cart', where: ['beach'], note: 'Summer, sunny or hot days, 11 AM–5 PM · cart rental $15 · 3 hrs',
    check: () => seasonOf() !== 'summer' ? 'Only in summer' : !['sunny', 'hot'].includes(S.weather) ? 'Nobody wants snow-cones on a cloudy day' : S.hour < 11 || S.hour >= 17 ? '11 AM – 5 PM' : S.money < 15 ? 'You need $15 for the cart rental' : '',
    hours: 3, go: () => { charge(15, 'Snow-cone cart rental'); const n = (S.weather === 'hot' ? 45 : 25) + Math.floor(Math.random() * 20); const p = m2pay(n * 2, 'Snow-cone sales'); addSkill('sales', 1.5); return `🍧 You sold ${n} snow-cones (cherry was the favorite!) for ${money(p)}. After the $15 cart rental, you made ${money(p - 15)} profit.`; } },
  leaves: { icon: '🍂', name: 'Rake leaves', where: ['home'], note: 'Fall only · 2 hrs · $20',
    check: () => seasonOf() !== 'fall' ? 'Leaves fall in autumn!' : S.weather === 'rainy' ? 'Too wet today' : S.hour < 8 || S.hour > 17 ? 'Daytime only' : '',
    hours: 2, go: () => { m2pay(20, 'Raking leaves'); addSkill('fit', 1); return `🍂 You raked ${pickR(S.neighbors && S.neighbors.people ? S.neighbors.people.map(n => n.name.split(' ')[0]) : ['the neighbor'])}'s yard into a giant pile... then jumped in it! Then raked it again. $20!`; } },
  lights: { icon: '🎄', name: 'Hang holiday lights', where: ['home'], note: 'Nov 20 – Dec 20 · 2 hrs · $30 · needs Building 10',
    check: () => { const d = dateOf(); return !((d.m === 10 && d.d >= 20) || (d.m === 11 && d.d <= 20)) ? 'Only Nov 20 – Dec 20' : S.skills.build < 10 ? 'Needs Building & Fixing 10' : S.hour < 9 || S.hour > 16 ? 'Daytime only (ladders + dark = no!)' : ''; },
    hours: 2, go: () => { m2pay(30, 'Hanging holiday lights'); addSkill('build', 1.2); return '🎄 You hung twinkly lights along a neighbor\'s roof (with an adult holding the ladder). It looks magical! $30.'; } },
  walkkids: { icon: '🚸', name: 'Walk kids to school', where: ['home'], note: 'School days 7–8 AM · 1 hr · $8',
    check: () => weekday() > 4 || !schoolMonths() || S.snowDay ? 'Only on school days' : S.hour < 7 || S.hour >= 8 ? 'Leave between 7 and 8 AM' : '',
    hours: 1, go: () => { m2pay(8, 'Walking kids to school'); addSkill('lead', 0.8); return '🚸 You walked the Garcia twins to school. You stopped at every corner, looked both ways and used the crosswalk. $8!'; } },
  groceries: { icon: '🛒', name: 'Grocery delivery for seniors', where: ['market'], note: '9 AM – 7 PM · 1.5 hrs · $12 + tips',
    check: () => S.hour < 9 || S.hour >= 19 ? '9 AM – 7 PM' : '',
    hours: 1.5, go: () => { const tip = Math.floor(Math.random() * 9); m2pay(12 + tip, 'Grocery delivery'); if (S.family.grandma) S.family.grandma.rel = clamp(S.family.grandma.rel + 3); return `🛒 You shopped for Grandma's friend Mrs. ${pickR(['Lee', 'Okafor', 'Rossi', 'Brown'])} and carried the bags inside. She tipped you ${money(tip)} and gave you a cookie! Total ${money(12 + tip)}.`; } },
  foodtruck: { icon: '🚚', name: 'Food truck at the town event', where: ['park'], note: 'Only on town event days · Cooking 20 · truck rental $40 · 4 hrs',
    check: () => !eventToday() ? 'Only on town event days (fairs, parade, festival)' : S.skills.cook < 20 ? 'Needs Cooking 20' : S.money < 40 ? 'You need $40 for the truck' : S.hour < 10 || S.hour > 17 ? '10 AM – 5 PM' : '',
    hours: 4, go: () => { charge(40, 'Food truck rental'); const meals = 30 + Math.floor(Math.random() * 30 + S.skills.cook / 2); const p = m2pay(meals * 6, 'Food truck sales'); addSkill('cook', 2); return `🚚 You sold ${meals} ${pickR(['tacos', 'grilled cheeses', 'hot dogs', 'smoothie bowls'])} at the ${eventToday().name}! Sales ${money(p)} − $40 truck = ${money(p - 40)} profit.`; } },
  websites: { weekly: true, icon: '💻', name: 'Build a website for a shop', where: ['home'], note: 'Needs a laptop & Computers 30 · 3 hrs · $90 · once every 3 days',
    check: () => !has('laptop') && !has('computer') ? 'Needs a laptop' : S.skills.comp < 30 ? 'Needs Computers 30' : '',
    hours: 3, once: 'web', go: () => { m2pay(90, 'Website project'); addSkill('comp', 2); addSkill('art', 0.6); return `💻 You built a website for ${pickR(['the Bakery', 'Snip & Style Salon', 'Happy Paws Pet Shop', 'the Bike Shop'])} with photos, hours and a map. They paid you $90!`; } },
  fixtech: { icon: '🔧', name: 'Fix phones & computers', where: ['home'], note: 'Needs a toolbox & Computers 20 · 1.5 hrs · $35',
    check: () => !has('toolbox') ? 'Needs a toolbox' : S.skills.comp < 20 ? 'Needs Computers 20' : '',
    hours: 1.5, go: () => { addSkill('comp', 1.5); if (Math.random() < 0.15) return '🔧 You tried to fix a cracked phone screen but couldn\'t. You didn\'t charge them — that\'s fair. Keep practicing!'; m2pay(35, 'Tech repair'); return `🔧 You ${pickR(['replaced a cracked phone screen', 'got rid of a computer virus', 'fixed a laptop that wouldn\'t turn on', 'made a slow computer fast again'])}. $35!`; } },
  photogig: { weekly: true, icon: '📷', name: 'Photography gig', where: ['home'], note: 'Weekends 10 AM–6 PM · needs a camera · 3 hrs · $70',
    check: () => weekday() < 5 ? 'Parties are on weekends' : !has('camera') ? 'Needs a camera' : S.hour < 10 || S.hour >= 18 ? '10 AM – 6 PM' : '',
    hours: 3, go: () => { m2pay(70 + Math.round(S.skills.art / 2), 'Photography gig'); addSkill('art', 1.5); return `📷 You took photos at a ${pickR(['birthday party 🎂', 'wedding 💐', 'graduation 🎓', 'family reunion 👨‍👩‍👧'])}. Everyone loved them! You earned ${money(70 + Math.round(S.skills.art / 2))}.`; } },
  teachmusic: { weekly: true, icon: '🎹', name: 'Teach music lessons', where: ['school'], note: 'Needs Music 40 · 2 hrs · $50',
    check: () => S.skills.music < 40 ? 'Needs Music 40' : S.hour < 9 || S.hour > 19 ? '9 AM – 7 PM' : '', hours: 2, go: () => { m2pay(50, 'Teaching music'); addSkill('music', 1); addSkill('lead', 0.6); return '🎹 You taught two kids how to play "Twinkle Twinkle Little Star." They were so proud! $50.'; } },
  swimcoach: { weekly: true, icon: '🏊', name: 'Swim coach for little kids', where: ['sports'], note: 'Needs swim level 5 · 2 hrs · $40',
    check: () => !S.hob || S.hob.swim < 5 ? 'Needs swim level 5' : S.hour < 9 || S.hour > 18 ? '9 AM – 6 PM' : '', hours: 2, go: () => { m2pay(40, 'Swim coaching'); addSkill('lead', 1); return '🏊 You taught little kids to blow bubbles and kick with a kickboard. One swam all by herself! $40.'; } },
  langtutor: { weekly: true, icon: '🗣️', name: 'Language tutor', where: ['library'], note: 'Needs level 40 in a language · 1.5 hrs · $30',
    check: () => !S.t3 || !Object.values(S.t3.langs).some(v => v >= 40) ? 'Needs level 40 in a language (College)' : S.hour < 9 || S.hour > 19 ? '9 AM – 7 PM' : '', hours: 1.5, go: () => { const L = Object.entries(S.t3.langs).find(([k, v]) => v >= 40)[0]; m2pay(30, 'Language tutoring'); S.t3.langs[L] = Math.min(100, S.t3.langs[L] + 1); return `🗣️ You tutored a student in ${LANGS[L].name}. Teaching helps you remember too! $30.`; } },
  dogclass: { weekly: true, icon: '🦮', name: 'Dog training class', where: ['park'], note: 'Saturdays · needs Animal Care 40 · 2 hrs · $45',
    check: () => weekday() !== 5 ? 'Classes are on Saturdays' : S.skills.animal < 40 ? 'Needs Animal Care 40' : S.hour < 8 || S.hour > 17 ? 'Daytime only' : '', hours: 2, go: () => { m2pay(45, 'Dog training class'); addSkill('animal', 1.5); return `🦮 You taught 5 dogs to sit and stay. A puppy named ${pickR(['Noodle', 'Waffles', 'Pickles', 'Bean'])} kept licking you! $45.`; } },
  rentout: { icon: '🚲', name: 'Rent out your car, bike or tools', where: ['home'], note: 'Once a day · car $30, bike $8, toolbox $5',
    check: () => !has('car') && !has('newcar') && !has('bike') && !has('toolbox') ? 'You need a car, bike or toolbox to rent out' : '', hours: 0.25, go: () => {
      const opts = [['car', 30], ['newcar', 30], ['bike', 8], ['toolbox', 5]].filter(([k]) => has(k)), [k, p] = pickR(opts);
      m2pay(p, `Rented out ${k}`);
      if (Math.random() < 0.08) { if (k === 'car' || k === 'newcar') { S.car.dirty = 100; return `🚙 You rented your car to a neighbor for $30. They brought it back super muddy! Rental lesson: write down the rules first.`; } return `🔧 You rented out your ${k} for ${money(p)}. It came back a little scratched. That's the risk of renting out your stuff!`; }
      return `🤝 A neighbor rented your ${k === 'newcar' ? 'car' : k} for the day and paid you ${money(p)}. They brought it back clean!`; } },
};
function gigRow2(id) {
  const g = GIGS2[id], why = m2day(id) ? 'Done today ✅' : g.check();
  return mrow(g.icon, g.name + (g.weekly ? ' <span class="chip">once a week</span>' : ''), `${g.note}${why && !m2day(id) ? ` · <b>${why}</b>` : ''}`, b(m2day(id) ? (g.weekly ? 'Done this week ✅' : 'Done ✅') : 'Do it', `doGig2('${id}')`, 'primary', !!why));
}
function doGig2(id) {
  ensureMoney2State();
  const g = GIGS2[id];
  if (m2day(id)) return nope(g.weekly ? 'That job is once a week. Come back next week!' : 'You already did that today!');
  const why = g.check(); if (why) return nope(why);
  if (S.needs.energy < 15) return nope('You\'re too tired to work.');
  pass(g.hours, 'work'); m2mark(id); if (g.once) S.m2.done[g.once] = S.day;
  log(g.go(), 'good'); done();
}

// ---------- neighbor requests: plant watering & house sitting ----------
function requestNewDay() {
  const R = S.m2.request;
  if (R) {
    if (S.day > R.until) { const v = R.visits || 0; if (v) { const p = m2pay(R.pay * v, R.kind === 'plants' ? 'Plant watering' : 'House sitting'); log(`🏡 The ${R.who} family came home and paid you ${money(p)} for the ${v} day${v > 1 ? 's' : ''} you helped. Thank you!`, 'good'); } else log(`🏡 The ${R.who} family came home. You didn't go over, so there's no pay — that's OK!`); S.m2.request = null; }
  } else if (Math.random() < 0.05) {
    const kind = Math.random() < 0.5 ? 'plants' : 'house', days = 3 + Math.floor(Math.random() * 3);
    S.m2.request = { kind, who: pickR(['Johnson', 'Park', 'Nguyen', 'Silva']), days, until: S.day + days, last: S.day, pay: kind === 'plants' ? 10 : 20, today: -1 };
    log(`📨 The ${S.m2.request.who} family is going on vacation for ${days} days! They asked you to ${kind === 'plants' ? 'water their plants' : 'house-sit (get the mail, water plants, check on things)'} every day. Check Home!`);
  }
}
function doRequest() {
  const R = S.m2.request; if (!R) return;
  if (R.today === S.day) return nope('You already went over today.');
  pass(R.kind === 'plants' ? 0.5 : 1, 'work'); R.today = S.day; R.last = S.day; R.visits = (R.visits || 0) + 1;
  log(R.kind === 'plants' ? '🪴 You watered the neighbors\' plants and checked their tomatoes.' : `🏡 You got the ${R.who}s' mail, watered the plants, turned a light on and checked that the doors were locked.`);
  done();
}

// ---------- crafts: make them at home, sell them in town ----------
const CRAFTS = {
  bracelet: { icon: '📿', name: 'Friendship bracelets', kit: 10, makes: 5, hours: 0.5, skill: 'art', price: 4, sell: ['mall', 'park'], kitName: 'string & beads' },
  candle:   { icon: '🕯️', name: 'Candles & soap', kit: 20, makes: 4, hours: 1, skill: 'sci', price: 9, sell: ['mall', 'village'], kitName: 'wax, soap base & scents' },
  tshirt:   { icon: '👕', name: 'Custom T-shirts', kit: 30, makes: 5, hours: 1, skill: 'art', price: 15, sell: ['mall', 'park'], kitName: 'blank shirts & fabric paint' },
  card:     { icon: '💌', name: 'Greeting cards', kit: 8, makes: 6, hours: 0.5, skill: 'write', price: 3, sell: ['mall', 'postoffice'], kitName: 'card stock & markers', bonus: () => [1, 10, 11].includes(m2month()) ? 2 : 1 },
  birdhouse: { icon: '🪵', name: 'Birdhouses & picture frames', kit: 15, makes: 2, hours: 2, skill: 'build', price: 25, sell: ['park', 'village'], kitName: 'wood, nails & paint', need: 'toolbox' },
  scarf:    { icon: '🧣', name: 'Knit scarves & hats', kit: 12, makes: 2, hours: 2, skill: 'art', price: 18, sell: ['mall', 'village'], kitName: 'yarn & needles', bonus: () => seasonOf() === 'winter' ? 1.5 : seasonOf() === 'summer' ? 0.6 : 1 },
  pottery:  { icon: '🏺', name: 'Pottery', kit: 15, makes: 3, hours: 1.5, skill: 'art', price: 16, sell: ['village', 'park'], kitName: 'clay & glaze' },
};
function craftCard() {
  return `<details class="card"><summary>🎨 Craft Table <span class="muted small">· make things to sell</span></summary><div class="mrows">${Object.entries(CRAFTS).map(([k, c]) => {
    const sup = S.m2.supplies[k] || 0, inv = S.m2.crafts[k] ? S.m2.crafts[k].n : 0;
    return mrow(c.icon, c.name, `${sup} supplies · ${inv} made · sell at ${c.sell.map(p => PLACES[p].name).join(' or ')}${c.need && !has(c.need) ? ' · needs a toolbox' : ''}`, b(`Make one (${c.hours < 1 ? c.hours * 60 + ' min' : c.hours + ' hr'})`, `makeCraft('${k}')`, 'primary', !sup || (c.need && !has(c.need))));
  }).join('')}</div><p class="muted small">Buy craft supplies at the 🛍️ Mall.</p></details>`;
}
function makeCraft(k) {
  const c = CRAFTS[k];
  if (!(S.m2.supplies[k] > 0)) return nope(`You need ${c.kitName}. Buy them at the Mall!`);
  if (c.need && !has(c.need)) return nope('You need a toolbox for woodworking.');
  pass(c.hours, 'relax'); S.m2.supplies[k]--;
  const q = Math.min(100, S.skills[c.skill] * 0.7 + 20 + Math.random() * 25);
  const I = S.m2.crafts[k] = S.m2.crafts[k] || { n: 0, q: 0 };
  I.q = (I.q * I.n + q) / (I.n + 1); I.n++;
  addSkill(c.skill, 1); fun2(5);
  log(`${c.icon} You made ${q > 75 ? 'a beautiful' : q > 50 ? 'a nice' : 'a wobbly but cute'} ${c.name.toLowerCase().replace(/s( &.*)?$/, '').replace(/s$/, '')}! (${I.n} ready to sell)`);
  done();
}
function craftShopCard(pid) {
  const buy = pid === 'mall', sell = Object.entries(CRAFTS).filter(([k, c]) => c.sell.includes(pid));
  if (!buy && !sell.length) return '';
  return `<div class="card money"><h3>🎨 Crafts ${buy ? '& Craft Supplies' : 'Booth'}</h3><div class="mrows">
    ${buy ? Object.entries(CRAFTS).map(([k, c]) => mrow(c.icon, `${c.kitName}`, `${money(c.kit)} · makes ${c.makes} ${c.name.toLowerCase()} · you have ${S.m2.supplies[k] || 0}`, b('Buy', `buyCraftKit('${k}')`, 'ghost'))).join('') : ''}
    ${sell.map(([k, c]) => { const I = S.m2.crafts[k]; return mrow(c.icon, `Sell ${c.name.toLowerCase()}`, I && I.n ? `${I.n} to sell · quality ${Math.round(I.q)}/100 · about ${money(craftPrice(k))} each` : 'Make some at home first', b('Sell (2 hrs)', `sellCrafts('${k}')`, 'primary', !(I && I.n))); }).join('')}
  </div><p class="lesson">💡 Profit = what you sell for − what your supplies cost. Better quality sells for more!</p></div>`;
}
function craftPrice(k) { const c = CRAFTS[k], I = S.m2.crafts[k]; return Math.round(c.price * (0.6 + I.q / 100) * (c.bonus ? c.bonus() : 1) * 100) / 100; }
function buyCraftKit(k) { const c = CRAFTS[k]; if (!spend(c.kit, `Craft supplies: ${c.kitName}`)) return; S.m2.supplies[k] = (S.m2.supplies[k] || 0) + c.makes; log(`${c.icon} You bought ${c.kitName}. Enough to make ${c.makes}!`); done(); }
function sellCrafts(k) {
  const c = CRAFTS[k], I = S.m2.crafts[k]; if (!I || !I.n) return;
  if (S.hour < 9 || S.hour > 19) return nope('Shoppers come 9 AM – 7 PM.');
  pass(2, 'work'); addSkill('sales', 1.5);
  let sold = 0; const p = craftPrice(k);
  for (let i = 0; i < I.n; i++) if (Math.random() < 0.35 + I.q / 200 + S.skills.sales / 300) sold++;
  sold = Math.min(sold, 8); I.n -= sold;
  const got = m2pay(sold * p, `Sold ${c.name.toLowerCase()}`);
  log(sold ? `${c.icon} You sold ${sold} ${c.name.toLowerCase()} for ${money(got)}!${I.n ? ` (${I.n} left)` : ''}` : `${c.icon} Nobody bought your ${c.name.toLowerCase()} today. Try another day or another place!`, sold ? 'good' : '');
  done();
}

// ---------- bees & chickens ----------
function farmAnimalsCard() {
  if (S.loc !== 'home') return '';
  const yard = gardenSize() > 0, H = S.m2.hive, C = S.m2.coop;
  if (!yard && !H && !C) return '';
  return `<div class="card"><h3>🐝🐔 Backyard Farm</h3><div class="mrows">
    ${H ? mrow('🐝', `Beehive · ${Math.floor(H.honey)} jars of honey ready`, seasonOf() === 'winter' ? 'The bees rest in winter' : 'The bees make honey every day', b('Collect honey', 'collectHoney()', 'primary', H.honey < 1)) : yard ? mrow('🐝', 'Get a beehive', `${money(150)} · bees make honey you can sell`, b('Buy', 'buyHive()', 'ghost')) : ''}
    ${C ? mrow('🐔', `Chicken coop · ${C.hens} hens · ${C.eggs} eggs`, `Feed: ${C.feed} days left${C.feed ? '' : ' — they stopped laying!'}`, b(`Feed ($12, 10 days)`, 'feedChickens()', C.feed < 3 ? 'primary' : 'ghost') + b('Collect eggs', 'collectEggs()', 'primary', !C.eggs)) : yard ? mrow('🐔', 'Get a chicken coop with 3 hens', `${money(220)} · fresh eggs every day`, b('Buy', 'buyCoop()', 'ghost')) : ''}
    ${(H && S.m2.honey) || (C && S.m2.eggJars) ? `<p class="muted small">You have ${S.m2.honey || 0} honey jars and ${S.m2.eggJars || 0} cartons of eggs to sell at the Farmers' Market or Supermarket.</p>` : ''}
  </div></div>`;
}
function buyHive() { if (!spend(150, 'Beehive')) return; S.m2.hive = { honey: 0 }; log('🐝 You set up a beehive in your yard! The bees will make honey (and help your garden grow).', 'good'); done(); }
function buyCoop() { if (!spend(220, 'Chicken coop & 3 hens')) return; S.m2.coop = { hens: 3, eggs: 0, feed: 10 }; log(`🐔 You got a chicken coop with 3 hens named ${pickR(['Nugget', 'Henrietta', 'Peep'])}, ${pickR(['Pancake', 'Clucky', 'Daisy'])} and ${pickR(['Omelet', 'Feathers', 'Goldie'])}!`, 'good'); done(); }
function feedChickens() { if (!spend(12, 'Chicken feed')) return; S.m2.coop.feed += 10; pass(0.25); log('🐔 You filled the feeder. The hens clucked happily!'); done(); }
function collectHoney() {
  const H = S.m2.hive, n = Math.floor(H.honey); if (!n) return;
  pass(0.5, 'awake'); H.honey -= n; S.m2.honey = (S.m2.honey || 0) + n;
  if (Math.random() < 0.15) { S.needs.health = clamp(S.needs.health - 4); log(`🐝 OUCH! A bee stung you. But you got ${n} jars of golden honey!`); }
  else log(`🍯 You put on your bee suit and collected ${n} jars of honey!`, 'good');
  done();
}
function collectEggs() {
  const C = S.m2.coop; if (!C.eggs) return;
  pass(0.25, 'awake'); const cartons = Math.floor(C.eggs / 6), extra = C.eggs % 6;
  S.m2.eggJars = (S.m2.eggJars || 0) + cartons; C.eggs = extra;
  if (cartons === 0) { for (let k = 0; k < extra; k++) S.fridgeFood.push({ id: 'eggs', exp: S.day + 21 }); C.eggs = 0; log(`🥚 You collected ${extra} eggs and put them in your fridge.`); }
  else log(`🥚 You collected ${cartons} carton${cartons > 1 ? 's' : ''} of farm-fresh eggs to sell!`, 'good');
  done();
}
function farmGoodsCard(pid) {
  if (!['market', 'park', 'village'].includes(pid) || (!S.m2.honey && !S.m2.eggJars)) return '';
  return `<div class="card money"><h3>🍯🥚 Sell Your Farm Goods</h3><div class="mrows">
    ${S.m2.honey ? mrow('🍯', `Honey (${S.m2.honey} jars)`, `${money(9)} a jar`, b('Sell all', "sellFarm('honey')")) : ''}
    ${S.m2.eggJars ? mrow('🥚', `Egg cartons (${S.m2.eggJars})`, `${money(5)} a carton`, b('Sell all', "sellFarm('eggs')")) : ''}</div></div>`;
}
function sellFarm(what) {
  pass(0.5, 'work');
  if (what === 'honey') { const p = m2pay(S.m2.honey * 9, 'Honey sales'); log(`🍯 You sold ${S.m2.honey} jars of honey for ${money(p)}!`, 'good'); S.m2.honey = 0; }
  else { const p = m2pay(S.m2.eggJars * 5, 'Egg sales'); log(`🥚 You sold ${S.m2.eggJars} cartons of eggs for ${money(p)}!`, 'good'); S.m2.eggJars = 0; }
  done();
}
function farmNewDay() {
  const H = S.m2.hive, C = S.m2.coop;
  if (H && seasonOf() !== 'winter') H.honey = Math.min(12, H.honey + 0.6);
  if (C) { if (C.feed > 0) { C.feed--; C.eggs = Math.min(36, C.eggs + C.hens - (Math.random() < 0.3 ? 1 : 0)); } else if (Math.random() < 0.3) log('🐔 Your chickens are out of feed, so they stopped laying eggs. Feed them if you want eggs!'); }
}

// ---------- cupcake orders ----------
function ordersNewDay() {
  S.m2.orders = S.m2.orders.filter(o => { if (S.day > o.due) { log(`🧁 ${o.who} got cupcakes somewhere else. No problem — orders are optional!`); return false; } return true; });
  if (S.m2.orders.length < 2 && S.skills.cook >= 15 && Math.random() < 0.12) {
    const o = { who: pickR(FIRST_NAMES), kind: pickR(['birthday', 'graduation', 'baby shower', 'class party']), due: S.day + 3, pay: 36 };
    S.m2.orders.push(o);
    if (has('phone')) text(`🧁 ${o.who}`, `Hi! Could you bake 12 cupcakes for my ${o.kind}? I'll pay $36. I need them in 3 days!`);
    log(`🧁 New cupcake order from ${o.who} for a ${o.kind} — $36, due in 3 days. (Check Home)`);
  }
}
function bakeOrder(i) {
  const o = S.m2.orders[i];
  if (countFood('eggs') < 1 || countFood('milk') < 1) return nope('You need eggs and milk in your kitchen to bake cupcakes!');
  if (!hasF('stove') && !has('microwave')) return nope('You need a stove or oven.');
  useFood('eggs'); useFood('milk'); pass(2, 'work'); addSkill('cook', 2);
  const great = S.skills.cook > 40 || Math.random() < 0.5;
  const p = m2pay(o.pay + (great ? 6 : 0), 'Cupcake order');
  S.m2.orders.splice(i, 1);
  log(`🧁 You baked 12 ${pickR(['chocolate', 'vanilla', 'strawberry', 'rainbow sprinkle'])} cupcakes for ${o.who}'s ${o.kind}! ${great ? `They loved them and tipped you $6!` : 'They said thanks!'} ${money(p)}.`, 'good');
  done();
}

// ---------- videos & a phone game ----------
function videoCard() {
  const V = S.m2.vid, G = S.m2.game;
  return `<div class="card"><h3>📹 Videos & 🎮 Games</h3><div class="mrows">
    ${mrow('📹', `Your video channel · ${V.subs.toLocaleString()} fans`, `${V.count} videos · ad money this week ${money(V.pending)} (paid on Monday) · needs a phone or camera`, b('Make a video (2 hrs)', 'makeVideo()', 'primary', !has('phone') && !has('camera')))}
    ${mrow('🎮', G ? (G.done ? `"${G.name}" is in the app store!` : `Making "${G.name}" · ${Math.round(G.progress)}% done`) : 'Make your own phone game', G && G.done ? `Quality ${Math.round(G.q)}/100 · ${G.weeks} weeks for sale · ${money(G.total)} earned so far` : 'Needs a laptop · lots of coding (Computers skill)', G && G.done ? b('New game', 'newGameDev()', 'ghost') : b(G ? 'Code (3 hrs)' : 'Start', G ? 'codeGame()' : 'newGameDev()', 'primary', !has('laptop') && !has('computer')))}
  </div></div>`;
}
function makeVideo() {
  const V = S.m2.vid;
  if (!has('phone') && !has('camera')) return nope('You need a phone or a camera to film videos.');
  if (!V.safe) return showModal(`<h2>📹 Online Safety First!</h2><p>Before you post videos, remember the rules:</p><ul class="notes"><li>🙈 Never say your full name, address, school or phone number</li><li>🏠 Don't show your house number or street sign</li><li>👨‍👩‍👧 Ask a grown-up before you post</li><li>💬 Ignore mean comments and tell an adult</li></ul>`, [{ label: 'I promise! 🤞', cls: 'primary', fn: () => { V.safe = true; makeVideo(); } }]);
  const topics = [['🍳', 'Cooking', 'cook'], ['🐾', 'Pets', 'animal'], ['🎨', 'Art', 'art'], ['🔬', 'Science experiments', 'sci'], ['⚽', 'Sports tricks', 'fit'], ['🎵', 'Music', 'music']].concat(has('console') ? [['🎮', 'Video games', 'comp']] : []);
  showModal(`<h2>📹 What's your video about?</h2><div class="grid actions">${topics.map(t => `<button class="action" onclick="closeModal();filmVideo('${t[1]}','${t[2]}')"><span class="ic">${t[0]}</span><b>${t[1]}</b><small>${SKILLS[t[2]] ? SKILLS[t[2]].name : ''} helps</small></button>`).join('')}</div>`, [{ label: 'Cancel', cls: 'ghost' }]);
}
function filmVideo(topic, sk) {
  const V = S.m2.vid; pass(2, 'awake');
  const q = (S.skills.comm + (S.skills[sk] || 0) + S.skills.art * 0.5) / 2.5 + Math.random() * 30;
  const views = Math.round((50 + q * 8) * (1 + V.subs / 300) * (0.5 + Math.random()));
  const newSubs = Math.round(views / 40 * (q / 50));
  V.subs += newSubs; V.count++; V.pending += Math.round(views * 0.004 * 100) / 100;
  addSkill('comm', 1); addSkill('comp', 0.6); fun2(8);
  log(`📹 Your ${topic.toLowerCase()} video got ${views.toLocaleString()} views and ${newSubs} new fans! ${q > 70 ? '🔥 People LOVED it!' : 'Nice job!'} (Ad money is paid every Monday.)`, 'good');
  if (V.subs >= 1000) unlock('creator');
  done();
}
function newGameDev() {
  if (!has('laptop') && !has('computer')) return nope('You need a laptop to make a game.');
  S.m2.game = { name: `${pickR(['Super', 'Mega', 'Tiny', 'Cosmic', 'Turbo'])} ${pickR(['Frog', 'Rocket', 'Pizza', 'Turtle', 'Penguin'])} ${pickR(['Jump', 'Dash', 'Quest', 'Party', 'Run'])}`, progress: 0, done: false, q: 0, weeks: 0, total: 0, qs: [] };
  log(`🎮 You started making a new phone game: "${S.m2.game.name}"!`); done();
}
function codeGame() {
  const G = S.m2.game; if (!G || G.done) return;
  if (S.needs.energy < 20) return nope('Too tired to code!');
  pass(3, 'study'); addSkill('comp', 2.2); addSkill('art', 0.5);
  G.progress += 8 + S.skills.comp / 8; G.qs.push(S.skills.comp + Math.random() * 30);
  if (G.progress >= 100) { G.done = true; G.q = Math.min(100, G.qs.reduce((a, b2) => a + b2, 0) / G.qs.length); log(`🎮 You finished "${G.name}" and put it in the app store for $0.99! Quality: ${Math.round(G.q)}/100. Sales come in every Monday.`, 'good'); unlock('gamedev'); }
  else log(`💻 You coded ${pickR(['the levels', 'the jumping', 'the sound effects', 'the menu', 'the boss battle', 'fixed 12 bugs'])} for "${G.name}". ${Math.round(G.progress)}% done.`);
  done();
}

// ---------- flip furniture ----------
const THRIFT = [['🪑', 'Old wooden chair', 15, 55], ['🗄️', 'Scratched dresser', 35, 140], ['🛏️', 'Wobbly nightstand', 12, 50], ['🪞', 'Dusty mirror', 18, 65], ['🪵', 'Old rocking chair', 25, 110], ['📦', 'Old toy chest', 20, 80]];
function thriftCard() {
  const today = [0, 2, 4].map(k => THRIFT[(S.day + k) % THRIFT.length]);
  return `<div class="card money"><h3>♻️ Thrift Corner & Flipping</h3><p class="muted small">Buy old furniture, fix it up at home (needs a toolbox), then sell it here for more!</p><div class="mrows">
    ${today.map((t, i) => mrow(t[0], t[1], `${money(t[2])} as-is`, b('Buy', `buyFlip(${THRIFT.indexOf(t)})`, 'ghost'))).join('')}
    ${S.m2.flips.map((f, i) => mrow(THRIFT[f.t][0], `${THRIFT[f.t][1]} ${f.fixed ? '✨ fixed up' : '(needs fixing)'}`, f.fixed ? `Sells for about ${money(flipValue(f))}` : 'Fix it at home first', b('Sell', `sellFlip(${i})`, 'primary', !f.fixed))).join('')}</div>
    <p class="lesson">💡 "Flipping" means buying something cheap, making it better, and selling it for more. Your work adds value!</p></div>`;
}
function flipValue(f) { const t = THRIFT[f.t]; return Math.round(t[2] + (t[3] - t[2]) * (0.5 + f.q / 100)); }
function buyFlip(i) { if (S.m2.flips.length >= 3) return nope('You can only store 3 pieces at a time!'); const t = THRIFT[i]; if (!spend(t[2], `Thrift: ${t[1]}`)) return; S.m2.flips.push({ t: i, fixed: false, q: 0 }); log(`${t[0]} You bought an ${t[1].toLowerCase()} for ${money(t[2])}. Time to fix it up!`); done(); }
function fixFlip(i) {
  const f = S.m2.flips[i]; if (!has('toolbox')) return nope('You need a toolbox to fix furniture.');
  pass(2, 'awake'); f.fixed = true; f.q = Math.min(100, S.skills.build * 0.8 + 15 + Math.random() * 25); addSkill('build', 2); addSkill('art', 0.6);
  log(`🔨 You sanded, glued and painted the ${THRIFT[f.t][1].toLowerCase()}. It looks ${f.q > 70 ? 'brand new!' : f.q > 45 ? 'really good!' : 'better!'}`, 'good'); done();
}
function sellFlip(i) { const f = S.m2.flips[i], v = flipValue(f); pass(0.5, 'work'); m2pay(v, `Sold ${THRIFT[f.t][1]}`); log(`💰 You sold the fixed-up ${THRIFT[f.t][1].toLowerCase()} for ${money(v)}! You paid ${money(THRIFT[f.t][2])} — that's ${money(v - THRIFT[f.t][2])} profit.`, 'good'); S.m2.flips.splice(i, 1); done(); }
function flipHomeCard() {
  if (!S.m2.flips.some(f => !f.fixed) || S.loc !== 'home') return '';
  return `<div class="card"><h3>🔨 Furniture to Fix Up</h3><div class="mrows">${S.m2.flips.map((f, i) => f.fixed ? '' : mrow(THRIFT[f.t][0], THRIFT[f.t][1], 'Sand, glue and paint it · 2 hrs · needs a toolbox', b('Fix it up', `fixFlip(${i})`, 'primary', !has('toolbox')))).join('')}</div></div>`;
}

// ---------- collectible cards ----------
function cardShopCard() {
  const C = S.m2.cards, P = S.m2.cardPrice;
  return `<div class="card money"><h3>🃏 Card Shop</h3><p class="muted small">Prices change every week. Buy low, sell high!</p><div class="mrows">
    ${mrow('🎴', 'Pack of 5 cards', `${money(5)} · could have a rare or ULTRA card!`, b('Buy a pack', 'buyPack()'))}
    ${[['common', '⚪ Common'], ['rare', '🔵 Rare'], ['ultra', '🌟 Ultra rare']].map(([k, n]) => mrow('🃏', `${n} · you have ${C[k]}`, `Shop pays ${money(P[k])} each right now`, b('Sell all', `sellCards('${k}')`, 'ghost', !C[k]))).join('')}</div>
    <p class="lesson">💡 Collectibles are risky: rare things can go up in value, but prices can drop too.</p></div>`;
}
function buyPack() { if (!spend(5, 'Card pack')) return; const got = []; for (let k = 0; k < 5; k++) { const r = Math.random(), t = r < 0.04 ? 'ultra' : r < 0.22 ? 'rare' : 'common'; S.m2.cards[t]++; got.push(t); } fun2(6); log(`🎴 You opened a pack: ${got.map(t => t === 'ultra' ? '🌟' : t === 'rare' ? '🔵' : '⚪').join(' ')}${got.includes('ultra') ? ' — AN ULTRA RARE!!' : ''}`, got.includes('ultra') ? 'good' : ''); done(); }
function sellCards(k) { const n = S.m2.cards[k], p = m2pay(n * S.m2.cardPrice[k], 'Sold collectible cards'); S.m2.cards[k] = 0; log(`🃏 You sold ${n} ${k} cards for ${money(p)}.`); done(); }

// ---------- CDs & savings bonds ----------
const CD_TYPES = { cd3: ['🏦', '3-month CD', 90, 0.045, 100], cd12: ['🏦', '1-year CD', 365, 0.05, 250], bond: ['📜', 'Savings bond (1 year)', 365, 0.04, 25] };
function cdCard() {
  return `<div class="card"><h3>🔒 CDs & Savings Bonds</h3><p class="muted small">Lock your money away for a while and the bank pays you extra interest. Take it out early and you pay a penalty!</p>
    <div class="mrows">${Object.entries(CD_TYPES).map(([k, t]) => mrow(t[0], t[1], `${(t[3] * 100).toFixed(1)}% a year · lasts ${t[2] >= 365 ? '1 year' : '3 months'} · from ${money(t[4])}`, [t[4], t[4] * 4].map(a => b(`Put in ${money(a)}`, `openCD('${k}', ${a})`, 'ghost')).join(''))).join('')}
    ${S.m2.cds.map((c, i) => mrow('🔒', `${CD_TYPES[c.k][1]}: ${money(c.amt)}`, `Ready ${dateText(c.end)} · you'll get ${money(cdPayout(c))}`, b('Cash out early', `closeCD(${i})`, 'ghost'))).join('')}</div></div>`;
}
function cdPayout(c) { const t = CD_TYPES[c.k]; return Math.round(c.amt * (1 + t[3] * t[2] / 365) * 100) / 100; }
function openCD(k, a) { if (!spend(a, `Opened ${CD_TYPES[k][1]}`)) return; S.m2.cds.push({ k, amt: a, start: S.day, end: S.day + CD_TYPES[k][2] }); log(`🔒 You put ${money(a)} into a ${CD_TYPES[k][1]}. On ${dateText(S.day + CD_TYPES[k][2])} you'll get back ${money(cdPayout(S.m2.cds[S.m2.cds.length - 1]))}.`, 'good'); done(); }
function closeCD(i) { const c = S.m2.cds[i]; confirmModal(`Cash out early? You'll lose the interest and pay a $10 penalty. You get back ${money(Math.max(0, c.amt - 10))}.`, () => { earn(Math.max(0, c.amt - 10), 'Cashed out CD early'); S.m2.cds.splice(i, 1); log('🔓 You cashed out early and paid a $10 penalty. Patience pays!'); done(); }); }
function cdNewDay() { S.m2.cds = S.m2.cds.filter(c => { if (S.day < c.end) return true; const p = cdPayout(c); earn(c.amt, `${CD_TYPES[c.k][1]} returned`); m2pay(p - c.amt, 'CD interest'); log(`🏦 Your ${CD_TYPES[c.k][1]} is done! You got your ${money(c.amt)} back plus ${money(p - c.amt)} interest.`, 'good'); unlock('investor'); return false; }); }

// ---------- rent your extra room to tourists ----------
function bnbCard() {
  if (S.loc !== 'home' || !roommateRoom() || (S.roommates && S.roommates.length)) return '';
  const B = S.m2.bnb;
  return `<div class="card"><h3>🛏️ Rent Your Extra Room to Tourists</h3><p class="muted">${B ? `🧳 Guests are booked for this weekend! They pay when they leave on Sunday.` : 'List your spare room for the weekend. Guests pay $140 (the website keeps $20). Keep your home clean for good reviews!'}</p>
    ${B ? '' : `<button class="btn sm primary" ${weekday() === 4 ? '' : 'disabled'} onclick="listRoom()">📝 List for this weekend (Fridays)</button>`}
    ${S.m2.stars ? `<p class="small">⭐ Your rating: ${(S.m2.stars.reduce((a, b2) => a + b2, 0) / S.m2.stars.length).toFixed(1)} from ${S.m2.stars.length} guests</p>` : ''}</div>`;
}
function listRoom() { if (weekday() !== 4) return nope('List your room on Friday for the weekend.'); S.m2.bnb = { from: S.day, mess: S.mess }; pass(0.5); log(`🧳 Guests from ${pickR(['Canada', 'Texas', 'Japan', 'Seaside Bay', 'Germany'])} booked your room for the weekend!`, 'good'); done(); }
function bnbNewDay() {
  const B = S.m2.bnb; if (!B || weekday() !== 6) return;
  const stars = S.mess < 30 && S.dishes < 4 ? 5 : S.mess < 60 ? 4 : 2;
  m2pay(120, 'Room rental (after website fee)'); S.mess = clamp(S.mess + 15); S.trash = clamp(S.trash + 15);
  S.m2.stars = (S.m2.stars || []).concat(stars); S.m2.bnb = null;
  log(`🛏️ Your guests checked out and paid $120 after fees. Review: ${'⭐'.repeat(stars)} "${stars === 5 ? 'Super clean and friendly host!' : stars === 4 ? 'Nice room!' : 'It was kind of messy...'}"`, stars >= 4 ? 'good' : 'bad');
}

// ---------- contests: science fair, spelling bee, pumpkins, fishing, lost pets ----------
const SCI_PROJECTS = [['🌋', 'Baking soda volcano'], ['🌱', 'Do plants grow better with music?'], ['☀️', 'Solar oven s\'mores'], ['🧲', 'How strong are magnets?'], ['💎', 'Growing salt crystals'], ['🥔', 'Potato battery']];
const SPELL = [['because', 'becuase', 'becaus'], ['friend', 'freind', 'frend'], ['beautiful', 'beutiful', 'beautifull'], ['library', 'libary', 'librery'], ['February', 'Febuary', 'Februery'], ['separate', 'seperate', 'separete'], ['Wednesday', 'Wensday', 'Wednsday'], ['tomorrow', 'tommorow', 'tomorow'], ['believe', 'beleive', 'belive'], ['neighbor', 'nieghbor', 'neighbore'], ['restaurant', 'resturant', 'restaraunt'], ['calendar', 'calender', 'calandar'], ['necessary', 'neccessary', 'necesary'], ['rhythm', 'rythm', 'rhythem'], ['definitely', 'definately', 'definitly']];
function contestCard(pid) {
  const rows = [];
  if (pid === 'library') {
    rows.push(mrow('🔬', 'Science Fair', `4th Saturday of each month, 10 AM–3 PM · prizes up to $150`, nthDay(5, 4) && S.hour >= 10 && S.hour < 15 ? b('Enter a project', 'scienceFair()') : b('Not today', '', 'ghost', true)));
    rows.push(mrow('🐝', 'Spelling Bee', '2nd Friday of each month, 3–7 PM · prizes up to $100', nthDay(4, 2) && S.hour >= 15 && S.hour < 19 ? b('Compete', 'spellingBee()') : b('Not today', '', 'ghost', true)));
  }
  if (pid === 'park') rows.push(mrow('🎃', 'Giant Pumpkin Contest', `Saturdays in October · ${S.m2.pumpkin ? `your best pumpkin: ${S.m2.pumpkin} lbs` : 'grow a pumpkin in your garden first'}`, m2month() === 9 && weekday() === 5 && S.m2.pumpkin ? b('Weigh in', 'pumpkinContest()') : b('Not now', '', 'ghost', true)));
  if (pid === 'lake') rows.push(mrow('🎣', 'Fishing Tournament', `1st Sunday of each month, 7 AM – noon · best fish ever: ${S.m2.fishBest ? S.m2.fishBest + ' lbs' : 'none yet'}`, nthDay(6, 1) && S.hour >= 7 && S.hour < 12 ? b('Enter ($10)', 'fishingTournament()') : b('Not today', '', 'ghost', true)));
  const L = S.m2.lostpet;
  if (L && L.where === pid) rows.push(mrow(L.icon, `LOST PET: ${L.name}!`, `The ${L.owner} family will pay a ${money(L.reward)} reward`, b('Look for them', 'searchLostPet()')));
  return rows.length ? `<div class="card money"><h3>🏆 Contests & Rewards</h3><div class="mrows">${rows.join('')}</div></div>` : '';
}
function m2prize(place, prizes, label) { const p = prizes[place] || 0; if (p) m2pay(p, label); return p; }
function scienceFair() {
  if (S.m2.sciDay === S.day) return nope('You already entered!');
  return showModal(`<h2>🔬 Pick Your Project</h2><div class="grid actions">${SCI_PROJECTS.map((p, i) => `<button class="action" onclick="closeModal();doScience(${i})"><span class="ic">${p[0]}</span><b>${p[1]}</b></button>`).join('')}</div>`, [{ label: 'Cancel', cls: 'ghost' }]);
}
function doScience(i) {
  S.m2.sciDay = S.day; pass(3, 'study'); addSkill('sci', 2.5);
  const sc = S.skills.sci + Math.random() * 40, place = sc > 95 ? 0 : sc > 75 ? 1 : sc > 55 ? 2 : 3;
  const p = m2prize(place, [150, 75, 30], 'Science fair prize');
  log(`🔬 Science fair: "${SCI_PROJECTS[i][1]}" won ${['🥇 FIRST PLACE', '🥈 second place', '🥉 third place', 'a participation ribbon 🎗️'][place]}!${p ? ` (${money(p)})` : ''} The judges said: "${pickR(['Great hypothesis!', 'You did the experiment 3 times — excellent!', 'Super clear poster!'])}"`, 'good');
  done();
}
function spellingBee() {
  if (S.m2.beeDay === S.day) return nope('You already competed today!');
  const words = SPELL.slice().sort(() => Math.random() - 0.5).slice(0, 5);
  S.m2.beeWords = words;
  showModal(`<h2>🐝 Spelling Bee</h2><p>The judge says a word. Pick the right spelling!</p>${words.map((w, i) => { const opts = w.map((o, k) => [o, k]).sort(() => Math.random() - 0.5); return `<div class="quiz"><b>Round ${i + 1}: "${w[0][0].toUpperCase() + w[0].slice(1)}"... can you spell it?</b>${opts.map(([o, k]) => `<label><input type="radio" name="sb${i}" value="${k}"> ${o}</label>`).join('')}</div>`; }).join('')}`,
    [{ label: 'Final answers!', cls: 'primary', fn: gradeBee }]);
}
function gradeBee() {
  let right = 0; S.m2.beeWords.forEach((w, i) => { const el = document.querySelector(`input[name="sb${i}"]:checked`); if (el && el.value === '0') right++; });
  S.m2.beeDay = S.day; pass(2, 'study'); addSkill('write', 2);
  const place = right === 5 ? 0 : right === 4 ? 1 : right === 3 ? 2 : 3;
  const p = m2prize(place, [100, 50, 20], 'Spelling bee prize');
  log(`🐝 Spelling bee: you spelled ${right}/5 words right and won ${['🥇 FIRST PLACE', '🥈 second place', '🥉 third place', 'a "Great Try" ribbon 🎗️'][place]}!${p ? ` (${money(p)})` : ''}`, 'good');
  queueModal(`<h2>🐝 ${right}/5!</h2><ul class="notes">${S.m2.beeWords.map(w => `<li>✅ ${w[0]}</li>`).join('')}</ul>`);
  done();
}
function pumpkinContest() {
  if (S.m2.pumpDay === S.day) return nope('You already weighed in today!');
  S.m2.pumpDay = S.day; pass(1.5, 'relax');
  const w = S.m2.pumpkin, place = w >= 120 ? 0 : w >= 90 ? 1 : w >= 60 ? 2 : 3;
  const p = m2prize(place, [200, 100, 40], 'Pumpkin contest prize');
  log(`🎃 The judges put your pumpkin on a giant scale: ${w} pounds! You won ${['🥇 BIGGEST PUMPKIN', '🥈 second place', '🥉 third place', 'a ribbon for trying 🎗️'][place]}${p ? ` and ${money(p)}` : ''}!`, 'good');
  S.m2.pumpkin = 0; done();
}
function fishingTournament() {
  if (S.m2.fishDay === S.day) return nope('You already fished in the tournament today!');
  if (!spend(10, 'Fishing tournament entry')) return;
  S.m2.fishDay = S.day; pass(4, 'relax'); fun2(15);
  const catches = [0, 1, 2].map(() => Math.round((1 + Math.random() * 6 + (has('rod') ? 2 : 0) + Math.random() * S.skills.animal / 20) * 10) / 10);
  const best = Math.max(...catches); S.m2.fishBest = Math.max(S.m2.fishBest, best);
  const place = best >= 9 ? 0 : best >= 7 ? 1 : best >= 5 ? 2 : 3;
  const p = m2prize(place, [150, 60, 25], 'Fishing tournament prize');
  log(`🎣 Fishing tournament: you caught fish weighing ${catches.join(', ')} lbs. Your biggest (${best} lbs) won ${['🥇 FIRST PLACE', '🥈 second place', '🥉 third place', 'nothing this time'][place]}${p ? ` — ${money(p)}!` : '. Better luck next month!'} (You let them all go 🐟)`, place < 3 ? 'good' : '');
  done();
}
function lostPetNewDay() {
  const L = S.m2.lostpet;
  if (L && S.day > L.until) { log(`🐾 ${L.name} found their way home. Keep an eye out for lost pets!`); S.m2.lostpet = null; }
  if (!L && Math.random() < 0.04) {
    const pet = pickR([['🐶', 'Pepper', 'dog'], ['🐱', 'Mittens', 'cat'], ['🐰', 'Clover', 'bunny'], ['🦜', 'Kiwi', 'parrot'], ['🐶', 'Biscuit', 'dog']]);
    const where = pickR(['park', 'library', 'school', 'market', 'mall', 'diner', 'sports']);
    S.m2.lostpet = { icon: pet[0], name: pet[1], kind: pet[2], where, owner: pickR(LAST_NAMES), reward: 40 + Math.floor(Math.random() * 4) * 10, until: S.day + 6 };
    log(`📋 LOST ${pet[2].toUpperCase()}: ${pet[1]} ${pet[0]}! Someone said they saw them near the ${PLACES[where].name}. Reward: ${money(S.m2.lostpet.reward)}!`);
    if (has('phone')) text('📋 Lost Pet Alert', `Have you seen ${pet[1]} the ${pet[2]}? Last seen near the ${PLACES[where].name}.`);
  }
}
function searchLostPet() {
  const L = S.m2.lostpet; if (!L) return;
  pass(1, 'awake');
  if (Math.random() < 0.55 + S.skills.animal / 200) {
    m2pay(L.reward, 'Lost pet reward'); addSkill('animal', 1.5); fun2(15);
    log(`🎉 You found ${L.name} hiding ${pickR(['under a bench', 'behind a bush', 'in a cardboard box', 'next to the fountain'])}! You brought ${L.kind === 'parrot' ? 'them' : 'them'} home to the ${L.owner} family. They hugged you and paid the ${money(L.reward)} reward!`, 'good');
    S.m2.lostpet = null; unlock('petrescue');
  } else log(`🔍 You looked everywhere around here, but ${L.name} ran off! Try again.`);
  done();
}

// ---------- once a day, once a week ----------
function money2NewDay() {
  ensureMoney2State();
  requestNewDay(); farmNewDay(); ordersNewDay(); cdNewDay(); bnbNewDay(); lostPetNewDay();
}
function money2Weekly(lines) {
  const V = S.m2.vid, G = S.m2.game;
  if (V.pending > 0) { m2pay(V.pending, 'Video ad money'); V.pending = 0; }
  if (G && G.done && G.weeks < 30) { const sales = Math.round(G.q * 3 * Math.pow(0.88, G.weeks) * (0.6 + Math.random() * 0.8)); G.weeks++; if (sales > 0) { const p = m2pay(sales * 0.7, `"${G.name}" game sales`); G.total += p; } }
  ['common', 'rare', 'ultra'].forEach(k => { const base = { common: 0.25, rare: 3, ultra: 25 }[k]; S.m2.cardPrice[k] = Math.max(base * 0.4, Math.round(S.m2.cardPrice[k] * (0.8 + Math.random() * 0.45) * 100) / 100); });
}

// ---------- what shows up where ----------
function money2Section(pid) {
  ensureMoney2State();
  const gigs = Object.keys(GIGS2).filter(id => GIGS2[id].where.includes(pid));
  let out = '';
  if (gigs.length) out += `<div class="card money"><h3>💵 More Ways to Earn Here <span class="muted small">· all optional — skip any you want, you just don't get paid</span></h3><div class="mrows">${gigs.map(gigRow2).join('')}</div></div>`;
  if (pid === 'home') {
    const R = S.m2.request;
    if (R) out += `<div class="card holiday"><h3>${R.kind === 'plants' ? '🪴 Watering the Neighbors\' Plants' : '🏡 House Sitting'}</h3><p>The ${R.who} family is away until ${dateText(R.until)}. Go over once a day! You get ${money(R.pay)} for each day you go (optional — skip a day and you just don't get paid for it).</p><button class="btn sm primary" ${R.today === S.day ? 'disabled' : ''} onclick="doRequest()">${R.today === S.day ? '✅ Done today' : 'Go over now'}</button></div>`;
    if (S.m2.orders.length) out += `<div class="card holiday"><h3>🧁 Cupcake Orders</h3><div class="mrows">${S.m2.orders.map((o, i) => mrow('🧁', `12 cupcakes for ${o.who}'s ${o.kind}`, `${money(o.pay)} · due ${dateText(o.due)} · uses eggs + milk · 2 hrs`, b('Bake', `bakeOrder(${i})`))).join('')}</div></div>`;
    out += farmAnimalsCard() + flipHomeCard() + bnbCard() + craftCard() + videoCard();
  }
  out += craftShopCard(pid) + farmGoodsCard(pid) + contestCard(pid);
  if (pid === 'mall') out += thriftCard() + cardShopCard();
  if (pid === 'bank') out += cdCard();
  return out;
}

// the full list on the Money tab
const MONEY_IDEAS_2 = [
  ['🚗', 'Car wash fundraiser', 'Home, Saturdays'], ['🍧', 'Snow-cone cart', 'Beach, summer'], ['🍂', 'Rake leaves', 'Home, fall'], ['🎄', 'Hang holiday lights', 'Home, Nov–Dec'],
  ['🪴', 'Water neighbors\' plants', 'Home, when asked'], ['🚸', 'Walk kids to school', 'Home, school mornings'], ['🛒', 'Grocery delivery for seniors', 'Supermarket'], ['📿', 'Friendship bracelets', 'Make at Home, sell at Mall/Park'],
  ['🕯️', 'Candles & soap', 'Make at Home, sell at Mall/Village'], ['👕', 'Custom T-shirts', 'Make at Home, sell at Mall/Park'], ['💌', 'Greeting cards', 'Make at Home, sell at Mall/Post Office'], ['🪵', 'Birdhouses & frames', 'Make at Home, sell at Park/Village'],
  ['🧣', 'Knit scarves & hats', 'Make at Home, sell at Mall/Village'], ['🏺', 'Pottery', 'Make at Home, sell at Village/Park'], ['🚚', 'Food truck', 'Park, on town event days'], ['🧁', 'Cupcake orders', 'Home, when people ask'],
  ['🍯', 'Honey from a beehive', 'Home (needs a yard)'], ['🥚', 'Eggs from chickens', 'Home (needs a yard)'], ['📹', 'Make videos', 'Home'], ['💻', 'Build websites', 'Home (laptop)'],
  ['🎮', 'Make a phone game', 'Home (laptop)'], ['🔧', 'Fix phones & computers', 'Home (toolbox)'], ['📷', 'Photography gigs', 'Home, weekends (camera)'], ['🎹', 'Teach music', 'College'],
  ['🏊', 'Swim coach', 'Sports Park'], ['🗣️', 'Language tutor', 'Library'], ['🦮', 'Dog training classes', 'Park, Saturdays'], ['🏡', 'House sitting', 'Home, when asked'],
  ['🪑', 'Flip furniture', 'Buy at Mall, fix at Home'], ['🃏', 'Collectible cards', 'Mall'], ['🏦', 'CDs & savings bonds', 'Bank'], ['🛏️', 'Rent your room to tourists', 'Home, Fridays'],
  ['🚲', 'Rent out car, bike or tools', 'Home'], ['🔬', 'Science fair', 'Library, 4th Saturday'], ['🐝', 'Spelling bee', 'Library, 2nd Friday'], ['🎃', 'Giant pumpkin contest', 'Park, October'],
  ['🎣', 'Fishing tournament', 'Lake, 1st Sunday'], ['🐶', 'Find lost pets', 'Wherever they were seen'],
];
function moneyIdeas2Card() {
  return `<details class="card"><summary>💡 38 More Money Ideas <span class="muted small">· you've earned ${money(S.m2 ? S.m2.earned : 0)} from these</span></summary>
    <ol class="ideas">${MONEY_IDEAS_2.map(i => `<li>${i[0]} <b>${i[1]}</b> <span class="muted small">— ${i[2]}</span></li>`).join('')}</ol></details>`;
}
