# CineMatch — CLAUDE.md

## Project Overview
CineMatch is a personalized movie recommendation web app. Users answer three questions (mood, genre, occasion) and receive 6 tailored film picks with spoiler-free explanations powered by Claude's API.

**Deadline:** May 29th, 2026  
**Deliverable:** Functional, locally-runnable web app with clean UI, 5–7 recommendations per query, and a per-film explanation of why each was chosen.

---

## Current State
Three static HTML pages — no backend, no API calls, everything hardcoded.

| File | Purpose | Status |
|---|---|---|
| `index.html` | Landing page | Complete |
| `form.html` | 3-question input form | Complete (UI only) |
| `results.html` | Film results page | Complete (hardcoded data) |

**What's wired up:** chip toggle, progress counter ("X of 3 answered"), scroll-triggered film animations, page navigation.  
**What's not wired up:** form data is not passed to results; results are static; no Claude API call exists yet.

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

## Architecture Plan (Next Steps)

### Step 1 — Wire the form to the results page
Pass form inputs via `localStorage` or URL params so `results.html` can read mood, genres, and occasion. The form submit handler in `form.html` currently just redirects to `results.html` — it should serialize and store inputs first.

### Step 2 — Add a backend
A minimal Node.js/Express (or Python/Flask) server to:
- Accept the form inputs as a POST request
- Call Claude's API with a carefully engineered prompt
- Return structured JSON (array of 6 film objects)

Alternatively, this can be done client-side with the Claude API directly via `fetch` (simpler, no server needed for local use — just keep the API key out of public repos).

### Step 3 — Claude API integration
Build the prompt to accept: `mood`, `genres[]`, `occasion` and return 6 films each with:
- `title`, `director`, `year`, `runtime`, `genre`, `rating`
- `reason` — 2–3 sentence spoiler-free explanation tailored to the user's input

Use `claude-sonnet-4-6` or `claude-haiku-4-5` (faster/cheaper for iteration). Apply prompt caching on the system prompt since it's static and sent with every request.

### Step 4 — Replace hardcoded results with dynamic data
`results.html` should render from the API response rather than static HTML. Either:
- Generate the film cards via JS from a JSON response, or
- Use a templating approach (server-side render)

The zigzag layout (`.film` / `.film.flip` alternation) and all existing CSS classes should be preserved — just generate the HTML dynamically.

### Step 5 — Milestone 3 features (after core works)
- Additional filters: runtime (short / standard / long), decade, streaming platform
- These can be added as optional chip groups on `form.html` (question 04, 05)
- Pass them as optional context in the Claude prompt

---

## Claude Prompt Strategy
The system prompt should instruct Claude to:
- Act as a film curator, not a search engine
- Return exactly 6 films in a consistent JSON schema
- Write reasons in 2–3 sentences, in a voice that matches the editorial tone of the UI (literary, not listicle)
- Never spoil plot twists, endings, or reveals
- Weight toward lesser-known films when mood/occasion allow (avoid always picking the most obvious choice)

Example schema per film:
```json
{
  "num": 1,
  "title": "Lost in Translation",
  "director": "Sofia Coppola",
  "year": 2003,
  "runtime": 102,
  "genre": "Drama",
  "rating": 4.2,
  "reason": "..."
}
```

---

## Data Sources (Milestone 2)
- **MovieLens 100K** — ratings, metadata; good for grounding recommendations in real data
- **IMDB open dataset** — runtimes, genres, director names
- These can be used to validate/enrich Claude's output (check that suggested films exist and have correct metadata), or fed into the prompt as context

---

## What NOT to change
- The three-page HTML structure (`index` → `form` → `results`)
- The visual design system (colors, fonts, grain, animations)
- The editorial copy voice ("For a slow night that asks nothing of you")
- The zigzag layout pattern on results
- The brutalist header + bottom-bar pattern shared across all pages
