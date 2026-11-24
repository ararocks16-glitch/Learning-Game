#!/usr/bin/env python3
"""Build dist/The-Big-Game-of-Life.html: the whole game in ONE file to download.

All CSS and JS are put inside the page, so it works offline by double-clicking it.
"""
import re
from pathlib import Path

root = Path(__file__).resolve().parent.parent
html = (root / 'index.html').read_text()
css = (root / 'css' / 'style.css').read_text()
html = html.replace('<link rel="stylesheet" href="css/style.css">', '<style>\n' + css + '\n</style>')
html = re.sub(r'<script src="([^"]+)"></script>',
              lambda m: '<script>\n' + (root / m.group(1)).read_text().replace('</script>', '<\\/script>') + '\n</script>', html)
out = root / 'dist' / 'The-Big-Game-of-Life.html'
out.write_text(html)
print('wrote', out)
