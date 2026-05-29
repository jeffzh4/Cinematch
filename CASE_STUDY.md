# CineMatch — Case Study

**Built by Jeffrey Zhang · 2026**

---

## The Problem

Finding the right film to watch on any given night is paradoxically hard. Streaming platforms surface thousands of options, but the discovery UI is optimised for engagement, not taste — infinite thumbnails, algorithmic bubbles, the slow drift toward whatever's loudest on the homepage. The mental overhead of choosing exceeds the commitment of watching.

CineMatch is an attempt to strip that back to a single, direct question: tell me what you're in the mood for, and I'll tell you what to watch. Three inputs (mood, genre, occasion) produce six picks with spoiler-free explanations written in a voice that reads like a recommendation from a friend who actually cares about cinema — not a ranked list from a database.

---

## Technical Decisions

### Why serverless?

CineMatch has no database, no user accounts, and no stateful server requirements. All persistence lives either in the user's browser (`localStorage`) or ephemerally in the API response. Vercel serverless functions fit perfectly: zero maintenance overhead, instant global scaling, pay-per-request pricing. The `api/recommend` and `api/poster` functions act purely as secure proxies, keeping API keys off the client without requiring a full backend or Docker setup.

The dual-path architecture — direct browser calls in local dev, proxied through serverless in production — meant the app could be developed and tested locally with no infrastructure, then deployed to production with a single `git push`.

### Why Claude for recommendations?

Early explorations using rule-based filtering (genre × mood → precomputed list) produced results that felt mechanical. What makes a film feel right for a "rainy Sunday alone" isn't reducible to genre tags or star ratings. Claude's language understanding maps the semantic texture of a mood description to the affective quality of a film in a way lookup tables can't. The system prompt is engineered to elicit editorial voice over algorithmic hedging — asking for "a film curator, not a search engine."

The prompt also deliberately avoids spoilers, bans listicle clichés ("must-watch", "hidden gem"), and asks for geographic and decade variety. This produces recommendations that feel genuinely considered rather than generated.

### Why prompt caching?

The system prompt is ~450 tokens and identical for every request. Anthropic's prompt caching (via `cache_control: { type: 'ephemeral' }`) means the first request in a 5-minute window primes the cache; every subsequent request pays roughly 10% of those input tokens. At scale — or during a demo where multiple queries are made in quick succession — this compounds into meaningful cost reduction and marginally faster response times.

### Why TMDB for posters?

TMDB provides high-quality artwork free for non-commercial use and has near-complete coverage for any film Claude might recommend — arthouse, foreign, contemporary, classic. The poster fetches happen asynchronously after the film cards render, with a graceful gradient placeholder while loading. This keeps the perceived performance high even when TMDB is slow.

### TypeScript for the API layer

The serverless functions (`api/recommend.ts`, `api/poster.ts`, `api/analytics.ts`, `api/share.ts`) are written in TypeScript with strict interface definitions for all inputs and outputs. Vercel compiles them automatically — no `tsc` step, no `tsconfig.json` needed. The type safety catches shape mismatches at the boundary between Claude's JSON response and the client renderer before they surface as runtime errors.

### Vercel KV for analytics and sharing

Two features use Vercel KV (Redis-compatible, free tier):

- **Analytics** — each recommendation is logged anonymously (mood, genres, occasion, optional filters, timestamp). The `/analytics` dashboard aggregates these into genre breakdowns, mood trends, and occasion patterns.
- **Share links** — results are persisted with a 30-day TTL and a short ID. The `/share?id=xxx` page fetches and renders the stored list, making it shareable on LinkedIn or Twitter without any login or account requirement.

---

## What I'd Do Differently

**Design the data model upfront.** The `localStorage`-first approach works well for single-device use but created friction when adding sharing and history. The schema for what gets persisted (film objects, headlines, user inputs) evolved organically rather than being defined early. Starting with a typed schema and building localStorage/KV around it would have made the analytics and share features much cleaner to retrofit.

**Add runtime validation on the API response.** The current implementation does manual shape-checking (`if (!parsed.films || !Array.isArray(...))`). A library like Zod would express the expected schema declaratively, validate it in one line, and give cleaner error messages when Claude returns something unexpected — which happens occasionally on ambiguous inputs.

**Consider edge functions for dynamic OG images.** Share links currently have static OG meta tags (brand-level). A Vercel Edge Function could intercept `/share?id=xxx` requests and inject the actual headline and film list into the `<meta>` tags server-side, producing rich previews when the link is shared on social media. This would be a high-polish finishing touch for a public-facing product.
