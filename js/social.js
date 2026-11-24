// ===================== PEOPLE: FRIENDS, FAMILY, NEIGHBORS, COWORKERS, PHONE =====================

const FIRST_NAMES = ['Jordan', 'Sam', 'Riley', 'Alex', 'Taylor', 'Morgan', 'Casey', 'Jamie', 'Avery', 'Quinn', 'Priya', 'Mateo', 'Zoe', 'Leo', 'Nia', 'Kai', 'Emma', 'Omar', 'Lily', 'Diego', 'Hana', 'Eli', 'Maya', 'Noah'];
const LAST_NAMES = ['Smith', 'Garcia', 'Chen', 'Johnson', 'Patel', 'Brown', 'Kim', 'Davis', 'Lopez', 'Wilson', 'Nguyen', 'Taylor'];
const pickR = a => a[Math.floor(Math.random() * a.length)];
const MAX_FRIENDS = 8;

function ensureSocialState() {
  if (!S.friends) S.friends = [];
  if (!S.family) {
    S.family = {
      mom: { name: 'Mom', icon: '👩', rel: 80 }, dad: { name: 'Dad', icon: '👨', rel: 80 }, grandma: { name: 'Grandma', icon: '👵', rel: 85 },
    };
  }
  if (!S.texts) S.texts = [];
  if (!S.neighbors) S.neighbors = { names: [pickR(FIRST_NAMES) + ' ' + pickR(LAST_NAMES), pickR(FIRST_NAMES) + ' ' + pickR(LAST_NAMES)], complaints: 0 };
}
function text(from, msg) { S.texts.unshift({ day: S.day, hour: S.hour, from, msg }); if (S.texts.length > 30) S.texts.length = 30; S.unread = (S.unread || 0) + 1; }

// ---------- friends ----------
function meetFriend(where) {
  ensureSocialState();
  if (S.friends.length >= MAX_FRIENDS) return;
  const used = new Set(S.friends.map(f => f.name));
  const name = FIRST_NAMES.filter(n => !used.has(n))[Math.floor(Math.random() * 10)] || pickR(FIRST_NAMES);
  const d = 1 + Math.floor(Math.random() * 360); let m = 0, doy = d; while (doy >= MDAYS[m]) { doy -= MDAYS[m]; m++; }
  const fr = { name, look: randomLook(), f: 30, bday: { m, d: doy + 1 }, where, met: S.day };
  S.friends.push(fr);
  log(`👋 You met ${name} ${{ park: 'at the park', work: 'at work', diner: 'at the diner', school: 'in class', sports: 'at the Sports Park', volunteering: 'while volunteering' }[where] || 'in town'}. You're becoming friends!`, 'good');
  text(name, 'Hey! It was really nice meeting you 😊');
  if (S.friends.length >= 5) unlock('popular');
}
function hangOut(i) {
  const fr = S.friends[i]; if (!fr) return;
  if (S.needs.energy < 15) return nope('You\'re too tired to hang out.');
  if (S.hour < 8 || S.hour > 22) return nope(`${fr.name} is probably asleep!`);
  pass(2, 'relax'); fr.f = clamp(fr.f + 15); fun2(14); addSkill('comm', 1);
  const what = pickR(['played video games', 'went for ice cream', 'shot hoops', 'watched a movie', 'talked for hours', 'played board games', 'went for a bike ride']);
  log(`😄 You and ${fr.name} ${what}. Friendship +15!`, 'good');
  done();
}
function textFriend(i) {
  const fr = S.friends[i]; if (!fr) return;
  if (!has('phone')) return nope('You need a phone to text.');
  if (fr.textedToday === S.day) return nope(`You already texted ${fr.name} today.`);
  fr.textedToday = S.day; fr.f = clamp(fr.f + 5); fun2(3);
  const msg = pickR(['How are you? 😊', 'Wanna hang out this weekend?', 'Did you see the news?!', 'Lol that was so funny yesterday', 'Good luck at work today!']);
  text('You → ' + fr.name, msg);
  setTimeout(() => { text(fr.name, pickR(['Haha yes!! 😂', 'I\'m good! You?', 'Totally! Let\'s do it 🙌', 'Thanks!! ❤️', 'OMG yes'])); render(); }, 50);
  log(`💬 You texted ${fr.name}.`); done();
}
function socialNewDay() {
  ensureSocialState();
  S.friends.forEach(fr => {
    fr.f = clamp(fr.f - 1);
    if (fr.bday && isDate(fr.bday.m, fr.bday.d)) { fr.bdayToday = S.day; log(`🎂 It's ${fr.name}'s birthday today! Text them or hang out!`); text('📅 Calendar', `It's ${fr.name}'s birthday 🎂`); }
    if (fr.bday && isDate(fr.bday.m, fr.bday.d, S.day - 1) && fr.wished !== S.day - 1) { fr.f = clamp(fr.f - 8); }
  });
  const lost = S.friends.filter(fr => fr.f <= 0);
  lost.forEach(fr => log(`😢 You and ${fr.name} drifted apart. Friendships need time and attention.`, 'bad'));
  S.friends = S.friends.filter(fr => fr.f > 0);
  // a friend invites you
  const close = S.friends.filter(fr => fr.f > 35);
  if (close.length && Math.random() < 0.15) {
    const fr = pickR(close), plan = pickR([['the movies', 12, 'theater'], ['the beach', 0, 'beach'], ['a pizza party', 8, 'diner'], ['a basketball game', 0, 'sports']]);
    S.invite = { name: fr.name, plan: plan[0], cost: plan[1], day: S.day };
    text(fr.name, `Want to go to ${plan[0]} today? 🙂`);
  }
  // family
  Object.values(S.family).forEach(m => m.rel = clamp(m.rel - (S.home === 'parents' ? 0 : 0.6)));
  if (S.home !== 'parents' && S.family.mom.rel < 55 && Math.random() < 0.3) text('👩 Mom', 'We miss you! Come visit or call sometime ❤️');
  // neighbors
  if (Math.random() < 0.12) neighborEvent();
  if (S.lateNoise && ['shared', 'studio', 'onebed'].includes(S.home)) {
    S.neighbors.complaints++;
    log(`📢 Your neighbor complained that your TV and games were too loud last night. (${S.neighbors.complaints}/3)`, 'bad');
    if (S.neighbors.complaints >= 3) { queueModal('<h2>📝 Letter from the Landlord</h2><p>"We got 3 noise complaints about your apartment. Please keep it quiet after 10 PM, or you could lose your apartment."</p><p class="lesson">💡 In apartments, you share walls with neighbors. Be considerate!</p>'); S.neighbors.complaints = 0; S.credit = Math.max(300, (S.credit || 600) - 10); }
  }
  S.lateNoise = false;
}
function acceptInvite(yes) {
  const iv = S.invite; if (!iv) return;
  S.invite = null;
  const fr = S.friends.find(f => f.name === iv.name);
  if (!yes) { if (fr) fr.f = clamp(fr.f - 3); log(`You told ${iv.name} maybe next time.`); return done(); }
  if (iv.cost && !spend(iv.cost, `${iv.plan} with ${iv.name}`)) return;
  pass(3, 'relax'); fun2(22); if (fr) fr.f = clamp(fr.f + 18); addSkill('comm', 1);
  log(`🎉 You went to ${iv.plan} with ${iv.name}. Best day ever!`, 'good'); done();
}

// ---------- family ----------
function callFamily(who) {
  if (!has('phone')) return nope('You need a phone to call.');
  const m = S.family[who];
  pass(0.25, 'relax'); m.rel = clamp(m.rel + 8); fun2(5);
  const advice = pickR(['Save a little money from every paycheck.', 'Drink water and get enough sleep!', 'Be on time — it shows you care.', 'Always wash your hands before you eat.', 'Don\'t buy things just because they\'re on sale.', 'Call your grandma! 😉', 'Be kind to your coworkers.']);
  log(`📞 You called ${m.name}. ${m.icon} "${advice}"`, 'good'); done();
}
function viewFamilyVisit() {
  return `<p>You're visiting your family! ${S.family.mom.icon} ${S.family.dad.icon} ${S.family.grandma.icon}</p>
    <div class="grid actions">
      <button class="action" onclick="familyAct('dinner')"><span class="ic">🍲</span><b>Family Dinner</b><small>Free home-cooked meal · 1 hr</small></button>
      <button class="action" onclick="familyAct('help')"><span class="ic">🧹</span><b>Help with Chores</b><small>1 hr · Mom pays $10</small></button>
      <button class="action" onclick="familyAct('advice')"><span class="ic">💬</span><b>Ask for Advice</b><small>30 min</small></button>
      <button class="action" onclick="familyAct('cookies')"><span class="ic">🍪</span><b>Bake with Grandma</b><small>1 hr · Cooking skill</small></button>
    </div>${holidayToday() && holidayToday().m === 10 ? '<p class="lesson">🦃 Happy Thanksgiving! The whole family is here for a big dinner.</p>' : ''}`;
}
function familyAct(a) {
  const f = S.family;
  if (a === 'dinner') { pass(1, 'relax'); ateFood(holidayToday() && holidayToday().m === 10 ? 80 : 55); fun2(holidayToday() && holidayToday().m === 10 ? 25 : 10); Object.values(f).forEach(m => m.rel = clamp(m.rel + 10)); log(holidayToday() && holidayToday().m === 10 ? '🦃 Turkey, mashed potatoes and pie! Everyone shared what they\'re thankful for.' : '🍲 Mom made your favorite dinner. So good to be home!', 'good'); }
  if (a === 'help') { pass(1); earn(10, 'Helped Mom'); f.mom.rel = clamp(f.mom.rel + 8); log('🧹 You helped Mom clean the garage. She gave you $10.'); }
  if (a === 'advice') { pass(0.5, 'relax'); f.dad.rel = clamp(f.dad.rel + 6); log(`👨 Dad says: "${pickR(['Make a budget and stick to it.', 'Your credit score matters — pay bills on time!', 'Change your car\'s oil every 3,000 miles.', 'A good job takes time to find. Keep trying!'])}"`); }
  if (a === 'cookies') { pass(1, 'relax'); addSkill('cook', 2); f.grandma.rel = clamp(f.grandma.rel + 10); fun2(10); ateFood(10); log('🍪 Grandma taught you her secret cookie recipe!', 'good'); }
  done();
}

// ---------- neighbors ----------
function neighborEvent() {
  const nb = pickR(S.neighbors.names);
  const se = seasonOf();
  const r = Math.random();
  if (se === 'winter' && S.weather === 'snowy' && r < 0.5) {
    S.gig = { kind: 'snow', name: nb, hours: 1, pay: 20, skill: 'fit', day: S.day };
    log(`🌨️ Your neighbor ${nb} asked if you could shovel their driveway for $20. (Check Home)`);
  } else if (r < 0.6) {
    log(`👋 Your neighbor ${nb} waved and said good morning!`); fun2(2);
  } else if (r < 0.8) {
    log(`📦 ${nb} got your package by mistake and brought it over. Nice neighbor!`);
  } else {
    log(`🌻 ${nb} gave you some tomatoes from their garden.`); S.fridgeFood.push({ id: 'veggies', exp: S.day + 5 }, { id: 'veggies', exp: S.day + 5 });
  }
}

// ---------- boss and coworkers ----------
function setupWorkplace(j) {
  j.boss = { name: pickR(FIRST_NAMES) + ' ' + pickR(LAST_NAMES), style: pickR(['nice', 'fair', 'strict']) };
  j.coworkers = [pickR(FIRST_NAMES), pickR(FIRST_NAMES)].filter((v, i, a) => a.indexOf(v) === i);
}
function workEvent(j) {
  if (!j.boss) setupWorkplace(j);
  const r = Math.random(), cw = pickR(j.coworkers);
  if (r < 0.08) { fun2(8); return `🍩 ${cw} brought donuts for everyone!`; }
  if (r < 0.14) { if (Math.random() < 0.5) meetFriend('work'); fun2(6); return `🥪 You had lunch with ${cw}.`; }
  if (r < 0.19) { j.weekHours += 2 * 1.5; pass(2, 'work'); return `⏰ ${j.boss.name} asked you to stay 2 hours late. That's overtime — you get paid 1.5× for it!`; }
  if (r < 0.23 && j.boss.style !== 'strict') { fun2(8); return `👏 ${j.boss.name} said "Great job today!" in front of everyone.`; }
  if (r < 0.26) { fun2(-4); return '😴 There was a looooong boring meeting.'; }
  if (r < 0.29) { fun2(6); return `🎂 It was ${cw}'s birthday — there was cake in the break room!`; }
  return '';
}

// ---------- phone ----------
function phoneButton() { return has('phone') ? `<button class="phonebtn" onclick="openPhone()" aria-label="Open your phone">📱${S.unread ? `<i>${S.unread}</i>` : ''}</button>` : ''; }
function openPhone(app) {
  if (!has('phone')) return nope('You don\'t have a phone. Buy one at the Mall.');
  ensureSocialState();
  const apps = [['msgs', '💬', 'Messages'], ['weather', '🌦️', 'Weather'], ['bank', '🏦', 'Bank'], ['cal', '📅', 'Calendar'], ['news', '📰', 'News'], ['contacts', '👥', 'Contacts'], ['budget', '📊', 'Budget'], ['maps', '🗺️', 'Maps']];
  let body = '';
  if (!app) body = `<div class="apps">${apps.map(a => `<button onclick="openPhone('${a[0]}')"><span>${a[1]}</span>${a[2]}${a[0] === 'msgs' && S.unread ? ` <i>${S.unread}</i>` : ''}</button>`).join('')}</div>`;
  if (app === 'maps') { closeModal(); setTab('places'); return; }
  if (app === 'msgs') { S.unread = 0; body = `${S.invite && S.invite.day === S.day ? `<div class="card holiday"><b>${esc(S.invite.name)}:</b> Want to go to ${S.invite.plan} today?${S.invite.cost ? ` (${money(S.invite.cost)})` : ''}<div class="row"><button class="btn sm primary" onclick="closeModal();acceptInvite(true)">Yes! 🙌</button><button class="btn sm ghost" onclick="closeModal();acceptInvite(false)">Maybe next time</button></div></div>` : ''}
    <div class="msgs">${S.texts.length ? S.texts.slice(0, 14).map(t => `<div class="msg ${t.from.startsWith('You') ? 'me' : ''}"><b>${esc(t.from)}</b> ${esc(t.msg)} <span class="muted small">${dateText(t.day)}</span></div>`).join('') : '<p class="muted">No messages yet.</p>'}</div>`; }
  if (app === 'weather') body = `<p><b>Today:</b> ${weatherText()} · ${SEASONS[seasonOf()].icon} ${SEASONS[seasonOf()].name}</p><table class="stub">${S.forecast.map(f => `<tr><td>${WEEKDAYS[weekday(f.day)]}, ${dateText(f.day)}</td><td>${WEATHER[f.w].icon} ${WEATHER[f.w].name}</td></tr>`).join('')}</table>${seasonOf() === 'winter' ? '<p class="lesson">🧥 Bundle up! Wear your coat outside.</p>' : ''}`;
  if (app === 'bank') body = `<table class="stub"><tr><td>💵 Checking (cash)</td><td>${money(S.money)}</td></tr><tr><td>🐷 Savings</td><td>${money(S.savings)}</td></tr><tr><td>💳 Loan</td><td class="minus">${money(S.loan)}</td></tr><tr><td>📈 Credit score</td><td>${S.credit} (${creditWord()})</td></tr></table>
    <h3>Recent</h3><table class="stub">${S.week.lines.slice(-8).reverse().map(l => `<tr class="${l.amount < 0 ? 'minus' : 'plus'}"><td>${esc(l.label)}</td><td>${l.amount < 0 ? '-' : '+'}${money(Math.abs(l.amount))}</td></tr>`).join('') || '<tr><td class="muted">Nothing yet this week</td><td></td></tr>'}</table>`;
  if (app === 'cal') body = `<table class="stub">${calendarEvents(30).map(e => `<tr><td>${WEEKDAYS[weekday(e.day)].slice(0, 3)} ${dateText(e.day)}</td><td>${e.text}</td></tr>`).join('')}</table>`;
  if (app === 'news') body = newsHtml();
  if (app === 'contacts') body = `<div class="mrows">${Object.entries(S.family).map(([k, m]) => mrow(m.icon, m.name, `❤️ ${Math.round(m.rel)}`, b('📞 Call', `closeModal();callFamily('${k}')`))).join('')}
    ${S.friends.map((fr, i) => mrow('🙂', fr.name + (fr.bdayToday === S.day ? ' 🎂' : ''), `Friendship ${Math.round(fr.f)}`, b('💬 Text', `closeModal();textFriend(${i})`))).join('')}</div>`;
  if (app === 'budget') body = budgetHtml(true);
  showModal(`<div class="phone"><div class="phonetop">${app ? `<button class="btn sm ghost" onclick="openPhone()">‹ Back</button>` : ''}<b>${app ? apps.find(a => a[0] === app)[2] : `${fmtTime(S.hour)} · ${dateText()}`}</b></div>${body}</div>`, [{ label: 'Close phone', cls: 'ghost' }]);
}
function calendarEvents(n) {
  const out = [];
  for (let k = 0; k <= n; k++) {
    const d = S.day + k;
    const h = holidayToday(d); if (h) out.push({ day: d, text: `${h.icon} ${h.name}` });
    if (isBirthday(d)) out.push({ day: d, text: '🎂 Your birthday!' });
    S.friends.forEach(fr => { if (fr.bday && isDate(fr.bday.m, fr.bday.d, d)) out.push({ day: d, text: `🎂 ${fr.name}'s birthday` }); });
    const ev = eventToday(d); if (ev && dateOf(d).d === ev.from) out.push({ day: d, text: `${ev.icon} ${ev.name} starts` });
    if (electionDay(d)) out.push({ day: d, text: '🗳️ Election Day' });
    if (weekday(d) === 1) out.push({ day: d, text: '🚛 Trash day (bin out by 8 AM)' });
    if (weekday(d) === 0 && k) out.push({ day: d, text: '🧾 Bills due' });
    if (weekday(d) === 4) out.push({ day: d, text: '💵 Payday (tonight)' });
    const { m, d: dd } = dateOf(d); if (m === 3 && dd === 15) out.push({ day: d, text: '🧾 Taxes due!' });
  }
  return out.slice(0, 18);
}
function newsHtml() {
  return `<div class="news"><h3>📰 The Maple Times · ${dateText(S.day, true)}</h3>${(S.news || []).slice(0, 10).map(n => `<p>• ${n.text} <span class="muted small">${dateText(n.day)}</span></p>`).join('') || '<p class="muted">No news yet.</p>'}</div>`;
}
function showNews(title) { showModal(`<h2>${title}</h2>${newsHtml()}`, [{ label: 'OK' }]); }

// ---------- the People card on the Me screen ----------
function peopleCard() {
  ensureSocialState();
  return `<div class="card"><h3>👨‍👩‍👧 Family</h3><div class="mrows">${Object.entries(S.family).map(([k, m]) => mrow(m.icon, m.name, `❤️ Relationship ${Math.round(m.rel)}`, has('phone') ? b('📞 Call', `callFamily('${k}')`) : '')).join('')}</div>
    ${S.home !== 'parents' ? `<button class="btn sm ghost" onclick="travelTo('h_parents')">🏡 Visit your parents</button>` : ''}</div>
    <div class="card"><h3>🙂 Friends (${S.friends.length}/${MAX_FRIENDS})</h3>${S.friends.length ? `<div class="mrows">${S.friends.map((fr, i) => mrow(`<img class="avatar" style="width:28px;height:28px" src="${avatarURL(fr.look, 28)}" alt="">`, fr.name + (fr.bdayToday === S.day ? ' 🎂 Birthday today!' : ''), `Friendship ${Math.round(fr.f)} · birthday ${MONTHS[fr.bday.m].slice(0, 3)} ${fr.bday.d}`, b('Hang out', `hangOut(${i})`) + (has('phone') ? b('💬 Text', `textFriend(${i})`, 'ghost') : ''))).join('')}</div>` : '<p class="muted">Meet people at the park, diner, sports park, at work or while volunteering!</p>'}
    <p class="lesson">💡 Friendships fade if you never talk. Text, hang out and remember birthdays!</p></div>`;
}

// ---------- talking to your neighbors ----------
const NEIGHBOR_TYPES = {
  gardener: { job: 'a retired teacher', pet: 'a cat named Biscuit', hobby: 'gardening', gray: true,
    hello: ['Oh, hello dear! Lovely to see you.', 'Well hi there! I was just watering my roses.', 'Hello, neighbor! Biscuit the cat says hi too.'],
    advice: ['When I taught school, I always said: read a little every day. It adds up!', 'Save a little from every paycheck. When you\'re my age, you\'ll be glad you did.', 'Plants need water, sunshine and patience. So do people!', 'Always write down your bills on a calendar so you never forget one.'],
    help: ['garden', '🌻 Help in the garden', 'Thank you so much! My back isn\'t what it used to be. Here, take some tomatoes!'] },
  parent: { job: 'a nurse at the hospital', pet: 'a big friendly dog named Rocket', hobby: 'running', gray: false,
    hello: ['Hey! Sorry, it\'s busy — the kids are running around everywhere!', 'Hi neighbor! Just got home from a long shift at the hospital.', 'Oh hey! Rocket, sit! Sorry, he loves meeting people.'],
    advice: ['As a nurse, I always say: wash your hands! It stops so many germs.', 'Drink lots of water and get enough sleep. Your body will thank you.', 'Get a flu shot every fall. It really helps!', 'If someone is badly hurt, call 911 right away and stay calm.'],
    help: ['dog', '🦮 Walk Rocket the dog', 'You\'re a lifesaver! Rocket LOVES walks. Here\'s $10 for your help.'] },
  student: { job: 'a college student', pet: 'a goldfish named Bubbles', hobby: 'playing guitar', gray: false,
    hello: ['Yo! What\'s up, neighbor?', 'Hey! I was just practicing guitar. Hope it wasn\'t too loud!', 'Oh hi! I\'m taking a break from studying. Big test tomorrow.'],
    advice: ['College costs a lot, so I work part-time and use the library — it\'s free!', 'Make a budget! I write down everything I spend, even snacks.', 'Practice anything for 20 minutes a day and you\'ll get way better.', 'Studying with a friend makes it more fun.'],
    help: ['study', '📚 Study together', 'That really helped! I think I\'m ready for my test now. Thanks, friend!'] },
};

function ensureNeighbors() {
  ensureSocialState();
  const nb = S.neighbors;
  if (!nb.people) {
    const kinds = ['gardener', 'parent', 'student'];
    nb.people = kinds.map((kind, i) => {
      const look = randomLook();
      if (NEIGHBOR_TYPES[kind].gray) look.hair = '#b8b2aa';
      return { name: nb.names[i] || pickR(FIRST_NAMES) + ' ' + pickR(LAST_NAMES), kind, look, rel: 20, talkedDay: -1, helpedDay: -1, topics: [] };
    });
    nb.names = nb.people.map(p => p.name);
  }
}
function neighborLine(p, topic) {
  const T = NEIGHBOR_TYPES[p.kind], first = p.name.split(' ')[0];
  const h = holidayToday(), ev = eventToday(), se = seasonOf();
  if (topic === 'hello') {
    if (isBirthday()) return `Happy birthday, ${S.name}! 🎂 How old are you now? ${S.age}? Wow!`;
    if (h) return `Happy ${h.name}! ${h.icon} ${T.hello[0]}`;
    if (S.neighbors.complaints > 0 && p.kind !== 'student') return `Hi... um, it was a little loud at your place late last night. Could you keep it quieter after 10 PM? Thanks!`;
    if (S.bin > 4) return `Hi! Just so you know, your trash bin is getting pretty smelly. Trash day is Tuesday morning!`;
    if (p.rel >= 70) return `${S.name}! My favorite neighbor! ${pickR(T.hello)}`;
    if (p.topics.length === 0 && p.talkedDay < 0) return `Oh, hi! I don't think we've met. I'm ${first}. I'm ${T.job}, and I have ${T.pet}. I love ${T.hobby}!`;
    return pickR(T.hello);
  }
  if (topic === 'weather') {
    if (S.storm) return 'What a storm! ⛈️ Make sure you have a flashlight in case the power goes out.';
    if (S.weather === 'snowy') return S.snowDay ? 'A snow day! ❄️ Everything is closed. Want to build a snowman later?' : 'Look at all this snow! ❄️ Don\'t forget your coat — it\'s freezing!';
    if (S.weather === 'hot') return 'Phew, it\'s SO hot! 🥵 Drink lots of water today, okay?';
    if (S.weather === 'rainy') return 'Rain, rain, rain! 🌧️ Good for my plants, though.';
    if (S.rainbow) return 'Did you see the rainbow this morning? 🌈 So pretty!';
    return { winter: 'Brr, winter is chilly! I can\'t wait for spring.', spring: 'I love spring! 🌷 Everything is blooming.', summer: 'Beautiful summer day! ☀️ Perfect for the beach.', fall: 'I love the fall leaves! 🍂 So many colors.' }[se];
  }
  if (topic === 'news') {
    if (ev) return `Are you going to the ${ev.name}? ${ev.icon} It's at Lakeside Park today!`;
    if (S.election && electionDay()) return 'Today is Election Day! 🗳️ Did you vote yet? Every vote counts!';
    if (S.mayor && Math.random() < 0.3) return `What do you think of Mayor ${S.mayor.name}? I hope they keep their promise!`;
    if (S.news && S.news.length) return `Did you hear? "${S.news[0].text || S.news[0]}" That's what everybody is talking about!`;
    return 'Hmm, nothing much is new on our street. Pretty quiet!';
  }
  if (topic === 'advice') return pickR(T.advice);
  if (topic === 'you') {
    const bits = [];
    if (S.job) bits.push(`How's your job as a ${JOBS[S.job.id].name}?`);
    else bits.push('Are you looking for a job? The Job Center has lots of them!');
    if (S.pets && S.pets.length) bits.push(`And how is ${S.pets[0].name}? So cute!`);
    if (S.ill) bits.push(`You don't look so good... is it ${ILLNESS[S.ill.type].name.toLowerCase()}? Get some rest!`);
    return bits.join(' ');
  }
  return '...';
}
function talkNeighbor(i, topic = 'hello') {
  ensureNeighbors();
  const p = S.neighbors.people[i];
  if (S.hour >= 22 || S.hour < 7) return nope(`Shh! It's late. ${p.name.split(' ')[0]} is sleeping. 😴`);
  const T = NEIGHBOR_TYPES[p.kind], first = p.name.split(' ')[0];
  let line;
  if (topic === 'help') {
    if (p.helpedDay === S.day) line = 'You already helped me today. Thank you so much!';
    else {
      if (S.needs.energy < 15) return nope('You\'re too tired to help right now.');
      p.helpedDay = S.day; pass(1); p.rel = clamp(p.rel + 12);
      if (T.help[0] === 'garden') { S.fridgeFood.push({ id: 'veggies', exp: S.day + 5 }, { id: 'veggies', exp: S.day + 5 }); S.needs.fun = clamp(S.needs.fun + 5); }
      if (T.help[0] === 'dog') { earn(10, `Walked ${first}'s dog`); S.needs.fun = clamp(S.needs.fun + 5); }
      if (T.help[0] === 'study') { const k = pickR(['math', 'write', 'sci']); S.skills[k] = Math.min(100, S.skills[k] + 1); }
      line = T.help[2];
      log(`🤝 You helped your neighbor ${p.name}.`, 'good');
    }
  } else {
    line = neighborLine(p, topic);
    if (!p.topics.includes(topic)) { p.topics.push(topic); p.rel = clamp(p.rel + 3); }
    pass(0.1);
  }
  if (p.talkedDay !== S.day) { p.talkedDay = S.day; p.topics = [topic]; p.rel = clamp(p.rel + 2); S.needs.fun = clamp(S.needs.fun + 4); }
  if (p.rel >= 80) unlock('goodneighbor');
  const hearts = '❤️'.repeat(Math.max(1, Math.round(p.rel / 20)));
  const choices = [['hello', '👋 Say hi'], ['weather', '🌦️ The weather'], ['news', '📰 What\'s new?'], ['you', '🙂 Talk about you'], ['advice', '💡 Ask for advice'], ['help', T.help[1]]];
  showModal(`<div class="talk"><img class="avatar" src="${avatarURL(p.look, 96)}" alt="${esc(p.name)}">
    <div><b>${esc(p.name)}</b> <span class="muted small">${T.job} · ${hearts}</span><div class="bubble">${esc(line)}</div></div></div>
    <p class="muted small">What do you want to say?</p>
    <div class="row">${choices.map(([k, l]) => `<button class="btn sm ${k === topic ? 'primary' : 'ghost'}" onclick="talkNeighbor(${i}, '${k}')">${l}</button>`).join('')}</div>`,
    [{ label: '👋 Say goodbye', cls: 'ghost', fn: () => done() }]);
  save(); render();
}
function neighborsCard() {
  ensureNeighbors();
  const asleep = S.hour >= 22 || S.hour < 7;
  return `<div class="card"><h3>🏘️ Your Neighbors</h3>
    <div class="mrows">${S.neighbors.people.map((p, i) => mrow(`<img class="avatar" style="width:36px;height:36px" src="${avatarURL(p.look, 36)}" alt="">`, p.name,
      `${NEIGHBOR_TYPES[p.kind].job} · ${'❤️'.repeat(Math.max(1, Math.round(p.rel / 20)))}${asleep ? ' · 😴 sleeping' : p.talkedDay === S.day ? ' · talked today' : ''}`,
      b('💬 Talk', `talkNeighbor(${i})`, 'primary', asleep))).join('')}</div>
    <p class="lesson">💡 Being friendly with your neighbors makes your street a nicer place to live!</p></div>`;
}
