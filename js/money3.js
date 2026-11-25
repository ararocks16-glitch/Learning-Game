// ===================== MONEY 3: 32 more ways to get money =====================
// Most of these plug into the "More Ways to Earn Here" card (GIGS2) at the place where you do them.
// Four are crafts you make at home and sell (dog treats, jam, plant cuttings, flower bouquets).

function ensureMoney3State() {
  ensureMoney2State();
  if (!S.m3) S.m3 = { scrap: 0, coins: [], challenge: null, done: {} };
}
const evDay = () => !!eventToday();
const daytime = (a = 8, z = 18) => S.hour >= a && S.hour < z;
const wet = () => ['rainy', 'snowy'].includes(S.weather) || S.storm;

Object.assign(GIGS2, {
  windows: { icon: '🪟', name: 'Wash neighbors\' windows', where: ['home'], note: 'Daytime, not in the rain · 1.5 hrs · $18',
    check: () => !daytime() ? 'Daytime only' : wet() ? 'Too wet today' : '', hours: 1.5,
    go: () => { m2pay(18, 'Window washing'); return '🪟 You sprayed and squeegeed every window until it sparkled. The neighbors can see outside again! $18.'; } },
  weeds: { icon: '🌿', name: 'Pull weeds for neighbors', where: ['home'], note: 'Spring & summer · 1.5 hrs · $15',
    check: () => !['spring', 'summer'].includes(seasonOf()) ? 'Weeds grow in spring & summer' : !daytime() ? 'Daytime only' : '', hours: 1.5,
    go: () => { m2pay(15, 'Pulling weeds'); addSkill('fit', 0.6); return '🌿 You pulled a whole wheelbarrow of weeds — roots and all! $15.'; } },
  fence: { weekly: true, icon: '🎨', name: 'Paint a neighbor\'s fence', where: ['home'], note: 'Once a week · not in winter or rain · 3 hrs · $45',
    check: () => seasonOf() === 'winter' || wet() ? 'Paint needs dry, warm weather' : !daytime(9, 16) ? '9 AM – 4 PM' : '', hours: 3,
    go: () => { m2pay(45, 'Painting a fence'); addSkill('art', 0.8); addSkill('build', 0.6); return '🎨 You painted the whole fence bright white. You got a little paint on your nose! $45.'; } },
  dogbath: { icon: '🛁', name: 'Give dogs a bath', where: ['petshop'], note: 'Needs Animal Care 15 · 1.5 hrs · $25',
    check: () => S.skills.animal < 15 ? 'Needs Animal Care 15' : !daytime(9, 18) ? '9 AM – 6 PM' : '', hours: 1.5,
    go: () => { m2pay(25, 'Dog washing'); addSkill('animal', 1.2); return `🛁 You bathed ${pickR(['a muddy golden retriever', 'two wiggly beagles', 'a fluffy poodle'])}. They shook water ALL over you! $25.`; } },
  garage: { weekly: true, icon: '🧹', name: 'Clean out a garage', where: ['home'], note: 'Once a week · 3 hrs · $40 (and you keep the scrap metal!)',
    check: () => !daytime(9, 17) ? '9 AM – 5 PM' : '', hours: 3,
    go: () => { ensureMoney3State(); const sc = 2 + Math.floor(Math.random() * 4); S.m3.scrap += sc; m2pay(40, 'Garage cleanout'); addSkill('fit', 1); return `🧹 You sorted boxes, swept the floor and organized the tools. $40! The neighbor let you keep ${sc} pieces of old scrap metal — sell them at the ♻️ Recycling Center.`; } },
  bins: { weekly: true, icon: '🗑️', name: 'Roll neighbors\' trash bins to the curb', where: ['home'], note: 'Once a week, Monday 5–9 PM · 15 min · $5',
    check: () => weekday() !== 0 || !daytime(17, 21) ? 'Monday evenings (trash day is Tuesday)' : '', hours: 0.25,
    go: () => { m2pay(5, 'Trash bin service'); return '🗑️ You rolled 4 neighbors\' trash bins to the curb for tomorrow\'s trash day. $5!'; } },
  assemble: { icon: '🪛', name: 'Put together furniture for neighbors', where: ['home'], note: 'Needs a toolbox & Building 20 · 2 hrs · $35',
    check: () => !has('toolbox') ? 'Needs a toolbox' : S.skills.build < 20 ? 'Needs Building & Fixing 20' : !daytime(9, 19) ? 'Daytime only' : '', hours: 2,
    go: () => { m2pay(35, 'Furniture assembly'); addSkill('build', 1.5); return `🪛 You built ${pickR(['a bookshelf', 'a desk', 'a bunk bed', 'a dresser'])} following the picture instructions. Only one screw was left over! 😅 $35.`; } },
  cocoa: { icon: '☕', name: 'Hot cocoa stand', where: ['park'], note: 'Winter only · 2 hrs · supplies $8',
    check: () => seasonOf() !== 'winter' ? 'People want hot cocoa in winter' : !daytime(9, 18) ? 'Daytime only' : S.money < 8 ? 'You need $8 for supplies' : '', hours: 2,
    go: () => { charge(8, 'Hot cocoa supplies'); const n = (S.weather === 'snowy' ? 30 : 18) + Math.floor(Math.random() * 10); const p = m2pay(n * 1.5, 'Hot cocoa sales'); addSkill('sales', 1); return `☕ You sold ${n} cups of hot cocoa with marshmallows for ${money(p)}. Profit after supplies: ${money(p - 8)}!`; } },
  popcorn: { icon: '🍿', name: 'Popcorn stand at the ball game', where: ['sports'], note: 'Weekends · 2 hrs · supplies $6',
    check: () => weekday() < 5 ? 'Games are on weekends' : !daytime(10, 18) ? '10 AM – 6 PM' : S.money < 6 ? 'You need $6 for supplies' : '', hours: 2,
    go: () => { charge(6, 'Popcorn supplies'); const n = 20 + Math.floor(Math.random() * 20); const p = m2pay(n * 2, 'Popcorn sales'); return `🍿 You popped and sold ${n} bags of popcorn at the game for ${money(p)}. Profit: ${money(p - 6)}!`; } },
  facepaint: { icon: '🦋', name: 'Face painting at the town fair', where: ['park'], note: 'Only on town event days · 3 hrs · art skill helps',
    check: () => !evDay() ? 'Only on town event days' : !daytime(10, 18) ? 'Daytime only' : '', hours: 3,
    go: () => { const n = 10 + Math.floor(S.skills.art / 5); const p = m2pay(n * 4, 'Face painting'); addSkill('art', 1.5); return `🦋 You painted ${n} faces — butterflies, tigers and rainbows! ${money(p)}.`; } },
  balloons: { icon: '🎈', name: 'Balloon animals at a birthday party', where: ['home'], note: 'Weekends · 2 hrs · $30',
    check: () => weekday() < 5 ? 'Parties are on weekends' : !daytime(11, 18) ? '11 AM – 6 PM' : '', hours: 2,
    go: () => { m2pay(30 + Math.round(S.skills.art / 10), 'Balloon animals'); addSkill('art', 0.8); return `🎈 You twisted balloons into ${pickR(['dogs, swords and flowers', 'giraffes and hats', 'monkeys on palm trees'])} at a birthday party. POP! Only 3 balloons popped! 😂`; } },
  portraits: { icon: '✏️', name: 'Draw portraits at the park', where: ['park'], note: 'Weekends · 2 hrs · needs Art 25',
    check: () => weekday() < 5 ? 'Best on weekends when the park is busy' : S.skills.art < 25 ? 'Needs Art & Design 25' : !daytime(10, 17) ? '10 AM – 5 PM' : '', hours: 2,
    go: () => { const n = 2 + Math.floor(S.skills.art / 20); const p = m2pay(n * 12, 'Portrait drawing'); addSkill('art', 1.5); return `✏️ You drew ${n} portraits of people at the park. One lady said, "It looks just like me!" ${money(p)}.`; } },
  magic: { icon: '🎩', name: 'Magic show at a birthday party', where: ['home'], note: 'Weekends · needs Talking to People 25 · 2 hrs · $40',
    check: () => weekday() < 5 ? 'Parties are on weekends' : S.skills.comm < 25 ? 'Needs Talking to People 25' : !daytime(11, 18) ? '11 AM – 6 PM' : '', hours: 2,
    go: () => { m2pay(40, 'Magic show'); addSkill('comm', 1.2); return '🎩 You did card tricks and made a coin disappear from a kid\'s ear. The birthday kid said it was the BEST party ever! $40. (Magic tricks are just clever practice — no real magic!)'; } },
  dj: { weekly: true, icon: '🎧', name: 'DJ the school dance', where: ['school'], note: 'Once a week, Fridays 6–9 PM · needs Music 25 · 3 hrs · $60',
    check: () => weekday() !== 4 || !daytime(18, 21) ? 'Fridays 6 – 9 PM' : S.skills.music < 25 ? 'Needs Music 25' : '', hours: 3,
    go: () => { m2pay(60, 'DJ at the school dance'); addSkill('music', 1.5); return '🎧 You played music at the school dance. Everyone did the chicken dance! $60.'; } },
  audiobook: { weekly: true, icon: '🎙️', name: 'Record a kids\' audiobook', where: ['library'], note: 'Once a week · needs Talking to People 30 · 3 hrs · $50',
    check: () => S.skills.comm < 30 ? 'Needs Talking to People 30' : !daytime(9, 18) ? '9 AM – 6 PM' : '', hours: 3,
    go: () => { m2pay(50, 'Audiobook recording'); addSkill('comm', 1.2); addSkill('write', 0.6); return '🎙️ You read a whole picture book into a microphone with different voices for every animal. Kids will listen to it at bedtime! $50.'; } },
  giftwrap: { icon: '🎁', name: 'Gift-wrapping booth at the Mall', where: ['mall'], note: 'December 1 – 24 · 3 hrs · tips',
    check: () => !(dateOf().m === 11 && dateOf().d <= 24) ? 'Only in December before Christmas' : !daytime(10, 20) ? '10 AM – 8 PM' : '', hours: 3,
    go: () => { const n = 15 + Math.floor(Math.random() * 15); const p = m2pay(n * 2, 'Gift-wrapping tips'); addSkill('art', 0.8); return `🎁 You wrapped ${n} presents with shiny paper and bows. Shoppers gave you ${money(p)} in tips!`; } },
  mystery: { weekly: true, icon: '🕵️', name: 'Be a mystery shopper', where: ['mall'], note: 'Once a week · 1.5 hrs · $20',
    check: () => !daytime(10, 19) ? '10 AM – 7 PM' : '', hours: 1.5,
    go: () => { m2pay(20, 'Mystery shopper'); addSkill('write', 0.8); return `🕵️ You secretly checked if the ${pickR(['shoe store', 'toy store', 'food court'])} was clean and friendly, then wrote a report. Shh, it's a secret! $20.`; } },
  taster: { weekly: true, icon: '🧁', name: 'Taste-test new foods', where: ['market'], note: 'Once a week · 30 min · $15',
    check: () => !daytime(9, 18) ? '9 AM – 6 PM' : '', hours: 0.5,
    go: () => { m2pay(15, 'Taste testing'); ateFood(10); return `🧁 You tasted 3 new ${pickR(['cereals', 'yogurts', 'granola bars', 'juices'])} and said which one was best. $15!`; } },
  extra: { weekly: true, icon: '🎬', name: 'Be an extra in a movie', where: ['theater'], note: 'Once a week · 6 hrs · $90',
    check: () => !daytime(8, 12) ? 'Filming starts in the morning (8 AM – noon)' : '', hours: 6,
    go: () => { m2pay(90, 'Movie extra'); fun2(15); return `🎬 You were an "extra" in a movie — you walked across the background ${pickR(['carrying groceries', 'walking a dog', 'eating an ice cream'])} 20 times! Look for yourself in the movie! $90.`; } },
  article: { weekly: true, icon: '📰', name: 'Write an article for the Maple Times', where: ['library'], note: 'Once a week · needs Writing 25 · 2 hrs · $35',
    check: () => S.skills.write < 25 ? 'Needs Writing 25' : !daytime(9, 19) ? '9 AM – 7 PM' : '', hours: 2,
    go: () => { m2pay(35, 'Newspaper article'); addSkill('write', 1.5); return `📰 You wrote an article about ${pickR(['the new bike path', 'the animal shelter', 'the town fair', 'a kid who started a garden'])}. It will be in tomorrow's paper! $35.`; } },
  newsphoto: { weekly: true, icon: '📸', name: 'Sell a photo to the newspaper', where: ['home'], note: 'Once a week · needs a camera and 3 photos in your album',
    check: () => !has('camera') ? 'Needs a camera' : !S.hob || S.hob.photos.length < 3 ? 'Take at least 3 photos first' : '', hours: 0.5,
    go: () => { const ph = pickR(S.hob.photos); const p = m2pay(25 + Math.floor(Math.random() * 26), 'Photo sold to newspaper'); return `📸 The Maple Times bought your photo of ${ph.subject} for the front page! ${money(p)}.`; } },
  parking: { icon: '🚗', name: 'Rent your driveway for parking', where: ['home'], note: 'Only on town event days · needs a house with a driveway · $20',
    check: () => !evDay() ? 'Only on busy town event days' : !['small', 'family', 'mansion', 'custom'].includes(S.home) ? 'You need a house with a driveway' : '', hours: 0.25,
    go: () => { m2pay(20, 'Driveway parking'); return '🚗 Lots of people came for the town event, so you let 2 cars park in your driveway. $20!'; } },
  seniortech: { icon: '👵', name: 'Teach seniors to use computers', where: ['library'], note: 'Needs Computers 25 · 2 hrs · $30',
    check: () => S.skills.comp < 25 ? 'Needs Computers 25' : !daytime(9, 17) ? '9 AM – 5 PM' : '', hours: 2,
    go: () => { m2pay(30, 'Computer class for seniors'); addSkill('comp', 0.8); addSkill('comm', 0.8); return '👵 You taught Grandma\'s friends how to video-call their grandkids. They were SO happy! $30.'; } },
  scooper: { icon: '💩', name: 'Pooper scooper service', where: ['home'], note: 'Clean up after neighbors\' dogs · 1 hr · $12',
    check: () => !daytime(8, 19) ? 'Daytime only' : '', hours: 1,
    go: () => { m2pay(12, 'Pooper scooper'); return '💩 You scooped up all the dog poop in 3 yards. Gross... but someone has to do it! Wash your hands! $12.'; } },
  carnival: { weekly: true, icon: '🎪', name: 'Run a neighborhood carnival', where: ['park'], note: 'Once a week, Saturdays · 4 hrs · supplies $20',
    check: () => weekday() !== 5 ? 'Saturdays only' : !daytime(10, 16) ? '10 AM – 4 PM' : S.money < 20 ? 'You need $20 for prizes' : '', hours: 4,
    go: () => { charge(20, 'Carnival prizes'); const kids = 15 + Math.floor((S.skills.lead + S.skills.comm) / 6); const p = m2pay(kids * 3, 'Carnival tickets'); addSkill('lead', 1.5); fun2(15); return `🎪 You set up a ring toss, a bean bag throw and a duck pond. ${kids} kids came! Tickets: ${money(p)}, profit: ${money(p - 20)}.`; } },
  scrap: { icon: '🔩', name: 'Sell scrap metal', where: ['recycling'], note: '$3 each · get scrap from cleaning out garages',
    check: () => { ensureMoney3State(); return !S.m3.scrap ? 'You don\'t have any scrap metal' : ''; }, hours: 0.25,
    go: () => { const n = S.m3.scrap; S.m3.scrap = 0; const p = m2pay(n * 3, 'Scrap metal'); return `🔩 You sold ${n} pieces of scrap metal for ${money(p)}. It will be melted down and made into new things! ♻️`; } },
  coinjar: { weekly: true, icon: '🪙', name: 'Search your coin jar for rare coins', where: ['home'], note: 'Once a week · 30 min',
    check: () => '', hours: 0.5,
    go: () => { const r = Math.random(); if (r < 0.15) { const c = pickR([['a 1943 steel penny', 60], ['a buffalo nickel', 15], ['a silver dime', 8], ['a coin from Canada', 2]]); m2pay(c[1], 'Rare coin'); return `🪙 WOW! You found ${c[0]} in your coin jar! A coin collector at the bank paid you ${money(c[1])}.`; } return '🪙 You looked at every coin with a magnifying glass. No rare ones this time — maybe next week!'; } },
});

// ---------- the savings challenge at the bank ----------
function savingsChallengeCard() {
  ensureMoney3State();
  const C = S.m3.challenge;
  return `<div class="card"><h3>🏦 Savings Challenge</h3><p>Keep at least <b>$500</b> in your savings account for 4 weeks in a row, and the bank gives you a <b>$15 bonus</b>!</p>
    ${C ? `<p>Day ${S.day - C.start} of 28 ${S.savings >= 500 ? '✅ keep going!' : '⚠️ your savings went below $500!'}</p>` : `<button class="btn sm primary" onclick="startChallenge()">🏁 Start the challenge</button>`}</div>`;
}
function startChallenge() { if (S.savings < 500) return nope('Put at least $500 in your savings account first.'); S.m3.challenge = { start: S.day }; log('🏁 You started the 4-week savings challenge!'); done(); }
function challengeNewDay() {
  const C = S.m3.challenge; if (!C) return;
  if (S.savings < 500) { S.m3.challenge = null; log('🏦 Your savings went below $500, so the savings challenge ended. You can try again any time!'); return; }
  if (S.day - C.start >= 28) { S.m3.challenge = null; m2pay(15, 'Savings challenge bonus'); log('🎉 You kept $500 saved for 4 weeks! The bank gave you a $15 bonus. Saving pays!', 'good'); }
}

// ---------- 4 new things to make at home and sell ----------
Object.assign(CRAFTS, {
  dogtreats: { icon: '🦴', name: 'Homemade dog treats', kit: 10, makes: 6, hours: 0.75, skill: 'cook', price: 3, sell: ['petshop', 'park'], kitName: 'oats, peanut butter & bone cutters' },
  jam:       { icon: '🍓', name: 'Jars of jam', kit: 14, makes: 4, hours: 1, skill: 'cook', price: 7, sell: ['village', 'market'], kitName: 'berries, sugar & glass jars' },
  cuttings:  { icon: '🪴', name: 'Potted plants', kit: 12, makes: 4, hours: 0.5, skill: 'sci', price: 8, sell: ['village', 'park'], kitName: 'little pots, soil & plant cuttings' },
  bouquets:  { icon: '💐', name: 'Flower bouquets', kit: 15, makes: 3, hours: 0.5, skill: 'art', price: 12, sell: ['market', 'park'], kitName: 'fresh flowers, ribbon & paper' },
});

function money3NewDay() { ensureMoney3State(); challengeNewDay(); }

const MONEY_IDEAS_3 = [
  ['🪟', 'Wash neighbors\' windows', 'Home'], ['🌿', 'Pull weeds', 'Home, spring & summer'], ['🎨', 'Paint a fence', 'Home, once a week'], ['🛁', 'Give dogs a bath', 'Pet Shop'],
  ['🧹', 'Clean out a garage', 'Home, once a week'], ['🗑️', 'Roll trash bins to the curb', 'Home, Monday evenings'], ['🪛', 'Put together furniture', 'Home (toolbox)'], ['☕', 'Hot cocoa stand', 'Park, winter'],
  ['🍿', 'Popcorn stand', 'Sports Park, weekends'], ['🦋', 'Face painting', 'Park, town event days'], ['🎈', 'Balloon animals', 'Home, weekends'], ['✏️', 'Draw portraits', 'Park, weekends'],
  ['🎩', 'Magic show', 'Home, weekends'], ['🎧', 'DJ the school dance', 'College, Fridays'], ['🎙️', 'Record an audiobook', 'Library'], ['🎁', 'Gift-wrapping booth', 'Mall, December'],
  ['🕵️', 'Mystery shopper', 'Mall'], ['🧁', 'Taste-test new foods', 'Supermarket'], ['🎬', 'Movie extra', 'Theater'], ['📰', 'Write a newspaper article', 'Library'],
  ['📸', 'Sell photos to the newspaper', 'Home (camera)'], ['🚗', 'Rent your driveway', 'Home, event days'], ['👵', 'Teach seniors computers', 'Library'], ['💩', 'Pooper scooper', 'Home'],
  ['🎪', 'Neighborhood carnival', 'Park, Saturdays'], ['🔩', 'Sell scrap metal', 'Recycling Center'], ['🪙', 'Rare coins in your coin jar', 'Home'], ['🏦', 'Savings challenge bonus', 'Bank'],
  ['🦴', 'Dog treats', 'Make at Home, sell at Pet Shop/Park'], ['🍓', 'Homemade jam', 'Make at Home, sell at Village/Supermarket'], ['🪴', 'Potted plants', 'Make at Home, sell at Village/Park'], ['💐', 'Flower bouquets', 'Make at Home, sell at Supermarket/Park'],
];
function moneyIdeas3Card() {
  return `<details class="card"><summary>💡 32 Newest Money Ideas</summary><ol class="ideas">${MONEY_IDEAS_3.map(i => `<li>${i[0]} <b>${i[1]}</b> <span class="muted small">— ${i[2]}</span></li>`).join('')}</ol></details>`;
}

// ---------- brush your teeth button ----------
function verbBrush() {
  const near = typeof nearSpots === 'function' ? nearSpots().map(s => s.id) : [];
  if (near.includes('sink') && S.tap && S.tap.what === 'sink') { sinkDo('teeth'); return; }
  brushTeeth(); done();
}
