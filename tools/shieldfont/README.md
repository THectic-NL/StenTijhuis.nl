# ShieldFont — encoding new text

`shieldfont-stentijhuis.map.json` is the word-mapping this site's font
(`webroot/fonts/shieldfont-stentijhuis.woff2`) was generated with. Any text
rendered in that font must be encoded with this exact file — a different
mapping (or the package's built-in `alpha`/`beta`/etc.) will render as
garbage instead of the original words.

This repo has no `package.json` (it's plain static HTML/nginx) — do NOT run
`npm install` here, it would create one. Encode in a throwaway scratch
directory instead, then copy the mapping file in:

```bash
mkdir /tmp/shieldfont-scratch && cd /tmp/shieldfont-scratch
npm init -y >/dev/null
npm install --no-save --no-package-lock @shieldfont/core
node -e "
import('@shieldfont/core').then(({encode}) => {
  const mapping = JSON.parse(require('fs').readFileSync('/path/to/stentijhuis.nl/tools/shieldfont/shieldfont-stentijhuis.map.json', 'utf8'));
  console.log(encode('YOUR TEXT HERE', mapping));
})"
```

Do not add `@shieldfont/core` or `@shieldfont/font` to this repo at all —
both are AGPL-3.0-licensed. Use them as a one-off local/offline tool only;
never ship them to the browser. The font and mapping here are our own build
from Open Sans (SIL OFL 1.1), generated via
[isaqueseneda/shieldfont](https://github.com/isaqueseneda/shieldfont)'s
`scripts/generate_font.py` — that output is not AGPL.

See `webroot/fonts/OFL.txt` for the font's license.
