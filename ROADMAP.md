# Roadmap 🛠️

A backlog of features to build **into the template itself** — the kind of
thing a contributor (or an AI assistant) can pick up later. This is different
from the two other lists:

- **[README → “Ideas for more sections”](README.md#ideas-for-more-sections-when-youre-ready)** — content *you* add to *your* site.
- **[GROWING.md](GROWING.md)** — growing into a backend, CMS, or framework.

This file is about the **engine** (`config.js` + `js/main.js` + `css/styles.css`):
new views, new components, and polish. Each item says *why*, *roughly how much
work*, and *where it would live*. Nothing here is required — it's a menu.

---

## ✅ Recently shipped

- **7 accent palettes** (added rose, ocean, mono) — `css` §2, `PALETTES` in `main.js`.
- **Layout styles** (`data-style`: `soft` / `flat`) — a whole different *view* of the
  same content, switchable from config, the ⌘K palette, and the guide — `css` §3b.
- **Gallery lightbox prev/next** — arrows + `←`/`→` keys.
- **No theme flash** — saved palette/style are applied before first paint (`index.html`).

---

## 🎯 Next up (small, high-value)

- [ ] **A third layout style — `compact`.** A denser view (tighter section padding,
      smaller type scale) for CV-heavy portfolios. *How:* add a `data-style="compact"`
      block in `css` §3b overriding `--gutter`, section `padding-block`, and font sizes;
      add `"compact"` to `STYLES` in `main.js` and the whitelist in `index.html`. ~1h.
- [ ] **Single-column hero variant.** Some people don't want the “At a glance” card.
      *How:* a `hero.layout: "centered" | "split"` config flag that toggles a class on
      `.hero`; CSS stacks and centre-aligns. ~1h.
- [ ] **Lightbox: swipe on touch + preload neighbours.** Nicer on phones. *How:* extend
      the lightbox block in `main.js` with touch handlers and an `Image()` preload. ~1h.
- [ ] **Skills with proficiency meters.** Optional `level: 0–100` per skill → a slim bar.
      *How:* extend the `skills` renderer + a `.skill-bar` in CSS. Keep it opt-in. ~1h.
- [ ] **Testimonials carousel** for when there are many quotes. *How:* wrap `.quotes__grid`
      in a scroll-snap track with prev/next; fall back to the grid under reduced-motion. ~2h.

## 🌱 Bigger ideas

- [ ] **Multiple built-in “templates”/presets** — a `preset` name in config that sets a
      matching palette + style + section order in one word (e.g. `"minimal"`, `"creative"`,
      `"developer"`). Directly extends the “change to another kind of view” idea.
- [ ] **Sections from a JSON/Markdown source** — see [GROWING.md](GROWING.md); wire the
      existing renderers to `fetch()` instead of the inline object.
- [ ] **Project detail pages / case studies** — a lightweight modal or `#project/<id>`
      route that expands a project into a longer write-up with a gallery.
- [ ] **Internationalisation** — a `content.<lang>` map + a language switcher; the renderer
      already reads one object, so this is mostly plumbing.
- [ ] **Auto-generated OG share image** — a tiny build step (or a one-off HTML canvas page)
      that stamps the name + tagline onto `og-image` so link previews look bespoke.
- [ ] **Privacy-friendly analytics toggle** — a `site.analytics` config slot documented for
      Plausible/GoatCounter (no cookies), off by default.

## ✨ Polish / a11y

- [ ] **Reduced-transparency** support (`prefers-reduced-transparency`) for the ⌘K/lightbox blur.
- [ ] **Focus trap** inside the ⌘K palette and lightbox (currently Esc + click-out only).
- [ ] **View-transition animations** between palette/style changes (progressive; `@view-transition`).
- [ ] **Print/résumé pass** — tune page breaks so a filled-in site prints to a tidy 1–2 pages.

---

### How to contribute one

The codebase is dependency-free vanilla HTML/CSS/JS on purpose. Keep new features:

1. **Config-driven** — new behaviour turns on from `config.js`, off by default.
2. **Progressive** — the site still works with JS disabled / reduced motion.
3. **Self-documenting** — a short comment block, like the rest of the files.

A good starter prompt for an AI assistant:
> *“Following the existing patterns in `js/main.js` and `css/styles.css`, add the
> `compact` layout style from ROADMAP.md. Wire it through config, the command
> palette, and the anti-flash script, and keep it off by default.”*
