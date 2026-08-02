# ShieldFont — encoding new text

Unlike ShieldFont's stock English dictionary, `shieldfont-stentijhuis.map.json`
is a **custom mapping built only from the words actually in the three
protected "About Me" paragraphs** in `webroot/index.html`. Every distinct
word pairs bijectively with another word from the same pool
(`m[m[x]] === x`), so ~100% of the text gets substituted instead of the
partial coverage the stock dictionary gave. Any text rendered in this font
must be encoded with this exact mapping — a different one (including the
package's built-in `alpha`/`beta`/etc.) will render as garbage.

**This means the mapping only covers exactly this vocabulary.** Adding a
new sentence with new words later needs a full regenerate (new mapping +
new font), not just a call to `encode()` — see below.

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

To protect a new chunk of text (new vocabulary), rebuild the mapping and
font together in the same scratch directory — clone
[isaqueseneda/shieldfont](https://github.com/isaqueseneda/shieldfont), build
a bijective word-pair JSON covering every distinct word in your new text
(pair each word with exactly one other word from the same pool; watch for
unusual casing like double-capital brand names, which the encoder's
case-preservation heuristic doesn't round-trip correctly), then:

```bash
python3 scripts/generate_font.py \
  --base-path <a static, non-variable Open Sans .ttf> \
  --name "ShieldFont StenTijhuis" \
  --prefix shieldfont-stentijhuis \
  --mapping-path your-new-mapping.json
```

This overwrites the font, so **re-encode and re-paste all currently
protected paragraphs** with the new mapping too, not just the new text.

See `webroot/fonts/OFL.txt` for the font's license.
