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

function drawRoom(cv) {
  const cssW = cv.parentElement.clientWidth;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  cv.style.height = (cssW * RH / RW) + 'px';
  cv.width = Math.round(cssW * dpr); cv.height = Math.round(cssW * dpr * RH / RW);
  const c = cv.getContext('2d');
  c.setTransform(cv.width / RW, 0, 0, cv.width / RW, 0, 0);
  c.lineCap = 'round'; c.lineJoin = 'round';
  const night = S.hour < 6 || S.hour >= 20;
  const dusk = !night && (S.hour < 7.5 || S.hour > 18);
  const rainy = S.weather === 'rainy';
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
  // planks get wider toward you (perspective)
  let py = FLOOR_Y, row = 0;
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
  } else {
    c.strokeStyle = 'rgba(230,240,255,.6)'; c.lineWidth = 1;
    for (let i = 0; i < 30; i++) { const x = WX + (i * 29) % WW, y = WY + (i * 47) % WH; c.beginPath(); c.moveTo(x, y); c.lineTo(x - 3, y + 9); c.stroke(); }
  }
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

  // ---------- paintings ----------
  const spots = [[220, 46, 70, 54], [334, 34, 86, 66], [446, 56, 60, 46], [524, 40, 70, 54], [624, 32, 58, 44], [706, 40, 62, 48], [236, 124, 50, 38], [456, 124, 52, 38]];
  S.walls.forEach((w, i) => { const sp = spots[i]; if (sp) { wallShadow(c, sp[0] - 4, sp[1] - 4, sp[2] + 8, sp[3] + 8); drawArt(c, ...sp, w); } });

  // ---------- bedroom ----------
  if (has('wardrobe')) {
    wallShadow(c, 190, 112, 72, 148); floorShadow(c, 190, 72);
    wood(c, 190, 112, 72, 150, '#6e4527', 3, 7);
    wood(c, 195, 120, 30, 136, '#7d5131', 2, 8); wood(c, 228, 120, 30, 136, '#7d5131', 2, 9);
    [[199, 126], [232, 126]].forEach(([x, y]) => { c.strokeStyle = 'rgba(40,20,8,.35)'; c.lineWidth = 1.2; rrect(c, x, y, 22, 54, 2); c.stroke(); rrect(c, x, y + 62, 22, 60, 2); c.stroke(); });
    metal(c, 219, 182, 3, 14, 1, '#d4af37'); metal(c, 230, 182, 3, 14, 1, '#d4af37');
  }
  if (has('lamp')) {
    floorShadow(c, 164, 28, FLOOR_Y + 2, 5);
    metal(c, 176, 158, 4, 104, 2, '#5a5f66'); solid(c, 164, 258, 28, 6, '#4a4f55', 3);
    if (night) {
      const g = c.createRadialGradient(178, 150, 4, 178, 170, 170);
      g.addColorStop(0, 'rgba(255,214,140,.55)'); g.addColorStop(0.5, 'rgba(255,214,140,.18)'); g.addColorStop(1, 'rgba(255,214,140,0)');
      c.fillStyle = g; c.fillRect(0, 0, 380, RH);
    }
    const lg = c.createLinearGradient(160, 0, 198, 0); lg.addColorStop(0, night ? '#fff1c9' : '#efe2c0'); lg.addColorStop(1, night ? '#ffd98a' : '#cdbb92');
    c.fillStyle = lg; c.beginPath(); c.moveTo(158, 160); c.lineTo(198, 160); c.lineTo(188, 132); c.lineTo(168, 132); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(0,0,0,.12)'; c.lineWidth = 1; c.stroke();
  }
  if (has('bed')) {
    floorShadow(c, 18, 160, FLOOR_Y + 6, 12);
    wood(c, 16, 174, 18, 96, '#5d3a1f', 3, 11);           // headboard
    wood(c, 160, 214, 12, 56, '#5d3a1f', 2, 12);          // footboard
    wood(c, 22, 238, 148, 18, '#6b4426', 2, 13);           // frame
    fabric(c, 30, 214, 136, 28, '#f3f1ec', 5);             // mattress
    c.strokeStyle = 'rgba(0,0,0,.08)'; c.beginPath(); c.moveTo(32, 236); c.lineTo(164, 236); c.stroke();
    fabric(c, 70, 206, 98, 34, '#3d6ea8', 8);              // duvet
    c.strokeStyle = 'rgba(255,255,255,.18)'; c.lineWidth = 2; for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(80 + k * 28, 210); c.quadraticCurveTo(90 + k * 28, 224, 84 + k * 28, 238); c.stroke(); }
    fabric(c, 70, 204, 98, 7, '#5a8cc6', 3);
    fabric(c, 34, 200, 38, 18, '#ffffff', 9);              // pillow
    c.strokeStyle = 'rgba(0,0,0,.08)'; c.lineWidth = 1; c.beginPath(); c.moveTo(42, 208); c.quadraticCurveTo(53, 212, 64, 208); c.stroke();
  } else if (hasF('mattress')) {
    floorShadow(c, 24, 144, FLOOR_Y + 8, 8);
    fabric(c, 24, 238, 144, 26, '#ece7dc', 6);
    c.strokeStyle = 'rgba(0,0,0,.1)'; c.lineWidth = 1; for (let k = 1; k < 6; k++) { c.beginPath(); c.arc(24 + k * 24, 251, 1.2, 0, Math.PI * 2); c.stroke(); }
    fabric(c, 66, 232, 100, 16, '#8aa5c6', 6);
    fabric(c, 30, 228, 34, 14, '#ffffff', 7);
  } else ghost(25, 220, 140, 42, '🛏️ No bed');

  // ---------- living room ----------
  if (has('rug')) {
    c.save(); c.filter = 'blur(2px)'; c.fillStyle = 'rgba(0,0,0,.2)'; c.beginPath(); c.ellipse(424, 318, 138, 30, 0, 0, Math.PI * 2); c.fill(); c.restore();
    const rg = c.createRadialGradient(420, 310, 10, 420, 314, 140); rg.addColorStop(0, '#b55a68'); rg.addColorStop(1, '#7e3744');
    c.fillStyle = rg; c.beginPath(); c.ellipse(420, 312, 136, 28, 0, 0, Math.PI * 2); c.fill();
    c.strokeStyle = '#e6c27f'; c.lineWidth = 3; c.beginPath(); c.ellipse(420, 312, 120, 22, 0, 0, Math.PI * 2); c.stroke();
    c.strokeStyle = '#e6c27f'; c.lineWidth = 1.5; c.beginPath(); c.ellipse(420, 312, 70, 12, 0, 0, Math.PI * 2); c.stroke();
    c.fillStyle = '#e6c27f'; for (let k = 0; k < 6; k++) { c.beginPath(); c.arc(360 + k * 24, 312, 3, 0, Math.PI * 2); c.fill(); }
  }
  if (has('bookshelf')) {
    wallShadow(c, 280, 104, 66, 156); floorShadow(c, 280, 66);
    wood(c, 280, 104, 66, 158, '#5b3820', 2, 21);
    c.fillStyle = '#3b2312'; c.fillRect(285, 110, 56, 148);
    for (let s = 0; s < 4; s++) {
      let x = 287;
      const colors = ['#9e2a2b', '#2b5f9e', '#2e7d4f', '#c9861a', '#6b3fa0', '#1f7a7a', '#b8562a', '#384d63', '#7d6b3d'];
      for (let k = 0; x < 338; k++) {
        const bw = 4 + ((k * 7 + s * 3) % 4), bh = 22 + ((k * 5 + s) % 3) * 4;
        const col = colors[(k * 3 + s * 2) % colors.length];
        const lean = k === 5 && s % 2 ? 1 : 0;
        if (lean) { c.save(); c.translate(x, 144 + s * 37); c.rotate(-0.25); solid(c, 0, -bh, bw, bh, col, 1); c.restore(); x += bw + 6; continue; }
        solid(c, x, 144 + s * 37 - bh, bw, bh, col, 1, { hi: 0.25, lo: 0.3 });
        c.fillStyle = 'rgba(255,230,160,.6)'; c.fillRect(x + 1, 144 + s * 37 - bh + 4, bw - 2, 1.2); c.fillRect(x + 1, 144 + s * 37 - 6, bw - 2, 1.2);
        x += bw + 0.6;
      }
      wood(c, 284, 144 + s * 37, 58, 4, '#6e4527', 1, 30 + s);
    }
  }
  if (has('couch')) {
    floorShadow(c, 344, 156, FLOOR_Y + 2, 10);
    wallShadow(c, 352, 192, 140, 50);
    const cc = '#456f7c';
    fabric(c, 352, 192, 140, 46, tone(cc, -0.05), 10);       // back
    fabric(c, 356, 228, 132, 28, cc, 6);                     // seat
    c.strokeStyle = 'rgba(0,0,0,.18)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(422, 230); c.lineTo(422, 255); c.stroke();
    c.beginPath(); c.moveTo(422, 196); c.lineTo(422, 228); c.stroke();
    fabric(c, 340, 212, 22, 48, tone(cc, -0.12), 10);        // arms
    fabric(c, 482, 212, 22, 48, tone(cc, -0.12), 10);
    wood(c, 350, 258, 6, 10, '#3e2614', 1, 5); wood(c, 488, 258, 6, 10, '#3e2614', 1, 6);
    fabric(c, 364, 204, 28, 24, '#e8b04b', 7);              // throw pillows
    fabric(c, 456, 206, 24, 22, '#e7e1d4', 7);
  }
  if (has('aquarium')) {
    floorShadow(c, 505, 72);
    wood(c, 503, 214, 74, 48, '#4a2f1d', 2, 41);
    c.fillStyle = 'rgba(0,0,0,.3)'; c.fillRect(507, 220, 66, 2);
    const ag = c.createLinearGradient(0, 166, 0, 214); ag.addColorStop(0, 'rgba(110,200,240,.9)'); ag.addColorStop(1, 'rgba(30,110,170,.95)');
    c.fillStyle = ag; c.fillRect(505, 166, 70, 48);
    c.fillStyle = '#d8c39a'; c.beginPath(); c.moveTo(505, 214); c.quadraticCurveTo(540, 202, 575, 210); c.lineTo(575, 214); c.fill();
    c.strokeStyle = '#3f8f3f'; c.lineWidth = 2; [[514, 212], [520, 212], [564, 212]].forEach(([x, y], i) => { c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + 6, y - 14, x - 2, y - 26 - i * 4); c.stroke(); });
    const fish = (x, y, col, d) => { c.fillStyle = col; c.beginPath(); c.ellipse(x, y, 7, 4, 0, 0, Math.PI * 2); c.fill(); c.beginPath(); c.moveTo(x - d * 6, y); c.lineTo(x - d * 11, y - 4); c.lineTo(x - d * 11, y + 4); c.fill(); c.fillStyle = '#111'; c.beginPath(); c.arc(x + d * 3.5, y - 1, 0.9, 0, Math.PI * 2); c.fill(); };
    fish(532, 184, '#ff9f1c', 1); fish(556, 196, '#e63946', -1); fish(540, 200, '#ffd23f', 1);
    c.fillStyle = 'rgba(255,255,255,.7)'; [[548, 176, 1.6], [550, 171, 1.2], [547, 168, 0.9]].forEach(([x, y, r]) => { c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill(); });
    glass(c, 505, 166, 70, 48, 'rgba(255,255,255,0)');
    c.strokeStyle = '#2a2a2a'; c.lineWidth = 2; c.strokeRect(505, 166, 70, 48); c.fillStyle = '#222'; c.fillRect(503, 162, 74, 5);
  }
  if (has('tv')) {
    wallShadow(c, 376, 92, 98, 58);
    c.fillStyle = '#121416'; rrect(c, 376, 92, 98, 58, 3); c.fill();
    const sc = c.createLinearGradient(380, 96, 470, 146);
    if (night) { sc.addColorStop(0, '#3b6fc4'); sc.addColorStop(1, '#22488a'); } else { sc.addColorStop(0, '#1e2a36'); sc.addColorStop(1, '#0d1319'); }
    c.fillStyle = sc; c.fillRect(380, 96, 90, 50);
    if (night) { c.fillStyle = 'rgba(255,255,255,.5)'; c.fillRect(392, 128, 30, 4); c.fillStyle = '#7dd36b'; c.fillRect(380, 130, 90, 16); }
    glass(c, 380, 96, 90, 50, 'rgba(255,255,255,0)');
    metal(c, 420, 150, 10, 4, 1, '#333');
    wood(c, 372, 154, 108, 8, '#4e3423', 2, 51);
    if (has('console')) { solid(c, 440, 162, 30, 9, '#1c1c1e', 3); c.fillStyle = '#39c'; c.fillRect(444, 166, 4, 1.5); }
    if (night) { const tvg = c.createRadialGradient(425, 140, 10, 425, 180, 160); tvg.addColorStop(0, 'rgba(110,160,255,.18)'); tvg.addColorStop(1, 'rgba(110,160,255,0)'); c.fillStyle = tvg; c.fillRect(260, 80, 340, 260); }
  }
  if (has('desk')) {
    floorShadow(c, 588, 86);
    wood(c, 586, 192, 88, 9, '#7a5135', 2, 61);
    wood(c, 591, 201, 7, 62, '#6a442b', 1, 62); wood(c, 662, 201, 7, 62, '#6a442b', 1, 63);
    wood(c, 640, 201, 22, 30, '#6f472d', 2, 64); metal(c, 646, 214, 10, 3, 1, '#b8a070');
    if (has('laptop')) {
      metal(c, 606, 186, 44, 6, 2, '#b0b8bf');
      c.fillStyle = '#1d2329'; rrect(c, 612, 158, 32, 28, 2); c.fill();
      const lsg = c.createLinearGradient(614, 160, 642, 184); lsg.addColorStop(0, '#4fc3f7'); lsg.addColorStop(1, '#1976d2');
      c.fillStyle = lsg; c.fillRect(614, 160, 28, 23); glass(c, 614, 160, 28, 23, 'rgba(255,255,255,0)');
    }
    solid(c, 656, 178, 10, 14, '#f2f2f2', 2); c.fillStyle = '#6b3e26'; c.fillRect(658, 180, 6, 3);
  } else if (has('laptop')) { metal(c, 606, 258, 44, 5, 2, '#b0b8bf'); c.fillStyle = '#1d2329'; c.fillRect(612, 234, 32, 24); }
  if (has('plant')) {
    floorShadow(c, 556, 30, FLOOR_Y + 2, 5);
    const pg = c.createLinearGradient(558, 0, 584, 0); pg.addColorStop(0, '#d9824b'); pg.addColorStop(0.4, '#c56a35'); pg.addColorStop(1, '#8e4521');
    c.fillStyle = pg; c.beginPath(); c.moveTo(556, 238); c.lineTo(586, 238); c.lineTo(582, 266); c.lineTo(560, 266); c.fill();
    c.fillStyle = '#a65a2c'; c.fillRect(554, 236, 34, 5);
    const leaf = (x, y, a, l, col) => { c.save(); c.translate(x, y); c.rotate(a); const g = c.createLinearGradient(0, -l, 0, 0); g.addColorStop(0, tone(col, 0.25)); g.addColorStop(1, tone(col, -0.2)); c.fillStyle = g; c.beginPath(); c.ellipse(0, -l / 2, l * 0.22, l / 2, 0, 0, Math.PI * 2); c.fill(); c.strokeStyle = tone(col, -0.35, 0.6); c.lineWidth = 0.8; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -l); c.stroke(); c.restore(); };
    [[-0.9, 26, '#2f7d32'], [-0.5, 34, '#388e3c'], [-0.1, 38, '#43a047'], [0.3, 33, '#2e7d32'], [0.75, 28, '#388e3c'], [1.1, 22, '#2f7d32'], [-1.2, 20, '#33691e']].forEach(([a, l, col]) => leaf(571, 238, a, l, col));
  }
  if (has('fan')) {
    floorShadow(c, 258, 28, FLOOR_Y + 2, 4);
    metal(c, 270, 226, 4, 38, 2, '#cfd4d8'); solid(c, 260, 262, 24, 5, '#b9bec2', 3);
    c.strokeStyle = '#9aa0a6'; c.lineWidth = 1.5; c.beginPath(); c.arc(272, 216, 14, 0, Math.PI * 2); c.stroke();
    c.fillStyle = 'rgba(200,215,225,.7)'; for (let k = 0; k < 3; k++) { c.save(); c.translate(272, 216); c.rotate(k * 2.1 + S.hour); c.beginPath(); c.ellipse(0, -7, 3.5, 7, 0, 0, Math.PI * 2); c.fill(); c.restore(); }
    c.strokeStyle = 'rgba(120,130,140,.5)'; c.lineWidth = 0.6; for (let k = -12; k <= 12; k += 4) { c.beginPath(); c.moveTo(272 + k, 202 + Math.abs(k) / 3); c.lineTo(272 + k, 230 - Math.abs(k) / 3); c.stroke(); }
  }

  // ---------- kitchen ----------
  if (own('fridge')) {
    floorShadow(c, 688, 60); wallShadow(c, 688, 96, 60, 166);
    metal(c, 688, 96, 60, 168, 6, '#d6dbdf');
    c.fillStyle = 'rgba(70,80,90,.55)'; c.fillRect(690, 154, 56, 2);
    metal(c, 738, 112, 4, 32, 2, '#9aa3aa'); metal(c, 738, 166, 4, 42, 2, '#9aa3aa');
    c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(694, 100, 4, 160);
    // magnets and a drawing
    solid(c, 700, 176, 22, 26, '#ffffff', 1); c.strokeStyle = '#e53935'; c.lineWidth = 1.5; c.beginPath(); c.arc(711, 186, 5, 0, Math.PI * 2); c.stroke(); c.strokeStyle = '#43a047'; c.beginPath(); c.moveTo(703, 198); c.lineTo(719, 198); c.stroke();
    solid(c, 708, 172, 6, 6, '#ff7043', 3); solid(c, 726, 120, 7, 7, '#42a5f5', 3);
  } else ghost(688, 96, 60, 168, '🧊 Fridge?');
  if (own('stove')) {
    floorShadow(c, 618, 68);
    metal(c, 618, 196, 66, 68, 3, '#e3e6e8');
    solid(c, 616, 188, 70, 10, '#2b2f33', 2);
    [[634, 191], [668, 191]].forEach(([x, y]) => { c.strokeStyle = '#555'; c.lineWidth = 2; c.beginPath(); c.ellipse(x, y, 11, 2.6, 0, 0, Math.PI * 2); c.stroke(); });
    [628, 640, 652, 664, 676].forEach(x => { solid(c, x - 3, 201, 6, 6, '#2b2f33', 3); });
    c.fillStyle = '#1c1f22'; rrect(c, 626, 214, 50, 36, 3); c.fill();
    const og = c.createLinearGradient(0, 216, 0, 248); og.addColorStop(0, '#3a2a1c'); og.addColorStop(1, '#17110b');
    c.fillStyle = og; c.fillRect(630, 218, 42, 28); glass(c, 630, 218, 42, 28, 'rgba(255,255,255,0)');
    metal(c, 628, 210, 46, 3, 1, '#9aa3aa');
    if (has('microwave')) { wallShadow(c, 624, 144, 56, 34); metal(c, 624, 144, 56, 34, 3, '#c4cacf'); c.fillStyle = '#16191c'; c.fillRect(628, 148, 34, 26); glass(c, 628, 148, 34, 26, 'rgba(255,255,255,0)'); c.fillStyle = '#4caf50'; c.fillRect(666, 150, 10, 4); }
  } else {
    if (!has('desk')) ghost(618, 196, 66, 68, '🍳 Stove?');
    if (has('microwave')) { metal(c, 622, 228, 56, 34, 3, '#c4cacf'); c.fillStyle = '#16191c'; c.fillRect(626, 232, 34, 26); }
  }
  if (own('table')) {
    floorShadow(c, 452, 150, FLOOR_Y + 34, 10);
    const chair = (x, d) => {
      wood(c, x, 244, 6, 76, '#6b4628', 1, x);
      wood(c, x + (d > 0 ? 0 : -16), 290, 22, 5, '#7a5333', 1, x + 1);
      wood(c, x + (d > 0 ? 16 : -16), 293, 4, 28, '#6b4628', 1, x + 2);
      for (let k = 0; k < 3; k++) wood(c, x + (d > 0 ? 1 : 1), 252 + k * 10, 4, 3, '#7a5333', 1, x + k);
    };
    chair(448, 1); chair(598, -1);
    wood(c, 466, 266, 120, 9, '#8a5e3c', 2, 71);
    c.fillStyle = 'rgba(255,255,255,.18)'; c.fillRect(470, 267, 112, 1.5);
    wood(c, 476, 275, 7, 46, '#6f4a2e', 1, 72); wood(c, 570, 275, 7, 46, '#6f4a2e', 1, 73);
    if (S.groceries > 0) {
      porcelain(c, 504, 260, 40, 7, 4);
      [[512, 257, '#e53935'], [522, 255, '#ffb300'], [532, 257, '#7cb342']].forEach(([x, y, col]) => { const g = c.createRadialGradient(x - 2, y - 2, 1, x, y, 6); g.addColorStop(0, tone(col, 0.4)); g.addColorStop(1, tone(col, -0.25)); c.fillStyle = g; c.beginPath(); c.arc(x, y, 5.5, 0, Math.PI * 2); c.fill(); });
    }
  }

  // ---------- bathroom ----------
  // mirror + sink
  wallShadow(c, 812, 26, 46, 60);
  c.fillStyle = '#b9c4cb'; rrect(c, 810, 24, 50, 64, 4); c.fill();
  const mg2 = c.createLinearGradient(814, 28, 856, 84); mg2.addColorStop(0, '#e9f4fa'); mg2.addColorStop(1, '#a9c3d3');
  c.fillStyle = mg2; c.fillRect(814, 28, 42, 56); glass(c, 814, 28, 42, 56, 'rgba(255,255,255,0)');
  porcelain(c, 806, 94, 58, 14, 6); metal(c, 831, 86, 6, 10, 2, '#c0c6cb');
  metal(c, 830, 108, 10, 22, 2, '#cfd4d8');
  if (has('bathtub')) {
    floorShadow(c, 888, 108, FLOOR_Y + 2, 7);
    porcelain(c, 888, 212, 108, 52, 12);
    c.fillStyle = 'rgba(160,210,240,.85)'; rrect(c, 896, 216, 92, 12, 6); c.fill();
    c.fillStyle = '#fff'; [[908, 214, 7], [920, 211, 6], [934, 214, 7], [950, 212, 5], [962, 215, 6]].forEach(([x, y, r]) => { const g = c.createRadialGradient(x - 2, y - 2, 1, x, y, r); g.addColorStop(0, '#fff'); g.addColorStop(1, '#dbe9f2'); c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill(); });
    metal(c, 980, 196, 6, 18, 2, '#c0c6cb'); metal(c, 970, 196, 16, 4, 2, '#c0c6cb');
    solid(c, 896, 262, 8, 6, '#b8a070', 3); solid(c, 980, 262, 8, 6, '#b8a070', 3);
  }
  if (hasF('shower') && (has('shower') || !has('bathtub'))) {
    c.fillStyle = 'rgba(210,225,235,.6)'; c.fillRect(910, 262, 86, 6);
    metal(c, 948, 52, 4, 26, 2, '#c0c6cb'); metal(c, 940, 74, 20, 6, 3, '#aab2b8');
    c.fillStyle = 'rgba(120,170,200,.25)'; for (let k = 0; k < 7; k++) c.fillRect(944 + k * 2, 82 + (k % 3) * 4, 0.8, 26);
    glass(c, 908, 56, 88, 206, 'rgba(200,230,245,.22)');
    c.strokeStyle = '#9aa7b0'; c.lineWidth = 2.5; c.strokeRect(908, 56, 88, 206);
    metal(c, 912, 150, 3, 30, 1, '#c0c6cb');
  } else if (!hasF('shower')) ghost(908, 96, 88, 166, '🚿 Shower?');
  if (own('toilet')) {
    floorShadow(c, 812, 50, FLOOR_Y + 2, 6);
    porcelain(c, 812, 178, 30, 44, 5);                     // tank
    porcelain(c, 808, 174, 38, 8, 3);                      // lid
    metal(c, 816, 184, 10, 3, 1, '#b0b8bf');               // flush lever
    c.fillStyle = '#eef2f4'; c.beginPath(); c.ellipse(842, 228, 30, 9, 0, 0, Math.PI * 2); c.fill(); c.strokeStyle = 'rgba(120,135,150,.5)'; c.lineWidth = 1; c.stroke();
    const bg = c.createLinearGradient(824, 230, 860, 266); bg.addColorStop(0, '#ffffff'); bg.addColorStop(1, '#c5ced4');
    c.fillStyle = bg; c.beginPath(); c.moveTo(816, 230); c.quadraticCurveTo(842, 266, 866, 230); c.lineTo(856, 266); c.lineTo(830, 266); c.closePath(); c.fill(); c.stroke();
    if (S.supplies > 0 || S.home === 'parents') {
      metal(c, 868, 198, 12, 3, 1, '#b0b8bf');
      const tp = c.createLinearGradient(868, 196, 880, 214); tp.addColorStop(0, '#ffffff'); tp.addColorStop(1, '#d9dfe3');
      c.fillStyle = tp; c.beginPath(); c.arc(874, 206, 8, 0, Math.PI * 2); c.fill(); c.fillStyle = '#c7b59a'; c.beginPath(); c.arc(874, 206, 2.6, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#fafafa'; c.fillRect(866, 206, 4, 16);
    } else { metal(c, 868, 198, 12, 3, 1, '#b0b8bf'); c.fillStyle = '#c7b59a'; c.beginPath(); c.arc(874, 206, 3, 0, Math.PI * 2); c.fill(); }
  } else ghost(806, 186, 70, 80, '🚽 Toilet?');
  if (own('washer')) {
    floorShadow(c, 750, 32, FLOOR_Y + 2, 5);
    porcelain(c, 750, 220, 32, 46, 3);
    c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(752, 228, 28, 1);
    c.fillStyle = '#9fb3c0'; c.beginPath(); c.arc(766, 247, 11, 0, Math.PI * 2); c.fill();
    const wg2 = c.createRadialGradient(763, 244, 2, 766, 247, 10); wg2.addColorStop(0, '#d6ecf7'); wg2.addColorStop(1, '#5d89a5');
    c.fillStyle = wg2; c.beginPath(); c.arc(766, 247, 8.5, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#4caf50'; c.fillRect(754, 223, 5, 2); solid(c, 770, 222, 8, 4, '#9aa3aa', 2);
  }

  // ---------- you ----------
  if (atHome()) {
    c.save(); c.filter = 'blur(3px)'; c.fillStyle = 'rgba(30,20,10,.35)'; c.beginPath(); c.ellipse(306, 334, 26, 6, 0, 0, Math.PI * 2); c.fill(); c.restore();
    drawPerson(c, 300, 334, 2.3, S.look);
  }

  // ---------- light & mood ----------
  if (night) {
    c.fillStyle = has('lamp') ? 'rgba(15,22,50,.28)' : 'rgba(12,18,45,.5)'; c.fillRect(0, 0, RW, RH);
    if (has('lamp')) { c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(178, 150, 5, 178, 200, 200); g.addColorStop(0, 'rgba(255,190,110,.22)'); g.addColorStop(1, 'rgba(255,190,110,0)'); c.fillStyle = g; c.fillRect(0, 0, 420, RH); c.restore(); }
  } else if (rainy) { c.fillStyle = 'rgba(60,70,90,.12)'; c.fillRect(0, 0, RW, RH); }
  else if (dusk) { c.fillStyle = 'rgba(255,150,80,.08)'; c.fillRect(0, 0, RW, RH); }
  const vg = c.createRadialGradient(RW / 2, RH / 2, RH * 0.4, RW / 2, RH / 2, RW * 0.62);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.22)');
  c.fillStyle = vg; c.fillRect(0, 0, RW, RH);
}
