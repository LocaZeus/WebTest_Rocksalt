#!/usr/bin/env python3
"""Build the Rocksalt site.

Reads everything in src/ and writes the finished website into public/.
Run it after any change in src/:   python3 scripts/build.py
"""
import hashlib, html, json, pathlib, re, shutil

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC, OUT = ROOT / "src", ROOT / "public"

site = json.loads((SRC / "data/site.json").read_text())
menu = json.loads((SRC / "data/menu.json").read_text())
gallery = json.loads((SRC / "data/gallery.json").read_text())
waves = json.loads((SRC / "data/waves.json").read_text())
pages = json.loads((SRC / "data/pages.json").read_text())

esc = html.escape
CUR = ' aria-current="page"'


# ---------------------------------------------------------------- assets
def write_asset(rel, text):
    path = OUT / "assets" / rel
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text)
    return f"/assets/{rel}?v={hashlib.sha1(text.encode()).hexdigest()[:8]}"


def build_assets():
    shutil.rmtree(OUT / "assets", ignore_errors=True)
    css = (SRC / "css/template.css").read_text() + "\n" + (SRC / "css/pages.css").read_text()
    urls = {"css": write_asset("site.css", css), "shared": write_asset("shared.js", (SRC / "js/shared.js").read_text())}
    for js in sorted((SRC / "js/scenes").glob("*.js")):
        urls[f"scene:{js.stem}"] = write_asset(f"scenes/{js.name}", js.read_text())
    for js in sorted((SRC / "js").glob("*.js")):
        if js.name != "shared.js":
            urls[f"js:{js.stem}"] = write_asset(f"{js.name}", js.read_text())
    return urls


# ---------------------------------------------------------------- menu
LABELS = {"V": "Vegetarian", "GF": "Gluten free", "VOA": "Vegetarian option available"}


def money(v):
    return "$" + v


def price_html(item):
    if item.get("price") and item.get("bottle"):
        return f'<span class="mn__price">{money(item["price"])} <small>glass</small> · {money(item["bottle"])} <small>bottle</small></span>'
    if item.get("bottle"):
        return f'<span class="mn__price">{money(item["bottle"])} <small>bottle</small></span>'
    if item.get("price"):
        return f'<span class="mn__price">{money(item["price"])}</span>'
    return ""


def render_item(item, section):
    labels = item.get("labels", [])
    text = " ".join([item["name"], item.get("desc", ""), item.get("note", ""), section["title"]]).lower()
    badges = "".join(f'<abbr class="mn__label" title="{LABELS[l]}">{l}</abbr>' for l in labels)
    note = f'<span class="mn__extra">{esc(item["note"])}</span>' if item.get("note") else ""
    meta = f'<p class="mn__meta">{badges}{note}</p>' if (badges or note) else ""
    desc = f'<p class="m-text mn__desc">{esc(item["desc"])}</p>' if item.get("desc") else ""
    return (
        f'<li class="mn__item" data-labels="{" ".join(labels)}" data-text="{esc(text, quote=True)}">'
        f'<div class="mn__row"><h4 class="mn__name">{esc(item["name"])}</h4><span class="mn__dots" aria-hidden="true"></span>{price_html(item)}</div>'
        f"{desc}{meta}</li>"
    )


def render_menu():
    options, pills, groups = [], [], []
    for g in menu["groups"]:
        options.append(f'<optgroup label="{esc(g["title"])}">')
        pills.append(f'<div class="mn__pillrow"><span class="m-text-6">{esc(g["title"])}</span>')
        body = []
        for sec in g["sections"]:
            options.append(f'<option value="{sec["id"]}">{esc(sec["title"])}</option>')
            pills.append(f'<a class="mn__pill" href="#sec-{sec["id"]}">{esc(sec["title"])}</a>')
            note = f'<p class="m-text mn__secnote">{esc(sec["note"])}</p>' if sec.get("note") else ""
            items = "".join(render_item(i, sec) for i in sec["items"])
            body.append(
                f'<section class="mn__sec" id="sec-{sec["id"]}" data-section="{sec["id"]}" aria-labelledby="h-{sec["id"]}">'
                f'<h3 class="m-text-4 mn__title" id="h-{sec["id"]}">{esc(sec["title"])}</h3>{note}<ul class="mn__list">{items}</ul></section>'
            )
        options.append("</optgroup>")
        pills.append("</div>")
        groups.append(
            f'<div class="mn__group" id="{g["id"]}" data-group="{g["id"]}"><h2 class="m-text-3 mn__gtitle">{esc(g["title"])}</h2>{"".join(body)}</div>'
        )
    total = sum(len(s["items"]) for g in menu["groups"] for s in g["sections"])
    return f"""<div class="mn" data-total="{total}">
  <form class="mn__tools" role="search" aria-label="Search and filter the menu" onsubmit="return false">
    <label class="mn__field mn__field--wide"><span class="m-text-6">Search</span><input class="m-field" id="mn-q" type="search" placeholder="Try pancakes, prawns, coffee…" autocomplete="off"></label>
    <label class="mn__field"><span class="m-text-6">Menu section</span><select class="m-field" id="mn-section"><option value="">All sections</option>{"".join(options)}</select></label>
    <label class="mn__field"><span class="m-text-6">Menu labels</span><select class="m-field" id="mn-label"><option value="">Any</option><option value="V">V · Vegetarian</option><option value="GF">GF · Gluten free</option><option value="VOA">VOA · Vegetarian option available</option></select></label>
    <button class="m-btn-2 mn__clear" id="mn-clear" type="button">Clear filters</button>
  </form>
  <p class="m-text-6 mn__status" id="mn-status" role="status" aria-live="polite">{total} menu entries</p>
  <p class="m-text mn__legend"><strong>V</strong> vegetarian · <strong>GF</strong> gluten free · <strong>VOA</strong> vegetarian option available. Labels follow the printed menu and don't guarantee allergen-free preparation.</p>
  <nav class="mn__jump" aria-label="Jump to a menu section">{"".join(pills)}</nav>
  <div class="mn__body" id="mn-body">{"".join(groups)}</div>
  <p class="m-text mn__empty" id="mn-empty" hidden>Nothing matches that search. Try a different word, or clear the filters.</p>
</div>"""


def render_gallery():
    items = "".join(
        f'<li class="gl__cell"><button class="gl__btn" type="button" data-full="{esc(g["file"])}" data-alt="{esc(g["alt"], quote=True)}">'
        f'<img src="{esc(g["file"])}" alt="{esc(g["alt"], quote=True)}" width="{g["w"]}" height="{g["h"]}" loading="lazy"></button></li>'
        for g in gallery
    )
    return (
        f'<ul class="gl__grid">{items}</ul>'
        '<dialog class="gl__dialog" aria-label="Photo viewer"><button class="m-icon-btn gl__close" type="button" aria-label="Close photo"><span class="m-icon-btn__icon" aria-hidden="true"></span></button>'
        '<img class="gl__big" alt=""><p class="m-text gl__cap"></p>'
        '<button class="gl__nav gl__nav--prev m-icon-btn" type="button" aria-label="Previous photo">&#8592;</button>'
        '<button class="gl__nav gl__nav--next m-icon-btn" type="button" aria-label="Next photo">&#8594;</button></dialog>'
    )


# ---------------------------------------------------------------- templating
def tokens(text):
    values = {**site["links"], **waves, "PHONE": site["phoneDisplay"], "PHONE_HREF": site["phoneHref"], "EMAIL": site["email"], "ADDRESS": site["address"]}
    # & inside href attributes must be written as &amp;
    for k, v in values.items():
        text = text.replace("{{" + k + "}}", v.replace("&", "&amp;") if k in site["links"] else v)
    return text


def include(text):
    def sub(m):
        name = m.group(1)
        if name == "menu":
            return render_menu()
        if name == "gallery":
            return render_gallery()
        return (SRC / "sections" / f"{name}.html").read_text()
    return re.sub(r"<!--include:([\w-]+)-->", sub, text)


def nav_links(current, cls):
    out = []
    for n in site["nav"]:
        cur = ' aria-current="page"' if n["key"] == current else ""
        out.append(f'<li><a class="{cls}" href="{n["path"]}"{cur}>{esc(n["label"])}</a></li>')
    return "".join(out)


def foot_links(current):
    keys = ["menus", "live-music", "functions", "events", "about", "gallery", "blog", "contact"]
    by_key = {n["key"]: n for n in site["nav"]}
    return "".join(
        f'<a class="m-link" href="{by_key[k]["path"]}"{CUR if k == current else ""}>{esc(by_key[k]["label"])}</a>' for k in keys
    )


def build_page(p, urls):
    body = tokens(include((SRC / "pages" / f'{p["file"]}.html').read_text()))
    header = (SRC / "partials/header.html").read_text().replace("{{NAVLIST}}", nav_links(p.get("nav"), "m-text-3"))
    footer = (SRC / "partials/footer.html").read_text().replace("{{FOOTLINKS}}", foot_links(p.get("nav")))
    head = (SRC / "partials/head.html").read_text()
    robots = '<meta name="robots" content="noindex">' if p.get("noindex") else ""
    head = (
        head.replace("{{TITLE}}", esc(p["title"]))
        .replace("{{DESC}}", esc(p["description"], quote=True))
        .replace("{{ROBOTS}}", robots)
        .replace("{{CSS}}", urls["css"])
    )
    scripts = [
        "/vendor/gsap.min.js", "/vendor/ScrollTrigger.min.js", "/vendor/SplitText.min.js", "/vendor/MotionPathPlugin.min.js", "/vendor/lenis.min.js",
        urls["shared"],
    ] + [urls[f"scene:{s}"] for s in p.get("scenes", [])] + [urls[f"js:{j}"] for j in p.get("js", [])]
    script_tags = "\n".join(f'<script src="{s}"></script>' for s in scripts)
    page = f"{head}<body>\n<a class=\"skip\" href=\"#main\">Skip to content</a>\n{header}<main id=\"main\">\n{body}</main>\n{footer}{script_tags}\n</body>\n</html>\n"
    page = tokens(page)
    dest = OUT / p["path"].strip("/") / "index.html" if p["path"] != "/404" else OUT / "404.html"
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(page)
    return dest


def main():
    urls = build_assets()
    for p in pages:
        print("built", build_page(p, urls).relative_to(ROOT))


if __name__ == "__main__":
    main()
