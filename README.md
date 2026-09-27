# Hashini Vihanga — Portfolio

Personal portfolio website for **Hashini Vihanga**, BSc (Hons) Cyber Security undergraduate
(APIIT / Staffordshire University), specialising in digital forensics, penetration testing
and Linux security.

## Live site

`https://hashini-desilva7.github.io/` (after GitHub Pages is enabled)

## Stack

No build step, no framework, no dependencies — plain static files.

| File | Purpose |
| --- | --- |
| `index.html` | Single page: about, skills, work, education, achievements, contact |
| `css/styles.css` | All styling; light/dark theme via CSS custom properties on `[data-theme]` |
| `js/main.js` | Theme toggle, mobile nav, scroll reveal, stat counters, active-nav spy |
| `assets/favicon.svg` | Favicon |
| `assets/cv.pdf` | CV linked from the "Download CV" button |

## Local preview

```bash
# any static server works — Pages serves the same way
python -m http.server 8000
# then open http://localhost:8000
```

Opening `index.html` directly via `file://` also works; the page has no module imports.

## Deploying

Push to the `main` branch — GitHub Pages publishes from `/ (root)`, so no `docs/` move is needed.

```bash
git add .
git commit -m "Update portfolio"
git push
```

Pages serves over HTTPS automatically. To use a **custom domain**, add a `CNAME` file
containing just the domain (e.g. `hashini.dev`) to the repo root and point the domain's DNS
at GitHub's Pages IPs.

## Theming

Accent colour is `#0B4F6C` (teal-navy), matching the CV. Dark mode is enabled by default
if the visitor's OS prefers it; their choice is stored in `localStorage` under `hv-theme`.

## Accessibility & performance notes

- Semantic landmarks (`header`/`main`/`section`/`footer`), skip link, visible focus rings
- `prefers-reduced-motion` disables all animation
- System font fallback stack; no render-blocking JS (`defer`)
- Single paint, no web fonts required to render legibly
