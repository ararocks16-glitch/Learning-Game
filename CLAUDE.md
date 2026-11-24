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
- `js/towns.js`: the 4 other towns (Seaside Bay, Pinecrest, Snowpeak, Riverside Village)
- `js/ui.js`: screens

## Always republish the playable web page after changes

The game is published as a web page so the user can always play the newest version:
https://claude.ai/artifact/Faqvr9mFAk22ZSvkjTXGEs

After ANY change to the game:
1. Run `python3 tools/build-artifact.py` (writes `dist/play.html`).
2. Republish with the Artifact tool to the URL above: `file_path` = `dist/play.html`, `url` = the URL above,
   and `files` = `{"css/style.css": "css/style.css", "js/data.js": "js/data.js", "js/game.js": "js/game.js", "js/people.js": "js/people.js", "js/map.js": "js/map.js", "js/world.js": "js/world.js", "js/money.js": "js/money.js", "js/home.js": "js/home.js", "js/room.js": "js/room.js", "js/door.js": "js/door.js", "js/entrance.js": "js/entrance.js", "js/interior.js": "js/interior.js", "js/trips.js": "js/trips.js", "js/towns.js": "js/towns.js", "js/ui.js": "js/ui.js"}`.
   (Read the artifact first if this session hasn't, as the tool requires.)
3. Commit and push.
