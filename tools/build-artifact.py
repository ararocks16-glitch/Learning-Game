#!/usr/bin/env python3
"""Build dist/play.html: the web-page version of index.html.

The web page host adds its own <html>, <head> and <body>, so this keeps
only the title, stylesheet link and the body content. The css/ and js/
files are uploaded next to it unchanged.
"""
import re
from pathlib import Path

root = Path(__file__).resolve().parent.parent
src = (root / 'index.html').read_text()

title = re.search(r'<title>.*?</title>', src, re.S).group(0)
links = '\n'.join(re.findall(r'<link [^>]*>', src))
body = re.search(r'<body>(.*)</body>', src, re.S).group(1).strip()

page = f'''{title}
<meta name="claude:viewport-fit-sides" content="cover">
{links}
{body}
'''
out = root / 'dist' / 'play.html'
out.parent.mkdir(exist_ok=True)
out.write_text(page)
print('wrote', out)
