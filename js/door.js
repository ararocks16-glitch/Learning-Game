// ===================== YOUR FRONT DOOR =====================
// When you come home you're outside. Open the door to go in and see your home.

const DOOR_STYLE = {
  parents: { kind: 'house', wall: '#f7d794', door: '#b03a2e', num: '12' },
  small:   { kind: 'house', wall: '#a7d8f0', door: '#2c5f8a', num: '18' },
  family:  { kind: 'house', wall: '#fff3d6', door: '#2e6b4a', num: '27' },
  shared:  { kind: 'apt', wall: '#e9dfcc', door: '#6d4c41', num: '2A' },
  studio:  { kind: 'apt', wall: '#e9dfcc', door: '#3f5f7a', num: '3C' },
  onebed:  { kind: 'apt', wall: '#e9dfcc', door: '#5b4a8a', num: '5B' },
  mansion: { kind: 'grand', wall: '#efe6d4', door: '#4a2c16', num: '1' },
};
let doorAnim = null;     // { t } while the door is swinging open
let roomPeek = null;     // a picture of the inside, seen through the doorway

function drawDoorView(cv, open = 0) {
  const cssW = cv.parentElement.clientWidth;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  cv.style.height = (cssW * RH / RW) + 'px';
  if (cv.width !== Math.round(cssW * dpr)) { cv.width = Math.round(cssW * dpr); cv.height = Math.round(cssW * dpr * RH / RW); }
  const c = cv.getContext('2d');
  c.setTransform(cv.width / RW, 0, 0, cv.width / RW, 0, 0);
  const st = DOOR_STYLE[S.home] || DOOR_STYLE.parents;
  const night = S.hour < 6 || S.hour >= 20;
  const rainy = S.weather === 'rainy';
  const D = st.kind === 'grand' ? { x: 420, y: 70, w: 160, h: 236 } : { x: 448, y: 92, w: 104, h: 214 };
  const GROUND = 306;

  // ---- the wall around the door ----
  if (st.kind === 'apt') {
    // apartment hallway
    const g = c.createLinearGradient(0, 0, 0, GROUND); g.addColorStop(0, tone(st.wall, -0.12)); g.addColorStop(1, st.wall);
    c.fillStyle = g; c.fillRect(0, 0, RW, GROUND);
    for (let i = 0; i < 2200; i++) { c.fillStyle = i % 2 ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.03)'; c.fillRect((i * 97.31) % RW, (i * 41.7) % GROUND, 1.5, 1.5); }
    wood(c, 0, 200, RW, 106, '#8a6a4a', 0, 4);                                    // wainscoting
    for (let x = 30; x < RW; x += 120) bevel(c, x, 214, 90, 78, '#8a6a4a');
    c.fillStyle = '#f2ede2'; c.fillRect(0, 196, RW, 6);
    // carpet
    const cg = c.createLinearGradient(0, GROUND, 0, RH); cg.addColorStop(0, '#6b2f3a'); cg.addColorStop(1, '#8e4250');
    c.fillStyle = cg; c.fillRect(0, GROUND, RW, RH - GROUND);
    c.strokeStyle = 'rgba(230,190,120,.35)'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, GROUND + 22); c.lineTo(RW, GROUND + 22); c.stroke();
    // wall lights
    [[300, 120], [700, 120]].forEach(([lx, ly]) => {
      const lg = c.createRadialGradient(lx, ly, 2, lx, ly + 10, 120); lg.addColorStop(0, 'rgba(255,225,160,.55)'); lg.addColorStop(1, 'rgba(255,225,160,0)');
      c.fillStyle = lg; c.fillRect(lx - 130, ly - 80, 260, 240);
      metal(c, lx - 4, ly - 2, 8, 12, 2, '#c9a54a');
      c.fillStyle = '#fff4d6'; c.beginPath(); c.moveTo(lx - 12, ly - 22); c.lineTo(lx + 12, ly - 22); c.lineTo(lx + 8, ly); c.lineTo(lx - 8, ly); c.fill();
    });
    // the neighbor's door at the edge
    box3d(c, 70, 110, 90, 196, 0, '#7d6450', 'wood', 9); bevel(c, 80, 124, 70, 70, '#7d6450'); bevel(c, 80, 204, 70, 90, '#7d6450');
    knob(c, 146, 212, 4, '#c9a54a');
    c.fillStyle = '#f5f0e6'; rrect(c, 96, 86, 38, 16, 3); c.fill(); txt(c, ({ '2A': '2B', '3C': '3D', '5B': '5C' })[st.num] || '4', 115, 94.5, '#5d4037', 10, 800);
  } else {
    // outside: sky, siding, roof edge
    const sky = c.createLinearGradient(0, 0, 0, 120);
    if (night) { sky.addColorStop(0, '#0b1633'); sky.addColorStop(1, '#22365f'); } else if (rainy) { sky.addColorStop(0, '#7d8a9b'); sky.addColorStop(1, '#aeb8c4'); } else { sky.addColorStop(0, '#5aa9e6'); sky.addColorStop(1, '#cfe8fa'); }
    c.fillStyle = sky; c.fillRect(0, 0, RW, 60);
    if (st.kind === 'grand') {
      c.fillStyle = st.wall; c.fillRect(0, 30, RW, GROUND - 30);
      c.strokeStyle = 'rgba(120,100,70,.22)'; c.lineWidth = 1;
      for (let y = 30; y < GROUND; y += 24) { c.beginPath(); c.moveTo(0, y); c.lineTo(RW, y); c.stroke(); for (let x = ((y / 24) % 2) * 40; x < RW; x += 80) { c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 24); c.stroke(); } }
      [300, 360, 640, 700].forEach(x => { const g = c.createLinearGradient(x - 14, 0, x + 14, 0); g.addColorStop(0, '#d8cfbd'); g.addColorStop(0.35, '#fffaf0'); g.addColorStop(1, '#bfb5a2'); c.fillStyle = g; c.fillRect(x - 14, 40, 28, GROUND - 40); c.fillStyle = '#e8dfcc'; c.fillRect(x - 20, 36, 40, 10); c.fillRect(x - 20, GROUND - 14, 40, 14); });
      c.fillStyle = '#e6dcc6'; c.beginPath(); c.moveTo(260, 40); c.lineTo(500, 0); c.lineTo(740, 40); c.closePath(); c.fill();
    } else {
      c.fillStyle = st.wall; c.fillRect(0, 50, RW, GROUND - 50);
      for (let y = 50; y < GROUND; y += 13) { c.fillStyle = 'rgba(0,0,0,.09)'; c.fillRect(0, y + 11, RW, 2); c.fillStyle = 'rgba(255,255,255,.18)'; c.fillRect(0, y, RW, 1.5); }
      // roof edge
      c.fillStyle = '#5b4636'; c.fillRect(0, 34, RW, 20); c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(0, 54, RW, 8);
      for (let x = 0; x < RW; x += 26) { c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(x, 34, 2, 20); }
    }
    // windows with shutters and flower boxes
    [[150, 100], [740, 100]].forEach(([wx, wy]) => {
      if (st.kind === 'grand' && (wx < 300 || wx > 680)) { wx = wx < 300 ? 110 : 790; }
      c.fillStyle = '#fff'; c.fillRect(wx - 6, wy - 6, 132, 112);
      const g = c.createLinearGradient(0, wy, 0, wy + 100);
      if (night) { g.addColorStop(0, '#ffd77a'); g.addColorStop(1, '#f0a94a'); } else { g.addColorStop(0, '#bfe3f5'); g.addColorStop(1, '#8fc2e0'); }
      c.fillStyle = g; c.fillRect(wx, wy, 120, 100);
      glass(c, wx, wy, 120, 100, 'rgba(255,255,255,0)');
      c.fillStyle = '#fff'; c.fillRect(wx + 57, wy, 6, 100); c.fillRect(wx, wy + 47, 120, 6);
      [[wx - 34, 1], [wx + 126, 2]].forEach(([sx, n]) => { box3d(c, sx, wy - 6, 28, 112, 0, st.door, 'solid'); for (let k = 0; k < 9; k++) { c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(sx + 3, wy + k * 12, 22, 2); } });
      box3d(c, wx - 8, wy + 108, 136, 16, 0.02, '#8b5a33', 'wood', 3);
      for (let k = 0; k < 9; k++) { c.fillStyle = '#3e8e41'; c.beginPath(); c.arc(wx + 2 + k * 15, wy + 106, 7, 0, Math.PI * 2); c.fill(); c.fillStyle = ['#ff6b8a', '#ffd23f', '#ffffff', '#b57cff'][k % 4]; c.beginPath(); c.arc(wx + 4 + k * 15, wy + 102, 3.2, 0, Math.PI * 2); c.fill(); }
    });
    // porch floor and steps
    wood(c, 0, GROUND, RW, 22, '#9c7a54', 0, 6);
    for (let k = 0; k < 2; k++) box3d(c, D.x - 70 - k * 20, GROUND + 22 + k * 16, D.w + 140 + k * 40, 16, 0, '#b9b2a6', 'solid');
    const gg = c.createLinearGradient(0, GROUND + 54, 0, RH); gg.addColorStop(0, '#6fae5a'); gg.addColorStop(1, '#5c9a4a');
    c.fillStyle = gg; c.fillRect(0, GROUND + 22, D.x - 90, RH); c.fillRect(D.x + D.w + 90, GROUND + 22, RW, RH);
    c.fillStyle = gg; c.fillRect(0, GROUND + 54, RW, RH);
    c.fillStyle = '#cfc6b4'; c.beginPath(); c.moveTo(D.x - 40, RH); c.lineTo(D.x - 10, GROUND + 54); c.lineTo(D.x + D.w + 10, GROUND + 54); c.lineTo(D.x + D.w + 40, RH); c.fill();
    // potted plants and a mailbox
    [[D.x - 74, GROUND], [D.x + D.w + 44, GROUND]].forEach(([px, py]) => {
      const pg = c.createLinearGradient(px, 0, px + 30, 0); pg.addColorStop(0, '#d9824b'); pg.addColorStop(1, '#8e4521');
      c.fillStyle = pg; c.beginPath(); c.moveTo(px, py - 30); c.lineTo(px + 30, py - 30); c.lineTo(px + 26, py); c.lineTo(px + 4, py); c.fill();
      [[-8, 20], [0, 26], [8, 20]].forEach(([dx, r]) => { const g = c.createRadialGradient(px + 15 + dx - 4, py - 46 - 4, 2, px + 15 + dx, py - 46, r); g.addColorStop(0, '#6fbf5a'); g.addColorStop(1, '#2f7d32'); c.fillStyle = g; c.beginPath(); c.arc(px + 15 + dx, py - 46 + (r < 22 ? 6 : 0), r * 0.7, 0, Math.PI * 2); c.fill(); });
    });
    if (st.kind === 'house') { metal(c, 872, 210, 4, 96, 1, '#555'); box3d(c, 852, 190, 44, 24, 0.02, '#2f6fd6', 'solid'); c.fillStyle = '#e53935'; c.fillRect(896, 176, 3, 20); c.fillRect(896, 176, 10, 6); }
  }

  // ---- the doorway: what you see inside once the door opens ----
  if (open > 0) {
    c.save(); c.beginPath(); c.rect(D.x, D.y, D.w, D.h); c.clip();
    if (roomPeek) {
      // a slice of your room, as seen through the door
      const sh = D.h + 12, sw = sh * 0.75;
      c.drawImage(roomPeek, 330, 60, 240, 320, D.x + D.w / 2 - sw / 2, D.y - 6, sw, sh);
    } else { c.fillStyle = '#e9d8b8'; c.fillRect(D.x, D.y, D.w, D.h); }
    c.fillStyle = `rgba(0,0,0,${0.35 * (1 - open)})`; c.fillRect(D.x, D.y, D.w, D.h);
    c.restore();
  }

  // ---- door frame ----
  const trim = st.kind === 'apt' ? '#f2ede2' : '#fbfaf6';
  box3d(c, D.x - 14, D.y - 16, D.w + 28, 16, 0, trim, 'solid');
  box3d(c, D.x - 14, D.y, 14, D.h, 0, trim, 'solid'); box3d(c, D.x + D.w, D.y, 14, D.h, 0, trim, 'solid');
  if (st.kind === 'grand') { c.fillStyle = trim; c.beginPath(); c.arc(D.x + D.w / 2, D.y - 16, D.w / 2 + 14, Math.PI, 0); c.fill(); const fg = c.createLinearGradient(0, D.y - 90, 0, D.y - 16); fg.addColorStop(0, night ? '#ffd77a' : '#bfe3f5'); fg.addColorStop(1, night ? '#e9a54a' : '#8fc2e0'); c.fillStyle = fg; c.beginPath(); c.arc(D.x + D.w / 2, D.y - 16, D.w / 2, Math.PI, 0); c.fill(); for (let k = 1; k < 6; k++) { c.strokeStyle = trim; c.lineWidth = 3; c.beginPath(); c.moveTo(D.x + D.w / 2, D.y - 16); c.lineTo(D.x + D.w / 2 + Math.cos(Math.PI + k * Math.PI / 6) * D.w / 2, D.y - 16 + Math.sin(Math.PI + k * Math.PI / 6) * D.w / 2); c.stroke(); } }
  // house number
  c.fillStyle = st.kind === 'apt' ? '#c9a54a' : '#2b2b2b';
  if (st.kind === 'apt') { rrect(c, D.x + D.w / 2 - 20, D.y - 46, 40, 22, 4); c.fill(); txt(c, st.num, D.x + D.w / 2, D.y - 34.5, '#3a2a10', 13, 900); }
  else { txt(c, st.num, D.x + D.w + 44, D.y + 40, '#2b2b2b', 22, 900); }
  // doormat
  c.fillStyle = '#8a6a3c'; c.beginPath(); c.moveTo(D.x - 6, GROUND + 4); c.lineTo(D.x + D.w + 6, GROUND + 4); c.lineTo(D.x + D.w + 16, GROUND + 20); c.lineTo(D.x - 16, GROUND + 20); c.fill();
  txt(c, 'WELCOME', D.x + D.w / 2, GROUND + 12.5, 'rgba(50,30,10,.75)', 10, 900);

  // ---- the door itself (swings open toward you on its hinge) ----
  const drawDoorPanel = (x0, w0, hingeLeft) => {
    const face = doorFace(st, w0, D.h, hingeLeft, night);
    const R = 2;
    const ang = open * Math.PI * 0.46;
    const ww = w0 * Math.cos(ang), grow = D.h * 0.08 * Math.sin(ang);
    const hx = hingeLeft ? x0 : x0 + w0;
    const N = 28;
    for (let i = 0; i < N; i++) {
      const u0 = i / N, u1 = (i + 1) / N, um = (u0 + u1) / 2;
      const srcX = hingeLeft ? u0 * w0 : w0 - u1 * w0;
      const dx = hingeLeft ? hx + u0 * ww : hx - u1 * ww;
      c.drawImage(face, srcX * R, 0, (w0 / N) * R, D.h * R, dx, D.y - grow * um, ww / N + 0.6, D.h + grow * um * 2);
    }
    if (open > 0) {   // darker as it turns away from the light, and show its thickness
      const fx = hingeLeft ? hx + ww : hx - ww;
      c.fillStyle = `rgba(0,0,0,${0.28 * open})`;
      c.beginPath(); c.moveTo(hx, D.y); c.lineTo(fx, D.y - grow); c.lineTo(fx, D.y + D.h + grow); c.lineTo(hx, D.y + D.h); c.closePath(); c.fill();
      c.fillStyle = tone(st.door, -0.5);
      const t = 7 * Math.sin(ang);
      c.fillRect(hingeLeft ? fx : fx - t, D.y - grow, t, D.h + grow * 2);
    }
  };
  if (st.kind === 'grand') { drawDoorPanel(D.x, D.w / 2, true); drawDoorPanel(D.x + D.w / 2, D.w / 2, false); }
  else drawDoorPanel(D.x, D.w, true);

  // porch light
  if (st.kind !== 'apt') {
    const lx = D.x - 46, ly = D.y + 40;
    if (night) { const g = c.createRadialGradient(lx, ly, 3, lx, ly + 30, 170); g.addColorStop(0, 'rgba(255,215,140,.6)'); g.addColorStop(1, 'rgba(255,215,140,0)'); c.fillStyle = g; c.fillRect(lx - 180, ly - 120, 360, 340); }
    metal(c, lx - 3, ly - 22, 6, 10, 2, '#333');
    c.fillStyle = night ? '#ffe9a8' : '#e9e2c8'; rrect(c, lx - 9, ly - 14, 18, 26, 3); c.fill();
    c.strokeStyle = '#333'; c.lineWidth = 2; c.strokeRect(lx - 9, ly - 14, 18, 26); c.beginPath(); c.moveTo(lx, ly - 14); c.lineTo(lx, ly + 12); c.stroke();
  }
  // you, standing on the porch
  if (open < 0.95) drawPerson(c, D.x - 150, GROUND + 50, 2.4, S.look);
  // light & mood
  if (night) { c.fillStyle = st.kind === 'apt' ? 'rgba(20,25,50,.12)' : 'rgba(12,18,45,.38)'; c.fillRect(0, 0, RW, RH); }
  else if (rainy && st.kind !== 'apt') {
    c.fillStyle = 'rgba(60,70,90,.15)'; c.fillRect(0, 0, RW, RH);
    c.strokeStyle = 'rgba(220,230,255,.5)'; c.lineWidth = 1.2; c.beginPath();
    for (let i = 0; i < 120; i++) { const x = (i * 83) % RW, y = (i * 53 + performance.now() * 0.3) % RH; c.moveTo(x, y); c.lineTo(x - 3, y + 10); }
    c.stroke();
  }
  const vg = c.createRadialGradient(RW / 2, RH / 2, RH * 0.4, RW / 2, RH / 2, RW * 0.62);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.22)');
  c.fillStyle = vg; c.fillRect(0, 0, RW, RH);
}

// the front of the door, drawn once so it can be turned when it opens
function doorFace(st, w0, h, hingeLeft, night) {
  const R = 2;
  const cv = document.createElement('canvas');
  cv.width = Math.ceil(w0 * R); cv.height = Math.ceil(h * R);
  const c = cv.getContext('2d');
  c.scale(R, R);
  c.lineCap = 'round';
  box3d(c, 0, 0, w0, h, 0, st.door, 'solid');
  const pw = (w0 - 30) / 2;
  if (st.kind === 'apt') {
    bevel(c, 12, 18, w0 - 24, 80, st.door); bevel(c, 12, 110, w0 - 24, 90, st.door);
    c.fillStyle = '#c9a54a'; c.beginPath(); c.arc(w0 / 2, 60, 3.2, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#111'; c.beginPath(); c.arc(w0 / 2, 60, 1.4, 0, Math.PI * 2); c.fill();
  } else {
    const wg = c.createLinearGradient(0, 14, 0, 50); wg.addColorStop(0, night ? '#ffe39a' : '#d6eefa'); wg.addColorStop(1, night ? '#f0b35a' : '#9ccbe6');
    c.fillStyle = wg; rrect(c, 14, 14, w0 - 28, 36, 4); c.fill(); glass(c, 14, 14, w0 - 28, 36, 'rgba(255,255,255,0)');
    c.strokeStyle = tone(st.door, -0.3); c.lineWidth = 2; c.strokeRect(14, 14, w0 - 28, 36);
    c.beginPath(); c.moveTo(w0 / 2, 14); c.lineTo(w0 / 2, 50); c.stroke();
    for (let r = 0; r < 2; r++) for (let k = 0; k < 2; k++) bevel(c, 10 + k * (pw + 10), 62 + r * 72, pw, 62, st.door);
    if (st.kind === 'grand') { c.strokeStyle = '#d4af37'; c.lineWidth = 3; c.beginPath(); c.arc(w0 / 2, 108, 9, 0, Math.PI * 2); c.stroke(); knob(c, w0 / 2, 98, 4, '#d4af37'); }
  }
  const kx = hingeLeft ? w0 - 16 : 16;
  metal(c, kx - 3, h * 0.5 - 16, 6, 30, 2, '#c9a54a');
  knob(c, kx, h * 0.5 + 4, 5.5, '#d4af37');
  c.fillStyle = '#3a2a10'; c.beginPath(); c.arc(kx, h * 0.5 - 8, 1.8, 0, Math.PI * 2); c.fill();
  return cv;
}

function openDoor() {
  if (doorAnim) return;
  const cv = $('#doorcv');
  if (!cv) { S.doorOpen = true; render(); return; }
  // take a picture of the inside to show through the doorway
  roomPeek = document.createElement('canvas');
  roomPeek.width = RW; roomPeek.height = RH;
  drawRoom(roomPeek, RW);
  const t0 = performance.now();
  doorAnim = {};
  const step = now => {
    const k = Math.min(1, (now - t0) / 900);
    const ease = 1 - Math.pow(1 - k, 3);
    if ($('#doorcv')) drawDoorView($('#doorcv'), ease);
    if (k < 1) requestAnimationFrame(step);
    else { doorAnim = null; S.doorOpen = true; log(`🚪 You opened the door and went inside.`); save(); render(); }
  };
  requestAnimationFrame(step);
}
function doorSection() {
  const st = DOOR_STYLE[S.home] || DOOR_STYLE.parents;
  return `<div class="roomwrap"><canvas id="doorcv" aria-label="Your front door"></canvas></div>
    <div class="doorbar">
      <div><b>${st.kind === 'apt' ? `🚪 Apartment ${st.num}` : `🏠 ${home().name}, number ${st.num}`}</b><div class="muted small">You're outside your front door. Open it to go inside.</div></div>
      <button class="btn primary big-door" onclick="openDoor()">🚪 Open the door</button>
    </div>`;
}
