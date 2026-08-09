# Graph Report - CineMatch  (2026-08-09)

## Corpus Check
- 10 files · ~17,128 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 68 nodes · 94 edges · 10 communities (9 shown, 1 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c2748d1d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_CineMatch — CLAUDE|CineMatch — CLAUDE.md]]
- [[_COMMUNITY_CineMatch|CineMatch]]
- [[_COMMUNITY_Technical Decisions|Technical Decisions]]
- [[_COMMUNITY_analytics.ts|analytics.ts]]
- [[_COMMUNITY_CineMatch — Case Study|CineMatch — Case Study]]
- [[_COMMUNITY_poster.ts|poster.ts]]
- [[_COMMUNITY_recommend.ts|recommend.ts]]
- [[_COMMUNITY_share.ts|share.ts]]
- [[_COMMUNITY_vercel.json|vercel.json]]
- [[_COMMUNITY_devDependencies|devDependencies]]

## God Nodes (most connected - your core abstractions)
1. `rateLimit()` - 10 edges
2. `applySecurityHeaders()` - 9 edges
3. `boundedString()` - 9 edges
4. `CineMatch — CLAUDE.md` - 8 edges
5. `CineMatch` - 8 edges
6. `Technical Decisions` - 7 edges
7. `handler()` - 6 edges
8. `boundedStringArray()` - 5 edges
9. `handler()` - 5 edges
10. `handler()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `handler()` --calls--> `applySecurityHeaders()`  [EXTRACTED]
  api/analytics.ts → api/_security.ts
- `handler()` --calls--> `applySecurityHeaders()`  [EXTRACTED]
  api/poster.ts → api/_security.ts
- `handler()` --calls--> `applySecurityHeaders()`  [EXTRACTED]
  api/recommend.ts → api/_security.ts
- `handler()` --calls--> `rateLimit()`  [EXTRACTED]
  api/analytics.ts → api/_security.ts
- `handler()` --calls--> `rateLimit()`  [EXTRACTED]
  api/poster.ts → api/_security.ts

## Import Cycles
- None detected.

## Communities (10 total, 1 thin omitted)

### Community 0 - "CineMatch — CLAUDE.md"
Cohesion: 0.17
Nodes (11): API architecture, Architecture, CineMatch — CLAUDE.md, Claude Prompt Strategy, Current State — Fully Shipped, Data flow, Design System, Environment variables required (+3 more)

### Community 1 - "CineMatch"
Cohesion: 0.18
Nodes (11): Architecture, CineMatch, Deploying to Vercel, Environment variables, How it works, Local development, Local development, Pages (+3 more)

### Community 2 - "Technical Decisions"
Cohesion: 0.17
Nodes (10): CineMatch — Case Study, Technical Decisions, The Problem, TypeScript for the API layer, Vercel KV for analytics and sharing, What I'd Do Differently, Why Claude for recommendations?, Why prompt caching? (+2 more)

### Community 3 - "analytics.ts"
Cohesion: 0.50
Nodes (4): AnalyticsEntry, handler(), kvPipeline(), KVResult

### Community 4 - "CineMatch — Case Study"
Cohesion: 0.67
Nodes (3): buckets, clientKey(), rateLimit()

### Community 5 - "poster.ts"
Cohesion: 0.50
Nodes (4): handler(), TMDBMovie, TMDBSearchResponse, boundedString()

### Community 6 - "recommend.ts"
Cohesion: 0.50
Nodes (4): Film, handler(), RecommendationResult, boundedStringArray()

### Community 7 - "share.ts"
Cohesion: 0.60
Nodes (4): applySecurityHeaders(), handler(), kvPipeline(), KVResult

### Community 8 - "vercel.json"
Cohesion: 0.33
Nodes (5): cleanUrls, headers, redirects, $schema, trailingSlash

## Knowledge Gaps
- **39 isolated node(s):** `buckets`, `AnalyticsEntry`, `KVResult`, `TMDBMovie`, `TMDBSearchResponse` (+34 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `CineMatch` connect `CineMatch` to `Technical Decisions`?**
  _High betweenness centrality (0.073) - this node is a cross-community bridge._
- **What connects `buckets`, `AnalyticsEntry`, `KVResult` to the rest of the system?**
  _39 weakly-connected nodes found - possible documentation gaps or missing edges._