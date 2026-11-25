// ===================== PEOPLE & WORK 2: siblings, grandma, pen pals, promotions, your company, training, graduation, retirement =====================

function ensurePeople2State() {
  ensureSocialState();
  const F = S.family;
  if (!F.sis) {
    const older = Math.random() < 0.5;
    F.sis = { name: pickR(['Emma', 'Zoe', 'Lily', 'Maya', 'Nia', 'Hana']), icon: '👧', rel: 70, age: (S.age || 18) + (older ? 3 : -4), look: randomLook(), sibling: true };
    F.bro = { name: pickR(['Leo', 'Eli', 'Noah', 'Kai', 'Omar', 'Diego']), icon: '👦', rel: 70, age: (S.age || 18) + (older ? -2 : 2), look: randomLook(), sibling: true };
    [F.sis, F.bro].forEach(s => s.job = siblingJob(s.age));
  }
  if (F.grandma && !F.grandma.age) F.grandma.age = 78;
  if (!S.penpal) S.penpal = null;
  if (!S.studentLoan) S.studentLoan = 0;
}
function siblingJob(age) { return age < 18 ? 'in high school' : age < 22 ? pickR(['in college', 'working at a café', 'learning to be an electrician']) : pickR(['a teacher', 'a nurse', 'a chef', 'an engineer', 'a firefighter', 'a vet', 'a pilot']); }

// ---------- 9. brothers and sisters ----------
const SIB_NEWS = [s => `I got a new job! I'm ${s.job} now 🎉`, () => 'I passed my driving test!! 🚗', () => 'Guess what? I adopted a kitten! 🐱', () => 'I just moved into my first apartment!', () => 'Want to get pizza this weekend? 🍕', () => 'Remember when we built that blanket fort? 😂', () => 'Good luck this week! You got this 💪'];
function siblingNewDay() {
  const F = S.family;
  [F.sis, F.bro].forEach(s => {
    if (!s) return;
    if (isDate(5, 1 + (s.name.length * 3) % 28)) { s.age++; if (s.age === 18 || s.age === 22) { s.job = siblingJob(s.age); text(`${s.icon} ${s.name}`, `I'm ${s.age} now! ${s.age === 18 ? 'I graduated from high school! 🎓' : `I'm working as ${s.job}!`}`); } }
    if (Math.random() < 0.04 && has('phone')) text(`${s.icon} ${s.name}`, pickR(SIB_NEWS)(s));
    s.rel = clamp(s.rel - 0.3);
  });
  const h = holidayToday();
  if (h && (h.name.includes('Thanksgiving') || h.name.includes('Christmas'))) { log(`👨‍👩‍👧 ${F.sis.name} and ${F.bro.name} came home for ${h.name}! The whole family ate together.`, 'good'); fun2(10); F.sis.rel = clamp(F.sis.rel + 10); F.bro.rel = clamp(F.bro.rel + 10); }
}

// ---------- 10. grandma gets older ----------
function grandmaNewDay() {
  const g = S.family.grandma; if (!g) return;
  if (isDate(2, 14)) { g.age++; log(`👵 It's Grandma's birthday! She's ${g.age} today. Give her a call!`); }
  if (!S.grandmaAsk && Math.random() < 0.05) { S.grandmaAsk = { day: S.day, what: pickR(['groceries', 'medicine', 'her garden', 'her computer']) }; if (has('phone')) text('👵 Grandma', { groceries: 'Sweetie, could you help me get my groceries this week? 🛒', medicine: 'Could you pick up my medicine at the pharmacy? 💊', 'her garden': 'My knees are sore. Could you help me pull weeds? 🌷', 'her computer': 'My computer is doing something strange... can you help? 💻' }[S.grandmaAsk.what]); }
  if (S.grandmaAsk && S.day - S.grandmaAsk.day > 6) { S.grandmaAsk = null; log('👵 Grandma\'s neighbor helped her this time. You can visit her any time!'); }
}
function helpGrandma() {
  const a = S.grandmaAsk, g = S.family.grandma;
  if (!a) {
    pass(1.5, 'relax'); g.rel = clamp(g.rel + 8); fun2(8);
    log(`👵 You visited Grandma. She told you a story about when she was ${S.age}: "${pickR(['We didn\'t have phones — we wrote letters!', 'I rode my bike 3 miles to school, uphill!', 'I worked at a bakery and ate too many donuts.', 'A movie ticket cost 50 cents!', 'I won the town spelling bee when I was your age!'])}"`, 'good');
    return done();
  }
  if (a.what === 'groceries' && !spend(30, 'Groceries for Grandma')) return;
  if (a.what === 'medicine' && !spend(10, 'Grandma\'s medicine copay')) return;
  pass(2, 'awake'); g.rel = clamp(g.rel + 18); fun2(10); addSkill('aid', 1);
  if (a.what === 'her computer') addSkill('comp', 1.5);
  const reward = pickR([['a plate of warm cookies 🍪', 0], ['$10 "for being so sweet"', 10], ['her famous apple pie 🥧', 0], ['a big hug 🤗', 0]]);
  if (reward[1]) earn(reward[1], 'Gift from Grandma');
  log(`👵 You helped Grandma with ${a.what}. She gave you ${reward[0]}. "You're the best grandkid!"`, 'good');
  S.grandmaAsk = null; done();
}

// ---------- 11. pen pals ----------
const PENPALS = [
  { name: 'Yuki', country: 'Japan', flag: '🇯🇵', facts: ['In Japan, kids clean their own classrooms!', 'We eat rice with chopsticks almost every day.', 'Cherry blossoms bloom in spring and everyone has picnics under them 🌸', 'Mount Fuji is a volcano you can climb!'] },
  { name: 'Lucas', country: 'Brazil', flag: '🇧🇷', facts: ['The Amazon rainforest is in Brazil! 🌳', 'We speak Portuguese here.', 'Soccer is the most popular sport — everyone plays! ⚽', 'Carnival is a giant party with music and dancing.'] },
  { name: 'Amara', country: 'Kenya', flag: '🇰🇪', facts: ['I can see giraffes and zebras on safari! 🦒', 'Kenyan runners win lots of marathons.', 'We speak Swahili and English. "Jambo" means hello!', 'Our flag has a shield and two spears.'] },
  { name: 'Chloé', country: 'France', flag: '🇫🇷', facts: ['The Eiffel Tower is in Paris! 🗼', 'We buy fresh baguettes from the bakery every day 🥖', 'In France, lunch at school can last over an hour!', '"Bonjour" means hello.'] },
  { name: 'Arjun', country: 'India', flag: '🇮🇳', facts: ['During Diwali we light lamps and set off fireworks 🪔', 'Cricket is super popular here 🏏', 'India has more than 20 official languages!', 'The Taj Mahal is made of white marble.'] },
  { name: 'Sofía', country: 'Mexico', flag: '🇲🇽', facts: ['We celebrate Día de los Muertos with colorful flowers 🌼', 'Tacos here are amazing! 🌮', 'There are ancient pyramids in Mexico!', 'Monarch butterflies fly all the way here every winter 🦋'] },
  { name: 'Jack', country: 'Australia', flag: '🇦🇺', facts: ['Kangaroos hop around near my house! 🦘', 'Christmas is in summer here — we go to the beach!', 'The Great Barrier Reef is the biggest coral reef in the world 🐠', 'Koalas sleep about 20 hours a day.'] },
];
function getPenpal(i) {
  if (i === undefined) return showModal(`<h2>✉️ Find a Pen Pal</h2><p>Write letters to a kid in another country and learn about their life!</p><div class="mrows">${PENPALS.map((p, k) => mrow(p.flag, `${p.name} from ${p.country}`, 'Wants a pen pal!', b('Pick', `closeModal();getPenpal(${k})`))).join('')}</div>`, [{ label: 'Cancel', cls: 'ghost' }]);
  S.penpal = { i, letters: 0, waiting: null, fact: 0 };
  log(`✉️ ${PENPALS[i].flag} ${PENPALS[i].name} from ${PENPALS[i].country} is your new pen pal! Write them a letter at the Post Office.`, 'good');
  done();
}
function writeLetter() {
  const pp = S.penpal; if (!pp) return getPenpal();
  if (pp.waiting) return nope(`You already sent a letter. Wait for ${PENPALS[pp.i].name} to write back! (Letters take about a week to cross the ocean.)`);
  if (!spend(1.5, 'International stamp')) return;
  pass(1, 'study'); addSkill('write', 1.5);
  pp.waiting = S.day + 5 + Math.floor(Math.random() * 4);
  log(`✉️ You wrote a letter to ${PENPALS[pp.i].name} about your life, put on a $1.50 international stamp and mailed it!`, 'good');
  done();
}
function penpalNewDay() {
  const pp = S.penpal; if (!pp || !pp.waiting || S.day < pp.waiting) return;
  const P = PENPALS[pp.i]; pp.waiting = null; pp.letters++;
  const fact = P.facts[pp.fact++ % P.facts.length];
  addMail({ kind: 'letter', from: `${P.flag} ${P.name} (${P.country})`, text: `Dear ${S.name},\n\nThank you for your letter! ${fact} What is it like where you live?\n\nYour friend,\n${P.name}`, gift: pp.letters % 3 === 0 ? `a postcard from ${P.country}` : null });
}

// ---------- 12. promotions ----------
const LEVELS = [['', 1], ['Senior ', 1.15], ['Lead ', 1.3], ['Manager — ', 1.55]];
function jobTitle(j) { const L = LEVELS[j.level || 0]; return (L[0] || '') + JOBS[j.id].name; }
function checkPromotion(j) {
  const lvl = j.level || 0; if (lvl >= LEVELS.length - 1) return;
  const need = [15, 35, 60][lvl];
  if (j.goodDays < need) return;
  if (lvl >= 2 && S.skills.lead < 25) { if (j.goodDays === need) log('💡 Your boss says: "You\'d be a great manager — practice your Leadership skill first!"'); return; }
  j.level = lvl + 1;
  const old = j.wage; j.wage = Math.round(j.wage * (LEVELS[j.level][1] / LEVELS[lvl][1]) * 100) / 100;
  unlock('promoted');
  queueModal(`<h2>🎉 You Got Promoted!</h2><p>You're now <b>${jobTitle(j)}</b>!</p><p>Pay: ${money(old)} → <b>$${j.wage.toFixed(2)}/hour</b></p>
    ${j.level === 3 ? '<p>🏢 You get your own office, and you lead the team: you run meetings and help new workers learn.</p><p class="lesson">💡 Managers need Leadership skill. Good managers are kind, fair and organized!</p>' : '<p>🗂️ You get more important work to do. Keep it up!</p>'}`);
  log(`🎉 PROMOTED! You are now ${jobTitle(j)}.`, 'good');
}
function managerDay(j) {
  if ((j.level || 0) < 3) return '';
  addSkill('lead', 1.2);
  return pickR(['📋 You ran the morning meeting.', '🧑‍🏫 You trained a new worker.', '📅 You made next week\'s schedule.', '🤝 You helped two coworkers solve a problem.', '📊 You checked the team\'s numbers — great week!']);
}

// ---------- 13. your own company: hire workers ----------
const BIZ_STAFF_MAX = { lemon: 2, truck: 2, bakery: 4, store: 6 };
function ensureBizExtras() { if (!BUSINESSES.lemon) BUSINESSES.lemon = { name: 'Lemonade Company', icon: '🍋', cost: 1500, base: 260, costs: 110, skills: ['sales', 'cook'] }; }
ensureBizExtras();
function hireWorker() {
  const bz = S.business; if (!bz) return nope('Start a business first.');
  bz.staff = bz.staff || [];
  if (bz.staff.length >= (BIZ_STAFF_MAX[bz.type] || 3)) return nope('Your business is full of workers already!');
  const w = { name: pickR(FIRST_NAMES), wage: 14 + Math.floor(Math.random() * 5), skill: 30 + Math.floor(Math.random() * 50), look: randomLook() };
  confirmModal(`<b>${w.name}</b> applied to work at your ${BUSINESSES[bz.type].name}!<br>Skill: ${w.skill}/100 · Wants <b>${money(w.wage)}/hour</b> (25 hrs a week = ${money(w.wage * 25)}/week).<br><br>Hire ${w.name}?`, () => {
    bz.staff.push(w); log(`🤝 You hired ${w.name}! Workers help your business sell more, but you have to pay them every week.`, 'good'); done();
  });
}
function letGo(i) { const bz = S.business; const w = bz.staff[i]; confirmModal(`Let ${w.name} go? Be kind — tell them they did a good job.`, () => { bz.staff.splice(i, 1); log(`👋 ${w.name} doesn't work for you anymore.`); done(); }); }
function staffPayroll() { const bz = S.business; return bz && bz.staff ? bz.staff.reduce((t, w) => t + w.wage * 25, 0) : 0; }
function staffBoost() { const bz = S.business; return bz && bz.staff ? bz.staff.reduce((t, w) => t + 0.12 + w.skill / 500, 0) : 0; }
function companyCard() {
  const bz = S.business; if (!bz) return '';
  const B = BUSINESSES[bz.type]; bz.staff = bz.staff || [];
  return `<div class="card money"><h3>${B.icon} Your Company: ${B.name}</h3>
    <p class="muted">Workers: ${bz.staff.length}/${BIZ_STAFF_MAX[bz.type] || 3} · Payroll: ${money(staffPayroll())}/week · They help you sell about ${Math.round(staffBoost() * 100)}% more.</p>
    <div class="mrows">${bz.staff.map((w, i) => mrow(`<img class="avatar" style="width:32px;height:32px" src="${avatarURL(w.look, 32)}" alt="">`, w.name, `${money(w.wage)}/hr · skill ${w.skill}`, b('Let go', `letGo(${i})`, 'ghost'))).join('')}</div>
    <button class="btn sm primary" onclick="hireWorker()">🤝 Hire a worker</button>
    <p class="lesson">💡 Business owners pay workers before they pay themselves. More workers = more sales, but only if there are enough customers!</p></div>`;
}

// ---------- 14. first-day training ----------
const TRAINING = {
  Health: ['Wash your hands before and after every patient', 'Keep patient information private', 'Ask a nurse if you\'re not sure'],
  Food: ['Wear a hairnet and wash your hands', 'Keep raw meat away from other food', 'Say "Behind!" when you walk behind someone in the kitchen'],
  Stores: ['Greet every customer with a smile', 'Count the money twice at the register', 'Keep the shelves neat'],
  'Public Service': ['Always stay calm and listen carefully', 'Treat every person with respect', 'Follow the safety rules every time'],
  Animals: ['Wash your hands after touching every animal', 'Move slowly and speak softly around scared animals', 'Check every cage is locked'],
  Trades: ['Always wear your hard hat and safety glasses', 'Measure twice, cut once', 'Never use a tool you weren\'t trained on'],
};
const UNIFORM_CATS = ['Health', 'Food', 'Stores', 'Public Service', 'Trades', 'Transport', 'Animals'];
function firstDayTraining(j) {
  const job = JOBS[j.id];
  const rules = TRAINING[job.cat] || ['Be on time every day', 'Ask questions when you don\'t know something', 'Be kind and helpful to everyone'];
  const mentor = j.coworkers && j.coworkers[0] ? j.coworkers[0].name : 'Sam';
  j.uniform = UNIFORM_CATS.includes(job.cat);
  addSkill(job.req && job.req[0] ? job.req[0].s : 'comm', 2);
  queueModal(`<h2>🧑‍🏫 First Day: Training</h2><p>Welcome to your new job as a <b>${job.name}</b>! Your mentor <b>${esc(mentor)}</b> showed you around.</p>
    ${j.uniform ? '<p>👕 You got your work <b>uniform</b> and a name tag!</p>' : '<p>🪪 You got your name tag and an employee badge!</p>'}
    <p><b>The rules here:</b></p><ul class="notes">${rules.map(r => `<li>✅ ${r}</li>`).join('')}<li>✅ Clock in and out on time</li></ul>
    <p class="lesson">💡 Everyone is new sometimes. It's OK to ask lots of questions on your first day!</p>`);
}

// ---------- 15. graduation & student loans ----------
function graduationCeremony(lvl) {
  const F = S.family;
  queueModal(`<h2>🎓 Graduation Day!</h2><div class="dinner"><div class="seats">${[['You', S.look], [F.sis.name, F.sis.look], [F.bro.name, F.bro.look]].map(([n, l]) => `<div class="seat"><img class="avatar" src="${avatarURL(l, 64)}" alt=""><small>${esc(n)}</small></div>`).join('')}</div></div>
    <p>You walked across the stage in your <b>cap and gown</b> and got your <b>${EDU_NAMES[lvl]}</b>! 👩‍🎓 Everyone threw their caps in the air!</p>
    <p>👩 Mom cried happy tears. 👵 Grandma took 100 photos. 📸</p>
    ${S.studentLoan > 0 ? `<p>📚 You owe <b>${money(S.studentLoan)}</b> in student loans. You'll pay ${money(studentPay())} every week until it's paid off.</p><p class="lesson">💡 School is a great investment, but loans must be paid back — with interest.</p>` : ''}`);
  S.family.mom.rel = clamp(S.family.mom.rel + 15); S.family.grandma.rel = clamp(S.family.grandma.rel + 15);
  addMail({ kind: 'card', from: '👵 Grandma', text: `Congratulations, graduate! I'm so proud of you! 🎓`, money: 50 });
}
function studentPay() { return Math.max(25, Math.round(S.studentLoan * 0.012)); }
function studentLoanWeekly(bills) {
  if (!S.studentLoan || S.studentLoan <= 0) return;
  if (S.edu >= 2 || !(S.eduProgress[2] > 0 || S.eduProgress[3] > 0)) {
    S.studentLoan *= 1.001;
    const pay = Math.min(studentPay(), Math.ceil(S.studentLoan));
    charge(pay, 'Student loan payment'); bills.push([`Student loan payment (${money(S.studentLoan - pay)} left)`, pay]);
    S.studentLoan -= pay; if (S.studentLoan < 1) { S.studentLoan = 0; log('🎉 You paid off your student loans!', 'good'); unlock('loanfree'); }
  }
}

// ---------- 16. retirement ----------
function canRetire() { return S.age >= 62 && S.job; }
function retire() {
  if (!canRetire()) return nope('You can retire when you are 62 or older.');
  const j = S.job, yrs = Math.max(1, Math.round(j.daysWorked / 250));
  const pension = Math.round(j.wage * 40 * (0.2 + Math.min(0.3, yrs * 0.015)) + 180);
  confirmModal(`Retire from your job as ${jobTitle(j)}?<br>You'll get about <b>${money(pension)}/week</b> forever from your pension and Social Security.`, () => {
    S.pension = pension; S.retired = true;
    const co = j.coworkers || [];
    S.jobsWorked.push(j.id); S.job = null;
    unlock('retired');
    queueModal(`<h2>🎉 Happy Retirement!</h2><p>Your coworkers threw you a surprise party with balloons and a giant cake! 🎂🎈</p>
      ${co.length ? `<p>${co.map(w => esc(w.name)).join(', ')} gave a speech: "We'll miss you so much!"</p>` : ''}
      <p>🎁 Your boss gave you a shiny gold watch ⌚ as a thank-you for your hard work.</p>
      <p>From now on you get <b>${money(pension)}/week</b> from your pension and Social Security. Time to relax, travel, garden and visit family!</p>
      <p class="lesson">💡 People save money their whole lives so they can retire one day. Starting early helps a lot!</p>`);
    fun2(30); done();
  });
}
function pensionWeekly() { if (S.pension) earn(S.pension, 'Pension & Social Security'); }
