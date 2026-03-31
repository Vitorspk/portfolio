# Vitor Schiavo — Portfolio

Personal portfolio of **Vitor Schiavo**, Site Reliability Engineer & Platform Engineering Expert with 13+ years of experience across GCP, AWS, and Azure.

**Live:** https://vitorspk.github.io/portfolio/

---

## Stack

| Layer | Technology |
|-------|-----------|
| Markup | Semantic HTML5 |
| Styles | Vanilla CSS (custom properties design system) |
| Behaviour | Vanilla JavaScript (ES2020+) |
| Fonts | Inter via Google Fonts |
| Hosting | GitHub Pages |
| CI/CD | GitHub Actions |

No frameworks, no build step, no bundler. Everything runs directly in the browser.

---

## Project structure

```
portfolio/
├── index.html          # Single-page app — all content sections
├── styles.css          # Design system + layout + components
├── script.js           # Tab navigation, accessibility, animations
├── 404.html            # Custom error page (auto-served by GitHub Pages)
├── README.md           # This file
├── CLAUDE.md           # AI assistant instructions
├── LICENSE             # MIT license
├── VALIDATION.md       # Local linting setup guide
├── package.json        # Dev dependencies (linters only)
├── package-lock.json
├── .eslintrc.json      # ESLint config
├── .stylelintrc.json   # Stylelint config
├── .htmlvalidate.json  # HTML Validate config
└── .github/
    └── workflows/
        ├── validate-pr.yml         # HTML/CSS/JS linting on PRs
        ├── claude-code-review.yml  # AI code review on PRs
        └── claude.yml              # @claude mentions in issues/PRs
```

---

## Sections (tabs)

| Tab ID | Label | Content |
|--------|-------|---------|
| `overview` | Overview | Intro, metrics, quick-links |
| `cases` | Case Studies | Deep-dive case studies (FinOps, mTLS, HA VPN) |
| `experience` | Experience | Work history timeline |
| `aiml` | AI & ML | AI/ML operations work |
| `finops` | FinOps | Cloud cost optimisation and FinOps practice |
| `technical` | Technical | Technical deep-dives and architecture |
| `achievements` | Achievements | Key wins, certifications, metrics |
| `skills` | Skills | Technical skills with proficiency bars |

---

## Design system

CSS is built around a set of custom properties defined in `:root` inside `styles.css`. Key tokens:

```css
/* Surfaces (dark-first, layered depth) */
--bg-base        /* #0a0f1e — page background */
--bg-surface     /* #0f172a — sidebar */
--bg-elevated    /* #1e293b — cards */
--bg-card        /* #162032 — inner card surfaces */

/* Brand */
--primary        /* #3b82f6 — blue accent */
--secondary      /* #8b5cf6 — purple accent */
--accent         /* #06b6d4 — cyan accent */

/* Typography */
--text-primary   /* #f1f5f9 */
--text-secondary /* #94a3b8 */
--text-muted     /* #64748b */
```

**Do not** hardcode these values outside of `styles.css`. `404.html` imports `styles.css` specifically to reuse them.

---

## Accessibility

This project targets full **WAI-ARIA tab pattern** compliance:

- `role="tablist"` on both nav containers
- `role="tab"` + `aria-selected` + `aria-controls` on each button
- `role="tabpanel"` + `aria-labelledby` + `tabindex="-1"` on each section
- Roving `tabindex` (active tab = `0`, inactive = `-1`)
- `Arrow` / `Home` / `End` keyboard navigation within tablists
- `inert` + `aria-hidden` on the off-screen tablist (mobile vs desktop)
- Dynamic `aria-labelledby` updated by `syncTablists()` to always reference the visible nav
- Skip link as first focusable element in `<body>`
- `prefers-reduced-motion` respected in CSS and JS
- All decorative elements marked `aria-hidden="true"`

---

## JavaScript architecture

`script.js` is structured around a single `DOMContentLoaded` listener. Key patterns:

- **`tabNames`** — derived from `[role="tabpanel"]` IDs in the DOM (HTML is the single source of truth)
- **`activeTab`** — module-level tracker; avoids reading stale `location.hash` in keyboard nav
- **Delegated click handler** — listens on `document` for `[data-tab]` attributes
- **`syncTablists()`** — `matchMedia` listener; keeps `inert`/`aria-hidden` in sync across breakpoints
- **`IntersectionObserver`** — animates `.bar-fill` metric bars with double-rAF trick
- **`debounce()`** — scroll-to-top button visibility (80ms)
- **rAF throttle** — reading progress bar (smooth paint-locked updates)
- All scroll listeners use `{ passive: true }`

Adding a new tab requires only adding a `[role="tabpanel"]` to `index.html` — the script picks it up automatically.

---

## Local development

```bash
npm install        # Install linters
npm run validate   # Run all linters (HTML + CSS + JS)
npm run lint:fix   # Auto-fix CSS and JS issues
```

No dev server is needed — open `index.html` directly in a browser, or use any static file server:

```bash
npx serve .        # http://localhost:3000
python3 -m http.server 8080
```

---

## Branch strategy

```
master          ← production (GitHub Pages auto-deploys on push)
feat/<name>     ← new features
fix/<name>      ← bug fixes
chore/<name>    ← tooling, CI, non-functional changes
docs/<name>     ← documentation only
```

**Never commit directly to `master`.** Always open a PR — the Claude Code Review action will run automatically.

---

## CI/CD

| Workflow | Trigger | What it does |
|----------|---------|--------------|
| `validate-pr.yml` | PR opened/updated | Lints HTML, CSS, JS; checks file sizes and security; posts a summary comment |
| `claude-code-review.yml` | PR opened/updated | AI code review via Claude Code Action; posts detailed feedback as a PR comment |
| `claude.yml` | `@claude` mention in issue/PR comment | Runs Claude Code on demand |
| GitHub Pages | Push to `master` | Auto-deploys to `vitorspk.github.io/portfolio/` (~1 min propagation) |

---

## Performance notes

- All scroll listeners are `{ passive: true }`
- Reading progress bar uses `requestAnimationFrame` throttling
- Metric bars use `IntersectionObserver` — only animate when in viewport
- Fonts loaded with `display=swap` on the Google Fonts URL (`font-display: swap`) — no render-blocking text
- All CSS transitions use explicit property lists, not `transition: all`
- `inert` attribute removes off-screen nav from accessibility tree (better than `display:none` hacks)

---

## 404 page

`404.html` is automatically served by GitHub Pages for any unmatched URL. It:

- Matches the portfolio's dark design system (imports `styles.css`)
- Shows the requested path dynamically via `location.pathname + location.search`
- Provides a "Go home" button and a smart "Go back" button (checks `history.length` before calling `history.back()`)
- Is excluded from search engines via `<meta name="robots" content="noindex">`
- Has a `data:,` favicon to suppress the browser's automatic `/favicon.ico` request

---

## License

MIT
