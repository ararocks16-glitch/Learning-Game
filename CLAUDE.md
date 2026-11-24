# Life Lessons game

A browser life-simulation game for kids. Plain HTML/CSS/JS, no build tools needed to play: open `index.html`.

- `js/data.js`: jobs (must stay exactly 132), skills, sports, items, homes, goals
- `js/game.js`: game rules
- `js/map.js`: the town map (drawing, roads, travel)
- `js/people.js`: drawn characters and the character creator
- `js/money.js`: the 21 side-money ideas, weather, stocks, books
- `js/ui.js`: screens

## Always republish the playable web page after changes

The game is published as a web page so the user can always play the newest version:
https://claude.ai/artifact/Faqvr9mFAk22ZSvkjTXGEs

After ANY change to the game:
1. Run `python3 tools/build-artifact.py` (writes `dist/play.html`).
2. Republish with the Artifact tool to the URL above: `file_path` = `dist/play.html`, `url` = the URL above,
   and `files` = `{"css/style.css": "css/style.css", "js/data.js": "js/data.js", "js/game.js": "js/game.js", "js/people.js": "js/people.js", "js/map.js": "js/map.js", "js/money.js": "js/money.js", "js/ui.js": "js/ui.js"}`.
   (Read the artifact first if this session hasn't, as the tool requires.)
3. Commit and push.
