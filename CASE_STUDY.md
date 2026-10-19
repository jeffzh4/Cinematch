# CineMatch — Case Study

**Jeffrey Zhang · 2026**

---

## Problem

I built CineMatch around a familiar problem: opening a streaming app with a film in mind, then spending the evening browsing. Large catalogs offer plenty of choice but do little to narrow it to a film that fits a particular mood.

The app asks for mood, genre, and occasion, then returns six recommendations with a reason for each. Runtime, decade, and streaming service are optional filters.

---

## Key Decisions

### Serverless over a traditional backend

There are no user accounts. The browser keeps favorites and the current recommendation in local storage. Vercel functions call Anthropic and TMDB while keeping their API keys on the server. Vercel KV stores analytics entries and share links, so a database and account system were not needed for this version.

The trade-off is that favorites stay on one browser. Analytics also stores submitted mood and occasion text with a timestamp, without account details. Share links expire after 30 days.

### LLM-generated recommendations over a rules engine

I tried mapping mood and genre to a fixed list. It returned relevant titles, but missed the difference between requests like “a rainy Sunday alone” and “something tense for a group.”

Claude generates the film list and explanations in one request. The prompt asks for spoiler-free reasons and allows the model to consider era and country alongside the user's answers. Recommendations can still be inaccurate; the app does not verify every title or streaming-service listing.

### Prompt caching

The system prompt is the same for every request, so the API marks it for Anthropic prompt caching. This can lower repeat input-token costs during the cache window. It does not change what the user sees.

### TypeScript on the API layer only

The API functions use TypeScript. Recommendation output is checked with Zod before it reaches the browser. The static pages use plain JavaScript; keeping the client framework-free made sense for this small set of pages.

### Vercel KV for analytics and share links

KV stores recommendation inputs for the analytics dashboard and result sets for share links. These are separate records: analytics uses a list; share links use keys with a 30-day expiry. The dashboard is public, so its recent mood and occasion examples should be treated as public text.

---

## What I'd Improve Next

**Add sign-in and sync only if people need cross-device favorites.** Favorites currently live in one browser. Sync would need accounts and a clear data-retention policy, neither of which this version has.

**Use shared schemas for every API payload.** Recommendation output already uses Zod. Share input still uses manual field checks; a schema there would make accepted values and limits easier to review.

**Replace per-instance rate limits if traffic grows.** Current limits live in process memory, so separate serverless instances do not share counts. A shared limiter would apply one quota across instances and deployments.
