// ===================== RENDERING =====================
// Places you can go (shown as buttons under the map) + personal screens
const TABS = [
  { id: 'home',       icon: '🏠', name: 'Home' },
  { id: 'jobcenter',  icon: '💼', name: 'Jobs' },
  { id: 'school',     icon: '🎓', name: 'College' },
  { id: 'library',    icon: '📚', name: 'Library' },
  { id: 'sports',     icon: '🏅', name: 'Sports' },
  { id: 'market',     icon: '🛒', name: 'Market' },
  { id: 'mall',       icon: '🛍️', name: 'Mall' },
  { id: 'diner',      icon: '🍔', name: 'Diner' },
  { id: 'cars',       icon: '🚙', name: 'Car Shop' },
  { id: 'bank',       icon: '🏦', name: 'Bank' },
  { id: 'realestate', icon: '🔑', name: 'Homes' },
  { id: 'hospital',   icon: '🏥', name: 'Hospital' },
  { id: 'park',       icon: '🌳', name: 'Park' },
  { id: 'petshop',    icon: '🐾', name: 'Pets' },
  { id: 'vet',        icon: '🩺', name: 'Vet' },
  { id: 'cityhall',   icon: '🏛️', name: 'City Hall' },
  { id: 'theater',    icon: '🎭', name: 'Theater' },
  { id: 'places',     icon: '🧭', name: 'All Places', personal: true },
  { id: 'money',      icon: '💰', name: 'Money', personal: true },
  { id: 'me',         icon: '🧑', name: 'Me', personal: true },
  { id: 'goals',      icon: '🏆', name: 'Goals', personal: true },
];

function bar(v) {
  const cls = v < 25 ? 'low' : v < 50 ? 'mid' : 'ok';
  return `<div class="bar"><div class="fill ${cls}" style="width:${v}%"></div></div>`;
}
function lvlBar(v) {
  return `<div class="bar small"><div class="fill skill" style="width:${v}%"></div></div>`;
}
function workDue() {
  if (!S.job || !worksToday() || S.today.worked || S.today.sick || S.day < S.job.startDay) return false;
  const sh = shiftNow();
  return S.hour >= sh.from - 1 && S.hour < sh.to;
}

// everything new about real life starts here for old and new saves
function ensureRealLife() {
  ensureCalendarState();
  ensureLifeState();
  ensureSocialState();
  ensureWorkState();
  ensureCarState();
  ensureBuildState();
  ensureToyState();
  ensureTown2State();
  ensureTown3State();
  ensureMoney2State();
  ensureInteractState();
  ensureHolidayState();
}

function render() {
  if (!S) return;
  const wd = WEEKDAYS[weekday()];
  const night = S.hour < 6 || S.hour >= 20;
  document.body.classList.toggle('night', night);

  $('#hud').innerHTML = `
    <div class="who">${avatarImg(S.look, 48)}<div><b>${esc(S.name)}</b> <span class="muted">· age ${S.age}${isBirthday() ? ' 🎂' : ''}</span><div class="muted">📍 ${esc(locName(S.loc))}</div></div>${phoneButton()}</div>
    <div class="clock"><div class="big">${fmtTime(S.hour)}</div><div class="muted">${wd}, ${dateText()}${isWeekend() ? ' 🎉' : ''} · ${SEASONS[seasonOf()].icon} ${SEASONS[seasonOf()].name}</div><div class="muted">${weatherText()}${holidayToday() ? ` · ${holidayToday().icon} ${holidayToday().name}` : ''}${eventToday() ? ` · ${eventToday().icon} ${eventToday().name}` : ''}</div></div>
    <div class="cash"><div class="big ${S.money < 0 ? 'neg' : ''}">${money(S.money)}</div><div class="muted">${S.savings > 0 ? '🐷 ' + money(S.savings) : ''}${S.loan > 0 ? ' · 💳 owe ' + money(S.loan) : ''}</div></div>`;

  $('#needs').innerHTML = Object.entries(NEEDS).map(([k, d]) =>
    `<div class="need" title="${d.name}"><span>${d.icon} ${d.name}</span>${bar(S.needs[k])}<span class="num">${Math.round(S.needs[k])}</span></div>`).join('');

  const warn = [];
  { const lc = lostChip(); if (lc) warn.push(lc); const hc2 = holidayChip(); if (hc2) warn.push(hc2); }
  if (S.roadwork) warn.push('<span class="chip">🚧 Road work in town — trips take a bit longer</span>');
  if (S.t3 && S.t3.jetlag > 0) warn.push('<span class="chip warn">😵 Jet lag! You feel extra tired.</span>');
  if (S.mail && unreadMail() && S.loc === 'home') warn.push(`<button class="chip warn" onclick="mailbox()">📬 You have mail! (${unreadMail()}) tap to open</button>`);
  if (S.moving) warn.push(`<button class="chip warn" onclick="movingModal()">📦 Moving day! ${S.moving.boxes} boxes to move (tap)</button>`);
  if (S.broken) warn.push(`<span class="chip warn">${BREAKS[S.broken.kind].icon} Broken at home: ${BREAKS[S.broken.kind].name}</span>`);
  if (S.grandmaAsk) warn.push(`<span class="chip warn">👵 Grandma needs help with ${S.grandmaAsk.what} — visit your parents' house</span>`);
  if (S.powerOut) warn.push(`<span class="chip warn">🔌 The power is out! (${Math.ceil(S.powerOut)} hrs left)</span>`);
  if (S.needs.thirst < 25) warn.push(`<button class="chip warn" onclick="quickDrink()">💧 You're thirsty! (tap to drink water)</button>`);
  if (S.ill) warn.push(`<button class="chip warn" onclick="takeMedicine()">${ILLNESS[S.ill.type].icon} You have ${ILLNESS[S.ill.type].name.toLowerCase()} (${S.ill.days}d) · tap for medicine</button>`);
  const cc = coldChip(); if (cc) warn.push(cc);
  const hc = hairChip(); if (hc) warn.push(hc);
  if (weekday() === 1 && S.hour < 8 && S.bin > 0 && !S.today.binOut && S.home !== 'parents') warn.push(`<button class="chip warn" onclick="binsToCurb()">🚛 It's trash day! Put the bin at the curb before 8 AM (tap)</button>`);
  if (S.trash >= 90) warn.push('<span class="chip warn">🗑️ Your trash is full! Take it out.</span>');
  if (S.bugs) warn.push('<span class="chip warn">🐜 There are ants in your kitchen! Clean up.</span>');
  if (hasCar() && S.fuel < 15) warn.push(`<span class="chip warn">⛽ Low on gas! Fill up at the Gas Station.</span>`);
  if (hasCar() && S.car.miles - S.car.oilAt > 3000) warn.push(`<span class="chip warn">🛢️ Your car needs an oil change!</span>`);
  if (S.car && S.car.flat) warn.push(`<span class="chip warn">🛞 You have a flat tire!</span>`);
  if (S.invite && S.invite.day === S.day) warn.push(`<button class="chip warn" onclick="openPhone('msgs')">💬 ${esc(S.invite.name)} invited you to ${S.invite.plan}! (tap)</button>`);
  if (S.needs.bladder < 25) warn.push(`<button class="chip warn" onclick="quickToilet()">🚽 You really need the bathroom! (tap to go)</button>`);
  if (S.handsDirty) warn.push(`<button class="chip warn" onclick="washHands();done()">🧼 Wash your hands! (tap)</button>`);
  (S.pets || []).forEach(p => {
    if (p.food < 25) warn.push(`<span class="chip warn">${PET_TYPES[p.kind].icon} ${esc(p.name)} is hungry!</span>`);
    else if (p.clean < 25) warn.push(`<span class="chip warn">${PET_TYPES[p.kind].icon} ${esc(p.name)}'s home is dirty!</span>`);
    if (PET_TYPES[p.kind].walks && !p.walked && S.hour >= 16) warn.push(`<span class="chip warn">🦮 ${esc(p.name)} needs a walk!</span>`);
  });
  if (S.needs.food < 25) warn.push('<span class="chip warn">🍽️ You are hungry!</span>');
  if (S.needs.energy < 20) warn.push('<span class="chip warn">⚡ You are exhausted!</span>');
  if (S.needs.hygiene < 30) warn.push('<span class="chip warn">🧼 You need a shower!</span>');
  if (S.needs.health < 30) warn.push('<span class="chip warn">❤️ Your health is low! Visit the 🏥 Hospital.</span>');
  if (S.laundryDays > 7) warn.push('<span class="chip warn">👕 Your clothes are dirty!</span>');
  if (!S.today.brushAM && S.hour >= 8.5 && S.hour < 15) warn.push('<span class="chip warn">🪥 Brush your teeth after breakfast (2 minutes)!</span>');
  if (!S.today.brushPM && S.hour >= 19) warn.push('<span class="chip warn">🪥 Brush your teeth after dinner!</span>');
  if (workDue()) warn.push(`<button class="chip warn" onclick="goWork()">💼 Time to go to work! (tap to go)</button>`);
  $('#warnings').innerHTML = warn.join('');

  const curP = PLACES[placeId(S.loc)];
  const tabList = curP && curP.far ? [{ id: S.loc, icon: curP.icon, name: curP.name.split(' ')[0] }, ...TABS] : TABS;
  $('#tabs').innerHTML = tabList.map(t => {
    const here = !t.personal && placeId(t.id) === placeId(S.loc);
    return `<button class="tab ${tab === t.id ? 'active' : ''} ${here ? 'here' : ''} ${t.personal ? 'personal' : ''}" onclick="setTab('${t.id}')">${t.icon}<span>${t.name}</span>${here ? '<i>📍</i>' : ''}</button>`;
  }).join('');

  $('#view').innerHTML = viewFor(tab);
  const roomCv = $('#room');
  if (roomCv) { drawRoom(roomCv); setupRoomInteract(roomCv); }
  const doorCv = $('#doorcv');
  if (doorCv && !doorAnim) drawDoorView(doorCv, 0);
  if (document.querySelector('canvas.petpic')) drawShopPics();
  const intCv = $('#intcv');
  if (intCv) drawInterior(intCv, intCv.dataset.pid);
  const entCv = $('#entcv');
  if (entCv && !placeDoorAnim) drawEntrance(entCv, entCv.dataset.pid, 0);
  const buildCv = $('#buildcv');
  if (buildCv) drawBuildView(buildCv);
  $('#log').innerHTML = S.log.slice(0, 40).map(l => `<li class="${l.kind}"><span class="t">${l.t}</span> ${l.text}</li>`).join('');
}

const PLACE_VIEWS = {
  home: () => viewHome(),
  jobcenter: () => teenJobsCard() + viewJobs(),
  school: () => viewSchool() + `<div class="grid two">${musicCard()}${langCard()}</div>`,
  library: () => libraryCard() + viewLibrary(),
  sports: () => `<div class="grid two">${teamCard()}${poolCard()}</div>` + viewSports(),
  market: () => treeCard() + groceryAisle() + viewShopAt('market'),
  mall: () => viewShopAt('mall'),
  diner: () => `<div class="card"><h3>🍽️ Sit Down & Order</h3><p>Get a table, order from the menu, and leave a tip for your server.</p><button class="btn primary" onclick="sitDown()">🍽️ Get a table</button></div>` + viewShopAt('diner'),
  cars: () => viewShopAt('cars'),
  bank: () => viewBank() + `<div class="grid two">${statementCard()}${jarsCard()}</div>` + `<div class="grid two">${creditCard()}<div class="card"><h3>📊 Weekly Budget</h3>${budgetHtml()}</div></div>`,
  realestate: () => viewHousing() + viewLand(),
  hospital: () => checkupCard() + viewHospital(),
  park: () => viewParkEvent() + farmersMarketCard() + petShowCard() + cookoffCard() + viewPark(),
  gasstation: () => viewGas(), salon: () => viewSalon(), dmv: () => viewDmv(), airport: () => viewAirport(),
  h_parents: () => viewFamilyVisit() + `<div class="card"><h3>👵 Grandma (age ${S.family.grandma.age})</h3><p>${S.grandmaAsk ? `Grandma needs help with <b>${S.grandmaAsk.what}</b>!` : 'Grandma is knitting and loves visitors.'}</p><button class="btn sm primary" onclick="helpGrandma()">${S.grandmaAsk ? `🤝 Help with ${S.grandmaAsk.what}${S.grandmaAsk.what === 'groceries' ? ' ($30)' : S.grandmaAsk.what === 'medicine' ? ' ($10)' : ''}` : '☕ Visit Grandma (1.5 hrs)'}</button></div>`,
  lot_country: () => viewLot('lot_country'), lot_river: () => viewLot('lot_river'), lot_sea: () => viewLot('lot_sea'),
  petshop: () => shelterCard() + viewPetShop(),
  vet: () => viewVet(),
  cityhall: () => viewCivic() + artShowCard() + paradeCard() + charityCard() + companyCard() + viewWorkplace('cityhall'),
  postoffice: () => viewPostOffice(), museum: () => viewMuseum(), police: () => '', firestation: () => '', recycling: () => viewRecycling(),
  theater: () => recitalCard() + movieCard() + viewWorkplace('theater'),
  beach: () => viewTrip('beach'), trailhead: () => viewTrip('trailhead'), lake: () => viewTrip('lake'),
  campground: () => viewTrip('campground'), village: () => viewTrip('village'), zoo: () => viewTrip('zoo'),
};

function viewFor(t) {
  if (t === 'me') return viewMe();
  if (t === 'goals') return viewGoals();
  if (t === 'money') return jarsCard() + moneyIdeas2Card() + viewMoney();
  if (t === 'places') return viewDirectory();
  if (placeId(t) !== placeId(S.loc)) return viewGoThere(t);
  const place = placeOf(t);
  const pid = placeId(t);
  const outside = t !== 'home' && ENTRANCE[pid] && S.insideOf !== pid;
  const head = `<div class="placehead"><span class="pic">${t === 'home' ? home().icon : place.icon}</span><div><h2>${t === 'home' ? `Home: ${home().name}` : place.name}</h2><p class="muted">${outside || (t === 'home' && !S.doorOpen) ? 'You\'re outside.' : 'You are here.'}</p></div></div>`;
  if (outside) return head + entranceSection(pid) + (S.job && workplaceOf(JOBS[S.job.id]) === pid ? jobCard() : '');
  const body = (t !== 'home' && ENTRANCE[pid] ? interiorSection(pid) : '') + (PLACE_VIEWS[t] ? PLACE_VIEWS[t]() : TOWN_ACTIONS[t] ? viewTownPlace(t) : viewWorkplace(t));
  const search = t !== 'home' && /onclick="(buy|buyFood|farEat|farFood|farGear|buyCraftKit|buyPet|buyFlip|buyPack)/.test(body) ? shopSearchBar() : '';
  return head + search + holidayEventCard(t === 'home', pid) + townTreeCard(pid) + body + tipJar(pid) + tourCard(pid) + (pid !== 'home' ? teenJobsAt(pid) : '') + (WILD[pid] ? `<div class="card"><h3>👀 Spot Wildlife</h3><p class="muted">Look for animals and add them to your nature journal!</p><button class="btn sm primary" onclick="spotWildlife()">👀 Look around (45 min)</button></div>` : '') + farStoreCard(pid) + outdoorToysCard(pid) + (t !== 'home' ? jobsHereCard(pid) : '') + volunteerCard(pid) + (t !== 'home' || S.doorOpen ? money2Section(t === 'home' ? 'home' : pid) : '') + moneySection(t) + (t === 'home' ? '' : restroomBar());
}

function viewGoThere(t) {
  const p = placeOf(t);
  const info = travelInfo(S.loc, t);
  const blurb = {
    home: 'Eat, sleep, shower, use the toilet and relax.', jobcenter: 'Look at the job board and go to job interviews.',
    school: 'Take skill classes or study for a degree.', library: 'Study for free and read books.',
    sports: 'Practice sports, pay for lessons and enter tournaments.', market: 'Buy groceries to eat at home.',
    mall: 'Clothes, electronics and stuff for your home.', diner: 'Eat out: burgers, salads, pancakes and milkshakes.',
    cars: 'Buy a bike or a car to get around faster.', bank: 'Savings, loans, health insurance and the stock market.',
    realestate: 'Rent an apartment, buy a house, or buy rental houses.', cityhall: 'Start a business, enter the Invention Fair, buy raffle tickets.', theater: 'Talent Show every Saturday evening!',
    beach: 'Swim in the ocean, surf, build sandcastles, collect seashells.', trailhead: 'Hike to the snowy top or go skiing.',
    lake: 'Go fishing and paddle a canoe.', campground: 'Camp overnight in the forest and roast marshmallows.',
    village: 'A farmers market: buy fresh food, sell veggies, shells and fish.', zoo: 'See elephants, giraffes and zebras.', hospital: 'See a doctor when you feel sick.', park: 'Relax by the lake, feed the ducks, hang out with friends.',
  }[t] || (PLACES[t] && PLACES[t].blurb) || 'A place in town.';
  const isWork = S.job && workplaceOf(JOBS[S.job.id]) === placeId(t);
  return `<div class="card goto">
    <div class="placehead"><span class="pic">${t === 'home' ? home().icon : p.icon}</span><div><h2>${t === 'home' ? 'Home' : p.name}</h2><p>${blurb}</p></div></div>
    <p>You are at <b>${esc(locName(S.loc))}</b>. ${info.icon} You'd ${info.how === 'took the bus' ? 'take the bus' : info.how.replace('drove', 'drive').replace('biked', 'bike').replace('walked', 'walk')} there: <b>${travelTime(info.hours)}</b>${info.cost ? `, $${info.cost} bus fare` : ''}.</p>${busText(info)}
    <button class="btn primary" onclick="travelTo('${t}')">${info.icon} Go to ${t === 'home' ? 'Home' : p.name}</button>
    ${isWork ? '<p class="muted">This is where you work. Use the "Go to Work" button to start your shift.</p>' : ''}
    <p class="muted small">Tip: you can also click buildings on the map.</p>
  </div>`;
}

function viewDirectory() {
  const groups = [['🏙️ Maple Town', id => (!PLACES[id].far && PLACES[id].kind === 'place') || PLACES[id].town === 'maple']];
  TOWN_NAMES.slice(1).forEach(tn => groups.push([tn.name, id => PLACES[id].town && tn.name.toLowerCase().includes(PLACES[id].town === 'seaside' ? 'seaside' : PLACES[id].town)]));
  groups.push(['🌳 Outdoors', id => PLACES[id].far && !PLACES[id].town]);
  const row = id => {
    const p = PLACES[id];
    const here = placeId(S.loc) === id;
    const info = here ? null : travelInfo(S.loc, id);
    return `<div class="mrow"><span class="mi">${p.icon}</span><div class="mt"><b>${p.name}</b><small>${here ? '📍 You are here' : `${info.icon} ${travelTime(info.hours)}${info.cost ? ` · $${info.cost}` : ''}`}${ENTRANCE[id] ? ` · ${hoursText(id)}` : ''}</small></div>
      <div class="mb">${here ? `<button class="btn sm ghost" onclick="setTab('${id}')">Look</button>` : `<button class="btn sm primary" onclick="travelTo('${id}')">Go</button>`}</div></div>`;
  };
  return `<h2>🧭 All Places</h2><p class="muted">Every place in the world, sorted by town. Far places take longer to get to!</p>
    ${groups.map(([name, f]) => { const ids = Object.keys(PLACES).filter(f); return ids.length ? `<div class="card money"><h3>${name}</h3><div class="mrows">${ids.map(row).join('')}</div></div>` : ''; }).join('')}`;
}

function restroomBar() {
  return `<div class="card restroom"><b>🚻 Restroom</b>
    <button class="btn ghost sm" onclick="useToilet();done()">🚽 Use the toilet</button>
    <button class="btn ghost sm" onclick="washHands();done()">🧼 Wash hands</button>
    <button class="btn ghost sm" onclick="goToBed()">😴 Go to bed</button>
    ${photoButton()}
    <button class="btn ghost sm" onclick="travelTo('home')">🏠 Go home</button></div>`;
}

function setTab(t) {
  tab = t; render();
  if (t === 'me') {
    const el = $('#restyle');
    if (el) characterCreator(el, S.look, () => { save(); const hud = $('#hud img.avatar'); if (hud) hud.src = avatarURL(S.look, 48); });
  }
}

// ---------- views ----------
function jobCard() {
  if (!S.job) return `<div class="card job none"><h3>💼 No Job</h3><p>You need money! Go to the <a onclick="setTab('jobcenter')">💼 Job Center</a> to find work.</p></div>`;
  const j = S.job, job = JOBS[j.id];
  const wp = workplaceOf(job);
  const c = travelInfo('home', wp);
  const sh = SHIFTS[shiftOf(job)];
  const canWork = worksToday() && !S.today.worked && !S.today.sick && S.day >= j.startDay;
  let status;
  if (S.day < j.startDay) status = 'Your first day is tomorrow.';
  else if (S.today.vacation) status = '🏖️ Vacation day — enjoy!';
  else if (!worksToday()) status = S.snowDay ? '❄️ Snow day — work is closed!' : 'Day off — no work today! 🎉';
  else if (S.today.worked) status = '✅ You worked today.';
  else if (S.today.sick) status = '🤒 Called in sick today.';
  else status = `Be there by ${fmtTime(sh.late)} to be on time.`;
  return `<div class="card job">
    <h3>💼 ${jobTitle(j)} <span class="muted">$${j.wage.toFixed(2)}/hr at ${PLACES[wp].icon} ${PLACES[wp].name}</span></h3>
    <p class="muted">${status} · Trip from home: ${c.icon} ${travelTime(c.hours)}${c.cost ? `, $${c.cost} bus each way` : ''}</p>
    <p class="muted">🕐 ${sh.label}</p>
    <p class="muted">This week: ${j.weekHours} hrs · Days worked: ${j.daysWorked} · Missed: ${j.misses}/3 · Warnings: ${j.warnings}/3</p>
    <p class="muted">🏖️ Vacation days: ${j.pto || 0} · 🤒 Paid sick days: ${j.sickDays || 0}${j.boss ? ` · 👔 Boss: ${esc(j.boss.name)} (${j.boss.style}) · 👥 Coworkers: ${j.coworkers.map(w => esc(w.name)).join(', ')}` : ''}</p>
    <div class="row">
      <button class="btn primary" ${canWork ? '' : 'disabled'} onclick="goWork()">${c.icon} Go to Work (8 hrs)</button>
      <button class="btn ghost" ${canWork && j.pto > 0 ? '' : 'disabled'} onclick="takeVacationDay()">🏖️ Take a Vacation Day</button>
      <button class="btn ghost" ${canWork ? '' : 'disabled'} onclick="callInSick()">📞 Call in Sick</button>
      ${canRetire() ? '<button class="btn primary" onclick="retire()">🏖️ Retire</button>' : ''}
      <button class="btn ghost danger" onclick="quitJob()">Quit</button>
    </div></div>`;
}

function viewHome() {
  const acts = HOME_ACTIONS.map(a => {
    const locked = a.need && !hasF(a.need);
    const hint = typeof a.hint === 'function' ? a.hint() : a.hint;
    return `<button class="action ${locked ? 'locked' : ''}" ${locked ? 'disabled' : ''} onclick="homeAct('${a.id}')">
      <span class="ic">${a.icon}</span><b>${a.name}</b><small>${locked ? '🔒 Buy one at the Mall' : hint}</small></button>`;
  }).join('');
  if (!S.doorOpen) return `${doorSection()}${jobCard()}${neighborsCard()}`;
  const [ti, tl, tc] = teethStatus();
  return `${brokenCard()}${homeSection().replace('</canvas></div>', '</canvas></div>' + roomBar())}${petsSection()}${jobCard()}
    <div class="row info">
      <span class="chip">👕 Clothes: ${['', 'Basic', 'Nice', 'Business suit'][S.clothes]}${S.laundryDays > 7 ? ' (dirty!)' : ` (clean, ${7 - S.laundryDays}d left)`}</span>
      <span class="chip">${S.today.showered ? '✅' : '⬜'} Shower today</span>
      <span class="chip">🪥 Teeth: ${S.today.brushAM ? '✅' : '⬜'} morning ${S.today.brushPM ? '✅' : '⬜'} night</span>
      <span class="chip ${tc}">🦷 ${ti} ${tl}</span>
    </div>
    <div class="row info"><span class="chip">${S.handsDirty ? '⚠️ Hands are dirty' : '✅ Hands are clean'}</span>
      <span class="chip ${S.mess > 60 ? 'warn' : ''}">🧹 Mess: ${Math.round(S.mess)}%</span><span class="chip ${S.dishes > 5 ? 'warn' : ''}">🍽️ ${S.dishes} dirty dishes</span><span class="chip ${S.trash > 80 ? 'warn' : ''}">🗑️ Trash ${Math.round(S.trash)}%</span>
      ${S.home !== 'parents' ? `<button class="chip" onclick="binsToCurb()">🚛 Bin: ${S.bin ? S.bin + ' bags (trash day is Tuesday)' : 'empty'}</button>` : `<button class="chip" onclick="choreAllowance()">💵 Ask Mom for chore money</button>`}
      ${S.bugs ? '<button class="chip warn" onclick="bugSpray()">🐜 Spray the ants</button>' : ''}${lockChip()}</div>
    <div class="row info"><b class="small">🧊 Kitchen:</b> ${fridgeChips()}</div>
    ${holidayCard()}
    <h3>Things to do at home</h3><div class="grid actions">${acts}</div>
    ${snowFunCard()}${teenJobsAt('home')}${chartCard()}${petTricksCard()}${energyCard()}${waterCard()}${carCard()}${gardenCard()}${roommateCard()}${decorateCard()}${neighborsCard()}`;
}
function homeAct(id) {
  const a = HOME_ACTIONS.find(x => x.id === id);
  if (S.powerOut && ['tv', 'games', 'laptop', 'computer', 'movie'].includes(id)) return nope('🔌 The power is out! That needs electricity.');
  const before = S.hour + S.day * 24;
  a.fn();
  if (['clean', 'dishes', 'laundry'].includes(id)) chartMark(id);
  if (['tv', 'games', 'laptop', 'computer', 'movie', 'music'].includes(id)) { S.kwh += 0.3; if (S.hour >= 22 || S.hour < 6) S.lateNoise = true; }
  if (S.hour + S.day * 24 !== before) done(); else render();
}

function viewJobs() {
  const cats = ['All', ...new Set(JOBS.map(j => j.cat))];
  let list = JOBS.filter(j => jobFilter.cat === 'All' || j.cat === jobFilter.cat);
  if (jobFilter.onlyCan) list = list.filter(meetsReqs);
  list = [...list].sort((a, b) => a.pay - b.pay);
  const qualified = JOBS.filter(meetsReqs).length;
  return `<h3>Job Board <span class="muted">(${JOBS.length} jobs · you qualify for ${qualified})</span></h3>
    <p class="muted">Interviews happen on weekdays, 8 AM–4 PM. Dress nicely, be clean, and tell them what you can do!</p>
    <div class="row filters">
      <select onchange="jobFilter.cat=this.value;render()">${cats.map(c => `<option ${c === jobFilter.cat ? 'selected' : ''}>${c}</option>`).join('')}</select>
      <label><input type="checkbox" ${jobFilter.onlyCan ? 'checked' : ''} onchange="jobFilter.onlyCan=this.checked;render()"> Only jobs I'm qualified for</label>
    </div>
    <div class="grid jobs">${list.map(j => {
      const can = canApply(j);
      const ok = meetsReqs(j);
      const cd = S.cooldown[j.id] && S.cooldown[j.id] > S.day;
      const mine = S.job && S.job.id === j.id;
      const reqs = j.req.length ? j.req.map(r => {
        const good = skillLevel(r.s) >= r.lvl;
        return `<span class="req ${good ? 'good' : 'bad'}">${skillName(r.s)} ${r.lvl}</span>`;
      }).join('') : '<span class="req good">No skills needed</span>';
      return `<div class="card jobc ${ok ? 'qual' : ''} ${mine ? 'mine' : ''}">
        <div class="jt"><b>${j.name}</b><span class="pay">$${j.pay}/hr</span></div>
        <div class="muted small">${j.cat} · ~${money(j.pay * 40)}/week${j.insurance ? ' · 🩺 insurance' : ''}</div>
        <div class="req ${S.edu >= j.edu ? 'good' : 'bad'}">🎓 ${EDU_NAMES[j.edu]}</div>
        <div class="reqs">${reqs}</div>
        ${mine ? '<button class="btn" disabled>Your job</button>'
          : cd ? `<button class="btn" disabled>Re-apply Day ${S.cooldown[j.id]}</button>`
          : `<button class="btn ${can.ok ? 'primary' : 'ghost'}" onclick="startInterview(${j.id})">Apply</button>`}
      </div>`;
    }).join('')}</div>`;
}

function viewSchool() {
  const edu = EDUCATION.map(e => {
    const prog = S.eduProgress[e.level];
    const doneE = S.edu >= e.level;
    const can = S.edu >= e.needs;
    return `<div class="card">
      <h3>🎓 ${e.name} ${doneE ? '✅' : ''}</h3><p>${e.desc}</p>
      <p class="muted">${e.sessions} classes · ${money(e.price)} each (${money(e.price * e.sessions)} total) · ${e.hours} hrs each</p>
      ${lvlBar(prog / e.sessions * 100)}<p class="muted">${prog}/${e.sessions} classes done</p>
      ${doneE ? '' : `<button class="btn ${can ? 'primary' : 'ghost'}" onclick="attendSchool(${e.level})">${can ? `Go to class (${money(e.price)})` : `Needs ${EDU_NAMES[e.needs]}`}</button>`}
    </div>`;
  }).join('');
  const classes = Object.entries(SKILLS).map(([k, s]) => `<div class="card skill">
      <div class="jt"><b>${s.icon} ${s.name}</b><span>${Math.round(S.skills[k])}</span></div>${lvlBar(S.skills[k])}
      <div class="row"><button class="btn primary sm" onclick="takeClass('${k}')">Class ${money(s.price)} · 2h</button></div>
    </div>`).join('');
  return `<p>You have a <b>${EDU_NAMES[S.edu]}</b>. More education = better jobs. Can't afford it? The 🏦 Bank gives student loans.</p>
    <div class="grid two">${edu}</div>
    <h2>📝 Skill Classes</h2><p class="muted">Classes cost money but teach you fast. The 📚 Library is free but slower. Open 8 AM–9 PM.</p>
    <div class="grid skills">${classes}</div>`;
}

function viewSports() {
  const cards = Object.entries(SPORTS).map(([k, s]) => {
    const lvl = S.sports[k];
    const gearOk = !s.gear || S.owned['gear_' + k];
    return `<div class="card sport">
      <div class="jt"><b>${s.icon} ${s.name}</b><span>Level ${Math.round(lvl)}</span></div>${lvlBar(lvl)}
      ${s.gear ? `<p class="muted small">${gearOk ? `✅ You have a ${s.gear.name}` : `Needs: ${s.gear.name}`}</p>` : `<p class="muted small">No gear needed · ${s.practiceWhere} $${s.practiceFee}</p>`}
      ${!gearOk ? `<button class="btn primary sm" onclick="buyGear('${k}')">Buy ${s.gear.name} (${money(s.gear.price)})</button>` : `
      <div class="row">
        <button class="btn ghost sm" onclick="practice('${k}')">Practice${s.practiceFee ? ` $${s.practiceFee}` : ' (free)'}</button>
        <button class="btn primary sm" onclick="lesson('${k}',false)">Coach ${money(s.lesson)}</button>
        <button class="btn primary sm" ${lvl < 40 ? 'disabled title="Reach level 40 first"' : ''} onclick="lesson('${k}',true)">⭐ Pro Coach ${money(s.pro)}</button>
      </div>
      <details><summary>🏆 Tournaments (weekends)</summary>
        ${TOURNAMENTS.map(t => `<div class="trow"><span>${t.name}<br><small class="muted">Entry ${money(t.fee)} · 1st: ${money(t.prize1)} · players ~level ${t.opp}</small></span>
          <button class="btn sm ${isWeekend() ? 'primary' : 'ghost'}" onclick="tournament('${k}','${t.id}')">Enter</button></div>`).join('')}
      </details>`}
    </div>`;
  }).join('');
  const trophies = S.trophies.length ? S.trophies.map(t => `<span class="chip">🏆 ${SPORTS[t.sport].icon} ${TOURNAMENTS.find(x => x.id === t.t).name} (Day ${t.day})</span>`).join('') : '<span class="muted">No trophies yet.</span>';
  return `<p>Practice on your own for free (or cheap), or <b>pay a coach</b> to get better faster. When you reach level 40, a ⭐ Pro Coach will train you.
    Enter <b>tournaments on Saturday & Sunday</b> (7 AM–1 PM) to win prize money! Get really good and you could even go pro (check the Sports jobs).</p>
    <p class="muted">Sports make you sweaty and tired — shower afterwards!</p>
    <div class="grid sports">${cards}</div>
    <h3>Trophy Case</h3><div class="row">${trophies}</div>`;
}

function viewShopAt(place) {
  const items = ITEMS.filter(i => i.place === place);
  const cats = [...new Set(items.map(i => i.cat))];
  const intro = {
    market: 'Groceries are the cheapest way to eat. Don\'t forget toilet paper and soap! Open 8 AM–10 PM.',
    mall: 'Furniture, appliances, bathroom stuff, decorations, clothes and more. Think before you buy: do you <b>need</b> it, or just <b>want</b> it? Open 8 AM–10 PM.',
    diner: 'Eating out is fast and tasty, but costs more than cooking at home.',
    cars: 'A bike is free to ride. A car is fastest but costs money every week. Driving skill 20 needed for a car.',
  }[place];
  return `<p class="muted">${intro}</p>
    ${place === 'market' ? `<p>🛒 Meals at home: <b>${S.groceries}</b></p>` : ''}
    ${cats.map(c => `${cats.length > 1 ? `<h3>${c}</h3>` : ''}<div class="grid shop">${items.filter(i => i.cat === c).map(it => {
      const owned = !it.consumable && !it.clothes && has(it.id);
      const clothesOwned = it.clothes && S.clothes >= it.clothes;
      return `<div class="card item ${owned || clothesOwned ? 'owned' : ''}">
        <div class="jt"><b>${it.icon} ${it.name}</b><span class="pay">${money(it.price)}${taxedPlace(it) ? '<small class="muted"> + tax</small>' : ''}</span></div>
        <p class="muted small">${it.desc}</p>
        ${owned ? `<div class="row"><span class="chip good">✅ Owned</span><button class="btn ghost sm" onclick="sellItem('${it.id}')">Sell</button></div>`
          : clothesOwned ? '<span class="chip good">✅ Owned</span>'
          : `<button class="btn primary sm" onclick="buy('${it.id}')">${it.consumable && it.id !== 'groceries' ? 'Order' : 'Buy'}</button>`}
      </div>`;
    }).join('')}</div>`).join('')}`;
}

function viewLibrary() {
  return `<p>Shhh! 🤫 Studying here is <b>free</b>. It's slower than paying for a class, but it costs nothing. Open 8 AM–9 PM.</p>
    <div class="grid skills">${LIBRARY_SKILLS.map(k => `<div class="card skill">
      <div class="jt"><b>${SKILLS[k].icon} ${SKILLS[k].name}</b><span>${Math.round(S.skills[k])}</span></div>${lvlBar(S.skills[k])}
      <button class="btn primary sm" onclick="library('${k}')">📖 Study (free · 3 hrs)</button></div>`).join('')}</div>`;
}

function viewHospital() {
  const insured = S.insurance || (S.job && JOBS[S.job.id].insurance);
  return `<p>Feeling sick? A doctor can help you get better faster.</p>
    <div class="grid two">
      <div class="card"><h3>🩺 See a Doctor</h3><p>Health +45 · 1.5 hrs</p>
        <p>Cost: <b>${insured ? '$20' : '$150'}</b> ${insured ? '(you have health insurance!)' : '(no insurance)'}</p>
        <button class="btn primary" onclick="seeDoctor()">See the doctor</button></div>
      <div class="card"><h3>🦷 Dentist</h3><p>Teeth: <b>${teethStatus()[0]} ${teethStatus()[1]}</b></p>
        <p>A cleaning makes your teeth sparkling clean. Cost: <b>${insured ? '$15' : '$90'}</b></p>
        <button class="btn primary" onclick="dentistClean()">Get a teeth cleaning</button></div>
      <div class="card"><h3>💉 Flu Shot</h3><p>Helps stop you from getting the flu this year.</p>
        <p>Cost: <b>${insured ? 'Free' : '$25'}</b> ${S.fluShot === dateOf().year ? '· ✅ You got one this year' : ''}</p>
        <button class="btn primary" ${S.fluShot === dateOf().year ? 'disabled' : ''} onclick="fluShot()">Get a flu shot</button>
        ${S.ill ? `<p>Right now you have: <b>${ILLNESS[S.ill.type].icon} ${ILLNESS[S.ill.type].name}</b> (${S.ill.days} more days). ${ILLNESS[S.ill.type].about}</p>` : ''}</div>
      <div class="card"><h3>🚑 Emergency Room</h3><p>If your health reaches zero, an ambulance brings you here.</p>
        <p>Bill: <b>${insured ? '$300' : '$3,000'}</b></p>
        <p class="lesson">💡 Health insurance is sold at the 🏦 Bank. Some jobs give it to you for free.</p></div>
    </div>`;
}

function viewPark() {
  return `<p>A sunny park with a lake, ducks, a playground and lots of trees. Most things here are free!</p>
    <div class="grid actions">${PARK_ACTIONS.map(a => `<button class="action" onclick="parkAct('${a.id}')"><span class="ic">${a.icon}</span><b>${a.name}</b><small>${a.hint}</small></button>`).join('')}</div>`;
}
function parkAct(id) {
  const a = PARK_ACTIONS.find(x => x.id === id);
  const before = S.hour + S.day * 24;
  a.fn();
  if (S.hour + S.day * 24 !== before) done(); else render();
}

function viewWorkplace(t) {
  const mine = S.job && workplaceOf(JOBS[S.job.id]) === placeId(t);
  return `${mine ? jobCard() : ''}`;
}

function viewHousing() {
  const cur = home();
  return `
    <div class="card"><h3>You live in: ${cur.icon} ${cur.name}</h3><p>${cur.desc}</p>
    ${cur.type === 'rent' ? `<p>Rent: ${money(cur.rent)}/week + ${money(cur.utilities)} utilities, paid every Monday.${S.missedRent ? ` <b class="neg">Missed rent: ${S.missedRent}/2</b>` : ''}</p>` : ''}
    ${cur.type === 'buy' ? `<p>You own this home! ${S.mortgage ? `Mortgage left: ${money(S.mortgage.balance)} (${money(S.mortgage.weekly)}/week)` : 'No mortgage — it\'s all yours.'} Property tax & utilities: ${money(cur.upkeep)}/week.</p>
      <div class="row">${S.mortgage ? `<button class="btn primary sm" onclick="payMortgage()">Pay off mortgage (${money(S.mortgage.balance)})</button>` : ''}<button class="btn ghost sm" onclick="sellHouse()">Sell house</button></div>` : ''}
    </div>
    <p class="muted">Your take-home pay: about <b>${money(weeklyIncome())}/week</b>. A good rule: housing should cost less than 1/3 of your pay.</p>
    <div class="grid homes">${Object.entries(HOMES).map(([k, h]) => `<div class="card home ${k === S.home ? 'mine' : ''}">
      <div class="jt"><b>${h.icon} ${h.name}</b><span class="pay">${h.type === 'free' ? 'Free' : h.type === 'rent' ? money(h.rent) + '/wk' : money(h.price)}</span></div>
      <p class="muted small">${h.desc}</p>
      <p class="small">Comfort: ${'⭐'.repeat(Math.ceil(h.comfort / 2))}${h.type === 'rent' ? ` · Utilities ${money(h.utilities)}/wk` : h.type === 'buy' ? ` · Upkeep ${money(h.upkeep)}/wk` : ''}</p>
      ${k === S.home ? '<span class="chip good">🏠 You live here</span>' : `<button class="btn primary sm" onclick="moveTo('${k}')">${h.type === 'buy' ? 'Buy' : h.type === 'rent' ? 'Rent' : 'Move back'}</button>`}
    </div>`).join('')}</div>`;
}
function payMortgage() {
  const amt = S.mortgage.balance;
  confirmModal(`Pay off the rest of your mortgage: ${money(amt)}?`, () => {
    if (!spend(amt, 'Paid off mortgage')) return;
    S.mortgage = null; unlock('debt_free');
    log('🎉 You paid off your mortgage!', 'good'); done();
  });
}

function viewBank() {
  const insuredByJob = S.job && JOBS[S.job.id].insurance;
  const amts = [20, 100, 500, 1000];
  return `<p class="muted">Open 8 AM–9 PM.</p>
    <div class="grid two">
    <div class="card"><h3>🐷 Savings Account</h3><p>Balance: <b>${money(S.savings)}</b></p>
      <p class="muted">Earns <b>0.5% interest</b> every week. Money you save grows by itself!</p>
      <div class="row">${amts.map(a => `<button class="btn primary sm" onclick="bank('deposit',${a})">+${money(a)}</button>`).join('')}<button class="btn primary sm" onclick="bank('deposit','all')">Deposit all</button></div>
      <div class="row">${amts.map(a => `<button class="btn ghost sm" onclick="bank('withdraw',${a})">-${money(a)}</button>`).join('')}<button class="btn ghost sm" onclick="bank('withdraw','all')">Withdraw all</button></div>
    </div>
    <div class="card"><h3>💳 Loans</h3><p>You owe: <b class="${S.loan > 0 ? 'neg' : ''}">${money(S.loan)}</b> · Limit: ${money(loanLimit())}</p>
      <p class="muted">Loans grow by <b>2% every week</b> (interest). The bank takes a minimum payment every Monday. Good for school or emergencies — but pay it back fast!</p>
      <div class="row">${[500, 1000, 3000].map(a => `<button class="btn ghost sm" onclick="bank('borrow',${a})">Borrow ${money(a)}</button>`).join('')}</div>
      <div class="row">${[100, 500].map(a => `<button class="btn primary sm" onclick="bank('repay',${a})">Repay ${money(a)}</button>`).join('')}<button class="btn primary sm" onclick="bank('repay','all')">Repay max</button></div>
    </div>
    <div class="card"><h3>🩺 Health Insurance</h3>
      ${insuredByJob ? '<p>✅ Your job gives you health insurance for free! (That\'s called a "benefit".)</p>'
        : `<p>${S.insurance ? '✅ You are insured.' : '❌ You are not insured.'} Cost: $35/week.</p>
           <p class="muted">Hospital visit without insurance: $3,000. With insurance: $300.</p>
           <button class="btn ${S.insurance ? 'ghost' : 'primary'} sm" onclick="toggleInsurance()">${S.insurance ? 'Cancel insurance' : 'Sign up'}</button>`}
    </div>
    <div class="card"><h3>📊 Net Worth</h3><p class="big ${netWorth() < 0 ? 'neg' : ''}">${money(netWorth())}</p>
      <p class="muted">Net worth = everything you own minus everything you owe.</p>
      <h3>This week so far</h3>
      <table class="stub">${S.week.lines.slice(-10).map(l => `<tr class="${l.amount < 0 ? 'minus' : 'plus'}"><td>${esc(l.label)}</td><td>${l.amount < 0 ? '-' : '+'}${money(Math.abs(l.amount))}</td></tr>`).join('') || '<tr><td class="muted">Nothing yet</td><td></td></tr>'}</table>
    </div></div>`;
}

function viewMe() {
  const all = Object.keys(SKILLS).map(k => [k, S.skills[k]]).sort((a, b) => b[1] - a[1]);
  return `<div class="placehead">${avatarImg(S.look, 72, 'avatar big')}<h2>${esc(S.name)}</h2></div>
    <details class="card"><summary>✂️ Change your look (new haircut, new clothes!)</summary><div id="restyle"></div></details>
    <p>🎂 Age ${S.age} (birthday ${MONTHS[S.bday.m]} ${S.bday.d}) · 🎓 ${EDU_NAMES[S.edu]} · ${dateText(S.day, true)} · Jobs held: ${S.jobsWorked.length}</p>
    <p>${S.license ? '🪪 Driver\'s license ✅' : S.permit ? '📝 Learner\'s permit — take the road test at the 🪪 License Office' : '🪪 No driver\'s license yet'} · 📈 Credit ${S.credit} · 🗳️ ${S.registered ? 'Registered voter' : 'Not registered to vote'} · 🤝 Volunteered ${S.volunteerHours} hrs${S.age >= 65 ? ' · 👴 You can retire any time!' : ''}</p>
    ${peopleCard()}${refsCard()}${journalCard()}${albumCard()}
    <p class="muted">These are the things you can tell a boss in a job interview. They want a level that's high enough!</p>
    <h3>Skills</h3>
    <div class="grid skills">${all.map(([k, v]) => `<div class="card skill"><div class="jt"><b>${skillName(k)}</b><span>${Math.round(v)}</span></div>${lvlBar(v)}</div>`).join('')}</div>
    <h3>Sports</h3>
    <div class="grid skills">${Object.keys(SPORTS).map(k => `<div class="card skill"><div class="jt"><b>${skillName(k)}</b><span>${Math.round(S.sports[k])}</span></div>${lvlBar(S.sports[k])}</div>`).join('')}</div>
    <h3>Stuff you own</h3><div class="row">${ITEMS.filter(i => has(i.id)).map(i => `<span class="chip">${i.icon} ${i.name}</span>`).join('') || '<span class="muted">Nothing yet.</span>'}
    ${Object.keys(SPORTS).filter(k => S.owned['gear_' + k]).map(k => `<span class="chip">${SPORTS[k].icon} ${SPORTS[k].gear.name}</span>`).join('')}</div>
    <p style="margin-top:24px"><button class="btn ghost danger" onclick="resetGame()">🔄 Start a New Life</button></p>`;
}

function viewGoals() {
  const got = ACHIEVEMENTS.filter(a => S.achievements[a.id]).length;
  return `<h2>🏆 Life Goals <span class="muted">${got}/${ACHIEVEMENTS.length}</span></h2>
    <div class="grid goals">${ACHIEVEMENTS.map(a => `<div class="card goal ${S.achievements[a.id] ? 'got' : ''}">
      <span class="ic">${S.achievements[a.id] ? a.icon : '🔒'}</span><div><b>${a.name}</b><div class="muted small">${a.desc}${S.achievements[a.id] ? ` · Day ${S.achievements[a.id]}` : ''}</div></div></div>`).join('')}</div>
    <h2>💡 Life Lessons</h2><ul class="tips">${LIFE_TIPS.map(t => `<li>${t}</li>`).join('')}</ul>`;
}

// ---------- setup screen ----------
function showSetup() {
  $('#app').classList.add('hidden');
  const s = $('#setup');
  s.classList.remove('hidden');
  s.innerHTML = `<div class="setup-card">
    <h1>🌱 The Big Game of Life</h1>
    <p>Grow up, get a job, pay bills, play sports, and learn what life is really like!</p>
    <label>Your name<input id="pname" maxlength="16" placeholder="Type your name"></label>
    <div class="label">Make your character</div>
    <div id="creator"></div>
    <div class="label">What are you naturally good at? Pick <b>2</b>.</div>
    <div class="talents">${Object.entries(SKILLS).map(([k, sk]) => `<button class="tal" data-t="${k}">${sk.icon} ${sk.name}</button>`).join('')}</div>
    <button class="btn primary big" id="startBtn">Start My Life ▶</button>
  </div>`;
  const look = randomLook();
  characterCreator($('#creator'), look);
  const tals = new Set();
  s.querySelectorAll('.tal').forEach(b => b.onclick = () => {
    const t = b.dataset.t;
    if (tals.has(t)) { tals.delete(t); b.classList.remove('sel'); }
    else if (tals.size < 2) { tals.add(t); b.classList.add('sel'); }
  });
  $('#startBtn').onclick = () => {
    const name = $('#pname').value.trim();
    if (!name) { toast('Type your name first!', 'bad'); return; }
    if (tals.size !== 2) { toast('Pick 2 things you are good at.', 'bad'); return; }
    s.classList.add('hidden');
    $('#app').classList.remove('hidden');
    tab = 'home';
    newGame(name, { ...look }, [...tals]);
    initMapOnce();
    playReward();
    render();
  };
}

let mapReady = false;
function initMapOnce() { if (!mapReady) { mapReady = true; initMap(); } }

function startTips() {
  let i = Math.floor(Math.random() * LIFE_TIPS.length);
  const show = () => { $('#tip').textContent = '💡 ' + LIFE_TIPS[i % LIFE_TIPS.length]; i++; };
  show(); setInterval(show, 15000);
}

window.addEventListener('DOMContentLoaded', () => {
  startTips();
  const saved = load();
  if (saved) {
    S = saved;
    // older saves didn't have the town map or bathroom
    if (S.loc === undefined) S.loc = 'home';
    if (S.needs.bladder === undefined) S.needs = { food: S.needs.food, energy: S.needs.energy, hygiene: S.needs.hygiene, bladder: 70, fun: S.needs.fun, health: S.needs.health };
    if (S.handsDirty === undefined) S.handsDirty = false;
    if (S.plaque === undefined) { S.plaque = 0; S.cavityAt = 60 + Math.floor(Math.random() * 31); delete S.dirtyTeeth; }
    if (S.doorOpen === undefined) S.doorOpen = true;
    if (!S.look) S.look = randomLook();
    ensureMoneyState();
    ensureHomeState();
    ensureTripState();
    ensurePetState();
    ensureRealLife();
    tab = S.loc;
    $('#setup').classList.add('hidden');
    initMapOnce();
    playReward();
    render();
    nextModal();
  }
  else showSetup();
});
