// ===================== OTHER TOWNS =====================
// Four more towns out in the world, each with its own shops, a place to stay and things to do.

// ---------- roads to the towns ----------
function splitEdgeAt(x, y) {
  const ni = addNode(x, y);
  for (let i = 0; i < EDGES.length; i++) {
    const [a, b] = EDGES[i], A = NODES[a], B2 = NODES[b];
    if (a === ni || b === ni) continue;
    const onH = A[1] === y && B2[1] === y && x > Math.min(A[0], B2[0]) && x < Math.max(A[0], B2[0]);
    const onV = A[0] === x && B2[0] === x && y > Math.min(A[1], B2[1]) && y < Math.max(A[1], B2[1]);
    if (onH || onV) { EDGES[i] = [a, ni]; EDGES.push([ni, b]); break; }
  }
  return ni;
}
// Seaside Bay (south-east, on the ocean)
road([4300, 1500], [4300, 2900]); road([3450, 2900], [4300, 2900]); road([4300, 2900], [5050, 2900]);
// Pinecrest (west, in the pine forest)
road([-3000, 400], [-3000, 1500]); road([-3350, 1500], [-3000, 1500]); road([-3000, 1500], [-1650, 1500]);
// Snowpeak (north-west, at the foot of the mountains)
splitEdgeAt(-1800, -1000);
road([-1800, -1000], [-1800, -1850]); road([-2450, -1850], [-1800, -1850]); road([-1800, -1850], [-1150, -1850]);
// Riverside Village gets a longer main street
road([3600, -1600], [4300, -1600]);

// ---------- the towns ----------
TOWN_NAMES.push(
  { name: '🌊 Seaside Bay', x: 4250, y: 2780, box: [3450, 2620, 1650, 520] },
  { name: '🌲 Pinecrest', x: -2500, y: 1420, box: [-3400, 1250, 1800, 520] },
  { name: '❄️ Snowpeak', x: -1800, y: -1980, box: [-2500, -2120, 1400, 480] },
  { name: '🌾 Riverside Village', x: 3600, y: -1700, box: [2900, -1900, 1450, 1150] },
);
const T = (town, name, icon, r, door, blurb) => ({ kind: 'place', far: true, shop: true, town, name, icon, r, door, blurb });
Object.assign(PLACES, {
  // Seaside Bay
  icecream:     T('seaside', 'Scoops Ice Cream', '🍦', [3540, 2742, 150, 136], [3615, 2884], 'Ice cream cones and giant sundaes.'),
  fishmarket:   T('seaside', 'Bay Fish Market', '🐟', [3720, 2742, 170, 136], [3805, 2884], 'Sell your fish for the best price, or buy fresh seafood.'),
  seahotel:     T('seaside', 'Seaside Hotel', '🏨', [4440, 2700, 200, 178], [4540, 2884], 'Stay the night with a view of the ocean.'),
  lighthouse:   T('seaside', 'Old Lighthouse', '🗼', [4700, 2700, 120, 178], [4760, 2884], 'Climb to the top and learn how lighthouses keep ships safe.'),
  harbor:       T('seaside', 'Harbor Boat Tours', '⛵', [4870, 2924, 180, 110], [4960, 2916], 'Boat tours and deep-sea fishing trips.'),
  // Pinecrest
  generalstore: T('pinecrest', 'Pinecrest General Store', '🏪', [-2920, 1322, 180, 156], [-2830, 1484], 'Groceries and supplies, way out in the woods.'),
  pancake:      T('pinecrest', 'Pancake House', '🥞', [-2700, 1322, 160, 156], [-2620, 1484], 'Famous for giant pancakes. Breakfast only!'),
  lumbermill:   T('pinecrest', 'Lumber Mill', '🪵', [-2380, 1524, 260, 160], [-2250, 1516], 'Earn money chopping wood.'),
  pineinn:      T('pinecrest', 'Pinecrest Inn', '🛏️', [-2000, 1322, 190, 156], [-1905, 1484], 'A cozy log inn to spend the night.'),
  // Snowpeak
  skilodge:     T('snowpeak', 'Snowpeak Ski Lodge', '🏔️', [-2380, -2030, 230, 164], [-2265, -1866], 'Warm up by the fireplace or stay the night.'),
  cocoa:        T('snowpeak', 'Cozy Cocoa Café', '☕', [-2100, -2030, 160, 164], [-2020, -1866], 'Hot cocoa with marshmallows!'),
  gearshop:     T('snowpeak', 'Alpine Gear Shop', '🎿', [-1720, -2030, 170, 164], [-1635, -1866], 'Hiking boots and sled rentals.'),
  hotsprings:   T('snowpeak', 'Hot Springs Spa', '♨️', [-1560, -1826, 240, 150], [-1440, -1834], 'Soak in warm water from deep underground.'),
  // Riverside Village
  bakery:       T('riverside', 'Riverside Bakery', '🥐', [3060, -1790, 160, 162], [3140, -1622], 'Fresh bread, cakes and baking classes.'),
  pottery:      T('riverside', 'Pottery Studio', '🏺', [3760, -1790, 170, 162], [3845, -1622], 'Make pots on a pottery wheel and sell them.'),
  riverinn:     T('riverside', 'Riverside Inn', '🛏️', [3700, -1574, 190, 150], [3795, -1580], 'A friendly inn by the river.'),
});
PLACES.village.town = 'riverside';

Object.assign(ENTRANCE, {
  icecream:     { facade: 'store', wall: '#fce4ec', door: 'swing', doorCol: '#ec407a', signBg: '#ec407a', signFg: '#fff', hours: [10, 22], inside: '#fff5f8', awning: '#ec407a', keeper: true },
  fishmarket:   { facade: 'store', wall: '#e0f2f1', door: 'swing', doorCol: '#00897b', signBg: '#00695c', signFg: '#fff', hours: [6, 16], inside: '#eef8f6', awning: '#00897b', keeper: true },
  seahotel:     { facade: 'siding', wall: '#e3f2fd', door: 'double', doorCol: '#1565c0', signBg: '#0d47a1', signFg: '#fff', hours: [0, 24], inside: '#f3efe6', keeper: true },
  lighthouse:   { facade: 'stone', wall: '#f5f5f5', door: 'swing', doorCol: '#c62828', signBg: '#c62828', signFg: '#fff', hours: [9, 17], inside: '#ece6da' },
  harbor:       { facade: 'wood', wall: '#8d6e63', door: 'swing', doorCol: '#0277bd', signBg: '#0277bd', signFg: '#fff', hours: [8, 18], inside: '#e9e0d0', keeper: true },
  generalstore: { facade: 'wood', wall: '#a1887f', door: 'swing', doorCol: '#4e342e', signBg: '#4e342e', signFg: '#ffe0b2', hours: [7, 21], inside: '#f1e6d2', awning: '#6d4c41', keeper: true },
  pancake:      { facade: 'wood', wall: '#d7a86e', door: 'swing', doorCol: '#8d4e1f', signBg: '#f9a825', signFg: '#4e342e', hours: [6, 14], inside: '#fff3e0', awning: '#f9a825', keeper: true },
  lumbermill:   { facade: 'wood', wall: '#8d6e63', door: 'double', doorCol: '#5d4037', signBg: '#3e2723', signFg: '#ffcc80', hours: [6, 17], inside: '#e0d0b8', keeper: true },
  pineinn:      { facade: 'wood', wall: '#795548', door: 'double', doorCol: '#3e2723', signBg: '#2e5d34', signFg: '#fff', hours: [0, 24], inside: '#f1e3cc', keeper: true },
  skilodge:     { facade: 'wood', wall: '#6d4c41', door: 'double', doorCol: '#3e2723', signBg: '#1565c0', signFg: '#fff', hours: [0, 24], inside: '#f3e2c7', keeper: true },
  cocoa:        { facade: 'wood', wall: '#a1887f', door: 'swing', doorCol: '#6d2a1e', signBg: '#c62828', signFg: '#fff', hours: [7, 21], inside: '#fbeee0', awning: '#c62828', keeper: true },
  gearshop:     { facade: 'store', wall: '#e3f2fd', door: 'slide', doorCol: '#bfe3f5', signBg: '#1565c0', signFg: '#fff', hours: [9, 19], inside: '#f0f6fb', awning: '#1565c0', keeper: true },
  hotsprings:   { facade: 'stone', wall: '#cfd8dc', door: 'swing', doorCol: '#5d4037', signBg: '#00838f', signFg: '#fff', hours: [8, 22], inside: '#e6f0f1', keeper: true },
  bakery:       { facade: 'store', wall: '#fff3e0', door: 'swing', doorCol: '#8d6e63', signBg: '#8d6e63', signFg: '#fff', hours: [6, 18], inside: '#fff8ee', awning: '#8d6e63', keeper: true },
  pottery:      { facade: 'brick', wall: '#c47a5a', door: 'swing', doorCol: '#4e342e', signBg: '#4e342e', signFg: '#ffe0b2', hours: [9, 19], inside: '#efe2d2' },
  riverinn:     { facade: 'siding', wall: '#f1f8e9', door: 'double', doorCol: '#33691e', signBg: '#33691e', signFg: '#fff', hours: [0, 24], inside: '#f3ecdc', keeper: true },
});

// ---------- houses on the town streets ----------
(function townHouses() {
  const r = seeded(777);
  const bad = box => Object.values(PLACES).some(p => overlap(box, p.r, 10)) || VHOUSES.some(h => overlap(box, [h.x, h.y, h.w, h.h], 6)) || nearRoad(box[0] + box[2] / 2, box[1] + box[3] / 2, 40) ||
    [B.OCEAN, B.LAKE, B.SAND].includes(biome(box[0] + box[2] / 2, box[1] + box[3])) || Math.abs(box[0] + box[2] / 2 - riverX(box[1] + box[3] / 2)) < 90;
  // remove old village houses that are in the way of new buildings
  for (let i = VHOUSES.length - 1; i >= 0; i--) { const h = VHOUSES[i]; if (Object.values(PLACES).some(p => p.shop && overlap([h.x, h.y, h.w, h.h], p.r, 10))) VHOUSES.splice(i, 1); }
  const add = (x, y) => {
    const box = [x, y, 84, 66];
    if (bad(box)) return;
    VHOUSES.push({ x, y, w: 84, h: 66, wall: ['#f7d794', '#a7d8f0', '#f8c6c6', '#d6f0b5', '#e4d4f7', '#fde2b8', '#f2f2f2', '#c8e6c9'][Math.floor(r() * 8)], roof: ['#c0392b', '#34495e', '#8e44ad', '#2c7a4b', '#7f5539', '#b03a2e'][Math.floor(r() * 6)], seed: r() });
  };
  const street = (x0, x1, y) => { for (let x = x0; x < x1; x += 100) { add(x, y - 22 - 66 - 6); add(x, y + 26); } };
  street(3460, 5050, 2900);
  street(-3340, -1660, 1500);
  street(-2440, -1160, -1850);
  street(3600, 4300, -1600);
  for (let y = 1600; y < 2850; y += 110) { add(4300 - 22 - 84 - 6, y); add(4300 + 26, y); }
  for (let y = 520; y < 1450; y += 120) { add(-3000 - 22 - 84 - 6, y); add(-3000 + 26, y); }
})();

// ---------- how the town buildings look on the map ----------
function drawShop(c, id, lod) {
  const p = PLACES[id], st = ENTRANCE[id];
  const [x, y, w, h] = p.r;
  if (id === 'lighthouse') {
    shadow(c, x + 35, y + 30, 50, 140);
    for (let k = 0; k < 6; k++) fillR(c, x + 38 + k * 1.5, y + 40 + k * 22, 44 - k * 3, 22, k % 2 ? '#fff' : '#d32f2f');
    fillR(c, x + 34, y + 22, 52, 20, '#37474f', 3); fillR(c, x + 40, y + 24, 40, 14, '#ffe082');
    tri(c, [[x + 30, y + 24], [x + 60, y], [x + 90, y + 24]], '#b71c1c');
    fillR(c, x + 50, y + 146, 20, 26, '#c62828', 3);
    signBoard(c, x + 10, y + 150, 34, 12, '#fff', '#c62828', 'MUSEUM', 6);
    return;
  }
  if (id === 'harbor') {
    fillR(c, x + 20, y + 30, 140, 120, '#8d6e63');
    for (let k = 0; k < 12; k++) fillR(c, x + 20, y + 30 + k * 10, 140, 1, 'rgba(0,0,0,.25)');
    // the docks go all the way out into the ocean
    const sea = coastY(x + 90) + 70 - y;
    [[x + 40], [x + 120]].forEach(([dx]) => { fillR(c, dx, y + 150, 16, sea - 150, '#795548'); for (let k = y + 150; k < y + sea; k += 9) fillR(c, dx, k, 16, 1, 'rgba(0,0,0,.25)'); });
    [[x + 80, y + sea - 40, '#fff'], [x + 165, y + sea - 10, '#ffd23f']].forEach(([bx, by, col]) => { c.fillStyle = col; c.beginPath(); c.moveTo(bx - 20, by - 4); c.lineTo(bx + 20, by - 4); c.lineTo(bx + 13, by + 6); c.lineTo(bx - 13, by + 6); c.fill(); fillR(c, bx - 1, by - 36, 2, 32, '#5d4037'); tri(c, [[bx + 1, by - 36], [bx + 1, by - 8], [bx + 18, by - 8]], '#fafafa'); });
    fillR(c, x + 50, y + 4, 80, 46, '#eceff1', 3); fillR(c, x + 46, y, 88, 8, '#0277bd');
    signBoard(c, x + 56, y + 14, 68, 12, '#0277bd', '#fff', 'BOAT TOURS', 7);
    fillR(c, x + 82, y + 30, 16, 20, '#0277bd', 2);
    return;
  }
  if (id === 'hotsprings') {
    ell(c, x + 70, y + 70, 60, 34, '#9e9e9e'); ell(c, x + 70, y + 70, 52, 28, '#4fc3f7');
    ell(c, x + 175, y + 90, 46, 26, '#9e9e9e'); ell(c, x + 175, y + 90, 38, 20, '#81d4fa');
    if (lod === 0) { c.fillStyle = 'rgba(255,255,255,.5)'; [[60, 50], [80, 44], [170, 70], [185, 66]].forEach(([sx, sy]) => { c.beginPath(); c.arc(x + sx, y + sy, 8, 0, Math.PI * 2); c.fill(); }); }
    fillR(c, x + 100, y + 110, 90, 38, '#cfd8dc', 3); tri(c, [[x + 94, y + 112], [x + 145, y + 92], [x + 196, y + 112]], '#00838f');
    signBoard(c, x + 108, y + 116, 74, 11, '#00838f', '#fff', 'HOT SPRINGS', 6);
    fillR(c, x + 136, y + 128, 16, 20, '#5d4037', 2);
    return;
  }
  const bx = x + 8, bw = w - 16, by = y + h * 0.3, bh = h * 0.6;
  if (id === 'lumbermill') {
    for (let k = 0; k < 4; k++) for (let j = 0; j < 3 - (k % 2); j++) { circ(c, x + 16 + j * 14 + (k % 2) * 7, y + h - 14 - k * 10, 6, '#a1887f'); circ(c, x + 16 + j * 14 + (k % 2) * 7, y + h - 14 - k * 10, 3, '#d7ccc8'); }
  }
  shadow(c, bx, by, bw, bh);
  fillR(c, bx, by, bw, bh, st.wall);
  if (st.facade === 'brick') for (let k = 0; k < bh / 5; k++) { c.fillStyle = 'rgba(0,0,0,.08)'; c.fillRect(bx, by + k * 5, bw, 1); }
  if (st.facade === 'wood') for (let k = 0; k < bh / 7; k++) { c.fillStyle = 'rgba(0,0,0,.14)'; c.fillRect(bx, by + k * 7 + 5, bw, 2); }
  if (st.facade === 'siding') for (let k = 0; k < bh / 6; k++) { c.fillStyle = 'rgba(0,0,0,.07)'; c.fillRect(bx, by + k * 6 + 4, bw, 1.5); }
  if (st.facade === 'wood' || st.facade === 'siding') {
    tri(c, [[bx - 8, by + 2], [bx + bw / 2, by - h * 0.26], [bx + bw + 8, by + 2]], st.facade === 'wood' ? '#4e342e' : '#5b4636');
    if (id === 'skilodge' || id === 'cocoa' || id === 'gearshop') tri(c, [[bx + bw * 0.15, by - h * 0.05], [bx + bw / 2, by - h * 0.24], [bx + bw * 0.85, by - h * 0.05]], 'rgba(255,255,255,.85)');
    fillR(c, bx + bw * 0.72, by - h * 0.2, 10, h * 0.16, '#6d4c41');
  } else {
    fillR(c, bx - 3, by - 6, bw + 6, 8, tone(st.wall, -0.3));
  }
  const winY = by + bh * 0.42, winH = bh * 0.3;
  winGrid(c, bx, winY, bw * 0.4, winH + 8, 2, 1, bw * 0.13, winH);
  winGrid(c, bx + bw * 0.6, winY, bw * 0.4, winH + 8, 2, 1, bw * 0.13, winH);
  if (st.awning) for (let k = 0; k < Math.floor(bw / 10); k++) fillR(c, bx + k * 10, winY - 8, 10, 7, k % 2 ? '#fff' : st.awning);
  const dw = st.door === 'swing' ? 16 : 26;
  fillR(c, bx + bw / 2 - dw / 2, by + bh - 26, dw, 26, st.door === 'slide' ? '#bfe3f5' : st.doorCol, 2);
  signBoard(c, bx + 6, by + 4, bw - 12, 13, st.signBg, st.signFg, p.name.toUpperCase().slice(0, 22), 7);
  if (id === 'icecream') { circ(c, bx + bw + 6, by + 10, 8, '#f8bbd0'); tri(c, [[bx + bw - 1, by + 14], [bx + bw + 13, by + 14], [bx + bw + 6, by + 32]], '#d7a86e'); }
  if (id === 'cocoa' || id === 'pancake' || id === 'icecream' || id === 'bakery') {
    [[bx - 14, by + bh + 6], [bx + bw + 4, by + bh + 6]].forEach(([tx, ty]) => { circ(c, tx + 6, ty, 6, '#fff'); fillR(c, tx + 5, ty, 2, 8, '#777'); circ(c, tx - 2, ty + 4, 2.5, '#e53935'); circ(c, tx + 14, ty + 4, 2.5, '#e53935'); });
  }
}

// ---------- things to do in the towns ----------
const gain = (k, n) => { S.needs[k] = clamp(S.needs[k] + n); };
function stayOvernight(price, name) {
  if (S.hour >= 7 && S.hour < 17) return nope('Check-in is after 5 PM.');
  if (!spend(price, `Night at ${name}`)) return;
  const h = S.hour < 7 ? 7 - S.hour : 31 - S.hour;
  pass(h, 'sleep');
  gain('energy', 15); S.needs.hygiene = 100; gain('fun', 8);
  log(`🛏️ You stayed the night at the ${name}. Comfy bed, hot shower, free breakfast!`, 'good');
  gain('food', 30);
}
const TOWN_ACTIONS = {
  icecream: [
    ['🍦', 'Ice Cream Cone', '$4', () => { if (!spend(4, 'Ice cream cone')) return; pass(0.25, 'relax'); gain('fun', 12); gain('food', 8); log('🍦 You ate a double scoop of chocolate and strawberry. Brain freeze!'); }],
    ['🍨', 'Giant Sundae', '$9', () => { if (!spend(9, 'Ice cream sundae')) return; pass(0.5, 'relax'); gain('fun', 20); gain('food', 18); gain('health', -2); log('🍨 You ate a giant sundae with sprinkles, fudge and a cherry on top!'); }],
  ],
  fishmarket: [
    ['🐟', 'Sell Your Fish', () => `$9 each · you have ${S.inv.fish || 0}`, () => { if (!S.inv.fish) return nope('You have no fish. Go fishing at Crystal Lake or on a boat!'); const v = S.inv.fish * 9; sideEarn(v, 'Sold fish at the fish market'); log(`🐟 The fish market bought your ${S.inv.fish} fish for ${money(v)}.`, 'good'); S.inv.fish = 0; }],
    ['🦐', 'Buy Fresh Seafood', '$36 · 7 healthy meals', () => { if (!spend(36, 'Seafood')) return; S.groceries += 7; gain('health', 3); log('🦐 You bought fresh fish and shrimp. 7 meals!'); }],
  ],
  seahotel: [
    ['🛏️', 'Stay the Night', '$110 · ocean view · after 5 PM', () => stayOvernight(110, 'Seaside Hotel')],
    ['🍳', 'Hotel Breakfast', '$16', () => { if (S.hour > 11) return nope('Breakfast is served until 11 AM.'); if (!spend(16, 'Hotel breakfast')) return; pass(0.5); ateFood(50); gain('fun', 6); log('🍳 Eggs, toast, fruit and juice. A fancy breakfast!'); }],
  ],
  lighthouse: [
    ['🗼', 'Climb to the Top', '$5 · 1 hr', () => { if (!spend(5, 'Lighthouse ticket')) return; pass(1, 'sport'); gain('fun', 12); addSkill('fit', 1); addSkill('sci', 1); log('🗼 You climbed 120 stairs to the top! The lighthouse light helps ships find their way at night.', 'good'); }],
  ],
  harbor: [
    ['⛵', 'Boat Tour', '$25 · 2 hrs', () => { if (S.weather === 'rainy') return nope('Boats don\'t go out in storms.'); if (!spend(25, 'Boat tour')) return; pass(2, 'relax'); gain('fun', 25); addSkill('animal', 1); log(Math.random() < 0.6 ? '🐬 You saw a pod of dolphins jumping next to the boat!' : '🐋 You saw a WHALE! It sprayed water out of its blowhole!', 'good'); }],
    ['🎣', 'Deep-Sea Fishing', '$35 · 3 hrs', () => { if (S.weather === 'rainy') return nope('Boats don\'t go out in storms.'); if (!spend(35, 'Fishing trip')) return; pass(3, 'relax'); const n = 2 + Math.floor(Math.random() * 5); S.inv.fish = (S.inv.fish || 0) + n; gain('fun', 15); log(`🎣 You caught ${n} big ocean fish!`, 'good'); }],
  ],
  generalstore: [
    ['🛒', 'Groceries', '$42 · 7 meals', () => { if (!spend(42, 'Groceries')) return; S.groceries += 7; log('🛒 You bought groceries at the general store.'); }],
    ['🧻', 'Household Supplies', '$15 · 20 uses', () => { if (!spend(15, 'Household supplies')) return; S.supplies += 20; log('🧻 You bought toilet paper, soap and shampoo.'); }],
  ],
  pancake: [
    ['🥞', 'Giant Pancake Stack', '$8', () => { if (!spend(8, 'Pancakes')) return; pass(0.5); ateFood(45); gain('fun', 8); log('🥞 A stack of pancakes as tall as your head, with syrup and butter!'); }],
    ['🫐', 'Blueberry Pancakes', '$10', () => { if (!spend(10, 'Blueberry pancakes')) return; pass(0.5); ateFood(45); gain('fun', 10); gain('health', 2); log('🫐 Fluffy blueberry pancakes. The best in the world!'); }],
  ],
  lumbermill: [
    ['🪓', 'Chop Wood', '3 hrs · earn $45', () => { if (S.needs.energy < 30) return nope('Too tired to chop wood.'); pass(3, 'work'); sideEarn(45, 'Chopping wood'); addSkill('fit', 2); addSkill('build', 1.5); log('🪓 You chopped and stacked a big pile of firewood. The mill paid you $45.', 'good'); }],
    ['🪚', 'Watch the Big Saw', '30 min · free', () => { pass(0.5, 'relax'); addSkill('build', 1); gain('fun', 5); log('🪚 You watched a giant saw turn a tree trunk into wooden boards. Whoa!'); }],
  ],
  pineinn: [['🛏️', 'Stay the Night', '$60 · after 5 PM', () => stayOvernight(60, 'Pinecrest Inn')]],
  skilodge: [
    ['🛏️', 'Stay the Night', '$130 · after 5 PM', () => stayOvernight(130, 'Snowpeak Ski Lodge')],
    ['🔥', 'Sit by the Fireplace', '1 hr · free', () => { pass(1, 'relax'); gain('fun', 10); gain('energy', 4); log('🔥 You warmed up by the big stone fireplace.'); }],
  ],
  cocoa: [
    ['☕', 'Hot Cocoa', '$4', () => { if (!spend(4, 'Hot cocoa')) return; pass(0.3, 'relax'); gain('fun', 10); gain('food', 6); S.needs.bladder = clamp(S.needs.bladder - 12); log('☕ Hot cocoa with tiny marshmallows. So warm!'); }],
    ['🍪', 'Warm Cookie', '$3', () => { if (!spend(3, 'Cookie')) return; gain('fun', 6); gain('food', 8); log('🍪 A warm chocolate chip cookie, right out of the oven.'); }],
  ],
  gearshop: [
    ['🥾', 'Hiking Boots', () => has('boots') ? '✅ You own them' : '$90 · hikes make you fitter', () => { if (has('boots')) return nope('You already have hiking boots.'); if (!spend(90, 'Hiking boots')) return; S.owned.boots = true; log('🥾 You bought hiking boots. Hikes will make you even fitter!', 'good'); }],
    ['🛷', 'Rent a Sled', '$10 · 1 hr', () => { if (!spend(10, 'Sled rental')) return; pass(1, 'sport'); gain('fun', 20); addSkill('fit', 1); log('🛷 Wheee! You zoomed down the snowy hill on a sled.', 'good'); }],
  ],
  hotsprings: [['♨️', 'Soak in the Hot Springs', '$15 · 1 hr', () => { if (!spend(15, 'Hot springs')) return; pass(1, 'relax'); gain('fun', 15); gain('health', 8); gain('hygiene', 15); log('♨️ You soaked in warm water that comes from deep underground. So relaxing!'); }]],
  bakery: [
    ['🍞', 'Fresh Bread', '$6 · 2 meals', () => { if (!spend(6, 'Bread')) return; S.groceries += 2; log('🍞 You bought a warm loaf of bread (2 meals).'); }],
    ['🍰', 'Slice of Cake', '$5', () => { if (!spend(5, 'Cake')) return; pass(0.3, 'relax'); gain('fun', 12); gain('food', 15); log('🍰 A slice of chocolate cake. Yum!'); }],
    ['👩‍🍳', 'Baking Class', '$30 · 2 hrs · Cooking skill', () => { if (!spend(30, 'Baking class')) return; pass(2, 'study'); const g = addSkill('cook', 5); gain('fun', 8); log(`👩‍🍳 The baker taught you to make croissants! Cooking +${g.toFixed(1)}`, 'good'); }],
  ],
  pottery: [
    ['🏺', 'Pottery Class', '$25 · 2 hrs · make a pot', () => { if (!spend(25, 'Pottery class')) return; pass(2, 'study'); addSkill('art', 3); const q = Math.max(5, Math.round(S.skills.art + (Math.random() - 0.5) * 30)); S.inv.pots = S.inv.pots || []; S.inv.pots.push(q); gain('fun', 10); log(`🏺 You made a pot on the pottery wheel (quality ${q}). Your hands got muddy!`); }],
    ['💲', 'Sell Your Pots', () => `you have ${(S.inv.pots || []).length}`, () => { const pots = S.inv.pots || []; if (!pots.length) return nope('Make some pots first.'); const v = pots.reduce((a, q) => a + 12 + Math.round(q * 0.8), 0); sideEarn(v, 'Sold pottery'); log(`🏺 The studio sold your ${pots.length} pot${pots.length > 1 ? 's' : ''} for ${money(v)}.`, 'good'); S.inv.pots = []; }],
  ],
  riverinn: [['🛏️', 'Stay the Night', '$70 · after 5 PM', () => stayOvernight(70, 'Riverside Inn')]],
};
function viewTownPlace(id) {
  const p = PLACES[id];
  const acts = TOWN_ACTIONS[id] || [];
  const tn = TOWN_NAMES.find(t => t.name.toLowerCase().includes(p.town === 'seaside' ? 'seaside' : p.town));
  return `<p>${p.blurb} <span class="muted">· ${tn ? tn.name : ''}</span></p>
    <div class="grid actions">${acts.map((a, i) => `<button class="action" onclick="townAct('${id}',${i})"><span class="ic">${a[0]}</span><b>${a[1]}</b><small>${typeof a[2] === 'function' ? a[2]() : a[2]}</small></button>`).join('')}</div>`;
}
function townAct(id, i) {
  const before = S.hour + S.day * 24, m = S.money;
  TOWN_ACTIONS[id][i][3]();
  S.townsVisited = S.townsVisited || {};
  S.townsVisited[PLACES[id].town] = true;
  if (Object.keys(S.townsVisited).length >= 4) unlock('townhopper');
  if (S.hour + S.day * 24 !== before || S.money !== m) done(); else render();
}
