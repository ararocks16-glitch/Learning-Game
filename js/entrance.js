// ===================== DOORS FOR EVERY BUILDING =====================
// You arrive outside. The sign shows the hours. Open the door to go inside.

// facade: brick, glass, stone, store, wood, siding · door: swing, double, slide
const ENTRANCE = {
  jobcenter:  { facade: 'glass', wall: '#5c7a99', door: 'slide', doorCol: '#9fc4dd', signBg: '#ffb300', signFg: '#2a1a00', hours: [8, 18], inside: '#f1ece2', keeper: true },
  school:     { facade: 'brick', wall: '#b5523b', door: 'double', doorCol: '#1a3a6b', signBg: '#1a3a6b', signFg: '#ffd23f', hours: [7, 21], inside: '#efe7d2' },
  library:    { facade: 'stone', wall: '#efe3c6', door: 'double', doorCol: '#6b3e26', signBg: '#6d4c41', signFg: '#fff', hours: [8, 21], inside: '#e9dcc0' },
  market:     { facade: 'store', wall: '#f3f3ef', door: 'slide', doorCol: '#bfe3f5', signBg: '#2e7d32', signFg: '#fff', hours: [7, 22], inside: '#f5f7f2', awning: '#2e7d32', keeper: true },
  mall:       { facade: 'store', wall: '#ece1f5', door: 'slide', doorCol: '#bfe3f5', signBg: '#7e57c2', signFg: '#fff', hours: [8, 22], inside: '#f4eefb', awning: '#7e57c2' },
  diner:      { facade: 'store', wall: '#f8bbd0', door: 'swing', doorCol: '#e53935', signBg: '#e53935', signFg: '#ffd23f', hours: [6, 23], inside: '#fff3e6', awning: '#e53935', keeper: true },
  cars:       { facade: 'glass', wall: '#eceff1', door: 'swing', doorCol: '#bfe3f5', signBg: '#1565c0', signFg: '#fff', hours: [8, 20], inside: '#eef2f5', keeper: true },
  bank:       { facade: 'stone', wall: '#e0e0e0', door: 'double', doorCol: '#3e2723', signBg: '#2e7d32', signFg: '#fff', hours: [8, 21], inside: '#efe9dc', keeper: true },
  realestate: { facade: 'siding', wall: '#fff8e1', door: 'swing', doorCol: '#00695c', signBg: '#00897b', signFg: '#fff', hours: [8, 20], inside: '#f4efe4', keeper: true },
  hospital:   { facade: 'glass', wall: '#f5f7fa', door: 'slide', doorCol: '#cfe8fb', signBg: '#e53935', signFg: '#fff', hours: [0, 24], inside: '#eef5f8', keeper: true },
  cityhall:   { facade: 'stone', wall: '#ece4d2', door: 'double', doorCol: '#5d4037', signBg: '#5d4b2a', signFg: '#fff', hours: [8, 20], inside: '#efe7d4' },
  theater:    { facade: 'brick', wall: '#7b1f2e', door: 'double', doorCol: '#3e0f16', signBg: '#ffd23f', signFg: '#7b1f2e', hours: [10, 24], inside: '#5a1a24' },
  office:     { facade: 'glass', wall: '#4b6584', door: 'slide', doorCol: '#9fc4dd', signBg: '#22313f', signFg: '#fff', hours: [6, 20], inside: '#e8edf2' },
  warehouse:  { facade: 'brick', wall: '#90a4ae', door: 'swing', doorCol: '#607d8b', signBg: '#37474f', signFg: '#fff', hours: [5, 20], inside: '#d7dde0' },
};
const ENTRANCE_NAMES = {};   // optional shorter sign text
function entranceOf(pid) { return ENTRANCE[pid] || null; }
function isOpenNow(pid) {
  const st = ENTRANCE[pid]; if (!st) return true;
  const [a, b] = st.hours;
  return S.hour >= a && S.hour < b;
}
function hoursText(pid) {
  const [a, b] = ENTRANCE[pid].hours;
  if (a === 0 && b === 24) return 'Open 24 hours';
  return `Open ${fmtTime(a)} – ${fmtTime(b % 24)}`;
}

function drawEntrance(cv, pid, open = 0) {
  const st = ENTRANCE[pid], p = PLACES[pid];
  const cssW = cv.parentElement.clientWidth;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  cv.style.height = (cssW * RH / RW) + 'px';
  if (cv.width !== Math.round(cssW * dpr)) { cv.width = Math.round(cssW * dpr); cv.height = Math.round(cssW * dpr * RH / RW); }
  const c = cv.getContext('2d');
  c.setTransform(cv.width / RW, 0, 0, cv.width / RW, 0, 0);
  c.lineCap = 'round';
  const night = S.hour < 6 || S.hour >= 20, rainy = S.weather === 'rainy', openNow = isOpenNow(pid);
  const GROUND = 300;
  const D = st.door === 'swing' ? { x: 446, y: 116, w: 108, h: 184 } : { x: 410, y: 108, w: 180, h: 192 };

  // sky
  const sky = c.createLinearGradient(0, 0, 0, 60);
  if (night) { sky.addColorStop(0, '#0b1633'); sky.addColorStop(1, '#22365f'); } else if (rainy) { sky.addColorStop(0, '#7d8a9b'); sky.addColorStop(1, '#aeb8c4'); } else { sky.addColorStop(0, '#5aa9e6'); sky.addColorStop(1, '#cfe8fa'); }
  c.fillStyle = sky; c.fillRect(0, 0, RW, 40);

  // ---- the wall ----
  const W = st.wall;
  c.fillStyle = W; c.fillRect(0, 24, RW, GROUND - 24);
  if (st.facade === 'brick') {
    for (let y = 24, r = 0; y < GROUND; y += 10, r++) for (let x = (r % 2) * 14; x < RW; x += 28) {
      c.fillStyle = tone(W, ((x * 7 + y * 3) % 5 - 2) * 0.04); c.fillRect(x + 1, y + 1, 26, 8);
    }
    c.fillStyle = 'rgba(0,0,0,.08)'; for (let y = 24; y < GROUND; y += 10) c.fillRect(0, y, RW, 1);
  } else if (st.facade === 'stone') {
    for (let y = 24, r = 0; y < GROUND; y += 24, r++) for (let x = (r % 2) * 40; x < RW; x += 80) { c.fillStyle = tone(W, ((x + y) % 3 - 1) * 0.04); c.fillRect(x + 1, y + 1, 78, 22); }
    [240, 300, 700, 760].forEach(x => { const g = c.createLinearGradient(x - 15, 0, x + 15, 0); g.addColorStop(0, tone(W, -0.15)); g.addColorStop(0.35, tone(W, 0.3)); g.addColorStop(1, tone(W, -0.25)); c.fillStyle = g; c.fillRect(x - 15, 60, 30, GROUND - 60); c.fillStyle = tone(W, 0.15); c.fillRect(x - 21, 54, 42, 10); c.fillRect(x - 21, GROUND - 12, 42, 12); });
    c.fillStyle = tone(W, 0.1); c.beginPath(); c.moveTo(200, 56); c.lineTo(500, 20); c.lineTo(800, 56); c.closePath(); c.fill();
    c.strokeStyle = tone(W, -0.2); c.lineWidth = 2; c.stroke();
  } else if (st.facade === 'glass') {
    const g = c.createLinearGradient(0, 24, RW, GROUND); g.addColorStop(0, night ? '#2b3b52' : '#9fc4dd'); g.addColorStop(0.5, night ? '#3d5574' : '#cfe3f0'); g.addColorStop(1, night ? '#22324a' : '#86afcb');
    c.fillStyle = g; c.fillRect(0, 24, RW, GROUND - 24);
    if (night) { c.fillStyle = 'rgba(255,214,110,.5)'; for (let i = 0; i < 18; i++) if ((i * 7) % 3) c.fillRect((i * 61) % RW, 30 + (i * 37) % 120, 56, 40); }
    c.strokeStyle = tone(W, -0.1); c.lineWidth = 5; for (let x = 0; x < RW; x += 62) { c.beginPath(); c.moveTo(x, 24); c.lineTo(x, GROUND); c.stroke(); }
    for (let y = 24; y < GROUND; y += 46) { c.beginPath(); c.moveTo(0, y); c.lineTo(RW, y); c.stroke(); }
    c.fillStyle = 'rgba(255,255,255,.18)'; for (let k = 0; k < 6; k++) { c.beginPath(); c.moveTo(k * 180, 24); c.lineTo(k * 180 + 60, 24); c.lineTo(k * 180 - 40, GROUND); c.lineTo(k * 180 - 100, GROUND); c.fill(); }
  } else if (st.facade === 'wood') {
    for (let y = 24; y < GROUND; y += 16) { const g = c.createLinearGradient(0, y, 0, y + 16); g.addColorStop(0, tone(W, 0.15)); g.addColorStop(0.5, W); g.addColorStop(1, tone(W, -0.3)); c.fillStyle = g; c.fillRect(0, y, RW, 16); }
    for (let i = 0; i < 40; i++) { c.fillStyle = tone(W, -0.35); c.beginPath(); c.arc((i * 131) % RW, 30 + (i * 53) % (GROUND - 40), 2.5, 0, Math.PI * 2); c.fill(); }
  } else if (st.facade === 'siding') {
    for (let y = 24; y < GROUND; y += 13) { c.fillStyle = 'rgba(0,0,0,.09)'; c.fillRect(0, y + 11, RW, 2); c.fillStyle = 'rgba(255,255,255,.2)'; c.fillRect(0, y, RW, 1.5); }
  } else if (st.facade === 'store') {
    c.fillStyle = tone(W, -0.08); c.fillRect(0, 24, RW, 30);
  }
  // roof line
  c.fillStyle = st.facade === 'wood' ? '#4e342e' : st.facade === 'siding' ? '#5b4636' : tone(W, -0.35); c.fillRect(0, 18, RW, 10);
  c.fillStyle = 'rgba(0,0,0,.2)'; c.fillRect(0, 28, RW, 5);

  // ---- display windows (left and right of the door) ----
  if (st.facade !== 'glass') {
    [[80, 120, 230, 140], [690, 120, 230, 140]].forEach(([wx, wy, ww, wh], side) => {
      c.fillStyle = tone(W, -0.4); c.fillRect(wx - 7, wy - 7, ww + 14, wh + 14);
      const g = c.createLinearGradient(0, wy, 0, wy + wh);
      if (openNow && night) { g.addColorStop(0, '#fff2cf'); g.addColorStop(1, '#f2cf8a'); } else if (openNow) { g.addColorStop(0, tone(st.inside, -0.02)); g.addColorStop(1, tone(st.inside, -0.15)); } else { g.addColorStop(0, '#3a4450'); g.addColorStop(1, '#1f262e'); }
      c.fillStyle = g; c.fillRect(wx, wy, ww, wh);
      if (openNow) shopWindowStuff(c, pid, wx, wy, ww, wh, side);
      glass(c, wx, wy, ww, wh, 'rgba(255,255,255,0)');
      c.fillStyle = tone(W, -0.25); c.fillRect(wx - 10, wy + wh + 6, ww + 20, 8);
    });
  }
  // awning
  if (st.awning) {
    const y0 = 70;
    for (let k = 0; k < 40; k++) { c.fillStyle = k % 2 ? '#ffffff' : st.awning; c.beginPath(); c.moveTo(k * 26, y0); c.lineTo(k * 26 + 26, y0); c.lineTo(k * 26 + 30, y0 + 30); c.lineTo(k * 26 + 4, y0 + 30); c.fill(); }
    for (let k = 0; k < 40; k++) { c.fillStyle = k % 2 ? '#f1f1f1' : tone(st.awning, -0.15); c.beginPath(); c.arc(k * 26 + 17, y0 + 30, 13, 0, Math.PI); c.fill(); }
    c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(0, y0 + 44, RW, 6);
  }
  // ---- the sign ----
  const name = ENTRANCE_NAMES[pid] || p.name.toUpperCase();
  c.font = '900 26px system-ui, sans-serif';
  const sw = Math.min(RW - 120, c.measureText(name).width + 110);
  const sy = st.awning ? 30 : 48;
  c.fillStyle = 'rgba(0,0,0,.25)'; rrect(c, RW / 2 - sw / 2 + 5, sy + 5, sw, 40, 8); c.fill();
  c.fillStyle = st.signBg; rrect(c, RW / 2 - sw / 2, sy, sw, 40, 8); c.fill();
  c.strokeStyle = tone(st.signBg, 0.3); c.lineWidth = 2; c.stroke();
  txt(c, `${p.icon} ${name}`, RW / 2, sy + 21, st.signFg, 24, 900);
  if (night && openNow) { c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = 'rgba(255,240,200,.12)'; rrect(c, RW / 2 - sw / 2 - 10, sy - 10, sw + 20, 60, 14); c.fill(); c.restore(); }

  // ---- sidewalk ----
  const sg = c.createLinearGradient(0, GROUND, 0, RH); sg.addColorStop(0, '#bdb7aa'); sg.addColorStop(1, '#d6d0c3');
  c.fillStyle = sg; c.fillRect(0, GROUND, RW, RH - GROUND);
  c.strokeStyle = 'rgba(90,80,70,.3)'; c.lineWidth = 1;
  for (let x = -200; x < RW + 200; x += 90) { c.beginPath(); c.moveTo(RW / 2 + (x - RW / 2) * 0.7, GROUND); c.lineTo(x, RH); c.stroke(); }
  for (let y = GROUND + 18; y < RH; y += 22) { c.beginPath(); c.moveTo(0, y); c.lineTo(RW, y); c.stroke(); }
  c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(0, GROUND, RW, 4);
  // planters
  [[D.x - 90, GROUND - 2], [D.x + D.w + 46, GROUND - 2]].forEach(([px, py]) => {
    box3d(c, px, py - 34, 44, 34, 0.02, '#8d8478', 'solid');
    [[-10, 18], [0, 22], [10, 18]].forEach(([dx, r]) => { const g = c.createRadialGradient(px + 22 + dx - 4, py - 50, 2, px + 22 + dx, py - 46, r); g.addColorStop(0, '#6fbf5a'); g.addColorStop(1, '#2f7d32'); c.fillStyle = g; c.beginPath(); c.arc(px + 22 + dx, py - 44 + (r < 20 ? 4 : 0), r * 0.75, 0, Math.PI * 2); c.fill(); });
  });

  // ---- doorway: inside peek ----
  if (open > 0) {
    c.save(); c.beginPath(); c.rect(D.x, D.y, D.w, D.h); c.clip();
    const ig = c.createLinearGradient(0, D.y, 0, D.y + D.h); ig.addColorStop(0, st.inside); ig.addColorStop(0.7, tone(st.inside, -0.08)); ig.addColorStop(0.7, '#c9c2b5'); ig.addColorStop(1, '#a99f8e');
    c.fillStyle = ig; c.fillRect(D.x, D.y, D.w, D.h);
    // a counter and someone who works there
    if (st.keeper) { box3d(c, D.x + D.w * 0.15, D.y + D.h * 0.55, D.w * 0.7, D.h * 0.18, 0, '#8a5e3c', 'wood', 3); drawPerson(c, D.x + D.w * 0.5, D.y + D.h * 0.6, 1.6, { skin: '#e0a878', hair: '#2a1c14', style: 'short', shirt: st.signBg, pants: '#24395e' }); box3d(c, D.x + D.w * 0.15, D.y + D.h * 0.58, D.w * 0.7, D.h * 0.16, 0, '#8a5e3c', 'wood', 3); }
    else {
      // shelves of books, rows of seats, or tables
      for (let k = 0; k < 3; k++) {
        const sx = D.x + 8 + k * (D.w / 3), sw2 = D.w / 3 - 14;
        box3d(c, sx, D.y + D.h * 0.25, sw2, D.h * 0.45, 0, '#6e4527', 'wood', k);
        for (let r2 = 0; r2 < 3; r2++) for (let bx = sx + 3; bx < sx + sw2 - 4; bx += 4.5) book(c, bx, D.y + D.h * 0.27 + r2 * D.h * 0.15, 4, D.h * 0.12, ['#9e2a2b', '#2b5f9e', '#2e7d4f', '#c9861a', '#6b3fa0'][Math.floor((bx + r2 * 7) % 5)]);
      }
    }
    const lg = c.createRadialGradient(D.x + D.w / 2, D.y, 5, D.x + D.w / 2, D.y + 40, D.w); lg.addColorStop(0, 'rgba(255,250,220,.5)'); lg.addColorStop(1, 'rgba(255,250,220,0)');
    c.fillStyle = lg; c.fillRect(D.x, D.y, D.w, D.h);
    c.fillStyle = `rgba(0,0,0,${0.35 * (1 - open)})`; c.fillRect(D.x, D.y, D.w, D.h);
    c.restore();
  }
  // ---- door frame ----
  const frame = st.facade === 'glass' || st.door === 'slide' ? '#7d8791' : st.facade === 'stone' ? '#ddd3bf' : st.facade === 'wood' ? '#5d4037' : '#f4f1ea';
  box3d(c, D.x - 12, D.y - 14, D.w + 24, 14, 0, frame, st.door === 'slide' ? 'metal' : 'solid');
  box3d(c, D.x - 12, D.y, 12, D.h, 0, frame, st.door === 'slide' ? 'metal' : 'solid');
  box3d(c, D.x + D.w, D.y, 12, D.h, 0, frame, st.door === 'slide' ? 'metal' : 'solid');
  if (!(st.door !== 'slide' && open > 0)) {}  // nothing
  // ---- doors ----
  const glassDoor = st.door === 'slide' || st.facade === 'glass' || st.facade === 'store';
  if (st.door === 'slide') {
    const half = D.w / 2, shift = half * 0.92 * open;
    [[D.x - shift, -1], [D.x + half + shift, 1]].forEach(([x]) => {
      c.save(); c.beginPath(); c.rect(D.x - 2, D.y, D.w + 4, D.h); c.clip();
      metal(c, x, D.y, half, D.h, 1, '#9aa3aa');
      c.fillStyle = openNow ? 'rgba(190,225,245,.55)' : 'rgba(40,55,70,.75)'; c.fillRect(x + 6, D.y + 6, half - 12, D.h - 12);
      glass(c, x + 6, D.y + 6, half - 12, D.h - 12, 'rgba(255,255,255,0)');
      c.restore();
    });
    if (open < 0.1) { c.fillStyle = '#ffffff'; rrect(c, D.x + D.w / 2 - 40, D.y + D.h * 0.55, 80, 16, 4); c.fill(); txt(c, 'AUTOMATIC DOOR', D.x + D.w / 2, D.y + D.h * 0.55 + 8.5, '#2b5f9e', 8, 800); }
  } else {
    const panels = st.door === 'double' ? [[D.x, D.w / 2, true], [D.x + D.w / 2, D.w / 2, false]] : [[D.x, D.w, true]];
    panels.forEach(([x0, w0, left]) => swingPanel(c, placeDoorFace(st, w0, D.h, left, glassDoor, openNow), x0, D.y, w0, D.h, left, open, st.doorCol));
  }
  // OPEN / CLOSED sign and hours
  if (open < 0.2) {
    const tx = st.door === 'slide' ? D.x + D.w / 2 : D.x + D.w / 2;
    c.strokeStyle = '#555'; c.lineWidth = 1; c.beginPath(); c.moveTo(tx - 16, D.y + 34); c.lineTo(tx, D.y + 24); c.lineTo(tx + 16, D.y + 34); c.stroke();
    c.fillStyle = openNow ? '#2e7d32' : '#c62828'; rrect(c, tx - 30, D.y + 34, 60, 22, 4); c.fill();
    c.strokeStyle = '#fff'; c.lineWidth = 1.5; rrect(c, tx - 27, D.y + 37, 54, 16, 3); c.stroke();
    txt(c, openNow ? 'OPEN' : 'CLOSED', tx, D.y + 45.5, '#fff', 11, 900);
  }
  c.fillStyle = '#f7f4ec'; rrect(c, D.x + D.w + 20, D.y + 60, 72, 44, 4); c.fill(); c.strokeStyle = 'rgba(0,0,0,.2)'; c.lineWidth = 1; c.stroke();
  const [ha, hb] = st.hours;
  txt(c, 'HOURS', D.x + D.w + 56, D.y + 71, '#555', 8, 900);
  txt(c, ha === 0 && hb === 24 ? 'Always open' : `${fmtTime(ha)}`, D.x + D.w + 56, D.y + 83, '#222', 9, 800);
  if (!(ha === 0 && hb === 24)) txt(c, `to ${fmtTime(hb % 24)}`, D.x + D.w + 56, D.y + 95, '#222', 9, 800);
  // mat
  c.fillStyle = '#5b5b5b'; c.beginPath(); c.moveTo(D.x - 4, GROUND + 4); c.lineTo(D.x + D.w + 4, GROUND + 4); c.lineTo(D.x + D.w + 14, GROUND + 20); c.lineTo(D.x - 14, GROUND + 20); c.fill();
  txt(c, 'WELCOME', D.x + D.w / 2, GROUND + 12.5, 'rgba(255,255,255,.55)', 10, 900);
  // you
  if (open < 0.95) drawPerson(c, D.x - 160, GROUND + 56, 2.4, S.look);
  // light & weather
  if (night) { c.fillStyle = 'rgba(12,18,45,.35)'; c.fillRect(0, 0, RW, RH); if (openNow) { c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(RW / 2, D.y + D.h, 10, RW / 2, D.y + D.h, 260); g.addColorStop(0, 'rgba(255,220,150,.25)'); g.addColorStop(1, 'rgba(255,220,150,0)'); c.fillStyle = g; c.fillRect(0, 0, RW, RH); c.restore(); } }
  else if (rainy) { c.fillStyle = 'rgba(60,70,90,.15)'; c.fillRect(0, 0, RW, RH); c.strokeStyle = 'rgba(220,230,255,.5)'; c.lineWidth = 1.2; c.beginPath(); for (let i = 0; i < 120; i++) { const x = (i * 83) % RW, y = (i * 53 + performance.now() * 0.3) % RH; c.moveTo(x, y); c.lineTo(x - 3, y + 10); } c.stroke(); }
  const vg = c.createRadialGradient(RW / 2, RH / 2, RH * 0.4, RW / 2, RH / 2, RW * 0.62);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.22)');
  c.fillStyle = vg; c.fillRect(0, 0, RW, RH);
}

// things you can see through the shop window
function shopWindowStuff(c, pid, x, y, w, h, side) {
  const r = seeded(pid.length * 31 + side);
  const shelf = (yy) => box3d(c, x + 8, yy, w - 16, 5, 0.02, '#b08a5a', 'wood', 2);
  if (['market', 'mall', 'diner', 'icecream', 'bakery', 'generalstore', 'gearshop', 'fishmarket', 'pottery', 'cocoa', 'pancake'].includes(pid)) {
    for (let s = 0; s < 3; s++) {
      const yy = y + 36 + s * 40;
      shelf(yy);
      for (let k = 0; k < 9; k++) {
        const col = ['#e53935', '#fb8c00', '#fdd835', '#43a047', '#1e88e5', '#8e24aa', '#f06292', '#8d6e63'][Math.floor(r() * 8)];
        const bx = x + 14 + k * ((w - 28) / 9), bh = 10 + r() * 16;
        if (r() < 0.5) box3d(c, bx, yy - bh, (w - 28) / 9 - 4, bh, 0.01, col, 'solid'); else { const g = c.createRadialGradient(bx + 5, yy - 9, 1, bx + 7, yy - 7, 8); g.addColorStop(0, tone(col, 0.4)); g.addColorStop(1, col); c.fillStyle = g; c.beginPath(); c.arc(bx + 8, yy - 7, 7, 0, Math.PI * 2); c.fill(); }
      }
    }
  } else if (['library', 'school'].includes(pid)) {
    for (let s = 0; s < 3; s++) { const yy = y + 40 + s * 40; shelf(yy); for (let bx = x + 12; bx < x + w - 14; bx += 6) book(c, bx, yy - 22 - r() * 8, 5, 22 + r() * 8 - 0.1, ['#9e2a2b', '#2b5f9e', '#2e7d4f', '#c9861a', '#6b3fa0'][Math.floor(r() * 5)]); }
  } else {
    // people inside
    for (let k = 0; k < 2; k++) drawPerson(c, x + 50 + k * 110 + r() * 20, y + h - 6, 1.6, randomLook(r));
    box3d(c, x + 20, y + h - 40, w - 40, 12, 0.03, '#8a5e3c', 'wood', 4);
  }
}

// a hinged door that swings toward you
function swingPanel(c, face, x0, y0, w0, h, hingeLeft, open, col) {
  const R = 2, ang = open * Math.PI * 0.46;
  const ww = w0 * Math.cos(ang), grow = h * 0.08 * Math.sin(ang);
  const hx = hingeLeft ? x0 : x0 + w0, N = 28;
  for (let i = 0; i < N; i++) {
    const u0 = i / N, u1 = (i + 1) / N, um = (u0 + u1) / 2;
    const srcX = hingeLeft ? u0 * w0 : w0 - u1 * w0;
    const dx = hingeLeft ? hx + u0 * ww : hx - u1 * ww;
    c.drawImage(face, srcX * R, 0, (w0 / N) * R, h * R, dx, y0 - grow * um, ww / N + 0.6, h + grow * um * 2);
  }
  if (open > 0) {
    const fx = hingeLeft ? hx + ww : hx - ww;
    c.fillStyle = `rgba(0,0,0,${0.28 * open})`;
    c.beginPath(); c.moveTo(hx, y0); c.lineTo(fx, y0 - grow); c.lineTo(fx, y0 + h + grow); c.lineTo(hx, y0 + h); c.closePath(); c.fill();
    c.fillStyle = tone(col, -0.5); const t = 7 * Math.sin(ang); c.fillRect(hingeLeft ? fx : fx - t, y0 - grow, t, h + grow * 2);
  }
}
function placeDoorFace(st, w0, h, hingeLeft, glassy, openNow) {
  const R = 2, cv = document.createElement('canvas');
  cv.width = Math.ceil(w0 * R); cv.height = Math.ceil(h * R);
  const c = cv.getContext('2d'); c.scale(R, R); c.lineCap = 'round';
  if (glassy) {
    box3d(c, 0, 0, w0, h, 0, st.doorCol, 'solid');
    c.fillStyle = openNow ? 'rgba(190,225,245,.85)' : 'rgba(40,55,70,.85)'; c.fillRect(9, 9, w0 - 18, h - 18);
    glass(c, 9, 9, w0 - 18, h - 18, 'rgba(255,255,255,0)');
    metal(c, hingeLeft ? w0 - 30 : 8, h * 0.52, 22, 5, 2, '#c0c6cb');     // push bar
  } else {
    box3d(c, 0, 0, w0, h, 0, st.doorCol, 'wood', 5);
    const pw = w0 - 20;
    bevel(c, 10, 12, pw, h * 0.38, st.doorCol); bevel(c, 10, h * 0.45, pw, h * 0.48, st.doorCol);
    const kx = hingeLeft ? w0 - 14 : 14;
    metal(c, kx - 3, h * 0.5 - 14, 6, 26, 2, '#c9a54a'); knob(c, kx, h * 0.5 + 4, 5, '#d4af37');
  }
  return cv;
}

let placeDoorAnim = null;
function openPlaceDoor(pid) {
  if (placeDoorAnim) return;
  if (!isOpenNow(pid)) { nope(`🔒 It's closed right now. ${hoursText(pid)}.`); return; }
  const cv = $('#entcv');
  const t0 = performance.now();
  placeDoorAnim = {};
  const step = now => {
    const k = Math.min(1, (now - t0) / (ENTRANCE[pid].door === 'slide' ? 600 : 850));
    const ease = 1 - Math.pow(1 - k, 3);
    if ($('#entcv')) drawEntrance($('#entcv'), pid, ease);
    if (k < 1) requestAnimationFrame(step);
    else { placeDoorAnim = null; S.insideOf = pid; log(ENTRANCE[pid].door === 'slide' ? `🚪 The automatic doors slid open. You walked into the ${PLACES[pid].name}.` : `🚪 You opened the door and went into the ${PLACES[pid].name}.`); save(); render(); }
  };
  if (!cv) { placeDoorAnim = null; S.insideOf = pid; render(); return; }
  requestAnimationFrame(step);
}
function entranceSection(pid) {
  const openNow = isOpenNow(pid);
  return `<div class="roomwrap"><canvas id="entcv" data-pid="${pid}" aria-label="The front of the ${esc(PLACES[pid].name)}"></canvas></div>
    <div class="doorbar">
      <div><b>${PLACES[pid].icon} ${esc(PLACES[pid].name)}</b> <span class="chip ${openNow ? 'good' : 'warn'}">${openNow ? 'OPEN' : 'CLOSED'}</span>
        <div class="muted small">${hoursText(pid)}. You're outside. ${openNow ? 'Open the door to go in.' : 'Come back when it\'s open.'}</div></div>
      <button class="btn primary big-door" ${openNow ? '' : 'disabled'} onclick="openPlaceDoor('${pid}')">${openNow ? '🚪 Open the door' : '🔒 Closed'}</button>
    </div>`;
}
