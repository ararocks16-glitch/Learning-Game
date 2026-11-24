// ===================== TOWN MAP =====================
// A detailed town drawn on a canvas. Click a building to travel there.

const MAP_W = 1200, MAP_H = 760;
const ROAD_W = 30;
const H_ROADS = [170, 400, 630];       // y of horizontal roads
const V_ROADS = [25, 330, 870, 1175];  // x of vertical roads
const RIVER_X = 600;

// kind: place = has its own screen, home = a home you can live in,
// work = a workplace, deco = just scenery you can look at
const PLACES = {
  // top row
  h_mansion:   { kind: 'home', name: 'Mansion',          icon: '🏰', r: [50, 15, 250, 130],  door: [175, 153] },
  farm:        { kind: 'work', name: 'Sunny Farm',       icon: '🐄', r: [345, 15, 215, 130], door: [450, 153] },
  hospital:    { kind: 'place', name: 'Hospital',        icon: '🏥', r: [650, 20, 200, 125], door: [750, 153] },
  cityhall:    { kind: 'work', name: 'City Hall',        icon: '🏛️', r: [890, 20, 140, 125], door: [960, 153] },
  firestation: { kind: 'deco', name: 'Fire Station',     icon: '🚒', r: [1045, 30, 110, 115], door: [1100, 153] },
  // second row
  h_parents:   { kind: 'home', name: "Parents' House",   icon: '👨‍👩‍👧', r: [50, 192, 125, 92], door: [112, 187] },
  h_small:     { kind: 'home', name: 'Small House',      icon: '🏠', r: [190, 192, 120, 92],  door: [250, 187] },
  nb1:         { kind: 'deco', name: 'Neighbor\'s House', icon: '🏡', r: [50, 298, 125, 85], door: [112, 383] },
  nb2:         { kind: 'deco', name: 'Neighbor\'s House', icon: '🏡', r: [190, 298, 120, 85], door: [250, 383] },
  h_apartments:{ kind: 'home', name: 'Apartments',       icon: '🏢', r: [350, 192, 210, 190], door: [455, 383] },
  park:        { kind: 'place', name: 'Lakeside Park',   icon: '🌳', r: [645, 190, 210, 192], door: [750, 383] },
  jobcenter:   { kind: 'place', name: 'Job Center',      icon: '💼', r: [890, 205, 120, 177], door: [950, 383] },
  office:      { kind: 'work', name: 'Office Tower',     icon: '🏙️', r: [1025, 190, 130, 192], door: [1090, 383] },
  // third row
  h_family:    { kind: 'home', name: 'Family House',     icon: '🏡', r: [50, 420, 260, 100], door: [180, 417] },
  nb3:         { kind: 'deco', name: 'Neighbor\'s House', icon: '🏡', r: [50, 530, 125, 82],  door: [112, 613] },
  nb4:         { kind: 'deco', name: 'Neighbor\'s House', icon: '🏡', r: [190, 530, 120, 82],  door: [250, 613] },
  school:      { kind: 'place', name: 'College',         icon: '🎓', r: [350, 420, 210, 115], door: [455, 417] },
  library:     { kind: 'place', name: 'Library',         icon: '📚', r: [350, 545, 210, 67],  door: [455, 613] },
  bank:        { kind: 'place', name: 'Bank',            icon: '🏦', r: [645, 420, 100, 92],  door: [695, 417] },
  realestate:  { kind: 'place', name: 'Real Estate',     icon: '🔑', r: [755, 420, 100, 92],  door: [805, 417] },
  diner:       { kind: 'place', name: 'Diner',           icon: '🍔', r: [645, 522, 210, 90],  door: [750, 613] },
  market:      { kind: 'place', name: 'Supermarket',     icon: '🛒', r: [890, 420, 265, 95],  door: [1020, 417] },
  mall:        { kind: 'place', name: 'Mall',            icon: '🛍️', r: [890, 525, 265, 87],  door: [1020, 613] },
  // bottom row
  sports:      { kind: 'place', name: 'Sports Park',     icon: '🏅', r: [50, 650, 510, 105], door: [300, 647] },
  theater:     { kind: 'work', name: 'Theater',          icon: '🎭', r: [645, 652, 100, 100], door: [695, 647] },
  cars:        { kind: 'place', name: 'Bike & Car Shop', icon: '🚙', r: [755, 652, 100, 100], door: [805, 647] },
  construction:{ kind: 'work', name: 'Construction Site', icon: '🏗️', r: [890, 652, 120, 100], door: [950, 647] },
  warehouse:   { kind: 'work', name: 'Warehouse',        icon: '📦', r: [1025, 652, 130, 100], door: [1090, 647] },
};

const HOME_PLACE = { parents: 'h_parents', shared: 'h_apartments', studio: 'h_apartments', onebed: 'h_apartments', small: 'h_small', family: 'h_family', mansion: 'h_mansion' };
const WORKPLACE = {
  Food: 'diner', Stores: 'mall', Office: 'office', Health: 'hospital', Education: 'school', Trades: 'construction',
  Transport: 'warehouse', Tech: 'office', Arts: 'theater', Science: 'school', Animals: 'farm', 'Public Service': 'cityhall', Sports: 'sports',
};

function placeId(loc) { return loc === 'home' ? HOME_PLACE[S.home] : loc; }
function placeOf(loc) { return PLACES[placeId(loc)]; }
function workplaceOf(job) { return WORKPLACE[job.cat]; }
function locName(loc) { return loc === 'home' ? `Home (${home().name})` : PLACES[loc].name; }

// ---------- roads & paths ----------
const NODES = [];
V_ROADS.forEach(x => H_ROADS.forEach(y => NODES.push([x, y])));
const nodeAt = (x, y) => NODES.findIndex(n => n[0] === x && n[1] === y);
const EDGES = [];
H_ROADS.forEach(y => { for (let i = 0; i < V_ROADS.length - 1; i++) EDGES.push([nodeAt(V_ROADS[i], y), nodeAt(V_ROADS[i + 1], y)]); });
V_ROADS.forEach(x => { for (let i = 0; i < H_ROADS.length - 1; i++) EDGES.push([nodeAt(x, H_ROADS[i]), nodeAt(x, H_ROADS[i + 1])]); });
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

function nearestRoadPoint(p) {
  let best = null;
  EDGES.forEach(([a, b], i) => {
    const A = NODES[a], B = NODES[b];
    const dx = B[0] - A[0], dy = B[1] - A[1];
    const t = Math.max(0, Math.min(1, ((p[0] - A[0]) * dx + (p[1] - A[1]) * dy) / (dx * dx + dy * dy)));
    const q = [A[0] + dx * t, A[1] + dy * t];
    const d = dist(p, q);
    if (!best || d < best.d) best = { d, q, edge: i };
  });
  return best;
}

function findPath(fromLoc, toLoc) {
  const A = placeOf(fromLoc).door, B = placeOf(toLoc).door;
  if (placeId(fromLoc) === placeId(toLoc)) return [A];
  const s = nearestRoadPoint(A), t = nearestRoadPoint(B);
  const S_ = NODES.length, T_ = S_ + 1;
  const pts = NODES.concat([s.q, t.q]);
  const adj = pts.map(() => []);
  const link = (i, j) => { const d = dist(pts[i], pts[j]); adj[i].push([j, d]); adj[j].push([i, d]); };
  EDGES.forEach(([a, b]) => link(a, b));
  link(S_, EDGES[s.edge][0]); link(S_, EDGES[s.edge][1]);
  link(T_, EDGES[t.edge][0]); link(T_, EDGES[t.edge][1]);
  if (s.edge === t.edge) link(S_, T_);
  const D = pts.map(() => Infinity), prev = pts.map(() => -1), seen = pts.map(() => false);
  D[S_] = 0;
  for (;;) {
    let u = -1;
    D.forEach((d, i) => { if (!seen[i] && d < Infinity && (u < 0 || d < D[u])) u = i; });
    if (u < 0 || u === T_) break;
    seen[u] = true;
    adj[u].forEach(([v, w]) => { if (D[u] + w < D[v]) { D[v] = D[u] + w; prev[v] = u; } });
  }
  const route = [];
  for (let u = T_; u >= 0; u = prev[u]) route.unshift(pts[u]);
  return [A, ...route, B];
}
function pathLength(path) { let L = 0; for (let i = 1; i < path.length; i++) L += dist(path[i - 1], path[i]); return L; }

// ---------- seeded random so the town looks the same every time ----------
function seeded(seed) {
  return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}

// ---------- static drawing ----------
const WINDOWS = [];   // windows that light up at night
let NO_REC = false;    // true while drawing the big world (don't record town windows)
const LAMPS = [];
let staticCanvas = null;
const riverPts = [];
for (let y = -20; y <= MAP_H + 20; y += 20) riverPts.push([RIVER_X + Math.sin(y / 70) * 9 + Math.sin(y / 23) * 3, y]);

function rr(c, x, y, w, h, r) { c.beginPath(); c.roundRect ? c.roundRect(x, y, w, h, r) : c.rect(x, y, w, h); }
function fillR(c, x, y, w, h, col, r = 0) { c.fillStyle = col; rr(c, x, y, w, h, r); c.fill(); }
function strokeR(c, x, y, w, h, col, lw = 1, r = 0) { c.strokeStyle = col; c.lineWidth = lw; rr(c, x, y, w, h, r); c.stroke(); }
function tri(c, pts, col) { c.fillStyle = col; c.beginPath(); c.moveTo(...pts[0]); pts.slice(1).forEach(p => c.lineTo(...p)); c.closePath(); c.fill(); }
function circ(c, x, y, r, col) { c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill(); }
function ell(c, x, y, rx, ry, col) { c.fillStyle = col; c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); c.fill(); }
function txt(c, s, x, y, col, size = 10, weight = 700, align = 'center') {
  c.fillStyle = col; c.font = `${weight} ${size}px system-ui, sans-serif`; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y);
}
function signBoard(c, x, y, w, h, bg, fg, s, size = 9) { fillR(c, x, y, w, h, bg, 3); strokeR(c, x, y, w, h, 'rgba(0,0,0,.25)', 1, 3); txt(c, s, x + w / 2, y + h / 2 + 0.5, fg, size); }
function win(c, x, y, w, h, glass = '#bfe3f5', frame = '#ffffff') {
  fillR(c, x - 1, y - 1, w + 2, h + 2, frame); fillR(c, x, y, w, h, glass);
  c.fillStyle = 'rgba(255,255,255,.5)'; c.fillRect(x + 1, y + 1, w * 0.35, h * 0.35);
  if (!NO_REC) WINDOWS.push([x, y, w, h]);
}
function winGrid(c, x, y, w, h, cols, rows, ww, wh, glass, frame) {
  const gx = (w - cols * ww) / (cols + 1), gy = (h - rows * wh) / (rows + 1);
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) win(c, x + gx + i * (ww + gx), y + gy + j * (wh + gy), ww, wh, glass, frame);
}
const SHADE = [];
function shadow(c, x, y, w, h) {
  c.save();
  c.filter = 'blur(4px)';
  c.fillStyle = 'rgba(20,30,20,.32)';
  c.beginPath(); c.moveTo(x + 2, y + h); c.lineTo(x + w, y + h); c.lineTo(x + w + 9, y + h + 7); c.lineTo(x + 9, y + h + 7); c.closePath(); c.fill();
  c.fillRect(x + w, y + 6, 9, h);
  c.restore();
  if (!NO_REC) SHADE.push([x, y, w, h]);
}

function tree(c, x, y, s, rnd) {
  c.save(); c.filter = 'blur(3px)'; ell(c, x + s * 0.7, y + s * 0.15, s * 1.15, s * 0.5, 'rgba(15,40,15,.35)'); c.restore();
  const tg = c.createLinearGradient(x - s * 0.15, 0, x + s * 0.15, 0); tg.addColorStop(0, '#8a6040'); tg.addColorStop(1, '#5a3a22');
  c.fillStyle = tg; c.fillRect(x - s * 0.13, y - s * 0.6, s * 0.26, s * 0.65);
  const hues = [[52, 120, 50], [60, 135, 55], [44, 108, 46], [74, 140, 60], [88, 128, 52]];
  const [r0, g0, b0] = hues[Math.floor(rnd() * hues.length)];
  const blob = (bx, by, br, k) => {
    const g = c.createRadialGradient(bx - br * 0.4, by - br * 0.45, br * 0.1, bx, by, br * 1.05);
    g.addColorStop(0, `rgb(${r0 + 45 + k},${g0 + 45 + k},${b0 + 25})`);
    g.addColorStop(0.55, `rgb(${r0 + k},${g0 + k},${b0})`);
    g.addColorStop(1, `rgb(${r0 - 28},${g0 - 35},${b0 - 25})`);
    c.fillStyle = g; c.beginPath(); c.arc(bx, by, br, 0, Math.PI * 2); c.fill();
  };
  blob(x - s * 0.5, y - s * 0.55, s * 0.55, -6);
  blob(x + s * 0.5, y - s * 0.6, s * 0.55, -4);
  blob(x, y - s * 0.95, s * 0.72, 4);
  blob(x - s * 0.15, y - s * 0.4, s * 0.45, 0);
  c.fillStyle = 'rgba(255,255,230,.18)';
  for (let i = 0; i < 6; i++) { c.beginPath(); c.arc(x - s * 0.5 + rnd() * s * 0.8, y - s * 1.3 + rnd() * s * 0.6, s * 0.09, 0, Math.PI * 2); c.fill(); }
}
function pine(c, x, y, s) {
  c.save(); c.filter = 'blur(2px)'; ell(c, x + s * 0.6, y + 1, s * 0.8, s * 0.3, 'rgba(15,40,15,.35)'); c.restore();
  fillR(c, x - 2, y - 4, 4, 6, '#6b4527');
  tri(c, [[x, y - s * 1.6], [x - s * 0.6, y - s * 0.3], [x + s * 0.6, y - s * 0.3]], '#1f6b35');
  tri(c, [[x, y - s * 2], [x - s * 0.45, y - s * 0.9], [x + s * 0.45, y - s * 0.9]], '#26803f');
  tri(c, [[x, y - s * 2], [x + s * 0.45, y - s * 0.9], [x + s * 0.6, y - s * 0.3], [x, y - s * 0.5]], 'rgba(0,0,0,.14)');
  tri(c, [[x, y - s * 2.2], [x - s * 0.3, y - s * 1.4], [x + s * 0.3, y - s * 1.4]], '#2f9149');
}
function bush(c, x, y, s, col = '#3f9a48') { circ(c, x, y, s, col); circ(c, x + s * 0.8, y + 1, s * 0.8, col); circ(c, x - s * 0.8, y + 1, s * 0.8, col); }
function flowers(c, x, y, w, h, rnd) {
  const cols = ['#ff6b8a', '#ffd23f', '#ffffff', '#b57cff', '#ff8c42'];
  for (let i = 0; i < w * h / 25; i++) circ(c, x + rnd() * w, y + rnd() * h, 1.6, cols[Math.floor(rnd() * cols.length)]);
}
function fence(c, x1, y, x2, col = '#fff') {
  c.strokeStyle = col; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x1, y); c.lineTo(x2, y); c.moveTo(x1, y - 4); c.lineTo(x2, y - 4); c.stroke();
  for (let x = x1; x <= x2; x += 6) { c.beginPath(); c.moveTo(x, y + 1); c.lineTo(x, y - 7); c.stroke(); }
}
function carShape(c, x, y, col, horiz = true) {
  if (horiz) { fillR(c, x - 11, y - 6, 22, 12, col, 4); fillR(c, x - 5, y - 5, 10, 10, 'rgba(190,230,255,.85)', 2); }
  else { fillR(c, x - 6, y - 11, 12, 22, col, 4); fillR(c, x - 5, y - 5, 10, 10, 'rgba(190,230,255,.85)', 2); }
}

function house(c, x, y, w, h, wall, roof, rnd, opts = {}) {
  // yard
  fillR(c, x, y, w, h, '#8fd17a', 4);
  flowers(c, x + 4, y + h - 14, w - 8, 10, rnd);
  const bw = w * 0.62, bh = h * 0.42, bx = x + (w - bw) / 2, by = y + h * 0.42;
  shadow(c, bx, by, bw, bh);
  fillR(c, bx, by, bw, bh, wall);
  // chimney
  fillR(c, bx + bw * 0.7, y + h * 0.12, 8, h * 0.2, '#8b4a3a');
  tri(c, [[bx - 7, by + 1], [bx + bw / 2, y + h * 0.08], [bx + bw + 7, by + 1]], roof);
  c.strokeStyle = 'rgba(0,0,0,.15)'; c.lineWidth = 1;
  for (let i = 1; i < 4; i++) { const yy = y + h * 0.08 + (by - y - h * 0.08) * i / 4; c.beginPath(); c.moveTo(bx + bw / 2 - (yy - y - h * 0.08) * (bw / 2 + 7) / (by - y - h * 0.08), yy); c.lineTo(bx + bw / 2 + (yy - y - h * 0.08) * (bw / 2 + 7) / (by - y - h * 0.08), yy); c.stroke(); }
  // door & windows
  fillR(c, bx + bw / 2 - 5, by + bh - 17, 10, 17, '#6b3e26', 2);
  circ(c, bx + bw / 2 + 3, by + bh - 8, 1, '#ffd23f');
  win(c, bx + 7, by + 7, 12, 10);
  win(c, bx + bw - 19, by + 7, 12, 10);
  if (opts.attic) win(c, bx + bw / 2 - 5, y + h * 0.25, 10, 8);
  // path to door
  c.fillStyle = '#d9c9a3'; c.fillRect(bx + bw / 2 - 4, by + bh, 8, y + h - by - bh);
  if (opts.fence !== false) fence(c, x + 3, y + h - 3, x + w - 3);
  if (opts.mailbox) { fillR(c, x + 8, y + h - 18, 3, 12, '#555'); fillR(c, x + 5, y + h - 22, 10, 6, opts.mailbox, 2); }
}

function drawStatic(c) {
  WINDOWS.length = 0; LAMPS.length = 0; SHADE.length = 0;
  const rnd = seeded(42);

  // grass
  const g = c.createLinearGradient(0, 0, 0, MAP_H);
  g.addColorStop(0, '#86c96f'); g.addColorStop(1, '#73bb60');
  c.fillStyle = g; c.fillRect(0, 0, MAP_W, MAP_H);
  // soft patches of lighter and darker grass
  for (let i = 0; i < 260; i++) {
    const px = rnd() * MAP_W, py = rnd() * MAP_H, pr = 25 + rnd() * 80;
    const pg = c.createRadialGradient(px, py, 0, px, py, pr);
    const col = rnd() < 0.5 ? '60,120,45' : rnd() < 0.7 ? '170,210,120' : '150,150,80';
    pg.addColorStop(0, `rgba(${col},${0.08 + rnd() * 0.1})`); pg.addColorStop(1, `rgba(${col},0)`);
    c.fillStyle = pg; c.fillRect(px - pr, py - pr, pr * 2, pr * 2);
  }
  // grass blades
  c.lineWidth = 1;
  for (let i = 0; i < 9000; i++) {
    const bx = rnd() * MAP_W, by = rnd() * MAP_H;
    c.strokeStyle = rnd() < 0.55 ? `rgba(45,${100 + rnd() * 40 | 0},40,.35)` : `rgba(${180 + rnd() * 40 | 0},230,150,.3)`;
    c.beginPath(); c.moveTo(bx, by); c.lineTo(bx + (rnd() - 0.5) * 2, by - 2 - rnd() * 2); c.stroke();
  }
  // a few dirt spots and pebbles
  for (let i = 0; i < 25; i++) { const dx = rnd() * MAP_W, dy = rnd() * MAP_H; ell(c, dx, dy, 4 + rnd() * 7, 2 + rnd() * 3, 'rgba(150,120,80,.18)'); }

  // river
  const riverPath = () => { c.beginPath(); riverPts.forEach((p, i) => i ? c.lineTo(...p) : c.moveTo(...p)); };
  c.lineCap = 'round'; c.lineJoin = 'round';
  riverPath(); c.strokeStyle = 'rgba(90,120,60,.5)'; c.lineWidth = 70; c.stroke();
  riverPath(); c.strokeStyle = '#cdb98a'; c.lineWidth = 62; c.stroke();
  riverPath(); c.strokeStyle = '#b9a372'; c.lineWidth = 54; c.stroke();
  riverPath(); c.strokeStyle = '#2f6f9e'; c.lineWidth = 48; c.stroke();
  riverPath(); c.strokeStyle = '#3c84b8'; c.lineWidth = 40; c.stroke();
  riverPath(); c.strokeStyle = '#4b97c9'; c.lineWidth = 28; c.stroke();
  riverPath(); c.strokeStyle = '#5aa6d6'; c.lineWidth = 14; c.stroke();
  for (let i = 0; i < 200; i++) {
    const p = riverPts[Math.floor(rnd() * riverPts.length)];
    c.fillStyle = rnd() < 0.5 ? 'rgba(120,100,70,.35)' : 'rgba(230,215,170,.4)';
    c.fillRect(p[0] + (rnd() < 0.5 ? -1 : 1) * (24 + rnd() * 6), p[1] + rnd() * 20, 1.5, 1.5);
  }
  // reeds and rocks
  for (let y = 0; y < MAP_H; y += 14) {
    const p = riverPts[Math.floor((y + 20) / 20)] || [RIVER_X, y];
    if (rnd() < 0.5) { c.strokeStyle = '#4c8a3a'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(p[0] - 27, y); c.lineTo(p[0] - 29, y - 7); c.stroke(); }
    if (rnd() < 0.3) circ(c, p[0] + 28, y, 2.5, '#9a9a8a');
  }

  // sidewalks
  c.fillStyle = '#c9c4b8';
  H_ROADS.forEach(y => c.fillRect(V_ROADS[0] - ROAD_W / 2 - 5, y - ROAD_W / 2 - 5, V_ROADS[3] - V_ROADS[0] + ROAD_W + 10, ROAD_W + 10));
  V_ROADS.forEach(x => c.fillRect(x - ROAD_W / 2 - 5, H_ROADS[0] - ROAD_W / 2 - 5, ROAD_W + 10, H_ROADS[2] - H_ROADS[0] + ROAD_W + 10));
  // roads
  c.fillStyle = '#4d535b';
  H_ROADS.forEach(y => c.fillRect(V_ROADS[0] - ROAD_W / 2, y - ROAD_W / 2, V_ROADS[3] - V_ROADS[0] + ROAD_W, ROAD_W));
  V_ROADS.forEach(x => c.fillRect(x - ROAD_W / 2, H_ROADS[0] - ROAD_W / 2, ROAD_W, H_ROADS[2] - H_ROADS[0] + ROAD_W));
  // asphalt grain, cracks and curbs
  const roadRects = H_ROADS.map(y => [V_ROADS[0] - ROAD_W / 2, y - ROAD_W / 2, V_ROADS[3] - V_ROADS[0] + ROAD_W, ROAD_W])
    .concat(V_ROADS.map(x => [x - ROAD_W / 2, H_ROADS[0] - ROAD_W / 2, ROAD_W, H_ROADS[2] - H_ROADS[0] + ROAD_W]));
  roadRects.forEach(([rx, ry, rw, rh]) => {
    for (let i = 0; i < rw * rh / 18; i++) {
      c.fillStyle = rnd() < 0.5 ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.12)';
      c.fillRect(rx + rnd() * rw, ry + rnd() * rh, 1.2, 1.2);
    }
    const tg = rw > rh ? c.createLinearGradient(0, ry, 0, ry + rh) : c.createLinearGradient(rx, 0, rx + rw, 0);
    tg.addColorStop(0, 'rgba(0,0,0,.12)'); tg.addColorStop(0.25, 'rgba(0,0,0,0)'); tg.addColorStop(0.75, 'rgba(0,0,0,0)'); tg.addColorStop(1, 'rgba(0,0,0,.12)');
    c.fillStyle = tg; c.fillRect(rx, ry, rw, rh);
    c.strokeStyle = 'rgba(30,30,30,.35)'; c.lineWidth = 0.8;
    for (let i = 0; i < (rw + rh) / 120; i++) {
      let cx = rx + rnd() * rw, cy = ry + rnd() * rh;
      c.beginPath(); c.moveTo(cx, cy);
      for (let k = 0; k < 4; k++) { cx += (rnd() - 0.5) * 8; cy += (rnd() - 0.5) * 8; c.lineTo(cx, cy); }
      c.stroke();
    }
    c.strokeStyle = 'rgba(235,235,225,.7)'; c.lineWidth = 1.5;
    c.strokeRect(rx + 0.75, ry + 0.75, rw - 1.5, rh - 1.5);
  });
  // paving joints on sidewalks
  c.strokeStyle = 'rgba(120,110,95,.35)'; c.lineWidth = 0.7;
  H_ROADS.forEach(y => { for (let x = V_ROADS[0]; x < V_ROADS[3]; x += 9) { c.beginPath(); c.moveTo(x, y - ROAD_W / 2 - 5); c.lineTo(x, y - ROAD_W / 2); c.moveTo(x, y + ROAD_W / 2); c.lineTo(x, y + ROAD_W / 2 + 5); c.stroke(); } });
  V_ROADS.forEach(x => { for (let y = H_ROADS[0]; y < H_ROADS[2]; y += 9) { c.beginPath(); c.moveTo(x - ROAD_W / 2 - 5, y); c.lineTo(x - ROAD_W / 2, y); c.moveTo(x + ROAD_W / 2, y); c.lineTo(x + ROAD_W / 2 + 5, y); c.stroke(); } });
  // lane markings
  c.strokeStyle = '#f2d34a'; c.lineWidth = 2; c.setLineDash([10, 9]);
  H_ROADS.forEach(y => V_ROADS.slice(0, -1).forEach((x, i) => { c.beginPath(); c.moveTo(x + ROAD_W, y); c.lineTo(V_ROADS[i + 1] - ROAD_W, y); c.stroke(); }));
  V_ROADS.forEach(x => H_ROADS.slice(0, -1).forEach((y, i) => { c.beginPath(); c.moveTo(x, y + ROAD_W); c.lineTo(x, H_ROADS[i + 1] - ROAD_W); c.stroke(); }));
  c.setLineDash([]);
  // crosswalks
  c.fillStyle = 'rgba(255,255,255,.85)';
  NODES.forEach(([x, y]) => {
    for (let k = -12; k <= 12; k += 6) {
      if (x > V_ROADS[0]) c.fillRect(x - ROAD_W / 2 - 9, y + k - 1.5, 7, 3);
      if (x < V_ROADS[3]) c.fillRect(x + ROAD_W / 2 + 2, y + k - 1.5, 7, 3);
      if (y > H_ROADS[0]) c.fillRect(x + k - 1.5, y - ROAD_W / 2 - 9, 3, 7);
      if (y < H_ROADS[2]) c.fillRect(x + k - 1.5, y + ROAD_W / 2 + 2, 3, 7);
    }
  });
  // bridges
  H_ROADS.forEach(y => {
    const p = riverPts[Math.round((y + 20) / 20)];
    const x1 = p[0] - 36, x2 = p[0] + 36;
    c.fillStyle = '#8c8577'; c.fillRect(x1, y - ROAD_W / 2 - 7, x2 - x1, 5); c.fillRect(x1, y + ROAD_W / 2 + 2, x2 - x1, 5);
    for (let x = x1; x <= x2; x += 9) { fillR(c, x, y - ROAD_W / 2 - 9, 3, 9, '#6f6a5f'); fillR(c, x, y + ROAD_W / 2 + 1, 3, 9, '#6f6a5f'); }
  });
  // road name signs
  [['Maple Road', 470, 170], ['Main Street', 760, 400], ['River Road', 470, 630]].forEach(([n, x, y]) => {
    fillR(c, x - 32, y - ROAD_W / 2 - 18, 64, 12, '#2e7d4f', 2); txt(c, n, x, y - ROAD_W / 2 - 12, '#fff', 8);
  });
  // street lamps
  H_ROADS.forEach(y => { for (let x = 90; x < 1150; x += 130) { if (Math.abs(x - RIVER_X) < 50) continue; LAMPS.push([x, y - ROAD_W / 2 - 6]); } });
  LAMPS.forEach(([x, y]) => { fillR(c, x - 1, y - 12, 2, 12, '#3b3f45'); circ(c, x, y - 13, 3, '#f7f1c8'); });

  // ---------- buildings ----------
  const P = id => PLACES[id].r;
  let [x, y, w, h] = P('h_mansion');
  fillR(c, x, y, w, h, '#9fdc85', 6);
  for (let i = 0; i < 12; i++) bush(c, x + 10 + i * 21, y + 8, 5, '#2f7a3a');
  fillR(c, x + 15, y + 70, 55, 38, '#7fd4f5', 4); strokeR(c, x + 15, y + 70, 55, 38, '#fff', 3, 4);
  c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 1; for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(x + 20, y + 80 + k * 9); c.quadraticCurveTo(x + 42, y + 76 + k * 9, x + 65, y + 80 + k * 9); c.stroke(); }
  shadow(c, x + 85, y + 30, 150, 72);
  fillR(c, x + 85, y + 30, 150, 72, '#f4ead7');
  fillR(c, x + 75, y + 45, 22, 57, '#efe2c8'); fillR(c, x + 223, y + 45, 22, 57, '#efe2c8');
  tri(c, [[x + 80, y + 31], [x + 160, y + 12], [x + 240, y + 31]], '#5b6b80');
  tri(c, [[x + 135, y + 45], [x + 160, y + 30], [x + 185, y + 45]], '#e6d6b6');
  for (let k = 0; k < 4; k++) fillR(c, x + 138 + k * 14, y + 45, 4, 40, '#fff');
  winGrid(c, x + 85, y + 32, 50, 66, 2, 2, 11, 13); winGrid(c, x + 185, y + 32, 50, 66, 2, 2, 11, 13);
  fillR(c, x + 152, y + 82, 16, 20, '#6b3e26', 3);
  c.fillStyle = '#d9c9a3'; c.fillRect(x + 154, y + 102, 12, 28);
  circ(c, x + 160, y + 115, 9, '#cfd8dc'); circ(c, x + 160, y + 115, 5, '#7fd4f5');
  fillR(c, x + 5, y + h - 8, 70, 4, '#4a4a4a'); fillR(c, x + w - 75, y + h - 8, 70, 4, '#4a4a4a');
  [x + 75, x + w - 75].forEach(px => fillR(c, px - 3, y + h - 16, 6, 14, '#c9a24a'));

  [x, y, w, h] = P('farm');
  for (let k = 0; k < 7; k++) { fillR(c, x + 5, y + 8 + k * 9, 95, 6, k % 2 ? '#a5793f' : '#b98a4d'); for (let j = 0; j < 12; j++) circ(c, x + 10 + j * 8, y + 11 + k * 9, 2, '#4c9a3a'); }
  fillR(c, x + 5, y + 75, 95, 50, '#c8e6a0');
  fence(c, x + 5, y + 125, x + 100, '#8b6b45');
  [[x + 25, y + 95], [x + 60, y + 105], [x + 80, y + 88]].forEach(([cx, cy]) => { ell(c, cx, cy, 9, 5, '#fff'); circ(c, cx - 3, cy - 1, 2, '#222'); circ(c, cx + 4, cy + 1, 2, '#222'); circ(c, cx + 9, cy - 2, 3, '#f1d0c0'); });
  shadow(c, x + 115, y + 35, 70, 75);
  fillR(c, x + 115, y + 50, 70, 60, '#c0392b');
  tri(c, [[x + 110, y + 52], [x + 150, y + 22], [x + 190, y + 52]], '#8e2a20');
  fillR(c, x + 135, y + 75, 30, 35, '#fff'); fillR(c, x + 137, y + 77, 26, 33, '#a0322a');
  c.strokeStyle = '#fff'; c.lineWidth = 2; c.beginPath(); c.moveTo(x + 137, y + 77); c.lineTo(x + 163, y + 110); c.moveTo(x + 163, y + 77); c.lineTo(x + 137, y + 110); c.stroke();
  win(c, x + 143, y + 56, 14, 10);
  fillR(c, x + 190, y + 30, 20, 80, '#b0bec5', 3); ell(c, x + 200, y + 30, 10, 6, '#90a4ae');
  for (let k = 0; k < 5; k++) circ(c, x + 120 + k * 9, y + 118, 2.5, k % 2 ? '#fff' : '#f4c430');

  [x, y, w, h] = P('hospital');
  shadow(c, x + 15, y + 10, 170, 95);
  fillR(c, x + 15, y + 10, 170, 95, '#f5f7fa');
  fillR(c, x + 15, y + 10, 170, 8, '#cfd8dc');
  winGrid(c, x + 15, y + 22, 65, 75, 3, 4, 12, 9); winGrid(c, x + 120, y + 22, 65, 75, 3, 4, 12, 9);
  fillR(c, x + 87, y + 25, 26, 26, '#fff'); fillR(c, x + 96, y + 28, 8, 20, '#e53935'); fillR(c, x + 90, y + 34, 20, 8, '#e53935');
  signBoard(c, x + 72, y + 58, 56, 12, '#e53935', '#fff', 'HOSPITAL', 8);
  fillR(c, x + 85, y + 80, 30, 25, '#90caf9', 2); c.fillStyle = '#fff'; c.fillRect(x + 99, y + 80, 2, 25);
  fillR(c, x + 145, y + 108, 36, 16, '#fff', 3); fillR(c, x + 145, y + 114, 36, 3, '#e53935'); fillR(c, x + 168, y + 109, 10, 6, '#bbdefb', 1); circ(c, x + 152, y + 124, 3, '#333'); circ(c, x + 174, y + 124, 3, '#333');

  [x, y, w, h] = P('cityhall');
  fillR(c, x + 5, y + 100, w - 10, 20, '#d9d2c0');
  shadow(c, x + 10, y + 45, w - 20, 60);
  fillR(c, x + 10, y + 45, w - 20, 60, '#ece4d2');
  tri(c, [[x + 5, y + 47], [x + w / 2, y + 22], [x + w - 5, y + 47]], '#d4c8ab');
  ell(c, x + w / 2, y + 22, 18, 14, '#7fa7a0'); fillR(c, x + w / 2 - 1, y - 2, 2, 12, '#555');
  tri(c, [[x + w / 2 + 1, y - 2], [x + w / 2 + 14, y + 2], [x + w / 2 + 1, y + 6]], '#2f6fd6');
  for (let k = 0; k < 6; k++) fillR(c, x + 18 + k * 19, y + 50, 6, 50, '#fff');
  fillR(c, x + w / 2 - 9, y + 80, 18, 25, '#6b3e26', 3);
  signBoard(c, x + w / 2 - 30, y + 106, 60, 11, '#5d4b2a', '#fff', 'CITY HALL', 8);

  [x, y, w, h] = P('firestation');
  shadow(c, x + 5, y + 20, w - 10, 85);
  fillR(c, x + 5, y + 20, w - 10, 85, '#b23a2a');
  for (let k = 0; k < 8; k++) { c.fillStyle = 'rgba(0,0,0,.08)'; c.fillRect(x + 5, y + 24 + k * 10, w - 10, 1); }
  signBoard(c, x + 15, y + 25, w - 30, 13, '#fff', '#b23a2a', 'FIRE STATION', 8);
  [x + 12, x + 58].forEach(dx => { fillR(c, dx, y + 50, 40, 55, '#ddd', 3); for (let k = 0; k < 5; k++) c.fillStyle = '#bbb', c.fillRect(dx, y + 55 + k * 10, 40, 1.5); });
  fillR(c, x + 14, y + 85, 36, 18, '#e53935', 3); fillR(c, x + 16, y + 87, 10, 7, '#bbdefb');

  ['h_parents', 'h_small', 'nb1', 'nb2', 'nb3', 'nb4'].forEach((id, i) => {
    const [hx, hy, hw, hh] = P(id);
    const walls = ['#f7d794', '#a7d8f0', '#f8c6c6', '#d6f0b5', '#e4d4f7', '#fde2b8'];
    const roofs = ['#c0392b', '#34495e', '#8e44ad', '#2c7a4b', '#7f5539', '#b03a2e'];
    house(c, hx, hy, hw, hh, walls[i], roofs[i], rnd, { attic: i % 2 === 0, mailbox: i < 2 ? '#2f6fd6' : null });
  });
  [x, y, w, h] = P('h_family');
  fillR(c, x, y, w, h, '#93d47e', 5);
  flowers(c, x + 5, y + h - 15, w - 10, 10, rnd);
  shadow(c, x + 60, y + 35, 150, 50);
  fillR(c, x + 60, y + 35, 150, 50, '#fff3d6');
  fillR(c, x + 210, y + 50, 40, 35, '#e9dcc0'); fillR(c, x + 214, y + 58, 32, 27, '#cfcfcf'); for (let k = 0; k < 4; k++) fillR(c, x + 214, y + 62 + k * 6, 32, 1, '#aaa');
  tri(c, [[x + 52, y + 37], [x + 135, y + 6], [x + 218, y + 37]], '#3d6e8f');
  tri(c, [[x + 205, y + 52], [x + 230, y + 38], [x + 255, y + 52]], '#3d6e8f');
  winGrid(c, x + 60, y + 38, 150, 45, 5, 1, 14, 13);
  fillR(c, x + 128, y + 62, 14, 23, '#7a4b2a', 2);
  fillR(c, x + 8, y + 40, 40, 32, '#7a5230'); fillR(c, x + 10, y + 30, 36, 10, '#a0522d'); fillR(c, x + 25, y + 72, 2, 18, '#555');
  c.strokeStyle = '#555'; c.beginPath(); c.moveTo(x + 15, y + 50); c.lineTo(x + 15, y + 66); c.moveTo(x + 40, y + 50); c.lineTo(x + 40, y + 66); c.stroke();
  fence(c, x + 3, y + h - 3, x + w - 3);
  c.fillStyle = '#d9c9a3'; c.fillRect(x + 131, y + 85, 8, 12);

  [x, y, w, h] = P('h_apartments');
  fillR(c, x, y, w, h, '#a8d98f', 4);
  shadow(c, x + 25, y + 15, 160, 160);
  fillR(c, x + 25, y + 15, 160, 160, '#d98c5f');
  for (let k = 0; k < 30; k++) { c.fillStyle = 'rgba(0,0,0,.06)'; c.fillRect(x + 25, y + 18 + k * 5.3, 160, 1); }
  fillR(c, x + 20, y + 10, 170, 8, '#8d5236');
  fillR(c, x + 150, y, 22, 12, '#9e9e9e'); ell(c, x + 161, y, 11, 4, '#bdbdbd');
  winGrid(c, x + 25, y + 20, 160, 120, 5, 5, 16, 14);
  for (let r = 0; r < 5; r++) for (let k = 0; k < 5; k++) if ((r + k) % 2 === 0) { c.fillStyle = '#5d4037'; c.fillRect(x + 32 + k * 30.6, y + 37 + r * 22, 22, 2); }
  fillR(c, x + 85, y + 145, 40, 30, '#6d4c41', 3); fillR(c, x + 90, y + 150, 30, 25, '#90caf9', 2);
  signBoard(c, x + 70, y + 132, 70, 11, '#3e2723', '#ffe0b2', 'APARTMENTS', 8);
  bush(c, x + 40, y + 180, 6); bush(c, x + 170, y + 180, 6);

  [x, y, w, h] = P('park');
  fillR(c, x, y, w, h, '#9edb7e', 8);
  c.strokeStyle = '#e2cf9e'; c.lineWidth = 7; c.beginPath(); c.moveTo(x + w / 2 + 5, y + h); c.bezierCurveTo(x + w / 2 + 50, y + 140, x + 30, y + 120, x + 40, y + 30); c.stroke();
  c.beginPath(); c.moveTo(x + 90, y + 150); c.quadraticCurveTo(x + 150, y + 160, x + w - 5, y + 120); c.stroke();
  ell(c, x + 135, y + 70, 58, 38, '#3b8fd6'); ell(c, x + 135, y + 70, 50, 31, '#62b0ef');
  c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 1; for (let k = 0; k < 4; k++) { c.beginPath(); c.arc(x + 120 + k * 10, y + 62 + k * 5, 6, 0, Math.PI); c.stroke(); }
  // dock
  fillR(c, x + 165, y + 92, 30, 6, '#8d6e63');
  // playground
  fillR(c, x + 140, y + 125, 55, 45, '#f3d9a4', 4);
  c.strokeStyle = '#e53935'; c.lineWidth = 2; c.beginPath(); c.moveTo(x + 148, y + 160); c.lineTo(x + 155, y + 132); c.lineTo(x + 162, y + 160); c.moveTo(x + 155, y + 132); c.lineTo(x + 175, y + 132); c.moveTo(x + 168, y + 132); c.lineTo(x + 168, y + 145); c.moveTo(x + 175, y + 132); c.lineTo(x + 175, y + 145); c.stroke();
  c.strokeStyle = '#1e88e5'; c.beginPath(); c.moveTo(x + 180, y + 135); c.lineTo(x + 192, y + 160); c.stroke();
  // benches & flowers
  [[x + 70, y + 125], [x + 20, y + 160]].forEach(([bx, by]) => { fillR(c, bx, by, 18, 4, '#8d6e63'); fillR(c, bx, by - 4, 18, 2, '#6d4c41'); });
  flowers(c, x + 10, y + 12, 50, 18, rnd); flowers(c, x + 60, y + 170, 70, 16, rnd);
  circ(c, x + 40, y + 100, 9, '#cfd8dc'); circ(c, x + 40, y + 100, 5, '#81d4fa');

  [x, y, w, h] = P('jobcenter');
  fillR(c, x, y + h - 25, w, 25, '#cfd8dc');
  shadow(c, x + 10, y + 20, w - 20, h - 45);
  fillR(c, x + 10, y + 20, w - 20, h - 45, '#5c7a99');
  winGrid(c, x + 10, y + 40, w - 20, h - 95, 4, 5, 14, 12, '#a7d4f2', '#e3edf5');
  signBoard(c, x + 15, y + 23, w - 30, 14, '#ffb300', '#2a1a00', 'JOB CENTER', 9);
  fillR(c, x + w / 2 - 15, y + h - 50, 30, 25, '#cfe8fb', 2); c.fillStyle = '#5c7a99'; c.fillRect(x + w / 2 - 1, y + h - 50, 2, 25);
  bush(c, x + 18, y + h - 12, 6); bush(c, x + w - 18, y + h - 12, 6);

  [x, y, w, h] = P('office');
  shadow(c, x + 20, y + 5, w - 40, h - 20);
  const og = c.createLinearGradient(x + 20, 0, x + w - 20, 0); og.addColorStop(0, '#4b6584'); og.addColorStop(1, '#2d4059');
  fillR(c, x + 20, y + 5, w - 40, h - 20, og);
  winGrid(c, x + 20, y + 15, w - 40, h - 50, 5, 9, 11, 10, '#88c2ea', '#3c5470');
  fillR(c, x + 40, y - 3, w - 80, 10, '#34495e'); fillR(c, x + w / 2 - 1, y - 15, 2, 14, '#999'); circ(c, x + w / 2, y - 15, 2, '#e53935');
  fillR(c, x + w / 2 - 14, y + h - 40, 28, 25, '#cfe8fb', 2);
  signBoard(c, x + 28, y + h - 13, w - 56, 11, '#22313f', '#fff', 'OFFICE TOWER', 8);

  [x, y, w, h] = P('school');
  fillR(c, x, y, w, h, '#a5d68e', 4);
  shadow(c, x + 15, y + 30, w - 30, 70);
  fillR(c, x + 15, y + 30, w - 30, 70, '#b5523b');
  for (let k = 0; k < 14; k++) { c.fillStyle = 'rgba(0,0,0,.07)'; c.fillRect(x + 15, y + 33 + k * 5, w - 30, 1); }
  fillR(c, x + 15, y + 28, w - 30, 5, '#f1efe8');
  winGrid(c, x + 15, y + 35, 70, 60, 3, 2, 13, 14, '#bfe3f5', '#f1efe8'); winGrid(c, x + w - 85, y + 35, 70, 60, 3, 2, 13, 14, '#bfe3f5', '#f1efe8');
  fillR(c, x + w / 2 - 20, y + 8, 40, 92, '#c4644b');
  tri(c, [[x + w / 2 - 24, y + 10], [x + w / 2, y - 8], [x + w / 2 + 24, y + 10]], '#5d4037');
  circ(c, x + w / 2, y + 22, 9, '#fff'); c.strokeStyle = '#333'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x + w / 2, y + 22); c.lineTo(x + w / 2, y + 16); c.moveTo(x + w / 2, y + 22); c.lineTo(x + w / 2 + 5, y + 22); c.stroke();
  fillR(c, x + w / 2 - 10, y + 75, 20, 25, '#6b3e26', 3);
  signBoard(c, x + w / 2 - 24, y + 38, 48, 12, '#1a3a6b', '#ffd23f', 'COLLEGE', 8);
  fillR(c, x + 8, y + 5, 2, 30, '#777'); fillR(c, x + 10, y + 5, 16, 10, '#2f6fd6');
  for (let k = 0; k < 3; k++) fillR(c, x + w / 2 - 16 - k * 3, y + 100 + k * 3, 32 + k * 6, 3, '#d7ccc8');

  [x, y, w, h] = P('library');
  shadow(c, x + 20, y + 10, w - 40, 50);
  fillR(c, x + 20, y + 10, w - 40, 50, '#f0e6cc');
  tri(c, [[x + 15, y + 12], [x + w / 2, y - 4], [x + w - 15, y + 12]], '#cbb98f');
  for (let k = 0; k < 8; k++) fillR(c, x + 30 + k * 20, y + 16, 6, 40, '#fff');
  signBoard(c, x + w / 2 - 30, y + 3, 60, 10, '#6d4c41', '#fff', 'LIBRARY', 7);
  fillR(c, x + w / 2 - 8, y + 38, 16, 22, '#6b3e26', 2);
  WINDOWS.push([x + 30, y + 25, 10, 10], [x + w - 40, y + 25, 10, 10]);

  [x, y, w, h] = P('bank');
  shadow(c, x + 8, y + 30, w - 16, 60);
  fillR(c, x + 8, y + 30, w - 16, 60, '#e0e0e0');
  tri(c, [[x + 3, y + 32], [x + w / 2, y + 8], [x + w - 3, y + 32]], '#bdbdbd');
  txt(c, '$', x + w / 2, y + 22, '#2e7d32', 13, 900);
  for (let k = 0; k < 5; k++) fillR(c, x + 16 + k * 16, y + 36, 5, 50, '#fafafa');
  fillR(c, x + w / 2 - 8, y + 66, 16, 24, '#5d4037', 2);
  signBoard(c, x + w / 2 - 18, y + 34, 36, 10, '#2e7d32', '#fff', 'BANK', 7);

  [x, y, w, h] = P('realestate');
  fillR(c, x, y, w, h, '#9fd987', 4);
  shadow(c, x + 12, y + 30, w - 24, 55);
  fillR(c, x + 12, y + 30, w - 24, 55, '#fff8e1');
  fillR(c, x + 8, y + 24, w - 16, 8, '#00897b');
  win(c, x + 20, y + 45, 22, 18); win(c, x + w - 42, y + 45, 22, 18);
  fillR(c, x + w / 2 - 7, y + 62, 14, 23, '#00695c', 2);
  signBoard(c, x + 14, y + 34, w - 28, 9, '#00897b', '#fff', 'REAL ESTATE', 7);
  fillR(c, x + 5, y + 70, 2, 18, '#6d4c41'); signBoard(c, x + 1, y + 62, 22, 10, '#fff', '#c62828', 'SALE', 6);

  [x, y, w, h] = P('diner');
  fillR(c, x, y, w, h, '#b0bec5', 3);
  for (let k = 0; k < 6; k++) fillR(c, x + 130 + k * 13, y + 55, 2, 25, '#fff');
  shadow(c, x + 10, y + 12, 115, 60);
  fillR(c, x + 10, y + 12, 115, 60, '#f8bbd0', 8);
  fillR(c, x + 10, y + 40, 115, 4, '#c0c0c0');
  for (let k = 0; k < 10; k++) fillR(c, x + 10 + k * 11.5, y + 28, 11.5, 10, k % 2 ? '#fff' : '#e53935');
  winGrid(c, x + 12, y + 44, 110, 22, 5, 1, 15, 13, '#fff3c4', '#c0c0c0');
  circ(c, x + 145, y + 25, 17, '#e53935'); circ(c, x + 145, y + 25, 14, '#ffd23f'); txt(c, 'DINER', x + 145, y + 25, '#e53935', 8, 900);
  fillR(c, x + 144, y + 42, 2, 12, '#777');
  [[x + 175, y + 30], [x + 195, y + 55], [x + 175, y + 72]].forEach(([tx, ty]) => { circ(c, tx, ty, 6, '#fff'); circ(c, tx - 8, ty, 2.5, '#e53935'); circ(c, tx + 8, ty, 2.5, '#e53935'); });

  [x, y, w, h] = P('market');
  fillR(c, x, y, w, 30, '#6b7178');
  for (let k = 0; k < 12; k++) fillR(c, x + 10 + k * 21, y + 3, 2, 22, '#fff');
  carShape(c, x + 42, y + 15, '#1e88e5', false); carShape(c, x + 147, y + 15, '#43a047', false); carShape(c, x + 210, y + 15, '#fbc02d', false);
  shadow(c, x + 10, y + 35, w - 20, 58);
  fillR(c, x + 10, y + 35, w - 20, 58, '#fafafa');
  fillR(c, x + 10, y + 35, w - 20, 16, '#2e7d32');
  txt(c, '🛒 SUPERMARKET', x + w / 2, y + 43, '#fff', 10, 900);
  winGrid(c, x + 10, y + 52, w - 20, 40, 8, 1, 22, 26, '#d7f0fb', '#eeeeee');
  [x + 20, x + 30].forEach(cx => { strokeR(c, cx, y + 79, 8, 6, '#9e9e9e', 1.2); });

  [x, y, w, h] = P('mall');
  shadow(c, x + 5, y + 5, w - 10, 70);
  fillR(c, x + 5, y + 5, w - 10, 70, '#ece1f5');
  fillR(c, x + 5, y + 5, w - 10, 10, '#7e57c2');
  for (let k = 0; k < 6; k++) { fillR(c, x + 15 + k * 42, y + 22, 34, 30, ['#ffcdd2', '#c8e6c9', '#bbdefb', '#fff9c4', '#ffe0b2', '#d1c4e9'][k], 2); WINDOWS.push([x + 17 + k * 42, y + 24, 30, 26]); }
  fillR(c, x + w / 2 - 22, y + 50, 44, 25, '#b39ddb', 3); fillR(c, x + w / 2 - 18, y + 54, 36, 21, '#e3f2fd', 2);
  signBoard(c, x + w / 2 - 30, y + 30, 60, 15, '#7e57c2', '#fff', 'MALL', 11);
  for (let k = 0; k < 4; k++) { fillR(c, x + 30 + k * 65, y - 10, 1.5, 15, '#666'); tri(c, [[x + 31.5 + k * 65, y - 10], [x + 43 + k * 65, y - 6], [x + 31.5 + k * 65, y - 2]], ['#e53935', '#ffd23f', '#43a047', '#1e88e5'][k]); }

  [x, y, w, h] = P('sports');
  fillR(c, x, y, w, h, '#7cc96a', 4);
  signBoard(c, x + w / 2 - 45, y + 2, 90, 12, '#e65100', '#fff', 'SPORTS PARK', 8);
  // pool
  fillR(c, x + 8, y + 20, 85, 75, '#e0e0e0', 4); fillR(c, x + 13, y + 25, 75, 65, '#4fc3f7', 3);
  for (let k = 1; k < 5; k++) { c.strokeStyle = k % 2 ? '#fff' : '#e53935'; c.setLineDash([3, 3]); c.lineWidth = 1.2; c.beginPath(); c.moveTo(x + 13, y + 25 + k * 13); c.lineTo(x + 88, y + 25 + k * 13); c.stroke(); }
  c.setLineDash([]);
  // tennis
  fillR(c, x + 102, y + 20, 80, 75, '#2e7d6b', 3); fillR(c, x + 108, y + 26, 68, 63, '#4caf50');
  c.strokeStyle = '#fff'; c.lineWidth = 1.2; strokeR(c, x + 112, y + 30, 60, 55, '#fff', 1.2); c.beginPath(); c.moveTo(x + 112, y + 57.5); c.lineTo(x + 172, y + 57.5); c.moveTo(x + 142, y + 40); c.lineTo(x + 142, y + 75); c.stroke();
  c.strokeStyle = '#333'; c.lineWidth = 2; c.beginPath(); c.moveTo(x + 108, y + 57.5); c.lineTo(x + 176, y + 57.5); c.stroke();
  // basketball
  fillR(c, x + 190, y + 20, 75, 75, '#d9824b', 3);
  c.strokeStyle = '#fff'; c.lineWidth = 1.2; strokeR(c, x + 194, y + 24, 67, 67, '#fff', 1.2); c.beginPath(); c.moveTo(x + 194, y + 57.5); c.lineTo(x + 261, y + 57.5); c.stroke();
  c.beginPath(); c.arc(x + 227.5, y + 57.5, 9, 0, Math.PI * 2); c.stroke();
  circ(c, x + 227.5, y + 28, 3, '#ff7043'); circ(c, x + 227.5, y + 87, 3, '#ff7043');
  // soccer
  for (let k = 0; k < 8; k++) fillR(c, x + 273 + k * 17.5, y + 20, 17.5, 75, k % 2 ? '#43a047' : '#4caf50');
  c.strokeStyle = '#fff'; c.lineWidth = 1.2; strokeR(c, x + 276, y + 23, 134, 69, '#fff', 1.2);
  c.beginPath(); c.moveTo(x + 343, y + 23); c.lineTo(x + 343, y + 92); c.stroke(); c.beginPath(); c.arc(x + 343, y + 57.5, 11, 0, Math.PI * 2); c.stroke();
  strokeR(c, x + 276, y + 45, 14, 25, '#fff', 1.2); strokeR(c, x + 396, y + 45, 14, 25, '#fff', 1.2);
  // golf
  fillR(c, x + 420, y + 20, 82, 75, '#66bb6a', 3);
  ell(c, x + 465, y + 55, 28, 20, '#8bd17c'); ell(c, x + 435, y + 82, 12, 6, '#f2dfa1');
  fillR(c, x + 470, y + 35, 1.5, 20, '#555'); tri(c, [[x + 471.5, y + 35], [x + 484, y + 39], [x + 471.5, y + 43]], '#e53935'); circ(c, x + 471, y + 55, 2, '#222');
  // running track hint
  c.strokeStyle = '#c0573e'; c.lineWidth = 3; rr(c, x + 3, y + 16, w - 6, h - 19, 10); c.stroke();

  [x, y, w, h] = P('theater');
  shadow(c, x + 8, y + 12, w - 16, 80);
  fillR(c, x + 8, y + 12, w - 16, 80, '#7b1f2e');
  fillR(c, x + 3, y + 30, w - 6, 18, '#ffd23f', 2); txt(c, 'THEATER', x + w / 2, y + 39, '#7b1f2e', 10, 900);
  for (let k = 0; k < 12; k++) circ(c, x + 7 + k * 8, y + 28, 1.5, '#fff8b0');
  fillR(c, x + 15, y + 55, 18, 26, '#263238', 1); fillR(c, x + w - 33, y + 55, 18, 26, '#263238', 1);
  txt(c, '🎬', x + 24, y + 68, '#fff', 11); txt(c, '🎭', x + w - 24, y + 68, '#fff', 11);
  fillR(c, x + w / 2 - 10, y + 60, 20, 32, '#3e0f16', 2);

  [x, y, w, h] = P('cars');
  fillR(c, x, y, w, h, '#90a4ae', 3);
  shadow(c, x + 45, y + 8, 50, 45);
  fillR(c, x + 45, y + 8, 50, 45, '#eceff1'); fillR(c, x + 48, y + 22, 44, 28, '#b3e5fc', 2); WINDOWS.push([x + 48, y + 22, 44, 28]);
  signBoard(c, x + 40, y + 10, 60, 10, '#1565c0', '#fff', 'CARS & BIKES', 6);
  carShape(c, x + 20, y + 25, '#e53935'); carShape(c, x + 20, y + 50, '#1e88e5'); carShape(c, x + 55, y + 75, '#43a047'); carShape(c, x + 82, y + 75, '#fbc02d');
  c.strokeStyle = '#222'; c.lineWidth = 1.2; [x + 10, x + 30].forEach(bx => { c.beginPath(); c.arc(bx, y + 88, 4, 0, Math.PI * 2); c.arc(bx + 12, y + 88, 4, 0, Math.PI * 2); c.stroke(); });
  for (let k = 0; k < 5; k++) tri(c, [[x + 5 + k * 20, y + 2], [x + 15 + k * 20, y + 2], [x + 10 + k * 20, y + 8]], ['#e53935', '#ffd23f', '#43a047', '#1e88e5', '#e53935'][k]);

  [x, y, w, h] = P('construction');
  fillR(c, x, y, w, h, '#c9a26b', 3);
  for (let k = 0; k < 40; k++) circ(c, x + rnd() * w, y + rnd() * h, 1.5, '#a9844f');
  c.strokeStyle = '#8d6e63'; c.lineWidth = 2;
  for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(x + 15 + k * 18, y + 30); c.lineTo(x + 15 + k * 18, y + 90); c.stroke(); }
  for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(x + 15, y + 30 + k * 20); c.lineTo(x + 69, y + 30 + k * 20); c.stroke(); }
  c.strokeStyle = '#fbc02d'; c.lineWidth = 3;
  c.beginPath(); c.moveTo(x + 95, y + 95); c.lineTo(x + 95, y + 8); c.lineTo(x + 30, y + 8); c.moveTo(x + 95, y + 8); c.lineTo(x + 112, y + 8); c.stroke();
  c.lineWidth = 1; c.strokeStyle = '#333'; c.beginPath(); c.moveTo(x + 45, y + 8); c.lineTo(x + 45, y + 22); c.stroke(); fillR(c, x + 40, y + 22, 10, 6, '#6d4c41');
  fillR(c, x + 105, y + 5, 8, 8, '#555');
  [[x + 80, y + 92], [x + 108, y + 92]].forEach(([cx, cy]) => { tri(c, [[cx, cy - 8], [cx - 4, cy], [cx + 4, cy]], '#ff6f00'); fillR(c, cx - 2.5, cy - 5, 5, 1.5, '#fff'); });
  signBoard(c, x + 5, y + 2, 20, 10, '#fbc02d', '#000', '⚠', 8);

  [x, y, w, h] = P('warehouse');
  shadow(c, x + 5, y + 10, w - 10, 60);
  fillR(c, x + 5, y + 10, w - 10, 60, '#90a4ae');
  for (let k = 0; k < 24; k++) fillR(c, x + 7 + k * 5, y + 12, 1, 56, 'rgba(0,0,0,.15)');
  [x + 15, x + 50, x + 85].forEach(dx => fillR(c, dx, y + 38, 26, 32, '#607d8b', 1));
  signBoard(c, x + 25, y + 17, 80, 13, '#37474f', '#fff', 'WAREHOUSE', 8);
  fillR(c, x + 10, y + 74, 40, 20, '#eceff1', 2); fillR(c, x + 50, y + 80, 14, 14, '#1565c0', 2);
  [[x + 85, y + 82], [x + 97, y + 82], [x + 91, y + 72]].forEach(([bx, by]) => { fillR(c, bx, by, 11, 10, '#bc8f5a'); c.fillStyle = '#8d6e3f'; c.fillRect(bx + 5, by, 1, 10); });

  // ---------- trees everywhere they fit ----------
  const blocked = (tx, ty, pad) => {
    if (tx < 8 || tx > MAP_W - 8 || ty < 14 || ty > MAP_H - 4) return true;
    if (Math.abs(tx - RIVER_X) < 50) return true;
    if (H_ROADS.some(ry => Math.abs(ty - ry) < ROAD_W / 2 + 8 + pad) && tx > 0) return true;
    if (V_ROADS.some(rx => Math.abs(tx - rx) < ROAD_W / 2 + 8 + pad && ty > H_ROADS[0] - 30 && ty < H_ROADS[2] + 30)) return true;
    return Object.values(PLACES).some(p => tx > p.r[0] - pad && tx < p.r[0] + p.r[2] + pad && ty > p.r[1] - pad && ty < p.r[1] + p.r[3] + pad + 8);
  };
  const spots = [];
  for (let i = 0; i < 2500 && spots.length < 140; i++) {
    const tx = rnd() * MAP_W, ty = rnd() * MAP_H;
    if (!blocked(tx, ty, 6) && spots.every(s => dist(s, [tx, ty]) > 15)) spots.push([tx, ty]);
  }
  spots.sort((a, b) => a[1] - b[1]).forEach(([tx, ty]) => rnd() < 0.3 ? pine(c, tx, ty, 8 + rnd() * 3) : tree(c, tx, ty, 8 + rnd() * 4, rnd));
  finishLighting(c, rnd);
  // trees inside the park
  [[PLACES.park.r[0] + 20, PLACES.park.r[1] + 60], [PLACES.park.r[0] + 200, PLACES.park.r[1] + 40], [PLACES.park.r[0] + 110, PLACES.park.r[1] + 175],
   [PLACES.park.r[0] + 25, PLACES.park.r[1] + 140], [PLACES.park.r[0] + 195, PLACES.park.r[1] + 85]].forEach(([tx, ty]) => tree(c, tx, ty, 11, rnd));
}

// shading on every building, sunlight from the top-left, and a little film grain
function finishLighting(c, rnd) {
  SHADE.forEach(([x, y, w, h]) => {
    const g = c.createLinearGradient(x, 0, x + w, 0);
    g.addColorStop(0, 'rgba(255,255,240,.10)'); g.addColorStop(0.5, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,20,.16)');
    c.fillStyle = g; c.fillRect(x, y, w, h);
    const v = c.createLinearGradient(0, y, 0, y + h);
    v.addColorStop(0, 'rgba(255,255,255,.06)'); v.addColorStop(0.8, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.12)');
    c.fillStyle = v; c.fillRect(x, y, w, h);
  });
  const sun = c.createLinearGradient(0, 0, MAP_W, MAP_H);
  sun.addColorStop(0, 'rgba(255,245,200,.12)'); sun.addColorStop(0.5, 'rgba(255,255,255,0)'); sun.addColorStop(1, 'rgba(0,20,40,.12)');
  c.fillStyle = sun; c.fillRect(0, 0, MAP_W, MAP_H);
  for (let i = 0; i < 14000; i++) {
    c.fillStyle = rnd() < 0.5 ? 'rgba(255,255,255,.035)' : 'rgba(0,0,0,.045)';
    c.fillRect(rnd() * MAP_W, rnd() * MAP_H, 1, 1);
  }
}

// ---------- travel ----------
function transportFor(len) {
  if ((has('car') || has('newcar')) && S.skills.drive >= 20) return { how: 'drove', icon: '🚙', speed: 3000, cost: 0, wait: 0 };
  if (has('bike')) return { how: 'biked', icon: '🚲', speed: 1500, cost: 0, wait: 0 };
  const fare = len > 2500 ? 8 : 2;
  if (len > 350 && S.money >= fare) return { how: 'took the bus', icon: '🚌', speed: len > 2500 ? 2800 : 2200, cost: fare, wait: 0.15 };
  return { how: 'walked', icon: '🚶', speed: 800, cost: 0, wait: 0 };
}
function travelInfo(fromLoc, toLoc) {
  const path = findPath(fromLoc, toLoc);
  const len = pathLength(path);
  const tr = transportFor(len);
  const hours = len < 5 ? 0 : Math.max(0.1, len / tr.speed + tr.wait);
  return { path, len, hours, ...tr };
}
function travelTime(h) { const m = Math.round(h * 60); return m >= 60 ? `${Math.floor(m / 60)} hr ${m % 60 ? (m % 60) + ' min' : ''}` : `${m} min`; }

function travelTo(dest, opts = {}) {
  return new Promise(resolve => {
    if (!S || traveler) return resolve(false);
    if (placeId(dest) === placeId(S.loc)) { S.loc = dest; if (!opts.keepTab) tab = dest; render(); return resolve(true); }
    const info = travelInfo(S.loc, dest);
    document.body.classList.add('traveling');
    cam.follow = true;
    traveler = { path: info.path, len: info.len, t: 0, dur: Math.max(0.7, Math.min(4.5, info.len / 700)), icon: info.icon, resolve: () => {
      document.body.classList.remove('traveling');
      if (info.cost) charge(info.cost, 'Bus fare');
      S.loc = dest;
      if (dest === 'home') S.doorOpen = false;   // you arrive outside your front door
      else S.insideOf = null;                       // ...or outside the building's door
      pass(info.hours, 'awake');
      if (!opts.quiet) log(`${info.icon} You ${info.how} to ${locName(dest)} (${travelTime(info.hours)}${info.cost ? `, $${info.cost}` : ''}).`);
      if (!opts.keepTab) tab = dest;
      if (!opts.noDone) done();
      resolve(true);
    } };
  });
}
