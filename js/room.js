// ===================== INSIDE YOUR HOME (realistic drawing) =====================
// Every object is drawn with light from the window (top-left), soft shadows,
// and textures like wood grain, fabric and shiny metal.

const RW = 1000, RH = 380, FLOOR_Y = 268;

function rgb(hex) { const n = parseInt(hex.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; }
function tone(hex, amt, a = 1) {
  const [r, g, b] = rgb(hex);
  const f = v => Math.max(0, Math.min(255, Math.round(amt >= 0 ? v + (255 - v) * amt : v * (1 + amt))));
  return `rgba(${f(r)},${f(g)},${f(b)},${a})`;
}
function rrect(c, x, y, w, h, r) { c.beginPath(); if (c.roundRect) c.roundRect(x, y, w, h, r); else c.rect(x, y, w, h); }

// A solid object lit from the top-left.
function solid(c, x, y, w, h, col, r = 3, opt = {}) {
  const g = c.createLinearGradient(x, y, x + w * 0.6, y + h);
  g.addColorStop(0, tone(col, opt.hi ?? 0.14)); g.addColorStop(0.55, col); g.addColorStop(1, tone(col, -(opt.lo ?? 0.22)));
  c.fillStyle = g; rrect(c, x, y, w, h, r); c.fill();
  c.strokeStyle = tone(col, 0.35, 0.6); c.lineWidth = 1; c.beginPath(); c.moveTo(x + r, y + 0.5); c.lineTo(x + w - r, y + 0.5); c.stroke();
  c.strokeStyle = tone(col, -0.45, 0.5); c.beginPath(); c.moveTo(x + r, y + h - 0.5); c.lineTo(x + w - r, y + h - 0.5); c.stroke();
}
// Shiny metal (fridge, stove, faucets)
function metal(c, x, y, w, h, r = 4, base = '#d9dee2') {
  const g = c.createLinearGradient(x, 0, x + w, 0);
  g.addColorStop(0, tone(base, -0.12)); g.addColorStop(0.18, tone(base, 0.5)); g.addColorStop(0.32, base);
  g.addColorStop(0.7, tone(base, -0.06)); g.addColorStop(0.88, tone(base, 0.25)); g.addColorStop(1, tone(base, -0.2));
  c.fillStyle = g; rrect(c, x, y, w, h, r); c.fill();
  c.strokeStyle = 'rgba(60,70,80,.35)'; c.lineWidth = 1; rrect(c, x + 0.5, y + 0.5, w - 1, h - 1, r); c.stroke();
}
// Wood with grain lines
function wood(c, x, y, w, h, col = '#8b5a33', r = 2, seed = 1) {
  solid(c, x, y, w, h, col, r, { hi: 0.12, lo: 0.25 });
  c.save(); rrect(c, x, y, w, h, r); c.clip();
  let s = seed * 9301;
  const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  c.strokeStyle = tone(col, -0.3, 0.35); c.lineWidth = 0.8;
  const horiz = w > h;
  for (let i = 0; i < (horiz ? h : w) / 3; i++) {
    c.beginPath();
    if (horiz) { const yy = y + rnd() * h; c.moveTo(x, yy); c.bezierCurveTo(x + w * 0.3, yy + (rnd() - 0.5) * 3, x + w * 0.7, yy + (rnd() - 0.5) * 3, x + w, yy + (rnd() - 0.5) * 2); }
    else { const xx = x + rnd() * w; c.moveTo(xx, y); c.bezierCurveTo(xx + (rnd() - 0.5) * 3, y + h * 0.3, xx + (rnd() - 0.5) * 3, y + h * 0.7, xx + (rnd() - 0.5) * 2, y + h); }
    c.stroke();
  }
  c.restore();
}
// Soft fabric (couch, bed)
function fabric(c, x, y, w, h, col, r = 6) {
  const g = c.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, tone(col, 0.18)); g.addColorStop(0.35, col); g.addColorStop(1, tone(col, -0.28));
  c.fillStyle = g; rrect(c, x, y, w, h, r); c.fill();
  c.save(); rrect(c, x, y, w, h, r); c.clip();
  c.fillStyle = tone(col, -0.3, 0.07);
  for (let i = 0; i < w * h / 14; i++) c.fillRect(x + ((i * 37.7) % w), y + ((i * 13.3) % h), 1, 1);
  c.restore();
}
// Porcelain (toilet, tub, sink)
function porcelain(c, x, y, w, h, r = 8) {
  const g = c.createLinearGradient(x, y, x + w, y + h);
  g.addColorStop(0, '#ffffff'); g.addColorStop(0.6, '#eef2f4'); g.addColorStop(1, '#c9d2d8');
  c.fillStyle = g; rrect(c, x, y, w, h, r); c.fill();
  c.strokeStyle = 'rgba(120,135,150,.45)'; c.lineWidth = 1; c.stroke();
}
function glass(c, x, y, w, h, tint = 'rgba(190,225,245,.35)') {
  c.fillStyle = tint; c.fillRect(x, y, w, h);
  c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
  c.fillStyle = 'rgba(255,255,255,.35)';
  c.beginPath(); c.moveTo(x + w * 0.15, y); c.lineTo(x + w * 0.35, y); c.lineTo(x + w * 0.05, y + h); c.lineTo(x - w * 0.15, y + h); c.fill();
  c.fillStyle = 'rgba(255,255,255,.18)';
  c.beginPath(); c.moveTo(x + w * 0.45, y); c.lineTo(x + w * 0.52, y); c.lineTo(x + w * 0.22, y + h); c.lineTo(x + w * 0.15, y + h); c.fill();
  c.restore();
}
// Soft shadow on the floor under an object, and on the wall behind it
function floorShadow(c, x, w, y = FLOOR_Y + 2, depth = 10) {
  c.save(); c.filter = 'blur(5px)';
  c.fillStyle = 'rgba(30,20,10,.35)'; c.beginPath(); c.ellipse(x + w / 2 + 6, y, w / 2 + 4, depth, 0, 0, Math.PI * 2); c.fill();
  c.restore();
}
function wallShadow(c, x, y, w, h) {
  c.save(); c.filter = 'blur(6px)'; c.fillStyle = 'rgba(40,30,20,.22)'; c.fillRect(x + 7, y + 5, w, h); c.restore();
}


// ---------- 3D helpers ----------
// The room is seen from the front, a little from above. Everything shrinks toward this point:
const VP = [500, 150];
function persp(p, k) { return [p[0] + (VP[0] - p[0]) * k, p[1] + (VP[1] - p[1]) * k]; }
function quad(c, a, b, d, e, fill) { c.fillStyle = fill; c.beginPath(); c.moveTo(...a); c.lineTo(...b); c.lineTo(...d); c.lineTo(...e); c.closePath(); c.fill(); }
// A box: front face (x, y, w, h) plus its top and side going back toward the wall (k = depth)
function box3d(c, x, y, w, h, k, col, mat = 'solid', seed = 1) {
  const TL = [x, y], TR = [x + w, y], BL = [x, y + h], BR = [x + w, y + h];
  const bTL = persp(TL, k), bTR = persp(TR, k), bBL = persp(BL, k), bBR = persp(BR, k);
  const shiny = mat === 'metal' || mat === 'porcelain';
  const sideCol = shiny ? tone(col, -0.16) : tone(col, -0.3);
  if (x > VP[0]) { const g = c.createLinearGradient(bTL[0], 0, x, 0); g.addColorStop(0, tone(col, -0.42)); g.addColorStop(1, sideCol); quad(c, TL, bTL, bBL, BL, g); }
  else if (x + w < VP[0]) { const g = c.createLinearGradient(x + w, 0, bTR[0], 0); g.addColorStop(0, sideCol); g.addColorStop(1, tone(col, -0.45)); quad(c, TR, bTR, bBR, BR, g); }
  if (y > VP[1]) { const g = c.createLinearGradient(0, bTL[1], 0, y); g.addColorStop(0, tone(col, 0.02)); g.addColorStop(1, tone(col, shiny ? 0.3 : 0.2)); quad(c, TL, TR, bTR, bTL, g); }
  if (mat === 'wood') wood(c, x, y, w, h, col, 1.5, seed);
  else if (mat === 'fabric') fabric(c, x, y, w, h, col, Math.min(6, h / 3));
  else if (mat === 'metal') metal(c, x, y, w, h, 2, col);
  else if (mat === 'porcelain') porcelain(c, x, y, w, h, Math.min(6, h / 3));
  else solid(c, x, y, w, h, col, 1.5);
  c.strokeStyle = 'rgba(255,255,255,.28)'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(x + 1, y + 0.4); c.lineTo(x + w - 1, y + 0.4); c.stroke();
}
// a raised panel (cabinet doors, drawers)
function bevel(c, x, y, w, h, col) {
  c.strokeStyle = tone(col, 0.3, 0.7); c.lineWidth = 1.2; c.beginPath(); c.moveTo(x, y + h); c.lineTo(x, y); c.lineTo(x + w, y); c.stroke();
  c.strokeStyle = tone(col, -0.5, 0.7); c.beginPath(); c.moveTo(x + w, y); c.lineTo(x + w, y + h); c.lineTo(x, y + h); c.stroke();
  const g = c.createLinearGradient(x, y, x + w, y + h); g.addColorStop(0, 'rgba(255,255,255,.07)'); g.addColorStop(1, 'rgba(0,0,0,.08)');
  c.fillStyle = g; c.fillRect(x + 1, y + 1, w - 2, h - 2);
}
// a round knob or button
function knob(c, x, y, r, col) {
  c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.arc(x + r * 0.35, y + r * 0.4, r, 0, Math.PI * 2); c.fill();
  const g = c.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r);
  g.addColorStop(0, tone(col, 0.6)); g.addColorStop(0.5, col); g.addColorStop(1, tone(col, -0.4));
  c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
}
// a soft puffy pillow
function pillow(c, x, y, w, h, col = '#ffffff') {
  c.fillStyle = 'rgba(0,0,0,.12)'; c.beginPath(); c.ellipse(x + w / 2 + 2, y + h - 1, w / 2, 3, 0, 0, Math.PI * 2); c.fill();
  const g = c.createRadialGradient(x + w * 0.35, y + h * 0.3, 1, x + w / 2, y + h / 2, w * 0.65);
  g.addColorStop(0, tone(col, 0.25)); g.addColorStop(0.6, col); g.addColorStop(1, tone(col, -0.22));
  c.fillStyle = g;
  c.beginPath(); c.moveTo(x + 3, y + 3);
  c.quadraticCurveTo(x + w / 2, y - 2, x + w - 3, y + 3); c.quadraticCurveTo(x + w + 2, y + h / 2, x + w - 3, y + h - 2);
  c.quadraticCurveTo(x + w / 2, y + h + 2, x + 3, y + h - 2); c.quadraticCurveTo(x - 2, y + h / 2, x + 3, y + 3); c.fill();
  c.strokeStyle = tone(col, -0.25, 0.5); c.lineWidth = 0.7;
  c.beginPath(); c.moveTo(x + w * 0.3, y + h * 0.45); c.quadraticCurveTo(x + w / 2, y + h * 0.6, x + w * 0.7, y + h * 0.42); c.stroke();
}
// a book standing on a shelf
function book(c, x, y, w, h, col) {
  solid(c, x, y, w, h, col, 0.8, { hi: 0.25, lo: 0.3 });
  c.fillStyle = 'rgba(255,230,160,.65)'; c.fillRect(x + 0.6, y + 3.5, w - 1.2, 1.1); c.fillRect(x + 0.6, y + h - 5, w - 1.2, 1.1);
  c.fillStyle = 'rgba(255,255,255,.45)'; c.fillRect(x + w / 2 - 0.4, y + 7, 0.8, h * 0.35);
  c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(x + w - 0.8, y, 0.8, h);
}

// dishes, clothes on the floor, trash bags and ants when your home is messy
function drawMess(c) {
  if (S.dishes > 0) for (let k = 0; k < Math.min(6, S.dishes); k++) { const x = 500 + (k % 3) * 18, y = 258 - Math.floor(k / 3) * 5; c.fillStyle = '#f5f5f5'; c.beginPath(); c.ellipse(x, y, 9, 2.6, 0, 0, Math.PI * 2); c.fill(); c.strokeStyle = 'rgba(120,90,40,.6)'; c.lineWidth = 1; c.stroke(); }
  if (S.mess > 45) { [[230, 330, '#1e88e5'], [520, 345, '#e53935'], [360, 352, '#43a047']].slice(0, S.mess > 70 ? 3 : 1).forEach(([x, y, col]) => { c.fillStyle = col; c.beginPath(); c.moveTo(x - 14, y); c.quadraticCurveTo(x - 6, y - 10, x + 4, y - 4); c.quadraticCurveTo(x + 16, y - 8, x + 14, y + 2); c.closePath(); c.fill(); }); }
  if (S.trash > 70) { c.fillStyle = '#263238'; c.beginPath(); c.moveTo(752, 268); c.quadraticCurveTo(744, 236, 762, 230); c.quadraticCurveTo(782, 236, 774, 268); c.fill(); c.fillStyle = '#455a64'; c.fillRect(758, 226, 8, 6); }
  if (S.bugs) { c.fillStyle = '#1a1a1a'; for (let k = 0; k < 18; k++) { c.beginPath(); c.arc(560 + k * 7 + Math.sin(k) * 3, 265 + Math.cos(k * 1.7) * 3, 1.2, 0, Math.PI * 2); c.fill(); } }
  if (has('smokedetector')) { c.fillStyle = '#f5f5f5'; c.beginPath(); c.ellipse(640, 14, 12, 4, 0, 0, Math.PI * 2); c.fill(); c.fillStyle = '#e53935'; c.beginPath(); c.arc(646, 15, 1.2, 0, Math.PI * 2); c.fill(); }
}

function drawRoom(cv, fixedW) {
  const cssW = fixedW || cv.parentElement.clientWidth;
  const dpr = fixedW ? 1 : Math.min(2, window.devicePixelRatio || 1);
  if (!fixedW) cv.style.height = (cssW * RH / RW) + 'px';
  cv.width = Math.round(cssW * dpr); cv.height = Math.round(cssW * dpr * RH / RW);
  const c = cv.getContext('2d');
  c.setTransform(cv.width / RW, 0, 0, cv.width / RW, 0, 0);
  c.lineCap = 'round'; c.lineJoin = 'round';
  const night = S.hour < 6 || S.hour >= 20;
  const dusk = !night && (S.hour < 7.5 || S.hour > 18);
  const rainy = S.weather === 'rainy' || S.weather === 'snowy';
  const own = f => hasF(f);
  const BATH_X = 790;
  const ghost = (x, y, w, h, label) => {
    c.save(); c.setLineDash([7, 6]); c.strokeStyle = 'rgba(70,70,70,.6)'; c.lineWidth = 2; rrect(c, x, y, w, h, 6); c.stroke(); c.restore();
    c.fillStyle = 'rgba(255,255,255,.55)'; rrect(c, x + w / 2 - 34, y + h / 2 - 11, 68, 22, 11); c.fill();
    txt(c, label, x + w / 2, y + h / 2, '#444', 12, 700);
  };

  // ---------- walls ----------
  const wallCol = S.wallColor;
  const wg = c.createLinearGradient(0, 0, 0, FLOOR_Y);
  wg.addColorStop(0, tone(wallCol, -0.1)); wg.addColorStop(0.35, wallCol); wg.addColorStop(1, tone(wallCol, -0.06));
  c.fillStyle = wg; c.fillRect(0, 0, BATH_X, FLOOR_Y);
  // plaster texture
  for (let i = 0; i < 2500; i++) { c.fillStyle = i % 2 ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.035)'; c.fillRect((i * 97.31) % BATH_X, (i * 41.7) % FLOOR_Y, 1.5, 1.5); }
  // corners darker (ambient occlusion)
  const ao = c.createLinearGradient(0, 0, BATH_X, 0);
  ao.addColorStop(0, 'rgba(0,0,0,.12)'); ao.addColorStop(0.08, 'rgba(0,0,0,0)'); ao.addColorStop(0.94, 'rgba(0,0,0,0)'); ao.addColorStop(1, 'rgba(0,0,0,.14)');
  c.fillStyle = ao; c.fillRect(0, 0, BATH_X, FLOOR_Y);
  // crown molding
  c.fillStyle = '#f7f4ee'; c.fillRect(0, 0, BATH_X, 12);
  c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(0, 12, BATH_X, 3);
  c.fillStyle = 'rgba(255,255,255,.7)'; c.fillRect(0, 4, BATH_X, 1.5);
  if (S.home === 'mansion') { c.fillStyle = '#c9a227'; c.fillRect(0, 9, BATH_X, 3); }
  // light switch & outlet
  solid(c, 268, 140, 12, 18, '#f4f2ec', 2); c.fillStyle = '#ddd'; c.fillRect(272, 145, 4, 8);
  solid(c, 600, 238, 12, 14, '#f4f2ec', 2); c.fillStyle = '#555'; c.fillRect(603, 242, 2, 4); c.fillRect(607, 242, 2, 4);

  // ---------- bathroom tiles ----------
  const tg = c.createLinearGradient(BATH_X, 0, RW, FLOOR_Y); tg.addColorStop(0, '#eef4f7'); tg.addColorStop(1, '#d4e0e6');
  c.fillStyle = tg; c.fillRect(BATH_X, 0, RW - BATH_X, FLOOR_Y);
  for (let y = 0; y < FLOOR_Y; y += 22) for (let x = BATH_X + ((y / 22) % 2) * 11; x < RW; x += 22) {
    c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(x + 1, y + 1, 19, 3);
    c.strokeStyle = 'rgba(140,160,175,.45)'; c.lineWidth = 1; c.strokeRect(x + 0.5, y + 0.5, 21, 21);
  }
  // dividing wall edge with door frame
  const dw = c.createLinearGradient(BATH_X - 8, 0, BATH_X + 6, 0); dw.addColorStop(0, '#b9b1a3'); dw.addColorStop(1, '#8d857a');
  c.fillStyle = dw; c.fillRect(BATH_X - 8, 0, 14, FLOOR_Y);
  wood(c, BATH_X - 10, 100, 4, FLOOR_Y - 100, '#9a6b42', 1, 3);

  // ---------- floors ----------
  const fg = c.createLinearGradient(0, FLOOR_Y, 0, RH);
  fg.addColorStop(0, '#8a5d35'); fg.addColorStop(1, '#c08c58');
  c.fillStyle = fg; c.fillRect(0, FLOOR_Y, BATH_X, RH - FLOOR_Y);
  const altFloor = drawDecorFloor(c, RW, RH, FLOOR_Y, BATH_X);
  // planks get wider toward you (perspective)
  let py = altFloor ? RH : FLOOR_Y, row = 0;
  while (py < RH) {
    const ph = 7 + row * 2.6;
    const offset = (row * 137) % 160;
    for (let x = -offset; x < BATH_X; x += 160) {
      const shadeV = ((row * 7 + x) % 5) * 0.025;
      c.fillStyle = `rgba(${row % 2 ? '255,230,200' : '60,35,15'},${0.04 + shadeV})`;
      c.fillRect(x, py, 160, ph);
      c.fillStyle = 'rgba(50,30,10,.35)'; c.fillRect(x, py, 1, ph);
      c.strokeStyle = 'rgba(70,40,15,.12)'; c.lineWidth = 0.7;
      for (let k = 1; k < 3; k++) { c.beginPath(); c.moveTo(x + 4, py + ph * k / 3); c.quadraticCurveTo(x + 80, py + ph * k / 3 + 1.5, x + 156, py + ph * k / 3); c.stroke(); }
    }
    c.fillStyle = 'rgba(40,25,10,.4)'; c.fillRect(0, py, BATH_X, 1);
    py += ph; row++;
  }
  // floor shine
  const shine = c.createLinearGradient(0, FLOOR_Y, 0, RH); shine.addColorStop(0, 'rgba(255,255,255,0)'); shine.addColorStop(0.5, 'rgba(255,240,220,.07)'); shine.addColorStop(1, 'rgba(0,0,0,.1)');
  c.fillStyle = shine; c.fillRect(0, FLOOR_Y, BATH_X, RH - FLOOR_Y);
  drawRug(c);
  // bathroom floor tiles
  c.fillStyle = '#c9d3d9'; c.fillRect(BATH_X, FLOOR_Y, RW - BATH_X, RH - FLOOR_Y);
  for (let y = FLOOR_Y, k = 0; y < RH; k++) { const h = 10 + k * 4; for (let x = BATH_X + (k % 2) * 15; x < RW; x += 30) { c.fillStyle = (k + x / 30) % 2 ? '#d7e0e5' : '#c3ced5'; c.fillRect(x, y, 29, h - 1); } y += h; }
  // baseboard
  c.fillStyle = '#f7f4ee'; c.fillRect(0, FLOOR_Y - 12, BATH_X - 8, 12);
  c.fillStyle = 'rgba(255,255,255,.8)'; c.fillRect(0, FLOOR_Y - 12, BATH_X - 8, 2);
  c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(0, FLOOR_Y - 1, BATH_X - 8, 2);
  // wall/floor corner shadow
  const cs = c.createLinearGradient(0, FLOOR_Y, 0, FLOOR_Y + 14); cs.addColorStop(0, 'rgba(0,0,0,.28)'); cs.addColorStop(1, 'rgba(0,0,0,0)');
  c.fillStyle = cs; c.fillRect(0, FLOOR_Y, RW, 14);

  // ---------- window ----------
  const WX = 40, WY = 36, WW = 132, WH = 124;
  wallShadow(c, WX - 6, WY - 6, WW + 12, WH + 22);
  const sky = c.createLinearGradient(0, WY, 0, WY + WH);
  if (night) { sky.addColorStop(0, '#07122e'); sky.addColorStop(1, '#22365f'); }
  else if (rainy) { sky.addColorStop(0, '#7d8a9b'); sky.addColorStop(1, '#aeb8c4'); }
  else if (dusk) { sky.addColorStop(0, '#5a7bc0'); sky.addColorStop(1, '#f6b07a'); }
  else { sky.addColorStop(0, '#5aa9e6'); sky.addColorStop(1, '#cfe8fa'); }
  c.fillStyle = sky; c.fillRect(WX, WY, WW, WH);
  // view outside: distant trees and houses
  c.fillStyle = night ? '#1b2a3a' : rainy ? '#6f8270' : '#7fa86a';
  c.beginPath(); c.moveTo(WX, WY + WH);
  for (let i = 0; i <= 8; i++) c.lineTo(WX + WW * i / 8, WY + WH * 0.72 - Math.sin(i * 1.7) * 8 - (i % 3) * 3);
  c.lineTo(WX + WW, WY + WH); c.fill();
  c.fillStyle = night ? '#24303e' : '#c7b9a6'; c.fillRect(WX + 80, WY + WH * 0.66, 26, 22);
  c.fillStyle = night ? '#ffd56e' : '#9fc4dd'; c.fillRect(WX + 86, WY + WH * 0.7, 6, 6);
  if (night) {
    c.fillStyle = '#fff'; for (let i = 0; i < 14; i++) c.fillRect(WX + 6 + (i * 41) % (WW - 12), WY + 6 + (i * 23) % 50, 1.6, 1.6);
    const mg = c.createRadialGradient(WX + 104, WY + 28, 2, WX + 104, WY + 28, 24); mg.addColorStop(0, 'rgba(255,255,230,1)'); mg.addColorStop(0.4, 'rgba(255,255,230,.9)'); mg.addColorStop(0.45, 'rgba(255,255,230,.25)'); mg.addColorStop(1, 'rgba(255,255,230,0)');
    c.fillStyle = mg; c.beginPath(); c.arc(WX + 104, WY + 28, 24, 0, Math.PI * 2); c.fill();
  } else if (!rainy) {
    const sg = c.createRadialGradient(WX + 30, WY + 28, 2, WX + 30, WY + 28, 30); sg.addColorStop(0, 'rgba(255,250,210,1)'); sg.addColorStop(0.35, 'rgba(255,240,170,.9)'); sg.addColorStop(1, 'rgba(255,240,170,0)');
    c.fillStyle = sg; c.beginPath(); c.arc(WX + 30, WY + 28, 30, 0, Math.PI * 2); c.fill();
    c.fillStyle = 'rgba(255,255,255,.85)'; [[WX + 70, WY + 30, 14], [WX + 84, WY + 26, 11], [WX + 96, WY + 32, 10]].forEach(([x, y, r]) => { c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill(); });
  } else if (S.weather === 'snowy') {
    c.fillStyle = '#fff'; for (let i = 0; i < 40; i++) { c.beginPath(); c.arc(WX + (i * 29) % WW, WY + (i * 47) % WH, 1.6, 0, Math.PI * 2); c.fill(); }
  } else {
    c.strokeStyle = 'rgba(230,240,255,.6)'; c.lineWidth = 1;
    for (let i = 0; i < 30; i++) { const x = WX + (i * 29) % WW, y = WY + (i * 47) % WH; c.beginPath(); c.moveTo(x, y); c.lineTo(x - 3, y + 9); c.stroke(); }
  }
  if (seasonOf() === 'winter') { c.fillStyle = '#ffffff'; c.fillRect(WX, WY + WH * 0.74, WW, WH * 0.26); }
  if (seasonOf() === 'fall') { c.fillStyle = 'rgba(214,110,40,.55)'; c.beginPath(); c.moveTo(WX, WY + WH); for (let i = 0; i <= 8; i++) c.lineTo(WX + WW * i / 8, WY + WH * 0.72 - Math.sin(i * 1.7) * 8 - (i % 3) * 3); c.lineTo(WX + WW, WY + WH); c.fill(); }
  glass(c, WX, WY, WW, WH, 'rgba(200,230,250,.12)');
  // frame with depth
  c.lineWidth = 8; c.strokeStyle = '#f4f2ec'; c.strokeRect(WX - 4, WY - 4, WW + 8, WH + 8);
  c.lineWidth = 2; c.strokeStyle = 'rgba(0,0,0,.18)'; c.strokeRect(WX, WY, WW, WH);
  c.fillStyle = '#f4f2ec'; c.fillRect(WX + WW / 2 - 3, WY, 6, WH); c.fillRect(WX, WY + WH / 2 - 3, WW, 6);
  c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(WX + WW / 2 + 3, WY, 2, WH); c.fillRect(WX, WY + WH / 2 + 3, WW, 2);
  // sill
  solid(c, WX - 12, WY + WH + 4, WW + 24, 9, '#f2efe8', 2);
  // sunlight coming in
  if (!night && !rainy) {
    c.save();
    const lg = c.createLinearGradient(WX, WY, WX + 200, FLOOR_Y + 80);
    lg.addColorStop(0, `rgba(255,240,190,${dusk ? 0.22 : 0.16})`); lg.addColorStop(1, 'rgba(255,240,190,0)');
    c.fillStyle = lg;
    c.beginPath(); c.moveTo(WX, WY + WH); c.lineTo(WX + WW, WY + WH); c.lineTo(WX + WW + 150, FLOOR_Y + 100); c.lineTo(WX + 60, FLOOR_Y + 100); c.fill();
    c.restore();
  }
  if (has('curtains')) {
    [[WX - 34, 1], [WX + WW + 8, -1]].forEach(([x, d]) => {
      const cg = c.createLinearGradient(x, 0, x + 28, 0);
      for (let k = 0; k <= 4; k++) cg.addColorStop(k / 4, k % 2 ? '#9e3532' : '#c4514c');
      c.fillStyle = cg;
      c.beginPath(); c.moveTo(x, WY - 16); c.lineTo(x + 28, WY - 16); c.quadraticCurveTo(x + 28 + d * 6, WY + 90, x + 24 + d * 10, WY + WH + 18); c.lineTo(x + d * 4, WY + WH + 18); c.quadraticCurveTo(x - d * 2, WY + 80, x, WY - 16); c.fill();
    });
    metal(c, WX - 44, WY - 22, WW + 88, 5, 2, '#a68a5b');
  }

  drawSnowman(c);
  drawCurtains(c);
  // ---------- paintings ----------
  const spots = [[220, 46, 70, 54], [334, 34, 86, 66], [446, 56, 60, 46], [524, 40, 70, 54], [624, 32, 58, 44], [706, 40, 62, 48], [236, 124, 50, 38], [456, 124, 52, 38]];
  S.walls.forEach((w, i) => { const sp = spots[i]; if (sp) { wallShadow(c, sp[0] - 4, sp[1] - 4, sp[2] + 8, sp[3] + 8); drawArt(c, ...sp, w); } });

  // ---------- furniture (3D: every object shrinks toward the back of the room) ----------
  // bedroom
  if (has('wardrobe')) {
    floorShadow(c, 190, 74);
    box3d(c, 190, 112, 72, 150, 0.05, '#6e4527', 'wood', 7);
    box3d(c, 186, 104, 80, 9, 0.055, '#5a381f', 'wood', 8);
    [[195, 1], [228, 2]].forEach(([dx, n]) => {
      wood(c, dx, 118, 31, 136, '#7d5131', 2, 8 + n);
      [[dx + 4, 124, 23, 54], [dx + 4, 186, 23, 62]].forEach(([px, py, pw, ph]) => bevel(c, px, py, pw, ph, '#7d5131'));
    });
    knob(c, 222, 190, 2.6, '#d4af37'); knob(c, 232, 190, 2.6, '#d4af37');
    [[194, 262], [252, 262]].forEach(([fx, fy]) => { const g = c.createLinearGradient(fx, 0, fx + 8, 0); g.addColorStop(0, '#4a2d18'); g.addColorStop(1, '#2e1b0e'); c.fillStyle = g; c.beginPath(); c.moveTo(fx, fy); c.lineTo(fx + 8, fy); c.lineTo(fx + 6, fy + 6); c.lineTo(fx + 2, fy + 6); c.fill(); });
  }
  if (has('lamp')) {
    floorShadow(c, 164, 28, FLOOR_Y + 2, 5);
    c.fillStyle = '#3d4148'; c.beginPath(); c.ellipse(178, 262, 15, 4.5, 0, 0, Math.PI * 2); c.fill();
    const bg2 = c.createLinearGradient(163, 0, 193, 0); bg2.addColorStop(0, '#6b7079'); bg2.addColorStop(0.4, '#a5abb3'); bg2.addColorStop(1, '#3d4148');
    c.fillStyle = bg2; c.beginPath(); c.ellipse(178, 259, 15, 4.5, 0, Math.PI, 0); c.fill();
    metal(c, 176, 156, 4, 104, 2, '#5a5f66');
    if (night) {
      const g = c.createRadialGradient(178, 150, 4, 178, 170, 170);
      g.addColorStop(0, 'rgba(255,214,140,.55)'); g.addColorStop(0.5, 'rgba(255,214,140,.18)'); g.addColorStop(1, 'rgba(255,214,140,0)');
      c.fillStyle = g; c.fillRect(0, 0, 380, RH);
    }
    const lg = c.createLinearGradient(158, 0, 198, 0); lg.addColorStop(0, night ? '#fff6d8' : '#f2e7c9'); lg.addColorStop(0.6, night ? '#ffe2a0' : '#e2d3ad'); lg.addColorStop(1, night ? '#f2c470' : '#c2b18a');
    c.fillStyle = lg; c.beginPath(); c.moveTo(166, 132); c.lineTo(190, 132); c.lineTo(199, 160); c.lineTo(157, 160); c.closePath(); c.fill();
    c.fillStyle = night ? '#fff3cf' : '#d8caa6'; c.beginPath(); c.ellipse(178, 160, 21, 4, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = 'rgba(0,0,0,.18)'; c.beginPath(); c.ellipse(178, 132, 12, 2.6, 0, 0, Math.PI * 2); c.fill();
    c.strokeStyle = 'rgba(120,100,70,.35)'; c.lineWidth = 0.7; for (let k = 0; k < 5; k++) { c.beginPath(); c.moveTo(168 + k * 5, 132); c.lineTo(160 + k * 9.5, 160); c.stroke(); }
  }
  if (has('bed')) {
    floorShadow(c, 18, 160, FLOOR_Y + 6, 12);
    box3d(c, 22, 238, 150, 22, 0.08, '#6b4426', 'wood', 13);                         // frame
    box3d(c, 30, 214, 138, 26, 0.08, '#f3f1ec', 'fabric');                            // mattress
    c.strokeStyle = 'rgba(0,0,0,.07)'; c.setLineDash([2, 3]); c.beginPath(); c.moveTo(32, 236); c.lineTo(166, 236); c.stroke(); c.setLineDash([]);
    box3d(c, 66, 204, 104, 38, 0.08, '#3d6ea8', 'fabric');                            // duvet
    c.save(); rrect(c, 66, 204, 104, 38, 6); c.clip();
    c.strokeStyle = 'rgba(255,255,255,.22)'; c.lineWidth = 1;
    for (let k = 1; k < 4; k++) { c.beginPath(); c.moveTo(66 + k * 26, 204); c.lineTo(66 + k * 26, 242); c.stroke(); }
    c.beginPath(); c.moveTo(66, 223); c.lineTo(170, 223); c.stroke();
    c.fillStyle = 'rgba(255,255,255,.3)'; for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) { c.beginPath(); c.arc(79 + i * 26, 213 + j * 19, 2, 0, Math.PI * 2); c.fill(); }
    const fold = c.createLinearGradient(66, 0, 86, 0); fold.addColorStop(0, 'rgba(255,255,255,.35)'); fold.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = fold; c.fillRect(66, 204, 20, 38);
    c.restore();
    c.fillStyle = '#e9e5dc'; c.beginPath(); c.moveTo(66, 204); c.quadraticCurveTo(60, 222, 66, 242); c.lineTo(72, 242); c.quadraticCurveTo(66, 222, 72, 204); c.fill(); // folded sheet edge
    pillow(c, 34, 196, 36, 20);
    box3d(c, 16, 170, 16, 100, 0.03, '#5d3a1f', 'wood', 11);                        // headboard
    bevel(c, 19, 178, 10, 60, '#5d3a1f');
    box3d(c, 160, 214, 12, 56, 0.03, '#5d3a1f', 'wood', 12);                        // footboard
  } else if (hasF('mattress')) {
    floorShadow(c, 24, 144, FLOOR_Y + 8, 8);
    box3d(c, 24, 240, 144, 24, 0.1, '#ece7dc', 'fabric');
    c.strokeStyle = 'rgba(0,0,0,.12)'; c.lineWidth = 1; for (let k = 1; k < 6; k++) { c.beginPath(); c.arc(24 + k * 24, 252, 1.4, 0, Math.PI * 2); c.stroke(); }
    box3d(c, 66, 232, 100, 14, 0.1, '#8aa5c6', 'fabric');
    pillow(c, 30, 226, 34, 14);
  } else ghost(25, 220, 140, 42, '🛏️ No bed');

  // living room
  if (has('rug')) {
    c.save(); c.filter = 'blur(2px)'; c.fillStyle = 'rgba(0,0,0,.2)'; c.beginPath(); c.ellipse(424, 318, 138, 30, 0, 0, Math.PI * 2); c.fill(); c.restore();
    const rg = c.createRadialGradient(420, 310, 10, 420, 314, 140); rg.addColorStop(0, '#b55a68'); rg.addColorStop(1, '#7e3744');
    c.fillStyle = rg; c.beginPath(); c.ellipse(420, 312, 136, 28, 0, 0, Math.PI * 2); c.fill();
    c.strokeStyle = '#e6c27f'; c.lineWidth = 3; c.beginPath(); c.ellipse(420, 312, 120, 22, 0, 0, Math.PI * 2); c.stroke();
    c.lineWidth = 1.5; c.beginPath(); c.ellipse(420, 312, 70, 12, 0, 0, Math.PI * 2); c.stroke();
    for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; c.fillStyle = k % 2 ? '#e6c27f' : '#2f4f6f'; c.beginPath(); c.ellipse(420 + Math.cos(a) * 95, 312 + Math.sin(a) * 17, 5, 2, a, 0, Math.PI * 2); c.fill(); }
    c.strokeStyle = '#e6d2a8'; c.lineWidth = 1; for (let a = 0; a < Math.PI * 2; a += 0.06) { const ex = 420 + Math.cos(a) * 136, ey = 312 + Math.sin(a) * 28; c.beginPath(); c.moveTo(ex, ey); c.lineTo(ex + Math.cos(a) * 4, ey + Math.sin(a) * 2); c.stroke(); }
  }
  if (has('bookshelf')) {
    floorShadow(c, 280, 66);
    box3d(c, 280, 104, 66, 158, 0.05, '#5b3820', 'wood', 21);
    const ig = c.createLinearGradient(0, 110, 0, 258); ig.addColorStop(0, '#24140a'); ig.addColorStop(1, '#3b2312');
    c.fillStyle = ig; c.fillRect(285, 110, 56, 148);
    const colors = ['#9e2a2b', '#2b5f9e', '#2e7d4f', '#c9861a', '#6b3fa0', '#1f7a7a', '#b8562a', '#384d63', '#7d6b3d', '#c43c5c'];
    for (let s = 0; s < 4; s++) {
      const sy = 144 + s * 37;
      c.fillStyle = 'rgba(0,0,0,.4)'; c.fillRect(285, sy - 33, 56, 4);
      let x = 287;
      for (let k = 0; x < 337; k++) {
        const bw = 4 + ((k * 7 + s * 3) % 4), bh = 22 + ((k * 5 + s) % 3) * 4;
        const col = colors[(k * 3 + s * 2) % colors.length];
        if (s === 1 && k === 4) {   // a stack of books lying flat
          for (let j = 0; j < 3; j++) box3d(c, x, sy - 6 - j * 6, 22, 6, 0.01, colors[(j + 2) % colors.length], 'solid');
          x += 24; continue;
        }
        if (k === 5 && s % 2 === 0) { c.save(); c.translate(x, sy); c.rotate(-0.22); book(c, 0, -bh, bw, bh, col); c.restore(); x += bw + 6; continue; }
        book(c, x, sy - bh, bw, bh, col);
        x += bw + 0.6;
      }
      box3d(c, 284, sy, 58, 4, 0.05, '#6e4527', 'wood', 30 + s);
    }
    // trophy on top
    metal(c, 304, 92, 10, 4, 1, '#d4af37'); c.fillStyle = '#e8c547'; c.beginPath(); c.moveTo(302, 80); c.lineTo(316, 80); c.lineTo(312, 90); c.lineTo(306, 90); c.fill(); metal(c, 307, 88, 4, 6, 1, '#d4af37');
  }
  if (has('couch')) {
    floorShadow(c, 336, 172, FLOOR_Y + 2, 11);
    const cc = '#456f7c';
    box3d(c, 352, 186, 144, 36, 0.035, tone(cc, -0.05), 'fabric');                 // back
    [[372, 198], [398, 198], [424, 198], [450, 198], [476, 198], [385, 210], [411, 210], [437, 210], [463, 210]].forEach(([bx, by]) => { c.fillStyle = tone(cc, -0.4); c.beginPath(); c.arc(bx, by, 1.6, 0, Math.PI * 2); c.fill(); c.strokeStyle = tone(cc, -0.25, 0.5); c.lineWidth = 0.6; c.beginPath(); c.moveTo(bx - 6, by - 4); c.lineTo(bx, by); c.lineTo(bx + 6, by - 4); c.stroke(); });
    box3d(c, 348, 230, 152, 26, 0.09, tone(cc, -0.1), 'fabric');                     // base
    box3d(c, 358, 216, 68, 18, 0.09, cc, 'fabric');                                  // seat cushions
    box3d(c, 428, 216, 68, 18, 0.09, cc, 'fabric');
    c.strokeStyle = tone(cc, 0.3, 0.6); c.lineWidth = 1; c.setLineDash([2, 2]);
    [[358, 68], [428, 68]].forEach(([sx, sw]) => { c.beginPath(); c.moveTo(sx + 3, 219); c.lineTo(sx + sw - 3, 219); c.stroke(); });
    c.setLineDash([]);
    box3d(c, 336, 204, 24, 54, 0.09, tone(cc, -0.12), 'fabric');                     // arms
    box3d(c, 488, 204, 24, 54, 0.09, tone(cc, -0.12), 'fabric');
    [[336, 24], [488, 24]].forEach(([ax, aw]) => { c.fillStyle = tone(cc, 0.12); c.beginPath(); c.ellipse(ax + aw / 2, 205, aw / 2, 5, 0, 0, Math.PI * 2); c.fill(); });
    [[346, 256], [500, 256]].forEach(([lx, ly]) => { c.fillStyle = '#3e2614'; c.beginPath(); c.moveTo(lx, ly); c.lineTo(lx + 7, ly); c.lineTo(lx + 5, ly + 11); c.lineTo(lx + 2, ly + 11); c.fill(); });
    pillow(c, 362, 198, 30, 24, '#e8b04b'); pillow(c, 462, 200, 28, 22, '#e7e1d4');
    c.strokeStyle = '#c98a1e'; c.lineWidth = 0.8; for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(366 + k * 7, 202); c.lineTo(366 + k * 7, 218); c.stroke(); }
  }
  if (has('aquarium')) {
    floorShadow(c, 505, 72);
    box3d(c, 503, 214, 74, 48, 0.07, '#4a2f1d', 'wood', 41);
    bevel(c, 508, 222, 30, 34, '#4a2f1d'); bevel(c, 542, 222, 30, 34, '#4a2f1d'); knob(c, 536, 238, 1.8, '#c0a060'); knob(c, 544, 238, 1.8, '#c0a060');
    box3d(c, 505, 160, 70, 54, 0.06, '#5fb3e0', 'solid');
    const ag = c.createLinearGradient(0, 166, 0, 214); ag.addColorStop(0, 'rgba(120,205,240,1)'); ag.addColorStop(1, 'rgba(25,100,160,1)');
    c.fillStyle = ag; c.fillRect(507, 166, 66, 47);
    c.fillStyle = 'rgba(255,255,255,.25)'; for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(510 + k * 22, 166); c.lineTo(520 + k * 22, 166); c.lineTo(500 + k * 22 + 30, 213); c.lineTo(492 + k * 22 + 30, 213); c.fill(); }
    c.fillStyle = '#d8c39a'; c.beginPath(); c.moveTo(507, 213); c.quadraticCurveTo(540, 202, 573, 209); c.lineTo(573, 213); c.fill();
    for (let k = 0; k < 14; k++) { c.fillStyle = ['#a1887f', '#ffffff', '#ff8a65', '#90a4ae'][k % 4]; c.beginPath(); c.arc(510 + k * 4.6, 210 + (k % 3), 1.3, 0, Math.PI * 2); c.fill(); }
    c.strokeStyle = '#3f8f3f'; c.lineWidth = 2; [[514, 212], [520, 212], [566, 212]].forEach(([x, y], i) => { c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + 6, y - 14, x - 2, y - 26 - i * 4); c.stroke(); });
    c.fillStyle = '#8d6e63'; c.beginPath(); c.moveTo(548, 212); c.lineTo(552, 196); c.lineTo(562, 194); c.lineTo(566, 212); c.fill(); c.fillStyle = '#4e342e'; c.beginPath(); c.arc(557, 204, 3, 0, Math.PI * 2); c.fill();
    const fish = (x, y, col, d) => { const g = c.createLinearGradient(x - 7, y - 4, x + 7, y + 4); g.addColorStop(0, tone(col, 0.35)); g.addColorStop(1, tone(col, -0.2)); c.fillStyle = g; c.beginPath(); c.ellipse(x, y, 7, 4, 0, 0, Math.PI * 2); c.fill(); c.fillStyle = col; c.beginPath(); c.moveTo(x - d * 6, y); c.lineTo(x - d * 11, y - 4); c.lineTo(x - d * 11, y + 4); c.fill(); c.beginPath(); c.moveTo(x - d * 2, y - 3); c.lineTo(x + d * 1, y - 7); c.lineTo(x + d * 3, y - 3); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(x + d * 3.5, y - 1, 1.3, 0, Math.PI * 2); c.fill(); c.fillStyle = '#111'; c.beginPath(); c.arc(x + d * 3.7, y - 1, 0.7, 0, Math.PI * 2); c.fill(); };
    fish(530, 182, '#ff9f1c', 1); fish(556, 194, '#e63946', -1); fish(538, 199, '#ffd23f', 1);
    c.fillStyle = 'rgba(255,255,255,.75)'; [[550, 178, 1.6], [552, 172, 1.2], [549, 168, 0.9]].forEach(([x, y, r]) => { c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill(); });
    box3d(c, 503, 156, 74, 6, 0.06, '#222', 'solid');
  }
  if (has('tv')) {
    wallShadow(c, 368, 156, 116, 8);
    box3d(c, 368, 156, 116, 7, 0.025, '#4e3423', 'wood', 51);                       // floating shelf under the TV
    if (has('console')) { box3d(c, 432, 147, 34, 9, 0.02, '#1c1c1e', 'solid'); c.fillStyle = '#39c'; c.fillRect(437, 151, 5, 1.5); box3d(c, 386, 151, 18, 5, 0.02, '#2b2b2e', 'solid'); }
    else { book(c, 380, 140, 5, 16, '#2b5f9e'); book(c, 386, 142, 5, 14, '#9e2a2b'); }
    box3d(c, 374, 86, 104, 60, 0.012, '#121416', 'solid');                          // wall-mounted TV
    const sc = c.createLinearGradient(378, 90, 474, 142);
    if (night) { sc.addColorStop(0, '#4a86e0'); sc.addColorStop(0.65, '#7cc4f5'); sc.addColorStop(0.66, '#5fb85a'); sc.addColorStop(1, '#3f9440'); }
    else { sc.addColorStop(0, '#26323e'); sc.addColorStop(1, '#0d1319'); }
    c.fillStyle = sc; c.fillRect(378, 90, 96, 52);
    if (night) { c.fillStyle = '#ffd23f'; c.beginPath(); c.arc(456, 102, 6, 0, Math.PI * 2); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(398, 104, 6, 0, Math.PI * 2); c.arc(406, 102, 7, 0, Math.PI * 2); c.arc(414, 105, 5, 0, Math.PI * 2); c.fill(); drawPerson(c, 430, 140, 0.6, { skin: '#f3c9a0', hair: '#8a5230', style: 'ponytail', shirt: '#e53935', pants: '#24395e' }); }
    glass(c, 378, 90, 96, 52, 'rgba(255,255,255,0)');
    c.fillStyle = 'rgba(255,255,255,.5)'; c.fillRect(424, 143, 4, 1.5);
    if (night) { const tvg = c.createRadialGradient(425, 140, 10, 425, 180, 160); tvg.addColorStop(0, 'rgba(110,160,255,.18)'); tvg.addColorStop(1, 'rgba(110,160,255,0)'); c.fillStyle = tvg; c.fillRect(260, 80, 340, 260); }
  }
  if (has('desk')) {
    floorShadow(c, 588, 86);
    box3d(c, 640, 198, 26, 36, 0.07, '#6f472d', 'wood', 64);                        // drawers
    bevel(c, 643, 202, 20, 13, '#6f472d'); bevel(c, 643, 218, 20, 13, '#6f472d');
    metal(c, 649, 207, 8, 2.5, 1, '#b8a070'); metal(c, 649, 223, 8, 2.5, 1, '#b8a070');
    box3d(c, 592, 198, 6, 64, 0.07, '#6a442b', 'wood', 62); box3d(c, 662, 198, 6, 64, 0.07, '#6a442b', 'wood', 63);
    box3d(c, 586, 190, 88, 8, 0.07, '#7a5135', 'wood', 61);                         // top
    if (has('laptop')) {
      box3d(c, 604, 186, 46, 4, 0.08, '#b0b8bf', 'metal');
      c.fillStyle = '#1d2329'; rrect(c, 610, 156, 34, 30, 2); c.fill();
      const lsg = c.createLinearGradient(612, 158, 642, 184); lsg.addColorStop(0, '#4fc3f7'); lsg.addColorStop(1, '#1976d2');
      c.fillStyle = lsg; c.fillRect(612, 158, 30, 25);
      c.fillStyle = 'rgba(255,255,255,.75)'; for (let k = 0; k < 4; k++) c.fillRect(615, 162 + k * 4, 10 + (k % 2) * 8, 1.5);
      glass(c, 612, 158, 30, 25, 'rgba(255,255,255,0)');
    }
    // coffee mug
    const mg3 = c.createLinearGradient(655, 0, 667, 0); mg3.addColorStop(0, '#ffffff'); mg3.addColorStop(1, '#cfd4d8');
    c.fillStyle = mg3; rrect(c, 655, 176, 11, 14, 2); c.fill();
    c.strokeStyle = '#cfd4d8'; c.lineWidth = 1.6; c.beginPath(); c.arc(667, 183, 3.5, -1.2, 1.2); c.stroke();
    c.fillStyle = '#5d3a1f'; c.beginPath(); c.ellipse(660.5, 177, 5, 1.6, 0, 0, Math.PI * 2); c.fill();
    if (!night) { c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 1; c.beginPath(); c.moveTo(659, 173); c.quadraticCurveTo(656, 168, 660, 164); c.stroke(); }
  } else if (has('laptop')) { box3d(c, 606, 258, 44, 5, 0.06, '#b0b8bf', 'metal'); c.fillStyle = '#1d2329'; c.fillRect(612, 232, 32, 26); }
  if (has('plant')) {
    floorShadow(c, 554, 34, FLOOR_Y + 2, 5);
    const pg = c.createLinearGradient(556, 0, 586, 0); pg.addColorStop(0, '#d9824b'); pg.addColorStop(0.35, '#e6945e'); pg.addColorStop(1, '#8e4521');
    c.fillStyle = pg; c.beginPath(); c.moveTo(556, 240); c.lineTo(586, 240); c.lineTo(581, 266); c.lineTo(561, 266); c.closePath(); c.fill();
    c.fillStyle = '#b5642f'; c.beginPath(); c.ellipse(571, 240, 17, 4.5, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#4a2f1d'; c.beginPath(); c.ellipse(571, 240, 13.5, 3.2, 0, 0, Math.PI * 2); c.fill();
    const leaf = (x, y, a, l, col) => { c.save(); c.translate(x, y); c.rotate(a); const g = c.createLinearGradient(-l * 0.2, 0, l * 0.2, 0); g.addColorStop(0, tone(col, 0.3)); g.addColorStop(1, tone(col, -0.25)); c.fillStyle = g; c.beginPath(); c.moveTo(0, 0); c.bezierCurveTo(-l * 0.3, -l * 0.3, -l * 0.25, -l * 0.8, 0, -l); c.bezierCurveTo(l * 0.25, -l * 0.8, l * 0.3, -l * 0.3, 0, 0); c.fill(); c.strokeStyle = tone(col, -0.4, 0.7); c.lineWidth = 0.8; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -l * 0.95); c.stroke(); for (let k = 1; k < 4; k++) { c.beginPath(); c.moveTo(0, -l * k / 4); c.lineTo(-l * 0.12, -l * k / 4 - l * 0.08); c.moveTo(0, -l * k / 4); c.lineTo(l * 0.12, -l * k / 4 - l * 0.08); c.stroke(); } c.restore(); };
    [[-1.2, 22, '#33691e'], [-0.9, 28, '#2f7d32'], [-0.5, 36, '#388e3c'], [-0.12, 40, '#43a047'], [0.3, 35, '#2e7d32'], [0.72, 30, '#388e3c'], [1.1, 24, '#2f7d32']].forEach(([a, l, col]) => leaf(571, 239, a, l, col));
  }
  if (has('fan')) {
    floorShadow(c, 258, 28, FLOOR_Y + 2, 4);
    metal(c, 270, 226, 4, 38, 2, '#cfd4d8');
    c.fillStyle = '#b9bec2'; c.beginPath(); c.ellipse(272, 264, 13, 3.5, 0, 0, Math.PI * 2); c.fill();
    c.strokeStyle = '#9aa0a6'; c.lineWidth = 1.8; c.beginPath(); c.arc(272, 216, 14, 0, Math.PI * 2); c.stroke();
    c.fillStyle = 'rgba(200,215,225,.75)'; for (let k = 0; k < 3; k++) { c.save(); c.translate(272, 216); c.rotate(k * 2.1 + S.hour); c.beginPath(); c.ellipse(0, -7, 3.8, 7, 0.3, 0, Math.PI * 2); c.fill(); c.restore(); }
    knob(c, 272, 216, 2.5, '#9aa0a6');
    c.strokeStyle = 'rgba(120,130,140,.5)'; c.lineWidth = 0.6; for (let k = -12; k <= 12; k += 4) { c.beginPath(); c.moveTo(272 + k, 202 + Math.abs(k) / 3); c.lineTo(272 + k, 230 - Math.abs(k) / 3); c.stroke(); }
  }

  // kitchen
  if (own('fridge')) {
    floorShadow(c, 688, 60);
    box3d(c, 688, 96, 60, 168, 0.045, '#d6dbdf', 'metal');
    c.fillStyle = 'rgba(60,70,80,.6)'; c.fillRect(688, 152, 60, 2);
    c.fillStyle = 'rgba(60,70,80,.35)'; c.fillRect(717, 96, 1.2, 56);
    // handles stand out from the doors
    [[710, 108, 28], [722, 108, 28], [736, 164, 54]].forEach(([hx, hy, hl]) => { c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(hx + 2, hy + 2, 3, hl); metal(c, hx, hy, 3, hl, 1.5, '#9aa3aa'); });
    // water & ice dispenser
    c.fillStyle = '#2b3036'; rrect(c, 694, 164, 22, 30, 3); c.fill();
    c.fillStyle = '#4a525a'; c.fillRect(698, 168, 14, 16); c.fillStyle = '#7fd3ff'; c.fillRect(700, 186, 10, 3);
    metal(c, 702, 184, 6, 3, 1, '#b0b8bf');
    solid(c, 706, 220, 22, 26, '#ffffff', 1);                                        // a drawing
    c.strokeStyle = '#e53935'; c.lineWidth = 1.5; c.beginPath(); c.arc(717, 230, 5, 0, Math.PI * 2); c.stroke(); c.strokeStyle = '#43a047'; c.beginPath(); c.moveTo(709, 242); c.lineTo(725, 242); c.stroke();
    [[714, 216, '#ff7043'], [700, 128, '#42a5f5'], [704, 140, '#ffca28']].forEach(([mx, my, col]) => { const g = c.createRadialGradient(mx - 1, my - 1, 0.5, mx, my, 4); g.addColorStop(0, tone(col, 0.4)); g.addColorStop(1, col); c.fillStyle = g; c.beginPath(); c.arc(mx, my, 3.6, 0, Math.PI * 2); c.fill(); });
    txt(c, 'COOLMAX', 718, 100.5, 'rgba(70,80,90,.6)', 4.5, 700);
  } else ghost(688, 96, 60, 168, '🧊 Fridge?');
  if (own('stove')) {
    floorShadow(c, 618, 68);
    box3d(c, 618, 196, 66, 68, 0.08, '#e3e6e8', 'metal');
    // cooktop seen from above
    const tl = [618, 196], tr = [684, 196], br = persp(tr, 0.08), bl = persp(tl, 0.08);
    c.fillStyle = '#1e2124'; c.beginPath(); c.moveTo(...tl); c.lineTo(...tr); c.lineTo(...br); c.lineTo(...bl); c.closePath(); c.fill();
    [[634, 192.5], [668, 192.5]].forEach(([bx, by]) => { c.strokeStyle = '#5a5f65'; c.lineWidth = 1.5; c.beginPath(); c.ellipse(bx, by, 10, 2.4, 0, 0, Math.PI * 2); c.stroke(); c.beginPath(); c.ellipse(bx, by, 5, 1.2, 0, 0, Math.PI * 2); c.stroke(); });
    // a pot on the stove
    const pg2 = c.createLinearGradient(658, 0, 680, 0); pg2.addColorStop(0, '#8d9399'); pg2.addColorStop(0.3, '#e6e9eb'); pg2.addColorStop(1, '#6d7378');
    c.fillStyle = pg2; c.fillRect(658, 180, 20, 12); c.fillStyle = '#b7bcc0'; c.beginPath(); c.ellipse(668, 180, 10, 2.2, 0, 0, Math.PI * 2); c.fill();
    metal(c, 666, 175, 4, 4, 2, '#555'); c.fillStyle = '#333'; c.fillRect(678, 184, 8, 2);
    solid(c, 618, 196, 66, 10, '#2b2f33', 1);                                        // control panel
    [628, 640, 652, 664, 676].forEach(x => knob(c, x, 201, 2.8, '#cfd4d8'));
    c.fillStyle = '#1c1f22'; rrect(c, 624, 216, 54, 38, 3); c.fill();
    const og = c.createLinearGradient(0, 222, 0, 250); og.addColorStop(0, '#4a3420'); og.addColorStop(1, '#17110b');
    c.fillStyle = og; c.fillRect(630, 222, 42, 26);
    c.fillStyle = 'rgba(255,170,60,.25)'; c.fillRect(632, 240, 38, 6); c.strokeStyle = '#5a5f65'; c.lineWidth = 1; c.beginPath(); c.moveTo(632, 238); c.lineTo(670, 238); c.stroke();
    glass(c, 630, 222, 42, 26, 'rgba(255,255,255,0)');
    c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(630, 214, 44, 3); metal(c, 628, 211, 46, 3.5, 1.5, '#b0b8bf');
    if (has('microwave')) {                                                          // over-the-stove microwave
      box3d(c, 618, 128, 66, 34, 0.03, '#c4cacf', 'metal');
      c.fillStyle = '#16191c'; rrect(c, 622, 132, 42, 26, 2); c.fill(); glass(c, 622, 132, 42, 26, 'rgba(255,255,255,0)');
      c.fillStyle = '#4caf50'; c.fillRect(667, 134, 13, 4); c.fillStyle = '#8a9096'; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) c.fillRect(667 + i * 4.5, 142 + j * 4.5, 3, 3);
      metal(c, 661, 134, 2.5, 22, 1, '#9aa3aa');
    }
  } else {
    if (!has('desk')) ghost(618, 196, 66, 68, '🍳 Stove?');
    if (has('microwave')) { box3d(c, 622, 230, 56, 32, 0.06, '#c4cacf', 'metal'); c.fillStyle = '#16191c'; c.fillRect(626, 234, 34, 24); }
  }
  if (own('table')) {
    floorShadow(c, 452, 150, FLOOR_Y + 34, 10);
    const chair = (x, d) => {
      const sx = d > 0 ? x : x - 18;
      box3d(c, sx + (d > 0 ? 18 : 0), 294, 4, 30, 0.06, '#6b4628', 'wood', x + 2);  // front leg
      box3d(c, sx, 286, 22, 6, 0.1, '#7a5333', 'wood', x + 1);                       // seat
      box3d(c, x, 238, 5, 86, 0.04, '#6b4628', 'wood', x);                           // back post
      for (let k = 0; k < 3; k++) box3d(c, d > 0 ? x : x - 4, 246 + k * 11, 9, 4, 0.03, '#7a5333', 'wood', x + k);
      c.fillStyle = '#c45a4a'; rrect(c, sx + 2, 282, 18, 5, 2); c.fill();          // seat cushion
    };
    chair(448, 1); chair(602, -1);
    box3d(c, 476, 272, 7, 50, 0.12, '#6f4a2e', 'wood', 72); box3d(c, 570, 272, 7, 50, 0.12, '#6f4a2e', 'wood', 73);
    box3d(c, 466, 264, 120, 9, 0.12, '#8a5e3c', 'wood', 71);
    // tablecloth runner + bowl of fruit
    const t0 = persp([500, 264], 0.12), t1 = persp([552, 264], 0.12);
    c.fillStyle = 'rgba(230,240,250,.9)'; c.beginPath(); c.moveTo(500, 264); c.lineTo(552, 264); c.lineTo(...t1); c.lineTo(...t0); c.closePath(); c.fill();
    c.fillRect(500, 264, 52, 12);
    if (S.groceries > 0) {
      const bg3 = c.createLinearGradient(0, 252, 0, 264); bg3.addColorStop(0, '#ffffff'); bg3.addColorStop(1, '#c9d2d8');
      [[516, 253, '#e53935'], [526, 250, '#ffb300'], [536, 253, '#7cb342'], [522, 255, '#c62828'], [531, 255, '#fdd835']].forEach(([x, y, col]) => { const g = c.createRadialGradient(x - 2, y - 2, 1, x, y, 6); g.addColorStop(0, tone(col, 0.45)); g.addColorStop(1, tone(col, -0.25)); c.fillStyle = g; c.beginPath(); c.arc(x, y, 5.5, 0, Math.PI * 2); c.fill(); });
      c.fillStyle = bg3; c.beginPath(); c.moveTo(510, 256); c.lineTo(542, 256); c.quadraticCurveTo(540, 266, 526, 266); c.quadraticCurveTo(512, 266, 510, 256); c.fill();
    }
  }
  if (own('washer')) {
    floorShadow(c, 750, 32, FLOOR_Y + 2, 5);
    box3d(c, 750, 216, 32, 50, 0.03, '#f3f5f6', 'porcelain');
    c.fillStyle = '#e2e7ea'; c.fillRect(750, 216, 32, 9);
    knob(c, 773, 220.5, 2.6, '#b0b8bf'); c.fillStyle = '#4caf50'; c.fillRect(754, 219, 6, 2.5); c.fillStyle = '#90a4ae'; c.fillRect(762, 219, 5, 2.5);
    c.fillStyle = '#8fa3ae'; c.beginPath(); c.arc(766, 246, 12, 0, Math.PI * 2); c.fill();
    const wg2 = c.createRadialGradient(763, 243, 2, 766, 246, 10); wg2.addColorStop(0, '#d6ecf7'); wg2.addColorStop(1, '#5d89a5');
    c.fillStyle = wg2; c.beginPath(); c.arc(766, 246, 9.5, 0, Math.PI * 2); c.fill();
    c.fillStyle = 'rgba(229,57,53,.6)'; c.beginPath(); c.arc(763, 250, 3.5, 0, Math.PI * 2); c.fill(); c.fillStyle = 'rgba(30,136,229,.6)'; c.beginPath(); c.arc(769, 249, 3, 0, Math.PI * 2); c.fill();
    c.fillStyle = 'rgba(255,255,255,.55)'; c.beginPath(); c.arc(762, 242, 3, 0, Math.PI * 2); c.fill();
  }

  // bathroom
  wallShadow(c, 812, 26, 46, 60);
  c.fillStyle = '#b9c4cb'; rrect(c, 810, 24, 50, 64, 4); c.fill();
  const mg2 = c.createLinearGradient(814, 28, 856, 84); mg2.addColorStop(0, '#e9f4fa'); mg2.addColorStop(1, '#a9c3d3');
  c.fillStyle = mg2; c.fillRect(814, 28, 42, 56); glass(c, 814, 28, 42, 56, 'rgba(255,255,255,0)');
  box3d(c, 806, 92, 58, 14, 0.06, '#f4f6f7', 'porcelain');
  c.fillStyle = '#c9d7df'; const sb = persp([812, 92], 0.05), sb2 = persp([858, 92], 0.05);
  c.beginPath(); c.moveTo(812, 92); c.lineTo(858, 92); c.lineTo(...sb2); c.lineTo(...sb); c.closePath(); c.fill();
  metal(c, 831, 82, 6, 12, 2, '#c0c6cb'); metal(c, 831, 82, 12, 3, 1.5, '#c0c6cb');
  c.fillStyle = '#f4f6f7'; c.beginPath(); c.moveTo(828, 106); c.lineTo(842, 106); c.lineTo(839, 140); c.lineTo(831, 140); c.fill(); c.strokeStyle = 'rgba(120,135,150,.4)'; c.stroke();
  solid(c, 846, 84, 8, 8, '#7fb3d5', 2);
  if (has('bathtub')) {
    floorShadow(c, 888, 108, FLOOR_Y + 2, 7);
    box3d(c, 888, 214, 108, 44, 0.05, '#f7f9fa', 'porcelain');
    const rim0 = persp([892, 214], 0.05), rim1 = persp([992, 214], 0.05);
    c.fillStyle = '#e8eef1'; c.beginPath(); c.moveTo(888, 214); c.lineTo(996, 214); c.lineTo(...persp([996, 214], 0.05)); c.lineTo(...persp([888, 214], 0.05)); c.closePath(); c.fill();
    c.fillStyle = 'rgba(150,205,240,.95)'; c.beginPath(); c.moveTo(894, 213); c.lineTo(990, 213); c.lineTo(rim1[0] - 3, rim1[1] + 1); c.lineTo(rim0[0] + 3, rim0[1] + 1); c.closePath(); c.fill();
    [[904, 210, 7], [916, 207, 6], [930, 210, 7], [946, 208, 5], [958, 211, 6], [972, 209, 5]].forEach(([x, y, r]) => { const g = c.createRadialGradient(x - 2, y - 2, 1, x, y, r); g.addColorStop(0, '#fff'); g.addColorStop(1, '#d6e7f2'); c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill(); });
    c.fillStyle = '#ffd23f'; c.beginPath(); c.ellipse(938, 203, 5, 3.5, 0, 0, Math.PI * 2); c.fill(); c.beginPath(); c.arc(942, 199, 2.6, 0, Math.PI * 2); c.fill(); c.fillStyle = '#ff7043'; c.fillRect(944, 199, 2.5, 1.2);
    metal(c, 980, 190, 5, 22, 2, '#c0c6cb'); metal(c, 970, 190, 15, 4, 2, '#c0c6cb');
    [[892, 258], [984, 258]].forEach(([fx, fy]) => { const g = c.createRadialGradient(fx + 4, fy + 2, 1, fx + 5, fy + 4, 6); g.addColorStop(0, '#f5dd7a'); g.addColorStop(1, '#a8862a'); c.fillStyle = g; c.beginPath(); c.moveTo(fx, fy); c.lineTo(fx + 10, fy); c.lineTo(fx + 12, fy + 8); c.lineTo(fx - 2, fy + 8); c.fill(); });
  }
  if (hasF('shower') && (has('shower') || !has('bathtub'))) {
    box3d(c, 908, 254, 88, 10, 0.03, '#dde6eb', 'porcelain');
    metal(c, 948, 50, 4, 26, 2, '#c0c6cb');
    c.fillStyle = '#aab2b8'; c.beginPath(); c.ellipse(950, 76, 11, 3.5, 0, 0, Math.PI * 2); c.fill(); metal(c, 940, 74, 20, 4, 2, '#aab2b8');
    c.fillStyle = 'rgba(120,170,200,.25)'; for (let k = 0; k < 9; k++) c.fillRect(942 + k * 2, 82 + (k % 3) * 4, 0.8, 30);
    knob(c, 950, 150, 4, '#c0c6cb'); metal(c, 949, 146, 12, 3, 1.5, '#c0c6cb');
    solid(c, 974, 168, 14, 22, '#ffffff', 2); solid(c, 976, 160, 10, 9, '#5aa9e6', 2);   // shampoo bottle
    glass(c, 908, 56, 88, 200, 'rgba(200,230,245,.2)');
    c.strokeStyle = '#9aa7b0'; c.lineWidth = 2.5; c.strokeRect(908, 56, 88, 200);
    c.beginPath(); c.moveTo(952, 56); c.lineTo(952, 256); c.stroke();
    metal(c, 946, 140, 3, 34, 1, '#c0c6cb');
  } else if (!hasF('shower')) ghost(908, 96, 88, 166, '🚿 Shower?');
  if (own('toilet')) {
    floorShadow(c, 812, 54, FLOOR_Y + 2, 6);
    box3d(c, 812, 176, 30, 46, 0.03, '#f7f9fa', 'porcelain');                       // tank
    box3d(c, 808, 172, 38, 7, 0.035, '#f7f9fa', 'porcelain');                       // lid
    metal(c, 814, 182, 10, 3, 1, '#b0b8bf'); knob(c, 814, 183.5, 2, '#b0b8bf');
    // bowl seen slightly from above
    const bg = c.createLinearGradient(818, 228, 866, 262); bg.addColorStop(0, '#ffffff'); bg.addColorStop(1, '#bfc9cf');
    c.fillStyle = bg; c.beginPath(); c.moveTo(818, 230); c.quadraticCurveTo(820, 254, 834, 258); c.lineTo(832, 266); c.lineTo(856, 266); c.lineTo(854, 258); c.quadraticCurveTo(868, 254, 870, 230); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(120,135,150,.45)'; c.lineWidth = 1; c.stroke();
    c.fillStyle = '#f2f5f7'; c.beginPath(); c.ellipse(844, 229, 28, 8, 0, 0, Math.PI * 2); c.fill(); c.stroke();   // seat
    c.fillStyle = '#d6e3ea'; c.beginPath(); c.ellipse(844, 229, 19, 4.6, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = 'rgba(140,195,225,.7)'; c.beginPath(); c.ellipse(844, 230, 12, 2.6, 0, 0, Math.PI * 2); c.fill();
    // toilet paper on its holder
    metal(c, 870, 196, 14, 3, 1, '#b0b8bf');
    if (S.supplies > 0 || S.home === 'parents') {
      const tp = c.createLinearGradient(870, 0, 884, 0); tp.addColorStop(0, '#ffffff'); tp.addColorStop(1, '#d9dfe3');
      c.fillStyle = tp; rrect(c, 868, 190, 16, 16, 8); c.fill();
      c.fillStyle = '#c7b59a'; c.beginPath(); c.ellipse(876, 198, 2.2, 3.2, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#fafafa'; c.fillRect(869, 200, 5, 18); c.strokeStyle = 'rgba(0,0,0,.08)'; c.setLineDash([1, 2]); c.beginPath(); c.moveTo(869, 210); c.lineTo(874, 210); c.stroke(); c.setLineDash([]);
    } else { c.fillStyle = '#c7b59a'; rrect(c, 872, 192, 8, 12, 2); c.fill(); }
  } else ghost(806, 186, 70, 80, '🚽 Toilet?');

  drawFurniture3(c);
  drawHolidayTree(c);
  drawToys(c);
  drawPets(c);
  drawMess(c);

  // ---------- you ----------
  if (atHome()) {
    c.save(); c.filter = 'blur(3px)'; c.fillStyle = 'rgba(30,20,10,.35)'; c.beginPath(); c.ellipse(306, 334, 26, 6, 0, 0, Math.PI * 2); c.fill(); c.restore();
    drawPerson(c, 300, 334, 2.3, S.look);
  }

  // ---------- light & mood ----------
  if (S.powerOut || (night && !S.lightsOn)) {
    c.fillStyle = has('lamp') && !S.powerOut ? 'rgba(15,22,50,.3)' : 'rgba(8,12,30,.62)'; c.fillRect(0, 0, RW, RH);
    if (S.powerOut && has('flashlight')) { const g = c.createRadialGradient(300, 260, 5, 300, 260, 160); g.addColorStop(0, 'rgba(255,245,200,.35)'); g.addColorStop(1, 'rgba(255,245,200,0)'); c.fillStyle = g; c.fillRect(100, 100, 400, 280); }
  } else if (night) {
    c.fillStyle = 'rgba(30,30,40,.08)'; c.fillRect(0, 0, RW, RH);
  }
  if (false) {
    if (has('lamp')) { c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(178, 150, 5, 178, 200, 200); g.addColorStop(0, 'rgba(255,190,110,.22)'); g.addColorStop(1, 'rgba(255,190,110,0)'); c.fillStyle = g; c.fillRect(0, 0, 420, RH); c.restore(); }
  } else if (rainy) { c.fillStyle = 'rgba(60,70,90,.12)'; c.fillRect(0, 0, RW, RH); }
  else if (dusk) { c.fillStyle = 'rgba(255,150,80,.08)'; c.fillRect(0, 0, RW, RH); }
  const vg = c.createRadialGradient(RW / 2, RH / 2, RH * 0.4, RW / 2, RH / 2, RW * 0.62);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.22)');
  c.fillStyle = vg; c.fillRect(0, 0, RW, RH);
}
