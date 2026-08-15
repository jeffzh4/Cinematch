# CineMatch — Case Study

**Jeffrey Zhang · 2026**

---

## Problem

Streaming catalogs have solved supply, not decision-making. The interface pattern across major platforms — infinite grids, engagement-optimized ranking, algorithmic rows — increases browsing time without improving match quality. The cost of choosing frequently exceeds the cost of watching.

CineMatch's product bet: replace browsing with a single structured decision. Three inputs (mood, genre, occasion) in, six ranked recommendations with individual rationale out. No infinite scroll, no ranking games — a direct answer.

---

## Key Decisions

### Serverless over a traditional backend

The product has no persistent user data and no auth requirement — every session is stateless by design. A traditional backend (database, ORM, auth middleware) would have added operational surface with no corresponding product benefit. Vercel serverless functions cover the actual requirement — proxy two external APIs, keep credentials server-side — at effectively zero infrastructure cost and zero maintenance burden.

**Trade-off accepted:** no persistent user history across sessions. Given the target use case (a single, in-the-moment recommendation request), this was judged acceptable rather than a gap to solve for.

### LLM-generated recommendations over a rules engine

An earlier approach — genre × mood mapped to a static candidate list — produced results that were technically relevant but qualitatively flat. "A rainy Sunday alone" is not reducible to a genre filter; it's a request for a specific *feeling*, which a lookup table cannot represent.

Claude is used to generate both the selection and the per-film rationale in a single pass, prompted explicitly to act as a curator rather than a search function — avoiding spoilers, avoiding generic recommendation-copy clichés, and varying era/geography rather than defaulting to the most obvious match. This produces output that reads as considered rather than templated, which is the actual product differentiator.

### Prompt caching

The system prompt (~450 tokens) is static across all requests. Anthropic's prompt caching means the first request in a caching window pays full input cost; every subsequent request within that window pays roughly 10% of it. At any meaningful request volume — or simply during a multi-query demo session — this is a direct, compounding cost reduction with no product-facing trade-off.

### TypeScript on the API layer only

The four serverless functions (`recommend`, `poster`, `analytics`, `share`) are TypeScript with explicit interfaces for all request/response shapes. This is the boundary where a schema mismatch — malformed LLM output, an unexpected TMDB response — would otherwise surface as a silent runtime failure. Typing this layer catches that class of bug before it reaches the client. The client itself remains plain JS; a full-stack TypeScript conversion was evaluated and rejected as effort without proportional return, given the client has no complex state to model.

### Vercel KV for analytics and share links

Two features required lightweight persistence without justifying a database: anonymized usage logging (mood/genre/occasion frequency, feeding the analytics dashboard) and shareable result links (30-day TTL, no auth). Vercel KV — Redis-compatible, free at this scale — covers both with key-value operations only (`LPUSH`/`LRANGE` for logs, `SET`/`GET` with TTL for shares). No ORM, no schema, no migration path to maintain.

---

## What I'd Revisit for a V2

**Define the data model before the features, not during.** The `localStorage`-first approach was correct for the MVP but created retrofit cost when share links and analytics were added later — the shape of what gets persisted evolved ad hoc rather than being specified up front. A typed schema defined before the first feature that needed persistence would have made the second and third features cheaper to add, not just the first.

**Add schema validation at the LLM boundary.** The current implementation checks response shape manually (`Array.isArray(...)`, length checks). A validation library (Zod or equivalent) would express the expected schema declaratively, fail with a clearer error when Claude returns an edge case, and reduce the manual-check surface as the schema grows.

**Move share-link previews server-side.** Share links currently carry static Open Graph tags — accurate at the brand level, generic at the individual-link level. A Vercel Edge Function intercepting `/share?id=` and injecting the actual headline and film list into response-level meta tags would produce accurate rich previews on social platforms. Scoped as a v2 item: real product value, non-trivial to get right (edge runtime constraints, cache invalidation), and not blocking for the core product loop.
