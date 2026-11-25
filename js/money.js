// ===================== WAYS TO MAKE MONEY =====================
// 20 ways to earn money besides a regular job.

const WEATHER = {
  sunny:  { name: 'Sunny',  icon: '☀️' },
  hot:    { name: 'Hot',    icon: '🥵' },
  cloudy: { name: 'Cloudy', icon: '⛅' },
  rainy:  { name: 'Rainy',  icon: '🌧️' },
};

const STOCKS = {
  BURG: { name: 'Burger Barn',  icon: '🍔', start: 40,  drift: 0.002,  vol: 0.02 },
  FARM: { name: 'Sunny Farms',  icon: '🌽', start: 25,  drift: 0.0015, vol: 0.015 },
  MALL: { name: 'Mega Mall',    icon: '🛍️', start: 60,  drift: 0.001,  vol: 0.03 },
  ZOOM: { name: 'Zoom Cars',    icon: '🚗', start: 90,  drift: 0.003,  vol: 0.045 },
  RCKT: { name: 'Rocket Tech',  icon: '🚀', start: 15,  drift: 0.004,  vol: 0.09 },
};

const BUSINESSES = {
  truck:  { name: 'Food Truck', icon: '🚚', cost: 8000,  base: 900,  costs: 450,  skills: ['cook', 'sales'] },
  bakery: { name: 'Bakery',     icon: '🥐', cost: 25000, base: 2600, costs: 1500, skills: ['cook', 'lead'] },
  store:  { name: 'Gift Shop',  icon: '🎁', cost: 60000, base: 5200, costs: 3300, skills: ['sales', 'lead', 'math'] },
};

const RENTAL = { price: 85000, rent: 380, costs: 90, sell: 80000, max: 3 };

const MONEY_IDEAS = [
  [1, '🍋', 'Lemonade stand', 'Buy supplies at the Supermarket, sell at the Park. Hot days sell best!'],
  [2, '🌱', 'Mow lawns', 'Buy a lawn mower at the Mall, then mow neighbors\' lawns from Home. Not when it rains.'],
  [3, '👶', 'Babysitting & pet sitting', 'Neighbors sometimes ask for help. Look for offers at Home.'],
  [4, '♻️', 'Recycling', 'Collect cans at the Park, turn them in at the Supermarket.'],
  [5, '🏷️', 'Yard sale', 'Sell your old stuff from Home on weekends.'],
  [6, '📖', 'Tutoring', 'Teach students at the Library when a skill is 40+.'],
  [7, '🍪', 'Bake sale', 'Bake treats at Home (uses groceries), sell them at the Park.'],
  [8, '🖼️', 'Sell art', 'Buy art supplies at the Mall, paint at Home, sell paintings at the Mall.'],
  [9, '🎸', 'Street music', 'Buy a guitar at the Mall, play for tips at the Park.'],
  [10, '🥕', 'Grow a garden', 'Buy seeds at the Supermarket, plant and water at Home, sell veggies at the Supermarket.'],
  [11, '🏪', 'Start a business', 'Get a business license at City Hall. Make — or lose — money every week.'],
  [12, '🏘️', 'Rent out a house', 'Buy a rental house at Real Estate. Tenants pay you every week.'],
  [13, '📈', 'Stock market', 'Buy and sell shares at the Bank. Prices change every day!'],
  [14, '💡', 'Invention contest', 'Work on an invention at Home, enter the fair at City Hall on Saturdays.'],
  [15, '🎟️', 'Lottery tickets', 'Scratch tickets at the Supermarket. You almost never win...'],
  [16, '🤝', 'Sponsorships', 'Win City, State or National tournaments and companies may pay you.'],
  [17, '🏅', 'Teach sports', 'At the Sports Park, teach lessons in a sport where you are level 50+.'],
  [18, '🎤', 'Talent show', 'Saturday evenings at the Theater. Sing, dance or tell jokes for prizes.'],
  [19, '🪙', 'Find treasure', 'Buy a metal detector at the Mall and search the Park. Lucky finds happen too!'],
  [20, '🏆', 'Contests & raffles', 'Art, writing and science contests at the Library. Raffle tickets at City Hall.'],
  [21, '📕', 'Write a book', 'Write 10 chapters at Home or the Library, then publish it. Good books sell for weeks!'],
];

const weekNum = () => Math.floor((S.day - 1) / 7);
function withinHours(a, b, what) {
  if (S.hour < a || S.hour > b) { nope(`${what} is only between ${fmtTime(a)} and ${fmtTime(b)}.`); return false; }
  return true;
}
function needEnergy(n = 15) {
  if (S.needs.energy < n) { nope('You\'re too tired. Get some rest first!'); return false; }
  return true;
}
const yardHomes = ['parents', 'small', 'family', 'mansion'];

function ensureMoneyState() {
  const d = {
    weather: 'sunny',
    inv: { lemonade: 0, cans: 0, treats: 0, veggies: 0, canvases: 0, seeds: 0, paintings: [] },
    garden: [], gig: null, business: null, rentals: 0,
    stocks: {}, stockPrices: null, invention: { points: 0, sessions: 0 },
    raffle: 0, sponsors: [], lottery: { spent: 0, won: 0 },
    talentWeek: -1, contests: {}, sideTotal: 0, lemonadeSold: 0,
    book: null, books: [],
  };
  for (const k in d) if (S[k] === undefined) S[k] = d[k];
  for (const k in d.inv) if (S.inv[k] === undefined) S.inv[k] = d.inv[k];
  if (!S.stockPrices) {
    S.stockPrices = {};
    for (const k in STOCKS) S.stockPrices[k] = [STOCKS[k].start];
  }
}

function sideEarn(amount, label) {
  earn(amount, label);
  S.sideTotal += amount;
  if (S.taxYear && amount > 0) S.taxYear.side += amount;
}

function moneyAssets() {
  let v = 0;
  for (const k in S.stocks) v += (S.stocks[k] || 0) * stockPrice(k);
  if (S.business) v += BUSINESSES[S.business.type].cost * 0.6;
  v += S.rentals * RENTAL.sell;
  return v;
}

// ---------- daily & weekly ----------
function moneyNewDay() {
  const r = Math.random();
  const summer = true;
  S.weather = r < 0.42 ? 'sunny' : r < (summer ? 0.62 : 0.5) ? 'hot' : r < 0.82 ? 'cloudy' : 'rainy';
  // stock prices move every day
  for (const k in STOCKS) {
    const st = STOCKS[k], h = S.stockPrices[k];
    let p = h[h.length - 1];
    const shock = (Math.random() + Math.random() + Math.random() - 1.5) * 2 * st.vol;
    p = Math.max(1, p * (1 + st.drift + shock));
    if (Math.random() < 0.02) p *= Math.random() < 0.5 ? 0.75 : 1.3; // big news!
    h.push(Math.round(p * 100) / 100);
    if (h.length > 30) h.shift();
  }
  // garden
  S.garden.forEach(pl => {
    if (S.weather === 'rainy') pl.lastWatered = S.day;
    if (!pl.dead && S.day - pl.lastWatered > 2) { pl.dead = true; log('🥀 One of your garden plants dried up. Water your garden every day or two!', 'bad'); }
  });
  // babysitting / pet sitting offers
  if (S.gig && S.gig.day < S.day) S.gig = null;
  if (!S.gig && Math.random() < 0.3) {
    const pet = Math.random() < 0.5;
    const hours = 2 + Math.floor(Math.random() * 3);
    S.gig = pet
      ? { kind: 'pet', name: ['Biscuit the dog', 'Whiskers the cat', 'Pepper the parrot', 'Nugget the hamster'][Math.floor(Math.random() * 4)], hours, pay: hours * 11, skill: 'animal', day: S.day }
      : { kind: 'baby', name: ['the Garcia kids', 'little Maya', 'the twins next door', 'baby Leo'][Math.floor(Math.random() * 4)], hours, pay: hours * 13, skill: 'aid', day: S.day };
    log(`📨 A neighbor asked you to ${S.gig.kind === 'pet' ? 'pet sit' : 'babysit'} today. Check Home!`);
  }
}

function moneyWeekly() {
  const lines = [];
  let total = 0;
  if (S.business) {
    const b = BUSINESSES[S.business.type];
    const skill = b.skills.reduce((a, s) => a + skillLevel(s), 0) / b.skills.length;
    const luck = 0.55 + Math.random() * 0.8;
    const sales = Math.round(b.base * luck * (0.7 + skill / 100) * (1 + S.business.worked * 0.12) * (1 + (typeof staffBoost === 'function' ? staffBoost() : 0)));
    const profit = sales - b.costs;
    lines.push([`${b.icon} ${b.name}: sales ${money(sales)} − costs ${money(b.costs)} (rent, workers, supplies)`, profit]);
    total += profit;
    S.business.history.push(profit);
    if (S.business.history.length > 8) S.business.history.shift();
    S.business.worked = 0;
  }
  for (let i = 0; i < S.rentals; i++) {
    if (Math.random() < 0.1) { lines.push([`🏘️ Rental #${i + 1}: empty this week (no tenant)`, -RENTAL.costs]); total -= RENTAL.costs; continue; }
    let net = RENTAL.rent - RENTAL.costs;
    let note = `rent ${money(RENTAL.rent)} − tax & upkeep ${money(RENTAL.costs)}`;
    if (Math.random() < 0.12) { const fix = 200 + Math.round(Math.random() * 500); net -= fix; note += ` − repair ${money(fix)}`; }
    lines.push([`🏘️ Rental #${i + 1}: ${note}`, net]); total += net;
  }
  S.sponsors = S.sponsors.filter(sp => {
    lines.push([`🤝 Sponsor ${sp.name} (${sp.weeks} weeks left)`, sp.weekly]); total += sp.weekly;
    sp.weeks--;
    return sp.weeks > 0;
  });
  S.books = S.books.filter(bk => {
    const copies = Math.max(0, Math.round(bk.base * bk.fade * (0.6 + Math.random() * 0.8)));
    const pay = Math.round(copies * bk.perCopy);
    lines.push([`📕 "${esc(bk.title)}": sold ${copies} copies × $${bk.perCopy.toFixed(2)}`, pay]); total += pay;
    bk.sold += copies;
    bk.fade *= bk.decay;
    bk.weeks++;
    return bk.fade > 0.08;
  });
  if (S.raffle > 0) {
    let won = 0;
    for (let i = 0; i < S.raffle; i++) if (Math.random() < 1 / 40) won += 250;
    lines.push([`🎟️ Raffle drawing (${S.raffle} ticket${S.raffle > 1 ? 's' : ''})${won ? ' — YOU WON!' : ' — no win'}`, won]); total += won;
    S.raffle = 0;
  }
  if (!lines.length) return;
  if (total >= 0) sideEarn(total, 'Side income this week'); else charge(-total, 'Side business losses');
  queueModal(`<h2>💼 Side Income Report</h2>
    <table class="stub">${lines.map(l => `<tr class="${l[1] < 0 ? 'minus' : 'plus'}"><td>${l[0]}</td><td>${l[1] < 0 ? '-' : '+'}${money(Math.abs(l[1]))}</td></tr>`).join('')}
    <tr class="total"><td>Total</td><td>${total < 0 ? '-' : '+'}${money(Math.abs(total))}</td></tr></table>
    ${total < 0 ? '<p class="lesson">💡 Businesses and rentals can LOSE money some weeks. That\'s the risk of owning things.</p>' : '<p class="lesson">💡 Money that comes in without working a job is called "passive income".</p>'}`);
}

function moneyEvents(ev) {
  ev.push({ w: 1.5, f: () => { const v = 20 + Math.round(Math.random() * 130); sideEarn(v, 'Sold an old find'); return ['📦 Attic Treasure', `You found an old baseball card in a box and sold it to a collector for ${money(v)}!`, 'Old things can be worth money to collectors.']; } });
  ev.push({ w: 1, f: () => { const v = 1 + Math.round(Math.random() * 9); sideEarn(v, 'Found coins'); return ['🪙 Coins!', `You found ${money(v)} in coins under the couch cushions.`, '']; } });
}

function sponsorChance(sp, tid) {
  const t = { city: [0.4, 60], state: [0.6, 250], national: [0.85, 1000] }[tid];
  if (!t || Math.random() > t[0]) return;
  const brands = ['ZoomFast Shoes', 'Fizzy Pop', 'PowerUp Bars', 'SuperSport Gear', 'Splash Water'];
  const name = brands[Math.floor(Math.random() * brands.length)];
  S.sponsors.push({ name, sport: sp, weekly: t[1], weeks: 8 });
  unlock('sponsored');
  log(`🤝 ${name} wants to sponsor you! They'll pay ${money(t[1])} every week for 8 weeks.`, 'good');
  queueModal(`<h2>🤝 You Got a Sponsor!</h2><p><b>${name}</b> saw you win and wants you to wear their logo.</p><p>They'll pay you <b>${money(t[1])} every week for 8 weeks</b>.</p><p class="lesson">💡 Famous athletes earn lots of money from sponsors, not just from prizes.</p>`);
}

// ---------- 1. lemonade ----------
function lemonadeStand() {
  if (!withinHours(9, 18, 'The lemonade stand') || !needEnergy()) return;
  if (S.inv.lemonade < 1) return nope('No lemonade! Buy supplies at the 🛒 Supermarket.');
  if (S.weather === 'rainy') return nope('Nobody buys lemonade in the rain. Try another day!');
  pass(2, 'awake');
  const want = { hot: 26, sunny: 16, cloudy: 8 }[S.weather] + (isWeekend() ? 6 : 0) + Math.round(S.skills.sales / 10) + Math.floor(Math.random() * 6);
  const sold = Math.min(S.inv.lemonade, want);
  S.inv.lemonade -= sold;
  S.lemonadeSold += sold;
  const price = 1.5;
  const income = sold * price, cost = sold * 0.6;
  sideEarn(income, 'Lemonade stand');
  addSkill('sales', 1);
  if (S.lemonadeSold >= 50) unlock('lemonade');
  log(`🍋 You sold ${sold} cups of lemonade for ${money(income)}. (Supplies cost about ${money(cost)}, so profit ≈ ${money(income - cost)}.)`, 'good');
  showModal(`<h2>🍋 Lemonade Stand</h2><p>Weather: ${WEATHER[S.weather].icon} ${WEATHER[S.weather].name}</p>
    <table class="stub"><tr><td>Sold ${sold} cups × $1.50</td><td class="plus">+${money(income)}</td></tr>
    <tr><td>Supplies used (lemons, sugar, cups)</td><td class="minus">-${money(cost)}</td></tr>
    <tr class="total"><td>Profit</td><td>${money(income - cost)}</td></tr></table>
    ${sold === S.inv.lemonade + sold && sold < want ? '<p>You sold out! Buy more supplies.</p>' : ''}
    <p class="lesson">💡 Profit = money in − what it cost you. ${S.weather === 'hot' ? 'Hot days = thirsty people!' : 'Hot days sell more lemonade.'}</p>`, [{ label: 'OK' }]);
  done(false);
}

// ---------- 2. lawns ----------
function mowLawns() {
  if (!has('mower')) return nope('You need a lawn mower. Buy one at the 🛍️ Mall.');
  if (S.weather === 'rainy') return nope('The grass is too wet to mow today.');
  if (S.today.mowed) return nope('You already mowed lawns today.');
  if (!withinHours(8, 18, 'Mowing') || !needEnergy(25)) return;
  const lawns = 1 + Math.floor(Math.random() * 3) + (S.skills.fit > 40 ? 1 : 0);
  pass(lawns * 1, 'sport');
  S.today.mowed = true;
  addSkill('fit', 1.5);
  sideEarn(lawns * 20, 'Mowed lawns');
  log(`🌱 You mowed ${lawns} neighbor lawn${lawns > 1 ? 's' : ''} and earned ${money(lawns * 20)}. (Sweaty! Shower time.)`, 'good');
  done();
}

// ---------- 3. babysitting / pet sitting ----------
function doGig() {
  const g = S.gig; if (!g) return;
  if (!withinHours(8, 21, 'This job') || !needEnergy(20)) return;
  pass(g.hours, 'study');
  const lvl = skillLevel(g.skill);
  const good = Math.random() < 0.5 + lvl / 100;
  const tip = good ? Math.round(g.pay * 0.2) : 0;
  sideEarn(g.pay + tip, g.kind === 'pet' ? 'Pet sitting' : g.kind === 'snow' ? 'Shoveling snow' : 'Babysitting');
  if (g.kind === 'snow') { log(`🌨️ You shoveled ${g.name}'s driveway. They paid you ${money(g.pay)}! Your arms are tired.`, 'good'); S.gig = null; return done(); }
  addSkill(g.skill, 2);
  log(g.kind === 'pet'
    ? `🐾 You took care of ${g.name} for ${g.hours} hours. Earned ${money(g.pay)}${tip ? ` + ${money(tip)} tip` : ''}!`
    : `👶 You babysat ${g.name} for ${g.hours} hours. Earned ${money(g.pay)}${tip ? ` + ${money(tip)} tip for doing great` : ''}!`, 'good');
  S.gig = null;
  done();
}

// ---------- 4. recycling ----------
function collectCans() {
  if (!withinHours(6, 21, 'Collecting cans') || !needEnergy()) return;
  pass(1, 'awake');
  const n = 6 + Math.floor(Math.random() * 15);
  S.inv.cans += n;
  S.needs.hygiene = clamp(S.needs.hygiene - 8);
  log(`♻️ You picked up ${n} cans and bottles. You have ${S.inv.cans}. Turn them in at the Supermarket. (Wash your hands!)`);
  S.handsDirty = true;
  done();
}
function recycle() {
  if (S.inv.cans < 1) return nope('You have no cans. Collect some at the 🌳 Park.');
  const v = Math.round(S.inv.cans * 10) / 100;
  sideEarn(v, 'Recycling');
  log(`♻️ The recycling machine took ${S.inv.cans} cans and paid you ${money(v)} (10¢ each). Good for the planet too!`, 'good');
  S.inv.cans = 0;
  done();
}

// ---------- 5. yard sale ----------
function yardSale() {
  if (!yardHomes.includes(S.home)) return nope('You need a yard! Apartments don\'t have one.');
  if (!isWeekend()) return nope('Yard sales happen on weekends.');
  if (!withinHours(8, 14, 'A yard sale')) return;
  const things = ITEMS.filter(i => has(i.id) && !['car', 'newcar'].includes(i.id))
    .concat(Object.keys(SPORTS).filter(k => S.owned['gear_' + k]).map(k => ({ id: 'gear_' + k, name: SPORTS[k].gear.name, icon: SPORTS[k].icon, price: SPORTS[k].gear.price })));
  if (!things.length) return nope('You don\'t own anything to sell yet.');
  showModal(`<h2>🏷️ Yard Sale</h2><p>Pick what to sell. Used stuff sells for about <b>half</b> what you paid, and some things might not sell.</p>
    <div class="claims">${things.map(t => `<label class="claim"><input type="checkbox" value="${t.id}"><span>${t.icon} ${t.name}</span><span class="lvl">paid ${money(t.price)}</span></label>`).join('')}</div>`,
  [{ label: 'Cancel', cls: 'ghost' }, { label: 'Hold the sale (4 hrs)', cls: 'primary', keepOpen: true, fn: () => {
    const picks = [...document.querySelectorAll('.claims input:checked')].map(i => i.value);
    if (!picks.length) { nope('Pick at least one thing.'); return; }
    closeModal();
    pass(4, 'awake');
    const lines = [];
    let total = 0;
    picks.forEach(id => {
      const t = things.find(x => x.id === id);
      if (Math.random() < 0.75) {
        const v = Math.round(t.price * (0.35 + Math.random() * 0.25));
        total += v; delete S.owned[id];
        lines.push(`<li class="win">${t.icon} ${t.name}: sold for ${money(v)}</li>`);
      } else lines.push(`<li class="loss">${t.icon} ${t.name}: nobody bought it</li>`);
    });
    if (total) sideEarn(total, 'Yard sale');
    log(`🏷️ Yard sale: you made ${money(total)}.`, 'good');
    showModal(`<h2>🏷️ Yard Sale Results</h2><ul class="bracket">${lines.join('')}</ul><p>Total: <b>${money(total)}</b></p>
      <p class="lesson">💡 Most things lose value once you buy them. That's called depreciation.</p>`, [{ label: 'OK' }]);
    done(false);
  } }]);
}

// ---------- 6. tutoring ----------
function tutor(skill) {
  if (S.skills[skill] < 40) return nope(`You need ${SKILLS[skill].name} level 40 to tutor.`);
  if (!withinHours(14, 20, 'Tutoring (after school)') || !needEnergy(20)) return;
  pass(2, 'study');
  const pay = Math.round(2 * 15 * (S.skills[skill] / 50));
  sideEarn(pay, `Tutoring ${SKILLS[skill].name}`);
  addSkill(skill, 1); addSkill('comm', 1);
  log(`📖 You tutored a student in ${SKILLS[skill].name} for 2 hours and earned ${money(pay)}.`, 'good');
  done();
}

// ---------- 7. bake sale ----------
function bake() {
  if (S.groceries < 1) return nope('You need groceries to bake with.');
  if (!needEnergy()) return;
  S.groceries--;
  pass(2, 'study');
  const n = 6 + Math.floor(S.skills.cook / 10);
  S.inv.treats += n;
  addSkill('cook', 2);
  log(`🍪 You baked ${n} cookies and cupcakes! (You have ${S.inv.treats}.) Sell them at the Park.`);
  done();
}
function bakeSale() {
  if (S.inv.treats < 1) return nope('Bake some treats at home first!');
  if (!withinHours(9, 18, 'A bake sale') || !needEnergy()) return;
  pass(2, 'awake');
  const price = Math.round((2 + S.skills.cook / 25) * 4) / 4;
  const want = 6 + Math.floor(Math.random() * 10) + (isWeekend() ? 5 : 0) - (S.weather === 'rainy' ? 6 : 0);
  const sold = Math.max(0, Math.min(S.inv.treats, want));
  S.inv.treats -= sold;
  sideEarn(sold * price, 'Bake sale');
  addSkill('sales', 1);
  log(`🍪 Bake sale: sold ${sold} treats at $${price.toFixed(2)} each = ${money(sold * price)}. ${S.inv.treats ? `${S.inv.treats} left.` : 'Sold out!'}`, 'good');
  done();
}

// ---------- 8. art ----------
function paint() {
  if (S.inv.canvases < 1) return nope('You need art supplies. Buy them at the 🛍️ Mall.');
  if (!needEnergy()) return;
  S.inv.canvases--;
  pass(2, 'relax');
  const q = Math.max(1, Math.round(S.skills.art + (Math.random() - 0.5) * 30));
  S.inv.paintings.push(q);
  addSkill('art', 2.5);
  const words = q > 70 ? 'a masterpiece' : q > 45 ? 'a really nice painting' : q > 20 ? 'a pretty good painting' : 'a... colorful painting';
  log(`🖼️ You painted ${words} (quality ${q}).`);
  done();
}
function sellPaintings() {
  if (!S.inv.paintings.length) return nope('You have no paintings. Paint some at home!');
  let total = 0;
  S.inv.paintings.forEach(q => total += Math.round(10 + q * q / 12));
  sideEarn(total, 'Sold paintings');
  unlock('artist');
  log(`🖼️ The art gallery bought your ${S.inv.paintings.length} painting${S.inv.paintings.length > 1 ? 's' : ''} for ${money(total)}!`, 'good');
  S.inv.paintings = [];
  done();
}

// ---------- 9. street music ----------
function busk() {
  if (!has('guitar')) return nope('You need a guitar. Buy one at the 🛍️ Mall.');
  if (S.weather === 'rainy') return nope('It\'s raining — nobody is at the park.');
  if (!withinHours(9, 21, 'Playing music') || !needEnergy()) return;
  pass(2, 'relax');
  const tips = Math.round((3 + S.skills.music / 2.5) * (0.5 + Math.random()) * (isWeekend() ? 1.4 : 1));
  sideEarn(tips, 'Music tips');
  addSkill('music', 2);
  log(`🎸 You played music at the park. People tossed ${money(tips)} into your guitar case!`, 'good');
  done();
}

// ---------- 10. garden ----------
function gardenSize() { return { parents: 2, small: 3, family: 4, mansion: 6 }[S.home] || 0; }
function plant() {
  const size = gardenSize();
  if (!size) return nope('You need a home with a yard to grow a garden.');
  S.garden = S.garden.filter(p => !p.dead);
  if (S.garden.length >= size) return nope('Your garden is full!');
  if (S.inv.seeds < 1) return nope('You need seeds. Buy them at the 🛒 Supermarket.');
  S.inv.seeds--;
  pass(0.5, 'awake');
  const crop = ['🥕', '🍅', '🥬', '🌽', '🥒'][Math.floor(Math.random() * 5)];
  S.garden.push({ crop, planted: S.day, lastWatered: S.day, dead: false });
  log(`🌱 You planted ${crop} seeds. Water them every day or two. Ready in 6 days!`);
  done();
}
function water() {
  const live = S.garden.filter(p => !p.dead);
  if (!live.length) return nope('Nothing to water. Plant some seeds!');
  pass(0.25, 'awake');
  live.forEach(p => p.lastWatered = S.day);
  log('💧 You watered your garden.');
  done();
}
function harvest() {
  const ready = S.garden.filter(p => !p.dead && S.day - p.planted >= 6);
  const dead = S.garden.filter(p => p.dead);
  if (!ready.length && !dead.length) return nope('Nothing is ready yet. Plants need 6 days to grow.');
  pass(0.5, 'awake');
  let n = 0;
  ready.forEach(() => n += 4 + Math.floor(Math.random() * 4));
  S.inv.veggies += n;
  S.garden = S.garden.filter(p => !ready.includes(p) && !p.dead);
  log(`🧺 You picked ${n} vegetables!${dead.length ? ` (You cleared ${dead.length} dead plant${dead.length > 1 ? 's' : ''}.)` : ''} Sell them at the Supermarket or eat them.`, 'good');
  done();
}
function eatVeggies() {
  if (S.inv.veggies < 3) return nope('You need at least 3 veggies for a meal.');
  S.inv.veggies -= 3; S.groceries++;
  log('🥗 You turned 3 veggies into a home meal (+1 meal).');
  render();
}
function sellVeggies() {
  if (S.inv.veggies < 1) return nope('No veggies to sell.');
  const v = S.inv.veggies * 3;
  sideEarn(v, 'Sold vegetables');
  log(`🥕 The Supermarket bought your ${S.inv.veggies} homegrown veggies for ${money(v)}.`, 'good');
  S.inv.veggies = 0;
  done();
}

// ---------- 11. business ----------
function startBusiness(type) {
  const b = BUSINESSES[type];
  if (S.business) return nope('You already own a business.');
  confirmModal(`Start a <b>${b.icon} ${b.name}</b> for <b>${money(b.cost)}</b>?<br><br>Every Monday you'll get its sales minus about ${money(b.costs)} in costs. Some weeks you might <b>lose</b> money. Working there yourself helps sales. Good skills: ${b.skills.map(s => SKILLS[s].name).join(', ')}.`, () => {
    if (!spend(b.cost, `Started ${b.name}`)) return;
    S.business = { type, worked: 0, history: [], started: S.day };
    unlock('entrepreneur');
    log(`🏪 You are now a business owner! Your ${b.name} opens today.`, 'good');
    done();
  });
}
function workBusiness() {
  if (!S.business) return;
  if (S.business.worked >= 5) return nope('You already worked 5 shifts at your business this week.');
  if (!withinHours(6, 14, 'Starting a shift') || !needEnergy(25)) return;
  pass(8, 'work');
  S.business.worked++;
  BUSINESSES[S.business.type].skills.forEach(s => addSkill(s, 1));
  log(`🏪 You worked at your ${BUSINESSES[S.business.type].name}. Sales will be higher this week!`, 'good');
  done();
}
function sellBusiness() {
  const b = BUSINESSES[S.business.type];
  const v = Math.round(b.cost * 0.6);
  confirmModal(`Sell your ${b.name} for ${money(v)}?`, () => {
    sideEarn(v, `Sold ${b.name}`); S.business = null;
    log(`🏪 You sold your ${b.name} for ${money(v)}.`); done();
  });
}

// ---------- 12. rentals ----------
function buyRental() {
  if (S.rentals >= RENTAL.max) return nope(`You can own up to ${RENTAL.max} rental houses.`);
  confirmModal(`Buy a rental house for <b>${money(RENTAL.price)}</b>?<br><br>A tenant pays you ${money(RENTAL.rent)}/week. You pay ${money(RENTAL.costs)}/week in tax and upkeep, plus surprise repairs. Sometimes it's empty.`, () => {
    if (!spend(RENTAL.price, 'Bought a rental house')) return;
    S.rentals++;
    unlock('landlord');
    log(`🏘️ You bought rental house #${S.rentals}. A family moved in!`, 'good');
    done();
  });
}
function sellRental() {
  confirmModal(`Sell one rental house for ${money(RENTAL.sell)}?`, () => {
    S.rentals--; sideEarn(RENTAL.sell, 'Sold a rental house');
    log(`🏘️ You sold a rental house for ${money(RENTAL.sell)}.`); done();
  });
}

// ---------- 13. stocks ----------
function stockPrice(k) { const h = S.stockPrices[k]; return h[h.length - 1]; }
function trade(k, n) {
  const p = stockPrice(k);
  if (n > 0) {
    if (!spend(p * n, `Bought ${n} ${k} stock`)) return;
    S.stocks[k] = (S.stocks[k] || 0) + n;
    S.stockCost = S.stockCost || {};
    S.stockCost[k] = (S.stockCost[k] || 0) + p * n;
    unlock('investor');
    log(`📈 You bought ${n} share${n > 1 ? 's' : ''} of ${STOCKS[k].name} at ${money(p)}.`);
  } else {
    const have = S.stocks[k] || 0;
    const m = n === -Infinity ? have : Math.min(have, -n);
    if (!m) return nope('You don\'t own any of that stock.');
    const avg = (S.stockCost[k] || 0) / have;
    S.stocks[k] = have - m;
    S.stockCost[k] = avg * S.stocks[k];
    const got = p * m, gain = got - avg * m;
    earn(got, `Sold ${m} ${k} stock`);
    log(`📉 You sold ${m} share${m > 1 ? 's' : ''} of ${STOCKS[k].name} for ${money(got)}. ${gain >= 0 ? `Profit: ${money(gain)} 🎉` : `Loss: ${money(-gain)} 😬`}`, gain >= 0 ? 'good' : 'bad');
  }
  done();
}
function sparkline(h) {
  const w = 90, ht = 24, mn = Math.min(...h), mx = Math.max(...h), rg = mx - mn || 1;
  const pts = h.map((v, i) => `${(i / Math.max(1, h.length - 1) * w).toFixed(1)},${(ht - 2 - (v - mn) / rg * (ht - 4)).toFixed(1)}`).join(' ');
  const up = h[h.length - 1] >= h[0];
  return `<svg class="spark ${up ? 'up' : 'down'}" width="${w}" height="${ht}" viewBox="0 0 ${w} ${ht}"><polyline points="${pts}" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>`;
}

// ---------- 14. invention ----------
function tinker() {
  if (!needEnergy(20)) return;
  if (!spend(20, 'Invention parts')) return;
  pass(3, 'study');
  const pts = Math.round((S.skills.sci + S.skills.build) / 10 + Math.random() * 8);
  S.invention.points += pts; S.invention.sessions++;
  addSkill('sci', 1.5); addSkill('build', 1.5);
  const ideas = ['a self-folding laundry robot', 'shoes that never come untied', 'a solar-powered backpack', 'an automatic dog-ball thrower', 'a plant-watering alarm'];
  if (!S.invention.idea) S.invention.idea = ideas[Math.floor(Math.random() * ideas.length)];
  log(`💡 You worked on your invention: ${S.invention.idea}. (${S.invention.sessions}/5 work sessions, ${S.invention.points} points)`);
  done();
}
function inventionFair() {
  if (weekday() !== 5) return nope('The Invention Fair is on Saturdays.');
  if (!withinHours(9, 15, 'The Invention Fair')) return;
  if (S.invention.sessions < 5) return nope(`Your invention isn't finished. Work on it ${5 - S.invention.sessions} more time(s) at home.`);
  pass(4, 'awake');
  const score = S.invention.points + Math.random() * 20;
  const rivals = [40, 55, 70].map(r => r + Math.random() * 30);
  const place = 1 + rivals.filter(r => r > score).length;
  const prize = [0, 3000, 1000, 300, 0][place];
  if (prize) sideEarn(prize, 'Invention Fair prize');
  if (place === 1) unlock('inventor');
  log(`💡 Invention Fair: your ${S.invention.idea} got ${['', '1st', '2nd', '3rd', '4th'][place]} place!${prize ? ` Prize: ${money(prize)}` : ''}`, prize ? 'good' : '');
  showModal(`<h2>💡 Invention Fair</h2><p>The judges looked at your <b>${S.invention.idea}</b>.</p><h3>${['', '🥇 1st place!', '🥈 2nd place!', '🥉 3rd place!', 'No prize this time.'][place]}</h3>
    ${prize ? `<p>Prize: <b>${money(prize)}</b></p>` : '<p class="lesson">💡 Better Science and Building skills make better inventions. Try again!</p>'}`, [{ label: 'OK' }]);
  S.invention = { points: 0, sessions: 0 };
  done(false);
}

// ---------- 15. lottery ----------
function scratchTicket() {
  if (!spend(2, 'Lottery ticket')) return;
  S.lottery.spent += 2;
  const r = Math.random();
  const win = r < 0.00001 ? 100000 : r < 0.001 ? 500 : r < 0.02 ? 10 : r < 0.2 ? 2 : 0;
  if (win) { earn(win, 'Lottery win'); S.lottery.won += win; }
  log(win ? `🎟️ Scratch ticket: you won ${money(win)}!` : '🎟️ Scratch ticket: no win.', win >= 10 ? 'good' : '');
  if (!win) toast('🎟️ Not a winner.');
  else toast(`🎟️ You won ${money(win)}!`, 'good');
  done();
}

// ---------- 17. teach sports ----------
function teachSport(sp) {
  if (S.sports[sp] < 50) return nope(`You need level 50 in ${SPORTS[sp].name} to teach.`);
  if (S.today['teach_' + sp]) return nope('You already taught that sport today.');
  if (!withinHours(7, 20, 'Teaching') || !needEnergy(20)) return;
  pass(2, 'sport');
  S.today['teach_' + sp] = true;
  const pay = Math.round(SPORTS[sp].lesson * (0.6 + S.sports[sp] / 200));
  sideEarn(pay, `Taught ${SPORTS[sp].name}`);
  addSkill('comm', 1); addSkill('lead', 1);
  log(`${SPORTS[sp].icon} You coached a ${SPORTS[sp].name} lesson and earned ${money(pay)}!`, 'good');
  done();
}

// ---------- 18. talent show ----------
const ACTS = { sing: ['🎤 Sing a song', ['music', 'comm']], dance: ['💃 Dance', ['fit', 'music']], comedy: ['😂 Tell jokes', ['comm', 'write']] };
function talentShow(act) {
  if (weekday() !== 5) return nope('The Talent Show is on Saturday evenings.');
  if (!withinHours(17, 20.5, 'The Talent Show')) return;
  if (S.talentWeek === weekNum()) return nope('You already performed this week.');
  if (!spend(10, 'Talent show entry')) return;
  S.talentWeek = weekNum();
  pass(3, 'relax');
  const [label, sk] = ACTS[act];
  const score = sk.reduce((a, s) => a + skillLevel(s), 0) / sk.length + (S.needs.energy - 50) / 10 + (Math.random() - 0.5) * 30;
  const rivals = [25, 35, 45, 55, 65].map(r => r + (Math.random() - 0.5) * 20);
  const place = 1 + rivals.filter(r => r > score).length;
  const prize = [0, 500, 200, 75][place] || 0;
  if (prize) sideEarn(prize, 'Talent show prize');
  sk.forEach(s => addSkill(s, 1.5));
  S.needs.fun = clamp(S.needs.fun + 15);
  log(`🎭 Talent Show (${label}): ${place <= 3 ? ['', '1st', '2nd', '3rd'][place] + ' place!' : `${place}th place.`}${prize ? ` Won ${money(prize)}!` : ''}`, prize ? 'good' : '');
  showModal(`<h2>🎭 Talent Show</h2><p>You chose: <b>${label}</b></p><h3>${place === 1 ? '🥇 You won!' : place === 2 ? '🥈 2nd place!' : place === 3 ? '🥉 3rd place!' : `You came in ${place}th.`}</h3>
    ${prize ? `<p>Prize: <b>${money(prize)}</b> 🎉</p>` : '<p>The crowd still clapped for you! 👏</p>'}`, [{ label: 'OK' }]);
  done(false);
}

// ---------- 19. treasure ----------
function treasureHunt() {
  if (!has('detector')) return nope('You need a metal detector. Buy one at the 🛍️ Mall.');
  if (!withinHours(7, 19, 'Treasure hunting') || !needEnergy()) return;
  pass(2, 'awake');
  const r = Math.random();
  let found, v = 0;
  if (r < 0.004) { found = '🏺 an old gold coin from 1849'; v = 900; }
  else if (r < 0.025) { found = '💍 a lost ring (you turned it in and got a reward)'; v = 150; }
  else if (r < 0.15) { found = '⌚ an old watch'; v = 40; }
  else if (r < 0.6) { v = 1 + Math.round(Math.random() * 12); found = `🪙 some coins`; }
  else found = '🔩 bottle caps and nails';
  if (v) sideEarn(v, 'Treasure hunting');
  log(`🔍 Treasure hunt: you found ${found}${v ? ` — worth ${money(v)}!` : '. Nothing valuable this time.'}`, v >= 40 ? 'good' : '');
  done();
}

// ---------- 20. contests & raffles ----------
const CONTESTS = { art: ['🎨 Drawing Contest', 'art'], write: ['✍️ Writing Contest', 'write'], sci: ['🔬 Science Contest', 'sci'] };
function enterContest(type) {
  const [name, skill] = CONTESTS[type];
  if (S.contests[type] === weekNum()) return nope(`You already entered the ${name} this week. New contests every Monday!`);
  if (!withinHours(8, 19, 'Contests') || !needEnergy()) return;
  if (!spend(5, `${name} entry`)) return;
  S.contests[type] = weekNum();
  pass(2, 'study');
  const score = S.skills[skill] + (Math.random() - 0.5) * 30;
  const rivals = [15, 30, 45, 60].map(r => r + (Math.random() - 0.5) * 25);
  const place = 1 + rivals.filter(r => r > score).length;
  const prize = [0, 200, 75, 25][place] || 0;
  if (prize) sideEarn(prize, `${name} prize`);
  addSkill(skill, 2);
  log(`${name}: ${place <= 3 ? ['', '1st', '2nd', '3rd'][place] + ' place!' : 'no prize this time.'}${prize ? ` Won ${money(prize)}!` : ''}`, prize ? 'good' : '');
  done();
}
function buyRaffle() {
  if (!spend(5, 'Raffle ticket')) return;
  S.raffle++;
  log(`🎟️ You bought a raffle ticket (${S.raffle} this week). The drawing is Monday morning. Prize: $250!`);
  done();
}

// ---------- 21. write a book ----------
const GENRES = { adventure: '🗺️ Adventure', mystery: '🔎 Mystery', animals: '🐾 Animal story', funny: '😂 Funny', science: '🚀 Sci-fi' };
function writeChapter() {
  if (!needEnergy(20)) return;
  if (!S.book) S.book = { chapters: [] };
  if (S.book.chapters.length >= 10) return nope('Your book is finished! Publish it.');
  pass(2, 'study');
  const score = Math.max(1, Math.min(100, S.skills.write + (Math.random() - 0.5) * 30 + (S.needs.fun - 50) / 10));
  S.book.chapters.push(Math.round(score));
  addSkill('write', 2);
  const n = S.book.chapters.length;
  const feel = score > 70 ? 'It\'s amazing!' : score > 45 ? 'It\'s pretty good.' : score > 20 ? 'It\'s okay.' : 'Hmm, it needs work.';
  log(`📝 You wrote chapter ${n} of your book. ${feel} (${n}/10 chapters)`);
  if (n === 10) toast('📕 Your book is finished! Publish it.', 'good');
  done();
}
function bookQuality() { const c = S.book.chapters; return Math.round(c.reduce((a, v) => a + v, 0) / c.length); }
function publishBook() {
  if (!S.book || S.book.chapters.length < 10) return nope('Write 10 chapters first.');
  const q = bookQuality();
  showModal(`<h2>📕 Publish Your Book</h2>
    <p>Your book is finished! Quality: <b>${q}/100</b></p>
    <label class="field">Book title<input id="booktitle" maxlength="40" placeholder="The Amazing Adventure"></label>
    <label class="field">Kind of story<select id="bookgenre">${Object.entries(GENRES).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select></label>
    <div class="grid two">
      <div class="card"><h3>🖨️ Publish it yourself</h3><p>Pay <b>$250</b> to print copies. You keep <b>$4</b> from each book sold, but fewer people find it.</p></div>
      <div class="card"><h3>🏢 Send to a publisher</h3><p>Free! If they like it, they pay you money up front (an "advance") and <b>$1.50</b> per book. They sell way more copies. Better books are more likely to be accepted.</p></div>
    </div>`,
  [{ label: 'Not yet', cls: 'ghost' },
   { label: '🖨️ Self-publish ($250)', cls: 'ghost', keepOpen: true, fn: () => finishBook('self') },
   { label: '🏢 Send to publisher', cls: 'primary', keepOpen: true, fn: () => finishBook('publisher') }]);
}
function finishBook(how) {
  const title = ($('#booktitle').value || '').trim();
  if (!title) { nope('Give your book a title!'); return; }
  const genre = $('#bookgenre').value;
  const q = bookQuality();
  closeModal();
  if (how === 'self') {
    if (!spend(250, 'Printing your book')) return done();
    S.books.push({ title, genre, q, how, base: 4 + q / 3, perCopy: 4, fade: 1, decay: 0.8, sold: 0, weeks: 0 });
    log(`📕 You self-published "${esc(title)}"! Copies go on sale this week.`, 'good');
    queueModal(`<h2>📕 "${esc(title)}" is published!</h2><p>Your book is for sale. Every Monday you'll see how many copies sold.</p><p class="lesson">💡 Authors earn "royalties": a little money from every copy sold.</p>`);
  } else {
    const accept = Math.random() < Math.min(0.95, 0.1 + q / 90);
    if (!accept) {
      log(`📭 The publisher said no to "${esc(title)}". You can try again or publish it yourself.`, 'bad');
      queueModal(`<h2>📭 Rejection Letter</h2><p>"Thank you for sending <b>${esc(title)}</b>, but it isn't right for us."</p><p>You can try again another time, or publish it yourself.</p><p class="lesson">💡 Even famous authors got lots of rejections before their first book was published. Keep writing to get better!</p>`);
      return done();
    }
    const advance = Math.max(100, Math.round(q * 25 / 50) * 50);
    const best = q > 70 && Math.random() < 0.35;
    sideEarn(advance, `Book advance: ${title}`);
    S.books.push({ title, genre, q, how, base: (12 + q * 1.2) * (best ? 4 : 1), perCopy: 1.5, fade: 1, decay: 0.86, sold: 0, weeks: 0, best });
    log(`🎉 A publisher bought "${esc(title)}"! They paid you a ${money(advance)} advance.${best ? ' It\'s a BESTSELLER!' : ''}`, 'good');
    queueModal(`<h2>🎉 A Publisher Said YES!</h2><p>They will publish <b>"${esc(title)}"</b> and paid you <b>${money(advance)}</b> up front.</p>${best ? '<p>🌟 <b>Bookstores are calling it a BESTSELLER!</b></p>' : ''}<p>You'll also get $1.50 for every copy sold, every Monday.</p>`);
  }
  unlock('author');
  S.book = null;
  done();
}

// ---------- buying supplies ----------
function moneyBuy(id) {
  if (id === 'lemonsupplies') { S.inv.lemonade += 20; log('🍋 You bought lemonade supplies: enough for 20 cups.'); return true; }
  if (id === 'seeds') { S.inv.seeds += 3; log('🌱 You bought 3 packs of seeds. Plant them at home!'); return true; }
  if (id === 'artsupplies') { S.inv.canvases += 5; log('🎨 You bought art supplies: 5 canvases and paints.'); return true; }
  if (id === 'scratch') { return true; }
  return false;
}

// ---------- screens ----------
function moneyCard(title, rows) {
  if (!rows.length) return '';
  return `<div class="card money"><h3>💰 ${title}</h3><div class="mrows">${rows.join('')}</div></div>`;
}
function mrow(icon, name, note, btn) {
  return `<div class="mrow"><span class="mi">${icon}</span><div class="mt"><b>${name}</b><small>${note}</small></div><div class="mb">${btn}</div></div>`;
}
const b = (label, fn, cls = 'primary', dis = false) => `<button class="btn sm ${cls}" ${dis ? 'disabled' : ''} onclick="${fn}">${label}</button>`;

function moneySection(t) {
  const pid = placeId(t);
  const rows = [];
  if (t === 'home') {
    if (S.gig) rows.push(mrow(S.gig.kind === 'pet' ? '🐾' : S.gig.kind === 'snow' ? '🌨️' : '👶', S.gig.kind === 'pet' ? `Pet sit ${S.gig.name}` : S.gig.kind === 'snow' ? `Shovel ${S.gig.name}'s driveway` : `Babysit ${S.gig.name}`, `${S.gig.hours} hrs · pays ${money(S.gig.pay)} · today only`, b('Do it', 'doGig()')));
    rows.push(mrow('🌱', 'Mow neighbors\' lawns', has('mower') ? `$20 per lawn · ${S.weather === 'rainy' ? 'too wet today' : S.today.mowed ? 'done today' : '1 hr each'}` : 'Needs a lawn mower (Mall)', b('Mow', 'mowLawns()', 'primary', !has('mower') || S.today.mowed || S.weather === 'rainy')));
    rows.push(mrow('🍪', 'Bake treats to sell', `Uses 1 grocery meal · 2 hrs · you have ${S.inv.treats} treats`, b('Bake', 'bake()')));
    rows.push(mrow('🖼️', 'Paint a picture', `${S.inv.canvases} canvases · ${S.inv.paintings.length} paintings to sell`, b('Paint', 'paint()', 'primary', !S.inv.canvases)));
    const ch = S.book ? S.book.chapters.length : 0;
    rows.push(mrow('📕', ch >= 10 ? 'Your book is finished!' : 'Write a book', ch >= 10 ? `Quality ${bookQuality()}/100 · ready to publish` : `2 hrs per chapter · ${ch}/10 chapters · uses Writing skill (${Math.round(S.skills.write)})`,
      ch >= 10 ? b('Publish', 'publishBook()') : b('Write chapter', 'writeChapter()')));
    rows.push(mrow('💡', `Work on invention${S.invention.idea ? `: ${S.invention.idea}` : ''}`, `$20 parts · 3 hrs · ${S.invention.sessions}/5 sessions`, b('Tinker', 'tinker()')));
    if (yardHomes.includes(S.home)) rows.push(mrow('🏷️', 'Hold a yard sale', 'Weekends 8 AM–2 PM · sell your old stuff', b('Yard sale', 'yardSale()', 'primary', !isWeekend())));
    const size = gardenSize();
    if (size) {
      const live = S.garden.filter(p => !p.dead);
      const plots = S.garden.map(p => p.dead ? '🥀' : S.day - p.planted >= 6 ? p.crop : '🌱').join(' ') || 'empty';
      const thirsty = live.some(p => S.day - p.lastWatered >= 1);
      rows.push(mrow('🥕', `Garden (${S.garden.length}/${size}): ${plots}`, `${S.inv.seeds} seed packs · ${S.inv.veggies} veggies${thirsty ? ' · 💧 needs water!' : ''}`,
        b('Plant', 'plant()', 'ghost', !S.inv.seeds) + b('Water', 'water()', thirsty ? 'primary' : 'ghost', !live.length) + b('Harvest', 'harvest()', 'ghost') + (S.inv.veggies >= 3 ? b('Cook veggies', 'eatVeggies()', 'ghost') : '')));
    }
    return moneyCard('Make Money at Home', rows);
  }
  if (pid === 'park') {
    rows.push(mrow('🍋', 'Lemonade stand', `${S.inv.lemonade} cups of supplies · 2 hrs · ${WEATHER[S.weather].icon} ${S.weather === 'hot' ? 'great day for it!' : S.weather === 'rainy' ? 'no customers in rain' : ''}`, b('Sell lemonade', 'lemonadeStand()', 'primary', !S.inv.lemonade)));
    rows.push(mrow('🍪', 'Bake sale', `${S.inv.treats} treats to sell · 2 hrs`, b('Sell treats', 'bakeSale()', 'primary', !S.inv.treats)));
    rows.push(mrow('🎸', 'Play music for tips', has('guitar') ? 'Better Music skill = more tips' : 'Needs a guitar (Mall)', b('Play', 'busk()', 'primary', !has('guitar'))));
    rows.push(mrow('♻️', 'Collect cans & bottles', `1 hr · you have ${S.inv.cans} cans`, b('Collect', 'collectCans()')));
    rows.push(mrow('🔍', 'Treasure hunt', has('detector') ? '2 hrs · you never know what you\'ll find!' : 'Needs a metal detector (Mall)', b('Search', 'treasureHunt()', 'primary', !has('detector'))));
  }
  if (pid === 'market') {
    rows.push(mrow('♻️', 'Recycling machine', `10¢ per can · you have ${S.inv.cans}`, b(`Recycle (${money(S.inv.cans / 10)})`, 'recycle()', 'primary', !S.inv.cans)));
    rows.push(mrow('🥕', 'Sell homegrown veggies', `$3 each · you have ${S.inv.veggies}`, b('Sell', 'sellVeggies()', 'primary', !S.inv.veggies)));
    rows.push(mrow('🎟️', 'Scratch lottery ticket ($2)', `You've spent ${money(S.lottery.spent)} and won ${money(S.lottery.won)}`, b('Buy & scratch', 'scratchTicket()', 'ghost')));
  }
  if (pid === 'mall') {
    const val = S.inv.paintings.reduce((a, q) => a + Math.round(10 + q * q / 12), 0);
    rows.push(mrow('🖼️', 'Art Gallery: sell your paintings', `${S.inv.paintings.length} paintings · offer: ${money(val)}`, b('Sell all', 'sellPaintings()', 'primary', !S.inv.paintings.length)));
  }
  if (pid === 'library') {
    LIBRARY_SKILLS.forEach(k => rows.push(mrow(SKILLS[k].icon, `Tutor ${SKILLS[k].name}`, S.skills[k] >= 40 ? `2 hrs · about ${money(30 * S.skills[k] / 50)} · 2–8 PM` : `Needs level 40 (you: ${Math.round(S.skills[k])})`, b('Tutor', `tutor('${k}')`, 'primary', S.skills[k] < 40))));
    const ch2 = S.book ? S.book.chapters.length : 0;
    rows.push(mrow('📕', 'Write a chapter of your book (nice and quiet here)', `${ch2}/10 chapters`, ch2 >= 10 ? b('Publish', 'publishBook()') : b('Write chapter', 'writeChapter()')));
    Object.entries(CONTESTS).forEach(([k, [name, sk]]) => rows.push(mrow('🏆', name, `$5 entry · prizes $200 / $75 / $25 · uses ${SKILLS[sk].name} (${Math.round(S.skills[sk])})${S.contests[k] === weekNum() ? ' · entered this week' : ''}`, b('Enter', `enterContest('${k}')`, 'primary', S.contests[k] === weekNum()))));
  }
  if (pid === 'sports') {
    Object.entries(SPORTS).forEach(([k, s]) => { if (S.sports[k] >= 50) rows.push(mrow(s.icon, `Teach ${s.name}`, `2 hrs · once a day`, b('Teach', `teachSport('${k}')`, 'primary', S.today['teach_' + k]))); });
    if (!rows.length) rows.push(mrow('🏅', 'Teach sports lessons', 'Reach level 50 in any sport to teach it.', ''));
    S.sponsors.forEach(sp => rows.push(mrow('🤝', `Sponsor: ${sp.name}`, `${money(sp.weekly)}/week · ${sp.weeks} weeks left`, '')));
  }
  if (pid === 'bank') return stockMarket();
  if (pid === 'realestate') {
    rows.push(mrow('🏘️', `Rental houses: ${S.rentals}/${RENTAL.max}`, `Costs ${money(RENTAL.price)} · tenant pays ${money(RENTAL.rent)}/wk · you pay ${money(RENTAL.costs)}/wk + repairs`,
      b('Buy rental', 'buyRental()', 'primary', S.rentals >= RENTAL.max) + (S.rentals ? b('Sell one', 'sellRental()', 'ghost') : '')));
    return moneyCard('Be a Landlord', rows);
  }
  if (pid === 'cityhall') {
    if (S.business) {
      const bz = BUSINESSES[S.business.type];
      const hist = S.business.history.length ? S.business.history.map(v => `<span class="${v < 0 ? 'neg' : 'pos'}">${v < 0 ? '-' : '+'}${money(Math.abs(v))}</span>`).join(' ') : 'no weeks yet';
      rows.push(mrow(bz.icon, `Your ${bz.name}`, `Past weeks: ${hist} · shifts this week: ${S.business.worked}/5`, b('Work a shift (8 hrs)', 'workBusiness()') + b('Sell', 'sellBusiness()', 'ghost')));
    } else {
      Object.entries(BUSINESSES).forEach(([k, bz]) => rows.push(mrow(bz.icon, `Start a ${bz.name}`, `${money(bz.cost)} · costs ${money(bz.costs)}/week · good skills: ${bz.skills.map(s => SKILLS[s].name).join(', ')}`, b('Start', `startBusiness('${k}')`))));
    }
    rows.push(mrow('💡', 'Invention Fair (Saturdays 9 AM–3 PM)', S.invention.sessions >= 5 ? `Your ${S.invention.idea} is ready! Prizes $3,000 / $1,000 / $300` : `Finish your invention first (${S.invention.sessions}/5 sessions at Home)`, b('Enter', 'inventionFair()', 'primary', S.invention.sessions < 5)));
    rows.push(mrow('🎟️', 'Raffle ticket ($5)', `Drawing every Monday · $250 prize · you have ${S.raffle}`, b('Buy ticket', 'buyRaffle()', 'ghost')));
  }
  if (pid === 'theater') {
    rows.push(mrow('🎭', 'Talent Show — Saturdays 5–8:30 PM', `$10 entry · prizes $500 / $200 / $75${S.talentWeek === weekNum() ? ' · you performed this week' : ''}`,
      Object.entries(ACTS).map(([k, [label]]) => b(label, `talentShow('${k}')`, 'primary', S.talentWeek === weekNum())).join('')));
  }
  return moneyCard('Ways to Make Money Here', rows);
}

function stockMarket() {
  const rows = Object.entries(STOCKS).map(([k, st]) => {
    const h = S.stockPrices[k], p = stockPrice(k);
    const prev = h.length > 1 ? h[h.length - 2] : p;
    const ch = (p - prev) / prev * 100;
    const own = S.stocks[k] || 0;
    const avg = own ? (S.stockCost[k] / own) : 0;
    const gain = own ? (p - avg) * own : 0;
    return `<tr><td><b>${st.icon} ${st.name}</b><br><small class="muted">${k}</small></td>
      <td class="num">${money(p)}<br><small class="${ch >= 0 ? 'pos' : 'neg'}">${ch >= 0 ? '▲' : '▼'} ${Math.abs(ch).toFixed(1)}%</small></td>
      <td>${sparkline(h)}</td>
      <td class="num">${own}${own ? `<br><small class="${gain >= 0 ? 'pos' : 'neg'}">${gain >= 0 ? '+' : '-'}${money(Math.abs(gain))}</small>` : ''}</td>
      <td class="tbtn">${b('Buy 1', `trade('${k}',1)`)}${b('Buy 10', `trade('${k}',10)`)}${b('Sell 1', `trade('${k}',-1)`, 'ghost', !own)}${b('Sell all', `trade('${k}',-Infinity)`, 'ghost', !own)}</td></tr>`;
  }).join('');
  let worth = 0; for (const k in S.stocks) worth += (S.stocks[k] || 0) * stockPrice(k);
  return `<div class="card money"><h3>📈 Stock Market</h3>
    <p class="muted">Buy a "share" and you own a tiny piece of a company. Prices change every day. If you sell for more than you paid, you make money. If not, you lose money! Your stocks are worth <b>${money(worth)}</b>.</p>
    <div class="tablewrap"><table class="stocks"><tr><th>Company</th><th>Price</th><th>Last 30 days</th><th>You own</th><th></th></tr>${rows}</table></div>
    <p class="lesson">💡 🚀 Rocket Tech can go up or down a LOT. 🌽 Sunny Farms moves slowly. Risky stocks can win big or lose big.</p></div>`;
}

function viewMoney() {
  const income = [];
  if (S.job) income.push(`💼 Job: about ${money(S.job.wage * 40 * 0.78)}/week after taxes`);
  if (S.business) income.push(`${BUSINESSES[S.business.type].icon} ${BUSINESSES[S.business.type].name}`);
  if (S.rentals) income.push(`🏘️ ${S.rentals} rental house${S.rentals > 1 ? 's' : ''}`);
  S.books.forEach(bk => income.push(`📕 "${esc(bk.title)}": ${bk.sold} copies sold`));
  S.sponsors.forEach(sp => income.push(`🤝 ${sp.name}: ${money(sp.weekly)}/week`));
  let stockWorth = 0; for (const k in S.stocks) stockWorth += (S.stocks[k] || 0) * stockPrice(k);
  const inv = [
    ['🍋', 'Lemonade cups', S.inv.lemonade], ['♻️', 'Cans', S.inv.cans], ['🍪', 'Treats', S.inv.treats],
    ['🖼️', 'Paintings', S.inv.paintings.length], ['🎨', 'Canvases', S.inv.canvases], ['🌱', 'Seed packs', S.inv.seeds], ['🥕', 'Veggies', S.inv.veggies],
  ].filter(x => x[2] > 0);
  return `<h2>💰 Ways to Make Money</h2>
    <p>Besides a job, there are lots of ways to earn money. You've made <b>${money(S.sideTotal)}</b> from side money so far.</p>
    <div class="row">${income.map(i => `<span class="chip good">${i}</span>`).join('')}${stockWorth ? `<span class="chip">📈 Stocks worth ${money(stockWorth)}</span>` : ''}</div>
    ${inv.length ? `<h3>Your stuff to sell</h3><div class="row">${inv.map(x => `<span class="chip">${x[0]} ${x[1]}: <b>${x[2]}</b></span>`).join('')}</div>` : ''}
    <div class="grid ideas">${MONEY_IDEAS.map(([n, icon, name, how]) => `<div class="card idea"><span class="num">${n}</span><div><b>${icon} ${name}</b><p class="muted small">${how}</p></div></div>`).join('')}</div>`;
}
