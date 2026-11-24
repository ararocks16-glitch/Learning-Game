// ===================== TRIPS: places outside of town =====================

function tripCheck(energy = 20, from = 6, to = 21) {
  if (S.hour < from || S.hour > to) { nope(`That's only possible between ${fmtTime(from)} and ${fmtTime(to)}.`); return false; }
  if (S.needs.energy < energy) { nope('You\'re too tired. Rest first!'); return false; }
  return true;
}
function ensureTripState() {
  if (S.inv.fish === undefined) S.inv.fish = 0;
  if (S.inv.shells === undefined) S.inv.shells = 0;
  if (!S.visited) S.visited = {};
}
const fun = n => { S.needs.fun = clamp(S.needs.fun + n); };

const TRIP_ACTIONS = {
  beach: [
    { id: 'swim', icon: '🏊', name: 'Swim in the Ocean', hint: '2 hrs · free · Swimming skill', fn: () => {
      if (S.weather === 'rainy') return nope('The waves are too big today. Try another day!');
      if (!tripCheck(20, 7, 19)) return;
      pass(2, 'sport'); const g = addSkill('swimming', 2.5); fun(15);
      log(`🌊 You swam in the ocean. The waves were fun! Swimming +${g.toFixed(1)}`, 'good'); } },
    { id: 'surf', icon: '🏄', name: 'Surfing Lesson', hint: '$40 · 2 hrs', fn: () => {
      if (S.weather === 'rainy') return nope('No surfing in a storm!');
      if (!tripCheck(30, 7, 18) || !spend(40, 'Surfing lesson')) return;
      pass(2, 'sport'); addSkill('fit', 2); addSkill('swimming', 1.5); fun(25);
      log(Math.random() < 0.5 ? '🏄 You stood up on the surfboard and rode a wave!' : '🏄 You fell off the surfboard a LOT, but it was so much fun!', 'good'); } },
    { id: 'castle', icon: '🏰', name: 'Build a Sandcastle', hint: '1 hr · free · Art skill', fn: () => {
      if (!tripCheck(10)) return;
      pass(1, 'relax'); addSkill('art', 1.5); fun(12);
      log(S.skills.art > 40 ? '🏰 You built an amazing sandcastle with towers and a moat! People took pictures.' : '🏰 You built a sandcastle. Then a wave knocked it down!'); } },
    { id: 'sun', icon: '😎', name: 'Relax in the Sun', hint: '1 hr', fn: () => {
      if (S.weather === 'rainy') return nope('It\'s raining!');
      pass(1, 'relax'); fun(10);
      if (S.weather === 'hot' && Math.random() < 0.45) { S.needs.health = clamp(S.needs.health - 10); log('🥵 Ouch, you got a sunburn! Next time sit in the shade or wear sunscreen.', 'bad'); }
      else log('😎 You relaxed on the warm sand and listened to the waves.'); } },
    { id: 'shells', icon: '🐚', name: 'Collect Seashells', hint: '1 hr · sell them at Riverside Village', fn: () => {
      if (!tripCheck(10)) return;
      pass(1, 'awake'); const n = 3 + Math.floor(Math.random() * 6); S.inv.shells += n;
      log(`🐚 You found ${n} pretty seashells. (You have ${S.inv.shells}.)`); } },
  ],
  trailhead: [
    { id: 'hike', icon: '🥾', name: 'Hike to the Top', hint: '4 hrs · Fitness skill · amazing view', fn: () => {
      if (!tripCheck(45, 6, 14)) return;
      pass(4, 'sport'); addSkill('fit', 5); fun(18); S.needs.health = clamp(S.needs.health + 4);
      log(S.weather === 'rainy' ? '🥾 You hiked to the top in the rain. Muddy, but you did it!' : '🏔️ You hiked all the way to the snowy top! You could see the whole world from up there.', 'good'); } },
    { id: 'ski', icon: '⛷️', name: 'Go Skiing', hint: '$45 lift ticket · 3 hrs', fn: () => {
      if (!tripCheck(35, 8, 16) || !spend(45, 'Ski lift ticket')) return;
      pass(3, 'sport'); addSkill('fit', 2); fun(25);
      log(Math.random() < 0.3 ? '⛷️ You zoomed down the mountain... and fell in the snow. Then you did it again!' : '⛷️ You skied down the mountain. Whoosh!', 'good'); } },
    { id: 'photo', icon: '📷', name: 'Take Nature Photos', hint: '1 hr · Art skill', fn: () => {
      if (!tripCheck(10)) return;
      pass(1, 'relax'); addSkill('art', 2); fun(6);
      log('📷 You took photos of the mountains, a deer and a waterfall.'); } },
  ],
  lake: [
    { id: 'fish', icon: '🎣', name: 'Go Fishing', hint: () => has('rod') ? '2 hrs · catch fish to sell or eat' : 'Needs a fishing rod (Mall)', fn: () => {
      if (!has('rod')) return nope('You need a fishing rod. Buy one at the 🛍️ Mall.');
      if (!tripCheck(10, 5, 20)) return;
      pass(2, 'relax'); fun(8); addSkill('animal', 0.5);
      const n = Math.max(0, Math.floor(Math.random() * 4 + (S.hour < 9 || S.hour > 17 ? 1 : 0)));
      S.inv.fish += n;
      log(n ? `🎣 You caught ${n} fish! 🐟 (You have ${S.inv.fish}.)` : '🎣 The fish weren\'t biting today. Fishing takes patience!', n ? 'good' : ''); } },
    { id: 'canoe', icon: '🛶', name: 'Rent a Canoe', hint: '$15 · 1 hr', fn: () => {
      if (S.weather === 'rainy') return nope('Canoes are closed in the rain.');
      if (!tripCheck(20, 7, 19) || !spend(15, 'Canoe rental')) return;
      pass(1, 'sport'); addSkill('fit', 1); fun(14);
      log('🛶 You paddled around the lake and saw a turtle!'); } },
    { id: 'sellfish', icon: '🐟', name: 'Sell Fish at the Bait Shop', hint: () => `$6 each · you have ${S.inv.fish}`, fn: () => {
      if (!S.inv.fish) return nope('You don\'t have any fish.');
      const v = S.inv.fish * 6; sideEarn(v, 'Sold fish'); log(`🐟 The bait shop bought your ${S.inv.fish} fish for ${money(v)}.`, 'good'); S.inv.fish = 0; } },
    { id: 'cookfish', icon: '🍳', name: 'Cook Fish on the Grill', hint: 'Uses 1 fish · 30 min', fn: () => {
      if (!S.inv.fish) return nope('Catch a fish first!');
      S.inv.fish--; pass(0.5); ateFood(45); S.needs.health = clamp(S.needs.health + 4); fun(6); addSkill('cook', 1.5);
      log('🍳 You grilled a fish you caught yourself. Delicious and healthy!'); } },
  ],
  campground: [
    { id: 'camp', icon: '⛺', name: 'Camp Overnight', hint: '$25 campsite · sleep until 7 AM', fn: () => {
      if (S.hour < 17 && S.hour > 6) return nope('Set up camp in the evening (after 5 PM).');
      if (!spend(25, 'Campsite')) return;
      const h = S.hour < 7 ? 7 - S.hour : 31 - S.hour;
      pass(h, 'sleep'); fun(30); S.needs.hygiene = clamp(S.needs.hygiene - 20);
      log(S.weather === 'rainy' ? '⛺ You camped out. Your tent leaked a little, but listening to the rain was cozy!' : '⛺ You slept under the stars! You heard owls and crickets all night.', 'good'); } },
    { id: 'marsh', icon: '🔥', name: 'Roast Marshmallows', hint: '$3 · 30 min', fn: () => {
      if (!spend(3, 'Marshmallows')) return;
      pass(0.5, 'relax'); fun(10); S.needs.food = clamp(S.needs.food + 6);
      log(Math.random() < 0.3 ? '🔥 Your marshmallow caught on fire! You blew it out and ate it anyway.' : '🔥 You roasted a perfect golden marshmallow. Yum!'); } },
    { id: 'walk', icon: '🌲', name: 'Forest Nature Walk', hint: '1 hr · free · Animal skill', fn: () => {
      if (!tripCheck(15, 6, 20)) return;
      pass(1, 'relax'); addSkill('animal', 1.5); fun(8);
      const saw = ['a deer', 'a family of rabbits', 'a woodpecker', 'a fox', 'a huge mushroom', 'an owl'][Math.floor(Math.random() * 6)];
      log(`🌲 You walked through the forest and saw ${saw}!`); } },
    { id: 'stories', icon: '📖', name: 'Campfire Stories', hint: '1 hr · with other campers', fn: () => {
      pass(1, 'relax'); addSkill('comm', 1.5); fun(10);
      log('📖 You told spooky stories around the campfire with other campers.'); } },
  ],
  village: [
    { id: 'buyfood', icon: '🥬', name: 'Buy Fresh Farm Food', hint: '$38 · 7 healthy meals', fn: () => {
      if (!tripCheck(0, 7, 18) || !spend(38, 'Farmers market food')) return;
      S.groceries += 7; S.needs.health = clamp(S.needs.health + 3);
      log('🥬 You bought fresh fruits and vegetables from the farmers. 7 meals!'); } },
    { id: 'sellveg', icon: '🥕', name: 'Sell Your Veggies', hint: () => `$5 each (more than the Supermarket!) · you have ${S.inv.veggies}`, fn: () => {
      if (!S.inv.veggies) return nope('You don\'t have any veggies. Grow some in your garden!');
      const v = S.inv.veggies * 5; sideEarn(v, 'Sold veggies at the market'); log(`🥕 You sold ${S.inv.veggies} veggies at the farmers market for ${money(v)}.`, 'good'); S.inv.veggies = 0; } },
    { id: 'sellshell', icon: '🐚', name: 'Sell Seashells', hint: () => `$2 each · you have ${S.inv.shells}`, fn: () => {
      if (!S.inv.shells) return nope('Collect seashells at the beach first.');
      const v = S.inv.shells * 2; sideEarn(v, 'Sold seashells'); log(`🐚 A craft shop bought your ${S.inv.shells} seashells for ${money(v)}.`, 'good'); S.inv.shells = 0; } },
    { id: 'sellfish2', icon: '🐟', name: 'Sell Fish', hint: () => `$8 each · you have ${S.inv.fish}`, fn: () => {
      if (!S.inv.fish) return nope('You don\'t have any fish.');
      const v = S.inv.fish * 8; sideEarn(v, 'Sold fish at the market'); log(`🐟 You sold ${S.inv.fish} fresh fish at the market for ${money(v)}.`, 'good'); S.inv.fish = 0; } },
    { id: 'farm', icon: '🐓', name: 'Help on a Farm', hint: '3 hrs · earn $30 · Animal skill', fn: () => {
      if (!tripCheck(30, 6, 15)) return;
      pass(3, 'work'); sideEarn(30, 'Farm help'); addSkill('animal', 2); addSkill('fit', 1);
      log('🐓 You fed chickens, collected eggs and milked a cow. The farmer paid you $30.', 'good'); } },
  ],
  zoo: [
    { id: 'visit', icon: '🦁', name: 'Visit the Animals', hint: '$18 ticket · 2 hrs', fn: () => {
      if (!tripCheck(15, 9, 17) || !spend(18, 'Wildlife Park ticket')) return;
      pass(2, 'relax'); fun(20); addSkill('animal', 2); addSkill('sci', 1);
      log('🦒 You saw elephants, giraffes, zebras and flamingos!', 'good'); } },
    { id: 'giraffe', icon: '🦒', name: 'Feed the Giraffes', hint: '$5 · 30 min', fn: () => {
      if (!tripCheck(5, 9, 17) || !spend(5, 'Giraffe food')) return;
      pass(0.5, 'relax'); fun(12);
      log('🦒 A giraffe ate lettuce right out of your hand. Its tongue was purple!'); } },
    { id: 'volunteer', icon: '🧤', name: 'Volunteer with Zookeepers', hint: '3 hrs · free · Animal skill', fn: () => {
      if (!tripCheck(30, 8, 14)) return;
      pass(3, 'work'); addSkill('animal', 3); addSkill('comm', 1); fun(8);
      log('🧤 You helped the zookeepers clean pens and feed the animals. Great experience for a zoo job!', 'good'); } },
  ],
};

function viewTrip(place) {
  ensureTripState();
  const acts = TRIP_ACTIONS[place];
  const intro = {
    beach: 'Sand, waves and sunshine! The ocean goes on forever.',
    trailhead: 'The trail up Snowy Peak starts here. There\'s a ski lift too!',
    lake: 'A quiet lake with a dock, canoes and lots of fish.',
    campground: 'Tents, a campfire and tall pine trees all around.',
    village: 'A small village with a farmers market. Farmers pay more for your veggies than the Supermarket does!',
    zoo: 'Elephants, giraffes, zebras and flamingos!',
  }[place];
  return `<p>${intro}</p>
    <div class="grid actions">${acts.map(a => `<button class="action" onclick="tripAct('${place}','${a.id}')"><span class="ic">${a.icon}</span><b>${a.name}</b><small>${typeof a.hint === 'function' ? a.hint() : a.hint}</small></button>`).join('')}</div>`;
}
function tripAct(place, id) {
  ensureTripState();
  const a = TRIP_ACTIONS[place].find(x => x.id === id);
  const before = S.hour + S.day * 24, m = S.money;
  a.fn();
  S.visited[place] = true;
  if (Object.keys(S.visited).length >= 6) unlock('traveler');
  if (S.hour + S.day * 24 !== before || S.money !== m) done(); else render();
}
