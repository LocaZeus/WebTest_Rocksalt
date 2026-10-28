# Rocksalt Cafe & Restaurant website

One-page website for Rocksalt, 360-364 Bay Street, Brighton VIC 3186.

It is built on the free [Hopla template by 8B](https://8b.com/templates/hopla/) (MIT licence, see `TEMPLATE-LICENSE`), restyled with Rocksalt's fonts (Fraunces and Raleway), colours and photos.

## Structure

- `public/index.html`: the whole page (HTML, CSS and scripts in one file)
- `public/media/`: Rocksalt photos and logo
- `public/vendor/`: GSAP 3.13.0 and Lenis 1.3.27, hosted locally
- `wrangler.jsonc`: Cloudflare Workers config (serves `public/` as static assets)

## Preview locally

```bash
cd public && python3 -m http.server 8765
```

Then open http://localhost:8765.

## Deploy

Cloudflare Workers Builds is connected to this repository (Worker `webtest-rocksalt`). Each push to the production branch runs `npx wrangler deploy`.

## Before launch

- The contact form does not send anything yet. It needs a backend (for example a Cloudflare Worker with email, or Formspree).
- Check prices, opening hours and the musician list against the current menus.
- Photo credits: all photos are Rocksalt's own, taken from the staging site.
