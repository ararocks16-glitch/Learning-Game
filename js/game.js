// ===================== LIFE GAME =====================
const SAVE_KEY = 'lifeGameSave_v1';
const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const NEEDS = {
  food:    { name: 'Hunger',  icon: '🍽️' },
  energy:  { name: 'Energy',  icon: '⚡' },
  hygiene: { name: 'Clean',   icon: '🧼' },
  bladder: { name: 'Bathroom', icon: '🚽' },
  fun:     { name: 'Fun',     icon: '😄' },
  health:  { name: 'Health',  icon: '❤️' },
};

let S = null;          // the game state
let tab = 'home';
let jobFilter = { cat: 'All', onlyCan: false };
const modalQueue = [];

// ---------- helpers ----------
const $ = sel => document.querySelector(sel);
const rand = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a = 0, b = 100) => Math.max(a, Math.min(b, v));
const money = n => (n < 0 ? '-$' : '$') + Math.abs(Math.round(n)).toLocaleString();
const weekday = (d = S.day) => (d - 1) % 7;
const isWeekend = () => weekday() >= 5;
const has = id => !!S.owned[id];
const home = () => HOMES[S.home];
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function fmtTime(h) {
  let hh = Math.floor(h), mm = Math.round((h - hh) * 60);
  if (mm === 60) { hh++; mm = 0; }
  hh = hh % 24;
  const ap = hh >= 12 ? 'PM' : 'AM';
  let h12 = hh % 12; if (h12 === 0) h12 = 12;
  return `${h12}:${String(mm).padStart(2, '0')} ${ap}`;
}

function skillName(id) {
  if (SKILLS[id]) return `${SKILLS[id].icon} ${SKILLS[id].name}`;
  if (SPORTS[id]) return `${SPORTS[id].icon} ${SPORTS[id].name}`;
  return id;
}
function skillLevel(id) {
  if (id in S.skills) return S.skills[id];
  if (id in S.sports) return S.sports[id];
  return 0;
}
function addSkill(id, base) {
  const cur = skillLevel(id);
  const gain = Math.max(0.4, base * (1 - cur / 130));
  const next = Math.min(100, cur + gain);
  if (id in S.skills) S.skills[id] = next; else S.sports[id] = next;
  return next - cur;
}

function log(text, kind = '') {
  S.log.unshift({ t: `Day ${S.day} ${fmtTime(S.hour)}`, text, kind });
  if (S.log.length > 80) S.log.length = 80;
}
function toast(text, kind = '') {
  const el = document.createElement('div');
  el.className = 'toast ' + kind;
  el.textContent = text;
  const box = $('#toasts');
  while (box.children.length >= 3) box.firstChild.remove();
  box.appendChild(el);
  setTimeout(() => el.classList.add('gone'), 2600);
  setTimeout(() => el.remove(), 3200);
}
function nope(text) { toast(text, 'bad'); }

// ---------- money ----------
function earn(amount, label) {
  S.money += amount;
  S.week.income += amount;
  S.week.lines.push({ label, amount });
}
function spend(amount, label) {
  if (S.money < amount) { nope(`You need ${money(amount)} but only have ${money(S.money)}.`); return false; }
  S.money -= amount;
  S.week.expenses += amount;
  S.week.lines.push({ label, amount: -amount });
  trackSpend(label, amount);
  return true;
}
// Bills get charged even if you can't afford them
function charge(amount, label) {
  const before = S.money;
  S.money -= amount;
  S.week.expenses += amount;
  S.week.lines.push({ label, amount: -amount });
  trackSpend(label, amount);
  if (before >= 0 && S.money < 0) {
    credit(-20, 'your account was overdrawn');
    S.money -= 35;
    S.week.expenses += 35;
    S.week.lines.push({ label: 'Overdraft fee (spent more than you had!)', amount: -35 });
    log(`💸 Your account went below $0. The bank charged a $35 overdraft fee!`, 'bad');
  }
}
function netWorth() {
  let w = S.money + S.savings - S.loan;
  const h = home();
  if (h.type === 'buy') w += h.price - (S.mortgage ? S.mortgage.balance : 0);
  if (has('car')) w += 3000;
  if (has('newcar')) w += 18000;
  return w + moneyAssets();
}

// ---------- new game ----------
function newGame(name, look, talents) {
  const skills = {};
  for (const k in SKILLS) skills[k] = Math.round(rand(0, 9));
  talents.forEach(t => skills[t] += 25);
  skills.drive = Math.min(skills.drive, 5) + (talents.includes('drive') ? 20 : 0);
  const sports = {};
  for (const k in SPORTS) sports[k] = Math.round(rand(0, 6));

  S = {
    name, look, day: 1, hour: 7,
    money: 300, savings: 0, loan: 0,
    needs: { food: 75, energy: 90, hygiene: 60, bladder: 55, fun: 70, health: 100 },
    skills, sports, edu: 1, eduProgress: { 2: 0, 3: 0 },
    job: null, jobsWorked: [], cooldown: {}, loc: 'home', handsDirty: false,
    home: 'parents', mortgage: null, missedRent: 0,
    owned: {}, groceries: 4, clothes: 1, laundryDays: 0,
    today: { worked: false, brushed: false, brushAM: false, brushPM: false, showered: false, sick: false },
    showerStreak: 0, plaque: 0, cavityAt: 60 + Math.floor(Math.random() * 31), doorOpen: true,
    insurance: false, sportsTried: {}, trophies: [],
    achievements: {}, taxRefundDone: false,
    week: { income: 0, expenses: 0, lines: [] },
    log: [],
  };
  ensureMoneyState();
  S.homeV2 = true;
  ensureHomeState();
  ensureTripState();
  ensurePetState();
  ensureRealLife();
  log(`👋 Welcome, ${name}! You just finished high school and live with your parents. Time to start your life!`, 'good');
  log(`💡 Click the 💼 Job Center on the map, pick a job, and tell them what you can do.`);
  save();
  showModal(`<div class="placehead">${avatarImg(look, 64, 'avatar big')}<h2>Welcome to Life, ${esc(name)}!</h2></div>
    <p>You just graduated high school. You live with your parents and have <b>$300</b>.</p>
    <ul class="tips">
      <li>💼 <b>Get a job</b> — tell the boss what you're good at.</li>
      <li>🗺️ <b>Click buildings on the town map</b> to go places. Walking is slow — a bike, the bus or a car is faster.</li>
      <li>🚿 <b>Take care of yourself</b> — eat, drink water, sleep, use the toilet, wash your hands, shower, brush teeth.</li>
      <li>📅 <b>It's June 1st.</b> Seasons change, holidays come, and you get older every birthday!</li>
      <li>💵 <b>Paychecks come Friday night</b> — taxes come out first.</li>
      <li>🧾 <b>Bills are due every Monday.</b></li>
      <li>🏅 <b>Play sports</b>, pay coaches for lessons, and enter tournaments on weekends.</li>
      <li>🏠 <b>Save up</b> to rent your own place, and maybe buy a house!</li>
    </ul>
    <p>The goal: learn what grown-up life is really like. Good luck!</p>`, [{ label: "Let's go!" }]);
}

// ---------- time ----------
const RATES = {
  //        food  energy hygiene fun  bladder
  awake:  [-4,   -3.5,  -2,     -1,  -7],
  work:   [-4.5, -5,    -3,     -1.5, -7],
  study:  [-4,   -5,    -1.5,   -2,  -7],
  sport:  [-6,   -9,    -12,    3,   -6],
  relax:  [-3.5, -1,    -1,     6,   -7],
  sleep:  [-1.5, 0,     -1,     0,   -2.5],
};

function tick(h, mode) {
  const r = RATES[mode], n = S.needs;
  n.food += r[0] * h;
  n.hygiene += r[2] * h;
  n.fun += r[3] * h;
  n.bladder += r[4] * h;
  if (n.bladder <= 4) {
    if (mode === 'work' || mode === 'study' || mode === 'sport') {
      n.bladder = 100; S.handsDirty = false;          // bathroom break (public places have restrooms)
    } else if (mode === 'sleep') {
      n.bladder = 100; n.energy -= 4; S.nightWake = true; S.handsDirty = true;
    } else {
      n.bladder = 100; n.hygiene = Math.min(n.hygiene, 10); n.fun -= 25;
      S.laundryDays = Math.max(S.laundryDays, 8); S.accident = true;
    }
  }
  if (mode === 'sleep') {
    const per = 8.5 + home().comfort * 0.6 + (has('bed') ? 2 : hasF('mattress') ? 0 : -3);
    n.energy += per * h;
    if (n.food > 25) n.health += 1 * h;
  } else {
    n.energy += r[1] * h;
  }
  if (n.food <= 0) n.health -= 3 * h;
  petTick(h);
  lifeTick(h, mode);
  jetlagTick(h, mode);
  if (S.l4) outfitTick(h, mode);
  if (mode !== 'sleep') sunTick(h);
  if (n.hygiene < 15) { n.health -= 0.4 * h; n.fun -= 1 * h; }
  if (n.fun < 10) n.health -= 0.3 * h;
  if (atHome() && has('couch') && mode === 'relax') n.fun += 2 * h;
  if (atHome() && mode !== 'sleep') n.fun += cozy() * 0.03 * h;
  if (atHome() && has('fan') && S.weather === 'hot') n.fun += 0.5 * h;
  for (const k in n) n[k] = clamp(n[k]);
  if (S.home === 'parents') n.fun = Math.min(n.fun, 80);
}

function pass(hours, mode = 'awake') {
  let left = hours;
  while (left > 0.0001) {
    const step = Math.min(1, left, 24 - S.hour);
    tick(step, mode);
    S.hour += step; left -= step;
    if (S.hour >= 24 - 1e-6) { S.hour = 0; newDay(); }
  }
}

function newDay() {
  // --- end of the old day ---
  const j = S.job;
  const hol = holidayToday();
  if (j && hol && hol.closed && shiftOf(JOBS[j.id]) === 'day' && weekday() < 5 && S.day >= j.startDay) { j.weekHours += 8; log(`${hol.icon} ${hol.name} is a paid holiday. You got paid without working!`, 'good'); }
  if (j && worksToday() && S.day >= j.startDay && !S.today.worked) {
    if (S.today.sick) {
      log(`🤒 You called in sick to work.`);
    } else {
      j.misses++;
      log(`⚠️ You didn't show up to work! Your boss is upset. (Missed days: ${j.misses}/3)`, 'bad');
      if (j.misses >= 3) fire('You missed too many days of work without calling.');
    }
  }
  // teeth: brushing twice a day keeps them clean. Skipping for 2-3 months gives you a cavity.
  const brushes = (S.today.brushAM ? 1 : 0) + (S.today.brushPM ? 1 : 0);
  S.plaque = Math.max(0, (S.plaque || 0) + (brushes >= 2 ? -1 : brushes === 1 ? 0.5 : 1));
  if (S.today.showered) S.showerStreak++; else S.showerStreak = 0;
  if (S.showerStreak >= 7) unlock('clean_week');

  if (weekday() === 4) payday(); // Friday night

  // --- start of the new day ---
  S.day++;
  moneyNewDay();
  homeNewDay();
  petNewDay();
  calendarNewDay();
  lifeNewDay();
  socialNewDay();
  carsNewDay();
  taxNewDay();
  buildNewDay();
  realNewDay();
  town3NewDay();
  money2NewDay();
  holidaysNewDay();
  life4NewDay();
  town4NewDay();
  if (Math.random() < 0.025) emergencyEvent();
  S.today = { worked: false, brushed: false, brushAM: false, brushPM: false, showered: false, sick: false };
  if (!(has('wardrobe') && S.day % 2)) S.laundryDays++;
  if (weekday() === 0) weeklyBills();
  if (S.day >= 30) unlock('month');
  if (S.day >= 365) unlock('year');
  dailyEvent();
}

// ---------- jobs ----------
function canApply(job) {
  if (S.edu < job.edu) return { ok: false, why: `Needs a ${EDU_NAMES[job.edu]}` };
  return { ok: true };
}
function meetsReqs(job) {
  return S.edu >= job.edu && job.req.every(r => skillLevel(r.s) >= r.lvl);
}

function fire(reason) {
  if (!S.job) return;
  const j = JOBS[S.job.id];
  if (S.job.weekHours > 0) payday(true);
  log(`🚫 You were FIRED from ${j.name}. ${reason}`, 'bad');
  queueModal(`<h2>🚫 You're Fired!</h2><p>Your boss at <b>${j.name}</b> let you go.</p><p><i>${reason}</i></p>
    <p class="lesson">💡 Life lesson: Bosses count on you to show up, do good work, and be honest.</p>`);
  S.cooldown[S.job.id] = S.day + 14;
  S.job = null;
}

function quitJob() {
  if (!S.job) return;
  const j = JOBS[S.job.id];
  confirmModal(`Quit your job as <b>${j.name}</b>? You'll get paid for hours you already worked.`, () => {
    if (S.job.weekHours > 0) payday(true);
    log(`👋 You quit your job as ${j.name}.`);
    S.job = null;
    done();
  });
}

function startInterview(jobId) {
  const job = JOBS[jobId];
  if (isWeekend()) return nope('Businesses do interviews on weekdays (Mon–Fri).');
  if (S.hour < 8 || S.hour > 16) return nope('Interviews happen between 8 AM and 4 PM.');
  if (S.cooldown[jobId] && S.cooldown[jobId] > S.day) return nope(`They said to wait. You can re-apply on Day ${S.cooldown[jobId]}.`);
  if (S.job && S.job.id === jobId) return nope('You already work here!');

  const wanted = new Set(job.req.map(r => r.s));
  const all = Object.keys(SKILLS).concat(Object.keys(SPORTS));
  // show wanted first, then everything else sorted by your level
  all.sort((a, b) => (wanted.has(b) - wanted.has(a)) || (skillLevel(b) - skillLevel(a)));
  const rows = all.map(id => {
    const lvl = Math.round(skillLevel(id));
    const r = job.req.find(x => x.s === id);
    return `<label class="claim ${wanted.has(id) ? 'wanted' : ''}">
      <input type="checkbox" value="${id}">
      <span>${skillName(id)}</span>
      <span class="lvl">you: ${lvl}${r ? ` · they want ${r.lvl}` : ''}</span>
    </label>`;
  }).join('');

  showModal(`<h2>🤝 Interview: ${job.name}</h2>
    <p class="muted">${money(job.pay)}/hour · ${EDU_NAMES[job.edu]}${job.insurance ? ' · includes health insurance' : ''}</p>
    <p>The manager shakes your hand and asks: <b>"So, what can you do?"</b></p>
    <p class="muted">Pick up to <b>4</b> things to tell them. ⭐ = what the job posting asked for. Be honest... or take a risk?</p>
    <div class="claims">${rows}</div>`,
    [{ label: 'Cancel', cls: 'ghost' },
     { label: 'Tell them!', cls: 'primary', keepOpen: true, fn: () => {
        const picks = [...document.querySelectorAll('.claims input:checked')].map(i => i.value);
        if (picks.length === 0) { nope('Pick at least one thing to tell them.'); return false; }
        if (picks.length > 4) { nope('Only pick up to 4 things — keep it short!'); return false; }
        closeModal();
        doInterview(job, picks);
     } }]);
  // limit to 4 checks
  document.querySelectorAll('.claims input').forEach(cb => cb.addEventListener('change', () => {
    if (document.querySelectorAll('.claims input:checked').length > 4) { cb.checked = false; nope('Only 4 things!'); }
  }));
}

function doInterview(job, picks) {
  pass(1.5, 'awake');
  const notes = [];
  let score = 55;
  const lies = [];
  const n = S.needs;

  if (S.edu < job.edu) {
    notes.push(`❌ They checked your education. This job needs a <b>${EDU_NAMES[job.edu]}</b>. You have a ${EDU_NAMES[S.edu]}.`);
    score = -999;
  }
  if (n.hygiene < 35) { score -= 25; notes.push('🤢 You smelled bad. The manager kept stepping back. (Shower first!)'); }
  else notes.push('🙂 You looked clean and fresh.');
  const dressBonus = [0, 0, 8, 15][S.clothes] || 0;
  if (S.laundryDays > 7) { score -= 10; notes.push('👕 Your clothes were dirty and wrinkled. (Do laundry!)'); }
  else if (dressBonus > 0) { score += dressBonus; notes.push(`👔 You were dressed nicely. (+${dressBonus})`); }
  if (n.energy < 25) { score -= 10; notes.push('🥱 You yawned during the interview.'); }
  if (n.food < 15) { score -= 5; notes.push('🍽️ Your stomach growled loudly.'); }
  const commBonus = Math.round(S.skills.comm / 8);
  if (commBonus > 0) { score += commBonus; notes.push(`🗣️ Your talking skills helped you explain yourself. (+${commBonus})`); }

  for (const r of job.req) {
    const lvl = skillLevel(r.s);
    if (picks.includes(r.s)) {
      if (lvl >= r.lvl) {
        score += 15;
        notes.push(`✅ You said you're good at ${skillName(r.s)} — and it's true! (+15)`);
      } else if (Math.random() < 0.45 + (lvl / r.lvl) * 0.3) {
        score += 12; lies.push(r.s);
        notes.push(`😬 You said you're good at ${skillName(r.s)}... they believed you. (But you're not, really.)`);
      } else {
        score -= 30;
        notes.push(`🙈 You said you're good at ${skillName(r.s)}, so they asked you to show them. You couldn't. (-30)`);
      }
    } else {
      score -= 25;
      notes.push(`❓ They needed ${skillName(r.s)}, but you didn't mention it.${lvl >= r.lvl ? ' <b>You ARE good at it — you should have told them!</b>' : ''} (-25)`);
    }
  }
  for (const p of picks) {
    if (!job.req.find(r => r.s === p)) {
      if (skillLevel(p) >= 20) { score += 3; notes.push(`👍 They liked hearing about your ${skillName(p)}. (+3)`); }
      else notes.push(`🤷 ${skillName(p)} isn't really what they need.`);
    }
  }
  if (!has('phone') && job.pay >= 18 && score >= 60 && Math.random() < 0.25) {
    score = 0;
    notes.push('📵 They wanted to hire you, but couldn\'t reach you because you don\'t have a phone!');
  }

  score += interviewExtras(job, notes);
  const hired = score >= 60;
  if (hired) {
    const prev = S.job;
    if (prev) { if (prev.weekHours > 0) payday(true); log(`👋 You left ${JOBS[prev.id].name} for a new job.`); }
    S.job = { id: job.id, wage: job.pay, startDay: S.day + 1, daysWorked: 0, goodDays: 0, misses: 0, warnings: 0, lies, weekHours: 0 };
    setupWorkplace(S.job); giveBenefits(S.job);
    if (S.family) Object.values(S.family).forEach(m => m.rel = clamp(m.rel + 5));
    text('👩 Mom', `A new job as a ${job.name}?! We're so proud of you! ❤️`);
    if (!S.jobsWorked.includes(job.id)) S.jobsWorked.push(job.id);
    log(`🎉 You got hired as a ${job.name} for ${money(job.pay)}/hour! Start tomorrow.`, 'good');
    unlock('first_job');
    if (S.jobsWorked.length >= 5) unlock('five_jobs');
    if (job.name.startsWith('Pro ')) unlock('pro_athlete');
  } else {
    S.cooldown[job.id] = S.day + 3;
    log(`😞 You didn't get the ${job.name} job.`, 'bad');
  }
  showModal(`<h2>${hired ? '🎉 You\'re Hired!' : '😞 Not This Time'}</h2>
    <p>${hired ? `You are the new <b>${job.name}</b>! Your first day is <b>tomorrow</b> (weekdays). Go to work between 6 and 9 AM.`
                : `The ${job.name} job went to someone else. You can try again in 3 days.`}</p>
    <ul class="notes">${notes.map(x => `<li>${x}</li>`).join('')}</ul>
    ${lies.length ? '<p class="lesson">⚠️ You stretched the truth. If your boss finds out before you really learn those skills, you\'ll be fired!</p>' : ''}`,
    [{ label: 'OK' }]);
  done(false);
}

async function goWork() {
  const j = S.job; if (!j) return;
  const job = JOBS[j.id];
  const sh = shiftNow();
  if (S.day < j.startDay) return nope('Your first day is tomorrow!');
  if (!worksToday()) return nope(S.snowDay ? '❄️ Snow day! Work is closed today.' : holidayToday() && holidayToday().closed ? 'It\'s a holiday — work is closed!' : 'You don\'t work today. Enjoy your day off! 🎉');
  if (S.today.worked) return nope('You already worked today.');
  if (S.today.sick) return nope('You called in sick today. Rest up!');
  if (S.hour < sh.from) return nope(`It's too early. Your shift starts at ${fmtTime(sh.from + 0.5)}.`);
  if (S.hour >= sh.to) return nope('Too late — your shift already started. You could call in sick...');
  if (traveler) return;

  await travelTo(workplaceOf(job), { noDone: true, quiet: true });
  const late = S.hour > sh.late;
  const n = S.needs;
  let perf = (n.energy + n.food + n.hygiene + n.health) / 4 + rand(-8, 10) + S.clothes * 2;
  if (late) perf -= 20;
  if (S.laundryDays > 7) perf -= 8;
  if (n.bladder < 20) perf -= 5;
  if (n.thirst < 20) perf -= 5;
  if (S.ill) perf -= ILLNESS[S.ill.type].perf;
  if (!j.boss) setupWorkplace(j);
  if (j.boss.style === 'strict') perf -= 4; else if (j.boss.style === 'nice') perf += 3;
  S.today.worked = true;
  ensureLife4State(); if (S.outfit !== 'work') { wearOutfit('work', true); log(`🦺 You put on your work ${UNIFORMS[JOBS[j.id].cat] ? 'uniform' : 'clothes'}.`); }
  pass(4, 'work'); lunchAtWork(); pass(4, 'work');
  wearOutfit('casual', true);
  const extra = workEvent(j);
  if (j.daysWorked === 0) firstDayTraining(j);

  j.weekHours += 8; j.daysWorked++;
  job.req.forEach(r => addSkill(r.s, 1.2));

  const msgs = [];
  if (late) msgs.push('⏰ You were late!');
  let fired = false;
  if (perf >= 65) {
    j.goodDays++;
    msgs.push('Great work today! 👏');
    checkPromotion(j);
    if (j.goodDays % 10 === 0) {
      const old = j.wage;
      j.wage = Math.round(j.wage * 1.08 * 100) / 100;
      log(`📈 RAISE! Your boss loves your work. Pay went from ${money(old)} to $${j.wage.toFixed(2)}/hour.`, 'good');
      queueModal(`<h2>📈 You Got a Raise!</h2><p>Your boss noticed how hard you work.</p><p>New pay: <b>$${j.wage.toFixed(2)}/hour</b> (was $${old.toFixed(2)})</p>`);
      unlock('raise');
    }
  } else if (perf < 35) {
    j.warnings++;
    msgs.push(`😠 You did a bad job. Boss warning ${j.warnings}/3.`);
    if (j.warnings >= 3) { log(`${job.name}: ${msgs.join(' ')}`, 'bad'); fire('You did poor work too many times. (Come to work rested, fed and clean!)'); fired = true; }
  } else msgs.push('An OK day at work.');
  if (extra) msgs.push(extra);
  const md = managerDay(j); if (md) msgs.push(md);

  if (!fired) {
    // were you caught lying?
    j.lies = j.lies.filter(s => skillLevel(s) < (job.req.find(r => r.s === s) || { lvl: 0 }).lvl);
    if (j.lies.length && Math.random() < 0.12) {
      log(`${job.name}: ${msgs.join(' ')}`);
      fire(`Your boss found out you can't really do ${skillName(j.lies[0])} like you said in your interview.`);
    } else {
      log(`💼 Worked 8 hours as ${job.name}. ${msgs.join(' ')}`, perf >= 65 ? 'good' : perf < 35 ? 'bad' : '');
    }
  }
  render();
  await travelTo('home', { quiet: true });
}

function callInSick() {
  const j = S.job; if (!j) return;
  if (!worksToday() || S.today.worked) return nope('You don\'t need to call in today.');
  if (S.today.sick) return nope('You already called in.');
  if (useSickDay()) { S.today.sick = true; return done(); }
  if (S.needs.health >= 70 && !S.ill) {
    j.warnings++;
    log(`📞 You called in sick, but you sounded fine. Your boss is suspicious. Warning ${j.warnings}/3.`, 'bad');
    if (j.warnings >= 3) fire('Too many warnings.');
  } else {
    log('📞 You called in sick. Your boss says feel better!');
  }
  S.today.sick = true;
  done();
}

function payday(final = false) {
  const j = S.job;
  if (!j || j.weekHours <= 0) return;
  const gross = j.weekHours * j.wage;
  const fed = gross * 0.10, state = gross * 0.04, fica = gross * 0.0765;
  const net = gross - fed - state - fica;
  S.taxYear.wages += gross; S.taxYear.withheld += fed + state;
  earn(net, `Paycheck from ${JOBS[j.id].name}`);
  log(`💵 Payday! ${j.weekHours} hours × $${j.wage.toFixed(2)} = ${money(gross)}. After taxes you got ${money(net)}.`, 'good');
  queueModal(`<h2>💵 ${final ? 'Final ' : ''}Paycheck</h2>
    <table class="stub">
      <tr><td>${JOBS[j.id].name}: ${j.weekHours} hrs × $${j.wage.toFixed(2)}</td><td>${money(gross)}</td></tr>
      <tr class="minus"><td>Federal income tax (10%)</td><td>-${money(fed)}</td></tr>
      <tr class="minus"><td>State income tax (4%)</td><td>-${money(state)}</td></tr>
      <tr class="minus"><td>Social Security & Medicare (7.65%)</td><td>-${money(fica)}</td></tr>
      <tr class="total"><td>Take-home pay</td><td>${money(net)}</td></tr>
    </table>
    <p class="lesson">💡 "Gross pay" is what you earned. "Net pay" is what you actually take home after taxes. Taxes pay for roads, schools, firefighters, and more.</p>`);
  j.weekHours = 0;
  unlock('first_check');
}

// ---------- weekly bills ----------
function weeklyBills() {
  const h = home();
  const bills = [];
  // housing
  if (h.type === 'rent') {
    if (S.money >= h.rent) { charge(h.rent, `Rent: ${h.name}`); bills.push([`Rent (${h.name})`, h.rent]); S.missedRent = 0; credit(3, 'paid rent on time'); }
    else {
      S.missedRent++; credit(-50, 'missed a rent payment');
      bills.push([`Rent — COULDN'T PAY! (${S.missedRent}/2)`, 0]);
      log(`🏚️ You couldn't pay rent! The landlord is angry. (${S.missedRent}/2)`, 'bad');
      if (S.missedRent >= 2) {
        log('📦 You were EVICTED. You moved back in with your parents.', 'bad');
        queueModal(`<h2>📦 Evicted!</h2><p>You missed rent twice, so the landlord made you leave. You moved back home with your parents.</p><p class="lesson">💡 Rent is usually the most important bill. Pay it first!</p>`);
        S.home = 'parents'; S.missedRent = 0;
      }
    }
    if (S.home !== 'parents') { const wi = Math.round(h.utilities * 0.6), el = electricBill(); charge(wi, 'Water & internet'); bills.push(['Water & internet', wi]); charge(el, 'Electric bill'); bills.push([`Electric bill (${S.kwh.toFixed(1)} kWh used)`, el]); }
  }
  if (h.type !== 'buy' && S.mortgage) {
    const pay = Math.min(S.mortgage.weekly, S.mortgage.balance);
    charge(pay, 'Construction loan payment'); bills.push(['Construction loan payment (for the house you are building)', pay]);
    S.mortgage.balance -= pay; credit(2, 'paid your loan on time');
    if (S.mortgage.balance <= 0.5) { S.mortgage = null; log('🎉 You paid off your loan!', 'good'); }
  }
  if (h.type === 'buy') {
    if (S.mortgage) {
      const pay = Math.min(S.mortgage.weekly, S.mortgage.balance);
      charge(pay, 'Mortgage payment'); bills.push(['Mortgage payment', pay]);
      S.mortgage.balance -= pay;
      if (S.mortgage.balance <= 0.5) { S.mortgage = null; log('🎉 You paid off your mortgage! You own your house completely!', 'good'); }
    }
    charge(h.upkeep, 'Property tax, water & internet'); bills.push(['Property tax, water & internet', h.upkeep]);
    const el = electricBill(); charge(el, 'Electric bill'); bills.push([`Electric bill (${S.kwh.toFixed(1)} kWh used)`, el]);
    if (S.mortgage) credit(3, 'paid your mortgage on time');
  }
  if (S.home === 'parents' && S.kwh > 25) log('👩 Mom says: "Turn off the lights when you leave a room! The electric bill was huge."');
  S.kwh = 0;
  if (has('phone')) { charge(20, 'Phone bill'); bills.push(['Phone bill', 20]); }
  realWeekly(bills);
  waterWeekly(bills);
  money2Weekly();
  if (has('car')) { charge(35, 'Car insurance'); bills.push(['Car insurance', 35]); }
  if (has('newcar')) { charge(45, 'New car insurance'); bills.push(['New car insurance', 45]); }
  if (S.insurance && !(S.job && JOBS[S.job.id].insurance)) { charge(35, 'Health insurance'); bills.push(['Health insurance', 35]); }
  // bank
  if (S.loan > 0) {
    const interest = S.loan * loanRate();
    credit(S.loan > loanLimit() * 0.6 ? -5 : 2, 'loan payments');
    S.loan += interest;
    bills.push([`Loan interest added (${(loanRate() * 100).toFixed(1)}%, from your credit score) — you now owe ${money(S.loan)}`, 0]);
    const min = Math.min(S.loan, Math.max(20, S.loan * 0.05));
    charge(min, 'Loan minimum payment'); S.loan -= min;
    bills.push(['Loan minimum payment', min]);
    if (S.loan < 0.5) { S.loan = 0; unlock('debt_free'); }
  }
  if (S.savings > 0) {
    const int = S.savings * 0.005;
    S.savings += int;
    S.week.lines.push({ label: 'Savings interest (0.5%)', amount: int });
  }

  // weekly summary
  const w = S.week;
  const total = bills.reduce((a, b) => a + b[1], 0);
  queueModal(`<h2>🧾 Monday: Bills Are Due</h2>
    <table class="stub">${bills.length ? bills.map(b => `<tr class="minus"><td>${b[0]}</td><td>${b[1] ? '-' + money(b[1]) : ''}</td></tr>`).join('')
      : '<tr><td>No bills this week! (Living with parents is cheap.)</td><td></td></tr>'}
      <tr class="total"><td>Total bills</td><td>${money(total)}</td></tr></table>
    <h3>Last week's budget</h3>
    <table class="stub">
      <tr><td>Money in</td><td class="plus">+${money(w.income)}</td></tr>
      <tr><td>Money out (before these bills)</td><td class="minus">-${money(w.expenses - total)}</td></tr>
    </table>
    <p>You now have <b>${money(S.money)}</b>${S.savings > 0 ? ` and ${money(S.savings)} in savings` : ''}.</p>
    ${S.money < 0 ? '<p class="lesson">⚠️ You have negative money! Find work or cut spending fast.</p>' : ''}
    ${budgetReport()}<p class="muted">📈 Credit score: ${S.credit} (${creditWord()})</p>`);
  if (S.money >= 0) credit(2, 'all bills paid');
  S.week = { income: 0, expenses: 0, lines: [], cats: {} };
  moneyWeekly();
}

// ---------- random events ----------
function dailyEvent() {
  if (S.plaque >= S.cavityAt) {
    const cost = S.insurance || (S.job && JOBS[S.job.id].insurance) ? 40 : 250;
    charge(cost, 'Dentist: cavity filled');
    S.plaque = 0; S.cavityAt = 60 + Math.floor(Math.random() * 31);
    S.needs.health = clamp(S.needs.health - 10);
    queueModal(`<h2>🦷 Ouch, a Cavity!</h2><p>Your tooth started to hurt. You haven't been brushing enough for a long time, so the dentist had to fill a cavity.</p><p>Bill: <b>${money(cost)}</b></p><p class="lesson">💡 Brush for 2 minutes, twice a day: after breakfast and after dinner. Brushing is free. Fixing cavities is not!</p>`);
    log(`🦷 Cavity! Dentist bill ${money(cost)}.`, 'bad');
    return;
  }
  if (Math.random() > 0.28) return;
  const ev = [];
  ev.push({ w: 3, f: () => { earn(20, 'Found money'); return ['💵 Lucky Day', 'You found $20 on the sidewalk!', '']; } });
  ev.push({ w: S.needs.hygiene < 40 ? 5 : 2, f: () => { S.needs.fun = clamp(S.needs.fun + 4); return ['☀️ Nice Day', 'You took a deep breath of fresh air and felt great.', '']; } });
  ev.push({ w: 2, f: () => { earn(50, 'Birthday card from Grandma'); return ['💌 Card from Grandma', 'Grandma sent you a card with $50 inside!', '']; } });
  ev.push({ w: 2, f: () => { charge(60, 'Gift for friend\'s wedding'); return ['💒 Wedding Invite', 'Your friend is getting married. You bought a $60 gift.', 'Some expenses are surprises. That\'s why saving matters.']; } });
  ev.push({ w: 2, f: () => { S.needs.fun = clamp(S.needs.fun + 20); return ['🎉 Party!', 'Your friends threw a party. Fun +20!', '']; } });
  if (has('car') && !has('newcar')) ev.push({ w: 3, f: () => { charge(400, 'Car repair'); return ['🔧 Car Trouble', 'Your used car broke down. Repair: $400.', 'Older cars cost less to buy, but need more repairs.']; } });
  if (has('car') || has('newcar')) ev.push({ w: 1, f: () => { charge(45, 'Parking ticket'); return ['🅿️ Parking Ticket', 'You parked in the wrong spot. $45 ticket!', '']; } });
  if (has('phone')) ev.push({ w: 1, f: () => { charge(120, 'Phone screen repair'); return ['📱 Cracked Screen', 'You dropped your phone. Repair: $120.', '']; } });
  if (home().type === 'buy') ev.push({ w: 2, f: () => { charge(600, 'Home repair: broken pipe'); return ['🚰 Broken Pipe!', 'A pipe burst in your house. The plumber charged $600.', 'Homeowners pay for their own repairs.']; } });
  if (home().type === 'rent') ev.push({ w: 2, f: () => ['🚰 Leaky Sink', 'Your sink broke. The landlord fixed it for free!', 'When you rent, the landlord pays for most repairs.'] });
  if (!S.taxRefundDone && S.day > 40 && S.jobsWorked.length) ev.push({ w: 5, f: () => { S.taxRefundDone = true; earn(300, 'Tax refund'); return ['📬 Tax Refund', 'The government says you paid a little too much tax last year. Here\'s $300 back!', 'Each year people file a "tax return" to check if they paid the right amount.']; } });
  ev.push({ w: 2, f: () => { S.needs.fun = clamp(S.needs.fun + 10); addSkill('comm', 2); return ['🙋 Volunteering', 'You helped at the food bank. You feel good and made new friends.', 'Helping others is a big part of life too.']; } });

  moneyEvents(ev);
  const total = ev.reduce((a, e) => a + e.w, 0);
  let r = Math.random() * total;
  for (const e of ev) {
    r -= e.w;
    if (r <= 0) {
      const [title, text, lesson] = e.f();
      log(`${title}: ${text}`);
      queueModal(`<h2>${title}</h2><p>${text}</p>${lesson ? `<p class="lesson">💡 ${lesson}</p>` : ''}`);
      return;
    }
  }
}

// ---------- body ----------
function ateFood(amount) {
  S.needs.food = clamp(S.needs.food + amount);
  S.needs.bladder = clamp(S.needs.bladder - 8);   // you drink something with your meal
  if (S.handsDirty && Math.random() < 0.3) {
    S.needs.health = clamp(S.needs.health - 15);
    S.needs.fun = clamp(S.needs.fun - 10);
    log('🤢 You got a tummy ache. You ate without washing your hands after using the toilet!', 'bad');
    if (Math.random() < 0.35) getSick('stomach');
    toast('🤢 Tummy ache! Wash your hands before eating.', 'bad');
  }
}
function useToilet() {
  if (atHome() && S.broken && S.broken.kind === 'toilet') return nope('🚽 The toilet at home is clogged! Fix it (or call someone), or use a restroom in town.');
  pass(0.1);
  const before = S.needs.bladder;
  S.needs.bladder = 100;
  S.handsDirty = true;
  log(before > 70 ? '🚽 You used the toilet (you didn\'t really need to).' : '🚽 You used the toilet. Ahh, much better!');
  toast('🧼 Now wash your hands!');
}
function washHands() {
  pass(0.04);
  S.handsDirty = false;
  S.needs.hygiene = clamp(S.needs.hygiene + 3);
  log('🧼 You washed your hands with soap. Germs gone!');
}

// ---------- town places ----------
function seeDoctor() {
  if (S.hour < 7 || S.hour > 21) return nope('The clinic is open 7 AM to 10 PM. (The emergency room is always open if your health hits zero.)');
  const insured = S.insurance || (S.job && JOBS[S.job.id].insurance);
  const cost = insured ? 20 : 150;
  if (!spend(cost, 'Doctor visit')) return;
  pass(1.5);
  S.needs.health = clamp(S.needs.health + 45);
  if (S.ill) { S.ill.days = Math.max(1, Math.ceil(S.ill.days / 2)); log(`🩺 The doctor checked your ${ILLNESS[S.ill.type].name.toLowerCase()} and gave you a plan to get better faster.`); }
  log(`🩺 The doctor checked you out and gave you medicine. Health +45. Cost: ${money(cost)}${insured ? ' (insurance helped!)' : ''}.`, 'good');
  done();
}
const PARK_ACTIONS = [
  { id: 'walk', icon: '🚶', name: 'Walk Around the Lake', hint: '1 hr · free · fun & fitness',
    fn: () => { pass(1, 'relax'); addSkill('fit', 1); S.needs.health = clamp(S.needs.health + 2); log('🌳 You walked around the lake. Fresh air!'); } },
  { id: 'ducks', icon: '🦆', name: 'Feed the Ducks', hint: '30 min · $2 for duck food',
    fn: () => { if (!spend(2, 'Duck food')) return; pass(0.5, 'relax'); S.needs.fun = clamp(S.needs.fun + 8); log('🦆 You fed the ducks. They quacked happily!'); } },
  { id: 'friends', icon: '🧑‍🤝‍🧑', name: 'Hang Out with Friends', hint: '2 hrs · free · fun & talking skill',
    fn: () => { pass(2, 'relax'); S.needs.fun = clamp(S.needs.fun + 10); addSkill('comm', 1.5); log('😄 You hung out with friends at the park.'); } },
  { id: 'picnic', icon: '🧺', name: 'Have a Picnic', hint: '1 hr · uses 1 grocery meal',
    fn: () => { if (S.groceries < 1) return nope('Pack food first — you have no groceries.'); S.groceries--; pass(1, 'relax'); ateFood(40); S.needs.fun = clamp(S.needs.fun + 8); log('🧺 You had a picnic by the lake.'); } },
  { id: 'playground', icon: '🛝', name: 'Play on the Playground', hint: '1 hr · free · you\'re never too old!',
    fn: () => { if (S.needs.energy < 15) return nope('Too tired to play.'); pass(1, 'sport'); S.needs.fun = clamp(S.needs.fun + 12); addSkill('fit', 1); log('🛝 You went down the slide and swung on the swings!'); } },
];

function brushTeeth() {
  pass(2 / 60);
  if (S.water) S.water.gallons += S.water.tapOff ? 0.5 : 4;
  S.needs.hygiene = clamp(S.needs.hygiene + 6);
  const morning = S.hour >= 4 && S.hour < 15;
  const slot = morning ? 'brushAM' : 'brushPM';
  const again = S.today[slot];
  S.today[slot] = true; S.today.brushed = true;
  const both = S.today.brushAM && S.today.brushPM;
  log(again ? '🪥 You brushed your teeth for 2 minutes again. Extra sparkly!'
    : `🪥 You brushed your teeth for 2 whole minutes ${morning ? 'after breakfast' : 'after dinner'}.${both ? ' That\'s twice today! ⭐' : ''}`);
}
function teethStatus() {
  const r = (S.plaque || 0) / (S.cavityAt || 75);
  if (r < 0.2) return ['✨', 'Sparkling clean', 'good'];
  if (r < 0.45) return ['🙂', 'A little dirty', ''];
  if (r < 0.75) return ['😬', 'Getting yellow', 'warn'];
  return ['😣', 'A cavity is coming!', 'warn'];
}
function dentistClean() {
  if (S.hour < 8 || S.hour > 17) return nope('The dentist is open 8 AM to 5 PM.');
  const insured = S.insurance || (S.job && JOBS[S.job.id].insurance);
  const cost = insured ? 15 : 90;
  if (!spend(cost, 'Dentist cleaning')) return;
  pass(1);
  S.plaque = 0;
  log(`🦷 The dentist cleaned your teeth. They're sparkling! Cost: ${money(cost)}.`, 'good');
  done();
}

// ---------- home actions ----------
const HOME_ACTIONS = [
  { id: 'eat', icon: '🍽️', name: 'Eat a Meal', hint: 'Uses 1 grocery meal · 30 min',
    fn: () => { if (S.groceries < 1) return nope('No food at home! Buy groceries at the 🛒 Supermarket.'); S.groceries--; pass(0.5); ateFood(40); if (hasF('table')) S.needs.fun = clamp(S.needs.fun + 3); log(hasF('table') ? '🍽️ You ate a meal at the table.' : '🍽️ You ate a meal sitting on the floor. (A table would be nice!)'); } },
  { id: 'cook', icon: '🍳', name: 'Cook a Meal', hint: 'Uses 1 meal · 1 hr · better food & cooking skill',
    fn: () => { if (!hasF('stove')) return nope('You need a stove to cook! Buy one at the 🛍️ Mall.'); if (S.groceries < 1) return nope('No groceries to cook with!'); S.groceries--; pass(1); ateFood(40 + S.skills.cook / 4); S.needs.fun = clamp(S.needs.fun + 5); S.needs.health = clamp(S.needs.health + 3); addSkill('cook', 2); log('🍳 You cooked a tasty meal. Cooking skill up!'); } },
  { id: 'drink', icon: '💧', name: 'Drink Water', hint: '2 min · from the tap',
    fn: () => drink('tap') },
  { id: 'makebed', icon: '🛏️', name: 'Make Your Bed', hint: '5 min · chore chart ⭐',
    fn: () => makeBed() },
  { id: 'homework', icon: '📝', name: 'Do Homework at Your Desk', hint: () => has('desk') ? '1 hr · Math, Writing, Science' : 'Needs a desk (Mall)',
    fn: () => realHomework() },
  { id: 'music', icon: '🎹', name: 'Practice Music', hint: () => Object.values(INSTRUMENTS).some(i => has(i[2])) ? '30 min · keep your streak!' : 'Needs an instrument (Mall)',
    fn: () => practiceMusic() },
  { id: 'birds', icon: '🐦', name: 'Watch the Bird Feeder', hint: () => has('birdfeeder') ? `30 min · ${S.hob ? S.hob.journal.length : 0} kinds spotted` : 'Needs a bird feeder (Mall)',
    fn: () => watchBirds() },
  { id: 'kittens', icon: '🍼', name: 'Feed Foster Kittens', hint: () => S.hob && S.hob.foster ? `${S.hob.foster.n} kittens · 30 min` : 'Foster kittens at the Pet Shop',
    fn: () => feedKittens() },
  { id: 'gamenight', icon: '🎲', name: 'Host Game Night', hint: '5–10 PM · neighbors, family & friends',
    fn: () => gameNight() },
  { id: 'photo', icon: '📷', name: 'Take a Photo', hint: () => has('camera') ? `${S.hob ? S.hob.photos.length : 0} in your album` : 'Needs a camera (Mall)',
    fn: () => takePhoto() },
  { id: 'mailbox', icon: '📬', name: 'Check the Mailbox', hint: () => { const n = S.mail ? unreadMail() : 0; return n ? `${n} new!` : 'Letters, bills, packages'; },
    fn: () => mailbox() },
  { id: 'libbook', icon: '📚', name: 'Read a Library Book', hint: () => S.lib && S.lib.books.length ? `${S.lib.books.length} borrowed · 1 hr` : 'Borrow free books at the Library',
    fn: () => readLibraryBook() },
  { id: 'shoponline', icon: '🛒', name: 'Shop Online', hint: 'Needs a phone or laptop · arrives in 2–4 days',
    fn: () => shopOnline() },
  { id: 'yardsale', icon: '🏷️', name: 'Have a Yard Sale', hint: 'Saturdays 7 AM – noon · sell old stuff',
    fn: () => yardSale() },
  { id: 'firedrill', icon: '🚒', name: 'Practice a Fire Drill', hint: () => S.safety && S.safety.drill ? '✅ You know what to do!' : '30 min · learn fire safety',
    fn: () => fireDrill() },
  { id: 'toys', icon: '🧸', name: 'Play With Toys', hint: () => { ensureToyState(); const n = toyCount(); return n ? `${n} toy${n > 1 ? 's' : ''} in your toy box` : 'Buy toys at the Mall'; },
    fn: () => toyBox() },
  { id: 'dinnerparty', icon: '🍽️', name: 'Invite Friends to Dinner', hint: () => S.friends && S.friends.length ? `5–9 PM · ${S.friends.length} friends to invite` : 'Make some friends first!',
    fn: () => dinnerParty() },
  { id: 'recipe', icon: '👩‍🍳', name: 'Cook a Recipe', hint: () => `Real ingredients · ${S.fridgeFood.length} items in your kitchen`,
    fn: () => recipeModal() },
  { id: 'snack', icon: '🍿', name: 'Have a Snack', hint: () => `Fruit, chips, cereal, pizza · you have ${Object.values(S.pantry).reduce((a, v) => a + v, 0)}`,
    fn: () => snackMenu() },
  { id: 'toilet', icon: '🚽', name: 'Use the Toilet', hint: () => hasF('toilet') ? '5 min · don\'t forget to flush!' : '⚠️ You don\'t have a toilet!',
    fn: () => { if (homeToilet()) useToilet(); } },
  { id: 'hands', icon: '🧼', name: 'Wash Your Hands', hint: '2 min · stops germs',
    fn: () => washHands() },
  { id: 'shower', icon: '🚿', name: 'Take a Shower', hint: () => hasF('shower') ? '30 min' : '⚠️ You don\'t have a shower!',
    fn: () => homeShowerChoice() },
  { id: 'bath', icon: '🛁', name: 'Bubble Bath', hint: '1 hr · clean & relaxed', need: 'bathtub',
    fn: () => takeBath() },
  { id: 'teeth', icon: '🪥', name: 'Brush Teeth', hint: () => `2 min · ${S.today.brushAM ? '✅' : '⬜'} after breakfast · ${S.today.brushPM ? '✅' : '⬜'} after dinner`,
    fn: () => brushTeeth() },
  { id: 'sleep', icon: '😴', name: 'Go to Bed', hint: 'Sleep until 7 AM',
    fn: () => { const h = S.hour < 7 ? 7 - S.hour : 31 - S.hour; if (h > 14) return nope('It\'s too early to go to bed. Try a nap instead.'); pass(h, 'sleep'); log(`😴 You went to bed and slept ${h.toFixed(1)} hours.`); } },
  { id: 'nap', icon: '💤', name: 'Take a Nap', hint: '2 hours',
    fn: () => { pass(2, 'sleep'); log('💤 You took a nap.'); } },
  { id: 'laundry', icon: '🧺', name: 'Do Laundry', hint: () => hasF('washer') ? 'Free at home · 1 hr' : 'Laundromat $8 · 2 hrs',
    fn: () => { if (!hasF('washer')) { if (!spend(8, 'Laundromat')) return; pass(2); } else pass(1); S.laundryDays = 0; log('🧺 Your clothes are clean!'); } },
  { id: 'clean', icon: '🧹', name: 'Vacuum & Tidy', hint: () => `45 min · mess: ${Math.round(S.mess)}%`,
    fn: () => vacuum() },
  { id: 'dishes', icon: '🍽️', name: 'Wash the Dishes', hint: () => `${S.dishes} dirty dishes`,
    fn: () => doDishes() },
  { id: 'trash', icon: '🗑️', name: 'Take Out the Trash', hint: () => `Trash is ${Math.round(S.trash)}% full · sort it!`,
    fn: () => takeOutTrash() },
  { id: 'meds', icon: '💊', name: 'Take Medicine', hint: () => S.ill ? `${S.medicine} doses · you're sick` : `${S.medicine} doses · only when sick`,
    fn: () => takeMedicine() },
  { id: 'tv', icon: '📺', name: 'Watch TV', hint: '2 hrs · needs TV', need: 'tv',
    fn: () => { pass(2, 'relax'); log('📺 You watched TV and relaxed.'); } },
  { id: 'games', icon: '🎮', name: 'Play Video Games', hint: '2 hrs · needs console', need: 'console',
    fn: () => { pass(2, 'relax'); S.needs.fun = clamp(S.needs.fun + 8); log('🎮 You played video games. So fun!'); } },
  { id: 'laptop', icon: '💻', name: 'Practice on Laptop', hint: '2 hrs · Computers skill', need: 'laptop',
    fn: () => { pass(2, 'study'); const g = addSkill('comp', 4); log(`💻 You practiced coding. Computers +${g.toFixed(1)}`); } },
  { id: 'read', icon: '📖', name: 'Read a Book', hint: '1 hr · Writing skill',
    fn: () => { pass(1, 'relax'); addSkill('write', has('bookshelf') ? 2.5 : 1.5); log(has('bookshelf') ? '📖 You read a book from your bookshelf.' : '📖 You read a good book.'); } },
  { id: 'run', icon: '🏃', name: 'Exercise', hint: '1 hr · Fitness skill · free',
    fn: () => { if (S.needs.energy < 15) return nope('Too tired to exercise.'); pass(1, 'sport'); addSkill('fit', 2.5); S.needs.health = clamp(S.needs.health + 3); log('🏃 You exercised. Fitness up! (Better shower now...)'); } },
  { id: 'friend', icon: '📞', name: 'Call a Friend', hint: '1 hr · Fun & talking skill',
    fn: () => { pass(1, 'relax'); S.needs.fun = clamp(S.needs.fun + 6); addSkill('comm', 1); log('📞 You called a friend and talked for an hour.'); } },
  { id: 'wait', icon: '⏳', name: 'Wait 1 Hour', hint: 'Pass time',
    fn: () => { pass(1); } },
];

// ---------- school ----------
function takeClass(skill) {
  if (S.hour < 8 || S.hour > 20) return nope('Classes run from 8 AM to 9 PM.');
  if (S.needs.energy < 15) return nope('You\'re too tired to learn. Get some sleep!');
  const sk = SKILLS[skill];
  if (!spend(sk.price, `${sk.name} class`)) return;
  pass(2, 'study');
  const g = addSkill(skill, 7);
  log(`🏫 You took a ${sk.name} class. Skill +${g.toFixed(1)}`, 'good');
  done();
}
function library(skill) {
  if (S.hour < 8 || S.hour > 20) return nope('The library is open 8 AM to 9 PM.');
  if (S.needs.energy < 15) return nope('You\'re too tired to study.');
  pass(3, 'study');
  const g = addSkill(skill, 3);
  log(`📚 You studied ${SKILLS[skill].name} at the library for free. Skill +${g.toFixed(1)}`);
  done();
}
function attendSchool(lvl) {
  const e = EDUCATION.find(x => x.level === lvl);
  if (S.edu < e.needs) return nope(`You need a ${EDU_NAMES[e.needs]} first.`);
  if (S.edu >= lvl) return nope('You already finished this!');
  if (S.hour < 8 || S.hour > 18) return nope('Classes are from 8 AM to 6 PM.');
  if (S.needs.energy < 20) return nope('Too tired for class!');
  if (S.money < e.price) { S.studentLoan = (S.studentLoan || 0) + e.price; log(`📚 A student loan paid your ${money(e.price)} tuition. You'll pay it back after school. (You owe ${money(S.studentLoan)})`); }
  else if (!spend(e.price, `${e.name} tuition`)) return;
  pass(e.hours, 'study');
  S.eduProgress[lvl]++;
  ['math', 'write', 'sci', 'comp', 'comm'].forEach(s => addSkill(s, lvl === 2 ? 1.3 : 1.6));
  if (S.eduProgress[lvl] >= e.sessions) {
    S.edu = lvl;
    unlock(lvl === 2 ? 'college' : 'grad');
    log(`🎓 GRADUATION! You earned your ${EDU_NAMES[lvl]}!`, 'good');
    graduationCeremony(lvl);
  } else log(`🎒 You went to ${e.name}. (${S.eduProgress[lvl]}/${e.sessions} classes)`);
  done();
}

// ---------- sports ----------
function buyGear(sp) {
  const g = SPORTS[sp].gear;
  if (!spend(g.price, g.name)) return;
  S.owned['gear_' + sp] = true;
  log(`🛍️ You bought a ${g.name}.`);
  done();
}
function sportReady(sp) {
  const s = SPORTS[sp];
  if (s.gear && !S.owned['gear_' + sp]) { nope(`You need a ${s.gear.name} first!`); return false; }
  if (S.hour < 6 || S.hour > 21) { nope('Sports places are open 6 AM to 10 PM.'); return false; }
  if (S.needs.energy < 20) { nope('You\'re too tired to play. Rest first!'); return false; }
  if (S.ill && S.ill.type === 'arm') { nope('🦾 Your arm is in a cast. No sports until it heals!'); return false; }
  return true;
}
function trySport(sp) {
  S.sportsTried[sp] = true;
  const n = Object.keys(S.sportsTried).length;
  if (n >= 3) unlock('sport_try');
  if (n >= 7) unlock('all_sports');
}
function practice(sp) {
  const s = SPORTS[sp];
  if (!sportReady(sp)) return;
  if (s.practiceFee && !spend(s.practiceFee, `${s.name}: ${s.practiceWhere}`)) return;
  pass(2, 'sport');
  const g = addSkill(sp, 1.8);
  sportsInjury();
  addSkill('fit', 1);
  trySport(sp);
  log(`${s.icon} You practiced ${s.name} on your own. +${g.toFixed(1)}`);
  done();
}
function lesson(sp, pro) {
  const s = SPORTS[sp];
  if (!sportReady(sp)) return;
  if (pro && S.sports[sp] < 40) return nope('The pro coach only trains players at level 40+.');
  const price = pro ? s.pro : s.lesson;
  if (!spend(price + (s.practiceFee || 0), `${s.name} ${pro ? 'pro coach' : 'lesson'}`)) return;
  pass(2, 'sport');
  const g = addSkill(sp, pro ? 6.5 : 4.5);
  sportsInjury();
  addSkill('fit', 1.5);
  trySport(sp);
  log(`${s.icon} ${pro ? 'Your PRO coach' : 'Your coach'} taught you new ${s.name} skills! +${g.toFixed(1)}`, 'good');
  done();
}
function tournament(sp, tid) {
  const s = SPORTS[sp], t = TOURNAMENTS.find(x => x.id === tid);
  if (!isWeekend()) return nope('Tournaments are on weekends (Saturday & Sunday).');
  if (S.hour < 7 || S.hour > 13) return nope('Tournaments start between 7 AM and 1 PM.');
  if (S.today['t_' + sp]) return nope(`You already played a ${s.name} tournament today.`);
  if (!sportReady(sp)) return;
  if (!spend(t.fee, `${t.name} entry fee`)) return;
  S.today['t_' + sp] = true;
  trySport(sp);

  const rounds = ['Quarterfinal', 'Semifinal', 'Final'];
  const lines = [];
  let place = 0;
  for (let i = 0; i < 3; i++) {
    const opp = clamp(t.opp + i * 5 + rand(-10, 10), 1, 99);
    const me = S.sports[sp] + (S.needs.energy - 60) / 8 + (S.skills.fit - 20) / 10 + rand(-6, 6);
    const pWin = 1 / (1 + Math.exp(-(me - opp) / 7));
    const win = Math.random() < pWin;
    lines.push(`<li class="${win ? 'win' : 'loss'}">${rounds[i]} vs. opponent (level ${Math.round(opp)}): <b>${win ? 'WON ✅' : 'Lost ❌'}</b></li>`);
    S.needs.energy = clamp(S.needs.energy - 12);
    if (!win) { place = i === 2 ? 2 : (i === 1 ? 3 : 5); break; }
    if (i === 2) place = 1;
  }
  pass(5, 'sport');
  addSkill(sp, 1.5);
  sportsInjury();
  let prize = 0;
  if (place === 1) prize = t.prize1; else if (place === 2) prize = t.prize2;
  if (prize) earn(prize, `${t.name} prize`);
  const medal = { 1: '🥇 1st place!', 2: '🥈 2nd place!', 3: '🥉 Made the semifinals', 5: 'Out in the first round' }[place];
  if (place === 1) {
    sponsorChance(sp, tid);
    S.trophies.push({ sport: sp, t: tid, day: S.day });
    unlock('tourney');
    if (tid === 'national') unlock('national');
  }
  log(`${s.icon} ${t.name} (${s.name}): ${medal}${prize ? ` Won ${money(prize)}!` : ''}`, place <= 2 ? 'good' : '');
  showModal(`<h2>${s.icon} ${t.name}</h2><ul class="bracket">${lines.join('')}</ul>
    <h3>${medal}</h3>${prize ? `<p>Prize money: <b>${money(prize)}</b> 🏆</p>` : ''}
    ${place > 1 ? '<p class="lesson">💡 Keep practicing and taking lessons. Getting good takes time!</p>' : ''}`, [{ label: 'OK' }]);
  done(false);
}

// ---------- shop ----------
function buy(itemId) {
  const it = ITEMS.find(i => i.id === itemId);
  if (S.hour < 8 || S.hour > 22) return nope('Stores are open 8 AM to 10 PM.');
  if (it.clothes && S.clothes >= it.clothes) return nope('You already have clothes this nice.');
  if (!it.consumable && !it.clothes && has(it.id)) return nope('You already own this.');
  if ((it.id === 'car' || it.id === 'newcar') && !S.license) return nope('You need a driver\'s license first! Get one at the 🪪 License Office.');
  const cost = taxedPlace(it) ? withTax(it.price) : it.price;
  if (!spend(cost, it.name + (cost !== it.price ? ` (${money(it.price)} + ${money(cost - it.price)} tax)` : ''))) return;
  pass(0.5);
  if (it.id === 'groceries') { S.groceries += 7; log('🛒 You bought groceries. 7 meals at home!'); }
  else if (it.id === 'fastfood') { ateFood(45); S.needs.health = clamp(S.needs.health - 1); log('🍔 You ate fast food. Yum, but greasy.'); }
  else if (it.id === 'salad') { ateFood(40); S.needs.health = clamp(S.needs.health + 4); log('🥗 You ate a healthy lunch.'); }
  else if (it.id === 'pancakes') { ateFood(35); S.needs.fun = clamp(S.needs.fun + 6); log('🥞 You ate a big stack of pancakes!'); }
  else if (it.id === 'milkshake') { S.needs.bladder = clamp(S.needs.bladder - 15); S.needs.fun = clamp(S.needs.fun + 10); S.needs.food = clamp(S.needs.food + 10); log('🥤 You drank a milkshake. Delicious!'); }
  else if (moneyBuy(it.id) || homeBuy(it.id) || toyBuy(it.id)) { /* supplies, snacks, toys */ }
  else if (it.id === 'gift') { S.giftsBought = (S.giftsBought || 0) + 1; log('🎁 You bought a gift and wrapped it with a bow.'); }
  else if (it.clothes) { S.clothes = it.clothes; S.laundryDays = 0; log(`${it.icon} You bought ${it.name}. Looking good!`); }
  else {
    S.owned[it.id] = true;
    log(`${it.icon} You bought a ${it.name}!${it.bill ? ` (Bill: ${money(it.bill)}/week)` : ''}`, 'good');
    if (it.id === 'car' || it.id === 'newcar') { unlock('car'); S.fuel = 100; S.car = { miles: it.id === 'newcar' ? 12 : 62000, oilAt: it.id === 'newcar' ? 12 : 62000, dirty: 0 }; }
  }
  afterBuyHome(it);
  done();
}
function sellItem(itemId) {
  const it = ITEMS.find(i => i.id === itemId);
  const val = Math.round(it.price * 0.4);
  confirmModal(`Sell your ${it.name} for ${money(val)}? (Used things sell for less than you paid.)`, () => {
    delete S.owned[it.id];
    earn(val, `Sold ${it.name}`);
    log(`💲 You sold your ${it.name} for ${money(val)}.`);
    done();
  });
}

// ---------- housing ----------
function weeklyIncome() { return S.job ? S.job.wage * 40 * 0.78 : 0; }

function moveTo(hid) {
  const h = HOMES[hid];
  if (hid === S.home) return;
  if (S.home !== 'parents' && home().type === 'buy') return nope('Sell your house first.');
  if (!petsOkFor(hid)) return;
  if (h.type === 'free') {
    confirmModal('Move back in with your parents? (No rent, but less fun.)', () => { S.home = 'parents'; log('🏡 You moved back home.'); pass(3); done(); });
    return;
  }
  if (h.type === 'rent') {
    const need = h.rent * 2.5;
    if (S.credit < 500) return showModal(`<h2>🏢 Application Denied</h2><p>The landlord checked your credit score (<b>${S.credit}</b>) and said no.</p><p class="lesson">💡 Pay bills on time to raise your credit score. Landlords want to know you'll pay rent!</p>`, [{ label: 'OK' }]);
    if (weeklyIncome() < need && S.money + S.savings < h.rent * 12) {
      return showModal(`<h2>🏢 Application Denied</h2><p>The landlord says you need to earn at least <b>${money(need)}/week</b> after taxes, or have ${money(h.rent * 12)} saved.</p><p>You earn ${money(weeklyIncome())}/week.</p><p class="lesson">💡 Landlords check your income to make sure you can pay rent. Most want rent to be less than 1/3 of your pay.</p>`, [{ label: 'OK' }]);
    }
    const upfront = h.rent * 2;
    confirmModal(`Rent the <b>${h.name}</b>?<br>Move-in cost: <b>${money(upfront)}</b> (first week + security deposit).<br>Then ${money(h.rent)} rent + ${money(h.utilities)} utilities every Monday.`, () => {
      if (!spend(upfront, `Move in: ${h.name}`)) return;
      S.home = hid; S.missedRent = 0;
      pass(1); startMovingDay();
      homeWelcome();
      log(`🔑 You moved into a ${h.name}!`, 'good');
      unlock('moved_out');
      done();
    });
    return;
  }
  // buy
  const down = h.price * 0.1;
  const loanAmt = h.price - down;
  const total = loanAmt * 1.4;
  const weekly = Math.round(total / 520);
  const canCash = S.money >= h.price;
  showModal(`<h2>${h.icon} Buy a ${h.name}</h2><p>Price: <b>${money(h.price)}</b></p>
    <p><b>Option 1: Pay cash</b> — ${money(h.price)} now. No mortgage!</p>
    <p><b>Option 2: Mortgage</b> (a loan for a house) — ${money(down)} down payment now, then <b>${money(weekly)}/week</b> for 10 years.
    You'd pay ${money(total + down)} total because of interest.</p>
    <p>Either way: ${money(h.upkeep)}/week for property tax & utilities.</p>
    <p class="lesson">💡 Banks want your weekly payment to be less than 40% of your income. You earn ${money(weeklyIncome())}/week.</p>`,
    [{ label: 'Cancel', cls: 'ghost' },
     { label: 'Mortgage', fn: () => {
        if (S.credit < 620) { queueModal(`<h2>🏦 Mortgage Denied</h2><p>Your credit score is <b>${S.credit}</b>. Banks want at least <b>620</b> for a home loan.</p><p class="lesson">💡 A good credit score comes from paying bills on time for a long time.</p>`); return done(); }
        if (weeklyIncome() * 0.4 < weekly) { queueModal(`<h2>🏦 Mortgage Denied</h2><p>The bank says your income is too low for a ${money(weekly)}/week payment. You need to earn at least ${money(weekly / 0.4)}/week.</p>`); return done(); }
        if (!spend(down, `Down payment: ${h.name}`)) return;
        S.mortgage = { balance: total, weekly };
        finishBuy(hid);
     } },
     { label: `Pay Cash`, cls: canCash ? 'primary' : 'ghost', fn: () => {
        if (!spend(h.price, `Bought ${h.name}`)) return;
        S.mortgage = null;
        finishBuy(hid);
     } }]);
}
function finishBuy(hid) {
  S.home = hid; S.missedRent = 0;
  homeWelcome();
  pass(2); startMovingDay();
  log(`🏠 You bought a ${HOMES[hid].name}! Welcome home!`, 'good');
  unlock('homeowner'); unlock('moved_out');
  done();
}
function sellHouse() {
  const h = home();
  const val = h.price * 0.95;
  const owe = S.mortgage ? S.mortgage.balance : 0;
  confirmModal(`Sell your ${h.name} for ${money(val)}? ${owe ? `You still owe ${money(owe)} on the mortgage, so you'd get ${money(val - owe)}.` : ''} You'll move back with your parents.`, () => {
    earn(val - owe, `Sold ${h.name}`);
    S.mortgage = null;
    if (S.home === 'custom') { PLACES[S.build.lot].kind = 'land'; S.build = null; }
    S.home = 'parents';
    log(`🏷️ You sold your house and moved back home.`);
    done();
  });
}

// ---------- bank ----------
function loanLimit() { return Math.round(1000 + weeklyIncome() * 30 + (S.edu < 3 ? 3000 : 0)); }
function bank(action, amt) {
  if (S.hour < 8 || S.hour > 20) return nope('The bank is open 8 AM to 9 PM.');
  if (amt === 'all') amt = action === 'deposit' ? Math.floor(S.money) : action === 'withdraw' ? S.savings : Math.min(S.loan, Math.floor(S.money));
  if (!(amt > 0)) return nope('Nothing to do.');
  if (action === 'deposit') {
    if (amt > S.money) return nope('You don\'t have that much cash.');
    S.money -= amt; S.savings += amt;
    log(`🏦 You put ${money(amt)} in savings.`);
    if (S.savings >= 1000) unlock('save1k');
  } else if (action === 'withdraw') {
    amt = Math.min(amt, S.savings);
    S.savings -= amt; S.money += amt;
    log(`🏦 You took ${money(amt)} out of savings.`);
  } else if (action === 'borrow') {
    if (S.loan + amt > loanLimit()) return nope(`The bank will only lend you up to ${money(loanLimit())} total.`);
    S.loan += amt; S.money += amt;
    log(`🏦 You borrowed ${money(amt)}. It grows 2% every week until you pay it back!`, 'bad');
  } else if (action === 'repay') {
    amt = Math.min(amt, S.loan);
    if (amt > S.money) return nope('You don\'t have that much cash.');
    S.loan -= amt; S.money -= amt;
    log(`🏦 You paid back ${money(amt)} of your loan.`, 'good');
    if (S.loan < 0.5) { S.loan = 0; unlock('debt_free'); }
  }
  done();
}
function toggleInsurance() {
  S.insurance = !S.insurance;
  log(S.insurance ? '🩺 You signed up for health insurance ($35/week).' : '🩺 You cancelled health insurance.');
  done();
}

// ---------- after every action ----------
function checkBody() {
  const n = S.needs;
  if (S.nightWake) { S.nightWake = false; log('🌙 You woke up in the night to use the bathroom.'); }
  if (S.accident) {
    S.accident = false;
    log('😳 Oops! You didn\'t make it to the bathroom in time.', 'bad');
    queueModal(`<h2>😳 Oops!</h2><p>You waited too long and didn't make it to the bathroom in time. Your clothes need washing and you need a shower.</p><p class="lesson">💡 When the 🚽 Bathroom bar gets low, go! Every store, school and workplace has a restroom.</p>`);
  }
  if (n.health <= 0) {
    const insured = S.insurance || (S.job && JOBS[S.job.id].insurance);
    const bill = insured ? 300 : 3000;
    charge(bill, 'Hospital bill');
    n.health = 60; n.food = 60; n.energy = 60;
    const startHour = S.hour;
    pass(24 - startHour + 7, 'sleep');
    log(`🏥 You got really sick and went to the hospital. Bill: ${money(bill)}.`, 'bad');
    queueModal(`<h2>🏥 Hospital!</h2><p>Your health hit zero, so you spent the night in the hospital.</p><p>Bill: <b>${money(bill)}</b>${insured ? ' (health insurance paid most of it!)' : ''}</p><p class="lesson">💡 ${insured ? 'Health insurance saved you a lot of money!' : 'Without health insurance, hospital bills are HUGE. Eat, sleep and stay clean!'}</p>`);
  } else if (n.energy <= 0) {
    log('😵 You were so tired you passed out!', 'bad');
    pass(6, 'sleep');
    queueModal(`<h2>😵 You Passed Out!</h2><p>You ran out of energy and fell asleep for 6 hours.</p><p class="lesson">💡 Get 8 hours of sleep each night.</p>`);
  }
}

function checkAchievements() {
  const w = netWorth();
  if (w >= 10000) unlock('worth10k');
  if (w >= 100000) unlock('worth100k');
  if (w >= 1000000) unlock('millionaire');
  if (S.savings >= 1000) unlock('save1k');
}
function unlock(id) {
  if (S.achievements[id]) return;
  S.achievements[id] = S.day;
  const a = ACHIEVEMENTS.find(x => x.id === id);
  if (a) { log(`🏅 Life Goal reached: ${a.name}!`, 'good'); toast(`🏅 Goal: ${a.icon} ${a.name}`, 'good'); }
}

function done(showQueued = true) {
  checkBody();
  checkAchievements();
  save();
  render();
  if (showQueued) nextModal();
}

// ---------- modals ----------
function showModal(html, buttons = [{ label: 'OK' }]) {
  const m = $('#modal');
  $('#modal-body').innerHTML = html;
  const bar = $('#modal-buttons');
  bar.innerHTML = '';
  buttons.forEach(b => {
    const btn = document.createElement('button');
    btn.textContent = b.label;
    btn.className = 'btn ' + (b.cls || 'primary');
    btn.onclick = () => {
      if (b.keepOpen) { b.fn && b.fn(); return; }
      closeModal();
      if (b.fn) b.fn();
      else nextModal();
    };
    bar.appendChild(btn);
  });
  m.classList.add('open');
}
function closeModal() { $('#modal').classList.remove('open'); }
function queueModal(html) { modalQueue.push(html); }
function nextModal() {
  if ($('#modal').classList.contains('open')) return;
  const h = modalQueue.shift();
  if (h) showModal(h, [{ label: 'OK' }]);
}
function confirmModal(html, fn) {
  showModal(`<p>${html}</p>`, [{ label: 'Cancel', cls: 'ghost' }, { label: 'Yes', cls: 'primary', fn }]);
}

// ---------- save ----------
function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { /* ignore */ } }
function load() {
  try { const s = localStorage.getItem(SAVE_KEY); if (s) return JSON.parse(s); } catch (e) { /* ignore */ }
  return null;
}
function resetGame() {
  confirmModal('Start a brand new life? Your current game will be erased.', () => {
    try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* ignore */ }
    S = null; modalQueue.length = 0;
    showSetup();
  });
}
