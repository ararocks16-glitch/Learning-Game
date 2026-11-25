// ===================== THE BIG WORLD =====================
// The town sits in the middle of a land 100 times bigger (10x wider, 10x taller):
// farmland, forests, lakes, mountains, a village, and an ocean with a beach.
// The land is drawn in tiles ("chunks") only when you look at them.

const WORLD = { x0: -5400, y0: -3420, x1: 6600, y1: 4180 };
const TOWN = { x: 0, y: 0, w: MAP_W, h: MAP_H, cx: 600, cy: 380 };
const TOWN_NAMES = [{ name: '🏙️ Maple Town', x: TOWN.cx, y: TOWN.cy, box: [0, 0, MAP_W, MAP_H] }];
const CHUNK = 512;

// ---------- noise ----------
function h2(x, y, s = 0) {
  let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s | 0, 982451653)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
function vnoise(x, y, sc, s) {
  const fx = x / sc, fy = y / sc, ix = Math.floor(fx), iy = Math.floor(fy), tx = fx - ix, ty = fy - iy;
  const sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty);
  const a = h2(ix, iy, s), b = h2(ix + 1, iy, s), c = h2(ix, iy + 1, s), d = h2(ix + 1, iy + 1, s);
  return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
}
function fbm(x, y, s) { return vnoise(x, y, 900, s) * 0.55 + vnoise(x, y, 330, s + 1) * 0.3 + vnoise(x, y, 110, s + 2) * 0.15; }
const clamp01 = v => Math.max(0, Math.min(1, v));

// ---------- the shape of the land ----------
function riverX(y) {
  const base = RIVER_X + Math.sin(y / 70) * 9 + Math.sin(y / 23) * 3;   // same as in town
  const far = clamp01((Math.abs(y - 380) - 520) / 900);
  if (y > 380) return base - far * (380 + Math.sin(y / 500) * 110);   // south: bend west, away from the beach road
  return base + far * (Math.sin(y / 650) * 300 + Math.sin(y / 1700 + 1) * 420);
}
function coastY(x) { return 3260 + Math.sin(x / 600) * 110 + Math.sin(x / 170) * 28; }
function mountainY(x) { return -2150 + Math.sin(x / 520) * 140 + Math.sin(x / 190) * 40; }
const LAKES = [
  { x: -3000, y: -1400, rx: 560, ry: 220 },
  { x: 5250, y: -650, rx: 320, ry: 190 },
  { x: -1500, y: 2250, rx: 270, ry: 150 },
  { x: 2600, y: 1800, rx: 200, ry: 120 },
];
function lakeVal(x, y) {
  let best = 9;
  for (const l of LAKES) {
    const dx = (x - l.x) / l.rx, dy = (y - l.y) / l.ry;
    best = Math.min(best, dx * dx + dy * dy - 1 + (vnoise(x, y, 90, 7) - 0.5) * 0.35);
  }
  return best;
}
const CAMP = [-3700, 1050];
// biome codes
const B = { GRASS: 0, FOREST: 1, FARM: 2, SAND: 3, OCEAN: 4, LAKE: 5, ROCK: 6, SNOW: 7, HILL: 8, SHORE: 9 };
function biome(x, y) {
  const cy = coastY(x);
  if (y > cy) return B.OCEAN;
  if (y > cy - 270) return B.SAND;
  const lv = lakeVal(x, y);
  if (lv < 0) return B.LAKE;
  if (lv < 0.12) return B.SHORE;
  const m = mountainY(x);
  if (y < m - 950) return B.SNOW;
  if (y < m - 260) return B.ROCK;
  if (y < m) return B.HILL;
  const f = fbm(x, y, 3);
  const nearCamp = Math.hypot(x - CAMP[0], y - CAMP[1]) < 1000;
  if (f > 0.6 || (nearCamp && f > 0.38)) return B.FOREST;
  if (x < -1800 && vnoise(x, y, 700, 11) > 0.45) return B.FARM;
  if (x > 4600 && y > 600 && vnoise(x, y, 600, 12) > 0.55) return B.FARM;
  return B.GRASS;
}
function biomeColor(x, y, b) {
  const n = vnoise(x, y, 70, 5) - 0.5, n2 = vnoise(x, y, 260, 9) - 0.5;
  switch (b) {
    case B.GRASS: return [124 + n * 26 + n2 * 20, 194 + n * 18 + n2 * 14, 102 + n * 16];
    case B.FOREST: return [66 + n * 18, 128 + n * 20, 60 + n * 14];
    case B.HILL: return [108 + n * 20, 156 + n * 18, 88 + n * 12];
    case B.FARM: return [150 + n * 20, 176 + n * 16, 96 + n * 10];
    case B.SHORE: return [214 + n * 14, 200 + n * 12, 150];
    case B.SAND: { const d = coastY(x) - y; return d < 12 ? [246, 238, 210] : [234 + n * 12, 214 + n * 12, 160 + n * 10]; }
    case B.OCEAN: { const d = clamp01((y - coastY(x)) / 420); return d < 0.03 ? [225, 244, 250] : [100 - d * 70 + n * 10, 186 - d * 90 + n * 10, 226 - d * 60]; }
    case B.LAKE: { const d = clamp01(-lakeVal(x, y)); return [96 - d * 40, 172 - d * 50, 222 - d * 30]; }
    case B.ROCK: return [132 + n * 30, 126 + n * 28, 118 + n * 24];
    case B.SNOW: return [238 + n * 10, 242 + n * 8, 248];
  }
  return [124, 194, 102];
}

// ---------- highways out of town ----------
function addNode(x, y) { let i = nodeAt(x, y); if (i < 0) { NODES.push([x, y]); i = NODES.length - 1; } return i; }
function road(a, b) { EDGES.push([addNode(...a), addNode(...b)]); }
const TOWN_EDGE_COUNT = EDGES.length;
road([330, 170], [330, -1000]); road([330, -1000], [330, -1600]); road([330, -1600], [330, -2250]);
road([330, -1600], [3600, -1600]); road([3600, -1600], [3600, 400]);
road([1175, 400], [3600, 400]); road([3600, 400], [4300, 400]); road([4300, 400], [4300, 1500]);
road([330, -1000], [-3000, -1000]); road([-3000, -1000], [-3000, 400]);
road([25, 400], [-3000, 400]); road([-3000, 400], [-3700, 400]); road([-3700, 400], [-3700, 900]);
road([870, 630], [870, 2900]); road([870, 2900], [1900, 2900]);
const isTownNode = i => NODES[i][0] >= 0 && NODES[i][0] <= MAP_W && NODES[i][1] >= 0 && NODES[i][1] <= MAP_H;

// ---------- new places far from town ----------
Object.assign(PLACES, {
  beach:      { kind: 'place', far: true, name: 'Sunny Beach',        icon: '🏖️', r: [1730, 2920, 340, 200], door: [1900, 2918] },
  trailhead:  { kind: 'place', far: true, name: 'Snowy Peak Trail',   icon: '🏔️', r: [220, -2440, 220, 172], door: [330, -2266] },
  village:    { kind: 'place', far: true, name: 'Riverside Village',  icon: '🧺', r: [3460, -1810, 280, 172], door: [3600, -1620] },
  lake:       { kind: 'place', far: true, name: 'Crystal Lake',       icon: '🎣', r: [-3130, -1160, 260, 142], door: [-3000, -1016] },
  campground: { kind: 'place', far: true, name: 'Pine Forest Camp',   icon: '🏕️', r: [-3880, 916, 360, 210], door: [-3700, 914] },
  zoo:        { kind: 'place', far: true, name: 'Wildlife Park',      icon: '🦒', r: [4130, 1516, 340, 240], door: [4300, 1514] },
});

// ---------- things placed around the world ----------
const VHOUSES = [];   // village and farm houses
(function makeHouses() {
  const r = seeded(321);
  const add = (x, y) => {
    const box = [x, y, 84, 66];
    if (Object.values(PLACES).some(p => overlap(box, p.r, 12))) return;
    VHOUSES.push({ x, y, w: 84, h: 66, wall: ['#f7d794', '#a7d8f0', '#f8c6c6', '#d6f0b5', '#e4d4f7', '#fde2b8', '#f2f2f2'][Math.floor(r() * 7)], roof: ['#c0392b', '#34495e', '#8e44ad', '#2c7a4b', '#7f5539', '#b03a2e'][Math.floor(r() * 6)], seed: r() });
  };
  for (let x = 2950; x < 4300; x += 104) { if (Math.abs(x + 42 - 3600) < 70) continue; add(x, -1600 - 22 - 66 - 6); add(x, -1600 + 26); }
  for (let y = -1450; y < 300; y += 96) { if (y > -900 && y < -100) continue; add(3600 - 22 - 84 - 6, y); add(3600 + 26, y); }
  for (let y = -900; y < 300; y += 150) add(-3000 + 26, y);
  for (let x = -2700; x < -300; x += 260) add(x, 400 + 26);
  for (let y = 1000; y < 2800; y += 210) add(870 + 26, y);
})();
function overlap(a, b, pad = 0) { return a[0] < b[0] + b[2] + pad && a[0] + a[2] > b[0] - pad && a[1] < b[1] + b[3] + pad && a[1] + a[3] > b[1] - pad; }
function distToSeg(px, py, A, B2) {
  const dx = B2[0] - A[0], dy = B2[1] - A[1];
  const t = clamp01(((px - A[0]) * dx + (py - A[1]) * dy) / (dx * dx + dy * dy || 1));
  return Math.hypot(px - A[0] - dx * t, py - A[1] - dy * t);
}
function nearRoad(x, y, d) {
  for (let i = TOWN_EDGE_COUNT; i < EDGES.length; i++) if (distToSeg(x, y, NODES[EDGES[i][0]], NODES[EDGES[i][1]]) < d) return true;
  return false;
}

const MOUNTAINS = [];
(function makeMountains() {
  for (let row = 3; row >= 0; row--) {
    for (let x = WORLD.x0 - 100; x < WORLD.x1 + 100; x += 170) {
      const j = h2(x, row, 77);
      const mx = x + (j - 0.5) * 120;
      const yb = mountainY(mx) - 280 - row * 240 - h2(x, row, 78) * 90;
      const H = 220 + h2(x, row, 79) * 300 + row * 40;
      const W = H * (1.4 + h2(x, row, 80) * 0.5);
      MOUNTAINS.push({ x: mx, yb, H, W, tilt: (h2(x, row, 81) - 0.5) * 0.3 });
    }
  }
  MOUNTAINS.sort((a, b) => a.yb - b.yb);
})();

// trees, rocks and fields in a 128x128 cell (always the same for the same cell)
const CELL = 128;
const fieldCache = new Map();
function fieldBox(gx, gy) {   // gx, gy = top-left cell of a 2x2 block (both even)
  const key = gx + ',' + gy;
  if (fieldCache.has(key)) return fieldCache.get(key);
  const cx = gx * CELL, cy = gy * CELL;
  let f = null;
  if (biome(cx + 128, cy + 128) === B.FARM && biome(cx + 40, cy + 40) === B.FARM && biome(cx + 216, cy + 216) === B.FARM &&
      !nearRoad(cx + 128, cy + 128, 150) && Math.abs(cx + 128 - riverX(cy + 128)) > 190 &&
      !Object.values(PLACES).some(p => p.far && overlap([cx, cy, 256, 256], p.r, 20))) {
    const crops = ['#d9c36a', '#7fb04f', '#a77b4f', '#a9cf6a', '#c9a54a', '#6f9d3e'];
    f = { t: 'field', box: [cx + 12, cy + 12, CELL * 2 - 24, CELL * 2 - 24], col: crops[Math.floor(h2(gx, gy, 51) * crops.length)], rows: h2(gx, gy, 52) < 0.5, barn: h2(gx, gy, 53) < 0.18 };
    f.x = f.box[0]; f.y = f.box[1] - 1000;
  }
  fieldCache.set(key, f);
  return f;
}
const fieldAt = (x, y) => { const gx = Math.floor(x / CELL / 2) * 2, gy = Math.floor(y / CELL / 2) * 2; const f = fieldBox(gx, gy); return f && overlap([x - 6, y - 6, 12, 12], f.box, 4); };
const cellCache = new Map();
function cellStuff(gx, gy) {
  const key = gx + ',' + gy;
  if (cellCache.has(key)) return cellCache.get(key);
  const out = [];
  let s = Math.floor(h2(gx, gy, 41) * 2147483646) + 1;
  const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const cx = gx * CELL, cy = gy * CELL;
  const b0 = biome(cx + 64, cy + 64);
  const tries = b0 === B.FOREST ? 9 : b0 === B.HILL ? 4 : b0 === B.GRASS ? 2 : b0 === B.FARM ? 1 : b0 === B.SAND ? 1 : b0 === B.ROCK ? 2 : 0;
  for (let i = 0; i < tries; i++) {
    const x = cx + rnd() * CELL, y = cy + rnd() * CELL;
    const bb = biome(x, y);
    const roll = rnd();
    if (x > TOWN.x - 30 && x < TOWN.x + TOWN.w + 30 && y > TOWN.y - 30 && y < TOWN.y + TOWN.h + 30) continue;
    if (Math.abs(x - riverX(y)) < 48 && y < coastY(x) + 10) continue;
    if (nearRoad(x, y, 30)) continue;
    if (Object.values(PLACES).some(p => p.far && overlap([x - 10, y - 30, 20, 34], p.r, 14))) continue;
    if (VHOUSES.some(h => overlap([x - 10, y - 30, 20, 34], [h.x, h.y, h.w, h.h], 8))) continue;
    if (fieldAt(x, y)) continue;
    if (bb === B.FOREST) out.push({ x, y, t: roll < 0.4 ? 'pine' : 'tree', s: 9 + rnd() * 6, k: rnd() });
    else if (bb === B.HILL) out.push({ x, y, t: 'pine', s: 9 + rnd() * 5, k: rnd() });
    else if (bb === B.GRASS) { if (roll < 0.35) out.push({ x, y, t: 'tree', s: 9 + rnd() * 5, k: rnd() }); else if (roll < 0.5) out.push({ x, y, t: 'bush', s: 5 + rnd() * 3, k: rnd() }); else if (roll < 0.58) out.push({ x, y, t: 'rock', s: 4 + rnd() * 5, k: rnd() }); }
    else if (bb === B.FARM) { if (roll < 0.25) out.push({ x, y, t: 'tree', s: 10, k: rnd() }); }
    else if (bb === B.SAND) { if (roll < 0.35 && coastY(x) - y > 40) out.push({ x, y, t: 'palm', s: 12 + rnd() * 4, k: rnd() }); }
    else if (bb === B.ROCK) { if (roll < 0.5) out.push({ x, y, t: 'rock', s: 6 + rnd() * 8, k: rnd() }); }
  }
  // farm fields
  if (gx % 2 === 0 && gy % 2 === 0) { const f = fieldBox(gx, gy); if (f) out.push(f); }
  cellCache.set(key, out);
  return out;
}

// ---------- drawing helpers for the world ----------
function wTree(c, x, y, s, k, lod) {
  if (lod === 0) { c.fillStyle = 'rgba(20,45,20,.25)'; c.beginPath(); c.ellipse(x + s * 0.6, y + 1, s * 1.1, s * 0.45, 0, 0, Math.PI * 2); c.fill(); }
  c.fillStyle = '#6b4527'; c.fillRect(x - s * 0.12, y - s * 0.6, s * 0.24, s * 0.62);
  const base = [[58, 128, 52], [66, 140, 58], [48, 112, 46], [82, 146, 62]][Math.floor(k * 4)];
  const blob = (bx, by, r) => {
    if (lod === 0) {
      const g = c.createRadialGradient(bx - r * 0.4, by - r * 0.4, r * 0.1, bx, by, r);
      g.addColorStop(0, `rgb(${base[0] + 50},${base[1] + 45},${base[2] + 25})`); g.addColorStop(0.6, `rgb(${base})`); g.addColorStop(1, `rgb(${base[0] - 25},${base[1] - 35},${base[2] - 20})`);
      c.fillStyle = g;
    } else c.fillStyle = `rgb(${base})`;
    c.beginPath(); c.arc(bx, by, r, 0, Math.PI * 2); c.fill();
  };
  blob(x - s * 0.45, y - s * 0.6, s * 0.55); blob(x + s * 0.45, y - s * 0.62, s * 0.55); blob(x, y - s * 0.98, s * 0.7);
}
function wPine(c, x, y, s, lod) {
  if (lod === 0) { c.fillStyle = 'rgba(20,45,20,.25)'; c.beginPath(); c.ellipse(x + s * 0.5, y + 1, s * 0.75, s * 0.3, 0, 0, Math.PI * 2); c.fill(); }
  c.fillStyle = '#5e3c22'; c.fillRect(x - 1.5, y - 4, 3, 5);
  tri(c, [[x, y - s * 1.7], [x - s * 0.62, y - s * 0.25], [x + s * 0.62, y - s * 0.25]], '#1f6b35');
  tri(c, [[x, y - s * 2.1], [x - s * 0.46, y - s * 0.9], [x + s * 0.46, y - s * 0.9]], '#27803f');
  if (lod === 0) tri(c, [[x, y - s * 2.1], [x + s * 0.62, y - s * 0.25], [x, y - s * 0.5]], 'rgba(0,0,0,.15)');
}
function wPalm(c, x, y, s) {
  c.strokeStyle = '#8a6a43'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + 4, y - s * 0.8, x + 2, y - s * 1.6); c.stroke();
  c.strokeStyle = '#3f8f3f'; c.lineWidth = 2.6;
  for (let a = 0; a < 6; a++) { const ang = a * 1.05; c.beginPath(); c.moveTo(x + 2, y - s * 1.6); c.quadraticCurveTo(x + 2 + Math.cos(ang) * s * 0.6, y - s * 1.9 + Math.sin(ang) * s * 0.2, x + 2 + Math.cos(ang) * s * 0.9, y - s * 1.35 + Math.abs(Math.sin(ang)) * s * 0.2); c.stroke(); }
  circ(c, x + 1, y - s * 1.55, 2, '#6b4a2a');
}
function wRock(c, x, y, s) {
  const g = c.createLinearGradient(x - s, y - s, x + s, y);
  g.addColorStop(0, '#b8b4ac'); g.addColorStop(1, '#6f6b64');
  c.fillStyle = g; c.beginPath(); c.moveTo(x - s, y); c.lineTo(x - s * 0.7, y - s * 0.7); c.lineTo(x + s * 0.2, y - s); c.lineTo(x + s, y - s * 0.4); c.lineTo(x + s * 0.9, y); c.closePath(); c.fill();
}
function wField(c, f, lod) {
  const [x, y, w, h] = f.box;
  fillR(c, x, y, w, h, f.col, 3);
  if (lod === 0) {
    c.strokeStyle = 'rgba(60,40,10,.22)'; c.lineWidth = 2;
    for (let k = 6; k < (f.rows ? h : w); k += 9) { c.beginPath(); if (f.rows) { c.moveTo(x + 3, y + k); c.lineTo(x + w - 3, y + k); } else { c.moveTo(x + k, y + 3); c.lineTo(x + k, y + h - 3); } c.stroke(); }
    c.strokeStyle = '#8b6b45'; c.lineWidth = 1.5; c.strokeRect(x - 3, y - 3, w + 6, h + 6);
  }
  if (f.barn) {
    const bx = x + w - 70, by = y + 10;
    fillR(c, bx, by + 22, 56, 40, '#b03a2a'); tri(c, [[bx - 4, by + 24], [bx + 28, by], [bx + 60, by + 24]], '#7d2a1f');
    fillR(c, bx + 18, by + 36, 20, 26, '#f2f2f2'); fillR(c, bx + 20, by + 38, 16, 24, '#8e2c20');
    fillR(c, bx + 60, by + 4, 14, 58, '#b0bec5', 3);
  }
}
function wMountain(c, m, lod) {
  const { x, yb, H, W, tilt } = m;
  const px = x + tilt * W * 0.3, py = yb - H;
  // shadow side and lit side
  c.fillStyle = '#5f5b55';
  c.beginPath(); c.moveTo(px, py); c.lineTo(x + W / 2, yb); c.lineTo(px + W * 0.05, yb); c.closePath(); c.fill();
  const g = c.createLinearGradient(x - W / 2, py, px, yb);
  g.addColorStop(0, '#a9a49b'); g.addColorStop(1, '#8a857c');
  c.fillStyle = g;
  c.beginPath(); c.moveTo(x - W / 2, yb); c.lineTo(x - W * 0.22, yb - H * 0.45); c.lineTo(px, py); c.lineTo(px + W * 0.05, yb); c.closePath(); c.fill();
  if (lod === 0) {
    c.strokeStyle = 'rgba(60,55,50,.35)'; c.lineWidth = 1.5;
    for (let k = 1; k < 5; k++) { c.beginPath(); c.moveTo(px + (k - 2.5) * 6, py + H * k * 0.18); c.lineTo(px + (k - 2.5) * 20, py + H * (k * 0.18 + 0.14)); c.stroke(); }
  }
  if (py < -2450 || H > 380) {   // snow cap
    const sh = H * 0.3;
    c.fillStyle = '#f5f8fb';
    c.beginPath(); c.moveTo(px, py);
    const lx = px - (px - (x - W / 2)) * 0.3, rx = px + ((x + W / 2) - px) * 0.3;
    c.lineTo(rx, py + sh); c.lineTo(px + (rx - px) * 0.5, py + sh * 0.75); c.lineTo(px, py + sh * 0.95); c.lineTo(px - (px - lx) * 0.5, py + sh * 0.7); c.lineTo(lx, py + sh); c.closePath(); c.fill();
    c.fillStyle = 'rgba(160,180,200,.5)'; c.beginPath(); c.moveTo(px, py); c.lineTo(rx, py + sh); c.lineTo(px + (rx - px) * 0.5, py + sh * 0.75); c.closePath(); c.fill();
  }
}
function drawRoads(c, x0, y0, x1, y1, lod) {
  const RW2 = 28;
  for (let i = 0; i < EDGES.length; i++) {
    const A = NODES[EDGES[i][0]], B2 = NODES[EDGES[i][1]];
    const rx = Math.min(A[0], B2[0]) - RW2, ry = Math.min(A[1], B2[1]) - RW2, rw = Math.abs(A[0] - B2[0]) + RW2 * 2, rh = Math.abs(A[1] - B2[1]) + RW2 * 2;
    if (!overlap([rx, ry, rw, rh], [x0, y0, x1 - x0, y1 - y0])) continue;
    const horiz = A[1] === B2[1];
    c.fillStyle = '#c9c4b8';
    if (horiz) c.fillRect(rx + 10, A[1] - RW2 / 2 - 3, rw - 20, RW2 + 6); else c.fillRect(A[0] - RW2 / 2 - 3, ry + 10, RW2 + 6, rh - 20);
    c.fillStyle = '#4d535b';
    if (horiz) c.fillRect(rx + 12, A[1] - RW2 / 2, rw - 24, RW2); else c.fillRect(A[0] - RW2 / 2, ry + 12, RW2, rh - 24);
    if (lod <= 1) {
      c.strokeStyle = 'rgba(240,240,230,.8)'; c.lineWidth = 1.2;
      c.beginPath();
      if (horiz) { c.moveTo(rx + 14, A[1] - RW2 / 2 + 2); c.lineTo(rx + rw - 14, A[1] - RW2 / 2 + 2); c.moveTo(rx + 14, A[1] + RW2 / 2 - 2); c.lineTo(rx + rw - 14, A[1] + RW2 / 2 - 2); }
      else { c.moveTo(A[0] - RW2 / 2 + 2, ry + 14); c.lineTo(A[0] - RW2 / 2 + 2, ry + rh - 14); c.moveTo(A[0] + RW2 / 2 - 2, ry + 14); c.lineTo(A[0] + RW2 / 2 - 2, ry + rh - 14); }
      c.stroke();
      c.strokeStyle = '#f2d34a'; c.lineWidth = 2; c.setLineDash([12, 10]);
      c.beginPath(); c.moveTo(A[0], A[1]); c.lineTo(B2[0], B2[1]); c.stroke(); c.setLineDash([]);
    }
    // bridges where the road crosses the river
    const spans = [];
    if (horiz) { const xr = riverX(A[1]); if (xr > Math.min(A[0], B2[0]) && xr < Math.max(A[0], B2[0])) spans.push([xr - 38, A[1], xr + 38, A[1]]); }
    else {
      let inside = false, start = 0;
      for (let y = Math.min(A[1], B2[1]); y <= Math.max(A[1], B2[1]); y += 6) {
        const on = Math.abs(riverX(y) - A[0]) < 36;
        if (on && !inside) { inside = true; start = y; } if (!on && inside) { inside = false; spans.push([A[0], start - 14, A[0], y + 14]); }
      }
    }
    spans.forEach(([sx, sy, ex, ey]) => {
      c.fillStyle = '#8c8577';
      if (horiz) { c.fillRect(sx, sy - RW2 / 2 - 7, ex - sx, 5); c.fillRect(sx, sy + RW2 / 2 + 2, ex - sx, 5); for (let x = sx; x <= ex; x += 9) { fillR(c, x, sy - RW2 / 2 - 9, 3, 9, '#6f6a5f'); fillR(c, x, sy + RW2 / 2 + 1, 3, 9, '#6f6a5f'); } }
      else { c.fillRect(sx - RW2 / 2 - 7, sy, 5, ey - sy); c.fillRect(sx + RW2 / 2 + 2, sy, 5, ey - sy); for (let y = sy; y <= ey; y += 9) { fillR(c, sx - RW2 / 2 - 9, y, 9, 3, '#6f6a5f'); fillR(c, sx + RW2 / 2 + 1, y, 9, 3, '#6f6a5f'); } }
    });
  }
}
function drawRiverPart(c, y0, y1) {
  const pts = [];
  for (let y = y0 - 60; y <= y1 + 60; y += 12) { const x = riverX(y); if (y > coastY(x) + 30) break; pts.push([x, y]); }
  if (pts.length < 2) return;
  const path = () => { c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(...p) : c.moveTo(...p)); };
  c.lineCap = 'round'; c.lineJoin = 'round';
  [[70, 'rgba(90,120,60,.5)'], [62, '#cdb98a'], [54, '#b9a372'], [48, '#2f6f9e'], [40, '#3c84b8'], [28, '#4b97c9'], [14, '#5aa6d6']].forEach(([w, col]) => { path(); c.strokeStyle = col; c.lineWidth = w; c.stroke(); });
}
function vHouse(c, h) {
  house(c, h.x, h.y, h.w, h.h, h.wall, h.roof, seeded(Math.floor(h.seed * 1e6)), { attic: h.seed > 0.5 });
}

// ---------- the far places ----------
function drawFarPlace(c, id, lod) {
  const p = PLACES[id];
  if (p.shop) return drawShop(c, id, lod);
  const [x, y, w, h] = p.r;
  const rnd = seeded(id.length * 97);
  if (id === 'beach') {
    fillR(c, x + 10, y + 4, 120, 50, '#9a9a96', 4);
    for (let k = 0; k < 6; k++) fillR(c, x + 16 + k * 19, y + 8, 2, 40, '#fff');
    fillR(c, x + 150, y + 10, 90, 52, '#f6d8a8', 4); fillR(c, x + 146, y + 6, 98, 12, '#e5533d', 3);
    for (let k = 0; k < 7; k++) fillR(c, x + 146 + k * 14, y + 6, 7, 12, '#fff');
    signBoard(c, x + 160, y + 26, 70, 12, '#0277bd', '#fff', 'BEACH SHACK', 7);
    win(c, x + 160, y + 42, 18, 12); win(c, x + 212, y + 42, 18, 12);
    // lifeguard tower
    c.strokeStyle = '#fff'; c.lineWidth = 3; c.beginPath(); c.moveTo(x + 280, y + 150); c.lineTo(x + 290, y + 100); c.moveTo(x + 312, y + 150); c.lineTo(x + 302, y + 100); c.stroke();
    fillR(c, x + 280, y + 82, 32, 22, '#e53935', 2); tri(c, [[x + 276, y + 84], [x + 296, y + 70], [x + 316, y + 84]], '#fff');
    // umbrellas & towels
    [[60, 120, '#ff7043'], [110, 150, '#29b6f6'], [170, 128, '#ffd23f'], [220, 168, '#ab47bc']].forEach(([ux, uy, col]) => {
      fillR(c, x + ux + 10, y + uy + 4, 28, 12, ['#fff', '#ef9a9a', '#90caf9'][Math.floor(rnd() * 3)], 2);
      c.fillStyle = 'rgba(0,0,0,.15)'; c.beginPath(); c.ellipse(x + ux + 6, y + uy + 6, 18, 6, 0, 0, Math.PI * 2); c.fill();
      fillR(c, x + ux - 1, y + uy - 18, 2, 22, '#795548');
      c.fillStyle = col; c.beginPath(); c.arc(x + ux, y + uy - 18, 18, Math.PI, 0); c.fill();
      c.fillStyle = '#fff'; c.beginPath(); c.moveTo(x + ux, y + uy - 36); c.lineTo(x + ux - 6, y + uy - 18); c.lineTo(x + ux + 6, y + uy - 18); c.fill();
    });
    fillR(c, x + 10, y + 70, 30, 6, '#8d6e63'); // sandcastle-ish
    tri(c, [[x + 20, y + 150], [x + 30, y + 132], [x + 40, y + 150]], '#d7b77a'); fillR(c, x + 14, y + 150, 34, 10, '#d7b77a');
  } else if (id === 'trailhead') {
    // ski lift going up the mountain
    c.strokeStyle = '#444'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x + 190, y + 60); c.lineTo(x + 330, y - 560); c.stroke();
    for (let k = 0; k < 6; k++) { const t = k / 6; fillR(c, x + 190 + 140 * t - 2, y + 60 - 620 * t, 4, 26, '#555'); fillR(c, x + 190 + 140 * t + 6, y + 80 - 620 * t, 12, 8, '#e53935', 2); }
    shadow(c, x + 20, y + 50, 120, 80);
    wood_(c, x + 20, y + 50, 120, 80, '#8b5a33');
    tri(c, [[x + 10, y + 54], [x + 80, y + 10], [x + 150, y + 54]], '#5d3a20');
    tri(c, [[x + 30, y + 40], [x + 80, y + 14], [x + 130, y + 40]], 'rgba(255,255,255,.85)');
    signBoard(c, x + 40, y + 60, 80, 13, '#2e5d34', '#fff', 'TRAILHEAD', 8);
    fillR(c, x + 70, y + 92, 20, 38, '#4a2c16', 2); win(c, x + 32, y + 84, 22, 18); win(c, x + 106, y + 84, 22, 18);
    fillR(c, x + 160, y + 120, 6, 30, '#6b4226'); signBoard(c, x + 145, y + 104, 36, 20, '#f5f0e1', '#2e5d34', 'MAP', 7);
    for (let k = 0; k < 3; k++) carShape(c, x + 30 + k * 36, y + 150, ['#e53935', '#1e88e5', '#43a047'][k], true);
  } else if (id === 'village') {
    fillR(c, x, y, w, h, '#d9c9a3', 6);
    signBoard(c, x + w / 2 - 60, y + 6, 120, 16, '#6d4c41', '#fff', 'FARMERS MARKET', 9);
    for (let k = 0; k < 4; k++) {
      const sx = x + 14 + k * 66, sy = y + 36;
      fillR(c, sx, sy + 26, 56, 30, '#8d6e63', 2);
      for (let j = 0; j < 7; j++) fillR(c, sx + j * 8, sy, 8, 22, j % 2 ? '#fff' : ['#e53935', '#43a047', '#1e88e5', '#fb8c00'][k]);
      fillR(c, sx + 2, sy + 22, 2, 34, '#5d4037'); fillR(c, sx + 52, sy + 22, 2, 34, '#5d4037');
      ['#e53935', '#fb8c00', '#7cb342', '#ffd23f', '#8e24aa'].forEach((col, n) => circ(c, sx + 8 + n * 10, sy + 32, 4, col));
    }
    for (let k = 0; k < 6; k++) { fillR(c, x + 20 + k * 40, y + 110, 26, 18, '#a1887f', 2); circ(c, x + 28 + k * 40, y + 112, 4, ['#e53935', '#7cb342', '#ffd23f'][k % 3]); circ(c, x + 38 + k * 40, y + 112, 4, ['#fb8c00', '#c62828', '#8bc34a'][k % 3]); }
    fillR(c, x + w - 20, y + 30, 3, 50, '#777'); tri(c, [[x + w - 17, y + 30], [x + w - 2, y + 35], [x + w - 17, y + 40]], '#e53935');
  } else if (id === 'lake') {
    // dock out into the lake
    fillR(c, x + 150, y - 140, 16, 150, '#8d6e63');
    for (let k = 0; k < 15; k++) fillR(c, x + 150, y - 140 + k * 10, 16, 1, 'rgba(0,0,0,.25)');
    [[x + 120, y - 90, '#e53935'], [x + 176, y - 60, '#ffd23f']].forEach(([bx, by, col]) => { c.fillStyle = col; c.beginPath(); c.ellipse(bx, by, 7, 22, 0, 0, Math.PI * 2); c.fill(); fillR(c, bx - 1, by - 8, 2, 16, '#6d4c41'); });
    shadow(c, x + 20, y + 40, 110, 70);
    wood_(c, x + 20, y + 40, 110, 70, '#7a5230');
    tri(c, [[x + 12, y + 44], [x + 75, y + 10], [x + 138, y + 44]], '#3e5e3a');
    signBoard(c, x + 30, y + 48, 90, 13, '#fff8e1', '#1565c0', 'BAIT & TACKLE', 8);
    fillR(c, x + 66, y + 78, 18, 32, '#4a2c16', 2); win(c, x + 32, y + 72, 20, 16); win(c, x + 98, y + 72, 20, 16);
    fillR(c, x + 200, y + 70, 40, 14, '#8d6e63', 2); fillR(c, x + 204, y + 84, 4, 14, '#6d4c41'); fillR(c, x + 232, y + 84, 4, 14, '#6d4c41');
  } else if (id === 'campground') {
    fillR(c, x + 10, y + 10, w - 20, h - 20, '#9ccf7a', 10);
    signBoard(c, x + 120, y + 14, 120, 15, '#5d4037', '#ffe0b2', 'PINE FOREST CAMP', 8);
    [[50, 70, '#ff7043'], [130, 90, '#29b6f6'], [230, 70, '#ffd23f'], [290, 130, '#66bb6a'], [70, 150, '#ab47bc']].forEach(([tx, ty, col]) => {
      c.fillStyle = 'rgba(0,0,0,.2)'; c.beginPath(); c.ellipse(x + tx + 6, y + ty + 2, 28, 6, 0, 0, Math.PI * 2); c.fill();
      tri(c, [[x + tx - 24, y + ty], [x + tx, y + ty - 34], [x + tx + 24, y + ty]], col);
      tri(c, [[x + tx, y + ty - 34], [x + tx + 24, y + ty], [x + tx + 4, y + ty]], 'rgba(0,0,0,.18)');
      tri(c, [[x + tx - 6, y + ty], [x + tx, y + ty - 14], [x + tx + 6, y + ty]], '#3e2723');
    });
    // campfire
    const fx = x + 190, fy = y + 140;
    c.fillStyle = 'rgba(0,0,0,.2)'; c.beginPath(); c.ellipse(fx, fy + 4, 20, 6, 0, 0, Math.PI * 2); c.fill();
    for (let k = 0; k < 8; k++) circ(c, fx + Math.cos(k * 0.8) * 14, fy + Math.sin(k * 0.8) * 5, 3.5, '#8d8d8d');
    fillR(c, fx - 12, fy - 3, 24, 5, '#6d4c41'); fillR(c, fx - 3, fy - 10, 5, 14, '#5d4037');
    // log benches & picnic table
    fillR(c, fx - 40, fy - 4, 18, 7, '#795548', 3); fillR(c, fx + 24, fy - 4, 18, 7, '#795548', 3);
    fillR(c, x + 250, y + 170, 50, 8, '#8d6e63'); fillR(c, x + 246, y + 162, 58, 4, '#a1887f'); fillR(c, x + 246, y + 180, 58, 4, '#a1887f');
    // RV
    fillR(c, x + 20, y + 170, 70, 28, '#eceff1', 6); fillR(c, x + 20, y + 182, 70, 4, '#1e88e5'); win(c, x + 30, y + 174, 14, 8); win(c, x + 60, y + 174, 14, 8);
  } else if (id === 'zoo') {
    fillR(c, x, y, w, h, '#a5d37f', 8);
    signBoard(c, x + w / 2 - 55, y + 4, 110, 16, '#e65100', '#fff', 'WILDLIFE PARK', 9);
    fillR(c, x + w / 2 - 30, y + 22, 4, 20, '#5d4037'); fillR(c, x + w / 2 + 26, y + 22, 4, 20, '#5d4037');
    // enclosures
    [[20, 50, 140, 80], [180, 50, 140, 80], [20, 145, 300, 80]].forEach(([ex, ey, ew, eh]) => { c.strokeStyle = '#8d6e63'; c.lineWidth = 2; c.strokeRect(x + ex, y + ey, ew, eh); for (let k = 0; k < ew; k += 8) { c.beginPath(); c.moveTo(x + ex + k, y + ey + eh); c.lineTo(x + ex + k, y + ey + eh - 5); c.stroke(); } });
    // elephant
    const el = (ex, ey) => { ell(c, ex, ey, 18, 12, '#9e9e9e'); circ(c, ex + 16, ey - 6, 9, '#9e9e9e'); ell(c, ex + 10, ey - 6, 5, 8, '#8a8a8a'); c.strokeStyle = '#9e9e9e'; c.lineWidth = 4; c.beginPath(); c.moveTo(ex + 22, ey - 2); c.quadraticCurveTo(ex + 28, ey + 8, ex + 24, ey + 14); c.stroke(); [-10, -2, 6, 12].forEach(lx => fillR(c, ex + lx, ey + 8, 5, 10, '#8f8f8f')); circ(c, ex + 18, ey - 8, 1.2, '#222'); };
    el(x + 70, y + 92);
    // giraffes
    const gf = (gx, gy) => { fillR(c, gx - 12, gy, 24, 14, '#f2c14e', 6); c.save(); c.translate(gx + 8, gy + 2); c.rotate(-0.25); fillR(c, -3, -32, 6, 34, '#f2c14e'); c.restore(); circ(c, gx + 16, gy - 30, 5, '#f2c14e'); [[-6, 4], [4, 6], [0, 10], [-2, 2]].forEach(([dx, dy]) => circ(c, gx + dx, gy + dy, 2, '#a86a2a')); [-9, -3, 5, 9].forEach(lx => fillR(c, gx + lx, gy + 12, 2.5, 14, '#e0ac3c')); };
    gf(x + 230, y + 88); gf(x + 280, y + 96);
    // zebras & a pond with flamingos
    ell(c, x + 120, y + 190, 40, 18, '#5aa6d6');
    [[100, 186], [130, 194]].forEach(([fx2, fy2]) => { fillR(c, x + fx2, y + fy2 - 14, 1.5, 14, '#ec407a'); ell(c, x + fx2 + 2, y + fy2 - 16, 6, 4, '#f48fb1'); });
    [[220, 190], [260, 196]].forEach(([zx, zy]) => { ell(c, x + zx, y + zy, 14, 8, '#fafafa'); for (let k = -10; k <= 10; k += 5) fillR(c, x + zx + k, y + zy - 7, 2, 14, '#222'); circ(c, x + zx + 14, y + zy - 4, 5, '#fafafa'); });
  }
}
function wood_(c, x, y, w, h, col) {
  fillR(c, x, y, w, h, col);
  c.strokeStyle = 'rgba(0,0,0,.2)'; c.lineWidth = 1;
  for (let k = 8; k < h; k += 8) { c.beginPath(); c.moveTo(x, y + k); c.lineTo(x + w, y + k); c.stroke(); }
}

// ---------- chunks ----------
const LOD_RES = [1.25, 0.4, 0.12];        // pixels per world unit (times the base scale)
const LOD_CELL = [2, 8, 16];              // terrain detail
const LOD_MAX = [40, 90, 420];
const chunkCache = [new Map(), new Map(), new Map()];
let baseK = 1, chunkDpr = 1;

function renderChunk(cx, cy, lod) {
  const px = Math.max(8, Math.round(CHUNK * baseK * chunkDpr * LOD_RES[lod]));
  const cv = document.createElement('canvas');
  cv.width = px; cv.height = px;
  const c = cv.getContext('2d');
  const x0 = cx * CHUNK, y0 = cy * CHUNK, x1 = x0 + CHUNK, y1 = y0 + CHUNK;
  // terrain
  const n = CHUNK / LOD_CELL[lod];
  const tc = document.createElement('canvas'); tc.width = n; tc.height = n;
  const tctx = tc.getContext('2d');
  const img = tctx.createImageData(n, n);
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    const wx = x0 + (i + 0.5) * LOD_CELL[lod], wy = y0 + (j + 0.5) * LOD_CELL[lod];
    const bb = biome(wx, wy);
    let col = biomeColor(wx, wy, bb);
    if (SEASON_LAND && (bb === B.GRASS || bb === B.HILL || bb === B.FARM || bb === B.FOREST)) {
      const [tr, tg, tb, k] = SEASON_LAND;
      col = [col[0] + (tr - col[0]) * k, col[1] + (tg - col[1]) * k, col[2] + (tb - col[2]) * k];
    }
    const o = (j * n + i) * 4;
    img.data[o] = col[0]; img.data[o + 1] = col[1]; img.data[o + 2] = col[2]; img.data[o + 3] = 255;
  }
  tctx.putImageData(img, 0, 0);
  c.imageSmoothingEnabled = true;
  c.drawImage(tc, 0, 0, px, px);
  const s = px / CHUNK;
  c.setTransform(s, 0, 0, s, -x0 * s, -y0 * s);
  NO_REC = true;
  // grass texture
  if (lod === 0) {
    let r = Math.floor(h2(cx, cy, 5) * 1e9) + 1; const rnd = () => (r = (r * 16807) % 2147483647) / 2147483647;
    c.lineWidth = 1;
    for (let i = 0; i < 700; i++) {
      const bx = x0 + rnd() * CHUNK, by = y0 + rnd() * CHUNK;
      const b = biome(bx, by);
      if (b !== B.GRASS && b !== B.HILL && b !== B.FARM && b !== B.FOREST) continue;
      c.strokeStyle = SEASON_LAND && SEASON_LAND[3] > 0.5 ? (rnd() < 0.5 ? 'rgba(160,175,190,.35)' : 'rgba(255,255,255,.5)') : rnd() < 0.55 ? 'rgba(45,110,40,.35)' : 'rgba(200,235,160,.3)';
      c.beginPath(); c.moveTo(bx, by); c.lineTo(bx + (rnd() - 0.5) * 2, by - 3); c.stroke();
    }
  }
  // collect things in nearby cells
  const items = [];
  const g0x = Math.floor(x0 / CELL) - 1, g1x = Math.floor(x1 / CELL) + 1, g0y = Math.floor(y0 / CELL) - 1, g1y = Math.floor(y1 / CELL) + 2;
  for (let gy = g0y; gy <= g1y; gy++) for (let gx = g0x; gx <= g1x; gx++) cellStuff(gx, gy).forEach(t => items.push(t));
  // fields go under everything
  if (lod <= 1) items.filter(t => t.t === 'field' && overlap(t.box, [x0 - 10, y0 - 80, CHUNK + 20, CHUNK + 100])).forEach(f => wField(c, f, lod));
  drawRiverPart(c, y0, y1);
  drawRoads(c, x0 - 40, y0 - 40, x1 + 40, y1 + 40, lod);
  // mountains
  MOUNTAINS.forEach(m => { if (overlap([m.x - m.W / 2, m.yb - m.H, m.W, m.H + 20], [x0, y0, CHUNK, CHUNK])) wMountain(c, m, lod); });
  if (lod <= 1) {
    const draw = [];
    items.forEach(t => { if (t.t !== 'field') draw.push([t.y, () => {
      if (t.t === 'tree') wTree(c, t.x, t.y, t.s, t.k, lod); else if (t.t === 'pine') wPine(c, t.x, t.y, t.s, lod);
      else if (t.t === 'palm') wPalm(c, t.x, t.y, t.s); else if (t.t === 'rock') wRock(c, t.x, t.y, t.s); else if (t.t === 'bush') bush(c, t.x, t.y, t.s, '#3f8f45');
    }]); });
    VHOUSES.forEach(h => { if (overlap([h.x - 10, h.y - 20, h.w + 30, h.h + 40], [x0, y0, CHUNK, CHUNK])) draw.push([h.y + h.h, () => vHouse(c, h)]); });
    Object.entries(PLACES).forEach(([id, p]) => { if (p.far && overlap([p.r[0] - 20, p.r[1] - 700, p.r[2] + 200, p.r[3] + (id === 'harbor' ? 1200 : 720)], [x0, y0, CHUNK, CHUNK])) draw.push([p.r[1] + p.r[3], () => drawFarPlace(c, id, lod)]); });
    draw.sort((a, b) => a[0] - b[0]).forEach(d => d[1]());
  } else {
    VHOUSES.forEach(h => { if (overlap([h.x, h.y, h.w, h.h], [x0, y0, CHUNK, CHUNK])) { fillR(c, h.x + 20, h.y + 26, 44, 34, h.wall); tri(c, [[h.x + 14, h.y + 28], [h.x + 42, h.y + 6], [h.x + 70, h.y + 28]], h.roof); } });
    Object.entries(PLACES).forEach(([id, p]) => { if (p.far && overlap(p.r, [x0, y0, CHUNK, CHUNK])) fillR(c, ...p.r, 'rgba(240,200,120,.9)', 10); });
  }
  NO_REC = false;
  return cv;
}
function getChunk(cx, cy, lod, budget) {
  const key = cx + ',' + cy;
  const cache = chunkCache[lod];
  if (cache.has(key)) { const v = cache.get(key); cache.delete(key); cache.set(key, v); return v; }
  if (budget.n <= 0) return null;
  budget.n--;
  const cv = renderChunk(cx, cy, lod);
  cache.set(key, cv);
  while (cache.size > LOD_MAX[lod]) cache.delete(cache.keys().next().value);
  return cv;
}

// ---------- town picture (drawn once, sharp) ----------
const TOWN_RES = 2;
let townCanvas = null;
function buildTown() {
  townCanvas = document.createElement('canvas');
  townCanvas.width = MAP_W * TOWN_RES; townCanvas.height = MAP_H * TOWN_RES;
  const tc = townCanvas.getContext('2d');
  tc.setTransform(TOWN_RES, 0, 0, TOWN_RES, 0, 0);
  drawStatic(tc);
  // fade the edges so the town blends into the countryside
  const m = document.createElement('canvas'); m.width = townCanvas.width; m.height = townCanvas.height;
  const mc = m.getContext('2d');
  mc.filter = `blur(${8 * TOWN_RES}px)`; mc.fillStyle = '#fff';
  mc.fillRect(14 * TOWN_RES, 14 * TOWN_RES, (MAP_W - 28) * TOWN_RES, (MAP_H - 28) * TOWN_RES);
  tc.setTransform(1, 0, 0, 1, 0, 0);
  tc.globalCompositeOperation = 'destination-in'; tc.drawImage(m, 0, 0); tc.globalCompositeOperation = 'source-over';
}

// ---------- camera ----------
const cam = { x: TOWN.cx, y: TOWN.cy, z: 1, follow: true };
const Z_MIN = 0.1, Z_MAX = 2.5;
let mapCanvas, mapCtx, hover = null, lastT = 0, cssW = 800, cssH = 500, dprNow = 1;
let traveler = null;   // { path, t, dur, how, resolve }
const cars = [], clouds = [], ducks = [], walkers = [], boats = [];

function kNow() { return baseK * cam.z; }
function toWorld(sx, sy) { const k = kNow(); return [cam.x + (sx - cssW / 2) / k, cam.y + (sy - cssH / 2) / k]; }
function clampCam() {
  const k = kNow(), hw = cssW / 2 / k, hh = cssH / 2 / k;
  cam.x = Math.max(WORLD.x0 + hw, Math.min(WORLD.x1 - hw, cam.x));
  cam.y = Math.max(WORLD.y0 + hh, Math.min(WORLD.y1 - hh, cam.y));
  if (WORLD.x1 - WORLD.x0 < hw * 2) cam.x = (WORLD.x0 + WORLD.x1) / 2;
  if (WORLD.y1 - WORLD.y0 < hh * 2) cam.y = (WORLD.y0 + WORLD.y1) / 2;
}
function zoomAt(f, sx = cssW / 2, sy = cssH / 2) {
  const [wx, wy] = toWorld(sx, sy);
  cam.z = Math.max(Z_MIN, Math.min(Z_MAX, cam.z * f));
  const k = kNow();
  cam.x = wx - (sx - cssW / 2) / k; cam.y = wy - (sy - cssH / 2) / k;
  clampCam();
}
function playerPos() { return traveler && traveler.pos ? traveler.pos : placeOf(S.loc).door; }
function findMe() { const [x, y] = playerPos(); cam.x = x; cam.y = y; if (cam.z < 0.8) cam.z = 1; cam.follow = true; clampCam(); }
function showWorld() { cam.z = Z_MIN; cam.follow = false; clampCam(); }

function initMovers() {
  const rnd = seeded(7);
  const cols = ['#e53935', '#1e88e5', '#fdd835', '#43a047', '#fb8c00', '#8e24aa', '#ffffff', '#455a64'];
  for (let i = 0; i < 46; i++) {
    const e = i < 12 ? EDGES[Math.floor(rnd() * TOWN_EDGE_COUNT)] : EDGES[TOWN_EDGE_COUNT + Math.floor(rnd() * (EDGES.length - TOWN_EDGE_COUNT))];
    cars.push({ from: e[0], to: e[1], t: rnd(), speed: i < 12 ? 70 + rnd() * 40 : 140 + rnd() * 80, col: cols[i % cols.length] });
  }
  for (let i = 0; i < 70; i++) clouds.push({ x: WORLD.x0 + rnd() * (WORLD.x1 - WORLD.x0), y: WORLD.y0 + rnd() * (WORLD.y1 - WORLD.y0), s: 0.8 + rnd() * 1.6, v: 6 + rnd() * 8 });
  for (let i = 0; i < 14; i++) {
    const e = EDGES[Math.floor(rnd() * TOWN_EDGE_COUNT)];
    walkers.push({ from: e[0], to: e[1], t: rnd(), speed: 14 + rnd() * 10, look: randomLook(rnd), side: rnd() < 0.5 ? -1 : 1, ph: rnd() * 10 });
  }
  for (let i = 0; i < 4; i++) ducks.push({ a: rnd() * Math.PI * 2, r: 0.4 + rnd() * 0.45, v: (rnd() < 0.5 ? -1 : 1) * (0.1 + rnd() * 0.15) });
  for (let i = 0; i < 6; i++) boats.push({ x: -3000 + rnd() * 9000, y: 3500 + rnd() * 500, v: (rnd() < 0.5 ? -1 : 1) * (8 + rnd() * 10), sail: rnd() < 0.6 });
  boats.push({ lake: 0, a: 0, v: 0.05 }, { lake: 0, a: 3, v: -0.04 }, { lake: 1, a: 1, v: 0.06 });
}
function neighbors(n) { return EDGES.filter(e => e[0] === n || e[1] === n).map(e => (e[0] === n ? e[1] : e[0])); }
function stepMover(m, dt, townOnly) {
  const A = NODES[m.from], B2 = NODES[m.to];
  m.t += m.speed * dt / Math.max(1, dist(A, B2));
  if (m.t >= 1) {
    let opts = neighbors(m.to).filter(n => n !== m.from);
    if (townOnly) opts = opts.filter(isTownNode);
    m.from = m.to; m.to = opts.length ? opts[Math.floor(Math.random() * opts.length)] : m.from; m.t = 0;
    if (m.to === m.from) m.to = neighbors(m.from).filter(n => !townOnly || isTownNode(n))[0];
  }
}

function darkness() {
  if (!S) return 0;
  const h = S.hour;
  if (h < 5) return 0.55;
  if (h < 7) return 0.55 * (1 - (h - 5) / 2);
  if (h < 18) return 0;
  if (h < 20.5) return 0.55 * (h - 18) / 2.5;
  return 0.55;
}

// ---------- every frame ----------
function drawDynamic(t, dt) {
  const c = mapCtx;
  if (cam.follow) { const [px, py] = playerPos(); const f = Math.min(1, dt * (traveler ? 4 : 2)); cam.x += (px - cam.x) * f; cam.y += (py - cam.y) * f; clampCam(); }
  const k = kNow();
  const vx0 = cam.x - cssW / 2 / k, vy0 = cam.y - cssH / 2 / k, vx1 = cam.x + cssW / 2 / k, vy1 = cam.y + cssH / 2 / k;
  const inView = (x, y, m = 60) => x > vx0 - m && x < vx1 + m && y > vy0 - m && y < vy1 + m;
  c.setTransform(dprNow, 0, 0, dprNow, 0, 0);
  c.fillStyle = '#7cc468'; c.fillRect(0, 0, cssW, cssH);
  c.setTransform(k * dprNow, 0, 0, k * dprNow, (cssW / 2 - cam.x * k) * dprNow, (cssH / 2 - cam.y * k) * dprNow);
  const lod = cam.z >= 0.55 ? 0 : cam.z >= 0.18 ? 1 : 2;
  const budget = { n: lod === 0 ? 1 : lod === 1 ? 3 : 14 };
  const townVisible = overlap([vx0, vy0, vx1 - vx0, vy1 - vy0], [0, 0, MAP_W, MAP_H]);
  for (let cy = Math.floor(vy0 / CHUNK); cy <= Math.floor(vy1 / CHUNK); cy++) {
    for (let cx = Math.floor(vx0 / CHUNK); cx <= Math.floor(vx1 / CHUNK); cx++) {
      const x = cx * CHUNK, y = cy * CHUNK;
      if (lod === 0 && townVisible && x >= 0 && y >= 0 && x + CHUNK <= MAP_W && y + CHUNK <= MAP_H) continue;
      let cv = getChunk(cx, cy, lod, budget);
      if (!cv) { for (let l = lod + 1; l < 3 && !cv; l++) cv = chunkCache[l].get(cx + ',' + cy); }
      if (cv) c.drawImage(cv, x, y, CHUNK + 0.6, CHUNK + 0.6);
    }
  }
  if (townVisible && townCanvas) c.drawImage(townCanvas, 0, 0, MAP_W, MAP_H);
  const detail = cam.z >= 0.35;

  // ocean waves and boats
  if (vy1 > 3000 && detail) {
    c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 2;
    for (let x = Math.floor(vx0 / 40) * 40; x < vx1; x += 40) {
      const ph = (t / 1400 + x / 300) % 1;
      const yy = coastY(x) + 6 + ph * 28;
      c.globalAlpha = 1 - ph; c.beginPath(); c.moveTo(x, yy); c.quadraticCurveTo(x + 20, yy - 4, x + 40, yy); c.stroke();
    }
    c.globalAlpha = 1;
  }
  boats.forEach(bt => {
    let bx, by;
    if (bt.lake !== undefined) { const L = LAKES[bt.lake]; bt.a += bt.v * dt; bx = L.x + Math.cos(bt.a) * L.rx * 0.55; by = L.y + Math.sin(bt.a) * L.ry * 0.5; }
    else { bt.x += bt.v * dt; if (bt.x > WORLD.x1) bt.x = WORLD.x0; if (bt.x < WORLD.x0) bt.x = WORLD.x1; bx = bt.x; by = Math.max(bt.y, coastY(bt.x) + 80); }
    if (!inView(bx, by) || !detail) return;
    ell(c, bx + 3, by + 3, 16, 5, 'rgba(0,0,0,.15)');
    c.fillStyle = bt.lake !== undefined ? '#e53935' : '#fff'; c.beginPath(); c.moveTo(bx - 16, by - 3); c.lineTo(bx + 16, by - 3); c.lineTo(bx + 10, by + 4); c.lineTo(bx - 10, by + 4); c.fill();
    if (bt.sail) { fillR(c, bx - 1, by - 30, 2, 28, '#5d4037'); tri(c, [[bx + 1, by - 30], [bx + 1, by - 6], [bx + 16, by - 6]], '#fafafa'); tri(c, [[bx - 1, by - 26], [bx - 1, by - 6], [bx - 12, by - 6]], '#ef5350'); }
  });

  // river shimmer
  if (detail) {
    c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 1.5;
    for (let yy = Math.floor(vy0 / 50) * 50; yy < vy1; yy += 50) {
      const y2 = yy + ((t * 0.012) % 50);
      const rx = riverX(y2);
      if (!inView(rx, y2) || y2 > coastY(rx)) continue;
      if (EDGES.some(e => NODES[e[0]][1] === NODES[e[1]][1] && Math.abs(NODES[e[0]][1] - y2) < 26 && Math.min(NODES[e[0]][0], NODES[e[1]][0]) < rx && Math.max(NODES[e[0]][0], NODES[e[1]][0]) > rx)) continue;
      c.beginPath(); c.moveTo(rx - 6, y2); c.lineTo(rx + 2, y2 + 4); c.stroke();
    }
  }
  // ducks in the town park
  const lake = [PLACES.park.r[0] + 135, PLACES.park.r[1] + 70];
  ducks.forEach(d => {
    d.a += d.v * dt;
    const dx = lake[0] + Math.cos(d.a) * 42 * d.r, dy = lake[1] + Math.sin(d.a) * 24 * d.r;
    if (detail && inView(dx, dy)) { ell(c, dx, dy, 4, 2.6, '#fff'); circ(c, dx + 3 * (Math.sign(-Math.sin(d.a) * d.v) || 1), dy - 2, 1.8, '#2e7d32'); }
  });
  // cars
  const dkk = darkness();
  cars.forEach((car, i) => {
    if (!(i < 12 && carMustStop(car, t))) stepMover(car, dt, i < 12);
    if (i >= 12 && i % 2 && !isRush()) return;
    const P0 = NODES[car.from], P1 = NODES[car.to];
    const horiz = P0[1] === P1[1];
    const dir = horiz ? Math.sign(P1[0] - P0[0]) : Math.sign(P1[1] - P0[1]);
    const cx = P0[0] + (P1[0] - P0[0]) * car.t + (horiz ? 0 : -dir * 7), cy = P0[1] + (P1[1] - P0[1]) * car.t + (horiz ? dir * 7 : 0);
    if (!inView(cx, cy)) return;
    const sc = Math.max(1, 0.6 / cam.z);
    c.save(); c.translate(cx, cy); c.scale(sc, sc);
    ell(c, 2, 3, horiz ? 11 : 6, horiz ? 6 : 11, 'rgba(0,0,0,.2)');
    carShape(c, 0, 0, car.col, horiz);
    if (dkk > 0.25) { c.fillStyle = 'rgba(255,240,170,.35)'; c.beginPath(); c.arc(horiz ? dir * 18 : 0, horiz ? 0 : dir * 18, 9, 0, Math.PI * 2); c.fill(); }
    c.restore();
  });
  if (detail) drawTrafficLights(c, t, inView);
  if (townVisible && detail) { drawParkEvent(c, t); drawTownTree(c, t); drawIceTruck(c, t); }
  { const ap = PLACES.airport.r; if (inView(ap[0] + 300, ap[1] + 250, 600) && detail) { const ph = (t / 9000) % 1; const px = ap[0] + 160 + ph * 700, py = ap[1] + 253 - Math.max(0, ph - 0.45) * 500; drawPlane(c, px, py, 0.9 + Math.max(0, ph - 0.45), -Math.max(0, ph - 0.45) * 1.2); } }
  // people walking in town
  if (detail) walkers.forEach((w, i) => {
    stepMover(w, dt, true);
    if (dkk > 0.4 && i % 3) return;
    const P0 = NODES[w.from], P1 = NODES[w.to];
    const horiz = P0[1] === P1[1];
    const off = (ROAD_W / 2 + 3) * w.side;
    const wx = P0[0] + (P1[0] - P0[0]) * w.t + (horiz ? 0 : off), wy = P0[1] + (P1[1] - P0[1]) * w.t + (horiz ? off : 0);
    if (Math.abs(wx - RIVER_X) < 34 && horiz) return;
    if (inView(wx, wy)) drawPerson(c, wx, wy + 4, 0.42, w.look, t / 110 + w.ph, true);
  });

  // night
  const vw = vx1 - vx0, vh = vy1 - vy0;
  if (dkk > 0) {
    c.fillStyle = `rgba(15,25,60,${dkk})`; c.fillRect(vx0, vy0, vw, vh);
    if (dkk > 0.2) {
      if (townVisible) {
        const r = seeded(99);
        WINDOWS.forEach(([wx, wy, ww, wh]) => { if (r() < 0.65) { c.fillStyle = `rgba(255,214,110,${Math.min(0.9, dkk * 1.6)})`; c.fillRect(wx, wy, ww, wh); } });
        LAMPS.forEach(([lx, ly]) => {
          const g = c.createRadialGradient(lx, ly - 13, 1, lx, ly - 13, 26);
          g.addColorStop(0, `rgba(255,230,150,${dkk * 1.3})`); g.addColorStop(1, 'rgba(255,230,150,0)');
          c.fillStyle = g; c.beginPath(); c.arc(lx, ly - 13, 26, 0, Math.PI * 2); c.fill();
        });
      }
      VHOUSES.forEach(h => { if (inView(h.x, h.y, 100)) { c.fillStyle = `rgba(255,214,110,${Math.min(0.9, dkk * 1.5)})`; c.fillRect(h.x + 22, h.y + 36, 10, 8); c.fillRect(h.x + 52, h.y + 36, 10, 8); } });
      const cf = PLACES.campground.r;
      if (inView(cf[0] + 190, cf[1] + 140, 200)) {
        const fl = 0.8 + Math.sin(t / 90) * 0.1 + Math.sin(t / 37) * 0.08;
        const g = c.createRadialGradient(cf[0] + 190, cf[1] + 132, 2, cf[0] + 190, cf[1] + 132, 90 * fl);
        g.addColorStop(0, 'rgba(255,170,60,.7)'); g.addColorStop(1, 'rgba(255,170,60,0)');
        c.fillStyle = g; c.fillRect(cf[0] + 90, cf[1] + 40, 200, 200);
      }
      const sr = seeded(5);
      for (let i = 0; i < 80; i++) { const sx = vx0 + sr() * vw, sy = vy0 + sr() * vh; circ(c, sx, sy, 0.9 / cam.z, `rgba(255,255,255,${dkk * 0.8})`); }
    }
  }
  // campfire flames
  { const cf = PLACES.campground.r, fx = cf[0] + 190, fy = cf[1] + 136;
    if (inView(fx, fy) && detail) for (let k = 0; k < 3; k++) { const fl = Math.sin(t / 70 + k * 2) * 3; tri(c, [[fx - 8 + k * 6, fy + 2], [fx - 4 + k * 6 + fl * 0.3, fy - 14 - fl], [fx + k * 6, fy + 2]], ['#ff6f00', '#ffa000', '#ffd54f'][k]); } }
  // weather
  const wx = S.weather;
  if (wx === 'rainy' || wx === 'cloudy') { c.fillStyle = wx === 'rainy' ? 'rgba(60,70,90,.28)' : 'rgba(120,130,150,.12)'; c.fillRect(vx0, vy0, vw, vh); }
  if (wx === 'hot') { c.fillStyle = 'rgba(255,170,60,.08)'; c.fillRect(vx0, vy0, vw, vh); }
  if (wx === 'rainy') {
    c.save(); c.setTransform(dprNow, 0, 0, dprNow, 0, 0);
    c.strokeStyle = 'rgba(200,220,255,.55)'; c.lineWidth = 1.2; c.beginPath();
    for (let i = 0; i < 200; i++) {
      const rx = (i * 97.3 + t * 0.05 * (1 + i % 3)) % (cssW + 40) - 20;
      const ry = (i * 53.7 + t * 0.6 * (1 + (i % 4) * 0.2)) % (cssH + 40) - 20;
      c.moveTo(rx, ry); c.lineTo(rx - 3, ry + 11);
    }
    c.stroke(); c.restore();
  }
  // clouds
  const ca = dkk > 0.3 ? 0.25 : wx === 'rainy' ? 0.8 : 0.55;
  clouds.forEach(cl => {
    cl.x += cl.v * dt; if (cl.x > WORLD.x1 + 100) cl.x = WORLD.x0 - 100;
    if (!inView(cl.x, cl.y, 120)) return;
    ell(c, cl.x + 25, cl.y + 40, 40 * cl.s, 12 * cl.s, 'rgba(0,0,0,.07)');
    [[0, 0, 22], [20, -6, 18], [38, 2, 16], [-18, 4, 14]].forEach(([ox, oy, r]) => circ(c, cl.x + ox * cl.s, cl.y + oy * cl.s, r * cl.s, `rgba(255,255,255,${ca})`));
  });

  drawSeasonFx(c, t, dt, vx0, vy0, vw, vh);
  // labels
  const myHome = HOME_PLACE[S.home];
  const myWork = S.job ? workplaceOf(JOBS[S.job.id]) : null;
  const ls = Math.min(9, Math.max(1, 1 / cam.z));
  const showTown = cam.z >= 0.45;
  Object.entries(PLACES).forEach(([id, p]) => {
    if ((!p.far || p.town) && !showTown) return;
    if (p.kind === 'deco' && hover !== id) return;
    if (p.kind === 'home' && id !== myHome && hover !== id) return;
    const isHover = hover === id;
    let label = `${p.icon} ${p.name}`;
    if (id === myHome) label = `🏠 Home`;
    if (id === myWork) label = `💼 ${p.name} (Work)`;
    const s = p.far && !p.town ? ls : 1;
    const fs = (isHover ? 12 : 10) * s;
    c.font = `${isHover ? 800 : 700} ${fs}px system-ui, sans-serif`;
    const tw = c.measureText(label).width + 12 * s;
    const doorOnTop = p.door[1] < p.r[1] + p.r[3] / 2;
    const lx = p.r[0] + p.r[2] / 2, ly = doorOnTop ? p.r[1] + p.r[3] - 8 : p.r[1] + 2;
    if (!inView(lx, ly, 200 * s)) return;
    const bg = id === myHome ? '#2f80ed' : id === myWork ? '#f2a516' : isHover ? '#1d2b3a' : 'rgba(255,255,255,.92)';
    const fg = id === myHome || isHover ? '#fff' : '#1d2b3a';
    fillR(c, lx - tw / 2, ly - 8 * s, tw, (isHover ? 18 : 15) * s, bg, 8 * s);
    txt(c, label, lx, ly + (isHover ? 1 : -0.5) * s, fg, fs, isHover ? 800 : 700);
    if (isHover) { c.strokeStyle = '#2f80ed'; c.lineWidth = 3 * s; rr(c, p.r[0] - 3, p.r[1] - 3, p.r[2] + 6, p.r[3] + 6, 8); c.stroke(); }
  });
  if (!showTown) TOWN_NAMES.forEach((tn, i) => {
    const s = ls * 1.4, hv = hover === 'town:' + i;
    c.font = `800 ${12 * s}px system-ui, sans-serif`;
    const tw = c.measureText(tn.name).width + 16 * s;
    fillR(c, tn.x - tw / 2, tn.y - 10 * s, tw, 22 * s, hv ? '#1d2b3a' : 'rgba(255,255,255,.95)', 11 * s);
    txt(c, tn.name, tn.x, tn.y + 1 * s, hv ? '#fff' : '#1d2b3a', 12 * s, 800);
  });

  // the player
  let px, py, moving = false, segDir = [1, 0];
  if (traveler) {
    traveler.t += dt;
    const kk = Math.min(1, traveler.t / traveler.dur);
    const L = traveler.len * kk;
    let acc = 0, pt = traveler.path[0];
    for (let i = 1; i < traveler.path.length; i++) {
      const seg = dist(traveler.path[i - 1], traveler.path[i]);
      if (acc + seg >= L) { segDir = [traveler.path[i][0] - traveler.path[i - 1][0], traveler.path[i][1] - traveler.path[i - 1][1]]; const f = seg ? (L - acc) / seg : 0; pt = [traveler.path[i - 1][0] + (traveler.path[i][0] - traveler.path[i - 1][0]) * f, traveler.path[i - 1][1] + (traveler.path[i][1] - traveler.path[i - 1][1]) * f]; break; }
      acc += seg; pt = traveler.path[i];
    }
    [px, py] = pt; moving = true; traveler.pos = pt;
    if (kk >= 1) { const r = traveler.resolve; traveler = null; r(); }
  } else [px, py] = placeOf(S.loc).door;
  const ps = Math.min(8, Math.max(1, 0.9 / cam.z));
  c.save(); c.translate(px, py); c.scale(ps, ps);
  const mode = moving && traveler ? traveler.icon : '';
  let headY = -34;
  if (mode === '🚙' || mode === '🚌') {
    const horiz = Math.abs(segDir[0]) >= Math.abs(segDir[1]);
    ell(c, 3, 4, horiz ? 20 : 10, horiz ? 9 : 18, 'rgba(0,0,0,.3)');
    if (mode === '🚌') {
      if (horiz) { fillR(c, -22, -9, 44, 18, '#f2b705', 4); for (let k2 = 0; k2 < 5; k2++) fillR(c, -18 + k2 * 8, -7, 6, 5, '#bfe3f5', 1); }
      else { fillR(c, -9, -22, 18, 44, '#f2b705', 4); for (let k2 = 0; k2 < 5; k2++) fillR(c, -7, -18 + k2 * 8, 5, 6, '#bfe3f5', 1); }
    } else {
      if (horiz) { fillR(c, -15, -8, 30, 16, '#2f80ed', 5); fillR(c, -7, -7, 14, 14, 'rgba(190,230,255,.9)', 3); }
      else { fillR(c, -8, -15, 16, 30, '#2f80ed', 5); fillR(c, -7, -7, 14, 14, 'rgba(190,230,255,.9)', 3); }
    }
    headY = -20;
  } else {
    if (mode === '🚲') {
      c.strokeStyle = '#333'; c.lineWidth = 1.5;
      c.beginPath(); c.arc(-7, -2, 4.5, 0, Math.PI * 2); c.arc(7, -2, 4.5, 0, Math.PI * 2); c.stroke();
      c.strokeStyle = '#e53935'; c.beginPath(); c.moveTo(-7, -2); c.lineTo(0, -9); c.lineTo(7, -2); c.stroke();
    }
    drawPerson(c, 0, 0, 0.95, S.look, t / 90, moving);
  }
  const ab = Math.sin(t / 250) * 2;
  tri(c, [[-5, headY - 6 + ab], [5, headY - 6 + ab], [0, headY + ab]], '#2f80ed');
  c.font = '800 10px system-ui, sans-serif'; const nw = c.measureText(S.name).width + 10;
  fillR(c, -nw / 2, 5, nw, 13, '#2f80ed', 6); txt(c, S.name, 0, 11.5, '#fff', 10, 800);
  c.restore();

  drawMinimapOverlay(px, py, vx0, vy0, vw, vh);
}

// ---------- minimap ----------
let miniBase = null, miniCv = null;
function buildMinimap() {
  miniCv = $('#minimap'); if (!miniCv) return;
  const W = 200, H = Math.round(200 * (WORLD.y1 - WORLD.y0) / (WORLD.x1 - WORLD.x0));
  miniCv.width = W * 2; miniCv.height = H * 2;
  miniBase = document.createElement('canvas'); miniBase.width = W; miniBase.height = H;
  const c = miniBase.getContext('2d');
  const img = c.createImageData(W, H);
  const sx = (WORLD.x1 - WORLD.x0) / W, sy = (WORLD.y1 - WORLD.y0) / H;
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
    const x = WORLD.x0 + (i + 0.5) * sx, y = WORLD.y0 + (j + 0.5) * sy;
    const col = biomeColor(x, y, biome(x, y));
    const o = (j * W + i) * 4; img.data[o] = col[0]; img.data[o + 1] = col[1]; img.data[o + 2] = col[2]; img.data[o + 3] = 255;
  }
  c.putImageData(img, 0, 0);
  const m = (x, y) => [(x - WORLD.x0) / sx, (y - WORLD.y0) / sy];
  c.strokeStyle = '#4a8fd0'; c.lineWidth = 1.4; c.beginPath();
  for (let y = WORLD.y0; y < WORLD.y1; y += 40) { const x = riverX(y); if (y > coastY(x)) break; const [a, b2] = m(x, y); y === WORLD.y0 ? c.moveTo(a, b2) : c.lineTo(a, b2); }
  c.stroke();
  c.strokeStyle = '#555'; c.lineWidth = 1;
  EDGES.forEach(([a, b2]) => { c.beginPath(); c.moveTo(...m(...NODES[a])); c.lineTo(...m(...NODES[b2])); c.stroke(); });
  const [tx, ty] = m(0, 0); c.fillStyle = 'rgba(120,120,130,.9)'; c.fillRect(tx, ty, MAP_W / sx, MAP_H / sy);
  Object.values(PLACES).forEach(p => { if (p.far) { const [a, b2] = m(p.r[0] + p.r[2] / 2, p.r[1] + p.r[3] / 2); c.fillStyle = '#f2a516'; c.beginPath(); c.arc(a, b2, 2.5, 0, Math.PI * 2); c.fill(); } });
  miniCv.style.aspectRatio = `${W} / ${H}`;
  miniCv.onclick = e => {
    const r = miniCv.getBoundingClientRect();
    cam.x = WORLD.x0 + (e.clientX - r.left) / r.width * (WORLD.x1 - WORLD.x0);
    cam.y = WORLD.y0 + (e.clientY - r.top) / r.height * (WORLD.y1 - WORLD.y0);
    cam.follow = false; clampCam();
  };
}
let miniTick = 0;
function drawMinimapOverlay(px, py, vx0, vy0, vw, vh) {
  if (!miniCv || !miniBase || (miniTick++ % 4)) return;
  const c = miniCv.getContext('2d');
  c.setTransform(2, 0, 0, 2, 0, 0);
  c.drawImage(miniBase, 0, 0);
  const sx = miniBase.width / (WORLD.x1 - WORLD.x0), sy = miniBase.height / (WORLD.y1 - WORLD.y0);
  c.strokeStyle = '#fff'; c.lineWidth = 1.2; c.strokeRect((vx0 - WORLD.x0) * sx, (vy0 - WORLD.y0) * sy, vw * sx, vh * sy);
  c.fillStyle = '#2f80ed'; c.strokeStyle = '#fff'; c.lineWidth = 1;
  c.beginPath(); c.arc((px - WORLD.x0) * sx, (py - WORLD.y0) * sy, 3.2, 0, Math.PI * 2); c.fill(); c.stroke();
}

// ---------- setup & input ----------
function loop(t) {
  const dt = Math.min(0.05, (t - (lastT || t)) / 1000);
  lastT = t;
  if (S && mapCanvas && !document.hidden) drawDynamic(t, dt);
  requestAnimationFrame(loop);
}
function resizeMap() {
  if (!mapCanvas) return;
  const wrap = mapCanvas.parentElement;
  cssW = wrap.clientWidth;
  cssH = Math.round(Math.min(cssW * MAP_H / MAP_W, Math.max(260, window.innerHeight * 0.66)));
  dprNow = Math.min(2, window.devicePixelRatio || 1);
  mapCanvas.style.height = cssH + 'px';
  mapCanvas.width = Math.round(cssW * dprNow); mapCanvas.height = Math.round(cssH * dprNow);
  const newK = cssW / MAP_W;
  if (Math.abs(newK - baseK) > 0.01) { baseK = newK; chunkDpr = Math.min(dprNow, 1.5); chunkCache.forEach(m => m.clear()); }
  clampCam();
}
function placeAt([x, y]) {
  const far = cam.z < 0.45;
  for (const [id, p] of Object.entries(PLACES)) {
    if (far && (!p.far || p.town)) continue;
    const pad = p.far && far ? 60 / cam.z * 0.3 : 0;
    const [rx, ry, rw, rh] = p.r;
    if (x >= rx - pad && x <= rx + rw + pad && y >= ry - 8 - pad && y <= ry + rh + pad) return id;
  }
  if (far) for (let i = 0; i < TOWN_NAMES.length; i++) { const b2 = TOWN_NAMES[i].box; if (x > b2[0] - 100 && x < b2[0] + b2[2] + 100 && y > b2[1] - 100 && y < b2[1] + b2[3] + 100) return 'town:' + i; }
  return null;
}
function initMap() {
  mapCanvas = $('#map');
  mapCtx = mapCanvas.getContext('2d');
  initMovers();
  resizeMap();
  buildTown();
  setTimeout(buildMinimap, 50);
  const [px, py] = playerPos(); cam.x = px; cam.y = py; clampCam();
  window.addEventListener('resize', () => { clearTimeout(initMap._t); initMap._t = setTimeout(resizeMap, 150); });
  const pts = new Map();
  let drag = null, pinch = null;
  const local = e => { const r = mapCanvas.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  mapCanvas.addEventListener('pointerdown', e => {
    mapCanvas.setPointerCapture(e.pointerId);
    pts.set(e.pointerId, local(e));
    if (pts.size === 1) drag = { start: local(e), last: local(e), moved: false };
    if (pts.size === 2) { const [a, b2] = [...pts.values()]; pinch = { d: Math.hypot(a[0] - b2[0], a[1] - b2[1]) }; drag = null; }
  });
  mapCanvas.addEventListener('pointermove', e => {
    const p = local(e);
    if (pts.has(e.pointerId)) pts.set(e.pointerId, p);
    if (pinch && pts.size === 2) {
      const [a, b2] = [...pts.values()]; const d = Math.hypot(a[0] - b2[0], a[1] - b2[1]);
      zoomAt(d / pinch.d, (a[0] + b2[0]) / 2, (a[1] + b2[1]) / 2); pinch.d = d; cam.follow = false; return;
    }
    if (drag) {
      if (Math.hypot(p[0] - drag.start[0], p[1] - drag.start[1]) > 6) drag.moved = true;
      if (drag.moved) { const k = kNow(); cam.x -= (p[0] - drag.last[0]) / k; cam.y -= (p[1] - drag.last[1]) / k; cam.follow = false; clampCam(); mapCanvas.style.cursor = 'grabbing'; }
      drag.last = p; return;
    }
    hover = placeAt(toWorld(...p));
    mapCanvas.style.cursor = hover ? 'pointer' : 'grab';
  });
  const end = e => {
    const wasDrag = drag && drag.moved;
    const p = local(e);
    pts.delete(e.pointerId);
    if (pts.size < 2) pinch = null;
    if (drag && !wasDrag) {
      const id = placeAt(toWorld(...p));
      if (id && id.startsWith('town:')) { const tn = TOWN_NAMES[+id.slice(5)]; cam.x = tn.x; cam.y = tn.y; cam.z = 1; cam.follow = false; clampCam(); }
      else if (id) clickPlace(id);
    }
    drag = null; mapCanvas.style.cursor = 'grab';
  };
  mapCanvas.addEventListener('pointerup', end);
  mapCanvas.addEventListener('pointercancel', end);
  mapCanvas.addEventListener('pointerleave', () => { hover = null; });
  mapCanvas.addEventListener('wheel', e => { e.preventDefault(); const p = local(e); zoomAt(Math.exp(-e.deltaY * 0.0015), p[0], p[1]); cam.follow = false; }, { passive: false });
  requestAnimationFrame(loop);
}
function clickPlace(id) {
  if (!S || traveler) return;
  const p = PLACES[id];
  if (p.kind === 'home') {
    if (id === HOME_PLACE[S.home]) return travelTo('home');
    if (id === 'h_parents') return travelTo('h_parents');
    toast(`${p.icon} That's the ${p.name}. Visit 🔑 Real Estate to live there.`);
    return;
  }
  if (p.kind === 'deco') { toast(`${p.icon} ${p.name}`); return; }
  travelTo(id);
}
