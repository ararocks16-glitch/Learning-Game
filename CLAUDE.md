# The Big Game of Life

A browser life-simulation game for kids. Plain HTML/CSS/JS, no build tools needed to play: open `index.html`.

- `js/data.js`: jobs (must stay exactly 132), skills, sports, items, homes, goals
- `js/game.js`: game rules
- `js/map.js`: the town (drawing, roads, travel)
- `js/world.js`: the big world around the town (terrain tiles, highways, camera, minimap)
- `js/trips.js`: things to do at the far places (beach, mountain, lake, camp, village, wildlife park)
- `js/people.js`: drawn characters and the character creator
- `js/money.js`: the 21 side-money ideas, weather, stocks, books
- `js/home.js`: what homes include, furniture, supplies, snacks, paintings on walls
- `js/room.js`: the realistic drawing of the inside of your home
- `js/door.js`: your front door (you open it to go inside)
- `js/entrance.js`: doors, signs and opening hours for every building
- `js/interior.js`: the detailed inside of every building
- `js/pets.js`: pets (pet shop, vet, caring for pets, pets in your room)
- `js/towns.js`: the 4 other towns (Seaside Bay, Pinecrest, Snowpeak, Riverside Village)
- `js/calendar.js`: dates, seasons, birthdays and aging, holidays, town events and fireworks, voting for mayor, news, weather forecast
- `js/life.js`: thirst and drinks, getting sick, chores and messes, trash day and recycling, real groceries that spoil, recipes, haircuts, emergencies, volunteering
- `js/social.js`: friends, family, neighbors, boss and coworkers, the phone and its apps
- `js/work2.js`: job shifts, vacation and sick days, credit score, yearly taxes, budget planner, electric bill
- `js/cars.js`: driver's license, gas station, car care, rush hour, traffic lights, hair salon, airport and trips
- `js/build.js`: buying land and building your own house
- `js/ui.js`: screens

## The game lives in Artifacts, and only the owner plays it

- The game is played in the owner's claude.ai Artifacts (pinned in their sidebar). That is the only place it's played.
- It must stay **private**: only the owner can play it. Never share it, never change who can open it, and never post it anywhere else.
  (Only the owner can share it, from the page's Share menu, if they ever choose to.)
- Keep the same artifact URL forever, so the owner always plays the newest version there.

## Always republish the playable web page after changes

The game is published as a web page so the user can always play the newest version:
https://claude.ai/artifact/Faqvr9mFAk22ZSvkjTXGEs

After ANY change to the game:
1. Run `python3 tools/build-artifact.py` (writes `dist/play.html`).
2. Republish with the Artifact tool to the URL above: `file_path` = `dist/play.html`, `url` = the URL above,
   and `files` = `{"css/style.css": "css/style.css", "js/data.js": "js/data.js", "js/game.js": "js/game.js", "js/people.js": "js/people.js", "js/map.js": "js/map.js", "js/world.js": "js/world.js", "js/money.js": "js/money.js", "js/home.js": "js/home.js", "js/room.js": "js/room.js", "js/door.js": "js/door.js", "js/entrance.js": "js/entrance.js", "js/interior.js": "js/interior.js", "js/trips.js": "js/trips.js", "js/towns.js": "js/towns.js", "js/pets.js": "js/pets.js", "js/calendar.js": "js/calendar.js", "js/life.js": "js/life.js", "js/social.js": "js/social.js", "js/work2.js": "js/work2.js", "js/cars.js": "js/cars.js", "js/build.js": "js/build.js", "js/ui.js": "js/ui.js"}`.
   (Read the artifact first if this session hasn't, as the tool requires.)
3. Commit and push.

To give the owner a file to download (one file, works offline): run `python3 tools/build-download.py` and send `dist/The-Big-Game-of-Life.html`.
