// ===================== INSIDE THE BUILDINGS =====================
// Each building has its own detailed inside, drawn in 3D like your home.

const IFLOOR = 268;

// ---------- walls, floors and lights ----------
function iWall(c, col, opt = {}) {
  const g = c.createLinearGradient(0, 0, 0, IFLOOR); g.addColorStop(0, tone(col, -0.1)); g.addColorStop(0.4, col); g.addColorStop(1, tone(col, -0.06));
  c.fillStyle = g; c.fillRect(0, 0, RW, IFLOOR);
  for (let i = 0; i < 2200; i++) { c.fillStyle = i % 2 ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.035)'; c.fillRect((i * 97.31) % RW, (i * 41.7) % IFLOOR, 1.5, 1.5); }
  if (opt.wainscot) { wood(c, 0, 176, RW, IFLOOR - 176, opt.wainscot, 0, 4); for (let x = 20; x < RW; x += 110) bevel(c, x, 188, 86, 66, opt.wainscot); c.fillStyle = '#f2ede2'; c.fillRect(0, 172, RW, 6); }
  if (opt.tiles) { for (let y = 120; y < IFLOOR; y += 18) for (let x = ((y / 18) % 2) * 9; x < RW; x += 18) { c.strokeStyle = 'rgba(120,130,140,.25)'; c.lineWidth = 1; c.strokeRect(x + 0.5, y + 0.5, 18, 18); } }
  if (opt.bricks) { for (let y = 0, r = 0; y < IFLOOR; y += 12, r++) for (let x = (r % 2) * 16; x < RW; x += 32) { c.fillStyle = tone(col, ((x * 7 + y * 3) % 5 - 2) * 0.05); c.fillRect(x + 1, y + 1, 30, 10); } }
  if (opt.logs) { for (let y = 0; y < IFLOOR; y += 18) { const lg = c.createLinearGradient(0, y, 0, y + 18); lg.addColorStop(0, tone(col, 0.18)); lg.addColorStop(0.5, col); lg.addColorStop(1, tone(col, -0.35)); c.fillStyle = lg; c.fillRect(0, y, RW, 18); } }
  // crown molding and corner shadows
  c.fillStyle = '#f7f4ee'; c.fillRect(0, 0, RW, 10); c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(0, 10, RW, 3);
  const ao = c.createLinearGradient(0, 0, RW, 0); ao.addColorStop(0, 'rgba(0,0,0,.14)'); ao.addColorStop(0.07, 'rgba(0,0,0,0)'); ao.addColorStop(0.93, 'rgba(0,0,0,0)'); ao.addColorStop(1, 'rgba(0,0,0,.14)');
  c.fillStyle = ao; c.fillRect(0, 0, RW, IFLOOR);
}
function iFloor(c, kind, cols = []) {
  const H = RH - IFLOOR;
  if (kind === 'wood') {
    const fg = c.createLinearGradient(0, IFLOOR, 0, RH); fg.addColorStop(0, cols[0] || '#8a5d35'); fg.addColorStop(1, cols[1] || '#c08c58');
    c.fillStyle = fg; c.fillRect(0, IFLOOR, RW, H);
    let py = IFLOOR, row = 0;
    while (py < RH) { const ph = 7 + row * 2.6, off = (row * 137) % 160; for (let x = -off; x < RW; x += 160) { c.fillStyle = `rgba(${row % 2 ? '255,230,200' : '60,35,15'},${0.04 + ((row * 7 + x) % 5) * 0.025})`; c.fillRect(x, py, 160, ph); c.fillStyle = 'rgba(50,30,10,.35)'; c.fillRect(x, py, 1, ph); } c.fillStyle = 'rgba(40,25,10,.4)'; c.fillRect(0, py, RW, 1); py += ph; row++; }
  } else if (kind === 'tile' || kind === 'checker' || kind === 'marble') {
    c.fillStyle = cols[0] || '#e8e4dc'; c.fillRect(0, IFLOOR, RW, H);
    let y = IFLOOR, k = 0;
    while (y < RH) {
      const h = 9 + k * 4, n = 14;
      for (let i = -2; i < n + 2; i++) {
        const xt = RW / 2 + (i - n / 2) * (RW / n) * (0.75 + (y - IFLOOR) / H * 0.5), xb = RW / 2 + (i + 1 - n / 2) * (RW / n) * (0.75 + (y - IFLOOR) / H * 0.5);
        if (kind === 'checker' && (i + k) % 2) { c.fillStyle = cols[1] || '#333'; c.fillRect(xt, y, xb - xt, h); }
        if (kind !== 'checker') { c.fillStyle = (i + k) % 2 ? 'rgba(0,0,0,.035)' : 'rgba(255,255,255,.05)'; c.fillRect(xt, y, xb - xt, h); }
      }
      c.fillStyle = 'rgba(80,80,80,.25)'; c.fillRect(0, y, RW, 1);
      y += h; k++;
    }
    for (let i = -8; i <= 8; i++) { c.strokeStyle = 'rgba(80,80,80,.2)'; c.lineWidth = 1; c.beginPath(); c.moveTo(RW / 2 + i * (RW / 14) * 0.75, IFLOOR); c.lineTo(RW / 2 + i * (RW / 14) * 1.25, RH); c.stroke(); }
    if (kind === 'marble') { c.strokeStyle = 'rgba(140,140,150,.35)'; c.lineWidth = 0.8; for (let i = 0; i < 18; i++) { c.beginPath(); let x = (i * 131) % RW, y2 = IFLOOR + (i * 23) % H; c.moveTo(x, y2); for (let s = 0; s < 4; s++) { x += 15 + (i * s) % 20; y2 += (s % 2 ? 4 : -3); c.lineTo(x, y2); } c.stroke(); } }
  } else if (kind === 'carpet') {
    const g = c.createLinearGradient(0, IFLOOR, 0, RH); g.addColorStop(0, tone(cols[0] || '#7a2d3a', -0.15)); g.addColorStop(1, cols[0] || '#7a2d3a');
    c.fillStyle = g; c.fillRect(0, IFLOOR, RW, H);
    c.fillStyle = 'rgba(255,220,150,.18)'; for (let y = IFLOOR + 8; y < RH; y += 14) for (let x = ((y / 14) % 2) * 20; x < RW; x += 40) { c.beginPath(); c.arc(x, y, 2.2, 0, Math.PI * 2); c.fill(); }
  } else {   // concrete
    c.fillStyle = cols[0] || '#a9a9a4'; c.fillRect(0, IFLOOR, RW, H);
    for (let i = 0; i < 1500; i++) { c.fillStyle = i % 2 ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.08)'; c.fillRect((i * 61.7) % RW, IFLOOR + (i * 13.3) % H, 1.5, 1.5); }
    c.strokeStyle = 'rgba(60,60,60,.25)'; for (let x = 0; x < RW; x += 200) { c.beginPath(); c.moveTo(x, IFLOOR); c.lineTo(x + (x - RW / 2) * 0.3, RH); c.stroke(); }
  }
  c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(0, IFLOOR - 1, RW, 2);
  const cs = c.createLinearGradient(0, IFLOOR, 0, IFLOOR + 16); cs.addColorStop(0, 'rgba(0,0,0,.25)'); cs.addColorStop(1, 'rgba(0,0,0,0)');
  c.fillStyle = cs; c.fillRect(0, IFLOOR, RW, 16);
}
function iLights(c, kind, xs) {
  xs.forEach(x => {
    if (kind === 'strip') {
      c.fillStyle = '#f7f7f2'; c.fillRect(x - 50, 14, 100, 7); c.fillStyle = 'rgba(255,255,240,.9)'; c.fillRect(x - 46, 21, 92, 2);
      const g = c.createRadialGradient(x, 24, 4, x, 60, 160); g.addColorStop(0, 'rgba(255,255,230,.35)'); g.addColorStop(1, 'rgba(255,255,230,0)'); c.fillStyle = g; c.fillRect(x - 170, 10, 340, 220);
    } else if (kind === 'chandelier') {
      c.strokeStyle = '#8a7340'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x, 12); c.lineTo(x, 40); c.stroke();
      metal(c, x - 30, 40, 60, 5, 2, '#d4af37');
      for (let k = -2; k <= 2; k++) { c.fillStyle = '#fff6d0'; c.beginPath(); c.moveTo(x + k * 13, 34); c.lineTo(x + k * 13 - 3, 42); c.lineTo(x + k * 13 + 3, 42); c.fill(); c.fillStyle = 'rgba(200,230,255,.8)'; c.beginPath(); c.arc(x + k * 13, 52, 2.5, 0, Math.PI * 2); c.fill(); }
      const g = c.createRadialGradient(x, 40, 4, x, 80, 200); g.addColorStop(0, 'rgba(255,230,160,.4)'); g.addColorStop(1, 'rgba(255,230,160,0)'); c.fillStyle = g; c.fillRect(x - 200, 0, 400, 260);
    } else {   // pendant lamp
      c.strokeStyle = '#333'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(x, 12); c.lineTo(x, 46); c.stroke();
      const lg = c.createLinearGradient(x - 18, 0, x + 18, 0); lg.addColorStop(0, tone(kind === 'pendant' ? '#2f4f4f' : kind, -0.2)); lg.addColorStop(0.4, tone(kind === 'pendant' ? '#2f4f4f' : kind, 0.25)); lg.addColorStop(1, tone(kind === 'pendant' ? '#2f4f4f' : kind, -0.35));
      c.fillStyle = lg; c.beginPath(); c.moveTo(x - 6, 46); c.lineTo(x + 6, 46); c.lineTo(x + 18, 64); c.lineTo(x - 18, 64); c.closePath(); c.fill();
      c.fillStyle = '#fff3c4'; c.beginPath(); c.ellipse(x, 64, 16, 3, 0, 0, Math.PI * 2); c.fill();
      const g = c.createRadialGradient(x, 66, 3, x, 120, 160); g.addColorStop(0, 'rgba(255,225,150,.38)'); g.addColorStop(1, 'rgba(255,225,150,0)'); c.fillStyle = g; c.fillRect(x - 170, 50, 340, 260);
    }
  });
}
function iWindow(c, x, y, w, h) {
  const night = S.hour < 6 || S.hour >= 20;
  const sky = c.createLinearGradient(0, y, 0, y + h);
  if (night) { sky.addColorStop(0, '#0b1633'); sky.addColorStop(1, '#22365f'); } else if (S.weather === 'rainy') { sky.addColorStop(0, '#7d8a9b'); sky.addColorStop(1, '#aeb8c4'); } else { sky.addColorStop(0, '#5aa9e6'); sky.addColorStop(1, '#cfe8fa'); }
  c.fillStyle = sky; c.fillRect(x, y, w, h);
  c.fillStyle = night ? '#1b2a3a' : '#7fa86a'; c.beginPath(); c.moveTo(x, y + h); for (let i = 0; i <= 6; i++) c.lineTo(x + w * i / 6, y + h * 0.72 - Math.sin(i * 1.7) * 6); c.lineTo(x + w, y + h); c.fill();
  glass(c, x, y, w, h, 'rgba(200,230,250,.1)');
  c.lineWidth = 6; c.strokeStyle = '#f4f2ec'; c.strokeRect(x - 3, y - 3, w + 6, h + 6);
  c.fillStyle = '#f4f2ec'; c.fillRect(x + w / 2 - 2, y, 4, h);
}

// ---------- furniture and props ----------
function iShelf(c, x, y, w, h, kind, seed = 1, frameCol = '#8a6a44') {
  floorShadow(c, x, w, IFLOOR + 2, 8);
  box3d(c, x, y, w, h, 0.05, frameCol, kind === 'metal' ? 'metal' : 'wood', seed);
  c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(x + 4, y + 4, w - 8, h - 8);
  const rows = Math.max(2, Math.floor(h / 40));
  const r = seeded(seed * 77);
  for (let s = 0; s < rows; s++) {
    const sy = y + 4 + (s + 1) * (h - 8) / rows;
    let bx = x + 6;
    while (bx < x + w - 10) {
      const roll = r();
      if (kind === 'books') { const bw = 4 + roll * 4, bh = 16 + r() * 12; book(c, bx, sy - bh - 1, bw, bh, ['#9e2a2b', '#2b5f9e', '#2e7d4f', '#c9861a', '#6b3fa0', '#1f7a7a', '#b8562a'][Math.floor(r() * 7)]); bx += bw + 0.6; }
      else if (kind === 'grocery' || kind === 'metal') {
        const col = ['#e53935', '#fb8c00', '#fdd835', '#43a047', '#1e88e5', '#8e24aa', '#f06292', '#6d4c41', '#00acc1'][Math.floor(r() * 9)];
        if (roll < 0.4) { const g = c.createLinearGradient(bx, 0, bx + 9, 0); g.addColorStop(0, tone(col, -0.2)); g.addColorStop(0.35, tone(col, 0.35)); g.addColorStop(1, tone(col, -0.3)); c.fillStyle = g; c.fillRect(bx, sy - 15, 9, 14); c.fillStyle = '#ddd'; c.fillRect(bx, sy - 15, 9, 2); c.fillStyle = '#fff'; c.fillRect(bx + 1, sy - 10, 7, 4); bx += 10; }
        else if (roll < 0.75) { const bh = 14 + r() * 10; box3d(c, bx, sy - bh - 1, 12, bh, 0.01, col, 'solid'); c.fillStyle = 'rgba(255,255,255,.7)'; c.fillRect(bx + 2, sy - bh + 4, 8, 3); bx += 13; }
        else { const g = c.createLinearGradient(bx, 0, bx + 7, 0); g.addColorStop(0, tone(col, 0.4)); g.addColorStop(1, tone(col, -0.2)); c.fillStyle = g; rrect(c, bx, sy - 18, 7, 17, 2); c.fill(); c.fillRect(bx + 2, sy - 22, 3, 5); bx += 9; }
      } else if (kind === 'bread') {
        if (roll < 0.5) { const g = c.createRadialGradient(bx + 8, sy - 10, 1, bx + 10, sy - 7, 12); g.addColorStop(0, '#e9b872'); g.addColorStop(1, '#a86a2e'); c.fillStyle = g; c.beginPath(); c.ellipse(bx + 10, sy - 7, 10, 6, 0, 0, Math.PI * 2); c.fill(); c.strokeStyle = '#f3d29a'; c.lineWidth = 1; for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(bx + 4 + k * 5, sy - 10); c.lineTo(bx + 7 + k * 5, sy - 5); c.stroke(); } bx += 22; }
        else { c.fillStyle = '#d99a4e'; c.beginPath(); c.arc(bx + 7, sy - 5, 6, Math.PI, 0); c.fill(); c.strokeStyle = '#b5762e'; c.beginPath(); c.moveTo(bx + 3, sy - 5); c.lineTo(bx + 5, sy - 10); c.moveTo(bx + 9, sy - 10); c.lineTo(bx + 11, sy - 5); c.stroke(); bx += 15; }
      } else if (kind === 'pots') { const ph = 12 + roll * 10, col = ['#c4703f', '#8d6e63', '#5d8aa8', '#d9b38c', '#6b8e5a'][Math.floor(r() * 5)]; const g = c.createLinearGradient(bx, 0, bx + 14, 0); g.addColorStop(0, tone(col, -0.2)); g.addColorStop(0.35, tone(col, 0.3)); g.addColorStop(1, tone(col, -0.35)); c.fillStyle = g; c.beginPath(); c.moveTo(bx + 4, sy - ph); c.lineTo(bx + 10, sy - ph); c.quadraticCurveTo(bx + 16, sy - ph / 2, bx + 11, sy - 1); c.lineTo(bx + 3, sy - 1); c.quadraticCurveTo(bx - 2, sy - ph / 2, bx + 4, sy - ph); c.fill(); bx += 17; }
      else if (kind === 'gear') { if (roll < 0.5) { c.fillStyle = ['#6d4c41', '#37474f', '#8d6e63'][Math.floor(r() * 3)]; c.beginPath(); c.moveTo(bx, sy - 1); c.lineTo(bx, sy - 16); c.lineTo(bx + 7, sy - 16); c.lineTo(bx + 8, sy - 7); c.lineTo(bx + 16, sy - 5); c.lineTo(bx + 16, sy - 1); c.fill(); c.fillStyle = '#222'; c.fillRect(bx, sy - 3, 16, 2); bx += 19; } else { const col = ['#e53935', '#1e88e5', '#fdd835', '#43a047'][Math.floor(r() * 4)]; c.fillStyle = col; c.beginPath(); c.arc(bx + 8, sy - 8, 8, Math.PI, 0); c.fill(); c.fillRect(bx, sy - 8, 16, 5); c.fillStyle = 'rgba(255,255,255,.4)'; c.beginPath(); c.arc(bx + 5, sy - 11, 2.5, 0, Math.PI * 2); c.fill(); bx += 19; } }
      else if (kind === 'boxes') { const bw = 22 + roll * 16, bh = 14 + r() * 14; box3d(c, bx, sy - bh - 1, bw, bh, 0.02, '#c19a6b', 'solid'); c.fillStyle = 'rgba(120,80,40,.5)'; c.fillRect(bx + bw / 2 - 1, sy - bh - 1, 2, bh); bx += bw + 3; }
      else bx += 10;
    }
    box3d(c, x + 4, sy, w - 8, 4, 0.05, tone(frameCol, 0.1).startsWith('rgba') ? frameCol : frameCol, kind === 'metal' ? 'metal' : 'wood', seed + s);
  }
}
function iCounter(c, x, y, w, h, col, opt = {}) {
  floorShadow(c, x, w, IFLOOR + 4 + (y + h - IFLOOR), 9);
  box3d(c, x, y, w, h, 0.08, col, opt.mat || 'wood', 9);
  box3d(c, x - 4, y - 7, w + 8, 7, 0.085, opt.top || '#e9e4da', opt.topMat || 'solid');
  if (opt.panels) for (let k = 0; k < Math.floor(w / 60); k++) bevel(c, x + 8 + k * 60, y + 8, 50, h - 16, col);
  if (opt.register) {
    const rx = opt.register;
    box3d(c, rx, y - 26, 30, 19, 0.04, '#3a3f44', 'solid'); box3d(c, rx + 4, y - 44, 22, 16, 0.02, '#1d2329', 'solid');
    c.fillStyle = '#7ed957'; c.fillRect(rx + 7, y - 41, 16, 9); c.fillStyle = '#d0d4d8'; for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) c.fillRect(rx + 4 + i * 8, y - 22 + j * 6, 6, 4);
  }
  if (opt.bell) { const bx = opt.bell; metal(c, bx - 9, y - 10, 18, 3, 1, '#c9a54a'); const g = c.createRadialGradient(bx - 3, y - 18, 1, bx, y - 14, 9); g.addColorStop(0, '#fff2b0'); g.addColorStop(1, '#b8922e'); c.fillStyle = g; c.beginPath(); c.arc(bx, y - 10, 8, Math.PI, 0); c.fill(); knob(c, bx, y - 19, 2, '#c9a54a'); }
}
function iCase(c, x, y, w, h, kind) {   // a glass display case with things inside
  floorShadow(c, x, w, IFLOOR + 2, 8);
  box3d(c, x, y + h * 0.55, w, h * 0.45, 0.08, '#e9e4da', 'solid');
  box3d(c, x, y, w, h * 0.55, 0.08, '#dfeef5', 'solid');
  c.fillStyle = kind === 'fish' ? '#f4fbff' : '#fffaf2'; c.fillRect(x + 4, y + 4, w - 8, h * 0.55 - 8);
  const r = seeded(x);
  for (let k = 0; k < Math.floor((w - 16) / 26); k++) {
    const cx = x + 18 + k * 26, cy = y + h * 0.55 - 14;
    if (kind === 'icecream') { const col = ['#f8bbd0', '#fff59d', '#a1887f', '#c5e1a5', '#b39ddb', '#ffffff', '#ffcc80'][k % 7]; box3d(c, cx - 11, cy - 4, 22, 12, 0.02, '#cfd8dc', 'metal'); const g = c.createRadialGradient(cx - 3, cy - 8, 1, cx, cy - 4, 12); g.addColorStop(0, tone(col, 0.4)); g.addColorStop(1, tone(col, -0.15)); c.fillStyle = g; c.beginPath(); c.ellipse(cx, cy - 4, 10, 6, 0, Math.PI, 0); c.fill(); }
    else if (kind === 'fish') { c.fillStyle = '#e8f4f8'; c.fillRect(cx - 13, cy + 2, 26, 8); const g = c.createLinearGradient(cx - 12, cy - 6, cx + 12, cy + 2); g.addColorStop(0, '#b0bec5'); g.addColorStop(0.5, '#eceff1'); g.addColorStop(1, '#78909c'); c.fillStyle = g; c.beginPath(); c.ellipse(cx, cy, 11, 4.5, (r() - 0.5) * 0.3, 0, Math.PI * 2); c.fill(); c.beginPath(); c.moveTo(cx + 9, cy); c.lineTo(cx + 15, cy - 4); c.lineTo(cx + 15, cy + 4); c.fill(); c.fillStyle = '#111'; c.beginPath(); c.arc(cx - 7, cy - 1, 1, 0, Math.PI * 2); c.fill(); }
    else { const col = ['#d99a4e', '#f3c6d4', '#8d5524', '#ffe08a'][k % 4]; const g = c.createRadialGradient(cx - 3, cy - 6, 1, cx, cy - 3, 10); g.addColorStop(0, tone(col, 0.35)); g.addColorStop(1, tone(col, -0.2)); c.fillStyle = g; c.beginPath(); c.ellipse(cx, cy - 3, 10, 6, 0, 0, Math.PI * 2); c.fill(); if (k % 2) { c.fillStyle = '#fff'; c.beginPath(); c.ellipse(cx, cy - 7, 7, 2.5, 0, 0, Math.PI * 2); c.fill(); c.fillStyle = '#e53935'; c.beginPath(); c.arc(cx, cy - 9, 2, 0, Math.PI * 2); c.fill(); } }
  }
  glass(c, x + 2, y + 2, w - 4, h * 0.55 - 4, 'rgba(200,230,250,.18)');
}
function iTable(c, x, y, w, col = '#8a5e3c', chairs = true, cloth) {
  floorShadow(c, x, w, y + 52, 8);
  if (chairs) { box3d(c, x - 20, y + 4, 5, 50, 0.04, '#6b4628', 'wood', 1); box3d(c, x - 22, y + 26, 22, 5, 0.08, '#7a5333', 'wood', 2); box3d(c, x + w + 15, y + 4, 5, 50, 0.04, '#6b4628', 'wood', 3); box3d(c, x + w, y + 26, 22, 5, 0.08, '#7a5333', 'wood', 4); }
  box3d(c, x + 6, y + 8, 6, 44, 0.08, tone(col, -0.2).startsWith('rgba') ? col : col, 'wood', 5); box3d(c, x + w - 12, y + 8, 6, 44, 0.08, col, 'wood', 6);
  box3d(c, x, y, w, 8, 0.1, cloth || col, cloth ? 'fabric' : 'wood', 7);
}
function iBoard(c, x, y, w, h, bg, title, lines, fg = '#fff') {
  wallShadow(c, x, y, w, h);
  wood(c, x - 6, y - 6, w + 12, h + 12, '#6b4426', 2, 3);
  c.fillStyle = bg; c.fillRect(x, y, w, h);
  txt(c, title, x + w / 2, y + 14, fg, 13, 900);
  lines.forEach((l, i) => txt(c, l, x + 12, y + 34 + i * 15, fg, 10, 700, 'left'));
}
function iSign(c, x, y, w, h, bg, fg, text, size = 12) { wallShadow(c, x, y, w, h); solid(c, x, y, w, h, bg, 4); txt(c, text, x + w / 2, y + h / 2 + 0.5, fg, size, 900); }
function iPlant(c, x, s = 1) {
  floorShadow(c, x - 14 * s, 30 * s, IFLOOR + 2, 4);
  const pg = c.createLinearGradient(x - 14 * s, 0, x + 14 * s, 0); pg.addColorStop(0, '#d9824b'); pg.addColorStop(1, '#8e4521');
  c.fillStyle = pg; c.beginPath(); c.moveTo(x - 14 * s, IFLOOR - 28 * s); c.lineTo(x + 14 * s, IFLOOR - 28 * s); c.lineTo(x + 10 * s, IFLOOR); c.lineTo(x - 10 * s, IFLOOR); c.fill();
  [[-0.8, 30], [-0.3, 40], [0.2, 42], [0.7, 32], [1.1, 24], [-1.2, 22]].forEach(([a, l]) => { c.save(); c.translate(x, IFLOOR - 28 * s); c.rotate(a); const g = c.createLinearGradient(-5, 0, 5, 0); g.addColorStop(0, '#6fbf5a'); g.addColorStop(1, '#2f7d32'); c.fillStyle = g; c.beginPath(); c.ellipse(0, -l * s / 2, 6 * s, l * s / 2, 0, 0, Math.PI * 2); c.fill(); c.restore(); });
}
function iClock(c, x, y, r = 16) {
  wallShadow(c, x - r, y - r, r * 2, r * 2);
  c.fillStyle = '#3a3a3a'; c.beginPath(); c.arc(x, y, r + 3, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#fafafa'; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
  for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; c.fillStyle = '#333'; c.fillRect(x + Math.cos(a) * (r - 4) - 1, y + Math.sin(a) * (r - 4) - 1, 2, 2); }
  const h = S.hour, ha = ((h % 12) / 12) * Math.PI * 2 - Math.PI / 2, ma = ((h % 1)) * Math.PI * 2 - Math.PI / 2;
  c.strokeStyle = '#222'; c.lineWidth = 2.2; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(ha) * r * 0.5, y + Math.sin(ha) * r * 0.5); c.stroke();
  c.lineWidth = 1.4; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(ma) * r * 0.8, y + Math.sin(ma) * r * 0.8); c.stroke();
}
function iRug(c, x, y, rx, ry, col) { const g = c.createRadialGradient(x, y, 5, x, y, rx); g.addColorStop(0, tone(col, 0.15)); g.addColorStop(1, tone(col, -0.2)); c.fillStyle = g; c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); c.fill(); c.strokeStyle = '#e6c27f'; c.lineWidth = 2; c.beginPath(); c.ellipse(x, y, rx * 0.85, ry * 0.8, 0, 0, Math.PI * 2); c.stroke(); }
function iFlag(c, x, y, col) { metal(c, x, y, 3, IFLOOR - y, 1, '#c9a54a'); knob(c, x + 1.5, y, 4, '#d4af37'); c.fillStyle = col; c.beginPath(); c.moveTo(x + 3, y + 6); c.quadraticCurveTo(x + 22, y + 2, x + 40, y + 8); c.lineTo(x + 40, y + 40); c.quadraticCurveTo(x + 22, y + 34, x + 3, y + 38); c.fill(); c.fillStyle = 'rgba(255,255,255,.25)'; c.fillRect(x + 3, y + 18, 37, 5); }
function iCar(c, x, y, col) {
  floorShadow(c, x, 170, IFLOOR + 30, 10);
  const g = c.createLinearGradient(0, y - 40, 0, y + 20); g.addColorStop(0, tone(col, 0.4)); g.addColorStop(0.5, col); g.addColorStop(1, tone(col, -0.35));
  c.fillStyle = g; c.beginPath(); c.moveTo(x, y + 10); c.lineTo(x + 4, y - 14); c.quadraticCurveTo(x + 30, y - 20, x + 46, y - 24); c.lineTo(x + 66, y - 48); c.quadraticCurveTo(x + 100, y - 54, x + 128, y - 46); c.lineTo(x + 150, y - 22); c.quadraticCurveTo(x + 170, y - 18, x + 172, y - 4); c.lineTo(x + 170, y + 10); c.closePath(); c.fill();
  c.fillStyle = 'rgba(30,50,70,.85)'; c.beginPath(); c.moveTo(x + 56, y - 24); c.lineTo(x + 72, y - 44); c.lineTo(x + 104, y - 46); c.lineTo(x + 104, y - 24); c.fill(); c.beginPath(); c.moveTo(x + 110, y - 24); c.lineTo(x + 110, y - 45); c.lineTo(x + 126, y - 42); c.lineTo(x + 142, y - 24); c.fill();
  glass(c, x + 60, y - 46, 80, 22, 'rgba(255,255,255,0)');
  [[x + 36, y + 10], [x + 136, y + 10]].forEach(([wx, wy]) => { c.fillStyle = '#1d1d1d'; c.beginPath(); c.arc(wx, wy, 16, 0, Math.PI * 2); c.fill(); const wg = c.createRadialGradient(wx - 3, wy - 3, 1, wx, wy, 9); wg.addColorStop(0, '#f2f2f2'); wg.addColorStop(1, '#7d8791'); c.fillStyle = wg; c.beginPath(); c.arc(wx, wy, 9, 0, Math.PI * 2); c.fill(); });
  c.fillStyle = '#fff6c8'; c.fillRect(x + 164, y - 12, 7, 5); c.fillStyle = '#e53935'; c.fillRect(x + 1, y - 10, 5, 6);
  c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(x + 20, y - 18, 130, 2);
  solid(c, x + 70, y - 80, 50, 18, '#ffd23f', 3); txt(c, '$' + (col === '#e53935' ? '7,000' : '32,000'), x + 95, y - 70.5, '#222', 10, 900);
}
function iPeople(c, list) { list.sort((a, b) => a[1] - b[1]).forEach(([x, y, s, look]) => drawPerson(c, x, y, s, look)); }
const staff = (shirt, i = 0) => ({ skin: LOOKS.skin[(i * 2 + 1) % LOOKS.skin.length], hair: LOOKS.hair[(i * 3) % LOOKS.hair.length], style: LOOKS.style[(i * 5 + 2) % LOOKS.style.length], shirt, pants: '#24395e' });
const guest = i => randomLook(seeded(i * 131 + 7));

// ---------- each building ----------
const INTERIORS = {
  market: c => {
    iWall(c, '#eef3ea'); iFloor(c, 'tile', ['#e7e4dc']); iLights(c, 'strip', [180, 500, 820]);
    iSign(c, 60, 30, 120, 22, '#2e7d32', '#fff', 'FRUIT & VEG'); iSign(c, 380, 30, 120, 22, '#1565c0', '#fff', 'AISLE 2'); iSign(c, 700, 30, 120, 22, '#c62828', '#fff', 'SNACKS');
    iShelf(c, 330, 120, 220, 148, 'grocery', 2, '#9aa3aa'); iShelf(c, 640, 120, 220, 148, 'grocery', 3, '#9aa3aa');
    // fruit stand
    box3d(c, 40, 210, 220, 58, 0.06, '#8a6a44', 'wood', 4);
    [['#e53935', 50], ['#fb8c00', 104], ['#fdd835', 158], ['#7cb342', 212]].forEach(([col, bx]) => { for (let i = 0; i < 6; i++) for (let j = 0; j < 2; j++) { const fx = bx + i * 7 + j * 3, fy = 206 - j * 6; const g = c.createRadialGradient(fx - 1, fy - 1, 0.5, fx, fy, 4); g.addColorStop(0, tone(col, 0.45)); g.addColorStop(1, col); c.fillStyle = g; c.beginPath(); c.arc(fx, fy, 4, 0, Math.PI * 2); c.fill(); } });
    iCounter(c, 880, 220, 110, 48, '#37474f', { register: 940, mat: 'solid' });
    // shopping cart
    c.strokeStyle = '#9aa3aa'; c.lineWidth = 2; c.strokeRect(560, 280, 50, 28); for (let k = 1; k < 5; k++) { c.beginPath(); c.moveTo(560 + k * 10, 280); c.lineTo(560 + k * 10, 308); c.stroke(); } c.beginPath(); c.moveTo(610, 280); c.lineTo(626, 270); c.stroke(); [[566, 316], [604, 316]].forEach(([wx, wy]) => { c.fillStyle = '#333'; c.beginPath(); c.arc(wx, wy, 4, 0, Math.PI * 2); c.fill(); });
    iPeople(c, [[930, 214, 1.9, staff('#2e7d32')], [470, 330, 2, guest(1)], [760, 300, 1.9, guest(2)]]);
  },
  mall: c => {
    iWall(c, '#f3eefa'); iFloor(c, 'marble', ['#efece6']); iLights(c, 'chandelier', [500]);
    [[30, '#e91e63', 'FASHION'], [360, '#1e88e5', 'TECH WORLD'], [690, '#43a047', 'HOME & CO']].forEach(([sx, col, name]) => {
      box3d(c, sx, 50, 280, 210, 0, '#fafafa', 'solid'); iSign(c, sx + 60, 58, 160, 24, col, '#fff', name);
      c.fillStyle = '#f7f2e8'; c.fillRect(sx + 12, 92, 256, 160); glass(c, sx + 12, 92, 256, 160, 'rgba(200,230,250,.15)');
    });
    // things in each shop window
    for (let k = 0; k < 4; k++) { const mx = 70 + k * 58; c.fillStyle = '#ccc'; c.fillRect(mx, 110, 2, 120); drawPerson(c, mx + 1, 236, 2.2, { skin: '#e6e6e6', hair: '#e6e6e6', style: 'buzz', shirt: ['#e91e63', '#ffb300', '#3949ab', '#26a69a'][k], pants: '#37474f' }); }
    for (let k = 0; k < 3; k++) { box3d(c, 390 + k * 80, 150, 60, 40, 0.02, '#1d2329', 'solid'); c.fillStyle = ['#4fc3f7', '#81c784', '#ffb74d'][k]; c.fillRect(394 + k * 80, 154, 52, 30); box3d(c, 380 + k * 80, 200, 80, 50, 0.04, '#eceff1', 'solid'); }
    box3d(c, 720, 170, 110, 40, 0.05, '#7a5c8a', 'fabric'); box3d(c, 840, 140, 40, 100, 0.04, '#8a5e3c', 'wood', 2); iPlant(c, 905, 0.8);
    iPeople(c, [[300, 330, 2.1, guest(3)], [620, 340, 2.2, guest(4)], [560, 300, 1.8, guest(5)]]);
  },
  diner: c => {
    iWall(c, '#fdeef3', { tiles: true }); iFloor(c, 'checker', ['#f2f2f2', '#1d1d1d']); iLights(c, '#e53935', [150, 420, 700]);
    iBoard(c, 330, 28, 220, 86, '#222', 'MENU', ['Burger ........ $11', 'Healthy Lunch . $14', 'Pancakes ....... $9', 'Milkshake ...... $5'], '#ffe082');
    iCounter(c, 600, 196, 380, 72, '#c62828', { register: 930, mat: 'solid', top: '#e0e0e0', topMat: 'metal' });
    for (let k = 0; k < 5; k++) { const sx = 620 + k * 62; metal(c, sx + 8, 272, 4, 36, 1, '#bfc5ca'); c.fillStyle = '#c62828'; c.beginPath(); c.ellipse(sx + 10, 270, 15, 5, 0, 0, Math.PI * 2); c.fill(); c.fillStyle = '#e53935'; c.fillRect(sx - 5, 262, 30, 8); }
    // a booth
    box3d(c, 40, 160, 24, 108, 0.04, '#c62828', 'fabric'); box3d(c, 230, 160, 24, 108, 0.04, '#c62828', 'fabric');
    iTable(c, 80, 222, 140, '#e0e0e0', false); box3d(c, 64, 230, 16, 38, 0.06, '#b71c1c', 'fabric'); box3d(c, 214, 230, 16, 38, 0.06, '#b71c1c', 'fabric');
    c.fillStyle = '#8d5524'; c.beginPath(); c.ellipse(130, 216, 12, 5, 0, 0, Math.PI * 2); c.fill(); c.fillStyle = '#fdd835'; c.fillRect(160, 206, 10, 12); c.fillStyle = '#fff'; c.fillRect(160, 202, 10, 4);
    iWindow(c, 70, 50, 170, 90);
    iPeople(c, [[700, 190, 1.8, staff('#ffffff', 2)], [500, 330, 2, guest(6)], [110, 250, 1.6, guest(7)]]);
  },
  bank: c => {
    iWall(c, '#efe9dc'); iFloor(c, 'marble', ['#ece6da']); iLights(c, 'chandelier', [260, 740]);
    [130, 870].forEach(x => { const g = c.createLinearGradient(x - 16, 0, x + 16, 0); g.addColorStop(0, '#d8cfbd'); g.addColorStop(0.35, '#fffaf0'); g.addColorStop(1, '#bfb5a2'); c.fillStyle = g; c.fillRect(x - 16, 10, 32, IFLOOR - 10); });
    // vault
    const vx = 500, vy = 110; c.fillStyle = '#7d8791'; c.beginPath(); c.arc(vx, vy, 66, 0, Math.PI * 2); c.fill();
    const vg = c.createRadialGradient(vx - 20, vy - 20, 10, vx, vy, 60); vg.addColorStop(0, '#e3e7ea'); vg.addColorStop(1, '#8d979f'); c.fillStyle = vg; c.beginPath(); c.arc(vx, vy, 56, 0, Math.PI * 2); c.fill();
    for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; c.strokeStyle = '#6b747b'; c.lineWidth = 5; c.beginPath(); c.moveTo(vx, vy); c.lineTo(vx + Math.cos(a) * 30, vy + Math.sin(a) * 30); c.stroke(); knob(c, vx + Math.cos(a) * 30, vy + Math.sin(a) * 30, 4, '#c0c6cb'); }
    knob(c, vx, vy, 12, '#c0c6cb'); txt(c, 'VAULT', vx, vy + 76, '#5d4b2a', 11, 900);
    // teller windows
    iCounter(c, 180, 196, 640, 72, '#5d4037', { panels: true, top: '#d9cfbd', topMat: 'solid' });
    for (let k = 0; k < 4; k++) { const tx = 200 + k * 160; metal(c, tx, 120, 4, 70, 1, '#c9a54a'); glass(c, tx + 4, 120, 120, 70, 'rgba(200,230,250,.25)'); iSign(c, tx + 34, 104, 60, 14, '#2e7d32', '#fff', `WINDOW ${k + 1}`, 8); }
    iPeople(c, [[268, 190, 1.7, staff('#2e7d32', 1)], [588, 190, 1.7, staff('#2e7d32', 3)], [300, 330, 2.1, guest(8)], [650, 340, 2.1, guest(9)]]);
  },
  library: c => {
    iWall(c, '#e9dcc0', { wainscot: '#7a5332' }); iFloor(c, 'wood', ['#6e4a2a', '#a87a4a']); iLights(c, 'pendant', [300, 700]);
    for (let k = 0; k < 4; k++) iShelf(c, 20 + k * 120, 40, 110, 228, 'books', 10 + k, '#5b3820');
    for (let k = 0; k < 2; k++) iShelf(c, 740 + k * 125, 40, 115, 228, 'books', 20 + k, '#5b3820');
    iTable(c, 520, 236, 180, '#7a5135', true);
    [[560, 230], [640, 230]].forEach(([lx, ly]) => { metal(c, lx, ly - 30, 3, 30, 1, '#c9a54a'); c.fillStyle = '#2e7d32'; c.beginPath(); c.moveTo(lx - 12, ly - 30); c.lineTo(lx + 15, ly - 30); c.lineTo(lx + 10, ly - 40); c.lineTo(lx - 7, ly - 40); c.fill(); });
    book(c, 600, 226, 20, 8, '#9e2a2b'); iSign(c, 560, 30, 120, 22, '#6d4c41', '#fff', 'QUIET PLEASE', 10);
    iPeople(c, [[505, 270, 1.8, guest(10)], [720, 270, 1.8, guest(11)], [420, 330, 2, staff('#6d4c41', 2)]]);
  },
  school: c => {
    iWall(c, '#efe7d2'); iFloor(c, 'tile', ['#d9d3c4']); iLights(c, 'strip', [250, 750]);
    // chalkboard
    wood(c, 270, 40, 460, 130, '#7a5332', 2, 3); c.fillStyle = '#2e5d43'; c.fillRect(280, 50, 440, 110);
    c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 2; txt(c, 'Math Class: 2 + 3 = 5', 500, 76, 'rgba(255,255,255,.9)', 15, 700); txt(c, 'Money in − money out = savings', 500, 100, 'rgba(255,255,255,.85)', 13, 700); txt(c, '✓ Homework due Friday', 500, 128, 'rgba(255,240,150,.9)', 12, 700);
    c.fillStyle = '#eee'; c.fillRect(300, 160, 20, 5);
    iClock(c, 820, 60); iWindow(c, 40, 50, 180, 110); iFlag(c, 900, 60, '#1a3a6b');
    for (let r2 = 0; r2 < 2; r2++) for (let k = 0; k < 4; k++) { const dx = 130 + k * 200 + r2 * 40, dy = 250 + r2 * 40; box3d(c, dx, dy, 90, 8, 0.1, '#c9a06a', 'wood', k); box3d(c, dx + 6, dy + 8, 6, 30, 0.1, '#888', 'metal'); box3d(c, dx + 78, dy + 8, 6, 30, 0.1, '#888', 'metal'); }
    iPeople(c, [[500, 220, 2, staff('#1a3a6b', 4)], [220, 300, 1.6, guest(12)], [620, 300, 1.6, guest(13)], [360, 340, 1.8, guest(14)]]);
  },
  hospital: c => {
    iWall(c, '#eef5f8', { tiles: true }); iFloor(c, 'tile', ['#dfe9ee']); iLights(c, 'strip', [200, 500, 800]);
    iSign(c, 380, 26, 240, 30, '#e53935', '#fff', '✚ EMERGENCY & CLINIC', 13);
    iCounter(c, 330, 196, 340, 72, '#e3eef3', { register: 600, mat: 'solid', top: '#ffffff' });
    for (let k = 0; k < 5; k++) { const cx = 40 + k * 52; box3d(c, cx, 240, 44, 10, 0.08, '#4fc3f7', 'solid'); box3d(c, cx, 214, 6, 26, 0.04, '#4fc3f7', 'solid'); metal(c, cx + 4, 250, 3, 18, 1, '#bbb'); metal(c, cx + 36, 250, 3, 18, 1, '#bbb'); }
    // hospital bed and curtain
    for (let k = 0; k < 6; k++) { c.fillStyle = k % 2 ? '#b2dfdb' : '#a5d6d1'; c.fillRect(760 + k * 34, 70, 34, 170); } metal(c, 750, 66, 230, 4, 1, '#c0c6cb');
    box3d(c, 790, 222, 150, 14, 0.08, '#eceff1', 'metal'); box3d(c, 800, 206, 130, 16, 0.08, '#ffffff', 'fabric'); pillow(c, 806, 196, 30, 14);
    metal(c, 960, 140, 3, 128, 1, '#c0c6cb'); c.fillStyle = 'rgba(200,230,250,.8)'; rrect(c, 952, 140, 18, 26, 4); c.fill();
    iPlant(c, 300, 0.8);
    iPeople(c, [[500, 190, 1.8, staff('#26a69a', 5)], [70, 250, 1.6, guest(15)], [180, 250, 1.6, guest(16)], [700, 330, 2, staff('#ffffff', 6)]]);
  },
  jobcenter: c => {
    iWall(c, '#f1ece2'); iFloor(c, 'carpet', ['#4a5d78']); iLights(c, 'strip', [250, 750]);
    iBoard(c, 340, 30, 320, 130, '#c49a6c', '📌 JOB BOARD', [], '#3a2a10');
    for (let k = 0; k < 10; k++) { const nx = 352 + (k % 5) * 61, ny = 56 + Math.floor(k / 5) * 50; c.fillStyle = ['#fff59d', '#b3e5fc', '#f8bbd0', '#c8e6c9', '#ffe0b2'][k % 5]; c.save(); c.translate(nx + 25, ny + 20); c.rotate(((k * 7) % 5 - 2) * 0.04); c.fillRect(-25, -20, 50, 40); c.fillStyle = '#555'; for (let l = 0; l < 3; l++) c.fillRect(-18, -10 + l * 9, 36 - l * 8, 2); c.fillStyle = '#e53935'; c.beginPath(); c.arc(0, -17, 2.5, 0, Math.PI * 2); c.fill(); c.restore(); }
    [[60, 1], [700, 2]].forEach(([dx, i]) => { iCounter(c, dx, 214, 230, 54, '#8a6a44', {}); box3d(c, dx + 80, 168, 64, 40, 0.02, '#1d2329', 'solid'); c.fillStyle = '#4fc3f7'; c.fillRect(dx + 84, 172, 56, 32); metal(c, dx + 108, 208, 16, 6, 1, '#888'); drawPerson(c, dx + 50, 214, 1.7, staff('#ffb300', i)); });
    iPlant(c, 610); iClock(c, 900, 50);
    iPeople(c, [[230, 330, 2, guest(17)], [480, 330, 2.1, S.look], [820, 330, 2, guest(18)]].slice(0, 3).filter((p, i) => i !== 1));
  },
  cars: c => {
    iWall(c, '#eef2f5'); iFloor(c, 'marble', ['#e9edf0']); iLights(c, 'strip', [250, 750]);
    iWindow(c, 40, 40, 300, 150); iWindow(c, 660, 40, 300, 150);
    iCar(c, 90, 290, '#e53935'); iCar(c, 560, 300, '#1e88e5');
    // bikes on a rack
    for (let k = 0; k < 2; k++) { const bx = 380 + k * 70; c.strokeStyle = '#333'; c.lineWidth = 2.5; c.beginPath(); c.arc(bx, 250, 14, 0, Math.PI * 2); c.arc(bx + 42, 250, 14, 0, Math.PI * 2); c.stroke(); c.strokeStyle = k ? '#43a047' : '#fb8c00'; c.lineWidth = 3; c.beginPath(); c.moveTo(bx, 250); c.lineTo(bx + 16, 230); c.lineTo(bx + 34, 230); c.lineTo(bx + 42, 250); c.moveTo(bx + 16, 230); c.lineTo(bx + 22, 250); c.lineTo(bx + 34, 230); c.stroke(); }
    iSign(c, 380, 140, 120, 22, '#1565c0', '#fff', 'BIKES $250', 11);
    iPeople(c, [[520, 250, 1.8, staff('#1565c0', 7)], [300, 340, 2.1, guest(19)]]);
  },
  realestate: c => {
    iWall(c, '#f4efe4', { wainscot: '#8a6a44' }); iFloor(c, 'wood'); iLights(c, 'pendant', [500]);
    for (let k = 0; k < 6; k++) { const hx = 40 + (k % 3) * 100, hy = 40 + Math.floor(k / 3) * 70; wallShadow(c, hx, hy, 84, 58); c.fillStyle = '#fff'; c.fillRect(hx, hy, 84, 58); c.fillStyle = ['#a7d8f0', '#f7d794', '#d6f0b5'][k % 3]; c.fillRect(hx + 18, hy + 22, 48, 28); tri(c, [[hx + 12, hy + 24], [hx + 42, hy + 6], [hx + 72, hy + 24]], ['#c0392b', '#34495e', '#2c7a4b'][k % 3]); txt(c, ['$90K', '$260K', 'RENT'][k % 3], hx + 42, hy + 53, '#333', 8, 900); }
    iCounter(c, 520, 210, 240, 58, '#6d4c41', { panels: true });
    box3d(c, 560, 182, 44, 26, 0.03, '#f7d794', 'solid'); tri(c, [[554, 184], [582, 166], [610, 184]], '#c0392b');
    iPlant(c, 900); iClock(c, 820, 60);
    iPeople(c, [[680, 205, 1.8, staff('#00897b', 8)], [460, 330, 2.1, guest(20)]]);
  },
  cityhall: c => {
    iWall(c, '#efe7d4'); iFloor(c, 'marble', ['#e8e0cf']); iLights(c, 'chandelier', [500]);
    [100, 260, 740, 900].forEach(x => { const g = c.createLinearGradient(x - 15, 0, x + 15, 0); g.addColorStop(0, '#d8cfbd'); g.addColorStop(0.35, '#fffaf0'); g.addColorStop(1, '#bfb5a2'); c.fillStyle = g; c.fillRect(x - 15, 10, 30, IFLOOR - 10); });
    iSign(c, 380, 30, 240, 30, '#5d4b2a', '#fff', '🏛️ CITY HALL', 14);
    iFlag(c, 330, 70, '#1e88e5'); iFlag(c, 640, 70, '#e53935');
    iCounter(c, 380, 200, 240, 68, '#5d4037', { panels: true, bell: 600 });
    iRug(c, 500, 320, 200, 30, '#7e2a35');
    iPeople(c, [[470, 196, 1.8, staff('#5d4b2a', 9)], [300, 330, 2.1, guest(21)], [720, 330, 2, guest(22)]]);
  },
  theater: c => {
    iWall(c, '#3e0f16'); iFloor(c, 'carpet', ['#5a1a24']);
    box3d(c, 180, 200, 640, 50, 0.04, '#5d3a1f', 'wood', 2);                      // stage
    for (let k = 0; k < 14; k++) { const g = c.createLinearGradient(160 + k * 24, 0, 184 + k * 24, 0); g.addColorStop(0, '#8e1b2b'); g.addColorStop(0.5, '#c62838'); g.addColorStop(1, '#7a1424'); c.fillStyle = g; c.fillRect(160 + k * 24 + (k > 6 ? 180 : 0), 20, 24, 182); }
    c.fillStyle = '#c62838'; for (let k = 0; k < 20; k++) { c.beginPath(); c.arc(185 + k * 32, 22, 16, 0, Math.PI); c.fill(); }
    metal(c, 160, 12, 680, 8, 2, '#d4af37');
    const sg = c.createRadialGradient(500, 200, 10, 500, 200, 160); sg.addColorStop(0, 'rgba(255,245,200,.55)'); sg.addColorStop(1, 'rgba(255,245,200,0)'); c.fillStyle = sg; c.fillRect(300, 40, 400, 220);
    drawPerson(c, 500, 200, 2.2, staff('#ffd23f', 10));
    for (let r2 = 0; r2 < 2; r2++) for (let k = 0; k < 9; k++) { const sx = 60 + k * 100 + r2 * 40, sy = 300 + r2 * 38; box3d(c, sx, sy - 34, 60, 40, 0.04, '#b71c1c', 'fabric'); }
  },
  office: c => {
    iWall(c, '#e8edf2'); iFloor(c, 'carpet', ['#4a5568']); iLights(c, 'strip', [200, 500, 800]);
    iWindow(c, 40, 40, 920, 110);
    for (let k = 0; k < 4; k++) { const dx = 40 + k * 240; box3d(c, dx, 180, 200, 88, 0.05, '#cfd8dc', 'fabric'); box3d(c, dx + 60, 140, 70, 38, 0.02, '#1d2329', 'solid'); c.fillStyle = ['#4fc3f7', '#81c784', '#ffb74d', '#ba68c8'][k]; c.fillRect(dx + 64, 144, 62, 30); drawPerson(c, dx + 100, 200, 1.6, guest(30 + k)); }
    iPlant(c, 960, 0.8);
  },
  warehouse: c => {
    iWall(c, '#b0bec5'); iFloor(c, 'concrete'); iLights(c, 'strip', [250, 750]);
    for (let k = 0; k < 3; k++) iShelf(c, 30 + k * 330, 20, 300, 248, 'boxes', 40 + k, '#ef6c00');
    c.fillStyle = '#fbc02d'; c.fillRect(0, 330, RW, 6);
    // forklift
    box3d(c, 560, 270, 90, 40, 0.06, '#fbc02d', 'solid'); box3d(c, 600, 230, 40, 40, 0.05, '#333', 'solid'); metal(c, 650, 200, 6, 110, 1, '#555'); box3d(c, 656, 290, 50, 6, 0.05, '#555', 'metal');
    [[575, 312], [640, 312]].forEach(([wx, wy]) => { c.fillStyle = '#222'; c.beginPath(); c.arc(wx, wy, 11, 0, Math.PI * 2); c.fill(); });
    drawPerson(c, 616, 262, 1.5, staff('#fbc02d', 11));
  },
  // ---------- other towns ----------
  icecream: c => {
    iWall(c, '#fff5f8', { tiles: true }); iFloor(c, 'checker', ['#ffffff', '#f48fb1']); iLights(c, '#ec407a', [250, 750]);
    iBoard(c, 330, 26, 340, 90, '#fff', '🍦 FLAVORS', ['Strawberry · Chocolate · Vanilla', 'Mint · Cookie Dough · Mango', 'Cone $4 · Giant Sundae $9'], '#ad1457');
    iCase(c, 300, 160, 400, 108, 'icecream');
    iTable(c, 60, 236, 110, '#fce4ec', true); iTable(c, 800, 236, 110, '#fce4ec', true);
    const cx = 120, cy = 228; c.fillStyle = '#d7a86e'; c.beginPath(); c.moveTo(cx - 6, cy); c.lineTo(cx + 6, cy); c.lineTo(cx, cy + 14); c.fill(); c.fillStyle = '#f8bbd0'; c.beginPath(); c.arc(cx, cy - 3, 6, 0, Math.PI * 2); c.fill();
    iPeople(c, [[500, 160, 1.8, staff('#ec407a', 12)], [420, 330, 2, guest(40)], [850, 250, 1.6, guest(41)]]);
  },
  fishmarket: c => {
    iWall(c, '#e0f2f1', { tiles: true }); iFloor(c, 'tile', ['#cfe3e0']); iLights(c, 'strip', [250, 750]);
    iSign(c, 380, 28, 240, 26, '#00695c', '#fff', '🐟 TODAY\'S CATCH', 13);
    iCase(c, 120, 150, 380, 118, 'fish'); iCase(c, 540, 150, 300, 118, 'fish');
    // nets and a life ring
    c.strokeStyle = 'rgba(120,90,60,.5)'; c.lineWidth = 1; for (let k = 0; k < 12; k++) { c.beginPath(); c.moveTo(870 + k * 8, 30); c.lineTo(860 + k * 8, 140); c.stroke(); c.beginPath(); c.moveTo(860, 30 + k * 10); c.lineTo(960, 30 + k * 10); c.stroke(); }
    c.strokeStyle = '#e53935'; c.lineWidth = 10; c.beginPath(); c.arc(70, 80, 30, 0, Math.PI * 2); c.stroke(); c.strokeStyle = '#fff'; c.setLineDash([12, 14]); c.beginPath(); c.arc(70, 80, 30, 0, Math.PI * 2); c.stroke(); c.setLineDash([]);
    iPeople(c, [[320, 150, 1.8, staff('#ffffff', 13)], [700, 330, 2, guest(42)]]);
  },
  seahotel: c => hotelLobby(c, '#f3efe6', '#0d47a1', 'SEASIDE HOTEL', true),
  pineinn: c => hotelLobby(c, '#8d6e63', '#2e5d34', 'PINECREST INN', false, true),
  riverinn: c => hotelLobby(c, '#f3ecdc', '#33691e', 'RIVERSIDE INN', false),
  skilodge: c => {
    hotelLobby(c, '#795548', '#1565c0', 'SKI LODGE', false, true, true);
  },
  lighthouse: c => {
    iWall(c, '#ece6da', { bricks: true }); iFloor(c, 'wood');
    // spiral stairs
    for (let k = 0; k < 16; k++) { const a = k * 0.6, sx = 500 + Math.cos(a) * 90, sy = 250 - k * 14; box3d(c, Math.min(sx, 500) - 2, sy, Math.abs(sx - 500) + 20, 6, 0.04, '#5d4037', 'wood', k); }
    metal(c, 496, 20, 8, 248, 2, '#5d6a73');
    // the big lens
    const lg = c.createRadialGradient(820, 110, 5, 820, 110, 70); lg.addColorStop(0, 'rgba(255,250,210,1)'); lg.addColorStop(0.5, 'rgba(255,235,150,.7)'); lg.addColorStop(1, 'rgba(255,235,150,0)');
    c.fillStyle = lg; c.fillRect(740, 30, 160, 160);
    for (let k = 0; k < 6; k++) { c.strokeStyle = 'rgba(160,140,80,.6)'; c.lineWidth = 2; c.beginPath(); c.ellipse(820, 110, 20 + k * 8, 30 + k * 7, 0, 0, Math.PI * 2); c.stroke(); }
    iSign(c, 760, 210, 120, 22, '#c62828', '#fff', 'THE LENS', 10);
    iBoard(c, 60, 50, 240, 120, '#fffaf0', 'HOW LIGHTHOUSES WORK', ['A bright light spins at the top.', 'Ships see it far away at night', 'so they don\'t hit the rocks!', 'Built in 1891. 120 stairs.'], '#3e2723');
    iWindow(c, 330, 60, 60, 90);
    iPeople(c, [[250, 330, 2, staff('#c62828', 14)], [700, 340, 2.1, guest(43)]]);
  },
  harbor: c => {
    iWall(c, '#a1887f', { logs: true }); iFloor(c, 'wood', ['#6d4c41', '#9c7a54']); iLights(c, 'pendant', [300, 700]);
    iWindow(c, 560, 40, 380, 140);
    c.fillStyle = '#4fa3d6'; c.fillRect(560, 140, 380, 40); c.fillStyle = '#fff'; c.beginPath(); c.moveTo(700, 150); c.lineTo(760, 150); c.lineTo(750, 160); c.lineTo(710, 160); c.fill(); c.fillRect(728, 120, 2, 30); tri(c, [[730, 120], [730, 146], [752, 146]], '#fff');
    iBoard(c, 60, 40, 220, 120, '#f5f0e1', '⛵ TOURS', ['Boat Tour ......... $25', 'Deep-Sea Fishing .. $35', 'Leaves every hour!'], '#0d47a1');
    iCounter(c, 120, 210, 300, 58, '#5d4037', { register: 360 });
    c.strokeStyle = '#e53935'; c.lineWidth = 9; c.beginPath(); c.arc(480, 90, 26, 0, Math.PI * 2); c.stroke();
    c.strokeStyle = '#8d6e63'; c.lineWidth = 3; c.beginPath(); c.arc(330, 90, 26, 0, Math.PI * 2); for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; c.moveTo(330, 90); c.lineTo(330 + Math.cos(a) * 34, 90 + Math.sin(a) * 34); } c.stroke();
    iPeople(c, [[260, 206, 1.8, staff('#0277bd', 15)], [600, 330, 2.1, guest(44)]]);
  },
  generalstore: c => {
    iWall(c, '#a1887f', { logs: true }); iFloor(c, 'wood'); iLights(c, 'pendant', [300, 700]);
    iShelf(c, 40, 40, 260, 228, 'grocery', 50, '#6d4c41'); iShelf(c, 700, 40, 260, 228, 'grocery', 51, '#6d4c41');
    iCounter(c, 340, 206, 320, 62, '#6d4c41', { register: 600, panels: true });
    // barrels and jars
    [[350, 300], [420, 310]].forEach(([bx, by]) => { const g = c.createLinearGradient(bx - 22, 0, bx + 22, 0); g.addColorStop(0, '#5d3a1f'); g.addColorStop(0.4, '#a0703f'); g.addColorStop(1, '#4a2e17'); c.fillStyle = g; c.beginPath(); c.ellipse(bx, by, 24, 8, 0, 0, Math.PI * 2); c.fill(); c.fillRect(bx - 24, by - 40, 48, 40); c.fillStyle = '#a0703f'; c.beginPath(); c.ellipse(bx, by - 40, 24, 8, 0, 0, Math.PI * 2); c.fill(); metal(c, bx - 24, by - 32, 48, 3, 1, '#555'); metal(c, bx - 24, by - 10, 48, 3, 1, '#555'); });
    for (let k = 0; k < 3; k++) { c.fillStyle = 'rgba(220,240,250,.6)'; rrect(c, 380 + k * 34, 172, 26, 32, 4); c.fill(); for (let j = 0; j < 6; j++) { c.fillStyle = ['#e53935', '#fdd835', '#43a047', '#8e24aa'][(j + k) % 4]; c.beginPath(); c.arc(386 + k * 34 + (j % 3) * 7, 190 + Math.floor(j / 3) * 8, 3, 0, Math.PI * 2); c.fill(); } }
    iPeople(c, [[470, 200, 1.8, staff('#6d4c41', 16)], [600, 330, 2.1, guest(45)]]);
  },
  pancake: c => {
    iWall(c, '#fff3e0', { wainscot: '#d7a86e' }); iFloor(c, 'wood'); iLights(c, '#f9a825', [200, 500, 800]);
    iBoard(c, 380, 28, 240, 86, '#4e342e', '🥞 PANCAKES', ['Giant Stack ..... $8', 'Blueberry ....... $10', 'Open 6 AM – 2 PM'], '#ffe082');
    iCounter(c, 640, 200, 330, 68, '#8d4e1f', { register: 930 });
    metal(c, 660, 168, 160, 22, 3, '#555'); for (let k = 0; k < 4; k++) { c.fillStyle = '#e9b872'; c.beginPath(); c.ellipse(680 + k * 38, 168, 14, 4, 0, 0, Math.PI * 2); c.fill(); }
    iTable(c, 60, 236, 130, '#fff', true, '#e53935'); iTable(c, 320, 246, 130, '#fff', true, '#1e88e5');
    for (let k = 0; k < 3; k++) { c.fillStyle = '#e9b872'; c.beginPath(); c.ellipse(125, 232 - k * 4, 18, 5, 0, 0, Math.PI * 2); c.fill(); } c.fillStyle = '#8d4e1f'; c.beginPath(); c.ellipse(125, 222, 12, 3, 0, 0, Math.PI * 2); c.fill();
    iPeople(c, [[740, 196, 1.8, staff('#ffffff', 17)], [125, 260, 1.6, guest(46)], [385, 270, 1.6, guest(47)]]);
  },
  lumbermill: c => {
    iWall(c, '#8d6e63', { logs: true }); iFloor(c, 'concrete', ['#9e9a90']); iLights(c, 'strip', [250, 750]);
    // big saw and a log
    box3d(c, 300, 220, 400, 48, 0.06, '#5d6a73', 'metal');
    const lg = c.createLinearGradient(0, 180, 0, 220); lg.addColorStop(0, '#a0703f'); lg.addColorStop(1, '#5d3a1f'); c.fillStyle = lg; c.fillRect(320, 182, 360, 38);
    c.fillStyle = '#d7b98a'; c.beginPath(); c.ellipse(320, 201, 10, 19, 0, 0, Math.PI * 2); c.fill(); c.strokeStyle = '#a0703f'; c.lineWidth = 1; for (let k = 3; k < 18; k += 4) { c.beginPath(); c.ellipse(320, 201, k * 0.5, k, 0, 0, Math.PI * 2); c.stroke(); }
    const bx = 520, by = 150; c.fillStyle = '#cfd4d8'; c.beginPath(); c.arc(bx, by, 50, 0, Math.PI * 2); c.fill(); for (let k = 0; k < 24; k++) { const a = k / 24 * Math.PI * 2; tri(c, [[bx + Math.cos(a) * 50, by + Math.sin(a) * 50], [bx + Math.cos(a + 0.13) * 58, by + Math.sin(a + 0.13) * 58], [bx + Math.cos(a + 0.26) * 50, by + Math.sin(a + 0.26) * 50]], '#9aa3aa'); } knob(c, bx, by, 10, '#5d6a73');
    // stacked boards and logs
    for (let k = 0; k < 6; k++) box3d(c, 760, 250 - k * 10, 200, 10, 0.03, '#c9a06a', 'wood', k);
    for (let r2 = 0; r2 < 3; r2++) for (let k = 0; k < 4 - r2; k++) { const lx = 60 + k * 50 + r2 * 25, ly = 250 - r2 * 40; c.fillStyle = '#6d4c41'; c.beginPath(); c.arc(lx, ly, 22, 0, Math.PI * 2); c.fill(); c.fillStyle = '#d7b98a'; c.beginPath(); c.arc(lx, ly, 17, 0, Math.PI * 2); c.fill(); c.strokeStyle = '#a0703f'; for (let j = 4; j < 17; j += 4) { c.beginPath(); c.arc(lx, ly, j, 0, Math.PI * 2); c.stroke(); } }
    iPeople(c, [[700, 330, 2, staff('#e65100', 18)]]);
  },
  cocoa: c => {
    iWall(c, '#a1887f', { logs: true }); iFloor(c, 'wood'); iLights(c, '#c62828', [250, 500, 750]);
    iBoard(c, 600, 30, 260, 86, '#3e2723', '☕ COCOA CAFÉ', ['Hot Cocoa ........ $4', 'Warm Cookie ...... $3'], '#ffe0b2');
    iCounter(c, 580, 200, 390, 68, '#6d2a1e', { register: 930 });
    for (let k = 0; k < 4; k++) { const mx = 620 + k * 40; c.fillStyle = '#fff'; rrect(c, mx, 182, 18, 18, 3); c.fill(); c.fillStyle = '#6d3b1e'; c.beginPath(); c.ellipse(mx + 9, 183, 8, 2.5, 0, 0, Math.PI * 2); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(mx + 6, 182, 2.2, 0, Math.PI * 2); c.arc(mx + 11, 181, 2.2, 0, Math.PI * 2); c.fill(); }
    iTable(c, 80, 236, 120, '#8a5e3c', true, '#c62828'); iTable(c, 330, 246, 120, '#8a5e3c', true, '#2e7d32');
    iWindow(c, 60, 50, 220, 110); c.fillStyle = '#fff'; c.fillRect(60, 140, 220, 20);
    iPeople(c, [[760, 196, 1.8, staff('#c62828', 19)], [140, 260, 1.6, guest(48)], [390, 270, 1.6, guest(49)]]);
  },
  gearshop: c => {
    iWall(c, '#f0f6fb'); iFloor(c, 'wood', ['#7d5a3a', '#b88a5a']); iLights(c, 'strip', [250, 750]);
    iShelf(c, 40, 60, 240, 208, 'gear', 60, '#5d6a73');
    // ski rack
    for (let k = 0; k < 8; k++) { const sx = 340 + k * 26, col = ['#e53935', '#1e88e5', '#fdd835', '#43a047', '#8e24aa', '#fb8c00', '#00acc1', '#e91e63'][k]; c.fillStyle = col; rrect(c, sx, 50, 10, 210, 5); c.fill(); c.fillStyle = 'rgba(255,255,255,.4)'; c.fillRect(sx + 2, 60, 2, 190); }
    metal(c, 330, 90, 220, 5, 2, '#888'); metal(c, 330, 230, 220, 5, 2, '#888');
    // sleds
    for (let k = 0; k < 2; k++) { const sx = 600 + k * 120, sy = 250 - k * 4; c.fillStyle = ['#c62828', '#1565c0'][k]; rrect(c, sx, sy - 14, 90, 14, 6); c.fill(); c.strokeStyle = '#888'; c.lineWidth = 3; c.beginPath(); c.moveTo(sx, sy + 4); c.lineTo(sx + 90, sy + 4); c.quadraticCurveTo(sx + 102, sy + 4, sx + 100, sy - 10); c.stroke(); }
    iCounter(c, 820, 210, 150, 58, '#5d6a73', { register: 900, mat: 'solid' });
    iPeople(c, [[870, 204, 1.8, staff('#1565c0', 20)], [500, 330, 2.1, guest(50)]]);
  },
  hotsprings: c => {
    iWall(c, '#e6f0f1', { bricks: true }); iFloor(c, 'tile', ['#d6e3e5']);
    iWindow(c, 80, 40, 840, 120);
    const pg = c.createLinearGradient(0, 230, 0, 300); pg.addColorStop(0, '#7fd3e6'); pg.addColorStop(1, '#2f8fae');
    c.fillStyle = '#9e9e9e'; c.beginPath(); c.ellipse(500, 270, 360, 50, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = pg; c.beginPath(); c.ellipse(500, 268, 340, 42, 0, 0, Math.PI * 2); c.fill();
    for (let k = 0; k < 14; k++) { const rx = 160 + k * 50, ry = 222 + (k % 2) * 8; c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.arc(rx, ry, 14, 0, Math.PI * 2); c.arc(rx + 10, ry - 12, 10, 0, Math.PI * 2); c.fill(); }
    for (let k = 0; k < 10; k++) { c.fillStyle = '#8d8d8d'; c.beginPath(); c.ellipse(150 + k * 78, 240 + (k % 3) * 6, 22, 9, 0, 0, Math.PI * 2); c.fill(); }
    [[380, 270], [600, 268]].forEach(([px, py], i) => { drawPerson(c, px, py + 30, 2, guest(51 + i)); c.fillStyle = pg; c.fillRect(px - 40, py - 2, 80, 40); });
    c.save(); c.globalAlpha = 0.6; c.fillStyle = '#4fbfd6'; c.beginPath(); c.ellipse(500, 280, 330, 32, 0, 0, Math.PI); c.fill(); c.restore();
  },
  bakery: c => {
    iWall(c, '#fff8ee', { tiles: true }); iFloor(c, 'checker', ['#f5e6d3', '#c49a6c']); iLights(c, '#8d6e63', [250, 750]);
    iShelf(c, 40, 40, 260, 228, 'bread', 70, '#8a6a44'); iShelf(c, 700, 40, 260, 228, 'bread', 71, '#8a6a44');
    iCase(c, 330, 160, 340, 108, 'pastry');
    iBoard(c, 380, 26, 240, 80, '#3e2723', '🥐 FRESH TODAY', ['Bread $6 · Cake $5', 'Baking class $30'], '#ffe0b2');
    iPeople(c, [[500, 160, 1.8, staff('#ffffff', 21)], [460, 340, 2.1, guest(53)]]);
  },
  pottery: c => {
    iWall(c, '#efe2d2', { bricks: true }); iFloor(c, 'concrete', ['#b9ab99']); iLights(c, 'pendant', [300, 700]);
    iShelf(c, 40, 40, 260, 228, 'pots', 80, '#8a6a44');
    // kiln
    c.fillStyle = '#a1593a'; c.beginPath(); c.moveTo(780, 268); c.lineTo(780, 150); c.quadraticCurveTo(860, 80, 940, 150); c.lineTo(940, 268); c.fill();
    for (let y = 160; y < 268; y += 14) { c.fillStyle = 'rgba(0,0,0,.15)'; c.fillRect(780, y, 160, 2); }
    c.fillStyle = '#2b1a10'; rrect(c, 830, 190, 60, 50, 6); c.fill(); const fg = c.createRadialGradient(860, 220, 4, 860, 220, 30); fg.addColorStop(0, '#ffcc66'); fg.addColorStop(1, '#e65100'); c.fillStyle = fg; rrect(c, 836, 200, 48, 36, 4); c.fill();
    // pottery wheels
    [[420, 1], [600, 2]].forEach(([wx, i]) => { box3d(c, wx - 30, 230, 60, 38, 0.06, '#9aa3aa', 'metal'); c.fillStyle = '#7d8791'; c.beginPath(); c.ellipse(wx, 228, 34, 9, 0, 0, Math.PI * 2); c.fill(); c.fillStyle = '#a0522d'; c.beginPath(); c.moveTo(wx - 12, 226); c.quadraticCurveTo(wx - 18, 206, wx - 8, 196); c.lineTo(wx + 8, 196); c.quadraticCurveTo(wx + 18, 206, wx + 12, 226); c.fill(); drawPerson(c, wx + 46, 262, 1.6, i === 1 ? guest(54) : staff('#4e342e', 22)); });
    iPeople(c, [[300, 340, 2.1, guest(55)]]);
  },
};
function hotelLobby(c, wall, accent, name, sea, logs, ski) {
  iWall(c, wall, logs ? { logs: true } : { wainscot: '#8a6a44' }); iFloor(c, logs ? 'wood' : 'marble', logs ? [] : ['#ebe5d8']); iLights(c, 'chandelier', [500]);
  iSign(c, 380, 26, 240, 30, accent, '#fff', name, 14);
  if (sea) { iWindow(c, 40, 40, 240, 140); c.fillStyle = '#4fa3d6'; c.fillRect(40, 140, 240, 40); }
  else if (logs) {   // stone fireplace
    c.fillStyle = '#8d8d8d'; c.fillRect(60, 60, 200, 208); for (let y = 66; y < 268; y += 16) for (let x = 60 + ((y / 16) % 2) * 12; x < 256; x += 26) { c.fillStyle = tone('#8d8d8d', ((x + y) % 5 - 2) * 0.06); c.fillRect(x + 1, y + 1, 24, 14); }
    c.fillStyle = '#1d1410'; rrect(c, 100, 170, 120, 98, 10); c.fill();
    [[-1, '#ff6f00'], [0, '#ffa000'], [1, '#ffd54f']].forEach(([k, col]) => tri(c, [[140 + k * 20, 262], [160 + k * 16, 200 - Math.abs(k) * -10], [180 + k * 20, 262]], col));
    const fg = c.createRadialGradient(160, 230, 5, 160, 230, 200); fg.addColorStop(0, 'rgba(255,170,60,.35)'); fg.addColorStop(1, 'rgba(255,170,60,0)'); c.fillStyle = fg; c.fillRect(0, 50, 400, 330);
    if (ski) { for (let k = 0; k < 2; k++) { c.save(); c.translate(160, 110); c.rotate(k ? 0.5 : -0.5); c.fillStyle = k ? '#e53935' : '#1e88e5'; rrect(c, -5, -60, 10, 120, 5); c.fill(); c.restore(); } }
  } else iWindow(c, 40, 40, 240, 140);
  iCounter(c, 600, 200, 300, 68, logs ? '#5d3a1f' : '#6d4c41', { panels: true, bell: 860 });
  // key boxes behind the desk
  wood(c, 640, 60, 220, 90, '#6b4426', 2, 7); for (let k = 0; k < 12; k++) { const kx = 650 + (k % 6) * 35, ky = 70 + Math.floor(k / 6) * 38; c.fillStyle = '#3e2512'; c.fillRect(kx, ky, 30, 32); metal(c, kx + 13, ky + 8, 3, 14, 1, '#d4af37'); txt(c, String(101 + k), kx + 15, ky + 28, '#d4af37', 7, 800); }
  box3d(c, 300, 230, 200, 38, 0.08, accent, 'fabric'); box3d(c, 300, 200, 200, 30, 0.04, tone(accent, -0.1).startsWith('rgba') ? accent : accent, 'fabric');
  pillow(c, 320, 200, 34, 22, '#f5e6c8'); pillow(c, 450, 202, 32, 20, '#f5e6c8');
  iRug(c, 400, 320, 170, 26, '#7e2a35'); iPlant(c, 560, 0.9);
  iPeople(c, [[740, 196, 1.8, staff(accent, 23)], [520, 340, 2.1, guest(56)]]);
}

function drawInterior(cv, pid) {
  const cssW = cv.parentElement.clientWidth;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  cv.style.height = (cssW * RH / RW) + 'px';
  cv.width = Math.round(cssW * dpr); cv.height = Math.round(cssW * dpr * RH / RW);
  const c = cv.getContext('2d');
  c.setTransform(cv.width / RW, 0, 0, cv.width / RW, 0, 0);
  c.lineCap = 'round'; c.lineJoin = 'round';
  (INTERIORS[pid] || INTERIORS.office)(c);
  // you, just inside the door
  c.save(); c.filter = 'blur(3px)'; c.fillStyle = 'rgba(30,20,10,.3)'; c.beginPath(); c.ellipse(166, 346, 26, 6, 0, 0, Math.PI * 2); c.fill(); c.restore();
  drawPerson(c, 160, 346, 2.4, S.look);
  if (S.hour < 6 || S.hour >= 20) { c.fillStyle = 'rgba(20,25,55,.18)'; c.fillRect(0, 0, RW, RH); }
  const vg = c.createRadialGradient(RW / 2, RH / 2, RH * 0.4, RW / 2, RH / 2, RW * 0.62);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.22)');
  c.fillStyle = vg; c.fillRect(0, 0, RW, RH);
}
function interiorSection(pid) {
  return `<div class="roomwrap"><canvas id="intcv" data-pid="${pid}" aria-label="Inside the ${esc(PLACES[pid].name)}"></canvas></div>
    <div class="row"><button class="btn ghost sm" onclick="S.insideOf = null; render()">🚪 Go back outside</button></div>`;
}
