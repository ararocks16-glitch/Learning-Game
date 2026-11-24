// ===================== GAME DATA =====================

const SKILLS = {
  comm:    { name: 'Talking to People', icon: '🗣️', price: 30 },
  service: { name: 'Customer Service',  icon: '🤝', price: 25 },
  cook:    { name: 'Cooking',           icon: '🍳', price: 35 },
  math:    { name: 'Math',              icon: '🔢', price: 30 },
  comp:    { name: 'Computers',         icon: '💻', price: 45 },
  write:   { name: 'Writing',           icon: '✍️', price: 30 },
  build:   { name: 'Building & Fixing', icon: '🔨', price: 45 },
  drive:   { name: 'Driving',           icon: '🚗', price: 60 },
  aid:     { name: 'First Aid & Care',  icon: '⛑️', price: 40 },
  art:     { name: 'Art & Design',      icon: '🎨', price: 35 },
  music:   { name: 'Music',             icon: '🎵', price: 45 },
  sci:     { name: 'Science',           icon: '🔬', price: 50 },
  lead:    { name: 'Leadership',        icon: '⭐', price: 50 },
  sales:   { name: 'Selling',           icon: '💰', price: 30 },
  animal:  { name: 'Animal Care',       icon: '🐾', price: 35 },
  fit:     { name: 'Fitness',           icon: '💪', price: 40 },
};

// Skills you can study for free at the library
const LIBRARY_SKILLS = ['math', 'comp', 'write', 'sci'];

const SPORTS = {
  swimming:   { name: 'Swimming',   icon: '🏊', gear: null, practiceFee: 6,  practiceWhere: 'Pool entry', lesson: 40, pro: 120 },
  tennis:     { name: 'Tennis',     icon: '🎾', gear: { name: 'Tennis Racket', price: 80 },   practiceFee: 0,  lesson: 50, pro: 150 },
  volleyball: { name: 'Volleyball', icon: '🏐', gear: { name: 'Volleyball', price: 30 },      practiceFee: 0,  lesson: 35, pro: 110 },
  basketball: { name: 'Basketball', icon: '🏀', gear: { name: 'Basketball', price: 30 },      practiceFee: 0,  lesson: 35, pro: 110 },
  soccer:     { name: 'Soccer',     icon: '⚽', gear: { name: 'Soccer Ball & Cleats', price: 70 }, practiceFee: 0, lesson: 30, pro: 100 },
  golf:       { name: 'Golf',       icon: '⛳', gear: { name: 'Golf Clubs', price: 350 },     practiceFee: 40, practiceWhere: 'Course fee', lesson: 80, pro: 200 },
  running:    { name: 'Running',    icon: '🏃', gear: { name: 'Running Shoes', price: 90 },   practiceFee: 0,  lesson: 30, pro: 90 },
};

const TOURNAMENTS = [
  { id: 'local',    name: 'Local Tournament',    fee: 10,  opp: 12, prize1: 100,   prize2: 40 },
  { id: 'city',     name: 'City Championship',   fee: 40,  opp: 32, prize1: 500,   prize2: 200 },
  { id: 'state',    name: 'State Championship',  fee: 150, opp: 55, prize1: 2500,  prize2: 1000 },
  { id: 'national', name: 'National Championship', fee: 500, opp: 80, prize1: 15000, prize2: 5000 },
];

const EDU_NAMES = ['No Diploma', 'High School Diploma', 'College Degree', 'Advanced Degree'];

const EDUCATION = [
  { level: 2, name: 'College', sessions: 20, price: 150, hours: 4, needs: 1,
    desc: 'Get a College Degree. Opens up jobs like Nurse, Teacher, Engineer and Accountant.' },
  { level: 3, name: 'Graduate School', sessions: 24, price: 400, hours: 4, needs: 2,
    desc: 'Get an Advanced Degree. Opens jobs like Doctor, Lawyer, Veterinarian and Professor.' },
];

// Homes. comfort affects how well you sleep and how happy you are.
const HOMES = {
  parents: { name: "Parents' House",       icon: '👨‍👩‍👧', type: 'free', rent: 0,     utilities: 0,   comfort: 2,
             desc: 'Free! But you share a room and Mom tells you to clean up. Fun is capped at 80.' },
  shared:  { name: 'Room with Roommates',  icon: '🛏️', type: 'rent', rent: 110,   utilities: 20,  comfort: 2,
             desc: 'Cheap rent, but you share the kitchen and bathroom.' },
  studio:  { name: 'Studio Apartment',     icon: '🏢', type: 'rent', rent: 190,   utilities: 30,  comfort: 3,
             desc: 'Your own small place. One room for everything.' },
  onebed:  { name: '1-Bedroom Apartment',  icon: '🏬', type: 'rent', rent: 290,   utilities: 40,  comfort: 4,
             desc: 'A real bedroom and a living room!' },
  small:   { name: 'Small House',          icon: '🏠', type: 'buy',  price: 90000,  upkeep: 70,  comfort: 5,
             desc: 'A cozy house with a little yard. You pay for repairs yourself.' },
  family:  { name: 'Family House',         icon: '🏡', type: 'buy',  price: 260000, upkeep: 140, comfort: 6,
             desc: 'Big house, big backyard, garage for your car.' },
  mansion: { name: 'Mansion',              icon: '🏰', type: 'buy',  price: 1500000, upkeep: 700, comfort: 8,
             desc: 'Pool, tennis court, and way too many bathrooms to clean.' },
};

const ITEMS = [
  // food
  { id: 'groceries', place: 'market', cat: 'Food', name: 'Groceries (7 meals)', icon: '🛒', price: 45, consumable: true,
    desc: 'Cheaper than eating out! Eat or cook at home.' },
  { id: 'fastfood', place: 'diner', cat: 'Food', name: 'Fast Food Meal', icon: '🍔', price: 11, consumable: true,
    desc: 'Eat right now. Quick but pricey and not very healthy.' },
  { id: 'salad', place: 'diner', cat: 'Food', name: 'Healthy Lunch', icon: '🥗', price: 14, consumable: true,
    desc: 'Eat right now. Good for your health.' },
  { id: 'pancakes', place: 'diner', cat: 'Food', name: 'Pancake Breakfast', icon: '🥞', price: 9, consumable: true,
    desc: 'Eat right now. A yummy treat!' },
  { id: 'milkshake', place: 'diner', cat: 'Food', name: 'Milkshake', icon: '🥤', price: 5, consumable: true,
    desc: 'Fun! But drinks fill up your bladder fast.' },
  // clothes
  { id: 'clothes1', place: 'mall', cat: 'Clothes', name: 'Basic Clothes', icon: '👕', price: 40, clothes: 1, desc: 'Jeans and t-shirts.' },
  { id: 'clothes2', place: 'mall', cat: 'Clothes', name: 'Nice Outfit', icon: '👔', price: 140, clothes: 2, desc: 'Look sharp for interviews.' },
  { id: 'clothes3', place: 'mall', cat: 'Clothes', name: 'Business Suit', icon: '🤵', price: 400, clothes: 3, desc: 'Big interviews need big style.' },
  // electronics
  { id: 'phone', place: 'mall', cat: 'Electronics', name: 'Phone', icon: '📱', price: 300, bill: 20,
    desc: 'Jobs can call you back! Phone bill $20/week.' },
  { id: 'laptop', place: 'mall', cat: 'Electronics', name: 'Laptop', icon: '💻', price: 800, desc: 'Practice computer skills at home for free.' },
  { id: 'tv', place: 'mall', cat: 'Electronics', name: 'TV', icon: '📺', price: 450, desc: 'Watch TV to relax.' },
  { id: 'console', place: 'mall', cat: 'Electronics', name: 'Video Game Console', icon: '🎮', price: 400, desc: 'Lots of fun. Don\'t play all night!' },
  // home
  { id: 'bed', place: 'mall', cat: 'Home', name: 'Comfy Bed', icon: '🛌', price: 600, desc: 'Sleep much better.' },
  { id: 'couch', place: 'mall', cat: 'Home', name: 'Couch', icon: '🛋️', price: 350, desc: 'Home feels nicer. More fun relaxing.' },
  { id: 'washer', place: 'mall', cat: 'Home', name: 'Washer & Dryer', icon: '🧺', price: 800, desc: 'Do laundry at home for free.' },
  { id: 'plant', place: 'market', cat: 'Home', name: 'House Plant', icon: '🪴', price: 25, desc: 'Makes you a little happier. Water it!' },
  // transport
  { id: 'bike', place: 'cars', cat: 'Transport', name: 'Bicycle', icon: '🚲', price: 250, desc: 'Free ride to work. Faster than the bus.' },
  { id: 'car', place: 'cars', cat: 'Transport', name: 'Used Car', icon: '🚙', price: 7000, bill: 60,
    desc: 'Fastest way to work. Gas + insurance: $60/week. Needs Driving skill 20.' },
  { id: 'newcar', place: 'cars', cat: 'Transport', name: 'New Car', icon: '🏎️', price: 32000, bill: 80,
    desc: 'Never breaks down. Gas + insurance: $80/week. Needs Driving skill 20.' },
];

// ---------- 132 JOBS ----------
// [name, category, $ per hour, education needed, required skills]
// Skills can have a custom level like 'tennis:80'. Otherwise level depends on education.
const JOB_DATA = [
  // Food
  ['Dishwasher', 'Food', 12, 0, []],
  ['Fast Food Worker', 'Food', 12, 0, ['service']],
  ['Busser', 'Food', 11, 0, []],
  ['Barista', 'Food', 14, 0, ['service', 'cook']],
  ['Server', 'Food', 13, 0, ['service', 'comm']],
  ['Line Cook', 'Food', 16, 0, ['cook']],
  ['Pizza Delivery Driver', 'Food', 15, 0, ['drive']],
  ['Baker', 'Food', 17, 0, ['cook', 'math']],
  ['Chef', 'Food', 28, 1, ['cook:45', 'lead']],
  ['Restaurant Manager', 'Food', 30, 1, ['lead', 'service', 'math']],
  ['Nutritionist', 'Food', 32, 2, ['sci', 'comm']],
  // Stores
  ['Grocery Bagger', 'Stores', 11, 0, []],
  ['Cashier', 'Stores', 12, 0, ['math']],
  ['Stock Clerk', 'Stores', 13, 0, ['fit']],
  ['Sales Associate', 'Stores', 13, 0, ['sales', 'comm']],
  ['Pet Store Clerk', 'Stores', 13, 0, ['animal']],
  ['Florist', 'Stores', 15, 0, ['art']],
  ['Store Manager', 'Stores', 26, 1, ['lead', 'sales', 'math']],
  ['Car Salesperson', 'Stores', 24, 1, ['sales', 'comm', 'drive']],
  ['Real Estate Agent', 'Stores', 35, 1, ['sales:40', 'comm', 'drive']],
  // Office & Business
  ['Receptionist', 'Office', 15, 1, ['comm', 'comp']],
  ['Data Entry Clerk', 'Office', 15, 1, ['comp']],
  ['Call Center Agent', 'Office', 15, 1, ['comm', 'service']],
  ['Office Assistant', 'Office', 16, 1, ['comp', 'write']],
  ['Bank Teller', 'Office', 17, 1, ['math', 'service']],
  ['Bookkeeper', 'Office', 22, 1, ['math:35', 'comp']],
  ['Paralegal', 'Office', 27, 2, ['write', 'comp']],
  ['Accountant', 'Office', 38, 2, ['math:45', 'comp']],
  ['Marketing Specialist', 'Office', 33, 2, ['write', 'art', 'comp']],
  ['Project Manager', 'Office', 45, 2, ['lead', 'comm', 'comp']],
  ['Financial Advisor', 'Office', 45, 2, ['math', 'comm', 'sales']],
  ['Lawyer', 'Office', 70, 3, ['write', 'comm']],
  ['Judge', 'Office', 85, 3, ['write:65', 'lead:60']],
  ['CEO', 'Office', 120, 3, ['lead:70', 'comm:60', 'math', 'sales']],
  // Health
  ['Hospital Cleaner', 'Health', 14, 0, []],
  ['Caregiver', 'Health', 15, 0, ['aid', 'comm']],
  ['Pharmacy Technician', 'Health', 18, 1, ['sci', 'math']],
  ['EMT', 'Health', 20, 1, ['aid:30', 'drive']],
  ['Paramedic', 'Health', 26, 1, ['aid:40', 'drive', 'lead']],
  ['Nurse', 'Health', 40, 2, ['aid', 'sci', 'comm']],
  ['Physical Therapist', 'Health', 45, 2, ['aid', 'fit', 'sci']],
  ['Pharmacist', 'Health', 60, 3, ['sci', 'math']],
  ['Dentist', 'Health', 80, 3, ['sci', 'aid']],
  ['Doctor', 'Health', 100, 3, ['sci:60', 'aid:60', 'comm']],
  ['Surgeon', 'Health', 150, 3, ['sci:70', 'aid:75', 'lead']],
  // Education & Kids
  ['Babysitter', 'Education', 12, 0, ['aid']],
  ['Daycare Worker', 'Education', 14, 0, ['comm', 'aid']],
  ['Tutor', 'Education', 18, 1, ['math', 'write']],
  ['School Bus Driver', 'Education', 19, 1, ['drive']],
  ['Librarian', 'Education', 26, 2, ['write', 'comp']],
  ['Music Teacher', 'Education', 28, 2, ['music', 'comm']],
  ['Teacher', 'Education', 30, 2, ['comm', 'write', 'lead']],
  ['Principal', 'Education', 50, 3, ['lead', 'comm']],
  ['Professor', 'Education', 55, 3, ['write', 'sci', 'comm']],
  // Building & Trades
  ['Janitor', 'Trades', 13, 0, []],
  ['Landscaper', 'Trades', 14, 0, ['fit']],
  ['House Painter', 'Trades', 17, 0, ['art', 'build']],
  ['Construction Worker', 'Trades', 20, 0, ['build', 'fit']],
  ['Mechanic', 'Trades', 23, 1, ['build', 'drive']],
  ['Carpenter', 'Trades', 25, 1, ['build', 'math']],
  ['Plumber', 'Trades', 30, 1, ['build:35', 'math']],
  ['Electrician', 'Trades', 32, 1, ['build:35', 'math', 'sci']],
  ['Construction Foreman', 'Trades', 35, 1, ['build:45', 'lead']],
  ['Architect', 'Trades', 50, 2, ['art', 'math', 'build']],
  ['Civil Engineer', 'Trades', 50, 2, ['math', 'sci', 'build']],
  // Transportation
  ['Bike Courier', 'Transport', 13, 0, ['fit']],
  ['Warehouse Worker', 'Transport', 16, 0, ['fit']],
  ['Taxi Driver', 'Transport', 16, 0, ['drive', 'comm']],
  ['Delivery Driver', 'Transport', 17, 0, ['drive']],
  ['Mail Carrier', 'Transport', 21, 1, ['drive', 'fit']],
  ['Bus Driver', 'Transport', 22, 1, ['drive', 'service']],
  ['Flight Attendant', 'Transport', 25, 1, ['service', 'aid', 'comm']],
  ['Truck Driver', 'Transport', 26, 1, ['drive:35']],
  ['Air Traffic Controller', 'Transport', 65, 2, ['math:50', 'comm']],
  ['Airline Pilot', 'Transport', 90, 2, ['drive:60', 'math', 'lead']],
  // Tech
  ['Video Game Tester', 'Tech', 16, 1, ['comp']],
  ['IT Help Desk', 'Tech', 22, 1, ['comp', 'service']],
  ['Web Designer', 'Tech', 30, 1, ['comp:35', 'art']],
  ['Video Game Developer', 'Tech', 45, 2, ['comp:45', 'art']],
  ['Software Developer', 'Tech', 55, 2, ['comp:50', 'math']],
  ['Data Scientist', 'Tech', 60, 2, ['comp:45', 'math:50', 'sci']],
  ['Robotics Engineer', 'Tech', 60, 3, ['comp', 'build', 'sci']],
  ['AI Researcher', 'Tech', 80, 3, ['comp:65', 'math:60', 'sci']],
  // Arts & Entertainment
  ['Movie Theater Usher', 'Arts', 11, 0, ['service']],
  ['Street Performer', 'Arts', 10, 0, ['music']],
  ['YouTuber', 'Arts', 18, 0, ['comm:30', 'comp']],
  ['Dancer', 'Arts', 20, 0, ['fit', 'music']],
  ['Photographer', 'Arts', 22, 0, ['art:25', 'comp']],
  ['Musician', 'Arts', 25, 0, ['music:40']],
  ['Actor', 'Arts', 30, 0, ['comm:40', 'art']],
  ['Writer', 'Arts', 28, 1, ['write:40']],
  ['Graphic Designer', 'Arts', 28, 1, ['art:30', 'comp']],
  ['Fashion Designer', 'Arts', 35, 1, ['art:40', 'sales']],
  ['Journalist', 'Arts', 30, 2, ['write', 'comm']],
  ['Film Director', 'Arts', 60, 2, ['art:50', 'lead', 'comm']],
  // Science
  ['Lab Assistant', 'Science', 18, 1, ['sci']],
  ['Biologist', 'Science', 42, 2, ['sci']],
  ['Marine Biologist', 'Science', 42, 2, ['sci', 'animal']],
  ['Chemist', 'Science', 45, 2, ['sci', 'math']],
  ['Astronomer', 'Science', 55, 3, ['sci', 'math']],
  ['Astronaut', 'Science', 75, 3, ['sci:60', 'fit:60', 'math:60']],
  // Animals & Nature
  ['Dog Walker', 'Animals', 12, 0, ['animal', 'fit']],
  ['Farm Hand', 'Animals', 13, 0, ['animal', 'fit']],
  ['Pet Groomer', 'Animals', 16, 0, ['animal']],
  ['Farmer', 'Animals', 22, 0, ['animal', 'build', 'drive']],
  ['Zookeeper', 'Animals', 18, 1, ['animal']],
  ['Veterinary Technician', 'Animals', 20, 1, ['animal', 'aid']],
  ['Park Ranger', 'Animals', 24, 2, ['animal', 'fit']],
  ['Veterinarian', 'Animals', 55, 3, ['animal', 'sci', 'aid']],
  // Public Service
  ['Crossing Guard', 'Public Service', 12, 0, []],
  ['Security Guard', 'Public Service', 15, 0, ['fit']],
  ['Garbage Collector', 'Public Service', 20, 0, ['fit', 'drive']],
  ['911 Dispatcher', 'Public Service', 21, 1, ['comm', 'comp']],
  ['Firefighter', 'Public Service', 27, 1, ['fit:35', 'aid']],
  ['Police Officer', 'Public Service', 30, 1, ['fit:30', 'comm', 'drive']],
  ['Detective', 'Public Service', 40, 1, ['comm:40', 'write']],
  ['Social Worker', 'Public Service', 26, 2, ['comm', 'write']],
  ['Mayor', 'Public Service', 50, 2, ['lead:50', 'comm:50']],
  // Sports & Fitness
  ['Gym Front Desk', 'Sports', 13, 0, ['service']],
  ['Golf Caddy', 'Sports', 14, 0, ['golf:15']],
  ['Lifeguard', 'Sports', 14, 0, ['swimming:25', 'aid']],
  ['Swim Instructor', 'Sports', 18, 0, ['swimming:35', 'comm']],
  ['Yoga Instructor', 'Sports', 22, 0, ['fit:30']],
  ['Volleyball Coach', 'Sports', 22, 1, ['volleyball:40', 'lead']],
  ['Tennis Coach', 'Sports', 25, 0, ['tennis:45', 'comm']],
  ['Personal Trainer', 'Sports', 25, 1, ['fit:40', 'comm']],
  ['Sports Announcer', 'Sports', 30, 2, ['comm', 'write']],
  ['Pro Volleyball Player', 'Sports', 60, 0, ['volleyball:80']],
  ['Pro Swimmer', 'Sports', 70, 0, ['swimming:80']],
  ['Pro Tennis Player', 'Sports', 80, 0, ['tennis:80']],
  ['Pro Soccer Player', 'Sports', 100, 0, ['soccer:85']],
  ['Pro Basketball Player', 'Sports', 120, 0, ['basketball:85']],
];

const DEFAULT_REQ = [10, 15, 30, 45];

const JOBS = JOB_DATA.map((j, i) => ({
  id: i,
  name: j[0],
  cat: j[1],
  pay: j[2],
  edu: j[3],
  req: j[4].map(r => {
    const [s, lvl] = r.split(':');
    return { s, lvl: lvl ? Number(lvl) : DEFAULT_REQ[j[3]] };
  }),
  insurance: j[3] >= 2 || j[2] >= 40,
}));

const LIFE_TIPS = [
  'Taxes are taken out of every paycheck. The money you earn ("gross") is more than the money you take home ("net").',
  'Cooking at home costs way less than eating fast food every day.',
  'Save some money every week. Emergencies like car repairs happen!',
  'Loans charge interest. The longer you wait to pay them back, the more you owe.',
  'Money in a savings account earns interest. Your money makes money!',
  'Brush your teeth every day or you might get a big dentist bill.',
  'Employers can\'t read your mind — you have to TELL them what you\'re good at.',
  'Lying in an interview is risky. If you get caught, you get fired.',
  'Showing up late or tired makes your boss unhappy.',
  'Landlords want proof you earn enough money before they rent to you.',
  'When you own a house, YOU pay for repairs. Renters call the landlord.',
  'Health insurance makes hospital bills much smaller.',
  'Getting more education usually means better paying jobs.',
  'Practicing is free, but a coach helps you get better faster.',
  'Sleep is important! Being tired makes everything harder.',
  'A budget helps you know where your money goes each week.',
  'Bills come every week whether you worked or not.',
  'Doing laundry is boring, but dirty clothes make a bad impression.',
];

const ACHIEVEMENTS = [
  { id: 'first_job',     icon: '💼', name: 'Got Hired!',          desc: 'Get your first job.' },
  { id: 'first_check',   icon: '💵', name: 'Payday',              desc: 'Get your first paycheck.' },
  { id: 'raise',         icon: '📈', name: 'Moving Up',           desc: 'Get a raise at work.' },
  { id: 'moved_out',     icon: '🔑', name: 'On My Own',           desc: 'Move out of your parents\' house.' },
  { id: 'homeowner',     icon: '🏠', name: 'Homeowner',           desc: 'Buy a house.' },
  { id: 'car',           icon: '🚙', name: 'Wheels',              desc: 'Buy a car.' },
  { id: 'college',       icon: '🎓', name: 'Graduate',            desc: 'Get a College Degree.' },
  { id: 'grad',          icon: '📜', name: 'Expert',              desc: 'Get an Advanced Degree.' },
  { id: 'sport_try',     icon: '🏅', name: 'Good Sport',          desc: 'Practice 3 different sports.' },
  { id: 'all_sports',    icon: '🎽', name: 'Athlete',             desc: 'Practice all 7 sports.' },
  { id: 'tourney',       icon: '🏆', name: 'Champion',            desc: 'Win a tournament.' },
  { id: 'national',      icon: '🥇', name: 'National Champ',      desc: 'Win a National Championship.' },
  { id: 'save1k',        icon: '🐷', name: 'Saver',               desc: 'Have $1,000 in savings.' },
  { id: 'worth10k',      icon: '💰', name: 'Doing Well',          desc: 'Reach a net worth of $10,000.' },
  { id: 'worth100k',     icon: '💎', name: 'Rich',                desc: 'Reach a net worth of $100,000.' },
  { id: 'millionaire',   icon: '🤑', name: 'Millionaire',         desc: 'Reach a net worth of $1,000,000.' },
  { id: 'debt_free',     icon: '🕊️', name: 'Debt Free',           desc: 'Pay off a loan completely.' },
  { id: 'five_jobs',     icon: '🧭', name: 'Explorer',            desc: 'Work 5 different jobs.' },
  { id: 'clean_week',    icon: '🚿', name: 'Squeaky Clean',       desc: 'Shower 7 days in a row.' },
  { id: 'month',         icon: '📅', name: 'One Month',           desc: 'Survive 30 days.' },
  { id: 'year',          icon: '🎂', name: 'One Year',            desc: 'Survive 365 days.' },
  { id: 'pro_athlete',   icon: '🌟', name: 'Going Pro',           desc: 'Get hired as a pro athlete.' },
];
