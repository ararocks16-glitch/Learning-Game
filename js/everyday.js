// ===================== EVERYDAY THINGS: stores at far places, going to bed anywhere, saying nice things, holiday trees =====================

// ---------- stores at the campground, beach, mountain, lake, zoo and village ----------
const FAR_STORES = {
  campground: { name: '🏕️ Pine Camp Store', eat: ['hotdog', 'smores', 'trailmix', 'cocoa'], food: ['bread', 'eggs', 'apples', 'pasta', 'sauce'], gear: ['firewood', 'marsh', 'bugspray', 'flashlight', 'batteries', 'poncho', 'firstaid'] },
  beach:      { name: '🏖️ Beach Shack & Supplies', eat: ['icepop', 'hotdog', 'fruitcup', 'lemonade'], food: ['bananas', 'bread', 'cheese'], gear: ['sunscreen', 'water', 'towel', 'bucket', 'ball'] },
  trailhead:  { name: '⛰️ Mountain General Store', eat: ['cocoa', 'trailmix', 'soup', 'sandwich'], food: ['bread', 'rice', 'veggies', 'apples'], gear: ['water', 'sunscreen', 'handwarmers', 'firstaid', 'flashlight', 'batteries'] },
  lake:       { name: '🎣 Lakeside Market', eat: ['sandwich', 'icepop', 'lemonade', 'trailmix'], food: ['milk', 'eggs', 'bread', 'chicken', 'veggies'], gear: ['water', 'bugspray', 'sunscreen', 'poncho'] },
  zoo:        { name: '🦒 Zoo Snack Bar & Gift Shop', eat: ['hotdog', 'icepop', 'fruitcup', 'lemonade'], food: [], gear: ['water', 'sunscreen', 'plush'] },
  village:    { name: '🧺 Village Grocery', eat: ['sandwich', 'fruitcup', 'soup'], food: ['milk', 'eggs', 'bread', 'cheese', 'apples', 'bananas', 'chicken', 'veggies', 'pasta', 'sauce', 'rice', 'tortillas'], gear: ['water', 'bugspray', 'firstaid', 'batteries'] },
};
// food you eat right away: [icon, name, price, food, fun, thirst]
const EAT_NOW = {
  hotdog: ['🌭', 'Hot Dog', 5, 35, 4, 0], smores: ['🍫', 'S\'mores Kit', 6, 15, 12, 0], trailmix: ['🥜', 'Trail Mix', 4, 20, 2, 0],
  cocoa: ['☕', 'Hot Cocoa', 3, 6, 6, 20], icepop: ['🍧', 'Ice Pop', 2, 5, 8, 15], fruitcup: ['🍓', 'Fruit Cup', 4, 18, 3, 8],
  lemonade: ['🍋', 'Lemonade', 3, 4, 5, 35], soup: ['🍲', 'Hot Soup', 7, 35, 4, 10], sandwich: ['🥪', 'Sandwich', 7, 40, 2, 0],
};
// supplies: [icon, name, price, what it does]
const GEAR = {
  firewood: ['🪵', 'Bundle of Firewood', 8, 'A bigger, warmer campfire tonight'], marsh: ['🍡', 'Bag of Marshmallows', 4, 'For roasting at the campfire'],
  bugspray: ['🦟', 'Bug Spray', 9, 'Keeps mosquitoes and ants away'], flashlight: ['🔦', 'Flashlight', 12, 'For dark nights and power outages'],
  batteries: ['🔋', 'Batteries', 7, 'For flashlights and toys'], poncho: ['🧥', 'Rain Poncho', 6, 'Stay dry in the rain'],
  firstaid: ['🩹', 'First Aid Kit', 15, 'Bandages and medicine (6 doses)'], sunscreen: ['🧴', 'Sunscreen', 9, 'No sunburn at the beach or on the mountain'],
  water: ['💧', 'Bottle of Water', 2, 'Drink it now'], towel: ['🏖️', 'Beach Towel', 14, 'Dry off after swimming'],
  bucket: ['🪣', 'Sand Bucket & Shovel', 7, 'Build bigger sandcastles'], ball: ['🔴', 'Bouncy Ball', 5, 'A toy to play with outside'],
  handwarmers: ['🧤', 'Hand Warmers', 5, 'Stay warm in the snow (works like a coat today)'], plush: ['🦁', 'Stuffed Animal', 18, 'A cuddly zoo animal (it\'s a teddy!)'],
};
function farStoreOpen() { return S.hour >= 7 && S.hour < 21; }
function farStoreCard(pid) {
  const st = FAR_STORES[pid]; if (!st) return '';
  const open = farStoreOpen();
  const rows = [];
  st.eat.forEach(k => { const e = EAT_NOW[k]; rows.push(mrow(e[0], e[1], `${money(e[2])} · eat it now`, b('Buy', `farEat('${k}')`, 'primary', !open))); });
  st.food.forEach(k => { const f = FOODS[k]; if (!f) return; const pr = Math.ceil(f.price * 1.25); rows.push(mrow(f.icon, f.name, `${money(pr)} · take it home (${f.units}) · ${f.shelf < 365 ? `good for ${f.shelf} days` : 'won\'t spoil'}`, b('Buy', `farFood('${k}')`, 'primary', !open))); });
  st.gear.forEach(k => { const g = GEAR[k]; rows.push(mrow(g[0], g[1], `${money(g[2])} · ${g[3]}${k === 'ball' && hasToy('ball') ? ' · you have one' : ''}`, b('Buy', `farGear('${k}')`, 'primary', !open || (k === 'ball' && hasToy('ball')) || (k === 'flashlight' && has('flashlight'))))); });
  return `<div class="card money"><h3>${st.name} <span class="muted small">· open 7 AM – 9 PM${open ? '' : ' · closed now'}</span></h3>
    ${st.eat.length ? '<h4>🍽️ Food to eat now</h4>' : ''}<div class="mrows">${rows.slice(0, st.eat.length).join('')}</div>
    ${st.food.length ? '<h4>🛒 Groceries</h4>' : ''}<div class="mrows">${rows.slice(st.eat.length, st.eat.length + st.food.length).join('')}</div>
    <h4>🎒 Supplies</h4><div class="mrows">${rows.slice(st.eat.length + st.food.length).join('')}</div>
    <p class="lesson">💡 Stores far from town usually cost a little more. Bring snacks and water from home to save money!</p></div>`;
}
function farEat(k) {
  const e = EAT_NOW[k];
  if (!farStoreOpen()) return nope('The store is closed.');
  if (!spend(e[2], e[1])) return;
  pass(0.25, 'relax'); ateFood(e[3]); fun2(e[4]); S.needs.thirst = clamp(S.needs.thirst + e[5]); S.trash = clamp(S.trash + 1);
  log(`${e[0]} You had ${k === 'smores' ? 'gooey s\'mores by the fire' : `a ${e[1].toLowerCase()}`}. Yum!`); done();
}
function farFood(k) {
  const f = FOODS[k], pr = Math.ceil(f.price * 1.25);
  if (!farStoreOpen()) return nope('The store is closed.');
  if (!spend(pr, f.name)) return;
  for (let i = 0; i < f.units; i++) S.fridgeFood.push({ id: k, exp: S.day + f.shelf });
  log(`${f.icon} You bought ${f.name.toLowerCase()} to take home.`); done();
}
function farGear(k) {
  const g = GEAR[k];
  if (!farStoreOpen()) return nope('The store is closed.');
  if (!spend(g[2], g[1])) return;
  pass(0.1);
  if (k === 'water') { S.needs.thirst = clamp(S.needs.thirst + 45); S.trash = clamp(S.trash + 2); }
  else if (k === 'firewood') S.today.firewood = true;
  else if (k === 'marsh') { S.today.marsh = (S.today.marsh || 0) + 3; }
  else if (k === 'bugspray') S.bugSpray = (S.bugSpray || 0) + 1;
  else if (k === 'flashlight') S.owned.flashlight = true;
  else if (k === 'batteries') { ensureToyState(); S.toys.batteries += 4; }
  else if (k === 'poncho') S.today.poncho = true;
  else if (k === 'firstaid') S.medicine = (S.medicine || 0) + 6;
  else if (k === 'sunscreen') S.today.sunscreen = true;
  else if (k === 'towel') S.owned.towel = true;
  else if (k === 'bucket') S.owned.bucket = true;
  else if (k === 'ball') { S.owned.toy_ball = true; }
  else if (k === 'handwarmers') S.today.warm = true;
  else if (k === 'plush') { S.owned.toy_teddy = true; }
  log(`${g[0]} You bought: ${g[1]}. ${g[3]}.`); done();
}
// a sunburn if you stay out in the sun without sunscreen
function sunTick(h) {
  if (S.today.sunscreen || S.today.sunburn) return;
  const pid = placeId(S.loc);
  if (!['beach', 'trailhead', 'lake', 'park', 'zoo', 'campground'].includes(pid)) return;
  if (!(S.weather === 'sunny' || S.weather === 'hot') || S.hour < 10 || S.hour > 16) return;
  S.sunHours = (S.sunDay === S.day ? S.sunHours || 0 : 0) + h; S.sunDay = S.day;
  if (S.sunHours >= 3) {
    S.today.sunburn = true; S.needs.health = clamp(S.needs.health - 8); fun2(-6);
    log('🥵 Ouch! You got a sunburn. Next time, put on sunscreen and wear a hat!', 'bad');
  }
}

// ---------- go to bed, anywhere ----------
function hoursToMorning() { return S.hour < 7 ? 7 - S.hour : 31 - S.hour; }
function goToBed() {
  const h = hoursToMorning();
  if (h > 14) return nope('It\'s too early to go to bed! Try again in the evening (or take a nap at home).');
  const pid = placeId(S.loc);
  if (S.loc === 'home') { if (!S.doorOpen) return nope('Open your front door and go inside first.'); pass(h, 'sleep'); log(`😴 You went to bed and slept ${h.toFixed(1)} hours.`); return done(); }
  const opts = [];
  if (pid === 'h_parents') opts.push(['🛏️', 'Sleep in the guest room', 'Free · Mom makes breakfast!', 'parents']);
  if (pid === 'campground') opts.push(['⛺', 'Sleep in a tent', '$25 campsite · under the stars', 'tent']);
  if (pid !== 'h_parents') opts.push(['🏨', 'Stay at a hotel nearby', `${money(70)} · comfy bed, hot shower, breakfast`, 'hotel']);
  if (hasCar() && pid !== 'h_parents') opts.push(['🚙', 'Sleep in your car', 'Free · not very comfy', 'car']);
  const home = travelInfo(S.loc, 'home');
  opts.push(['🏠', 'Go home to bed', `${home.icon} ${travelTime(home.hours)} away`, 'home']);
  showModal(`<h2>😴 Time for Bed</h2><p>Where do you want to sleep tonight?</p>
    <div class="grid actions">${opts.map(o => `<button class="action" onclick="closeModal();sleepAt('${o[3]}')"><span class="ic">${o[0]}</span><b>${o[1]}</b><small>${o[2]}</small></button>`).join('')}</div>`, [{ label: 'Not yet', cls: 'ghost' }]);
}
async function sleepAt(where) {
  if (where === 'home') { await travelTo('home'); S.doorOpen = true; const h = hoursToMorning(); if (h <= 14) { pass(h, 'sleep'); log(`😴 You got home and went straight to bed.`); } return done(); }
  const h = hoursToMorning();
  if (where === 'tent') {
    if (!spend(25, 'Campsite')) return;
    const fire = S.today.firewood, poncho = S.today.poncho, rain = S.weather === 'rainy';
    pass(h, 'sleep'); fun2(fire ? 32 : 25); S.needs.hygiene = clamp(S.needs.hygiene - 20);
    log(rain ? (poncho ? '⛺ It rained, but your poncho kept your stuff dry. Cozy!' : '⛺ Your tent leaked a little in the rain, but it was still an adventure!') : `⛺ You slept under the stars${fire ? ' next to a big warm campfire' : ''}. Owls hooted all night!`, 'good');
  } else if (where === 'hotel') {
    if (!spend(70, 'Hotel room')) return;
    pass(h, 'sleep'); S.needs.hygiene = 100; ateFood(30); fun2(6);
    log('🏨 You checked into a hotel. Soft bed, hot shower and a free breakfast in the morning!', 'good');
  } else if (where === 'car') {
    pass(h, 'sleep'); S.needs.energy = clamp(S.needs.energy - 25); S.needs.hygiene = clamp(S.needs.hygiene - 15); fun2(-8);
    log('🚙 You slept in the back seat of your car. Your neck is stiff... a real bed is much better!');
  } else if (where === 'parents') {
    pass(h, 'sleep'); ateFood(40); if (S.family) Object.values(S.family).forEach(m => m.rel = clamp(m.rel + 5));
    log('🛏️ You slept in your old room at your parents\' house. Mom made pancakes in the morning! 🥞', 'good');
  }
  done();
}

// ---------- holiday trees ----------
function treeSeason() { const d = dateOf(); return (d.m === 10 && d.d >= 20) || d.m === 11; }
function hasTree() { return S.xmasTree === dateOf().year && treeSeason(); }
function buyTree() {
  if (!treeSeason()) return nope('Holiday trees are sold from late November to December.');
  if (hasTree()) return nope('You already have a tree this year!');
  if (!spend(45, 'Holiday tree')) return;
  S.xmasTree = dateOf().year; pass(1); fun2(15);
  log('🎄 You brought home a holiday tree and decorated it with lights, ornaments and a star on top!', 'good'); done();
}
function treeCard() {
  if (!treeSeason()) return '';
  return `<div class="card holiday"><b>🎄 Holiday trees are here!</b> ${hasTree() ? 'Your tree is up and sparkling ✨' : `Buy a real tree and decorate it: ${money(45)}.`}
    ${hasTree() ? '' : '<button class="btn sm primary" onclick="buyTree()">🎄 Buy & decorate a tree</button>'}</div>`;
}
function drawHolidayTree(c) {
  if (!hasTree()) return;
  const x = 260, base = 262;
  c.fillStyle = '#6d4c41'; c.fillRect(x - 5, base - 10, 10, 12);
  c.fillStyle = '#b71c1c'; c.fillRect(x - 10, base - 2, 20, 8);
  [[52, 0], [42, 22], [30, 42], [18, 60]].forEach(([w, up], k) => {
    c.fillStyle = k % 2 ? '#2e7d32' : '#1b5e20';
    c.beginPath(); c.moveTo(x - w / 2, base - 8 - up); c.lineTo(x + w / 2, base - 8 - up); c.lineTo(x, base - 40 - up); c.closePath(); c.fill();
  });
  const t = Date.now() / 400;
  ['#ffeb3b', '#e53935', '#42a5f5', '#ffffff', '#ff9800'].forEach((col, k) => {
    for (let j = 0; j < 4; j++) { const yy = base - 16 - j * 18 - (k % 2) * 6, ww = 22 - j * 5; const xx = x + Math.sin(k * 2.1 + j) * ww * 0.8; c.fillStyle = (Math.floor(t) + k + j) % 3 ? col : 'rgba(255,255,255,.5)'; c.beginPath(); c.arc(xx, yy, 2.2, 0, Math.PI * 2); c.fill(); }
  });
  c.fillStyle = '#ffd54f'; c.beginPath();
  for (let k = 0; k < 10; k++) { const r = k % 2 ? 3 : 7, a = -Math.PI / 2 + k * Math.PI / 5; c.lineTo(x + Math.cos(a) * r, base - 108 + Math.sin(a) * r); }
  c.closePath(); c.fill();
  if (S.giftsBought) { [['#e53935', -26], ['#1e88e5', 14], ['#8e24aa', 26]].slice(0, Math.min(3, S.giftsBought)).forEach(([col, dx]) => { c.fillStyle = col; c.fillRect(x + dx - 7, base - 8, 14, 12); c.fillStyle = '#ffd54f'; c.fillRect(x + dx - 1, base - 8, 2, 12); c.fillRect(x + dx - 7, base - 3, 14, 2); }); }
}

// ---------- saying nice things (you can only pick kind, appropriate words) ----------
function niceThings(p, kind) {
  const m = dateOf().m, se = seasonOf(), out = [];
  if (m === 11) out.push('Your Christmas tree is awesome! 🎄', 'I love your holiday lights! ✨');
  if (m === 9) out.push('Your Halloween costume is so cool! 🎃', 'Your pumpkin decorations look awesome!');
  if (m === 1) out.push('Happy Valentine\'s Day! You\'re a great friend. 💌');
  if (p.bdayToday === S.day) out.push('Happy birthday! I hope you have the best day! 🎂');
  if (kind === 'neighbor') {
    const T = NEIGHBOR_TYPES[p.kind];
    if (p.kind === 'gardener') out.push(se === 'winter' ? 'Your snowman is the best on the street! ⛄' : 'Your garden is beautiful! 🌻', 'Biscuit is the cutest cat! 🐱');
    if (p.kind === 'parent') out.push('Rocket is such a good dog! 🐶', 'Thank you for working so hard at the hospital! 🩺');
    if (p.kind === 'student') out.push('Your guitar playing sounds great! 🎸', 'Good luck on your test! You\'ve got this! 📚');
    out.push('You\'re a really great neighbor!', 'Your house looks really nice!', 'Thanks for always being so friendly!', 'Have a wonderful day! ☀️');
    if (p.helpedDay >= 0) out.push(T.help[0] === 'garden' ? 'Thank you for the tomatoes! They were delicious! 🍅' : 'Thanks for letting me help you!');
  } else {
    out.push('You\'re a really great friend!', 'I like your outfit today! 👕', 'Your haircut looks awesome! 💇', 'You always make me laugh! 😂', 'Thanks for hanging out with me!', 'You\'re really good at sports! 🏀', 'I\'m proud of you! ⭐');
  }
  return [...new Set(out)].slice(0, 8);
}
const NICE_REPLIES = ['Aww, thank you so much! That made my day! 😊', 'That\'s so nice of you to say! 🥰', 'Thank you! You\'re so kind!', 'Wow, thanks! You\'re the best!', 'Thank you! I worked really hard on it! 😄', 'You just made me smile! Thank you!'];
function sayNice(kind, i, k) {
  const p = kind === 'neighbor' ? S.neighbors.people[i] : S.friends[i]; if (!p) return;
  const list = niceThings(p, kind);
  if (k === undefined) {
    return showModal(`<div class="talk"><img class="avatar" src="${avatarURL(p.look, 96)}" alt=""><div><b>${esc(p.name)}</b><div class="bubble">${kind === 'neighbor' ? 'Hi there! 🙂' : 'Hey! What\'s up? 😄'}</div></div></div>
      <p class="muted small">💬 Pick something kind to say:</p>
      <div class="nicelist">${list.map((s, j) => `<button class="btn sm ghost" onclick="sayNice('${kind}', ${i}, ${j})">"${esc(s)}"</button>`).join('')}</div>`,
      [{ label: kind === 'neighbor' ? '‹ Back' : 'Close', cls: 'ghost', fn: () => kind === 'neighbor' ? talkNeighbor(i) : done() }]);
  }
  const said = list[k];
  let reply = pickR(NICE_REPLIES);
  if (said.includes('Christmas tree') || said.includes('holiday lights')) reply = 'Thank you! We decorated it together as a family. Happy holidays! 🎄';
  if (said.includes('garden')) reply = 'Thank you! I planted those roses myself. Want some flowers? 🌹';
  if (said.includes('guitar')) reply = 'Really?! Thanks! I\'ve been practicing every day! 🎸';
  if (said.includes('dog') || said.includes('cat')) reply = 'Aww, thank you! They love you too! 🐾';
  if (said.includes('birthday')) reply = 'Thank you!! 🎉 You remembered!';
  const key = kind === 'neighbor' ? 'rel' : 'f';
  if (p.nicedDay !== S.day) { p.nicedDay = S.day; p[key] = clamp(p[key] + 6); fun2(4); addSkill('comm', 0.5); }
  log(`💬 You told ${p.name}: "${said}" They said: "${reply}"`, 'good');
  showModal(`<div class="talk"><img class="avatar" src="${avatarURL(p.look, 96)}" alt=""><div><b>${esc(p.name)}</b><div class="bubble">${esc(reply)}</div></div></div>
    <p class="muted small">You said: "${esc(said)}" · Being kind makes people happy! ❤️</p>`,
    [{ label: kind === 'neighbor' ? '‹ Keep talking' : 'OK', cls: 'primary', fn: () => kind === 'neighbor' ? talkNeighbor(i) : done() }]);
  save();
}
