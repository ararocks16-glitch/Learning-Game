// ===================== PETS =====================
// Buy or adopt a real kind of animal, give it a name, and take care of it every day.

// base = how it's drawn and cared for. size matters for apartment rules (small dogs only).
const PET_GROUPS = [
  ['dog', '🐶 Dogs'], ['cat', '🐱 Cats'], ['small', '🐹 Small Animals'], ['bird', '🐦 Birds'], ['reptile', '🦎 Reptiles'], ['fish', '🐠 Fish & Water Pets'],
];
const PET_TYPES = {
  // ---- dogs (walk them every day!) ----
  dog:       { base: 'dog', name: 'Mixed-Breed Dog',    icon: '🐶', price: 250, adopt: 60, eats: 1, walks: true, colors: ['#c8913c', '#3b2a1e', '#f2e6d0', '#8a5a2b'], ears: 'floppy', about: 'Every mixed-breed dog is one of a kind. Lots of shelter dogs need homes!' },
  golden:    { base: 'dog', name: 'Golden Retriever',   icon: '🐕', price: 900, eats: 1.2, walks: true, colors: ['#d9a14a'], ears: 'floppy', fluffy: true, about: 'Friendly and gentle. Golden Retrievers love to swim and fetch.' },
  lab:       { base: 'dog', name: 'Labrador Retriever', icon: '🐕', price: 800, eats: 1.2, walks: true, colors: ['#e8c88a', '#2a2420', '#6b4226'], ears: 'floppy', about: 'One of the most popular dogs in the world. Great family dogs!' },
  shepherd:  { base: 'dog', name: 'German Shepherd',    icon: '🐕‍🦺', price: 1000, eats: 1.3, walks: true, colors: ['#b8742e'], pattern: 'saddle', ears: 'pointy', about: 'Smart and brave. Many work as police and rescue dogs.' },
  poodle:    { base: 'dog', name: 'Poodle',             icon: '🐩', price: 1100, eats: 0.8, walks: true, size: 'small', colors: ['#f7f3ea', '#2b2b2b', '#c9a27a'], ears: 'floppy', curly: true, about: 'Very smart, with curly fur that doesn\'t shed much.' },
  bulldog:   { base: 'dog', name: 'Bulldog',            icon: '🐶', price: 1500, eats: 1, walks: true, colors: ['#e9dcc8', '#c99a6a'], ears: 'small', stocky: true, pattern: 'patches', about: 'Calm and wrinkly. Bulldogs love naps more than running.' },
  beagle:    { base: 'dog', name: 'Beagle',             icon: '🐶', price: 700, eats: 0.9, walks: true, colors: ['#f4f0e6'], pattern: 'tricolor', ears: 'floppy', about: 'Has an amazing nose! Beagles sniff out everything.' },
  dachshund: { base: 'dog', name: 'Dachshund',          icon: '🌭', price: 750, eats: 0.6, walks: true, size: 'small', colors: ['#8a4a20', '#2b1d14'], ears: 'floppy', long: true, about: 'Long body, short legs. They were bred to chase badgers!' },
  husky:     { base: 'dog', name: 'Siberian Husky',     icon: '🐺', price: 1000, eats: 1.3, walks: true, energetic: true, colors: ['#7d8791'], pattern: 'mask', ears: 'pointy', curlTail: true, about: 'Built for snow! Huskies have tons of energy and need LONG walks.' },
  chihuahua: { base: 'dog', name: 'Chihuahua',          icon: '🐕', price: 600, eats: 0.4, walks: true, size: 'small', tiny: true, colors: ['#d9b07a', '#f2e6d0', '#3b2a1e'], ears: 'big', about: 'The smallest dog breed in the world, with a big personality!' },
  corgi:     { base: 'dog', name: 'Corgi',              icon: '🐕', price: 1200, eats: 0.8, walks: true, size: 'small', colors: ['#d9853a'], pattern: 'whitebelly', ears: 'pointy', short: true, about: 'Short legs, fluffy butt! Corgis were herding dogs on farms.' },
  // ---- cats ----
  cat:       { base: 'cat', name: 'Shelter Cat',        icon: '🐱', price: 150, adopt: 50, eats: 1, colors: ['#f2a65a', '#7a7a7a', '#2b2b2b', '#f5f0e6'], about: 'Cuddly and curious. Shelter cats make wonderful pets.' },
  siamese:   { base: 'cat', name: 'Siamese Cat',        icon: '🐈', price: 600, eats: 1, colors: ['#f1e4cc'], points: '#5a3e2b', eyes: '#4fa3e6', about: 'Very talkative! Siamese cats have bright blue eyes.' },
  persian:   { base: 'cat', name: 'Persian Cat',        icon: '🐈', price: 900, eats: 1, colors: ['#f5f5f5', '#b0b0b0'], fluffy: true, about: 'Super fluffy with a flat face. Needs brushing every day.' },
  mainecoon: { base: 'cat', name: 'Maine Coon',         icon: '🐈', price: 1000, eats: 1.3, colors: ['#8a6a4a'], stripes: true, big: true, about: 'One of the biggest house cats. Gentle giants with tufted ears.' },
  ragdoll:   { base: 'cat', name: 'Ragdoll Cat',        icon: '🐈', price: 900, eats: 1, colors: ['#f3ece0'], points: '#8a7a6a', eyes: '#4fa3e6', fluffy: true, about: 'Goes floppy like a rag doll when you pick it up!' },
  // ---- small animals ----
  rabbit:    { base: 'small', name: 'Holland Lop Rabbit', icon: '🐰', price: 90, eats: 1, colors: ['#f5f0e6', '#a07850', '#5a4a3a'], about: 'Floppy ears! Rabbits eat lots of hay and veggies.' },
  guinea:    { base: 'small', name: 'Guinea Pig',       icon: '🐹', price: 55, eats: 1, colors: ['#d9a066', '#f5f0e6', '#6b4a2b'], about: 'Guinea pigs "wheek" loudly when they\'re excited for food.' },
  hamster:   { base: 'small', name: 'Syrian Hamster',   icon: '🐹', price: 40, eats: 0.5, colors: ['#e0b07a', '#f5ebe0'], about: 'Stuffs food in its cheeks! Runs miles on its wheel at night.' },
  chinchilla:{ base: 'small', name: 'Chinchilla',       icon: '🐭', price: 250, eats: 0.6, colors: ['#a8a8a8'], about: 'The softest fur of any land animal. Takes baths in dust!' },
  hedgehog:  { base: 'small', name: 'Hedgehog',         icon: '🦔', price: 200, eats: 0.5, colors: ['#8a6a4a'], about: 'Covered in spines. Rolls into a ball when it\'s scared.' },
  ferret:    { base: 'small', name: 'Ferret',           icon: '🦦', price: 180, eats: 0.8, colors: ['#e6d2b5', '#6b4a2b'], about: 'Playful and wiggly. Ferrets do a happy "weasel war dance"!' },
  // ---- birds ----
  parrot:    { base: 'bird', name: 'Macaw Parrot',      icon: '🦜', price: 1200, eats: 1, colors: ['#e53935', '#1e88e5', '#2e9d58'], loud: true, about: 'Big, colorful and LOUD. Macaws can live 50 years or more!' },
  cockatiel: { base: 'bird', name: 'Cockatiel',         icon: '🐦', price: 150, eats: 0.4, colors: ['#9e9e9e'], crest: true, about: 'Has a yellow crest and orange cheeks. Loves to whistle songs.' },
  canary:    { base: 'bird', name: 'Canary',            icon: '🐤', price: 80, eats: 0.3, colors: ['#ffd23f'], about: 'A tiny yellow bird famous for its beautiful singing.' },
  // ---- reptiles ----
  turtle:    { base: 'reptile', name: 'Red-Eared Slider Turtle', icon: '🐢', price: 65, eats: 0.5, colors: ['#5a8a3a'], water: true, about: 'Swims and suns itself. Turtles can live 30 years!' },
  beardie:   { base: 'reptile', name: 'Bearded Dragon', icon: '🦎', price: 180, eats: 0.6, colors: ['#c9a06a'], about: 'Puffs out its spiky "beard" and waves its arm to say hi.' },
  gecko:     { base: 'reptile', name: 'Leopard Gecko',  icon: '🦎', price: 90, eats: 0.4, colors: ['#f2d06a'], spots: true, about: 'Spotted like a leopard. Geckos lick their own eyeballs to clean them!' },
  cornsnake: { base: 'reptile', name: 'Corn Snake',     icon: '🐍', price: 120, eats: 0.3, colors: ['#e2703a'], snake: true, about: 'A gentle, colorful snake. Only eats about once a week.' },
  // ---- fish & water pets ----
  fish:      { base: 'fish', name: 'Goldfish',          icon: '🐠', price: 25, eats: 0.25, colors: ['#ff8c1a', '#ffd23f', '#e53935'], about: 'Easy to care for. Comes with a fish bowl.' },
  betta:     { base: 'fish', name: 'Betta Fish',        icon: '🐟', price: 20, eats: 0.2, colors: ['#3949ab', '#e53935', '#8e24aa'], fancy: true, about: 'Has long flowing fins. Bettas need their own tank.' },
  axolotl:   { base: 'fish', name: 'Axolotl',           icon: '🦎', price: 100, eats: 0.4, colors: ['#f8b4c8'], axolotl: true, about: 'A smiling salamander that lives underwater. Can regrow its legs!' },
};
const baseOf = p => (PET_TYPES[p.kind || p] || PET_TYPES.dog).base;
const PET_NAMES = ['Max', 'Luna', 'Bella', 'Charlie', 'Coco', 'Biscuit', 'Peanut', 'Pepper', 'Ziggy', 'Mochi', 'Rocky', 'Daisy', 'Nugget', 'Sunny', 'Pickles', 'Oreo', 'Waffles', 'Pumpkin', 'Shadow', 'Noodle'];
const MAX_PETS = 3;

function ensurePetState() { if (!S.pets) S.pets = []; if (S.petFood === undefined) S.petFood = 0; }
// Pet rules, like real landlords
function petAllowed(kind, homeId = S.home) {
  const t = PET_TYPES[kind], b = t.base;
  if (['parents', 'small', 'family', 'mansion'].includes(homeId)) return true;
  if (homeId === 'onebed') return b !== 'dog' || t.size === 'small';
  if (homeId === 'studio') return b !== 'dog' && !t.loud;
  if (homeId === 'shared') return ['small', 'fish', 'reptile'].includes(b) || (b === 'bird' && !t.loud);
  return true;
}
function petRuleText(homeId = S.home) {
  return { onebed: 'Only small dogs allowed.', studio: 'No dogs and no loud birds.', shared: 'Only small animals, fish, reptiles and quiet birds.' }[homeId] || 'All pets allowed!';
}
function petsOkFor(homeId) {
  const bad = (S.pets || []).filter(p => !petAllowed(p.kind, homeId));
  if (bad.length) { nope(`🐾 ${HOMES[homeId].name} doesn't allow your ${PET_TYPES[bad[0].kind].name}. ${petRuleText(homeId)} ${bad[0].name} needs a home where pets are allowed!`); return false; }
  return true;
}

// ---------- time passing ----------
function petTick(h) {
  (S.pets || []).forEach(p => {
    const t = PET_TYPES[p.kind], b = t.base;
    p.food = clamp(p.food - 2 * t.eats * h * (b === 'fish' ? 1.6 : 1));
    p.happy = clamp(p.happy - (t.walks ? (t.energetic ? 2 : 1.5) : 1) * h);
    p.clean = clamp(p.clean - (b === 'fish' || b === 'reptile' ? 0.5 : 0.8) * h);
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
      if (!p.walked) { p.happy = clamp(p.happy - (PET_TYPES[p.kind].energetic ? 25 : 15)); if (Math.random() < 0.4) { log(`💩 ${p.name} had an accident on the floor because nobody took them for a walk!`, 'bad'); S.needs.fun = clamp(S.needs.fun - 8); } }
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
  const kinds = new Set((S.pets || []).map(p => baseOf(p)));
  if (kinds.size >= 3) unlock('zoo_keeper');
}

// ---------- getting a pet ----------
function getPet(kind, adopt) {
  ensurePetState();
  const t = PET_TYPES[kind];
  if (S.pets.length >= MAX_PETS) return nope(`You can have up to ${MAX_PETS} pets. That's plenty to take care of!`);
  if (!petAllowed(kind)) return nope(`🏢 Your ${home().name} doesn't allow a ${t.name}. ${petRuleText()}`);
  const price = adopt ? t.adopt : t.price;
  const suggest = PET_NAMES[Math.floor(Math.random() * PET_NAMES.length)];
  showModal(`<h2>${t.icon} ${adopt ? 'Adopt' : 'Buy'} a ${t.name}</h2>
    <p>${t.about}</p>
    <p>${adopt ? `Adoption fee: <b>${money(price)}</b>. This pet is waiting at the shelter for a loving home! ❤️` : `Price: <b>${money(price)}</b>`}</p>
    <label class="field">What will you name your ${t.name.toLowerCase()}?<input id="petname" maxlength="14" value="${suggest}"></label>
    <p class="lesson">💡 Pets need food every day. Buy pet food at the pet shop. ${t.walks ? `Dogs need a walk every day${t.energetic ? ' — and huskies need extra exercise' : ''}!` : ''}</p>`,
    [{ label: 'Not now', cls: 'ghost' }, { label: `${t.icon} ${adopt ? 'Adopt' : 'Buy'} for ${money(price)}`, cls: 'primary', keepOpen: true, fn: () => {
      const name = ($('#petname').value || '').trim();
      if (!name) { nope('Give your pet a name!'); return; }
      closeModal();
      if (!spend(price, adopt ? `Adopted ${name}` : `Bought ${name} the ${t.name}`)) return;
      const r = Math.random();
      S.pets.push({ kind, name, color: t.colors[Math.floor(r * t.colors.length)], food: 80, happy: 90, clean: 100, health: 100, age: adopt ? 400 + Math.floor(r * 900) : 60, walked: true, id: Date.now() });
      unlock('pet_owner');
      log(`${t.icon} Welcome home, ${name}! You ${adopt ? 'adopted' : 'bought'} a ${t.name}.`, 'good');
      queueModal(`<h2>${t.icon} Meet ${esc(name)}!</h2><p>${esc(name)} is your new ${t.name}! Take care of ${esc(name)} from the 🐾 Pets section on your Home screen.</p><p class="muted">Fun fact: ${t.about}</p><ul class="notes"><li>🍖 Feed twice a day</li><li>🎾 Play${['fish', 'reptile'].includes(t.base) ? '' : ' and cuddle'} so they're happy</li><li>🧽 Keep their home clean</li>${t.walks ? '<li>🦮 Walk every day</li>' : ''}<li>🩺 Visit the vet for checkups</li></ul>`);
      done();
    } }]);
}

// ---------- caring ----------
function petAct(i, what) {
  const p = S.pets[i]; if (!p) return;
  const t = PET_TYPES[p.kind], b = t.base;
  if (!atHome()) return nope('You can only do that at home.');
  if (what === 'feed') {
    if (S.petFood < t.eats) return nope('You\'re out of pet food! Buy some at Happy Paws Pet Shop.');
    S.petFood = Math.max(0, S.petFood - t.eats); pass(0.1); p.food = clamp(p.food + 50); p.happy = clamp(p.happy + 4);
    log(`🍖 You fed ${p.name}. ${{ dog: 'Their tail wagged like crazy!', cat: 'They purred.', fish: 'Blub blub!', bird: 'Tweet tweet!', reptile: t.snake ? 'Snakes eat slowly...' : 'Crunch! They love crickets.', small: 'Munch munch!' }[b]}`);
  } else if (what === 'play') {
    if (S.needs.energy < 10) return nope('You\'re too tired to play.');
    pass(0.5, 'relax'); p.happy = clamp(p.happy + 28); S.needs.fun = clamp(S.needs.fun + 8); addSkill('animal', 1);
    const msg = {
      dog: t.energetic ? `❄️ You and ${p.name} raced around the yard. Huskies never get tired!` : t.curly ? `🐩 ${p.name} learned a new trick: spin around!` : `🎾 You played fetch with ${p.name}!`,
      cat: `🧶 ${p.name} chased a string around the room!`,
      bird: t.loud ? `🦜 You taught ${p.name} to say "Hello!"` : `🎶 ${p.name} sang a song with you!`,
      fish: t.axolotl ? `🦎 ${p.name} smiled and wiggled its frilly gills at you.` : `🐠 You watched ${p.name} swim around the castle.`,
      reptile: t.snake ? `🐍 ${p.name} gently wrapped around your arm. Smooth, not slimy!` : t.water ? `🐢 ${p.name} slowly explored the floor.` : `🦎 ${p.name} sat on your shoulder${p.kind === 'beardie' ? ' and waved hello' : ''}!`,
      small: p.kind === 'hedgehog' ? `🦔 ${p.name} uncurled and sniffed your hand.` : p.kind === 'ferret' ? `🦦 ${p.name} did the happy ferret dance!` : p.kind === 'chinchilla' ? `🐭 ${p.name} took a dust bath and bounced around.` : `🐾 ${p.name} ran through a tunnel!`,
    }[b];
    log(msg);
  } else if (what === 'cuddle') {
    if (b === 'fish' || b === 'reptile') return nope(`${p.name} isn't really a cuddly pet!`);
    if (p.kind === 'hedgehog') { pass(0.1); p.happy = clamp(p.happy + 6); log(`🦔 You gently held ${p.name}. Prickly!`); return done(); }
    pass(0.1, 'relax'); p.happy = clamp(p.happy + 10); S.needs.fun = clamp(S.needs.fun + 5);
    log(`🤗 You cuddled ${p.name}. So soft!`);
  } else if (what === 'clean') {
    pass(0.25); p.clean = 100; S.handsDirty = true; S.needs.hygiene = clamp(S.needs.hygiene - 4);
    log({ dog: `🛁 You gave ${p.name} a bath and swept up the fur.`, cat: `🧹 You cleaned ${p.name}'s litter box. (Wash your hands!)` }[b] || `🧽 You cleaned ${p.name}'s ${b === 'fish' || b === 'reptile' ? 'tank' : 'cage'}. (Wash your hands!)`);
  } else if (what === 'walk') {
    if (!t.walks) return;
    if (S.needs.energy < 15) return nope('You\'re too tired for a walk.');
    if (p.walked) return nope(`${p.name} already went for a walk today. Thanks!`);
    const long = t.energetic;
    pass(long ? 1.5 : 1, 'sport'); p.walked = true; p.happy = clamp(p.happy + 30); addSkill('fit', long ? 2.5 : 1.5); addSkill('animal', 1); S.needs.fun = clamp(S.needs.fun + 8);
    log(long ? `🦮 You took ${p.name} on a long run. Huskies LOVE running!` : t.tiny ? `🦮 ${p.name} took 1,000 tiny steps around the block.` : `🦮 You walked ${p.name} around the block. ${p.name} sniffed every tree!`, 'good');
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
  const price = { checkup: 60, groom: 35, shots: 45 }[what];
  if (!spend(price, `Vet: ${p.name}`)) return;
  pass(1);
  if (what === 'checkup') { p.health = 100; p.neglect = Math.max(0, (p.neglect || 0) - 1); log(`🩺 The vet checked ${p.name} from nose to tail. Healthy and happy!`, 'good'); }
  if (what === 'groom') { p.clean = 100; p.happy = clamp(p.happy + 10); log(`✂️ ${p.name} got cleaned up and looks great!`); }
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
    <div class="grid petgrid">${S.pets.map((p, i) => { const t = PET_TYPES[p.kind], b = t.base; return `<div class="petcard">
      <div class="jt"><b>${t.icon} ${esc(p.name)}</b><span class="muted small">${p.age > 365 ? Math.floor(p.age / 365) + ' yr' : p.age + ' days'}</span></div>
      <div class="muted small">${t.name}</div>
      ${petBar(p.food, '🍖 Food')}${petBar(p.happy, '😊 Happy')}${petBar(p.clean, '🧽 Clean')}${petBar(p.health, '❤️ Health')}
      <div class="row">
        <button class="btn sm primary" onclick="petAct(${i},'feed')">Feed</button>
        <button class="btn sm primary" onclick="petAct(${i},'play')">Play</button>
        ${b !== 'fish' && b !== 'reptile' ? `<button class="btn sm ghost" onclick="petAct(${i},'cuddle')">Cuddle</button>` : ''}
        <button class="btn sm ghost" onclick="petAct(${i},'clean')">Clean</button>
        ${t.walks ? `<button class="btn sm ${p.walked ? 'ghost' : 'primary'}" onclick="petAct(${i},'walk')">${p.walked ? '✅ Walked' : '🦮 Walk'}</button>` : ''}
      </div></div>`; }).join('')}</div></div>`;
}
function viewPetShop() {
  ensurePetState();
  const card = (k, adopt) => { const t = PET_TYPES[k]; const ok = petAllowed(k); return `<div class="card item petshopcard">
    <canvas class="petpic" data-kind="${k}" width="160" height="90" aria-label="${t.name}"></canvas>
    <div class="jt"><b>${t.icon} ${t.name}</b><span class="pay">${money(adopt ? t.adopt : t.price)}</span></div>
    <p class="muted small">${adopt ? 'A grown-up pet from the shelter who needs a home. ' : ''}${t.about}</p>
    ${ok ? `<button class="btn primary sm" onclick="getPet('${k}', ${!!adopt})">${adopt ? '❤️ Adopt' : 'Buy'}</button>` : `<span class="chip warn">🚫 Not allowed in your ${home().name}</span>`}</div>`; };
  return `<p>Buy a pet, or adopt one from the shelter for much less. You have <b>${S.pets.length}/${MAX_PETS}</b> pets. <span class="muted">Your home: ${petRuleText()}</span></p>
    <h3>🛒 Pet Supplies</h3>
    <div class="grid shop">
      <div class="card item"><div class="jt"><b>🍖 Pet Food (14 meals)</b><span class="pay">$15</span></div><p class="muted small">Every pet needs to eat about twice a day. You have ${S.petFood} meals.</p><button class="btn primary sm" onclick="petBuy('food')">Buy</button></div>
      <div class="card item"><div class="jt"><b>🍖 Big Bag (45 meals)</b><span class="pay">$40</span></div><p class="muted small">Buying more at once costs less per meal!</p><button class="btn primary sm" onclick="petBuy('bigfood')">Buy</button></div>
      <div class="card item"><div class="jt"><b>🎾 Squeaky Toy</b><span class="pay">$10</span></div><p class="muted small">Makes all your pets happier.</p><button class="btn primary sm" onclick="petBuy('toy')">Buy</button></div>
    </div>
    <h3>❤️ Adoption Center</h3><div class="grid shop">${['dog', 'cat'].map(k => card(k, true)).join('')}</div>
    ${PET_GROUPS.map(([g, title]) => `<h3>${title}</h3><div class="grid shop">${Object.keys(PET_TYPES).filter(k => PET_TYPES[k].base === g).map(k => card(k, false)).join('')}</div>`).join('')}
    <p class="lesson">💡 Pure-bred dogs and fancy cats cost a lot. Shelter pets cost much less and need homes too!</p>`;
}
function drawShopPics() {
  document.querySelectorAll('canvas.petpic').forEach(cv => {
    const c = cv.getContext('2d');
    cv.width = 320; cv.height = 180; c.scale(2, 2);
    const g = c.createLinearGradient(0, 0, 0, 90); g.addColorStop(0, '#eef6ff'); g.addColorStop(0.72, '#f6f2ea'); g.addColorStop(0.72, '#e2d6c2'); g.addColorStop(1, '#d1c3ab');
    c.fillStyle = g; c.fillRect(0, 0, 160, 90);
    const k = cv.dataset.kind, t = PET_TYPES[k];
    drawPetAt(c, { kind: k, color: t.colors[0], happy: 90, clean: 100, name: '' }, t.base === 'bird' ? 80 : t.base === 'dog' ? 64 : 80, t.base === 'bird' ? 72 : 72, 1, true);
  });
}
function viewVet() {
  ensurePetState();
  if (!S.pets.length) return '<p>The vet takes care of sick animals and gives checkups. You don\'t have any pets yet.</p>';
  return `<p>Bring your pets for checkups, vaccines and grooming.</p>
    <div class="grid two">${S.pets.map((p, i) => `<div class="card"><h3>${PET_TYPES[p.kind].icon} ${esc(p.name)} <span class="muted small">${PET_TYPES[p.kind].name}</span></h3>${petBar(p.health, '❤️ Health')}${petBar(p.clean, '🧽 Clean')}
      <div class="row"><button class="btn sm primary" onclick="vetCheck(${i},'checkup')">🩺 Checkup $60</button><button class="btn sm primary" onclick="vetCheck(${i},'shots')">💉 Vaccines $45</button><button class="btn sm ghost" onclick="vetCheck(${i},'groom')">✂️ Grooming $35</button></div></div>`).join('')}</div>`;
}

// ---------- drawing the animals ----------
function fur(c, x, y, rx, ry, col, ang = 0) {
  const g = c.createRadialGradient(x - rx * 0.3, y - ry * 0.5, 1, x, y, Math.max(rx, ry));
  g.addColorStop(0, tone(col, 0.22)); g.addColorStop(1, tone(col, -0.22));
  c.fillStyle = g; c.beginPath(); c.ellipse(x, y, rx, ry, ang, 0, Math.PI * 2); c.fill();
}
function drawDog(c, x, y, t, col, sad, s = 1) {
  const S2 = (t.tiny ? 0.6 : t.size === 'small' ? 0.82 : 1) * s;
  const bodyL = (t.long ? 40 : t.stocky ? 26 : 28) * S2, bodyH = (t.stocky ? 15 : 12) * S2, leg = (t.long || t.short ? 5 : t.tiny ? 7 : 10) * S2;
  const by = y - leg - bodyH * 0.6;
  c.fillStyle = 'rgba(0,0,0,.2)'; c.beginPath(); c.ellipse(x + 4, y + 2, bodyL + 6, 5 * S2, 0, 0, Math.PI * 2); c.fill();
  // tail
  c.strokeStyle = tone(col, -0.1); c.lineWidth = (t.fluffy || t.curlTail ? 7 : 4) * S2; c.lineCap = 'round';
  c.beginPath(); c.moveTo(x - bodyL * 0.9, by - 2 * S2);
  if (t.curlTail) c.bezierCurveTo(x - bodyL * 1.3, by - 22 * S2, x - bodyL * 0.6, by - 26 * S2, x - bodyL * 0.6, by - 12 * S2);
  else if (t.short) c.lineTo(x - bodyL * 1.05, by - 4 * S2);
  else c.quadraticCurveTo(x - bodyL * 1.4, by - (sad ? -6 : 18) * S2, x - bodyL * 1.25, by - (sad ? -10 : 24) * S2);
  c.stroke();
  // legs
  const lc = t.pattern === 'tricolor' || t.pattern === 'whitebelly' ? '#f4f0e6' : tone(col, -0.12);
  [[-0.7, 0], [-0.45, 1], [0.45, 0], [0.7, 1]].forEach(([f, back]) => { c.fillStyle = back ? tone(lc, -0.15) : lc; rrect(c, x + bodyL * f - 3 * S2, by, 6 * S2, leg + bodyH * 0.5, 2 * S2); c.fill(); });
  // body
  if (t.curly) { for (let k = 0; k < 9; k++) fur(c, x - bodyL * 0.8 + k * bodyL * 0.2, by - (k % 2) * 3 * S2, 8 * S2, 9 * S2, col); }
  else fur(c, x, by, bodyL, bodyH, col);
  if (t.pattern === 'saddle' || t.pattern === 'tricolor') { c.fillStyle = t.pattern === 'saddle' ? '#2b1d14' : '#3b2a1e'; c.beginPath(); c.ellipse(x - 2 * S2, by - bodyH * 0.45, bodyL * 0.7, bodyH * 0.6, 0, Math.PI, 0); c.fill(); if (t.pattern === 'tricolor') { c.fillStyle = '#b8742e'; c.beginPath(); c.ellipse(x + bodyL * 0.55, by - 2 * S2, 8 * S2, 7 * S2, 0, 0, Math.PI * 2); c.fill(); } }
  if (t.pattern === 'whitebelly' || t.pattern === 'mask') { c.fillStyle = '#f4f0e6'; c.beginPath(); c.ellipse(x + 4 * S2, by + bodyH * 0.45, bodyL * 0.75, bodyH * 0.45, 0, 0, Math.PI); c.fill(); }
  if (t.pattern === 'patches') { c.fillStyle = '#b07a4a'; c.beginPath(); c.ellipse(x - 8 * S2, by - 3 * S2, 9 * S2, 6 * S2, 0.3, 0, Math.PI * 2); c.fill(); }
  // head
  const hx = x + bodyL * 0.95, hy = by - bodyH * (t.tiny ? 1.2 : 0.9), hr = (t.tiny ? 11 : t.stocky ? 12 : 11) * S2 * (t.tiny ? 1.25 : 1);
  if (t.curly) { fur(c, hx, hy - 4 * S2, 10 * S2, 10 * S2, col); fur(c, hx - 2 * S2, hy - 12 * S2, 8 * S2, 7 * S2, col); }
  fur(c, hx, hy, hr, hr * 0.95, col);
  const snoutL = t.stocky ? 5 : t.tiny ? 6 : t.pattern === 'saddle' || t.energetic ? 12 : 10;
  fur(c, hx + hr * 0.75, hy + 3 * S2, snoutL * S2, 6 * S2, t.pattern === 'mask' || t.pattern === 'tricolor' || t.pattern === 'whitebelly' ? '#f4f0e6' : col);
  if (t.pattern === 'mask') { c.fillStyle = '#f4f0e6'; c.beginPath(); c.ellipse(hx + 2 * S2, hy + 2 * S2, hr * 0.7, hr * 0.55, 0, 0, Math.PI * 2); c.fill(); }
  if (t.stocky) { c.strokeStyle = tone(col, -0.35, 0.6); c.lineWidth = 1; for (let k = 0; k < 3; k++) { c.beginPath(); c.arc(hx, hy - 5 * S2 + k * 3 * S2, 5 * S2, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); } }
  // ears
  const ec = t.pattern === 'tricolor' ? '#8a4a20' : tone(col, t.pattern === 'saddle' ? -0.5 : -0.3);
  c.fillStyle = ec;
  if (t.ears === 'pointy') { tri(c, [[hx - 8 * S2, hy - 6 * S2], [hx - 4 * S2, hy - 22 * S2], [hx + 2 * S2, hy - 8 * S2]], ec); tri(c, [[hx - 1 * S2, hy - 8 * S2], [hx + 4 * S2, hy - 22 * S2], [hx + 8 * S2, hy - 6 * S2]], tone(col, -0.15)); }
  else if (t.ears === 'big') { tri(c, [[hx - 10 * S2, hy - 4 * S2], [hx - 14 * S2, hy - 20 * S2], [hx - 1 * S2, hy - 8 * S2]], ec); tri(c, [[hx + 1 * S2, hy - 8 * S2], [hx + 9 * S2, hy - 22 * S2], [hx + 10 * S2, hy - 4 * S2]], tone(col, -0.15)); c.fillStyle = '#f4b6b6'; tri(c, [[hx + 3 * S2, hy - 9 * S2], [hx + 8 * S2, hy - 18 * S2], [hx + 8 * S2, hy - 6 * S2]], '#f4b6b6'); }
  else if (t.ears === 'small') { c.beginPath(); c.ellipse(hx - 7 * S2, hy - 8 * S2, 4 * S2, 3 * S2, -0.5, 0, Math.PI * 2); c.fill(); }
  else { c.beginPath(); c.ellipse(hx - 6 * S2, hy + 2 * S2, 5 * S2, (t.fluffy ? 12 : 10) * S2, 0.25, 0, Math.PI * 2); c.fill(); }
  // face
  c.fillStyle = '#1a1a1a'; c.beginPath(); c.arc(hx + hr * 0.75 + snoutL * S2 * 0.8, hy + 1 * S2, 2.6 * S2, 0, Math.PI * 2); c.fill();
  c.beginPath(); c.arc(hx + 3 * S2, hy - 3 * S2, 1.9 * S2, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#fff'; c.beginPath(); c.arc(hx + 3.6 * S2, hy - 3.6 * S2, 0.6 * S2, 0, Math.PI * 2); c.fill();
  if (!sad) { c.fillStyle = '#ef8fa0'; c.beginPath(); c.ellipse(hx + hr * 0.7 + snoutL * S2 * 0.4, hy + 8 * S2, 2.6 * S2, 4 * S2, 0, 0, Math.PI * 2); c.fill(); }
  c.fillStyle = '#e53935'; c.fillRect(hx - 8 * S2, hy + hr * 0.7, 12 * S2, 2.6 * S2); knob(c, hx - 2 * S2, hy + hr * 0.7 + 4 * S2, 1.8 * S2, '#d4af37');
}
function drawCat(c, x, y, t, col, sad, s = 1) {
  const S2 = (t.big ? 1.25 : 1) * s, pts = t.points;
  c.fillStyle = 'rgba(0,0,0,.18)'; c.beginPath(); c.ellipse(x + 2, y + 1, 24 * S2, 5 * S2, 0, 0, Math.PI * 2); c.fill();
  const furCol = col;
  if (t.fluffy) for (let k = 0; k < 7; k++) fur(c, x - 14 * S2 + k * 5 * S2, y - 8 * S2 - (k % 2) * 2, 8 * S2, 9 * S2, furCol);
  else fur(c, x, y - 7 * S2, 20 * S2, 11 * S2, furCol);
  if (t.stripes) { c.strokeStyle = tone(col, -0.45, 0.7); c.lineWidth = 2 * S2; for (let k = 0; k < 4; k++) { c.beginPath(); c.arc(x - 8 * S2 + k * 6 * S2, y - 8 * S2, 9 * S2, Math.PI * 1.2, Math.PI * 1.6); c.stroke(); } }
  c.strokeStyle = pts || tone(col, -0.15); c.lineWidth = (t.fluffy ? 7 : 4) * S2; c.lineCap = 'round';
  c.beginPath(); c.moveTo(x - 18 * S2, y - 5 * S2); c.quadraticCurveTo(x - 12 * S2, y + 6 * S2, x + 6 * S2, y + 3 * S2); c.stroke();
  const hx = x + 16 * S2, hy = y - 13 * S2;
  fur(c, hx, hy, 9 * S2, 8 * S2, furCol);
  if (pts) { c.fillStyle = pts; c.beginPath(); c.ellipse(hx + 1 * S2, hy + 2 * S2, 5 * S2, 4.5 * S2, 0, 0, Math.PI * 2); c.fill(); }
  const ec = pts || tone(col, -0.1);
  tri(c, [[hx - 7 * S2, hy - 4 * S2], [hx - 5 * S2, hy - 14 * S2], [hx, hy - 7 * S2]], ec); tri(c, [[hx + 1 * S2, hy - 7 * S2], [hx + 7 * S2, hy - 14 * S2], [hx + 8 * S2, hy - 3 * S2]], ec);
  if (t.big) { c.strokeStyle = ec; c.lineWidth = 1; c.beginPath(); c.moveTo(hx - 5 * S2, hy - 14 * S2); c.lineTo(hx - 6 * S2, hy - 18 * S2); c.moveTo(hx + 7 * S2, hy - 14 * S2); c.lineTo(hx + 8 * S2, hy - 18 * S2); c.stroke(); }
  if (sad || t.eyes) { const eye = t.eyes || '#8bc34a'; [[hx - 3 * S2], [hx + 3.5 * S2]].forEach(([ex]) => { c.fillStyle = eye; c.beginPath(); c.ellipse(ex, hy - 1 * S2, 1.8 * S2, 2 * S2, 0, 0, Math.PI * 2); c.fill(); c.fillStyle = '#111'; c.fillRect(ex - 0.4 * S2, hy - 2.6 * S2, 0.8 * S2, 3.2 * S2); }); }
  else { c.strokeStyle = '#222'; c.lineWidth = 1 * S2; c.beginPath(); c.arc(hx - 3 * S2, hy - 1 * S2, 1.8 * S2, 0, Math.PI); c.stroke(); c.beginPath(); c.arc(hx + 3.5 * S2, hy - 1 * S2, 1.8 * S2, 0, Math.PI); c.stroke(); }
  c.fillStyle = '#ef8fa0'; c.beginPath(); c.arc(hx + 0.5 * S2, hy + 2 * S2, 1.2 * S2, 0, Math.PI * 2); c.fill();
  c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 0.6; [-1, 1].forEach(d => { c.beginPath(); c.moveTo(hx + d * 3 * S2, hy + 3 * S2); c.lineTo(hx + d * 11 * S2, hy + 1 * S2); c.stroke(); });
}
function drawSmall(c, x, y, p, t, inCage) {
  const col = p.color;
  if (inCage) { c.fillStyle = '#e8d9b0'; c.fillRect(x, y + 2, 60, 6); }
  const k = p.kind;
  if (k === 'hedgehog') {
    c.fillStyle = tone(col, -0.2); for (let a = Math.PI; a < Math.PI * 2; a += 0.22) { c.beginPath(); c.moveTo(x + 28 + Math.cos(a) * 9, y - 2 + Math.sin(a) * 6); c.lineTo(x + 28 + Math.cos(a) * 17, y - 2 + Math.sin(a) * 13); c.lineTo(x + 28 + Math.cos(a + 0.12) * 9, y - 2 + Math.sin(a + 0.12) * 6); c.fill(); }
    fur(c, x + 28, y - 3, 13, 8, col); fur(c, x + 40, y - 2, 6, 5, '#e6cfa8'); c.fillStyle = '#111'; c.beginPath(); c.arc(x + 46, y - 2, 1.5, 0, Math.PI * 2); c.arc(x + 41, y - 4, 1.1, 0, Math.PI * 2); c.fill();
  } else if (k === 'ferret') {
    fur(c, x + 26, y - 4, 20, 6, col); fur(c, x + 46, y - 7, 7, 5.5, '#f2e6d6'); c.fillStyle = '#4a3020'; c.beginPath(); c.ellipse(x + 46, y - 8, 5, 2, 0, 0, Math.PI * 2); c.fill();
    c.strokeStyle = tone(col, -0.3); c.lineWidth = 3; c.lineCap = 'round'; c.beginPath(); c.moveTo(x + 7, y - 4); c.quadraticCurveTo(x - 2, y - 8, x - 2, y - 14); c.stroke();
    c.fillStyle = '#111'; c.beginPath(); c.arc(x + 48, y - 8, 1.2, 0, Math.PI * 2); c.fill();
  } else {
    const big = k === 'rabbit' ? 13 : k === 'chinchilla' ? 11 : k === 'guinea' ? 12 : 8;
    fur(c, x + 28, y - 5, big, big * 0.75, col);
    if (k === 'rabbit') { c.fillStyle = tone(col, -0.15); c.beginPath(); c.ellipse(x + 34, y - 10, 3.5, 11, 1.2, 0, Math.PI * 2); c.ellipse(x + 30, y - 9, 3.5, 11, 1.4, 0, Math.PI * 2); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(x + 16, y - 6, 4, 0, Math.PI * 2); c.fill(); }
    if (k === 'chinchilla') { fur(c, x + 33, y - 15, 5, 6, col); fur(c, x + 39, y - 15, 5, 6, col); c.strokeStyle = tone(col, -0.2); c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.moveTo(x + 17, y - 4); c.quadraticCurveTo(x + 8, y - 14, x + 12, y - 20); c.stroke(); }
    if (k === 'guinea') { c.fillStyle = '#f5f0e6'; c.beginPath(); c.ellipse(x + 22, y - 8, 6, 5, 0, 0, Math.PI * 2); c.fill(); }
    if (k === 'hamster') { fur(c, x + 34, y - 4, 4, 3.5, '#f5ebe0'); c.strokeStyle = '#9aa3aa'; c.lineWidth = 2; c.beginPath(); c.arc(x + 50, y - 12, 12, 0, Math.PI * 2); c.stroke(); for (let a = 0; a < 6; a++) { c.beginPath(); c.moveTo(x + 50, y - 12); c.lineTo(x + 50 + Math.cos(a) * 12, y - 12 + Math.sin(a) * 12); c.stroke(); } }
    c.fillStyle = '#111'; c.beginPath(); c.arc(x + 28 + big * 0.6, y - 7, 1.4, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#ef8fa0'; c.beginPath(); c.arc(x + 28 + big * 0.95, y - 4, 1.3, 0, Math.PI * 2); c.fill();
  }
  if (inCage) { c.strokeStyle = 'rgba(120,130,140,.8)'; c.lineWidth = 1; for (let k2 = 0; k2 <= 60; k2 += 5) { c.beginPath(); c.moveTo(x + k2, y + 2); c.lineTo(x + k2, y - 28); c.stroke(); } c.beginPath(); c.moveTo(x, y - 28); c.lineTo(x + 60, y - 28); c.stroke(); }
}
function drawBird(c, x, y, p, t, cage) {
  const col = p.color, sc = t.loud ? 1 : 0.75;
  if (cage) {
    if (t.loud) { metal(c, x - 2, y, 4, 96, 1, '#8a7340'); c.fillStyle = '#8a7340'; c.beginPath(); c.ellipse(x, y + 94, 16, 4, 0, 0, Math.PI * 2); c.fill(); }
    else { metal(c, x - 1, y - 60, 2, 12, 1, '#8a7340'); }
    c.strokeStyle = '#c9a54a'; c.lineWidth = 1.2; for (let k = -3; k <= 3; k++) { c.beginPath(); c.moveTo(x + k * 7, y - 2); c.quadraticCurveTo(x + k * 7, y - 46, x, y - 50); c.stroke(); } c.beginPath(); c.ellipse(x, y - 2, 22, 4, 0, 0, Math.PI * 2); c.stroke();
    metal(c, x - 14, y - 14, 28, 2, 1, '#8a6a44');
  }
  const by = y - 20;
  fur(c, x, by, 7 * sc, 11 * sc, col); fur(c, x + 2 * sc, by - 11 * sc, 6 * sc, 6 * sc, col);
  if (t.loud) { tri(c, [[x - 4, by + 8], [x - 3, by + 26], [x + 2, by + 8]], '#1e88e5'); fur(c, x - 3, by + 2, 4, 8, '#ffd23f'); }
  else tri(c, [[x - 3 * sc, by + 8 * sc], [x - 2 * sc, by + 18 * sc], [x + 2 * sc, by + 8 * sc]], tone(col, -0.3));
  if (t.crest) { c.strokeStyle = '#ffd23f'; c.lineWidth = 2; c.beginPath(); c.moveTo(x + 2, by - 15); c.quadraticCurveTo(x + 4, by - 24, x + 9, by - 26); c.stroke(); c.fillStyle = '#ffd23f'; c.beginPath(); c.arc(x + 3, by - 12, 3.5, 0, Math.PI * 2); c.fill(); c.fillStyle = '#ff8a50'; c.beginPath(); c.arc(x + 5, by - 9, 2, 0, Math.PI * 2); c.fill(); }
  tri(c, [[x + 6 * sc, by - 13 * sc], [x + 12 * sc, by - 10 * sc], [x + 7 * sc, by - 7 * sc]], t.loud ? '#3a3a3a' : '#f2b705');
  c.fillStyle = '#fff'; c.beginPath(); c.arc(x + 4 * sc, by - 12 * sc, 2 * sc, 0, Math.PI * 2); c.fill(); c.fillStyle = '#111'; c.beginPath(); c.arc(x + 4.5 * sc, by - 12 * sc, 1 * sc, 0, Math.PI * 2); c.fill();
}
function drawTank(c, x, y, w, h, water, kind) {
  c.fillStyle = 'rgba(0,0,0,.2)'; c.beginPath(); c.ellipse(x + w / 2, y + 6, w / 2 + 6, 5, 0, 0, Math.PI * 2); c.fill();
  const tg = c.createLinearGradient(0, y - h, 0, y);
  if (water) { tg.addColorStop(0, 'rgba(160,215,240,.65)'); tg.addColorStop(1, 'rgba(60,130,175,.85)'); } else { tg.addColorStop(0, 'rgba(240,235,220,.45)'); tg.addColorStop(1, 'rgba(225,200,150,.7)'); }
  c.fillStyle = tg; c.fillRect(x, y - h, w, h);
  c.fillStyle = water ? '#9e8a6a' : '#d9b77a'; c.fillRect(x, y - 7, w, 7);
  if (!water) { c.fillStyle = '#8d7a62'; c.beginPath(); c.ellipse(x + w * 0.75, y - 8, 14, 7, 0, Math.PI, 0); c.fill(); metal(c, x + w * 0.2, y - h - 14, 3, 14, 1, '#555'); const lg = c.createRadialGradient(x + w * 0.2, y - h - 2, 1, x + w * 0.2, y - h + 10, 40); lg.addColorStop(0, 'rgba(255,180,80,.6)'); lg.addColorStop(1, 'rgba(255,180,80,0)'); c.fillStyle = lg; c.fillRect(x - 20, y - h - 10, 80, 60); c.fillStyle = '#333'; c.beginPath(); c.moveTo(x + w * 0.2 - 10, y - h); c.lineTo(x + w * 0.2 + 13, y - h); c.lineTo(x + w * 0.2 + 7, y - h - 8); c.lineTo(x + w * 0.2 - 4, y - h - 8); c.fill(); }
  glass(c, x, y - h, w, h, 'rgba(255,255,255,0)');
  c.strokeStyle = '#333'; c.lineWidth = 1.5; c.strokeRect(x, y - h, w, h); c.fillStyle = '#333'; c.fillRect(x - 2, y - h - 3, w + 4, 3);
}
function drawReptile(c, x, y, p, t) {
  const col = p.color;
  if (t.snake) {
    c.strokeStyle = col; c.lineWidth = 6; c.lineCap = 'round';
    c.beginPath(); c.moveTo(x + 8, y - 10); c.bezierCurveTo(x + 20, y - 22, x + 30, y - 2, x + 42, y - 12); c.bezierCurveTo(x + 50, y - 18, x + 56, y - 10, x + 54, y - 6); c.stroke();
    c.strokeStyle = '#b33a1a'; c.lineWidth = 2; c.setLineDash([3, 4]); c.beginPath(); c.moveTo(x + 8, y - 10); c.bezierCurveTo(x + 20, y - 22, x + 30, y - 2, x + 42, y - 12); c.stroke(); c.setLineDash([]);
    fur(c, x + 56, y - 7, 4.5, 3.5, col); c.fillStyle = '#111'; c.beginPath(); c.arc(x + 58, y - 8, 0.9, 0, Math.PI * 2); c.fill();
    c.strokeStyle = '#e53935'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(x + 60, y - 6); c.lineTo(x + 64, y - 5); c.stroke();
  } else if (t.water) {
    fur(c, x + 28, y - 9, 13, 7, col); c.strokeStyle = tone(col, -0.4); c.lineWidth = 0.8; c.beginPath(); c.moveTo(x + 22, y - 13); c.lineTo(x + 34, y - 13); c.moveTo(x + 28, y - 15); c.lineTo(x + 28, y - 9); c.stroke();
    fur(c, x + 43, y - 8, 4.5, 4, tone(col, 0.25)); c.fillStyle = '#e53935'; c.fillRect(x + 41, y - 9, 3, 1.5); c.fillStyle = '#111'; c.beginPath(); c.arc(x + 45, y - 9, 0.9, 0, Math.PI * 2); c.fill();
  } else {
    const L = p.kind === 'beardie' ? 1.2 : 1;
    c.strokeStyle = tone(col, -0.1); c.lineWidth = 3.5 * L; c.lineCap = 'round'; c.beginPath(); c.moveTo(x + 18, y - 9); c.quadraticCurveTo(x + 6, y - 6, x + 2, y - 10); c.stroke();
    fur(c, x + 28, y - 10, 12 * L, 5 * L, col); fur(c, x + 28 + 14 * L, y - 12, 6 * L, 4.5 * L, col);
    if (p.kind === 'beardie') { c.fillStyle = tone(col, -0.3); for (let k = 0; k < 5; k++) tri(c, [[x + 40 + k * 1.5, y - 8], [x + 39 + k * 1.5, y - 4], [x + 42 + k * 1.5, y - 7]], tone(col, -0.3)); }
    if (t.spots) { c.fillStyle = '#3b2a1e'; for (let k = 0; k < 7; k++) { c.beginPath(); c.arc(x + 20 + k * 3, y - 11 + (k % 2) * 2, 1, 0, Math.PI * 2); c.fill(); } }
    [[22, 1], [34, 1]].forEach(([lx]) => { c.strokeStyle = tone(col, -0.2); c.lineWidth = 2; c.beginPath(); c.moveTo(x + lx, y - 7); c.lineTo(x + lx - 3, y - 2); c.stroke(); });
    c.fillStyle = '#111'; c.beginPath(); c.arc(x + 30 + 16 * L, y - 13, 1, 0, Math.PI * 2); c.fill();
  }
}
function drawFishPet(c, x, y, p, t) {
  const col = p.color;
  if (t.axolotl) {
    fur(c, x, y, 13, 5, col); fur(c, x + 14, y - 1, 6, 5, col);
    ['#e57399', '#e57399', '#e57399'].forEach((g, k) => { c.strokeStyle = g; c.lineWidth = 1.6; c.beginPath(); c.moveTo(x + 12, y - 4 + k * 3); c.lineTo(x + 7, y - 9 + k * 4); c.stroke(); c.beginPath(); c.moveTo(x + 16, y - 4 + k * 3); c.lineTo(x + 21, y - 9 + k * 4); c.stroke(); });
    c.fillStyle = '#111'; c.beginPath(); c.arc(x + 17, y - 2, 0.9, 0, Math.PI * 2); c.fill();
    c.strokeStyle = '#a3466a'; c.lineWidth = 0.8; c.beginPath(); c.arc(x + 15, y, 2.5, 0.2, Math.PI - 0.2); c.stroke();
  } else {
    if (t.fancy) { c.fillStyle = tone(col, 0.1); c.beginPath(); c.moveTo(x + 4, y); c.quadraticCurveTo(x + 18, y - 14, x + 20, y + 2); c.quadraticCurveTo(x + 18, y + 16, x + 4, y); c.fill(); c.beginPath(); c.moveTo(x - 2, y - 3); c.quadraticCurveTo(x, y - 12, x - 6, y - 10); c.fill(); }
    else tri(c, [[x + 4, y], [x + 11, y - 5], [x + 11, y + 5]], col);
    const g = c.createLinearGradient(x - 8, y - 4, x + 4, y + 4); g.addColorStop(0, tone(col, 0.35)); g.addColorStop(1, tone(col, -0.15));
    c.fillStyle = g; c.beginPath(); c.ellipse(x - 2, y, 7, 4.5, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#111'; c.beginPath(); c.arc(x - 6, y - 1, 1, 0, Math.PI * 2); c.fill();
  }
}
// draw one pet (inHome = draw its cage/bowl/stand too)
function drawPetAt(c, p, x, y, s = 1, shopPic = false) {
  const t = PET_TYPES[p.kind], b = t.base, sad = p.happy < 30;
  if (b === 'dog') drawDog(c, x, y, t, p.color, sad, s);
  else if (b === 'cat') drawCat(c, x, y, t, p.color, sad, s);
  else if (b === 'small') { c.save(); c.translate(x - 30 * s, y); c.scale(s, s); drawSmall(c, 0, 0, p, t, !shopPic); c.restore(); }
  else if (b === 'bird') { c.save(); c.translate(x, y); c.scale(s, s); drawBird(c, 0, 0, p, t, true); c.restore(); }
  else if (b === 'reptile') { c.save(); c.translate(x - 32 * s, y); c.scale(s, s); drawTank(c, 0, 4, 64, 34, !!t.water, p.kind); drawReptile(c, 0, 2, p, t); c.restore(); }
  else {
    c.save(); c.translate(x, y); c.scale(s, s);
    if (t.axolotl) { drawTank(c, -32, 6, 64, 36, true); drawFishPet(c, -6, -12, p, t); }
    else {
      const bg = c.createRadialGradient(-6, -26, 2, 0, -20, 24); bg.addColorStop(0, 'rgba(220,245,255,.95)'); bg.addColorStop(1, `rgba(${p.clean < 40 ? '120,150,90' : '90,170,220'},.85)`);
      c.fillStyle = 'rgba(0,0,0,.2)'; c.beginPath(); c.ellipse(0, 2, 22, 5, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = bg; c.beginPath(); c.arc(0, -20, 22, 0, Math.PI * 2); c.fill();
      c.fillStyle = 'rgba(255,255,255,.5)'; c.beginPath(); c.ellipse(0, -38, 16, 4, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#e0c080'; c.beginPath(); c.ellipse(0, -2, 16, 4, 0, Math.PI, 0); c.fill();
      drawFishPet(c, 0, -18, p, t);
    }
    c.restore();
  }
}
function drawPets(c) {
  ensurePetState();
  const count = {};
  S.pets.forEach(p => {
    const b = baseOf(p);
    const n = count[b] = (count[b] || 0) + 1, off = (n - 1) * 60;
    const spot = {
      dog: [470 - (n - 1) * 80, 318], cat: has('couch') ? [450 + off * 0.6, 214] : [110 + off * 0.6, 206], small: [640 + off, 300],
      bird: [240 + off * 0.5, 172], reptile: [650 + off, 300], fish: [770 + off * 0.7, 350],
    }[b];
    if (b === 'reptile' && count.small) spot[0] += 70;
    drawPetAt(c, p, spot[0], spot[1]);
    const ty = { dog: spot[1] + 14, cat: spot[1] + 14, bird: spot[1] - 74, fish: spot[1] + 12, small: spot[1] + 22, reptile: spot[1] + 22 }[b];
    const tx = b === 'small' || b === 'reptile' ? spot[0] + (b === 'small' ? 0 : 0) : spot[0];
    c.font = '800 9px system-ui, sans-serif'; const tw = c.measureText(p.name).width + 10;
    c.fillStyle = 'rgba(255,255,255,.85)'; rrect(c, tx - tw / 2, ty - 6, tw, 13, 6); c.fill(); txt(c, p.name, tx, ty + 0.5, '#5d4037', 9, 800);
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
