/* =====================================================================
   main.js  —  builds the page from config.js and wires up the buttons.
   =====================================================================
   You normally don't need to edit this file. It reads window.SITE (from
   config.js) and renders the navbar, hero, every section, and the footer,
   then sets up: light/dark toggle, mobile menu, smooth scrolling,
   scroll-reveal animation, the back-to-top button, and active-link
   highlighting.

   It's plain vanilla JavaScript with no libraries, so an AI assistant
   (or a curious human) can read the whole thing. Regions are labelled.
   ===================================================================== */
(function () {
  "use strict";

  const SITE = window.SITE;
  const root = document.documentElement;

  if (!SITE) {
    document.body.innerHTML =
      '<p style="padding:2rem;font-family:sans-serif">Could not load <strong>config.js</strong>. ' +
      "Make sure it sits next to index.html and has no typos (a missing comma or quote will do it).</p>";
    return;
  }

  const reduceMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ===================================================================
     HELPERS
     =================================================================== */

  // Escape text so a stray < or " in your config can't break the page.
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // Add target/rel for links that leave the site (but not for #anchors or mailto).
  function extAttr(url) {
    return /^https?:\/\//i.test(url) ? ' target="_blank" rel="noopener noreferrer"' : "";
  }

  // Turn "2024-11-02" into "Nov 2, 2024" (falls back to the raw text).
  function formatDate(d) {
    const date = new Date(d);
    if (isNaN(date)) return esc(d);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  }

  /* ===================================================================
     ICONS  —  a tiny built-in icon set (no dependency, works offline)
     =================================================================== */
  function ui(inner) {
    return ('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + inner + "</svg>");
  }
  function brand(inner) {
    return '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">' + inner + "</svg>";
  }

  const ICONS = {
    // interface icons
    "arrow-right": ui('<path d="M5 12h14"/><path d="m13 5 7 7-7 7"/>'),
    "arrow-down": ui('<path d="M12 5v14"/><path d="m5 12 7 7 7-7"/>'),
    "arrow-up": ui('<path d="M12 19V5"/><path d="m5 12 7-7 7 7"/>'),
    "chevron-right": ui('<path d="m9 18 6-6-6-6"/>'),
    "chevron-left": ui('<path d="m15 18-6-6 6-6"/>'),
    "external-link": ui('<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>'),
    download: ui('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/>'),
    mail: ui('<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 6 10-6"/>'),
    "map-pin": ui('<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>'),
    briefcase: ui('<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>'),
    wrench: ui('<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>'),
    folder: ui('<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>'),
    user: ui('<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>'),
    pen: ui('<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>'),
    graduation: ui('<path d="M22 10 12 5 2 10l10 5 10-5Z"/><path d="M6 12v5c0 1 2 3 6 3s6-2 6-3v-5"/>'),
    sun: ui('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M6.3 17.7l-1.4 1.4M19.1 4.9l-1.4 1.4"/>'),
    moon: ui('<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>'),
    menu: ui('<path d="M4 6h16M4 12h16M4 18h16"/>'),
    close: ui('<path d="M18 6 6 18M6 6l12 12"/>'),
    send: ui('<path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4 20-7z"/>'),
    search: ui('<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>'),
    copy: ui('<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>'),
    check: ui('<path d="M20 6 9 17l-5-5"/>'),
    palette: ui('<circle cx="13.5" cy="6.5" r=".8" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".8" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".8" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".8" fill="currentColor"/><path d="M12 2a10 10 0 0 0 0 20 2.5 2.5 0 0 0 2-4 2 2 0 0 1 1.5-3.3H18a4 4 0 0 0 4-4A10 10 0 0 0 12 2Z"/>'),
    globe: ui('<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20Z"/>'),
    quote: brand('<path d="M9.5 5C6.46 5 4 7.46 4 10.5V19h7v-7H7.5c0-1.66 0-3 2-3V5zm9 0c-3.04 0-5.5 2.46-5.5 5.5V19h7v-7H16.5c0-1.66 0-3 2-3V5z"/>'),

    // brand icons (Simple Icons paths)
    github: brand('<path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.52 11.52 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.014 2.898-.014 3.293 0 .322.216.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>'),
    linkedin: brand('<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>'),
    x: brand('<path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932 6.039-6.932zm-1.291 19.494h2.039L6.486 3.24H4.298l13.312 17.407z"/>'),
    instagram: brand('<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163C8.741 0 8.332.014 7.052.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>'),
    dribbble: brand('<path d="M12 0C5.385 0 0 5.385 0 12s5.385 12 12 12c6.605 0 12-5.385 12-12S18.605 0 12 0zm9.885 11.441c-2.575-.422-4.943-.445-7.103-.073a42.153 42.153 0 0 0-.767-1.68c2.31-1 4.165-2.358 5.548-4.082a9.863 9.863 0 0 1 2.322 5.835zm-3.842-7.282c-1.205 1.554-2.868 2.783-4.986 3.68a46.287 46.287 0 0 0-3.488-5.438A9.894 9.894 0 0 1 12 2.087c2.275 0 4.368.779 6.043 2.07zM7.527 3.166a44.59 44.59 0 0 1 3.537 5.381c-2.43.715-5.331 1.082-8.684 1.105a9.931 9.931 0 0 1 5.147-6.486zM2.087 12.075v-.276c3.998 0 7.299-.461 10.058-1.39.3.59.582 1.182.84 1.79-4.108 1.16-7.302 3.49-9.602 6.99A9.875 9.875 0 0 1 2.087 12.075zm3.78 7.79c2.087-3.327 4.992-5.45 8.689-6.45.99 2.575 1.704 5.214 2.144 7.927a9.91 9.91 0 0 1-10.833-1.477zm12.673.215c-.42-2.49-1.072-4.91-1.96-7.273 1.876-.291 3.91-.234 6.094.171a9.926 9.926 0 0 1-4.134 7.102z"/>'),
    mastodon: brand('<path d="M23.268 5.313c-.35-2.578-2.617-4.61-5.304-5.004C17.51.242 15.792 0 11.813 0h-.03c-3.98 0-4.835.242-5.288.309C3.882.692 1.496 2.518.917 5.127.64 6.412.61 7.837.661 9.143c.074 1.874.088 3.745.26 5.611.118 1.24.325 2.47.62 3.68.55 2.237 2.777 4.098 4.96 4.857 2.336.792 4.849.923 7.256.38.265-.061.527-.132.786-.213.585-.184 1.27-.39 1.774-.753a.057.057 0 0 0 .023-.043v-1.809a.052.052 0 0 0-.066-.051c-1.504.357-3.043.536-4.588.535-2.665 0-3.382-1.265-3.587-1.79a5.567 5.567 0 0 1-.317-1.434.05.05 0 0 1 .064-.052c1.48.358 2.998.538 4.521.537.366 0 .73 0 1.097-.01 1.532-.043 3.147-.121 4.654-.415.038-.008.075-.015.107-.024 2.378-.456 4.642-1.889 4.872-5.506.008-.142.029-1.49.029-1.638.001-.503.162-3.572-.024-5.455zm-3.748 9.195h-2.561V8.29c0-1.309-.55-1.976-1.67-1.976-1.23 0-1.846.79-1.846 2.35v3.403h-2.546V8.663c0-1.56-.617-2.35-1.848-2.35-1.112 0-1.668.668-1.67 1.977v6.218H4.822V8.102c0-1.31.337-2.35 1.011-3.12.696-.77 1.608-1.164 2.74-1.164 1.311 0 2.302.5 2.962 1.498l.638 1.06.638-1.06c.66-.999 1.65-1.498 2.96-1.498 1.13 0 2.043.395 2.74 1.164.675.77 1.012 1.81 1.012 3.12v6.406z"/>'),
    bluesky: brand('<path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8z"/>'),
    youtube: brand('<path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>'),
    codepen: brand('<path d="M24 8.182l-.018-.087-.017-.05c-.01-.024-.018-.05-.03-.075-.003-.018-.015-.034-.02-.05l-.035-.067-.03-.05-.044-.06-.046-.045-.05-.044-.05-.03-.06-.044-.05-.03-.07-.034-.05-.02-.07-.03-.07-.01-.06-.02-.07-.01-.07-.005-.06-.005H11.92l-.06.005-.07.005-.07.01-.06.02-.07.01-.07.03-.05.02-.07.034-.05.03-.06.044-.05.03-.05.044-.046.045-.044.06-.03.05-.035.067c-.005.016-.017.032-.02.05-.012.025-.02.05-.03.075l-.017.05L0 8.182v7.636l.018.087.017.05c.01.024.018.05.03.075.003.018.015.034.02.05l.035.067.03.05.044.06.046.045.05.044.05.03.06.044.05.03.07.034.05.02.07.03.07.01.06.02.07.01.07.005.06.005h.165l.06-.005.07-.005.07-.01.06-.02.07-.01.07-.03.05-.02.07-.034.05-.03.06-.044.05-.03.05-.044.046-.045.044-.06.03-.05.035-.067c.005-.016.017-.032.02-.05.012-.025.02-.05.03-.075l.017-.05.018-.087V8.182zM12 16.301l-3.69-2.46v-2.69L12 13.61l3.69-2.46v2.69L12 16.3zM3.738 9.99L12 4.485l8.262 5.505-2.07 1.38L12 7.165 5.808 11.37 3.738 9.99z"/>')
  };

  function icon(name) {
    return ICONS[name] || "";
  }

  /* ===================================================================
     THEME, FONT & SEO  (run before rendering to avoid any flash)
     =================================================================== */
  // Palette (accent colour). A visitor can switch it live from the command
  // palette; if they have, honour their saved choice — otherwise use config.
  const PALETTES = ["slate", "forest", "sunset", "violet", "rose", "ocean", "mono"];
  let savedPalette = null;
  try { savedPalette = localStorage.getItem("palette"); } catch (e) {}
  const startPalette = PALETTES.indexOf(savedPalette) > -1
    ? savedPalette
    : (SITE.theme && SITE.theme.palette) || "slate";
  root.setAttribute("data-palette", startPalette);

  // Layout style (the overall "look" — see css section 3b). Same idea as the
  // palette: a saved choice wins, otherwise config, otherwise the default.
  const STYLES = ["soft", "flat"];
  let savedStyle = null;
  try { savedStyle = localStorage.getItem("style"); } catch (e) {}
  const startStyle = STYLES.indexOf(savedStyle) > -1
    ? savedStyle
    : (SITE.theme && STYLES.indexOf(SITE.theme.style) > -1 ? SITE.theme.style : "soft");
  root.setAttribute("data-style", startStyle);

  // Honour a forced light/dark default from config (only if the visitor
  // hasn't already chosen one themselves on a previous visit).
  let savedTheme = null;
  try { savedTheme = localStorage.getItem("theme"); } catch (e) {}
  if (!savedTheme) {
    const def = SITE.theme && SITE.theme.defaultMode;
    if (def === "light" || def === "dark") root.setAttribute("data-theme", def);
  }

  // Optional Google Font (skipped for "system"; needs internet to load).
  if (SITE.theme && SITE.theme.font && SITE.theme.font !== "system") {
    const fam = String(SITE.theme.font).trim().replace(/\s+/g, "+");
    // Warm up the font connections first so the download can start sooner.
    [["https://fonts.googleapis.com", false], ["https://fonts.gstatic.com", true]]
      .forEach(function (pair) {
        const pre = document.createElement("link");
        pre.rel = "preconnect";
        pre.href = pair[0];
        if (pair[1]) pre.crossOrigin = "anonymous";
        document.head.appendChild(pre);
      });
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=" + fam + ":wght@400;500;600;700;800&display=swap";
    document.head.appendChild(link);
    root.style.setProperty("--font", "'" + SITE.theme.font + "', ui-sans-serif, system-ui, sans-serif");
  }

  // Keep the browser tab / search / share text in sync with config.
  (function syncMeta() {
    const s = SITE.site || {};
    if (s.title) document.title = s.title;
    setMeta('meta[name="description"]', "content", s.description);
    setMeta('meta[property="og:title"]', "content", s.title);
    setMeta('meta[property="og:description"]', "content", s.description);
    setMeta('meta[property="og:url"]', "content", s.url);
    setMeta('meta[property="og:image"]', "content", absUrl(s.ogImage, s.url));
    setMeta('meta[name="twitter:title"]', "content", s.title);
    setMeta('meta[name="twitter:description"]', "content", s.description);
    setMeta('meta[name="twitter:image"]', "content", absUrl(s.ogImage, s.url));
    setMeta('link[rel="canonical"]', "href", s.url);
    if (s.locale) root.setAttribute("lang", s.locale);
  })();

  function setMeta(selector, attr, value) {
    if (!value) return;
    const el = document.querySelector(selector);
    if (el) el.setAttribute(attr, value);
  }
  function absUrl(path, base) {
    if (!path) return "";
    if (/^https?:\/\//i.test(path)) return path;
    if (base && /^https?:\/\//i.test(base)) return base.replace(/\/$/, "") + "/" + path.replace(/^\//, "");
    return path;
  }

  /* ===================================================================
     RENDER: shared bits
     =================================================================== */
  function socialLinks(extraClass) {
    return (SITE.social || [])
      .filter(function (s) { return s.url; })
      .map(function (s) {
        return ('<a class="social-link ' + (extraClass || "") + '" href="' + esc(s.url) +
          '" aria-label="' + esc(s.label) + '"' + extAttr(s.url) + ">" + icon(s.icon) + "</a>");
      })
      .join("");
  }

  function buttonsCta(cta, cls) {
    return '<a class="btn ' + cls + '" href="' + esc(cta.href) + '">' + esc(cta.label) +
      (cls.indexOf("primary") > -1 ? icon("arrow-right") : "") + "</a>";
  }

  /* ===================================================================
     RENDER: navbar
     =================================================================== */
  function renderNav() {
    const links = (SITE.sections || [])
      .filter(function (s) { return s.show; })
      .map(function (s) {
        return '<li><a class="navbar__link" href="#' + s.id + '">' + esc(s.nav) + "</a></li>";
      })
      .join("");

    const showToggle = !SITE.nav || SITE.nav.showThemeToggle !== false;
    const showCmdk = !SITE.nav || SITE.nav.commandPalette !== false;

    return (
      '<div class="navbar__inner">' +
        '<a class="navbar__brand" href="#top">' + esc((SITE.nav && SITE.nav.brand) || "") + "</a>" +
        '<nav aria-label="Sections"><ul class="navbar__links" id="nav-links">' + links + "</ul></nav>" +
        '<div class="navbar__actions">' +
          (showCmdk
            ? '<button class="cmdk-open" id="cmdk-open" type="button" aria-label="Search and quick actions" aria-haspopup="dialog" title="Search  (Ctrl / ⌘ + K)">' +
                icon("search") + '<span class="cmdk-open__hint" aria-hidden="true"><kbd>⌘</kbd><kbd>K</kbd></span>' +
              "</button>"
            : "") +
          '<button class="icon-btn nav-toggle" id="nav-toggle" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="nav-links">' + icon("menu") + "</button>" +
          (showToggle
            ? '<button class="icon-btn theme-toggle" id="theme-toggle" type="button" aria-label="Toggle dark mode"></button>'
            : "") +
        "</div>" +
      "</div>"
    );
  }

  /* ===================================================================
     RENDER: hero
     =================================================================== */
  function renderHero() {
    const h = SITE.hero || {};

    // Underline part of the name in the accent colour.
    let nameHtml = esc(h.name);
    if (h.nameHighlight) {
      const hl = esc(h.nameHighlight);
      nameHtml = nameHtml.replace(hl, '<span class="hl">' + hl + "</span>");
    }

    const glance = (h.glance || [])
      .map(function (g) {
        return ('<a class="glance__row" href="' + esc(g.href) + '">' +
          '<span class="glance__icon">' + icon(g.icon) + "</span>" +
          '<span class="glance__text"><span class="glance__label">' + esc(g.label) + "</span>" +
          '<span class="glance__value">' + esc(g.value) + "</span></span>" +
          '<span class="glance__chev">' + icon("chevron-right") + "</span></a>");
      })
      .join("");

    const cv = h.cv && h.cv.show
      ? '<a class="btn btn--ghost" href="' + esc(h.cv.file) + '" download>' + icon("download") + esc(h.cv.label) + "</a>"
      : "";

    return (
      '<section class="hero" id="top">' +
        '<div class="container hero__grid">' +
          '<div class="hero__intro reveal">' +
            '<span class="pill"><span class="pill__dot ' + (h.statusOpen ? "pill__dot--open" : "") + '"></span>' + esc(h.statusText) + "</span>" +
            '<p class="hero__eyebrow">' + esc(h.eyebrow) + "</p>" +
            '<h1 class="hero__name">' + nameHtml + "</h1>" +
            '<p class="hero__tagline">' + esc(h.tagline) + "</p>" +
            '<div class="hero__cta">' +
              buttonsCta(h.primaryCta, "btn--primary") +
              buttonsCta(h.secondaryCta, "btn--ghost") +
              cv +
            "</div>" +
            '<div class="hero__social">' + socialLinks() + "</div>" +
          "</div>" +
          '<div class="hero__aside reveal">' +
            '<div class="glance">' +
              '<p class="glance__title">' + esc(h.glanceTitle) + "</p>" +
              glance +
            "</div>" +
          "</div>" +
        "</div>" +
        '<div class="container"><div class="scroll-hint">Scroll' + icon("arrow-down") + "</div></div>" +
      "</section>"
    );
  }

  /* ===================================================================
     RENDER: section renderers (one per section id)
     =================================================================== */
  function timeline(data) {
    return '<ul class="timeline reveal">' + (data.items || []).map(function (it) {
      return (
        '<li class="timeline__item">' +
          '<div class="timeline__head">' +
            (it.logo ? '<img class="timeline__logo" src="' + esc(it.logo) + '" alt="">' : "") +
            '<span class="timeline__title">' + esc(it.title) + "</span>" +
            '<span class="timeline__org">' + esc(it.org) + "</span>" +
            '<span class="timeline__dates">' + esc(it.dates) + "</span>" +
          "</div>" +
          (it.bullets && it.bullets.length
            ? '<ul class="timeline__bullets">' + it.bullets.map(function (b) { return "<li>" + esc(b) + "</li>"; }).join("") + "</ul>"
            : "") +
        "</li>"
      );
    }).join("") + "</ul>";
  }

  const RENDERERS = {
    about: function (d) {
      return (
        '<div class="about__grid reveal">' +
          '<img class="about__photo" src="' + esc(d.photo) + '" alt="' + esc(d.photoAlt) + '" loading="lazy" width="600" height="600">' +
          '<div class="about__bio">' +
            (d.paragraphs || []).map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("") +
            (d.interests && d.interests.length
              ? '<div class="about__interests">' + d.interests.map(function (i) { return '<span class="chip">' + esc(i) + "</span>"; }).join("") + "</div>"
              : "") +
            (d.quickFacts && d.quickFacts.length
              ? '<ul class="about__facts">' + d.quickFacts.map(function (f) {
                  return '<li><span class="fact-label">' + esc(f.label) + '</span><span class="fact-value">' + esc(f.value) + "</span></li>";
                }).join("") + "</ul>"
              : "") +
          "</div>" +
        "</div>"
      );
    },

    now: function (d) {
      return '<ul class="now__list reveal">' + (d.items || []).map(function (it) {
        return '<li class="now__item"><span class="now__icon">' + icon(it.icon) + "</span><span>" + esc(it.text) + "</span></li>";
      }).join("") + "</ul>";
    },

    stats: function (d) {
      return '<div class="stats__grid reveal">' + (d.items || []).map(function (it) {
        return '<div class="stat"><div class="stat__value" data-value="' + esc(it.value) + '">' + esc(it.value) + "</div>" +
          '<div class="stat__label">' + esc(it.label) + "</div></div>";
      }).join("") + "</div>";
    },

    gallery: function (d) {
      return '<div class="gallery__grid reveal">' + (d.items || []).map(function (it, idx) {
        const cap = it.caption || "";
        return '<button class="gallery__item" type="button" data-full="' + esc(it.image) + '" data-caption="' + esc(cap) +
          '" aria-label="' + esc(cap || ("Open photo " + (idx + 1))) + '">' +
          '<img src="' + esc(it.image) + '" alt="' + esc(cap || ("Gallery photo " + (idx + 1))) + '" loading="lazy">' +
          (cap ? '<span class="gallery__caption">' + esc(cap) + "</span>" : "") +
          "</button>";
      }).join("") + "</div>";
    },

    experience: timeline,
    education: timeline,

    skills: function (d) {
      return '<div class="skills__grid reveal">' + (d.groups || []).map(function (g) {
        return ('<div class="skills__group"><h3>' + esc(g.name) + '</h3><div class="skills__tags">' +
          (g.items || []).map(function (i) { return '<span class="chip">' + esc(i) + "</span>"; }).join("") +
          "</div></div>");
      }).join("") + "</div>";
    },

    projects: function (d) {
      const items = d.items || [];

      // Build the filter bar from the union of every project's tags. It only
      // shows when it's actually useful (opt-in AND at least two tags exist).
      let filterBar = "";
      if (d.filters !== false) {
        const seen = {};
        const uniqueTags = [];
        items.forEach(function (p) {
          (p.tags || []).forEach(function (t) {
            const key = String(t).toLowerCase();
            if (!seen[key]) { seen[key] = true; uniqueTags.push(t); }
          });
        });
        if (uniqueTags.length > 1) {
          filterBar = '<div class="projects__filters reveal" role="group" aria-label="Filter projects by tag">' +
            '<button class="filter-btn is-active" type="button" data-filter="*" aria-pressed="true">All</button>' +
            uniqueTags.map(function (t) {
              return '<button class="filter-btn" type="button" data-filter="' + esc(String(t).toLowerCase()) +
                '" aria-pressed="false">' + esc(t) + "</button>";
            }).join("") +
          "</div>";
        }
      }

      const grid = '<div class="projects__grid reveal">' + items.map(function (p) {
        const linksHtml = (p.links || [])
          .filter(function (l) { return l.url; })
          .map(function (l) {
            return ('<a class="btn btn--ghost btn--small" href="' + esc(l.url) + '"' + extAttr(l.url) + ">" +
              esc(l.label) + (l.type === "source" ? icon("github") : icon("external-link")) + "</a>");
          }).join("");
        const tagKeys = (p.tags || []).map(function (t) { return String(t).toLowerCase(); }).join("|");
        return (
          '<article class="project ' + (p.featured ? "project--featured" : "") + '" data-tags="' + esc(tagKeys) + '">' +
            '<div class="project__media"><img src="' + esc(p.image || "assets/img/placeholder.svg") + '" alt="' + esc(p.title) + ' preview" loading="lazy"></div>' +
            '<div class="project__body">' +
              '<h3 class="project__title">' + esc(p.title) + "</h3>" +
              '<p class="project__desc">' + esc(p.description) + "</p>" +
              (p.tags && p.tags.length ? '<div class="project__tags">' + p.tags.map(function (t) { return '<span class="tag">' + esc(t) + "</span>"; }).join("") + "</div>" : "") +
              (linksHtml ? '<div class="project__links">' + linksHtml + "</div>" : "") +
            "</div>" +
          "</article>"
        );
      }).join("") + "</div>";

      return filterBar + grid;
    },

    writing: function (d) {
      return '<div class="writing__grid reveal">' + (d.items || []).map(function (post) {
        return (
          '<a class="post" href="' + esc(post.url) + '"' + extAttr(post.url) + ">" +
            '<span class="post__date">' + formatDate(post.date) + "</span>" +
            '<span class="post__title">' + esc(post.title) + "</span>" +
            '<span class="post__blurb">' + esc(post.blurb) + "</span>" +
            '<span class="post__more">Read more' + icon("arrow-right") + "</span>" +
          "</a>"
        );
      }).join("") + "</div>";
    },

    testimonials: function (d) {
      return '<div class="quotes__grid reveal">' + (d.items || []).map(function (q) {
        return (
          '<figure class="quote">' +
            '<span class="quote__mark">' + icon("quote") + "</span>" +
            '<blockquote class="quote__text">' + esc(q.quote) + "</blockquote>" +
            '<figcaption class="quote__who"><span class="quote__name">' + esc(q.name) + '</span><span class="quote__role">' + esc(q.role) + "</span></figcaption>" +
          "</figure>"
        );
      }).join("") + "</div>";
    },

    contact: function (d) {
      const form = d.form
        ? ('<form class="contact-form reveal" action="' + esc(d.formAction) + '" method="POST">' +
            '<div><label for="cf-name">Name</label><input id="cf-name" name="name" type="text" autocomplete="name" required></div>' +
            '<div><label for="cf-email">Email</label><input id="cf-email" name="email" type="email" autocomplete="email" required></div>' +
            '<div><label for="cf-msg">Message</label><textarea id="cf-msg" name="message" required></textarea></div>' +
            // Honeypot: hidden from people, tempting to bots. If it's filled in,
            // we treat the message as spam. ("_gotcha" is Formspree's field name.)
            '<div class="hp" aria-hidden="true"><label>Leave this field empty<input type="text" name="_gotcha" tabindex="-1" autocomplete="off"></label></div>' +
            '<button class="btn btn--primary contact-form__submit" type="submit">' + icon("send") + "<span>Send message</span></button>" +
            '<p class="contact-form__status" role="status" aria-live="polite" hidden></p>' +
          "</form>")
        : "";
      const copyBtn = d.email
        ? '<button class="btn btn--ghost" type="button" data-copy-email="' + esc(d.email) + '" aria-label="Copy email address to clipboard">' + icon("copy") + "<span>Copy email</span></button>"
        : "";
      return (
        '<div class="contact__card reveal">' +
          '<h3 class="contact__heading">' + esc(d.heading) + "</h3>" +
          '<p class="contact__text">' + esc(d.text) + "</p>" +
          '<div class="contact__actions"><a class="btn btn--primary" href="mailto:' + esc(d.email) + '">' + icon("mail") + esc(d.emailButtonLabel) + "</a>" + copyBtn + "</div>" +
          '<div class="contact__social">' + socialLinks() + "</div>" +
          form +
        "</div>"
      );
    }
  };

  function renderSection(reg) {
    const data = SITE[reg.id];
    if (!data) return "";
    const renderer = RENDERERS[reg.id];
    // Known section? use its renderer. Otherwise, if the section provides
    // raw "html" (e.g. an embedded map/video/tool), drop it in as-is.
    let body = "";
    if (renderer) body = renderer(data);
    else if (typeof data.html === "string") body = '<div class="embed reveal">' + data.html + "</div>";
    if (!body) return "";
    return (
      '<section class="section" id="' + reg.id + '" aria-labelledby="' + reg.id + '-title">' +
        '<div class="container">' +
          '<header class="section__head reveal">' +
            '<div class="section__divider"><span class="em-dash">—</span>' +
              '<h2 class="section__title" id="' + reg.id + '-title">' + esc(reg.nav) + "</h2></div>" +
            (data.intro ? '<p class="section__intro">' + esc(data.intro) + "</p>" : "") +
          "</header>" +
          body +
        "</div>" +
      "</section>"
    );
  }

  /* ===================================================================
     RENDER: footer
     =================================================================== */
  function renderFooter() {
    const f = SITE.footer || {};
    const email = (SITE.contact && SITE.contact.email) || "";
    const repo = f.repo && f.repo.url
      ? '<a class="footer__repo" href="' + esc(f.repo.url) + '" target="_blank" rel="noopener">' +
        icon("github") + esc(f.repo.label || "GitHub") + "</a>"
      : "";
    const credit = f.showCredit !== false
      ? '<p class="footer__credit">Built with the <a href="https://github.com/Christian-Y-Wu/portfolio-starter-kit" ' +
        'target="_blank" rel="noopener">Starter</a> portfolio template.</p>'
      : "";
    return (
      '<div class="container footer__inner">' +
        (f.tagline ? '<p class="footer__tagline">' + esc(f.tagline) + "</p>" : "") +
        (email ? '<a class="btn btn--ghost btn--small" href="mailto:' + esc(email) + '">' + icon("mail") + esc(email) + "</a>" : "") +
        '<div class="footer__social">' + socialLinks() + "</div>" +
        repo +
        credit +
      "</div>"
    );
  }

  /* ===================================================================
     RENDER: the "Start here" guide (a friendly help box for the owner)
     =================================================================== */
  function guideDismissed() {
    try { return !!localStorage.getItem("guideDismissed"); } catch (e) { return false; }
  }
  function renderGuide() {
    if (!SITE.guide || SITE.guide.show === false || guideDismissed()) return "";
    const swatches = PALETTES.map(function (p) {
      const name = p.charAt(0).toUpperCase() + p.slice(1);
      return '<button type="button" class="guide__swatch" data-palette="' + p + '">' +
        '<span class="guide__swatch-dot guide__swatch-dot--' + p + '"></span>' + name + "</button>";
    }).join("");
    const styleSwatches = [["soft", "Soft"], ["flat", "Flat"]].map(function (pair) {
      return '<button type="button" class="guide__swatch" data-style="' + pair[0] + '">' + pair[1] + "</button>";
    }).join("");
    return (
      '<div class="container">' +
        '<aside class="guide" id="start-guide" role="note" aria-label="Getting started">' +
          '<button class="guide__close" id="guide-close" type="button" aria-label="Hide this getting-started note">' + icon("close") + "</button>" +
          '<p class="guide__eyebrow">👋 Welcome — this note is just for you</p>' +
          '<h2 class="guide__title">Make this site yours in a few minutes</h2>' +
          '<ol class="guide__steps">' +
            '<li><strong>Open <code>config.js</code></strong> in a text editor (<a href="https://code.visualstudio.com/" target="_blank" rel="noopener">VS Code</a> is free and friendly).</li>' +
            '<li><strong>Edit the lines marked <code>👉 EDIT</code></strong> — start with your name, tagline, photo and email.</li>' +
            '<li><strong>Save</strong>, then <strong>refresh</strong> this page to see your changes.</li>' +
          "</ol>" +
          '<div class="guide__colours">' +
            '<span class="guide__colours-label">Try a colour theme:</span>' +
            '<div class="guide__swatches">' + swatches + "</div>" +
          "</div>" +
          '<div class="guide__colours">' +
            '<span class="guide__colours-label">Try a layout style:</span>' +
            '<div class="guide__swatches">' + styleSwatches + "</div>" +
          "</div>" +
          '<p class="guide__hint" id="guide-hint">Tip: click to preview instantly. To keep a look, set <code>palette</code> / <code>style</code> under <code>theme</code> in <code>config.js</code>.</p>' +
          '<div class="guide__next">' +
            '<p class="guide__next-title">When you\'re ready, you can go further:</p>' +
            '<ul class="guide__next-list">' +
              '<li>🎨 Choose your <strong>own colours</strong> — edit the variables at the top of <code>css/styles.css</code> (the README shows how).</li>' +
              '<li>🧩 Add <strong>more sections</strong> — a photo gallery, a reading list, a “/uses” page… ideas are in the README.</li>' +
              '<li>🗄️ Grow into a <strong>database or CMS</strong> later — your content lives in one place, so it\'s an easy swap (see GROWING.md).</li>' +
            "</ul>" +
            communityLink() +
          "</div>" +
          '<p class="guide__foot">Want the full walkthrough? It\'s in the <strong>README</strong>. All done? Set <code>guide.show: false</code> in <code>config.js</code> to remove this box for good.</p>' +
        "</aside>" +
      "</div>"
    );
  }
  function communityLink() {
    const c = SITE.community || {};
    if (c.show === false || !c.url) return "";
    return '<a class="guide__community" href="' + esc(c.url) + '" target="_blank" rel="noopener">' +
      "✨ Find more templates &amp; join the " + esc(c.label || "community") + " →</a>";
  }

  /* ===================================================================
     PAINT THE PAGE
     =================================================================== */
  document.getElementById("navbar").innerHTML = renderNav();
  document.getElementById("content").innerHTML =
    renderGuide() + renderHero() + (SITE.sections || []).filter(function (s) { return s.show; }).map(renderSection).join("");
  document.getElementById("site-footer").innerHTML = renderFooter();

  /* ===================================================================
     INTERACTIONS
     =================================================================== */

  // ---- Light / dark toggle -----------------------------------------
  const themeToggle = document.getElementById("theme-toggle");
  function paintToggle() {
    if (!themeToggle) return;
    const dark = root.getAttribute("data-theme") === "dark";
    themeToggle.innerHTML = dark ? icon("sun") : icon("moon");
    themeToggle.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
    const tc = document.querySelector('meta[name="theme-color"]');
    if (tc) tc.setAttribute("content", dark ? "#0b1120" : "#ffffff");
  }
  paintToggle();
  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) {}
      paintToggle();
    });
  }

  // ---- Mobile menu --------------------------------------------------
  const navToggle = document.getElementById("nav-toggle");
  const navLinks = document.getElementById("nav-links");
  function closeMenu() {
    if (!navLinks) return;
    navLinks.classList.remove("is-open");
    if (navToggle) { navToggle.setAttribute("aria-expanded", "false"); navToggle.innerHTML = icon("menu"); }
  }
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      const open = navLinks.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.innerHTML = open ? icon("close") : icon("menu");
    });
  }

  // ---- Smooth scroll for in-page links + focus the target ----------
  document.addEventListener("click", function (e) {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute("href").slice(1);
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    closeMenu();
    target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    if (history.replaceState) history.replaceState(null, "", "#" + id);
    // Move keyboard focus to the section we jumped to (accessibility).
    target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  });

  // ---- Reading progress + back-to-top + sticky navbar shadow -------
  const backTop = document.getElementById("back-to-top");
  const navbarEl = document.getElementById("navbar");
  const progressEl = document.getElementById("scroll-progress");
  if (backTop) {
    backTop.hidden = false;
    backTop.innerHTML = icon("arrow-up");
    backTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }
  let ticking = false;
  function updateScroll() {
    const y = window.scrollY || window.pageYOffset;
    if (navbarEl) navbarEl.classList.toggle("is-stuck", y > 8);
    if (backTop) backTop.classList.toggle("is-visible", y > 600);
    if (progressEl) {
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      progressEl.style.transform = "scaleX(" + (max > 0 ? Math.min(1, y / max) : 0) + ")";
    }
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateScroll);
  }, { passive: true });
  updateScroll();   // set the initial state

  // ---- Scroll-reveal animation -------------------------------------
  const reveals = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add("is-visible"); io.unobserve(entry.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  }

  // ---- Active section highlighting (navbar + optional dot-rail) -----
  const sectionEls = Array.prototype.slice.call(document.querySelectorAll("main .section"));

  // Build the optional dot-rail
  const dotRail = document.getElementById("dot-rail");
  if (dotRail && SITE.nav && SITE.nav.showDotRail) {
    dotRail.hidden = false;
    dotRail.innerHTML = (SITE.sections || []).filter(function (s) { return s.show; }).map(function (s) {
      return '<a href="#' + s.id + '" aria-label="' + esc(s.nav) + '">' +
        '<span class="dot-rail__label">' + esc(s.nav) + "</span></a>";
    }).join("");
  }

  function setActive(id) {
    document.querySelectorAll(".navbar__link").forEach(function (a) {
      a.classList.toggle("is-active", a.getAttribute("href") === "#" + id);
    });
    if (dotRail) dotRail.querySelectorAll("a").forEach(function (a) {
      a.classList.toggle("is-active", a.getAttribute("href") === "#" + id);
    });
  }
  if ("IntersectionObserver" in window && sectionEls.length) {
    const spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) { if (entry.isIntersecting) setActive(entry.target.id); });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
    sectionEls.forEach(function (s) { spy.observe(s); });
  }

  // ---- Gallery lightbox (click a photo to enlarge it; ← / → to browse) ----
  const galleryItems = Array.prototype.slice.call(document.querySelectorAll(".gallery__item"));
  if (galleryItems.length) {
    // Snapshot every photo once, so we can step through them in the viewer.
    const photos = galleryItems.map(function (btn) {
      const img = btn.querySelector("img");
      return {
        src: btn.getAttribute("data-full"),
        caption: btn.getAttribute("data-caption") || "",
        alt: img ? img.alt : "",
      };
    });
    const multiple = photos.length > 1;

    const lb = document.createElement("div");
    lb.className = "lightbox";
    lb.hidden = true;
    lb.setAttribute("role", "dialog");
    lb.setAttribute("aria-modal", "true");
    lb.setAttribute("aria-label", "Image viewer");
    lb.innerHTML =
      '<button class="lightbox__close" type="button" aria-label="Close image viewer">' + icon("close") + "</button>" +
      (multiple
        ? '<button class="lightbox__nav lightbox__nav--prev" type="button" aria-label="Previous photo">' + icon("chevron-left") + "</button>" +
          '<button class="lightbox__nav lightbox__nav--next" type="button" aria-label="Next photo">' + icon("chevron-right") + "</button>"
        : "") +
      '<figure class="lightbox__figure"><img class="lightbox__img" alt=""><figcaption class="lightbox__caption"></figcaption></figure>';
    document.body.appendChild(lb);
    const lbImg = lb.querySelector(".lightbox__img");
    const lbCap = lb.querySelector(".lightbox__caption");
    const lbClose = lb.querySelector(".lightbox__close");
    let lastFocused = null;
    let current = 0;

    function showPhoto(i) {
      current = (i + photos.length) % photos.length;   // wrap around both ends
      const p = photos[current];
      lbImg.src = p.src; lbImg.alt = p.alt || p.caption || "";
      lbCap.textContent = p.caption;
      lbCap.style.display = p.caption ? "" : "none";
    }
    function openLightbox(i) {
      showPhoto(i);
      lb.hidden = false;
      document.body.style.overflow = "hidden";
      lastFocused = document.activeElement;
      lbClose.focus();
    }
    function closeLightbox() {
      lb.hidden = true;
      document.body.style.overflow = "";
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    }
    galleryItems.forEach(function (btn, i) {
      btn.addEventListener("click", function () { openLightbox(i); });
    });
    lbClose.addEventListener("click", closeLightbox);
    lb.addEventListener("click", function (e) { if (e.target === lb) closeLightbox(); });
    if (multiple) {
      lb.querySelector(".lightbox__nav--prev").addEventListener("click", function () { showPhoto(current - 1); });
      lb.querySelector(".lightbox__nav--next").addEventListener("click", function () { showPhoto(current + 1); });
    }
    document.addEventListener("keydown", function (e) {
      if (lb.hidden) return;
      if (e.key === "Escape") closeLightbox();
      else if (multiple && e.key === "ArrowLeft") { e.preventDefault(); showPhoto(current - 1); }
      else if (multiple && e.key === "ArrowRight") { e.preventDefault(); showPhoto(current + 1); }
    });
  }

  // ---- Stats count-up (gentle; respects reduced-motion) ------------
  const statValues = document.querySelectorAll(".stat__value");
  if (statValues.length && !reduceMotion && "IntersectionObserver" in window) {
    const parseStat = function (txt) {
      const m = String(txt).match(/^(\D*)(\d[\d,]*)(.*)$/);
      return m ? { prefix: m[1], num: parseInt(m[2].replace(/,/g, ""), 10), suffix: m[3] } : null;
    };
    const run = function (el) {
      const p = parseStat(el.getAttribute("data-value"));
      if (!p) return;
      const dur = 1100, start = performance.now();
      (function step(now) {
        const t = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = p.prefix + Math.round(p.num * eased).toLocaleString() + p.suffix;
        if (t < 1) requestAnimationFrame(step);
      })(start);
    };
    const sObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { run(e.target); sObs.unobserve(e.target); } });
    }, { threshold: 0.4 });
    statValues.forEach(function (el) {
      const p = parseStat(el.getAttribute("data-value"));
      if (p) el.textContent = p.prefix + "0" + p.suffix;   // start from zero, no flash of the final number
      sObs.observe(el);
    });
  }

  // ---- Optional typewriter on the hero name ------------------------
  if (SITE.hero && SITE.hero.typewriter && !reduceMotion) {
    const nameEl = document.querySelector(".hero__name");
    const full = SITE.hero.name || "";
    if (nameEl && full) {
      nameEl.textContent = "";
      let i = 0;
      (function type() {
        nameEl.textContent = full.slice(0, i++);
        if (i <= full.length) setTimeout(type, 65);
      })();
    }
  }

  // ---- "Start here" guide: dismiss + live colour preview -----------
  const guideEl = document.getElementById("start-guide");
  if (guideEl) {
    const closeBtn = document.getElementById("guide-close");
    if (closeBtn) closeBtn.addEventListener("click", function () {
      try { localStorage.setItem("guideDismissed", "1"); } catch (e) {}
      guideEl.parentNode.remove();   // remove the wrapping .container too
    });
    const hint = document.getElementById("guide-hint");
    guideEl.querySelectorAll("[data-palette]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const p = btn.getAttribute("data-palette");
        root.setAttribute("data-palette", p);   // live preview only — config.js is the real setting
        guideEl.querySelectorAll("[data-palette]").forEach(function (b) {
          b.classList.toggle("is-active", b === btn);
        });
        if (hint) hint.innerHTML =
          'Nice choice! To keep it, set <code>palette: "' + p + '"</code> under <code>theme</code> in <code>config.js</code>.';
      });
    });
    guideEl.querySelectorAll("[data-style]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const s = btn.getAttribute("data-style");
        root.setAttribute("data-style", s);   // live preview only — config.js is the real setting
        guideEl.querySelectorAll("[data-style]").forEach(function (b) {
          b.classList.toggle("is-active", b === btn);
        });
        if (hint) hint.innerHTML =
          'Nice choice! To keep it, set <code>style: "' + s + '"</code> under <code>theme</code> in <code>config.js</code>.';
      });
    });
  }

  /* ===================================================================
     SHARED HELPERS  (used by the palette, form, and copy button below)
     =================================================================== */

  // A tiny toast (bottom-centre) that announces itself to screen readers.
  let toastEl = null, toastTimer = null;
  function showToast(msg) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "toast";
      toastEl.setAttribute("role", "status");
      toastEl.setAttribute("aria-live", "polite");
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    void toastEl.offsetWidth;                 // restart the animation if it's already up
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("is-visible"); }, 2200);
  }

  function smoothScrollTo(id) {
    const target = document.getElementById(id);
    if (!target) return;
    target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    if (history.replaceState) history.replaceState(null, "", "#" + id);
    target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  }

  // Switch the accent colour and remember it (like the dark-mode choice).
  function applyPalette(p) {
    if (PALETTES.indexOf(p) < 0) return;
    root.setAttribute("data-palette", p);
    try { localStorage.setItem("palette", p); } catch (e) {}
  }

  // Switch the layout style ("soft" / "flat") and remember it.
  function applyStyle(s) {
    if (STYLES.indexOf(s) < 0) return;
    root.setAttribute("data-style", s);
    try { localStorage.setItem("style", s); } catch (e) {}
  }

  // Copy text with a graceful fallback for older / non-secure contexts.
  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      try {
        const ta = document.createElement("textarea");
        ta.value = text; ta.setAttribute("readonly", "");
        ta.style.position = "absolute"; ta.style.left = "-9999px";
        document.body.appendChild(ta); ta.select();
        document.execCommand("copy"); ta.remove();
        resolve();
      } catch (e) { reject(e); }
    });
  }

  /* ===================================================================
     COPY-EMAIL BUTTON  (the "Copy email" button in the Contact section)
     =================================================================== */
  document.addEventListener("click", function (e) {
    const btn = e.target.closest("[data-copy-email]");
    if (!btn) return;
    const email = btn.getAttribute("data-copy-email");
    copyText(email).then(function () {
      showToast("Email address copied");
      const label = btn.querySelector("span");
      if (label && !btn.dataset.busy) {
        btn.dataset.busy = "1";
        const original = label.textContent;
        label.textContent = "Copied!";
        setTimeout(function () { label.textContent = original; delete btn.dataset.busy; }, 1400);
      }
    }).catch(function () { showToast(email); });
  });

  /* ===================================================================
     PROJECT TAG FILTERING
     =================================================================== */
  (function setupProjectFilters() {
    const bar = document.querySelector(".projects__filters");
    if (!bar) return;
    const cards = Array.prototype.slice.call(document.querySelectorAll(".project"));
    const buttons = Array.prototype.slice.call(bar.querySelectorAll(".filter-btn"));
    bar.addEventListener("click", function (e) {
      const btn = e.target.closest(".filter-btn");
      if (!btn) return;
      const filter = btn.getAttribute("data-filter");
      buttons.forEach(function (b) {
        const on = b === btn;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-pressed", String(on));
      });
      cards.forEach(function (card) {
        const tags = card.getAttribute("data-tags") || "";
        const show = filter === "*" || ("|" + tags + "|").indexOf("|" + filter + "|") > -1;
        card.hidden = !show;
        if (show && !reduceMotion) {
          card.classList.remove("filter-in");
          void card.offsetWidth;
          card.classList.add("filter-in");
        }
      });
    });
  })();

  /* ===================================================================
     CONTACT FORM  —  submit without leaving the page (progressive
     enhancement). If anything is off, the browser's normal POST still works.
     =================================================================== */
  (function setupContactForm() {
    const form = document.querySelector(".contact-form");
    if (!form) return;
    const action = form.getAttribute("action") || "";
    // Only take over once the form points at a real endpoint. While the
    // placeholder is still there, leave the browser's default behaviour alone.
    if (!/^https?:\/\//i.test(action) || /your-id/.test(action)) return;

    const status = form.querySelector(".contact-form__status");
    const submit = form.querySelector(".contact-form__submit");
    const submitLabel = submit ? submit.querySelector("span") : null;
    const honeypot = form.querySelector('[name="_gotcha"]');

    function setStatus(msg, kind) {
      if (!status) return;
      status.textContent = msg;
      status.hidden = !msg;
      status.className = "contact-form__status" + (kind ? " is-" + kind : "");
    }
    function showSuccess() {
      form.innerHTML =
        '<div class="contact-form__done" role="status">' +
          '<span class="contact-form__done-icon">' + icon("check") + "</span>" +
          "<p><strong>Thank you!</strong> Your message is on its way — I'll get back to you soon.</p>" +
        "</div>";
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (honeypot && honeypot.value) { showSuccess(); return; }   // silently drop bots
      if (form.checkValidity && !form.checkValidity()) { form.reportValidity(); return; }

      const original = submitLabel ? submitLabel.textContent : "";
      if (submit) submit.disabled = true;
      if (submitLabel) submitLabel.textContent = "Sending…";
      setStatus("", "");

      fetch(action, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } })
        .then(function (res) {
          if (res.ok) { showSuccess(); return; }
          return res.json().then(function (data) {
            const msg = data && data.errors && data.errors.length
              ? data.errors.map(function (x) { return x.message; }).join(", ")
              : "Something went wrong — please try again, or email me directly.";
            setStatus(msg, "error");
          });
        })
        .catch(function () {
          setStatus("Network error — please check your connection, or email me directly.", "error");
        })
        .then(function () {
          if (submit) submit.disabled = false;
          if (submitLabel) submitLabel.textContent = original;
        });
    });
  })();

  /* ===================================================================
     COMMAND PALETTE  (Ctrl/⌘ + K, "/", or the navbar search button)
     ---------------------------------------------------------------------
     A searchable overlay of quick actions — all built from config.js, so
     there's nothing extra to fill in. Jump to a section, flip the theme,
     change the accent colour, grab the CV, copy the email, open a social.
     =================================================================== */
  (function setupCommandPalette() {
    if (SITE.nav && SITE.nav.commandPalette === false) return;

    const actions = [];

    (SITE.sections || []).filter(function (s) { return s.show; }).forEach(function (s) {
      actions.push({ group: "Go to", label: s.nav, icon: "arrow-right", keywords: "section jump navigate " + s.id,
        run: function () { smoothScrollTo(s.id); } });
    });
    actions.push({ group: "Go to", label: "Top of page", icon: "arrow-up", keywords: "home hero start top",
      run: function () { window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }); } });

    actions.push({ group: "Theme", label: "Toggle light / dark mode", icon: "moon", keywords: "dark light night day theme mode contrast",
      run: function () {
        const t = document.getElementById("theme-toggle");
        if (t) { t.click(); return; }
        const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
        root.setAttribute("data-theme", next);
        try { localStorage.setItem("theme", next); } catch (e) {}
      } });
    PALETTES.forEach(function (p) {
      const name = p.charAt(0).toUpperCase() + p.slice(1);
      actions.push({ group: "Theme", label: "Accent colour · " + name, icon: "palette", keywords: "colour color accent palette " + p,
        run: function () { applyPalette(p); showToast("Accent colour: " + name); } });
    });
    const STYLE_LABELS = { soft: "Soft (rounded)", flat: "Flat (editorial)" };
    STYLES.forEach(function (s) {
      actions.push({ group: "Theme", label: "Layout style · " + (STYLE_LABELS[s] || s), icon: "palette",
        keywords: "layout style look view shape flat soft rounded editorial minimal " + s,
        run: function () { applyStyle(s); showToast("Layout style: " + (STYLE_LABELS[s] || s)); } });
    });

    if (SITE.hero && SITE.hero.cv && SITE.hero.cv.show && SITE.hero.cv.file) {
      actions.push({ group: "Actions", label: SITE.hero.cv.label || "Download CV", icon: "download", keywords: "cv resume download pdf curriculum",
        run: function () { const a = document.createElement("a"); a.href = SITE.hero.cv.file; a.download = ""; document.body.appendChild(a); a.click(); a.remove(); } });
    }
    const email = (SITE.contact && SITE.contact.email) || "";
    if (email) {
      actions.push({ group: "Actions", label: "Copy email address", icon: "copy", keywords: "copy email address contact " + email,
        run: function () { copyText(email).then(function () { showToast("Email address copied"); }).catch(function () { showToast(email); }); } });
      actions.push({ group: "Actions", label: "Send an email", icon: "mail", keywords: "email mail write message contact " + email,
        run: function () { window.location.href = "mailto:" + email; } });
    }
    (SITE.social || []).filter(function (s) { return s.url && /^https?:\/\//i.test(s.url); }).forEach(function (s) {
      actions.push({ group: "Links", label: "Open " + (s.label || s.icon), icon: s.icon, keywords: "social open link " + (s.label || "") + " " + s.icon,
        run: function () { window.open(s.url, "_blank", "noopener"); } });
    });

    const overlay = document.createElement("div");
    overlay.className = "cmdk";
    overlay.hidden = true;
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "Search and quick actions");
    overlay.innerHTML =
      '<div class="cmdk__panel">' +
        '<div class="cmdk__search">' + icon("search") +
          '<input class="cmdk__input" type="text" role="combobox" aria-expanded="true" aria-controls="cmdk-list" aria-autocomplete="list" placeholder="Search sections, theme, links…" autocomplete="off" spellcheck="false">' +
          '<kbd class="cmdk__esc">Esc</kbd>' +
        "</div>" +
        '<ul class="cmdk__list" id="cmdk-list" role="listbox" aria-label="Results"></ul>' +
        '<div class="cmdk__foot"><span><kbd>↑</kbd><kbd>↓</kbd> navigate</span><span><kbd>↵</kbd> select</span><span><kbd>esc</kbd> close</span></div>' +
      "</div>";
    document.body.appendChild(overlay);
    const input = overlay.querySelector(".cmdk__input");
    const list = overlay.querySelector(".cmdk__list");

    let filtered = [];
    let activeIndex = 0;
    let lastFocused = null;

    function render(q) {
      const query = (q || "").trim().toLowerCase();
      filtered = actions.filter(function (a) {
        return !query || (a.label + " " + (a.keywords || "") + " " + a.group).toLowerCase().indexOf(query) > -1;
      });
      activeIndex = 0;
      if (!filtered.length) {
        list.innerHTML = '<li class="cmdk__empty">No matches — try “about”, “dark”, or “email”.</li>';
        input.removeAttribute("aria-activedescendant");
        return;
      }
      let html = "", lastGroup = null;
      filtered.forEach(function (a, i) {
        if (a.group !== lastGroup) { html += '<li class="cmdk__group" role="presentation">' + esc(a.group) + "</li>"; lastGroup = a.group; }
        html += '<li class="cmdk__item" role="option" id="cmdk-opt-' + i + '" data-i="' + i + '">' +
          '<span class="cmdk__item-icon">' + icon(a.icon) + "</span>" +
          '<span class="cmdk__item-label">' + esc(a.label) + "</span></li>";
      });
      list.innerHTML = html;
      paintActive(true);
    }

    function paintActive(scroll) {
      const opts = list.querySelectorAll(".cmdk__item");
      opts.forEach(function (el) {
        const on = Number(el.getAttribute("data-i")) === activeIndex;
        el.classList.toggle("is-active", on);
        if (on) {
          el.setAttribute("aria-selected", "true");
          if (scroll) el.scrollIntoView({ block: "nearest" });
        } else {
          el.removeAttribute("aria-selected");
        }
      });
      input.setAttribute("aria-activedescendant", filtered.length ? "cmdk-opt-" + activeIndex : "");
    }

    function move(delta) {
      if (!filtered.length) return;
      activeIndex = (activeIndex + delta + filtered.length) % filtered.length;
      paintActive(true);
    }
    function runActive() {
      const a = filtered[activeIndex];
      if (!a) return;
      close();
      a.run();
    }
    function open() {
      if (!overlay.hidden) return;
      lastFocused = document.activeElement;
      overlay.hidden = false;
      document.body.style.overflow = "hidden";
      input.value = "";
      render("");
      requestAnimationFrame(function () { input.focus(); });
    }
    function close() {
      if (overlay.hidden) return;
      overlay.hidden = true;
      document.body.style.overflow = "";
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    }

    input.addEventListener("input", function () { render(input.value); });
    input.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") { e.preventDefault(); move(1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); move(-1); }
      else if (e.key === "Enter") { e.preventDefault(); runActive(); }
      else if (e.key === "Home") { e.preventDefault(); activeIndex = 0; paintActive(true); }
      else if (e.key === "End") { e.preventDefault(); activeIndex = Math.max(0, filtered.length - 1); paintActive(true); }
      else if (e.key === "Tab") { e.preventDefault(); }   // keep focus inside the modal (the input is the only control)
    });
    list.addEventListener("click", function (e) {
      const item = e.target.closest(".cmdk__item");
      if (!item) return;
      activeIndex = Number(item.getAttribute("data-i"));
      runActive();
    });
    list.addEventListener("mousemove", function (e) {
      const item = e.target.closest(".cmdk__item");
      if (!item) return;
      const i = Number(item.getAttribute("data-i"));
      if (i !== activeIndex) { activeIndex = i; paintActive(false); }
    });
    overlay.addEventListener("click", function (e) { if (e.target === overlay) close(); });

    function isTyping(el) {
      if (!el) return false;
      const tag = (el.tagName || "").toLowerCase();
      return tag === "input" || tag === "textarea" || tag === "select" || el.isContentEditable;
    }
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !overlay.hidden) { e.preventDefault(); close(); return; }
      if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        if (overlay.hidden) open(); else close();
        return;
      }
      if (e.key === "/" && overlay.hidden && !isTyping(e.target)) { e.preventDefault(); open(); }
    });
    const openBtn = document.getElementById("cmdk-open");
    if (openBtn) openBtn.addEventListener("click", open);
  })();
})();
