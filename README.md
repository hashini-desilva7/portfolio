# Hashini Vihanga — Portfolio

Personal portfolio website for **Hashini Vihanga**, BSc (Hons) Cyber Security undergraduate
(APIIT / Staffordshire University), specialising in digital forensics, penetration testing
and Linux security.

**Live:** <https://hashini-desilva7.github.io/portfolio/>

## Stack

No build step, no framework, no dependencies — plain static files, ~50 KB total.

| File | Purpose |
| --- | --- |
| `index.html` | Single page: profiles, about, arsenal, case work, repos, CTF, education, contact |
| `css/styles.css` | All styling. Themes are CSS custom properties switched by `[data-theme]` |
| `js/main.js` | Matrix canvas, typewriter, HUD clock, scroll progress, theme, nav, reveal |
| `js/github.js` | Live GitHub API fetch, repo filter tabs, offline snapshot fallback |
| `assets/img/` | Project cover art (SVG), profile avatars |
| `assets/cv.pdf` | CV linked from the "Download CV" buttons |

## Local preview

```bash
python -m http.server 8000
# open http://localhost:8000
```

`file://` also works, though the GitHub API call will be blocked by CORS from an
`opaque origin` — the baked-in snapshot renders instead.

## Deploying

Pages publishes from `main`/root, so pushing is the whole deploy:

```bash
git add .
git commit -m "Update portfolio"
git push
```

To use a **custom domain**, add a `CNAME` file containing just the domain to the repo
root and point the domain's DNS at GitHub's Pages IPs.

## How the live repo data works

`js/github.js` fetches `api.github.com/users/hashini-desilva7` and
`.../repos` on load — **no token, no build step, no rate-limit problem for normal
traffic**. Repos are then bucketed by category and rendered with language colours,
star/fork counts and relative update times.

If the fetch fails (offline, rate-limited, blocked), it falls back to
`SNAPSHOT_REPOS` — a copy of the real API response taken on **2026-09-27** — and
labels the panel `offline — cached snapshot` so the state is never misrepresented.
GitHub's own `hashini-desilva7` profile repo is filtered out.

## Theming

Dark terminal theme is the default; light "paper" theme is available from the header
toggle and the choice persists in `localStorage` under `hv-theme`. The CV's
`#0B4F6C` navy still anchors the palette, pushed toward neon green/cyan for contrast.

Both themes were verified against **WCAG AA** (4.5:1 body, 3:1 large text) across
headings, body, muted, accent, mono and status-pill text.

## Accessibility & performance

- Semantic landmarks, skip link, visible focus rings, `aria-pressed` / `aria-expanded`
- `prefers-reduced-motion` disables the matrix canvas, typewriter, glitch and all animation
- Matrix canvas throttled to ~18 fps, paused on tab blur and when the hero scrolls away
- Scan-progress bar is `rAF`-throttled; listeners are `passive`
- `color-scheme` and `theme-color` set per theme
- Print stylesheet renders a clean CV (header, canvas and nav stripped)

## Known gap

`assets/cv.pdf` is referenced by the download buttons but not yet committed, so those
buttons 404. Compile the LaTeX CV to PDF and drop it at `assets/cv.pdf`.
