// ===================== PETS =====================
// Buy or adopt a pet, give it a name, and take care of it every day.

const PET_TYPES = {
  dog:     { name: 'Dog',        icon: '🐶', price: 350, adopt: 60, eats: 1, walks: true, big: true, colors: ['#c8913c', '#3b2a1e', '#f2e6d0', '#8a5a2b'], about: 'Loyal and playful. Needs a walk every day!' },
  cat:     { name: 'Cat',        icon: '🐱', price: 220, adopt: 50, eats: 1, colors: ['#f2a65a', '#7a7a7a', '#2b2b2b', '#f5f0e6'], about: 'Cuddly and curious. Needs a clean litter box.' },
  rabbit:  { name: 'Rabbit',     icon: '🐰', price: 90, eats: 1, colors: ['#f5f0e6', '#a07850', '#5a4a3a'], about: 'Soft and gentle. Loves carrots and hay.' },
  guinea:  { name: 'Guinea Pig', icon: '🐹', price: 55, eats: 1, colors: ['#d9a066', '#f5f0e6', '#6b4a2b'], about: 'Small and chatty. Squeaks when happy!' },
  hamster: { name: 'Hamster',    icon: '🐹', price: 40, eats: 0.5, colors: ['#e0b07a', '#f5ebe0'], about: 'Tiny and fast. Runs on its wheel at night.' },
  parrot:  { name: 'Parrot',     icon: '🦜', price: 180, eats: 1, colors: ['#2e9d58', '#1e88e5', '#e53935'], about: 'Colorful and smart. Can learn to talk!' },
  turtle:  { name: 'Turtle',     icon: '🐢', price: 65, eats: 0.5, colors: ['#5a8a3a'], about: 'Slow and calm. Lives a really long time.' },
  fish:    { name: 'Goldfish',   icon: '🐠', price: 25, eats: 0.25, colors: ['#ff8c1a', '#ffd23f', '#e53935'], about: 'Easy to care for. Comes with a fish bowl.' },
};
// Some homes don't allow every pet (just like real landlords!)
const PET_RULES = {
  parents: null, small: null, family: null, mansion: null,
  onebed: ['dog'], studio: ['dog', 'parrot'], shared: ['dog', 'cat', 'parrot', 'rabbit'],
};
const PET_NAMES = ['Max', 'Luna', 'Bella', 'Charlie', 'Coco', 'Biscuit', 'Peanut', 'Pepper', 'Ziggy', 'Mochi', 'Rocky', 'Daisy', 'Nugget', 'Sunny', 'Pickles', 'Oreo'];
const MAX_PETS = 3;

function ensurePetState() { if (!S.pets) S.pets = []; if (S.petFood === undefined) S.petFood = 0; }
function petAllowed(kind, homeId = S.home) { const no = PET_RULES[homeId]; return !no || !no.includes(kind); }
function petsOkFor(homeId) {
  const bad = (S.pets || []).filter(p => !petAllowed(p.kind, homeId));
  if (bad.length) { nope(`🐾 ${HOMES[homeId].name} doesn't allow ${bad.map(p => PET_TYPES[p.kind].name.toLowerCase() + 's').join(' or ')}. ${bad[0].name} needs a home where pets are allowed!`); return false; }
  return true;
}

// ---------- time passing ----------
function petTick(h) {
  (S.pets || []).forEach(p => {
    const t = PET_TYPES[p.kind];
    p.food = clamp(p.food - 2 * t.eats * h * (p.kind === 'fish' ? 1.6 : 1));
    p.happy = clamp(p.happy - (t.walks ? 1.5 : 1) * h);
    p.clean = clamp(p.clean - (p.kind === 'fish' || p.kind === 'turtle' ? 0.5 : 0.8) * h);
    if (p.food <= 0) p.health -= 2 * h; else if (p.clean < 15) p.health -= 0.5 * h; else p.health += 0.3 * h;
    p.health = clamp(p.health);
  });
  if (atHome() && S.pets && S.pets.length) S.needs.fun = clamp(S.needs.fun + S.pets.filter(p => p.happy > 50).length * 0.4 * h);
}
function petNewDay() {
  ensurePetState();
  S.pets.forEach(p => {
    p.age = (p.age || 0) + 1;
    if (PET_TYPES[p.kind].walks) {
      if (!p.walked) { p.happy = clamp(p.happy - 15); if (Math.random() < 0.4) { log(`💩 ${p.name} had an accident on the floor because nobody took them for a walk!`, 'bad'); S.needs.fun = clamp(S.needs.fun - 8); } }
      p.walked = false;
    }
    p.happyStreak = p.happy > 70 ? (p.happyStreak || 0) + 1 : 0;
    if (p.happyStreak >= 7) unlock('happy_pet');
    if (p.health <= 0) {
      const bill = 250;
      charge(bill, `Emergency vet for ${p.name}`);
      p.health = 60; p.food = 60; p.neglect = (p.neglect || 0) + 1;
      queueModal(`<h2>🚑 ${esc(p.name)} Got Very Sick</h2><p>${esc(p.name)} wasn't taken care of and got very sick. The emergency vet made ${esc(p.name)} better.</p><p>Bill: <b>${money(bill)}</b></p><p class="lesson">💡 Pets depend on you for food, water, a clean home and love — every single day.</p>`);
    }
  });
  const gone = S.pets.filter(p => (p.neglect || 0) >= 3);
  gone.forEach(p => {
    queueModal(`<h2>🏠 ${esc(p.name)} Found a New Home</h2><p>${esc(p.name)} got sick too many times, so the animal shelter took ${esc(p.name)} to a family who can take better care of them.</p><p class="lesson">💡 Having a pet is a big responsibility. Before you get one, make sure you have the time and money to care for it.</p>`);
    log(`😢 The animal shelter gave ${p.name} a new home.`, 'bad');
  });
  S.pets = S.pets.filter(p => (p.neglect || 0) < 3);
}

// ---------- getting a pet ----------
function getPet(kind, adopt) {
  ensurePetState();
  const t = PET_TYPES[kind];
  if (S.pets.length >= MAX_PETS) return nope(`You can have up to ${MAX_PETS} pets. That's plenty to take care of!`);
  if (!petAllowed(kind)) return nope(`🏢 Your ${home().name} doesn't allow ${t.name.toLowerCase()}s. Find a home with a yard!`);
  const price = adopt ? t.adopt : t.price;
  const suggest = PET_NAMES[Math.floor(Math.random() * PET_NAMES.length)];
  showModal(`<h2>${t.icon} ${adopt ? 'Adopt' : 'Buy'} a ${t.name}</h2>
    <p>${t.about}</p>
    <p>${adopt ? `Adoption fee: <b>${money(price)}</b>. This ${t.name.toLowerCase()} is waiting at the shelter for a loving home! ❤️` : `Price: <b>${money(price)}</b>`}</p>
    <label class="field">What will you name your ${t.name.toLowerCase()}?<input id="petname" maxlength="14" value="${suggest}"></label>
    <p class="lesson">💡 Pets need food every day. Buy pet food here at the pet shop. ${t.walks ? 'Dogs need a walk every day too!' : ''}</p>`,
    [{ label: 'Not now', cls: 'ghost' }, { label: `${t.icon} ${adopt ? 'Adopt' : 'Buy'} for ${money(price)}`, cls: 'primary', keepOpen: true, fn: () => {
      const name = ($('#petname').value || '').trim();
      if (!name) { nope('Give your pet a name!'); return; }
      closeModal();
      if (!spend(price, adopt ? `Adopted ${name}` : `Bought ${name} the ${t.name.toLowerCase()}`)) return;
      const r = Math.random();
      S.pets.push({ kind, name, color: t.colors[Math.floor(r * t.colors.length)], food: 80, happy: 90, clean: 100, health: 100, age: adopt ? 400 + Math.floor(r * 900) : 30, walked: true, id: Date.now() });
      unlock('pet_owner');
      log(`${t.icon} Welcome home, ${name}! You ${adopt ? 'adopted' : 'bought'} a ${t.name.toLowerCase()}.`, 'good');
      queueModal(`<h2>${t.icon} Meet ${esc(name)}!</h2><p>${esc(name)} is your new ${t.name.toLowerCase()}! Take care of ${esc(name)} from the 🐾 Pets section on your Home screen.</p><ul class="notes"><li>🍖 Feed twice a day</li><li>🎾 Play and cuddle so they're happy</li><li>🧽 Keep their home clean</li>${t.walks ? '<li>🦮 Walk every day</li>' : ''}<li>🩺 Visit the vet for checkups</li></ul>`);
      done();
    } }]);
}

// ---------- caring ----------
function petAct(i, what) {
  const p = S.pets[i]; if (!p) return;
  const t = PET_TYPES[p.kind];
  if (!atHome()) return nope('You can only do that at home.');
  if (what === 'feed') {
    if (S.petFood < t.eats) return nope('You\'re out of pet food! Buy some at Happy Paws Pet Shop.');
    S.petFood = Math.max(0, S.petFood - t.eats); pass(0.1); p.food = clamp(p.food + 50); p.happy = clamp(p.happy + 4);
    log(`🍖 You fed ${p.name}. ${p.kind === 'dog' ? 'Their tail wagged like crazy!' : p.kind === 'cat' ? 'They purred.' : p.kind === 'fish' ? 'Blub blub!' : 'Munch munch!'}`);
  } else if (what === 'play') {
    if (S.needs.energy < 10) return nope('You\'re too tired to play.');
    pass(0.5, 'relax'); p.happy = clamp(p.happy + 28); S.needs.fun = clamp(S.needs.fun + 8); addSkill('animal', 1);
    log({ dog: `🎾 You played fetch with ${p.name}!`, cat: `🧶 ${p.name} chased a string around the room!`, parrot: `🦜 You taught ${p.name} a new word: "Hello!"`, fish: `🐠 You watched ${p.name} swim around the castle.`, turtle: `🐢 ${p.name} slowly walked around the floor exploring.`, rabbit: `🐰 ${p.name} hopped through a tunnel!`, guinea: `🐹 ${p.name} squeaked and ran in circles!`, hamster: `🐹 ${p.name} ran in a ball across the floor!` }[p.kind]);
  } else if (what === 'cuddle') {
    if (p.kind === 'fish' || p.kind === 'turtle') return nope(`${p.name} would rather stay in the water!`);
    pass(0.1, 'relax'); p.happy = clamp(p.happy + 10); S.needs.fun = clamp(S.needs.fun + 5);
    log(`🤗 You cuddled ${p.name}. So soft!`);
  } else if (what === 'clean') {
    pass(0.25); p.clean = 100; S.handsDirty = true; S.needs.hygiene = clamp(S.needs.hygiene - 4);
    log({ dog: `🛁 You gave ${p.name} a bath and swept up the fur.`, cat: `🧹 You cleaned ${p.name}'s litter box. (Wash your hands!)` }[p.kind] || `🧽 You cleaned ${p.name}'s ${p.kind === 'fish' || p.kind === 'turtle' ? 'tank' : 'cage'}. (Wash your hands!)`);
  } else if (what === 'walk') {
    if (!t.walks) return;
    if (S.needs.energy < 15) return nope('You\'re too tired for a walk.');
    if (p.walked) return nope(`${p.name} already went for a walk today. Thanks!`);
    pass(1, 'sport'); p.walked = true; p.happy = clamp(p.happy + 30); addSkill('fit', 1.5); addSkill('animal', 1); S.needs.fun = clamp(S.needs.fun + 8);
    log(`🦮 You walked ${p.name} around the block. ${p.name} sniffed every tree!`, 'good');
  }
  done();
}
function petBuy(what) {
  const items = { food: [15, 'Pet Food (14 meals)', () => { S.petFood += 14; }], bigfood: [40, 'Big Bag of Pet Food (45 meals)', () => { S.petFood += 45; }], toy: [10, 'Pet Toy', () => { (S.pets || []).forEach(p => p.happy = clamp(p.happy + 20)); }] };
  const [price, label, fn] = items[what];
  if (!spend(price, label)) return;
  fn();
  log(what === 'toy' ? '🎾 You bought a squeaky toy. Your pets love it!' : `🍖 You bought ${label.toLowerCase()}. You have ${S.petFood} meals of pet food.`);
  done();
}
function vetCheck(i, what) {
  const p = S.pets[i]; if (!p) return;
  const insured = S.insurance || (S.job && JOBS[S.job.id].insurance);
  const price = { checkup: 60, groom: 35, shots: 45 }[what];
  if (!spend(price, `Vet: ${p.name}`)) return;
  pass(1);
  if (what === 'checkup') { p.health = 100; p.neglect = Math.max(0, (p.neglect || 0) - 1); log(`🩺 The vet checked ${p.name}'s ears, eyes and teeth. Healthy and happy!`, 'good'); }
  if (what === 'groom') { p.clean = 100; p.happy = clamp(p.happy + 10); log(`✂️ ${p.name} got a bath, a haircut and a bow. So fancy!`); }
  if (what === 'shots') { p.health = clamp(p.health + 20); p.vaccinated = true; log(`💉 ${p.name} got vaccines to stay healthy. Brave pet!`); }
  addSkill('animal', 0.5);
  done();
}

// ---------- screens ----------
function petBar(v, label) { const cls = v < 25 ? 'low' : v < 50 ? 'mid' : 'ok'; return `<div class="pbar"><span>${label}</span><div class="bar small"><div class="fill ${cls}" style="width:${v}%"></div></div></div>`; }
function petsSection() {
  ensurePetState();
  if (!S.pets.length) return `<div class="card pets"><h3>🐾 Pets</h3><p class="muted">No pets yet. Visit <a onclick="setTab('petshop')">🐾 Happy Paws Pet Shop</a> (just east of town) to buy or adopt one!</p></div>`;
  return `<div class="card pets"><h3>🐾 Your Pets <span class="muted small">· 🍖 ${S.petFood} meals of pet food</span></h3>
    <div class="grid petgrid">${S.pets.map((p, i) => { const t = PET_TYPES[p.kind]; return `<div class="petcard">
      <div class="jt"><b>${t.icon} ${esc(p.name)}</b><span class="muted small">${t.name} · ${p.age > 365 ? Math.floor(p.age / 365) + ' yr' : p.age + ' days'}</span></div>
      ${petBar(p.food, '🍖 Food')}${petBar(p.happy, '😊 Happy')}${petBar(p.clean, '🧽 Clean')}${petBar(p.health, '❤️ Health')}
      <div class="row">
        <button class="btn sm primary" onclick="petAct(${i},'feed')">Feed</button>
        <button class="btn sm primary" onclick="petAct(${i},'play')">Play</button>
        ${p.kind !== 'fish' && p.kind !== 'turtle' ? `<button class="btn sm ghost" onclick="petAct(${i},'cuddle')">Cuddle</button>` : ''}
        <button class="btn sm ghost" onclick="petAct(${i},'clean')">Clean</button>
        ${t.walks ? `<button class="btn sm ${p.walked ? 'ghost' : 'primary'}" onclick="petAct(${i},'walk')">${p.walked ? '✅ Walked' : '🦮 Walk'}</button>` : ''}
      </div></div>`; }).join('')}</div></div>`;
}
function viewPetShop() {
  ensurePetState();
  const row = (k, adopt) => { const t = PET_TYPES[k]; const ok = petAllowed(k); return `<div class="card item">
    <div class="jt"><b>${t.icon} ${t.name}</b><span class="pay">${money(adopt ? t.adopt : t.price)}</span></div>
    <p class="muted small">${adopt ? 'A grown-up ' + t.name.toLowerCase() + ' from the shelter who needs a home. ' : ''}${t.about}</p>
    ${ok ? `<button class="btn primary sm" onclick="getPet('${k}', ${!!adopt})">${adopt ? '❤️ Adopt' : 'Buy'}</button>` : `<span class="chip warn">🚫 Not allowed in your ${home().name}</span>`}</div>`; };
  return `<p>Buy a pet, or adopt one from the shelter for much less. You have <b>${S.pets.length}/${MAX_PETS}</b> pets.</p>
    <h3>🛒 Pet Supplies</h3>
    <div class="grid shop">
      <div class="card item"><div class="jt"><b>🍖 Pet Food (14 meals)</b><span class="pay">$15</span></div><p class="muted small">Every pet needs to eat about twice a day. You have ${S.petFood} meals.</p><button class="btn primary sm" onclick="petBuy('food')">Buy</button></div>
      <div class="card item"><div class="jt"><b>🍖 Big Bag (45 meals)</b><span class="pay">$40</span></div><p class="muted small">Buying more at once costs less per meal!</p><button class="btn primary sm" onclick="petBuy('bigfood')">Buy</button></div>
      <div class="card item"><div class="jt"><b>🎾 Squeaky Toy</b><span class="pay">$10</span></div><p class="muted small">Makes all your pets happier.</p><button class="btn primary sm" onclick="petBuy('toy')">Buy</button></div>
    </div>
    <h3>❤️ Adoption Center</h3><div class="grid shop">${['dog', 'cat'].map(k => row(k, true)).join('')}</div>
    <h3>🐾 Pets for Sale</h3><div class="grid shop">${Object.keys(PET_TYPES).map(k => row(k, false)).join('')}</div>
    <p class="lesson">💡 Apartments often have pet rules. Dogs need a house with a yard (or your parents' house).</p>`;
}
function viewVet() {
  ensurePetState();
  if (!S.pets.length) return '<p>The vet takes care of sick animals and gives checkups. You don\'t have any pets yet.</p>';
  return `<p>Bring your pets for checkups, vaccines and grooming.</p>
    <div class="grid two">${S.pets.map((p, i) => `<div class="card"><h3>${PET_TYPES[p.kind].icon} ${esc(p.name)}</h3>${petBar(p.health, '❤️ Health')}${petBar(p.clean, '🧽 Clean')}
      <div class="row"><button class="btn sm primary" onclick="vetCheck(${i},'checkup')">🩺 Checkup $60</button><button class="btn sm primary" onclick="vetCheck(${i},'shots')">💉 Vaccines $45</button><button class="btn sm ghost" onclick="vetCheck(${i},'groom')">✂️ Grooming $35</button></div></div>`).join('')}</div>`;
}

// ---------- pets in your room picture ----------
function drawPets(c) {
  ensurePetState();
  const count = {};
  S.pets.forEach(p => {
    const n = count[p.kind] = (count[p.kind] || 0) + 1;
    const off = (n - 1) * 46;
    const col = p.color;
    const sad = p.happy < 30;
    if (p.kind === 'dog') {
      const x = 470 + off, y = 300;
      c.fillStyle = 'rgba(0,0,0,.2)'; c.beginPath(); c.ellipse(x + 4, y + 10, 34, 7, 0, 0, Math.PI * 2); c.fill();
      const g = c.createLinearGradient(0, y - 22, 0, y + 10); g.addColorStop(0, tone(col, 0.2)); g.addColorStop(1, tone(col, -0.25));
      c.fillStyle = g; c.beginPath(); c.ellipse(x, y - 4, 28, 13, 0, 0, Math.PI * 2); c.fill();            // body
      c.strokeStyle = tone(col, -0.1); c.lineWidth = 5; c.beginPath(); c.moveTo(x - 26, y - 6); c.quadraticCurveTo(x - 42, y - (sad ? 4 : 22), x - 36, y - (sad ? 0 : 26)); c.stroke();   // tail
      c.fillStyle = g; c.fillRect(x + 6, y + 2, 8, 9); c.fillRect(x + 18, y + 2, 8, 9);                    // paws
      c.beginPath(); c.arc(x + 30, y - 18, 13, 0, Math.PI * 2); c.fill();                                   // head
      c.beginPath(); c.ellipse(x + 40, y - 13, 8, 6, 0, 0, Math.PI * 2); c.fill();                          // snout
      c.fillStyle = tone(col, -0.35); c.beginPath(); c.ellipse(x + 22, y - 16, 5, 11, 0.3, 0, Math.PI * 2); c.fill();   // ear
      c.fillStyle = '#1a1a1a'; c.beginPath(); c.arc(x + 47, y - 15, 2.6, 0, Math.PI * 2); c.fill(); c.beginPath(); c.arc(x + 33, y - 22, 1.8, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#e53935'; c.fillRect(x + 20, y - 9, 14, 3); knob(c, x + 27, y - 5, 2, '#d4af37');      // collar
      if (!sad) { c.fillStyle = '#ef8fa0'; c.beginPath(); c.ellipse(x + 42, y - 7, 2.5, 4, 0, 0, Math.PI * 2); c.fill(); }
    } else if (p.kind === 'cat') {
      const onCouch = has('couch'), x = (onCouch ? 450 : 110) + off, y = onCouch ? 214 : 206;
      const g = c.createRadialGradient(x - 5, y - 10, 2, x, y - 4, 22); g.addColorStop(0, tone(col, 0.25)); g.addColorStop(1, tone(col, -0.25));
      c.fillStyle = g; c.beginPath(); c.ellipse(x, y - 6, 19, 11, 0, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.arc(x + 16, y - 12, 8, 0, Math.PI * 2); c.fill();
      tri(c, [[x + 10, y - 17], [x + 12, y - 26], [x + 16, y - 19]], tone(col, -0.1)); tri(c, [[x + 18, y - 19], [x + 23, y - 26], [x + 23, y - 15]], tone(col, -0.1));
      c.strokeStyle = tone(col, -0.15); c.lineWidth = 4; c.beginPath(); c.moveTo(x - 17, y - 4); c.quadraticCurveTo(x - 10, y + 6, x + 6, y + 4); c.stroke();
      c.strokeStyle = '#222'; c.lineWidth = 1; c.beginPath(); c.arc(x + 13, y - 12, 1.6, 0, Math.PI); c.arc(x + 19, y - 12, 1.6, 0, Math.PI); c.stroke();
      if (p.happy > 60) txt(c, 'z', x + 28, y - 26, '#7a8aa0', 9, 900);
    } else if (p.kind === 'fish') {
      const x = 560 + off, y = 300;
      c.fillStyle = 'rgba(0,0,0,.2)'; c.beginPath(); c.ellipse(x, y + 22, 22, 5, 0, 0, Math.PI * 2); c.fill();
      const bg = c.createRadialGradient(x - 6, y - 6, 2, x, y, 24); bg.addColorStop(0, 'rgba(220,245,255,.95)'); bg.addColorStop(1, `rgba(${p.clean < 40 ? '120,150,90' : '90,170,220'},.85)`);
      c.fillStyle = bg; c.beginPath(); c.arc(x, y, 22, 0, Math.PI * 2); c.fill();
      c.fillStyle = 'rgba(255,255,255,.5)'; c.beginPath(); c.ellipse(x, y - 18, 16, 4, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = col; c.beginPath(); c.ellipse(x - 2, y + 2, 7, 4.5, 0, 0, Math.PI * 2); c.fill(); tri(c, [[x + 4, y + 2], [x + 11, y - 3], [x + 11, y + 7]], col);
      c.fillStyle = '#111'; c.beginPath(); c.arc(x - 6, y + 1, 1, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#e0c080'; c.beginPath(); c.ellipse(x, y + 18, 16, 4, 0, 0, Math.PI); c.fill();
    } else if (p.kind === 'parrot') {
      const x = 240 + off, y = 172;
      metal(c, x - 2, y, 4, 96, 1, '#8a7340'); c.fillStyle = '#8a7340'; c.beginPath(); c.ellipse(x, 266, 16, 4, 0, 0, Math.PI * 2); c.fill();
      c.strokeStyle = '#c9a54a'; c.lineWidth = 1.2; for (let k = -3; k <= 3; k++) { c.beginPath(); c.moveTo(x + k * 7, y - 2); c.quadraticCurveTo(x + k * 7, y - 46, x, y - 50); c.stroke(); } c.beginPath(); c.ellipse(x, y - 2, 22, 4, 0, 0, Math.PI * 2); c.stroke();
      c.fillStyle = col; c.beginPath(); c.ellipse(x, y - 20, 7, 11, 0, 0, Math.PI * 2); c.fill(); c.beginPath(); c.arc(x + 2, y - 31, 6, 0, Math.PI * 2); c.fill();
      tri(c, [[x - 4, y - 12], [x - 2, y + 2], [x + 2, y - 12]], tone(col, -0.3)); tri(c, [[x + 6, y - 33], [x + 12, y - 30], [x + 7, y - 27]], '#f2b705');
      c.fillStyle = '#fff'; c.beginPath(); c.arc(x + 4, y - 32, 2, 0, Math.PI * 2); c.fill(); c.fillStyle = '#111'; c.beginPath(); c.arc(x + 4.5, y - 32, 1, 0, Math.PI * 2); c.fill();
    } else {   // small pets live in a cage, hutch or tank on the floor
      const x = 640 + off, y = 300, tank = p.kind === 'turtle';
      c.fillStyle = 'rgba(0,0,0,.2)'; c.beginPath(); c.ellipse(x + 26, y + 12, 34, 6, 0, 0, Math.PI * 2); c.fill();
      if (tank) { const tg = c.createLinearGradient(0, y - 26, 0, y + 8); tg.addColorStop(0, 'rgba(160,215,240,.6)'); tg.addColorStop(1, 'rgba(70,140,180,.8)'); c.fillStyle = tg; c.fillRect(x, y - 26, 56, 34); c.fillStyle = '#9e8a6a'; c.fillRect(x, y + 2, 56, 6); }
      else { c.fillStyle = '#e8d9b0'; c.fillRect(x, y + 2, 56, 6); }
      const g = c.createRadialGradient(x + 24, y - 8, 1, x + 26, y - 4, 14); g.addColorStop(0, tone(col, 0.3)); g.addColorStop(1, tone(col, -0.2));
      c.fillStyle = g;
      if (tank) { c.beginPath(); c.ellipse(x + 28, y - 2, 13, 7, 0, Math.PI, 0); c.fill(); c.fillStyle = tone(col, 0.2); c.beginPath(); c.arc(x + 42, y - 2, 4, 0, Math.PI * 2); c.fill(); c.strokeStyle = tone(col, -0.4); c.lineWidth = 0.8; c.beginPath(); c.moveTo(x + 22, y - 8); c.lineTo(x + 34, y - 8); c.moveTo(x + 28, y - 9); c.lineTo(x + 28, y - 2); c.stroke(); }
      else {
        c.beginPath(); c.ellipse(x + 26, y - 4, p.kind === 'hamster' ? 9 : 13, p.kind === 'hamster' ? 7 : 9, 0, 0, Math.PI * 2); c.fill();
        if (p.kind === 'rabbit') { c.beginPath(); c.ellipse(x + 34, y - 20, 3, 10, 0.2, 0, Math.PI * 2); c.ellipse(x + 39, y - 19, 3, 10, 0.4, 0, Math.PI * 2); c.fill(); }
        c.fillStyle = '#111'; c.beginPath(); c.arc(x + 33, y - 7, 1.4, 0, Math.PI * 2); c.fill(); c.fillStyle = '#ef8fa0'; c.beginPath(); c.arc(x + 37, y - 4, 1.4, 0, Math.PI * 2); c.fill();
        if (p.kind === 'hamster') { c.strokeStyle = '#9aa3aa'; c.lineWidth = 2; c.beginPath(); c.arc(x + 46, y - 12, 12, 0, Math.PI * 2); c.stroke(); }
        c.strokeStyle = 'rgba(120,130,140,.8)'; c.lineWidth = 1; for (let k = 0; k <= 56; k += 5) { c.beginPath(); c.moveTo(x + k, y + 2); c.lineTo(x + k, y - 26); c.stroke(); } c.beginPath(); c.moveTo(x, y - 26); c.lineTo(x + 56, y - 26); c.stroke();
      }
      if (p.clean < 40) { c.fillStyle = 'rgba(110,90,40,.6)'; for (let k = 0; k < 6; k++) c.fillRect(x + 4 + k * 8, y + 1, 3, 2); }
    }
    // a little name tag
    const tagX = { dog: 470 + off, cat: (has('couch') ? 450 : 110) + off, fish: 560 + off, parrot: 240 + off }[p.kind] ?? 666 + off;
    const tagY = { dog: 336, cat: (has('couch') ? 230 : 222), fish: 334, parrot: 120 }[p.kind] ?? 330;
    c.font = '800 9px system-ui, sans-serif'; const tw = c.measureText(p.name).width + 10;
    c.fillStyle = 'rgba(255,255,255,.85)'; rrect(c, tagX - tw / 2, tagY - 6, tw, 13, 6); c.fill(); txt(c, p.name, tagX, tagY + 0.5, '#5d4037', 9, 800);
  });
}

// ---------- the pet shop and vet in town ----------
Object.assign(PLACES, {
  petshop: { kind: 'place', far: true, shop: true, town: 'maple', name: 'Happy Paws Pet Shop', icon: '🐾', r: [1290, 240, 180, 140], door: [1380, 386], blurb: 'Buy or adopt a pet, and get pet food and toys.' },
  vet:     { kind: 'place', far: true, shop: true, town: 'maple', name: 'Animal Hospital', icon: '🩺', r: [1500, 240, 180, 140], door: [1590, 386], blurb: 'Checkups, vaccines and grooming for your pets.' },
});
Object.assign(ENTRANCE, {
  petshop: { facade: 'store', wall: '#e8f5e9', door: 'swing', doorCol: '#2e7d32', signBg: '#43a047', signFg: '#fff', hours: [9, 20], inside: '#f3faf2', awning: '#43a047', keeper: true },
  vet:     { facade: 'siding', wall: '#e3f2fd', door: 'swing', doorCol: '#0277bd', signBg: '#0288d1', signFg: '#fff', hours: [8, 19], inside: '#eef6fb', keeper: true },
});
INTERIORS.petshop = c => {
  iWall(c, '#f3faf2', { tiles: true }); iFloor(c, 'tile', ['#dfe9dc']); iLights(c, 'strip', [250, 750]);
  iSign(c, 380, 26, 240, 28, '#43a047', '#fff', '🐾 HAPPY PAWS', 14);
  // fish tanks
  for (let k = 0; k < 3; k++) { const tx = 40 + k * 90; box3d(c, tx, 150, 80, 50, 0.04, '#5fb3e0', 'solid'); const ag = c.createLinearGradient(0, 152, 0, 198); ag.addColorStop(0, '#9fdcf5'); ag.addColorStop(1, '#2a7ab0'); c.fillStyle = ag; c.fillRect(tx + 3, 153, 74, 44); for (let f = 0; f < 3; f++) { c.fillStyle = ['#ff8c1a', '#ffd23f', '#e53935'][(f + k) % 3]; c.beginPath(); c.ellipse(tx + 18 + f * 20, 168 + (f % 2) * 12, 5, 3, 0, 0, Math.PI * 2); c.fill(); } glass(c, tx + 3, 153, 74, 44, 'rgba(255,255,255,0)'); box3d(c, tx, 200, 80, 68, 0.04, '#8a6a44', 'wood', k); }
  // puppy pen
  c.fillStyle = '#efe2c0'; c.fillRect(420, 226, 220, 42);
  [[460, 250, '#c8913c'], [520, 256, '#f2e6d0'], [585, 248, '#3b2a1e']].forEach(([px, py, col]) => { c.fillStyle = col; c.beginPath(); c.ellipse(px, py, 16, 9, 0, 0, Math.PI * 2); c.fill(); c.beginPath(); c.arc(px + 15, py - 8, 8, 0, Math.PI * 2); c.fill(); c.fillStyle = tone(col, -0.35); c.beginPath(); c.ellipse(px + 11, py - 6, 3, 7, 0.3, 0, Math.PI * 2); c.fill(); c.fillStyle = '#111'; c.beginPath(); c.arc(px + 21, py - 8, 1.6, 0, Math.PI * 2); c.fill(); });
  c.strokeStyle = '#9aa3aa'; c.lineWidth = 2; for (let k = 0; k <= 220; k += 11) { c.beginPath(); c.moveTo(420 + k, 268); c.lineTo(420 + k, 222); c.stroke(); } c.beginPath(); c.moveTo(420, 222); c.lineTo(640, 222); c.stroke();
  iSign(c, 470, 196, 120, 20, '#e91e63', '#fff', '❤️ ADOPT ME!', 10);
  // cat tree and shelves of food
  box3d(c, 670, 120, 14, 148, 0.04, '#c9a06a', 'wood', 3); box3d(c, 650, 200, 60, 10, 0.06, '#8d6e63', 'fabric'); box3d(c, 660, 130, 50, 10, 0.06, '#8d6e63', 'fabric');
  c.fillStyle = '#7a7a7a'; c.beginPath(); c.ellipse(684, 124, 14, 8, 0, 0, Math.PI * 2); c.fill(); c.beginPath(); c.arc(696, 116, 6, 0, Math.PI * 2); c.fill();
  iShelf(c, 760, 60, 210, 208, 'grocery', 90, '#6d4c41');
  iPeople(c, [[540, 340, 2, staff('#43a047', 24)], [330, 330, 2, guest(60)]]);
};
INTERIORS.vet = c => {
  iWall(c, '#eef6fb', { tiles: true }); iFloor(c, 'tile', ['#dde8ee']); iLights(c, 'strip', [300, 700]);
  iSign(c, 380, 26, 240, 28, '#0288d1', '#fff', '🩺 ANIMAL HOSPITAL', 13);
  box3d(c, 400, 210, 200, 12, 0.08, '#cfd8dc', 'metal'); metal(c, 490, 222, 20, 46, 2, '#9aa3aa');
  const x = 470, y = 208; c.fillStyle = '#c8913c'; c.beginPath(); c.ellipse(x, y - 8, 26, 12, 0, 0, Math.PI * 2); c.fill(); c.beginPath(); c.arc(x + 28, y - 20, 12, 0, Math.PI * 2); c.fill(); c.fillStyle = '#8a5a2b'; c.beginPath(); c.ellipse(x + 20, y - 18, 5, 10, 0.3, 0, Math.PI * 2); c.fill(); c.fillStyle = '#111'; c.beginPath(); c.arc(x + 34, y - 22, 1.8, 0, Math.PI * 2); c.fill();
  iBoard(c, 60, 60, 220, 120, '#fff', 'HEALTHY PET TIPS', ['🍖 Feed twice a day', '💧 Fresh water always', '🦮 Walk dogs daily', '🩺 Checkup every year'], '#01579b');
  for (let k = 0; k < 4; k++) { const cx = 700 + k * 64; box3d(c, cx, 240, 54, 10, 0.08, '#4fc3f7', 'solid'); box3d(c, cx, 214, 6, 26, 0.04, '#4fc3f7', 'solid'); }
  c.fillStyle = '#f2a65a'; c.beginPath(); c.ellipse(790, 232, 14, 8, 0, 0, Math.PI * 2); c.fill(); c.beginPath(); c.arc(802, 226, 6, 0, Math.PI * 2); c.fill();
  iPeople(c, [[580, 214, 1.9, staff('#80cbc4', 25)], [760, 236, 1.6, guest(61)], [330, 330, 2, guest(62)]]);
};
