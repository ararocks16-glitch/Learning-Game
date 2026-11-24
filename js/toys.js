// ===================== TOYS: buy them at the Mall, play with them at home and outside =====================

// what each toy does when you play with it
const TOYS = {
  teddy:     { name: 'Teddy Bear', icon: '🧸', price: 15, hours: 0.25, fun: 8, desc: 'Soft and cuddly. Hug it when you feel sad or tired.' },
  bricks:    { name: 'Building Bricks', icon: '🧱', price: 40, hours: 1, fun: 12, skill: ['build', 1.5], desc: 'Snap bricks together to build anything! Building skill.' },
  puzzle:    { name: '500-Piece Puzzle', icon: '🧩', price: 12, hours: 1, fun: 9, skill: ['math', 0.8], desc: 'Finish it a piece at a time. Good for your brain!' },
  boardgame: { name: 'Board Game', icon: '🎲', price: 25, hours: 1.5, fun: 15, skill: ['comm', 1], desc: 'You need at least 2 players — play with friends or family!' },
  rccar:     { name: 'Remote Control Car', icon: '🏎️', price: 60, hours: 0.75, fun: 14, desc: 'Zoom zoom! It needs batteries (Mall).' },
  yoyo:      { name: 'Yo-Yo', icon: '🪀', price: 5, hours: 0.5, fun: 7, desc: 'Practice to learn cool tricks.' },
  slime:     { name: 'Slime Kit', icon: '🟢', price: 12, hours: 0.75, fun: 10, skill: ['sci', 1], consumable: 3, desc: 'Mix your own slime — it\'s science! Makes 3 batches. A bit messy.' },
  dollhouse: { name: 'Dollhouse', icon: '🏠', price: 70, hours: 1, fun: 11, skill: ['write', 0.8], desc: 'Make up stories with little dolls and furniture.' },
  trainset:  { name: 'Model Train Set', icon: '🚂', price: 120, hours: 1, fun: 12, skill: ['build', 1], desc: 'Build tracks and watch the train go around!' },
  kite:      { name: 'Kite', icon: '🪁', price: 18, hours: 1, fun: 16, outside: true, desc: 'Fly it at the park or the beach. Not in the rain!' },
  jumprope:  { name: 'Jump Rope', icon: '🪢', price: 8, hours: 0.5, fun: 8, sport: true, outside: true, desc: 'Great exercise! Play outside at the park or beach.' },
  ball:      { name: 'Bouncy Ball', icon: '🔴', price: 4, hours: 0.5, fun: 7, outside: true, desc: 'Bounce, catch and play fetch at the park.' },
};
const YOYO_TRICKS = ['the Sleeper', 'Walk the Dog', 'Around the World', 'Rock the Baby', 'the Elevator', 'Skin the Cat'];
const BRICK_BUILDS = ['a castle with towers 🏰', 'a rocket ship 🚀', 'a giant robot 🤖', 'a pirate ship 🏴‍☠️', 'a race car 🏎️', 'a whole little town 🏘️', 'a dragon 🐉', 'a treehouse 🌳'];
const PUZZLE_PICS = ['a lighthouse by the sea', 'a hot air balloon', 'puppies in a basket', 'a mountain lake', 'a big world map', 'outer space with planets'];
const OUTSIDE_PLACES = ['park', 'beach', 'campground', 'lake'];

// toys are sold at the Mall in their own aisle
Object.entries(TOYS).forEach(([id, t]) => ITEMS.push({ id: 'toy_' + id, place: 'mall', cat: 'Toys', name: t.name, icon: t.icon, price: t.price, desc: t.desc, consumable: !!t.consumable }));
ITEMS.push({ id: 'batteries', place: 'mall', cat: 'Toys', name: 'Batteries (4-pack)', icon: '🔋', price: 6, consumable: true, desc: 'For the remote control car. Good for 5 races.' });
ACHIEVEMENTS.push({ id: 'toybox', icon: '🧸', name: 'Toy Box', desc: 'Own 6 different toys.' });

function ensureToyState() {
  if (!S.toys) S.toys = { batteries: 0, slime: 0, puzzle: 0, puzzlePic: 0, tricks: 0, played: {}, playedDay: -1, builds: 0 };
}
const hasToy = id => !!S.owned['toy_' + id] || (id === 'slime' && S.toys && S.toys.slime > 0);
function toyCount() { return Object.keys(TOYS).filter(hasToy).length; }

// buying: called from buy() for toys and batteries
function toyBuy(id) {
  ensureToyState();
  if (id === 'batteries') { S.toys.batteries += 5; log('🔋 You bought batteries for your remote control car.'); return true; }
  if (id === 'toy_slime') { S.toys.slime += 3; log('🟢 You bought a slime kit. It makes 3 batches!'); return true; }
  if (id.startsWith('toy_')) { S.owned[id] = true; log(`${TOYS[id.slice(4)].icon} You bought a ${TOYS[id.slice(4)].name}!`, 'good'); if (toyCount() >= 6) unlock('toybox'); return true; }
  return false;
}

// playing the same toy again and again gets boring
function toyFun(id, base) {
  if (S.toys.playedDay !== S.day) { S.toys.playedDay = S.day; S.toys.played = {}; }
  const n = S.toys.played[id] = (S.toys.played[id] || 0) + 1;
  return Math.round(base / n);
}

function toyBox(outside) {
  ensureToyState();
  const list = Object.keys(TOYS).filter(id => hasToy(id) && (outside ? TOYS[id].outside || id === 'yoyo' || id === 'teddy' : true));
  if (!list.length) return nope(outside ? 'You don\'t have any outdoor toys. Buy a kite, jump rope or bouncy ball at the 🛍️ Mall!' : 'You don\'t have any toys yet. Buy some in the Toys aisle at the 🛍️ Mall!');
  showModal(`<h2>🧸 ${outside ? 'Play Outside' : 'Your Toy Box'}</h2><p class="muted">What do you want to play with?</p>
    <div class="grid actions">${list.map(id => { const t = TOYS[id]; return `<button class="action" onclick="closeModal();playToy('${id}')"><span class="ic">${t.icon}</span><b>${t.name}</b><small>${toyHint(id)}</small></button>`; }).join('')}</div>`,
    [{ label: 'Close', cls: 'ghost' }]);
}
function toyHint(id) {
  const t = TOYS[id], tm = t.hours < 1 ? `${Math.round(t.hours * 60)} min` : `${t.hours} hr${t.hours > 1 ? 's' : ''}`;
  if (id === 'rccar') return `${tm} · 🔋 ${S.toys.batteries} races left`;
  if (id === 'slime') return `${tm} · ${S.toys.slime} batches left`;
  if (id === 'puzzle') return `${tm} · ${S.toys.puzzle}% done`;
  if (id === 'yoyo') return `${tm} · ${S.toys.tricks}/${YOYO_TRICKS.length} tricks`;
  if (t.outside && !OUTSIDE_PLACES.includes(placeId(S.loc))) return 'Take it to the park or beach!';
  return tm + (t.skill ? ` · ${SKILLS[t.skill[0]].name}` : '');
}

function playToy(id, friendIdx) {
  ensureToyState();
  const t = TOYS[id];
  if (!hasToy(id)) return nope(`You don't have a ${t.name}.`);
  if (S.needs.energy < 8) return nope('You\'re too tired to play. Take a nap first!');
  const outside = OUTSIDE_PLACES.includes(placeId(S.loc));
  if (t.outside && !outside) return nope(`${t.icon} The ${t.name.toLowerCase()} is an outside toy. Take it to the 🌳 Park or the 🏖️ Beach!`);
  if (t.outside && (S.weather === 'rainy' || S.storm)) return nope('It\'s raining! Play with it another day.');
  if (S.powerOut && id === 'trainset') return nope('🔌 The power is out — the train needs electricity!');
  let msg;
  if (id === 'rccar') {
    if (S.toys.batteries <= 0) return nope('🔋 The batteries are dead! Buy batteries at the Mall.');
    S.toys.batteries--;
    msg = pickR(['You raced the car around the kitchen and did a big jump off a book ramp! 🏎️💨', 'You did 10 donuts on the floor. Vroom vroom!', 'You set up a race track with shoes as cones and beat your best time!']);
    if (S.pets && S.pets.length) msg += ` ${S.pets[0].name} chased it everywhere! 😂`;
  } else if (id === 'boardgame') {
    const home = S.loc === 'home' || placeId(S.loc) === 'home';
    const friends = S.friends || [];
    if (friendIdx === undefined) {
      if (!friends.length && S.home !== 'parents') return nope('🎲 A board game needs at least 2 players! Make friends, or visit your family.');
      if (S.home === 'parents' && home) return playBoardGame(null);
      return showModal(`<h2>🎲 Who do you want to play with?</h2><div class="guestpick">${friends.map((fr, i) => `<button class="guest" onclick="closeModal();playToy('boardgame', ${i})"><img class="avatar" src="${avatarURL(fr.look, 56)}" alt=""><b>${esc(fr.name)}</b><small>Age ${fr.age}</small></button>`).join('')}</div>`, [{ label: 'Cancel', cls: 'ghost' }]);
    }
    return playBoardGame(friends[friendIdx]);
  } else if (id === 'puzzle') {
    S.toys.puzzle += 25;
    const pic = PUZZLE_PICS[S.toys.puzzlePic % PUZZLE_PICS.length];
    if (S.toys.puzzle >= 100) { msg = `🎉 You put in the LAST piece! The puzzle of ${pic} is finished! You took it apart to start a new one.`; S.toys.puzzle = 0; S.toys.puzzlePic++; fun2(10); }
    else msg = `You did the ${S.toys.puzzle === 25 ? 'edges first (smart!)' : 'middle part'} of the puzzle of ${pic}. It's ${S.toys.puzzle}% done.`;
  } else if (id === 'yoyo') {
    if (S.toys.tricks < YOYO_TRICKS.length && Math.random() < 0.45) { msg = `You learned a new trick: ${YOYO_TRICKS[S.toys.tricks]}! Awesome!`; S.toys.tricks++; }
    else msg = S.toys.tricks ? `You practiced ${pickR(YOYO_TRICKS.slice(0, S.toys.tricks))}. Getting smoother!` : 'You practiced... the string got all tangled. Keep trying!';
  } else if (id === 'slime') {
    S.toys.slime--; S.mess = clamp(S.mess + 10);
    msg = `You mixed glue, water and a pinch of baking soda and made ${pickR(['glittery purple', 'glow-in-the-dark green', 'fluffy pink', 'crunchy blue', 'rainbow'])} slime! 🧪 (It got a little messy.)`;
  } else if (id === 'bricks') {
    S.toys.builds++;
    msg = `You built ${pickR(BRICK_BUILDS)}! It took ${S.toys.builds > 5 ? 'a lot of pieces — you\'re a master builder!' : 'a while, but it looks great.'}`;
  } else if (id === 'teddy') {
    msg = S.needs.fun < 30 || S.needs.energy < 30 ? 'You gave your teddy bear a big hug. You feel a lot better. 🤗' : 'You hugged your teddy bear. So soft!';
    S.needs.energy = clamp(S.needs.energy + 2);
  } else if (id === 'dollhouse') {
    msg = `You made up a story where the dolls ${pickR(['threw a surprise birthday party', 'adopted a puppy', 'had a pizza night', 'fixed a leaky roof', 'went on vacation', 'opened a bakery'])}. 📖`;
  } else if (id === 'trainset') {
    msg = `You built a track with ${pickR(['a bridge', 'a tunnel', 'two loops', 'a station', 'a figure-8'])} and watched the train go around and around. Choo choo! 🚂`; S.kwh = (S.kwh || 0) + 0.1;
  } else if (id === 'kite') {
    const windy = S.weather === 'cloudy' || Math.random() < 0.4;
    msg = windy ? 'The wind was perfect! Your kite flew SO high — up above the trees! 🪁' : 'Not much wind today... you ran around a lot to keep it up. Still fun!';
    if (!windy) S.needs.energy = clamp(S.needs.energy - 5);
  } else if (id === 'jumprope') {
    msg = `You jumped rope ${50 + Math.floor(Math.random() * 150)} times in a row! 💪`; S.needs.energy = clamp(S.needs.energy - 6);
  } else if (id === 'ball') {
    msg = S.pets && S.pets.some(p => baseOf(p) === 'dog') ? 'You played fetch with your dog. Best day ever! 🐕' : 'You bounced the ball super high and played catch against a wall.';
  }
  pass(t.hours, 'relax');
  const f = toyFun(id, t.fun); fun2(f);
  if (t.skill) addSkill(t.skill[0], t.skill[1]);
  if (t.sport) addSkill('fit', 1);
  log(`${t.icon} ${msg}${f < t.fun / 2 ? ' (It\'s getting a little boring — try a different toy!)' : ''}`, 'good');
  done();
}
function playBoardGame(fr) {
  const t = TOYS.boardgame, who = fr ? fr.name : 'your family';
  const game = pickR(['a racing game', 'a money and property game', 'a word game', 'a mystery game', 'a game about building cities', 'checkers', 'chess']);
  const win = Math.random() < 0.5;
  pass(t.hours, 'relax'); fun2(toyFun('boardgame', t.fun)); addSkill('comm', 1); addSkill('math', 0.4);
  if (fr) fr.f = clamp(fr.f + 12); else if (S.family) Object.values(S.family).forEach(m => m.rel = clamp(m.rel + 4));
  log(`🎲 You played ${game} with ${who}. ${win ? 'You won! 🏆' : `${fr ? fr.name : 'Grandma'} won this time. Good game!`}`, 'good');
  if (!win) S.needs.fun = clamp(S.needs.fun - 2);
  done();
}

// outdoor toys at the park and beach
function outdoorToysCard(pid) {
  if (!OUTSIDE_PLACES.includes(pid)) return '';
  ensureToyState();
  const list = ['kite', 'jumprope', 'ball', 'yoyo'].filter(hasToy);
  if (!list.length) return '';
  return `<div class="card money"><h3>🪁 Play With Your Toys</h3><div class="mrows">${list.map(id => mrow(TOYS[id].icon, TOYS[id].name, toyHint(id), b('Play', `playToy('${id}')`))).join('')}</div></div>`;
}

// toys you own show up in your room
function drawToys(c) {
  if (!S.toys) return;
  if (hasToy('teddy') && hasF('mattress')) {     // teddy bear sitting on the bed (or mattress)
    const x = 150, y = has('bed') ? 206 : 228;
    const fur = '#b5793f', light = '#d9a066';
    c.fillStyle = fur; c.beginPath(); c.ellipse(x, y, 9, 10, 0, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.arc(x, y - 14, 7.5, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.arc(x - 6, y - 20, 3, 0, Math.PI * 2); c.arc(x + 6, y - 20, 3, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.ellipse(x - 7, y + 8, 4, 3, 0, 0, Math.PI * 2); c.ellipse(x + 7, y + 8, 4, 3, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = light; c.beginPath(); c.ellipse(x, y + 1, 5, 6, 0, 0, Math.PI * 2); c.fill(); c.beginPath(); c.ellipse(x, y - 12, 3.5, 2.6, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#2b1a10'; c.beginPath(); c.arc(x - 2.7, y - 15.5, 1, 0, Math.PI * 2); c.arc(x + 2.7, y - 15.5, 1, 0, Math.PI * 2); c.arc(x, y - 12.6, 1.2, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#e53935'; c.beginPath(); c.moveTo(x - 5, y - 7); c.lineTo(x, y - 5); c.lineTo(x + 5, y - 7); c.lineTo(x + 5, y - 3); c.lineTo(x, y - 5); c.lineTo(x - 5, y - 3); c.fill();
  }
  if (hasToy('bricks')) {                         // a little brick tower on the floor
    const cols = ['#e53935', '#1e88e5', '#fdd835', '#43a047', '#fb8c00'];
    [[0, 0, 22], [22, 0, 22], [8, -10, 22], [30, -10, 14], [14, -20, 16], [16, -30, 12]].forEach(([dx, dy, w], k) => {
      const x = 196 + dx, y = 352 + dy;
      c.fillStyle = cols[k % cols.length]; c.fillRect(x, y, w, 10);
      c.fillStyle = 'rgba(0,0,0,.15)'; c.fillRect(x, y + 8, w, 2);
      c.fillStyle = 'rgba(255,255,255,.35)'; for (let s = 3; s < w - 2; s += 6) c.fillRect(x + s, y - 2, 4, 2);
    });
  }
  if (hasToy('rccar')) {                          // remote control car
    const x = 372, y = 362;
    c.fillStyle = 'rgba(0,0,0,.18)'; c.beginPath(); c.ellipse(x + 16, y + 9, 22, 4, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#d32f2f'; rrect(c, x, y - 6, 34, 11, 4); c.fill();
    c.fillStyle = '#b71c1c'; rrect(c, x + 8, y - 13, 16, 8, 3); c.fill();
    c.fillStyle = '#90caf9'; c.fillRect(x + 11, y - 11, 10, 4);
    c.fillStyle = '#212121'; [x + 7, x + 27].forEach(wx => { c.beginPath(); c.arc(wx, y + 5, 4.5, 0, Math.PI * 2); c.fill(); });
    c.fillStyle = '#9e9e9e'; [x + 7, x + 27].forEach(wx => { c.beginPath(); c.arc(wx, y + 5, 1.6, 0, Math.PI * 2); c.fill(); });
    c.strokeStyle = '#333'; c.lineWidth = 1; c.beginPath(); c.moveTo(x + 4, y - 6); c.lineTo(x - 2, y - 20); c.stroke();
  }
  if (hasToy('trainset')) {                       // oval train track with a little train
    const cx = 590, cy = 360;
    c.strokeStyle = '#8d6e63'; c.lineWidth = 5; c.beginPath(); c.ellipse(cx, cy, 46, 10, 0, 0, Math.PI * 2); c.stroke();
    c.strokeStyle = '#5d4037'; c.lineWidth = 1.2; c.beginPath(); c.ellipse(cx, cy, 46, 10, 0, 0, Math.PI * 2); c.stroke();
    const tx = cx + 10, ty = cy + 6;
    c.fillStyle = '#1565c0'; c.fillRect(tx, ty - 12, 18, 10); c.fillStyle = '#c62828'; c.fillRect(tx + 12, ty - 18, 6, 7); c.fillRect(tx - 16, ty - 10, 14, 8);
    c.fillStyle = '#212121'; [tx + 3, tx + 14, tx - 13, tx - 5].forEach(wx => { c.beginPath(); c.arc(wx, ty - 1, 2.6, 0, Math.PI * 2); c.fill(); });
  }
  if (hasToy('ball')) { const g = c.createRadialGradient(450, 352, 1, 452, 355, 8); g.addColorStop(0, '#ff8a80'); g.addColorStop(1, '#c62828'); c.fillStyle = g; c.beginPath(); c.arc(452, 356, 7, 0, Math.PI * 2); c.fill(); }
}
