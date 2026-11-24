// ===================== PEOPLE =====================
// Draws people (the player and townspeople) instead of using emojis.

const LOOKS = {
  skin:  ['#fde0c8', '#f3c9a0', '#e0a878', '#c4885a', '#9a6440', '#6b4129'],
  hair:  ['#2a1c14', '#4e3020', '#8a5230', '#c98b3c', '#e8c870', '#b8b2aa', '#a8332a', '#141414'],
  style: ['short', 'long', 'curly', 'bun', 'ponytail', 'buzz', 'spiky', 'braids'],
  shirt: ['#2f80ed', '#e53935', '#2e9d58', '#f2b705', '#8e44ad', '#f07d1a', '#f5f5f5', '#36454f', '#e86aa6', '#1abc9c'],
  pants: ['#24395e', '#3d4650', '#6b4a35', '#1e1e1e', '#7a8794', '#4a6b3a'],
};
const STYLE_NAMES = { short: 'Short', long: 'Long', curly: 'Curly', bun: 'Bun', ponytail: 'Ponytail', buzz: 'Buzz cut', spiky: 'Spiky', braids: 'Braids' };

function randomLook(r = Math.random) {
  const pick = a => a[Math.floor(r() * a.length)];
  return { skin: pick(LOOKS.skin), hair: pick(LOOKS.hair), style: pick(LOOKS.style), shirt: pick(LOOKS.shirt), pants: pick(LOOKS.pants) };
}

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const f = v => Math.max(0, Math.min(255, Math.round(v + amt * 255)));
  return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`;
}

// (x, y) is where the feet touch the ground. s = size (1 = about 38px tall).
function drawPerson(c, x, y, s, look, phase = 0, moving = false) {
  const sw = moving ? Math.sin(phase) * 3 * s : 0;
  const bounce = moving ? Math.abs(Math.cos(phase)) * 1.2 * s : 0;
  y -= bounce;
  c.save();
  c.lineCap = 'round'; c.lineJoin = 'round';
  // shadow
  c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(x + 1.5 * s, y + bounce + 0.5 * s, 8 * s, 2.6 * s, 0, 0, Math.PI * 2); c.fill();
  // long hair / braids behind the body
  const hy = y - 31 * s;
  if (look.style === 'long') { c.fillStyle = shade(look.hair, -0.05); rrPath(c, x - 7.5 * s, hy - 4 * s, 15 * s, 17 * s, 5 * s); c.fill(); }
  if (look.style === 'braids') { c.strokeStyle = look.hair; c.lineWidth = 2.6 * s; [-1, 1].forEach(d => { c.beginPath(); c.moveTo(x + d * 6 * s, hy); c.lineTo(x + d * 6.5 * s, y - 17 * s); c.stroke(); }); }
  // legs
  c.lineWidth = 3.6 * s;
  c.strokeStyle = shade(look.pants, -0.06);
  c.beginPath(); c.moveTo(x - 2.2 * s, y - 13 * s); c.lineTo(x - 2.2 * s - sw, y - 2.5 * s); c.stroke();
  c.strokeStyle = look.pants;
  c.beginPath(); c.moveTo(x + 2.2 * s, y - 13 * s); c.lineTo(x + 2.2 * s + sw, y - 2.5 * s); c.stroke();
  // shoes
  [[x - 2.4 * s - sw, -1], [x + 2.4 * s + sw, 1]].forEach(([fx, d]) => {
    c.fillStyle = '#2b2b2b'; c.beginPath(); c.ellipse(fx + d * 0.4 * s, y - 1.6 * s, 2.6 * s, 1.5 * s, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#f2f2f2'; c.fillRect(fx - 2.4 * s + d * 0.4 * s, y - 0.9 * s, 4.8 * s, 0.6 * s);
    c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.ellipse(fx + d * 0.4 * s - 0.8 * s, y - 2.3 * s, 0.9 * s, 0.4 * s, 0, 0, Math.PI * 2); c.fill();
  });
  // pant leg crease
  c.strokeStyle = 'rgba(255,255,255,.12)'; c.lineWidth = 0.5 * s;
  c.beginPath(); c.moveTo(x - 2.2 * s, y - 12 * s); c.lineTo(x - 2.2 * s - sw, y - 3.5 * s); c.moveTo(x + 2.2 * s, y - 12 * s); c.lineTo(x + 2.2 * s + sw, y - 3.5 * s); c.stroke();
  // arms (behind)
  c.lineWidth = 3 * s;
  c.strokeStyle = shade(look.shirt, -0.12);
  c.beginPath(); c.moveTo(x - 5.5 * s, y - 23.5 * s); c.lineTo(x - 7 * s + sw * 0.8, y - 15 * s); c.stroke();
  c.beginPath(); c.moveTo(x + 5.5 * s, y - 23.5 * s); c.lineTo(x + 7 * s - sw * 0.8, y - 15 * s); c.stroke();
  c.fillStyle = look.skin;
  c.beginPath(); c.arc(x - 7 * s + sw * 0.8, y - 14 * s, 1.7 * s, 0, Math.PI * 2); c.fill();
  c.beginPath(); c.arc(x + 7 * s - sw * 0.8, y - 14 * s, 1.7 * s, 0, Math.PI * 2); c.fill();
  // body
  const g = c.createLinearGradient(x - 6 * s, 0, x + 6 * s, 0);
  g.addColorStop(0, shade(look.shirt, 0.08)); g.addColorStop(1, shade(look.shirt, -0.12));
  c.fillStyle = g; rrPath(c, x - 6 * s, y - 26 * s, 12 * s, 14 * s, 3.5 * s); c.fill();
  c.strokeStyle = shade(look.shirt, -0.2); c.lineWidth = 0.5 * s;
  c.beginPath(); c.moveTo(x - 3 * s, y - 20 * s); c.quadraticCurveTo(x - 1 * s, y - 17 * s, x - 3.5 * s, y - 14.5 * s);
  c.moveTo(x + 3.5 * s, y - 21 * s); c.quadraticCurveTo(x + 2 * s, y - 18 * s, x + 3.8 * s, y - 15 * s); c.stroke();
  c.fillStyle = shade(look.shirt, 0.15);
  c.beginPath(); c.moveTo(x - 3.2 * s, y - 26 * s); c.lineTo(x, y - 23 * s); c.lineTo(x - 1 * s, y - 26.2 * s); c.fill();
  c.beginPath(); c.moveTo(x + 3.2 * s, y - 26 * s); c.lineTo(x, y - 23 * s); c.lineTo(x + 1 * s, y - 26.2 * s); c.fill();
  c.fillStyle = '#3a2a1e'; c.fillRect(x - 6 * s, y - 14 * s, 12 * s, 1.8 * s);
  c.fillStyle = '#c9a54a'; c.fillRect(x - 1.1 * s, y - 14.2 * s, 2.2 * s, 2.2 * s);
  c.fillStyle = shade(look.shirt, -0.3); c.fillRect(x - 0.5 * s, y - 13.6 * s, 1 * s, 1 * s);
  // neck + head
  c.fillStyle = shade(look.skin, -0.08); c.fillRect(x - 1.6 * s, y - 27.5 * s, 3.2 * s, 2.5 * s);
  const hg = c.createRadialGradient(x - 2 * s, hy - 2 * s, 1 * s, x, hy, 7.5 * s);
  hg.addColorStop(0, shade(look.skin, 0.06)); hg.addColorStop(1, shade(look.skin, -0.08));
  c.fillStyle = hg; c.beginPath(); c.arc(x, hy, 6.5 * s, 0, Math.PI * 2); c.fill();
  // ears
  c.fillStyle = shade(look.skin, -0.05);
  c.beginPath(); c.arc(x - 6.4 * s, hy + 0.5 * s, 1.4 * s, 0, Math.PI * 2); c.arc(x + 6.4 * s, hy + 0.5 * s, 1.4 * s, 0, Math.PI * 2); c.fill();
  // face
  [-1, 1].forEach(d => {
    const ex = x + d * 2.3 * s, ey = hy + 0.5 * s;
    c.fillStyle = '#ffffff'; c.beginPath(); c.ellipse(ex, ey, 1.35 * s, 1 * s, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#4a3222'; c.beginPath(); c.arc(ex, ey + 0.1 * s, 0.75 * s, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#111'; c.beginPath(); c.arc(ex, ey + 0.1 * s, 0.4 * s, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#fff'; c.beginPath(); c.arc(ex - 0.3 * s, ey - 0.25 * s, 0.22 * s, 0, Math.PI * 2); c.fill();
    c.strokeStyle = shade(look.hair, -0.1); c.lineWidth = 0.55 * s;
    c.beginPath(); c.moveTo(ex - d * 1.4 * s, ey - 1.9 * s); c.quadraticCurveTo(ex, ey - 2.5 * s, ex + d * 1.3 * s, ey - 2 * s); c.stroke();
  });
  c.strokeStyle = shade(look.skin, -0.25); c.lineWidth = 0.5 * s;
  c.beginPath(); c.moveTo(x + 0.2 * s, hy + 0.8 * s); c.quadraticCurveTo(x + 0.9 * s, hy + 2 * s, x - 0.2 * s, hy + 2.2 * s); c.stroke();
  c.fillStyle = 'rgba(240,120,120,.35)';
  c.beginPath(); c.arc(x - 3.6 * s, hy + 2.6 * s, 1.2 * s, 0, Math.PI * 2); c.arc(x + 3.6 * s, hy + 2.6 * s, 1.2 * s, 0, Math.PI * 2); c.fill();
  c.strokeStyle = '#7a3b2e'; c.lineWidth = 0.8 * s;
  c.beginPath(); c.arc(x, hy + 2.6 * s, 1.8 * s, 0.15 * Math.PI, 0.85 * Math.PI); c.stroke();
  // hair on top
  const hairG = c.createLinearGradient(x - 6 * s, hy - 8 * s, x + 6 * s, hy);
  hairG.addColorStop(0, shade(look.hair, 0.16)); hairG.addColorStop(0.5, look.hair); hairG.addColorStop(1, shade(look.hair, -0.12));
  c.fillStyle = hairG;
  const cap = (r = 6.9) => { c.beginPath(); c.arc(x, hy - 0.4 * s, r * s, Math.PI * 1.02, Math.PI * 1.98); c.closePath(); c.fill(); };
  switch (look.style) {
    case 'short':
      cap(); c.beginPath(); c.ellipse(x - 2 * s, hy - 4.6 * s, 4.5 * s, 2.2 * s, -0.3, 0, Math.PI * 2); c.fill(); break;
    case 'long':
      cap(7.2); c.beginPath(); c.ellipse(x + 1.5 * s, hy - 4.8 * s, 5 * s, 2.3 * s, 0.25, 0, Math.PI * 2); c.fill(); break;
    case 'curly':
      for (let a = 0; a <= 8; a++) { const ang = Math.PI * (1 + a / 8); c.beginPath(); c.arc(x + Math.cos(ang) * 6.3 * s, hy + Math.sin(ang) * 6 * s, 2.6 * s, 0, Math.PI * 2); c.fill(); }
      break;
    case 'bun':
      cap(); c.beginPath(); c.arc(x, hy - 8.3 * s, 3 * s, 0, Math.PI * 2); c.fill(); break;
    case 'ponytail':
      cap(); c.beginPath(); c.ellipse(x + 7 * s, hy + 1 * s, 2.3 * s, 5 * s, -0.4, 0, Math.PI * 2); c.fill(); break;
    case 'buzz':
      c.globalAlpha = 0.75; cap(6.7); c.globalAlpha = 1; break;
    case 'spiky':
      cap();
      for (let k = -2; k <= 2; k++) { c.beginPath(); c.moveTo(x + k * 2.6 * s - 1.8 * s, hy - 5 * s); c.lineTo(x + k * 2.6 * s, hy - 10 * s + Math.abs(k) * 0.8 * s); c.lineTo(x + k * 2.6 * s + 1.8 * s, hy - 5 * s); c.fill(); }
      break;
    case 'braids':
      cap(); break;
  }
  if (look.style !== 'buzz') {
    c.strokeStyle = 'rgba(255,255,255,.22)'; c.lineWidth = 0.7 * s;
    c.beginPath(); c.arc(x - 0.5 * s, hy - 1 * s, 5.2 * s, Math.PI * 1.2, Math.PI * 1.5); c.stroke();
  }
  c.restore();
}
function rrPath(c, x, y, w, h, r) { c.beginPath(); c.roundRect ? c.roundRect(x, y, w, h, r) : c.rect(x, y, w, h); }

const avatarCache = {};
function avatarURL(look, size = 64) {
  const key = JSON.stringify(look) + size;
  if (avatarCache[key]) return avatarCache[key];
  const cv = document.createElement('canvas');
  cv.width = size * 2; cv.height = size * 2;
  const c = cv.getContext('2d');
  // a portrait: head and shoulders, zoomed in
  const s = size * 2 / 26;
  drawPerson(c, size, size * 2 + 15 * s, s, look);
  return (avatarCache[key] = cv.toDataURL());
}
function avatarImg(look, size = 44, cls = 'avatar') {
  return `<img class="${cls}" src="${avatarURL(look, size)}" width="${size}" height="${size}" alt="">`;
}

// ---------- character creator ----------
function characterCreator(el, look, onChange) {
  const sw = (key, vals) => `<div class="cc-row"><span class="cc-label">${{ skin: 'Skin', hair: 'Hair color', shirt: 'Shirt', pants: 'Pants' }[key]}</span><div class="swatches">${vals.map(v => `<button type="button" class="sw ${look[key] === v ? 'sel' : ''}" data-k="${key}" data-v="${v}" style="background:${v}" aria-label="${key} ${v}"></button>`).join('')}</div></div>`;
  el.innerHTML = `<div class="cc">
    <canvas class="cc-preview" width="200" height="240"></canvas>
    <div class="cc-opts">
      ${sw('skin', LOOKS.skin)}
      <div class="cc-row"><span class="cc-label">Hair style</span><div class="styles">${LOOKS.style.map(v => `<button type="button" class="st ${look.style === v ? 'sel' : ''}" data-k="style" data-v="${v}">${STYLE_NAMES[v]}</button>`).join('')}</div></div>
      ${sw('hair', LOOKS.hair)}
      ${sw('shirt', LOOKS.shirt)}
      ${sw('pants', LOOKS.pants)}
      <button type="button" class="btn ghost sm cc-rand">🎲 Surprise me</button>
    </div></div>`;
  const cv = el.querySelector('.cc-preview');
  let t0 = 0;
  const draw = (t = 0) => {
    const c = cv.getContext('2d');
    c.clearRect(0, 0, cv.width, cv.height);
    const g = c.createLinearGradient(0, 0, 0, cv.height);
    g.addColorStop(0, '#cfeaff'); g.addColorStop(0.7, '#e9f6ff'); g.addColorStop(0.7, '#8fd17a'); g.addColorStop(1, '#73bb60');
    c.fillStyle = g; c.fillRect(0, 0, cv.width, cv.height);
    drawPerson(c, 100, 215, 4.6, look, t / 160, false);
  };
  draw();
  el.querySelectorAll('[data-k]').forEach(btn => btn.onclick = () => {
    look[btn.dataset.k] = btn.dataset.v;
    el.querySelectorAll(`[data-k="${btn.dataset.k}"]`).forEach(b => b.classList.toggle('sel', b === btn));
    draw(); onChange && onChange(look);
  });
  el.querySelector('.cc-rand').onclick = () => {
    Object.assign(look, randomLook());
    characterCreator(el, look, onChange);
    onChange && onChange(look);
  };
}
