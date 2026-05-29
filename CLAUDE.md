# CineMatch — CLAUDE.md

## Project Overview
CineMatch is a personalized movie recommendation web app. Users answer up to six questions (three required, three optional filters) and receive 6 tailored film picks with spoiler-free explanations powered by Claude's API.

**Deadline:** May 29th, 2026 (delivered)
**Live URL:** https://cinematch-navy.vercel.app
**GitHub:** https://github.com/jeffzh4/Cinematch

---

## Current State — Fully Shipped

All pages are live, API-connected, and deployed on Vercel.

| File | Purpose | Status |
|---|---|---|
| `index.html` | Landing page | ✅ Complete |
| `form.html` | Six-question form (3 required + 3 optional filters) | ✅ Complete |
| `loading.html` | Calls recommendation API, logs analytics | ✅ Complete |
| `results.html` | Dynamic film cards + TMDB posters + share button | ✅ Complete |
| `share.html` | Shared results card (read-only, `?id=xxx`) | ✅ Complete |
| `analytics.html` | Usage dashboard via Vercel KV | ✅ Complete |
| `error.html` | Error fallback ("Erm.") | ✅ Complete |
| `404.html` | Custom 404 ("Wrong reel.") | ✅ Complete |
| `about.html` | Project description | ✅ Complete |
| `contact.html` | Email + LinkedIn | ✅ Complete |

**Serverless functions (TypeScript):**

| File | Purpose |
|---|---|
| `api/recommend.ts` | Proxies Anthropic API with prompt caching |
| `api/poster.ts` | Proxies TMDB poster search |
| `api/analytics.ts` | Logs to / reads from Vercel KV |
| `api/share.ts` | Stores / retrieves shareable result sets (30-day TTL) |

---

## Design System
Preserve this across all changes — the aesthetic is intentional and polished.

- **Background:** `#0c0c0c`
- **Ink:** `#f5f5f0` / muted `#a8a8a3` / faint `#5a5a58`
- **Accent:** `#a78bff` (purple) / deep `#6b48d6`
- **Fonts:** Fraunces (serif, display) + JetBrains Mono (labels, metadata)
- **Motion:** `cubic-bezier(.2, .7, .2, 1)`, film grain overlay fixed at z-index 100
- **Layout:** max-width 1200px, CSS grid, responsive breakpoints at 720px and 480px

---

## Architecture

### Data flow
```
form.html → localStorage → loading.html → /api/recommend → Anthropic API
                                        ↓
                                  /api/analytics → Vercel KV
                                        ↓
                              results.html → /api/poster → TMDB
                                        ↓
                              [Share] → /api/share → Vercel KV
                                                      ↓
                                              share.html?id=xxx
```

### Dual-path architecture
- **Local dev (Option A):** `config.local.js` present → calls Anthropic + TMDB directly from browser
- **Production (Option B):** no `config.local.js` → calls Vercel serverless proxies

### Environment variables required
- `ANTHROPIC_API_KEY` — Anthropic API key
- `TMDB_API_KEY` — TMDB v3 API key
- `ANTHROPIC_MODEL` _(optional)_ — defaults to `claude-sonnet-4-6`
- `KV_REST_API_URL` — auto-added by Vercel KV
- `KV_REST_API_TOKEN` — auto-added by Vercel KV

---

## Form Inputs & localStorage Keys

| Key | Type | Description |
|---|---|---|
| `cm_mood` | string | Free-text mood (required) |
| `cm_genres` | JSON array | Selected genre chips (required) |
| `cm_occasion` | string | Free-text occasion (required) |
| `cm_runtime` | string | `"short"` / `"standard"` / `"long"` (optional) |
| `cm_decade` | string | e.g. `"1980s"`, `"recent"` (optional) |
| `cm_platforms` | JSON array | e.g. `["Netflix","Max"]` (optional) |
| `cm_results` | JSON object | Full Claude response `{ headline, films[] }` |
| `cm_refine` | `"1"` | Single-use flag — pre-populates form on "Refine your mood" |

---

## Claude Prompt Strategy
The system prompt instructs Claude to:
- Act as a film curator, not a search engine
- Return exactly 6 films in a consistent JSON schema
- Write reasons in 2–3 sentences, in a voice matching the editorial tone of the UI (literary, not listicle)
- Never spoil plot twists, endings, or reveals
- Weight toward lesser-known films when mood/occasion allow
- Honour optional runtime/decade/platform preferences as soft constraints

Prompt caching is applied via `cache_control: { type: 'ephemeral' }` on the system prompt, reducing cost by ~90% after the first request in a 5-minute window.

---

## What NOT to Change
- The overall page flow (`index` → `form` → `loading` → `results`)
- The visual design system (colors, fonts, grain, animations)
- The editorial copy voice ("For a slow night that asks nothing of you")
- The zigzag layout pattern on results
- The brutalist header + bottom-bar pattern shared across all pages
- `config.local.js` must stay gitignored — never commit API keys
