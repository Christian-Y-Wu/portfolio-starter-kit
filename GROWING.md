# Growing your portfolio 🌱

The **Starter** template is a **static site** on purpose: it’s free to host, fast, secure, and simple enough to understand completely. This guide is for *“someday”* — when you want to push it further.

Read the first section before adding anything dynamic; it keeps you safe.

> **The golden rule of this template:** everything renders from **one content object** (`window.SITE` in `config.js`). So most upgrades below are *“change where the content comes from”* — not a rewrite. Swap the data source, keep the same sections.

---

## ⚠️ Sensitive info & secrets — read this first

A static website ships **every file in your repository to the public**. If you can open it in your browser, so can anyone else — and **Git keeps history even after you delete something**.

**Never put any of these in `config.js`, `index.html`, or any committed file:**

- Passwords, API keys, access tokens, secret URLs.
- Your home address, phone number, or anything you wouldn’t put on a billboard.
- Anything you want only *some* people to see.

**Where secrets actually belong** (once you go dynamic):

- In a **serverless function’s environment variables / secrets** — set in the dashboard of Cloudflare Pages, Netlify, or Vercel. Your front-end code calls the function; the function holds the key. The browser never sees it.
- Keep local secret files out of Git with **`.gitignore`** (this template already ignores `.env`). Commit a blank **`.env.example`** so others know what’s needed, never the real `.env`.

**“Private” / gated content is not private if it’s in the files.** Hiding a section with JavaScript or a password prompt in front-end code is *cosmetic* — the content is still in the downloaded page, readable by anyone who looks. Truly private content must be served by a **backend that checks who you are** before sending it.

---

## Make the content dynamic

Right now `config.js` defines `window.SITE` and `main.js` renders it. To load content from somewhere else, you just need to **produce the same `SITE` object** before `main.js` runs.

### Option 1 — load from a JSON file or API (`fetch`)
Replace the `<script src="config.js">` approach with a small loader:

```html
<script>
  fetch("/content.json")                 // or a headless CMS / API endpoint
    .then(function (r) { return r.json(); })
    .then(function (data) {
      window.SITE = data;
      // then load main.js dynamically, or have main.js wait for this
      var s = document.createElement("script");
      s.src = "js/main.js";
      document.body.appendChild(s);
    });
</script>
```
> Note: `fetch` needs a real server (it won’t work by double-clicking `index.html` via `file://`). Use a local server while developing — see the README.

### Option 2 — a headless CMS (edit content in a friendly dashboard)
Services like **[Contentful](https://www.contentful.com/)**, **[Sanity](https://www.sanity.io/)**, or **[Storyblok](https://www.storyblok.com/)** give you a web form to edit your content, then expose it as JSON. Map their fields onto the `SITE` shape and render as usual.

### Option 3 — a Google Sheet as a tiny database
Publish a Google Sheet and read it as JSON (via the Sheets API or a helper service). Great for non-technical updates to, say, your projects list.

---

## Contact form backend

The built-in form (toggle in `config.js → CONTACT`) just needs an endpoint:

- **[Formspree](https://formspree.io/)** — paste their URL into `formAction`. Easiest.
- **[Netlify Forms](https://docs.netlify.com/forms/setup/)** — if you host on Netlify, add `netlify` to the `<form>` tag; submissions appear in your dashboard.
- **A serverless function** — write your own (Cloudflare/Netlify/Vercel) that receives the POST and emails you or saves it. Put any API keys in the function’s **environment variables**, never in the page.

---

## Pull your Projects from GitHub

Populate the Projects list from the **[GitHub REST API](https://docs.github.com/en/rest/repos/repos#list-repositories-for-a-user)** instead of typing them by hand:

```js
fetch("https://api.github.com/users/your-username/repos?sort=updated&per_page=6")
  .then(function (r) { return r.json(); })
  .then(function (repos) {
    window.SITE.projects.items = repos.map(function (repo) {
      return {
        title: repo.name,
        description: repo.description || "",
        image: "assets/img/placeholder.svg",
        tags: [repo.language].filter(Boolean),
        links: [{ type: "source", label: "Source", url: repo.html_url }],
      };
    });
    // re-render after updating SITE
  });
```
The public API needs no key for basic use (it’s rate-limited). Don’t add a token to front-end code — proxy through a serverless function if you need higher limits.

---

## A real blog (from Markdown or a CMS)

The **Writing** section ships as static cards. To make it a real blog:

- **Markdown files** → add a static-site generator (Astro, Eleventy, Hugo) that turns `.md` posts into pages. This adds a build step, so it’s a bigger jump.
- **A CMS** → fetch posts from Contentful/Sanity/Ghost and render the same teaser cards, linking to full post pages.
- **Keep it simple** → for a few posts, just keep editing the `writing` array by hand and link to posts hosted elsewhere (Medium, dev.to, Substack).

---

## Ideas to extend (start small — here’s how far you could go)

You don’t need any of these. They’re here to show the ceiling is high.

### More personality (still static, easy)
- A **/now** page, a **photo gallery**, a **travel map**, a **reading list / bookshelf**, **favourite quotes**, a **music / playlists** strip, a **/uses** (gear & setup) page, a **hobbies corner**, or a **“what I’m open to”** call-to-action.

### Writing & audience
- A full **blog** with posts, tags, and an **email subscribe** box (via a newsletter service like Buttondown or Mailchimp).

### Private / gated & live data (advanced — needs a backend)
- A **“friends-only” area** unlocked by a code.
- A personal **admin dashboard** to edit your site without touching files.
- An **investing / portfolio view** with live data.
- A small **AI chat assistant** that answers questions about you.

> ⚠️ Every item in this group needs a **backend** to be done safely (see the secrets section above). They’re beyond a static template — “someday” projects, not weekend tweaks. Anything that must stay private has to be checked by a server, not hidden in the page.

### Polish add-ons
- Make it an **installable PWA** — add proper PNG icons (192 & 512) and a service worker on top of the included `site.webmanifest`.
- Add **privacy-friendly analytics** (Plausible, Fathom, or Cloudflare Web Analytics) — a single script tag.
- Add **keyboard shortcuts** or a **“View as recruiter / personal” toggle** that reorders sections (you already have a section registry to drive it).

---

## Where things live (quick map for tinkering)

| File | What it does |
| --- | --- |
| `config.js` | **All your content** (`window.SITE`). Edit this for normal changes. |
| `index.html` | The page shell + SEO/meta tags. Rarely edited. |
| `css/styles.css` | Theme variables (top) + all the styling + print/résumé styles. |
| `js/main.js` | Reads `SITE`, builds the page, and wires up the interactions. |
| `assets/img/` | Your images (portrait, projects, share image, icons, favicon). |
| `assets/cv.pdf` | The file behind the “Download CV” button. |
| `site.webmanifest`, `robots.txt`, `sitemap.xml` | Browser & search-engine metadata. |

Happy building. Start with the basics — you can always grow into the rest. 🌱
