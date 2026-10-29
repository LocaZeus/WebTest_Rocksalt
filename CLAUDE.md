# Working on this repository

This is the Rocksalt website. Read `README.md` first.

- The pages are generated. Edit files in `src/`, then run `python3 scripts/build.py`. Never hand-edit the generated `public/**/index.html`, `public/404.html` or `public/assets/`.
- Always commit `src/` and `public/` together so the live site matches the source.
- Business facts (address, phone, links, navigation) live in `src/data/site.json`. Menu items live in `src/data/menu.json`.
- Do not invent prices, hours, reviews, staff, events or article text. If a fact is missing, ask.
- Keep the user's writing preferences: UK English, and no em dashes or en dashes (use commas or full stops).
- Check the result at 390px and 1440px wide before pushing, and with reduced motion on.
