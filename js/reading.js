// ===================== READING: real books you pick up and read page by page, the daily newspaper,
// fliers in the mail (jobs, events, sales), and the quick-action buttons (brush teeth, wash hands, clean...) =====================

function ensureReadingState() { if (!S.rd) S.rd = { read: {}, pages: 0 }; }

// ---------- the books (every one has real pages to read) ----------
const BOOK_TEXT = {
  lemonade: { title: 'Mia\'s Lemonade Stand', icon: '🍋', skill: 'sales', home: true, pages: [
    'Mia wanted a new bike. It cost $120. She had $14 in her piggy bank.',
    '"I could sell lemonade!" Mia said. Her dad helped her buy lemons, sugar and cups. That cost $8.',
    'On Saturday it was hot and sunny. Mia made a big sign: LEMONADE 50¢. Her first customer was Mr. Lee from next door.',
    'By lunchtime Mia had sold 30 cups. That was $15! But she had spent $8, so her profit was $7.',
    'Every Saturday all summer, Mia sold lemonade. She saved every dollar in a jar.',
    'In August, Mia counted her jar: $121! She rode her new bike all the way to the park. "Saving was worth it," she said.'] },
  swim: { title: 'Leo Learns to Swim', icon: '🏊', skill: 'fit', home: true, pages: [
    'Leo was scared of the deep end. He always stayed on the steps of the pool.',
    'His swim teacher, Coach Rosa, said, "Let\'s start small. Can you put your face in the water and blow bubbles?"',
    'Leo blew bubbles. Then he floated on his back while Coach Rosa held him. It felt like lying on a cloud.',
    'Every week Leo practiced kicking with a kickboard. His legs got stronger.',
    'One day, Coach Rosa let go — and Leo kept floating! Then he swam all the way across the pool.',
    'At the end of summer, Leo jumped into the deep end. SPLASH! "I did it!" he shouted.'] },
  storm: { title: 'The Big Storm', icon: '⛈️', skill: 'aid', home: true, pages: [
    'The sky turned dark gray. The TV beeped: "Storm warning for Maple Town."',
    'Ava\'s family got ready. They found the flashlights, filled water bottles and charged their phones.',
    'BOOM! Thunder shook the windows. Then the lights went out.',
    'Ava wasn\'t scared, because her family was ready. They lit lanterns and played board games in the hallway, away from the windows.',
    'In the morning the sun came out. Branches were everywhere. Neighbors came outside to help clean up together.',
    '"Being prepared made the storm a little less scary," said Ava\'s mom.'] },
  garden: { title: 'Grandma\'s Garden', icon: '🌻', skill: 'sci', home: true, pages: [
    'Every spring, Sam helped Grandma plant her garden.',
    'They dug little holes and dropped in seeds: tomatoes, carrots, beans and sunflowers.',
    '"Seeds need three things," Grandma said. "Sun, water and time."',
    'Sam watered the garden every day. At first nothing happened. Then tiny green sprouts poked out of the dirt!',
    'By summer the sunflowers were taller than Sam. The tomatoes were red and juicy.',
    'Grandma and Sam made a big salad with everything they grew. It was the best salad Sam ever ate.'] },
  dino: { title: 'Dinosaurs of the World', icon: '🦖', skill: 'sci', pages: [
    'Dinosaurs lived on Earth a very long time ago — more than 65 million years ago!',
    'Tyrannosaurus rex was a meat-eater. It had about 60 teeth, and some were as long as bananas.',
    'Brachiosaurus ate plants. Its long neck let it reach leaves at the tops of tall trees.',
    'Scientists who study dinosaur bones are called paleontologists. They dig up fossils very carefully with brushes.',
    'Birds are related to dinosaurs! Some dinosaurs even had feathers.'] },
  space: { title: 'A Kid\'s Guide to Space', icon: '🚀', skill: 'sci', pages: [
    'Our Sun is a star. It is so big that about one million Earths could fit inside it!',
    'There are 8 planets: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus and Neptune.',
    'Jupiter is the biggest planet. Saturn has beautiful rings made of ice and rock.',
    'The Moon goes around the Earth about once a month. Astronauts first walked on the Moon in 1969.',
    'At night, the stars you see are other suns, very, very far away.'] },
  turtle: { title: 'The Turtle of Maple Pond', icon: '🐢', skill: 'write', pages: [
    'In Maple Pond lived an old turtle named Shelly. Every morning she sunned herself on a log.',
    'One day a girl named Nia saw that Shelly\'s log had floated away. Shelly had no place to rest!',
    'Nia asked the park ranger for help. Together they tied a new log near the shore.',
    'The next morning, Nia ran to the pond. There was Shelly, warming her shell on the new log.',
    'Nia visited every week. She learned that turtles can live for more than 50 years.',
    'Years later, Nia became a park ranger herself — and Shelly was still there, sunning on her log.'] },
  cupcake: { title: 'The Missing Cupcake Mystery', icon: '🕵️', skill: 'write', pages: [
    'Twelve cupcakes cooled on the kitchen table for the bake sale. When Jamal came back, there were only eleven!',
    'Jamal looked for clues. There were crumbs on the floor... leading toward the living room.',
    'On the couch he found a pink sprinkle. And a little paw print made of frosting!',
    'Jamal followed the paw prints to the laundry basket. Inside was Biscuit the puppy, with frosting on his nose.',
    '"Case closed!" Jamal laughed. From then on, he kept the cupcakes high up on the counter.'] },
  mathpuzzle: { title: 'Math Puzzles & Brain Games', icon: '🔢', skill: 'math', pages: [
    'Puzzle 1: You have 3 apples and buy 4 more. How many apples? (Answer: 7)',
    'Puzzle 2: A pizza has 8 slices. You and 3 friends share it equally. How many slices each? (Answer: 2)',
    'Puzzle 3: What comes next? 2, 4, 6, 8, ... (Answer: 10 — count by twos!)',
    'Puzzle 4: You have $5. A snack costs $2. How much change do you get? (Answer: $3)',
    'Puzzle 5: How many legs do 3 dogs have? (Answer: 12 — that\'s 4 + 4 + 4!)'] },
  cooking: { title: 'Cooking for Beginners', icon: '🍳', skill: 'cook', pages: [
    'Rule 1: Always wash your hands before you cook.',
    'Rule 2: Ask a grown-up before using the stove, oven or sharp knives.',
    'Easy recipe — Fruit Salad: Cut a banana, an apple and some berries. Mix them in a bowl. Done!',
    'Easy recipe — Toast with Peanut Butter: Toast a slice of bread. Spread peanut butter on top. Add banana slices!',
    'Rule 3: Clean up when you\'re done. A good cook leaves the kitchen clean!'] },
  draw: { title: 'Draw Anything!', icon: '🎨', skill: 'art', pages: [
    'Every drawing starts with simple shapes: circles, squares and triangles.',
    'To draw a cat: draw a circle for the head and an oval for the body. Add two triangles for ears.',
    'To draw a house: draw a square, then put a triangle on top for the roof. Add a door and windows.',
    'Shading makes drawings look real. Press harder with your pencil on the side away from the light.',
    'The most important rule: practice a little every day, and have fun!'] },
  coding: { title: 'Coding for Kids', icon: '💻', skill: 'comp', pages: [
    'Computers follow instructions, step by step. A list of instructions is called a program.',
    'Instructions must be in the right order. You put on socks BEFORE shoes — computers need the right order too!',
    'A "loop" means doing something again and again. Like: "Jump 10 times."',
    'An "if" means making a choice. Like: "IF it is raining, take an umbrella."',
    'When a program has a mistake, it\'s called a "bug." Fixing it is called "debugging."'] },
  pets: { title: 'Caring for Pets', icon: '🐾', skill: 'animal', pages: [
    'Pets need food and fresh water every day.',
    'Dogs need walks to stay healthy and happy. Most dogs need at least two walks a day.',
    'Cats keep themselves clean, but their litter box needs to be cleaned every day.',
    'Fish need clean tank water. Feed them only a small pinch — too much food makes the water dirty.',
    'All pets need a checkup at the vet once a year. And lots of love!'] },
  castles: { title: 'Knights and Castles', icon: '🏰', skill: 'write', pages: [
    'About 800 years ago, kings and queens built big stone castles to keep people safe.',
    'Castles had thick walls, tall towers and a moat — a deep ditch filled with water.',
    'Knights trained for many years. They started as pages when they were about 7 years old!',
    'Knights wore heavy armor made of metal. A suit of armor could weigh as much as a 6-year-old kid.',
    'You can still visit real castles today in countries like England, France and Scotland.'] },
  money: { title: 'Money Smarts', icon: '💰', skill: 'math', pages: [
    'There are 3 smart things to do with money: SAVE it, SPEND it and SHARE it.',
    'Saving means keeping money for later. A bank keeps it safe and even pays you a little extra, called interest.',
    'Before you buy something, ask: "Is this a NEED or a WANT?" Food is a need. A new toy is a want.',
    'A budget is a plan for your money. Write down what you earn and what you spend.',
    'Sharing means giving to help others, like donating to an animal shelter.'] },
  soccer: { title: 'Soccer Skills', icon: '⚽', skill: 'comm', pages: [
    'In soccer, you can\'t use your hands — only the goalkeeper can!',
    'Dribbling means moving the ball with small taps of your feet while you run.',
    'Passing to a teammate is often better than trying to score alone. Soccer is a team game!',
    'Always warm up and stretch before playing, and drink lots of water.',
    'Win or lose, shake hands with the other team and say "Good game!"'] },
};
const LIB_TEXT = ['dino', 'space', 'turtle', 'cupcake', 'mathpuzzle', 'cooking', 'draw', 'coding', 'pets', 'castles', 'money', 'soccer'];
function homeBooks() { const own = ['lemonade', 'swim', 'storm', 'garden']; return has('bookshelf') ? own.concat(['dino', 'space', 'money']) : own.slice(0, 2); }

// read a book, one page at a time
function openBook(id, page = 0, libIdx) {
  ensureReadingState();
  const B = BOOK_TEXT[id]; if (!B) return;
  const last = page >= B.pages.length - 1;
  showModal(`<div class="bookpage"><div class="booktitle">${B.icon} ${esc(B.title)}</div><p class="booktext">${esc(B.pages[page])}</p><div class="muted small">Page ${page + 1} of ${B.pages.length}</div></div>`,
    [page > 0 ? { label: '◀ Back', cls: 'ghost', fn: () => openBook(id, page - 1, libIdx) } : { label: 'Close the book', cls: 'ghost', fn: () => { done(); } },
     last ? { label: '📕 The End', cls: 'primary', fn: () => finishBook(id, libIdx) } : { label: 'Next page ▶', cls: 'primary', fn: () => { pass(4 / 60, 'relax'); S.rd.pages++; openBook(id, page + 1, libIdx); } }]);
}
function finishBook(id, libIdx) {
  const B = BOOK_TEXT[id], first = !S.rd.read[id];
  S.rd.read[id] = (S.rd.read[id] || 0) + 1;
  pass(5 / 60, 'relax'); addSkill(B.skill, first ? 2 : 0.8); addSkill('write', 0.6); fun2(8);
  if (libIdx !== undefined && S.lib) { const bk = S.lib.books.find(x => x.i === libIdx); if (bk && bk.read < LIB_BOOKS[libIdx][3]) { bk.read = LIB_BOOKS[libIdx][3]; S.lib.read++; if (S.lib.read >= 5) unlock('bookworm'); } }
  log(`📕 You finished reading "${B.title}"!${first ? ' You learned something new.' : ' It was just as good the second time.'} (${Object.keys(S.rd.read).length} different books read)`, 'good');
  if (Object.keys(S.rd.read).length >= 8) unlock('reader8');
  done();
}
function bookPicker() {
  const home = homeBooks(), lib = S.lib ? S.lib.books : [];
  const rows = home.map(id => [id, BOOK_TEXT[id], undefined, has('bookshelf') ? 'from your bookshelf' : 'your own book'])
    .concat(lib.map(bk => [LIB_TEXT[bk.i], BOOK_TEXT[LIB_TEXT[bk.i]], bk.i, `library book · due ${dateText(bk.due)}`]));
  showModal(`<h2>📚 Pick a Book to Read</h2><div class="grid actions">${rows.map(([id, B, li, note]) => `<button class="action" onclick="closeModal();openBook('${id}',0${li !== undefined ? ',' + li : ''})"><span class="ic">${B.icon}</span><b>${esc(B.title)}</b><small>${note}${S.rd && S.rd.read[id] ? ' · ✅ read' : ''}</small></button>`).join('')}</div>
    ${has('bookshelf') ? '' : '<p class="muted small">Buy a bookshelf at the Mall for more books, or borrow free books at the 📚 Library!</p>'}`, [{ label: 'Cancel', cls: 'ghost' }]);
}
// library books now open the real book
function readLibraryBook() {
  const L = S.lib; if (!L || !L.books.length) return nope('You don\'t have any library books. Borrow some at the 📚 Library — it\'s free!');
  if (L.books.length === 1) return openBook(LIB_TEXT[L.books[0].i], 0, L.books[0].i);
  bookPicker();
}

// ---------- pick up a book and hold it ----------
function pickUpBook() {
  if (S.hands.length >= MAX_HANDS) return nope('Your hands are full!');
  const home = homeBooks();
  showModal(`<h2>✋ Pick Up a Book</h2><div class="grid actions">${home.map(id => `<button class="action" onclick="closeModal();S.hands.push({kind:'book',id:'${id}'});log('✋ You picked up &quot;${BOOK_TEXT[id].title.replace(/'/g, '')}&quot;.');render();save()"><span class="ic">${BOOK_TEXT[id].icon}</span><b>${esc(BOOK_TEXT[id].title)}</b></button>`).join('')}</div>`, [{ label: 'Cancel', cls: 'ghost' }]);
}
const _handIcon5 = handIcon, _handName5 = handName, _handEdible5 = handEdible;
handIcon = h => h.kind === 'book' ? '📖' : _handIcon5(h);
handName = h => h.kind === 'book' ? `"${BOOK_TEXT[h.id].title}"` : _handName5(h);
handEdible = h => h.kind === 'book' ? false : _handEdible5(h);
const _roomBarHtml5 = roomBarHtml;
roomBarHtml = function () {
  let html = _roomBarHtml5();
  // books you're holding get a Read button
  S.hands.forEach((h, i) => { if (h.kind === 'book') html = html.replace(`📖 "${BOOK_TEXT[h.id].title}" `, `📖 "${BOOK_TEXT[h.id].title}" <button class="btn sm primary" onclick="openBook('${h.id}')">Read</button> <button class="btn sm ghost" onclick="S.hands.splice(${i},1);render()">Put back</button> `); });
  return html;
};
const _spotButtons5 = spotButtons;
spotButtons = function (id) {
  const B = _spotButtons5(id);
  if (id === 'books') { B.length = 0; B.push(rb('✋ Pick up a book', 'pickUpBook()'), rb('📖 Read', 'bookPicker()', 'ghost')); }
  return B;
};
function verbRead() {
  const opts = [['📕', 'Read a book', 'turn real pages!', 'bookPicker()'], ['📰', 'Read today\'s newspaper', 'news, weather & jobs', 'readNewspaper()'], ['💭', 'Read a comic book', 'just for fun', 'readComic()']];
  showModal(`<h2>📖 Read</h2><div class="grid actions">${opts.map(o => `<button class="action" onclick="closeModal();${o[3]}"><span class="ic">${o[0]}</span><b>${o[1]}</b><small>${o[2]}</small></button>`).join('')}</div>`, [{ label: 'Cancel', cls: 'ghost' }]);
}

// ---------- the daily newspaper: The Maple Times ----------
function jobAdsToday(n = 4) {
  const day = S.day, list = [];
  for (let k = 0; list.length < n && k < 60; k++) { const j = JOBS[(day * 37 + k * 53) % JOBS.length]; if (!list.includes(j) && (!S.job || S.job.id !== j.id)) list.push(j); }
  return list;
}
function readNewspaper(day = S.day) {
  const d0 = S.day; S.day = day;
  const fc = (S.forecast || []).slice(0, 3).map(f => `${dateText(f.day).replace(/^\w+, /, '')}: ${WEATHER[f.w] ? WEATHER[f.w].icon + ' ' + WEATHER[f.w].name : f.w}`).join(' · ');
  const news = (S.news || []).filter(n => !String(n.text).startsWith('🌦️')).slice(0, 4);
  const ev = eventToday(), hol = holidayToday();
  S.day = d0;
  const ads = jobAdsToday();
  const facts = ['Honeybees visit about 2 million flowers to make one jar of honey.', 'An octopus has three hearts!', 'The Eiffel Tower grows about 6 inches taller in summer because metal expands in the heat.', 'A group of flamingos is called a "flamboyance."', 'Sea otters hold hands when they sleep so they don\'t drift apart.'];
  pass(0.25, 'relax'); addSkill('write', 0.3);
  showModal(`<div class="newspaper"><div class="np-head">📰 THE MAPLE TIMES</div><div class="np-date">${dateText(day, true)} · Free town newspaper</div>
    <h3>${news[0] ? esc(news[0].text) : 'Sunny days ahead for Maple Town!'}</h3>
    ${news.slice(1).map(n => `<p>• ${esc(n.text)}</p>`).join('')}
    ${hol ? `<p><b>${hol.icon} Today is ${hol.name}!</b> ${hol.about}</p>` : ''}${ev ? `<p><b>${ev.icon} ${ev.name}</b> is happening at Lakeside Park!</p>` : ''}
    <h4>🌦️ Weather</h4><p>${fc || 'Check the sky!'}</p>
    <h4>💼 Help Wanted</h4>${ads.map(j => `<div class="np-ad"><b>${esc(j.name)}</b> — $${j.pay}/hr at the ${esc(PLACES[workplaceOf(j)].name)}. ${EDU_NAMES[j.edu]}. <button class="btn sm ghost" onclick="closeModal();goInterview(${j.id})">📍 Go apply</button></div>`).join('')}
    <h4>🤓 Fun Fact</h4><p>${pickR(facts)}</p></div>`, [{ label: 'Fold up the newspaper', cls: 'ghost' }]);
}
async function goInterview(id) {
  const pid = workplaceOf(JOBS[id]);
  await travelTo(pid); if (ENTRANCE[pid]) { S.insideOf = pid; }
  render(); startInterview(id);
}

// ---------- fliers in the mailbox ----------
function readingNewDay() {
  ensureReadingState();
  if (!S.mail) return;
  // a fresh newspaper every morning (old ones get recycled)
  S.mail = S.mail.filter(m => m.kind !== 'newspaper');
  addMail({ kind: 'newspaper', from: '📰 The Maple Times', text: `Today's newspaper: ${S.news && S.news[0] ? S.news[0].text : 'news, weather and job ads'}`, paper: S.day });
  const r = Math.random();
  if (r < 0.35) { const j = pickR(JOBS.filter(x => meetsReqs(x) && (!S.job || S.job.id !== x.id))) || pickR(JOBS); addMail({ kind: 'flyer', from: `📄 Flier: ${PLACES[workplaceOf(j)].name}`, text: `NOW HIRING! ${j.name} — $${j.pay}/hour. ${EDU_NAMES[j.edu]}. Come in for an interview!`, job: j.id }); }
  else if (r < 0.5) { const e = pickR([['🎳', 'Strike Zone Bowling', 'Kids bowl FREE on Tuesdays!', 'bowling'], ['🌊', 'Splash Water Park', 'Summer is coming — get ready to splash!', 'waterpark'], ['🏛️', 'Maple Museum', 'New dinosaur exhibit! Free on the 1st Sunday.', 'museum'], ['🎪', 'Lakeside Park', 'Farmers\' market every Saturday morning!', 'park'], ['🐶', 'Happy Paws Pet Shop', 'Pet adoption day this weekend!', 'petshop']]); addMail({ kind: 'flyer', from: `📄 Flier: ${e[1]}`, text: `${e[0]} ${e[2]}`, place: e[3] }); }
  else if (r < 0.6) { const ids = Object.keys(FOODS).filter(id => saleToday(id)); addMail({ kind: 'flyer', from: '📄 Flier: Maple Supermarket', text: `🏷️ ON SALE THIS WEEK: ${ids.map(id => FOODS[id].name).join(', ') || 'lots of things'}!`, place: 'market' }); }
}
// the mailbox shows Read / Go there / Interview buttons for newspapers and fliers
const _mailbox5 = mailbox;
mailbox = function () {
  _mailbox5();
  const body = $('#modal-body'); if (!body) return;
  const items = body.querySelectorAll('.mail');
  S.mail.slice(0, 12).forEach((m, i) => {
    const el = items[i]; if (!el) return;
    if (m.kind === 'newspaper') el.insertAdjacentHTML('beforeend', `<button class="btn sm primary" onclick="closeModal();readNewspaper(${m.paper})">📰 Read the newspaper</button>`);
    if (m.job !== undefined) el.insertAdjacentHTML('beforeend', `<button class="btn sm primary" onclick="closeModal();goInterview(${m.job})">📍 Go apply for this job</button>`);
    if (m.place && PLACES[m.place]) el.insertAdjacentHTML('beforeend', `<button class="btn sm ghost" onclick="closeModal();travelTo('${m.place}')">📍 Go there</button>`);
  });
};
showNews = function () { readNewspaper(); };

// ---------- quick buttons for everyday things, always at the top ----------
function quickBar() {
  if (!S) return '';
  const home = S.loc === 'home' && S.doorOpen;
  const B = [['🪥', 'Brush Teeth', 'brushTeeth();done()'], ['🧼', 'Wash Hands', 'washHands();done()'], ['🚽', 'Toilet', home ? "homeAct('toilet')" : 'useToilet();done()'], ['💧', 'Drink', 'quickDrink()']];
  if (home) B.push(['🚿', 'Shower', 'homeShowerChoice()'], ['🧹', 'Clean', "homeAct('clean')"], ['🍽️', 'Eat', 'verbEat()'], ['🍽️', 'Dishes', "homeAct('dishes')"]);
  B.push(['📖', 'Read', 'verbRead()'], ['😴', 'Sleep', 'goToBed()']);
  return B.map(b2 => `<button class="qb" onclick="${b2[2]}"><span>${b2[0]}</span>${b2[1]}</button>`).join('');
}
