# Rocksalt Cafe & Restaurant website

Multi-page website for Rocksalt, 360-364 Bay Street, Brighton VIC 3186.

It is built on the free [Hopla template by 8B](https://8b.com/templates/hopla/) (MIT licence, see `TEMPLATE-LICENSE`), restyled with Rocksalt's fonts (Fraunces and Raleway), colours and photos.

## Pages

| URL | Source |
|---|---|
| `/` | `src/pages/home.html` |
| `/menus/` | `src/pages/menus.html` (menu items come from `src/data/menu.json`) |
| `/live-music/` | `src/pages/live-music.html` |
| `/private-dining-functions/` | `src/pages/functions.html` |
| `/about/` | `src/pages/about.html` |
| `/events/` | `src/pages/events.html` |
| `/contact/` | `src/pages/contact.html` |
| `/gallery/` | `src/pages/gallery.html` (photos come from `src/data/gallery.json`) |
| `/blog/` | `src/pages/blog.html` (no entries yet, hidden from search engines) |
| 404 | `src/pages/404.html` |

## How it is put together

The site is plain HTML, CSS and JavaScript, but the pages share a lot (header, footer, styles), so they are generated from the `src/` folder into `public/` by a small script.

- `src/pages/`: the content of each page
- `src/sections/`: reusable blocks used on more than one page
- `src/partials/`: head, header and footer shared by every page
- `src/data/`: `site.json` (address, phone, links, navigation), `menu.json`, `gallery.json`, `pages.json` (titles and descriptions)
- `src/css/`, `src/js/`: styles and scripts
- `public/`: **generated output**, plus photos (`public/media/`) and animation libraries (`public/vendor/`)
- `wrangler.jsonc`: Cloudflare config (serves `public/`)

## Changing the site

1. Edit files in `src/` (never edit the generated `.html` files in `public/`, they get overwritten).
2. Rebuild:

   ```bash
   python3 scripts/build.py
   ```

3. Preview:

   ```bash
   cd public && python3 -m http.server 8765
   ```

   Then open http://localhost:8765.
4. Commit **both** `src/` and `public/`, then push. Cloudflare publishes whatever is in `public/`.

## Deploy

Cloudflare Workers Builds is connected to this repository (Worker `webtest-rocksalt`). Each push to the production branch runs `npx wrangler deploy`, which uploads `public/`.

## Before launch

- The contact and function enquiry forms check the fields but do not send anything yet. They need a backend (for example a Cloudflare Worker that sends email, or a form service).
- Check prices, opening hours, the musician list and the menu against the current menus and PDFs. Tequila Sunrise has no price in the source PDF.
- Decide whether to keep the Journal page. It has no entries and is hidden from search engines until it does.
- Set the final domain, then add absolute URLs for social sharing images, a sitemap and `robots.txt`.
- Photo credits: all photos are Rocksalt's own, taken from the staging site.
