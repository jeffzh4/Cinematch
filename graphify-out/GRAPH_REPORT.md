# Graph Report - CineMatch  (2026-08-06)

## Corpus Check
- 9 files · ~13,785 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 59 nodes · 53 edges · 10 communities (7 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0758f733`
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
1. `CineMatch — CLAUDE.md` - 8 edges
2. `CineMatch` - 8 edges
3. `Technical Decisions` - 7 edges
4. `CineMatch — Case Study` - 4 edges
5. `Architecture` - 4 edges
6. `Local development` - 3 edges
7. `kvPipeline()` - 2 edges
8. `handler()` - 2 edges
9. `kvPipeline()` - 2 edges
10. `handler()` - 2 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Import Cycles
- None detected.

## Communities (10 total, 3 thin omitted)

### Community 0 - "CineMatch — CLAUDE.md"
Cohesion: 0.17
Nodes (11): Architecture, CineMatch — CLAUDE.md, Claude Prompt Strategy, Current State — Fully Shipped, Data flow, Design System, Dual-path architecture, Environment variables required (+3 more)

### Community 1 - "CineMatch"
Cohesion: 0.18
Nodes (11): Architecture, CineMatch, Deploying to Vercel, How it works, Local development, Option A — Simple (direct API calls from browser), Option B — With serverless functions (matches production), Pages (+3 more)

### Community 2 - "Technical Decisions"
Cohesion: 0.29
Nodes (7): Technical Decisions, TypeScript for the API layer, Vercel KV for analytics and sharing, Why Claude for recommendations?, Why prompt caching?, Why serverless?, Why TMDB for posters?

### Community 3 - "analytics.ts"
Cohesion: 0.50
Nodes (4): AnalyticsEntry, handler(), kvPipeline(), KVResult

### Community 4 - "CineMatch — Case Study"
Cohesion: 0.40
Nodes (3): CineMatch — Case Study, The Problem, What I'd Do Differently

### Community 7 - "share.ts"
Cohesion: 0.67
Nodes (3): handler(), kvPipeline(), KVResult

### Community 8 - "vercel.json"
Cohesion: 0.50
Nodes (3): cleanUrls, $schema, trailingSlash

## Knowledge Gaps
- **36 isolated node(s):** `AnalyticsEntry`, `KVResult`, `TMDBMovie`, `TMDBSearchResponse`, `Film` (+31 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `CineMatch` connect `CineMatch` to `CineMatch — Case Study`?**
  _High betweenness centrality (0.097) - this node is a cross-community bridge._
- **Why does `CineMatch — Case Study` connect `CineMatch — Case Study` to `Technical Decisions`?**
  _High betweenness centrality (0.080) - this node is a cross-community bridge._
- **Why does `Technical Decisions` connect `Technical Decisions` to `CineMatch — Case Study`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **What connects `AnalyticsEntry`, `KVResult`, `TMDBMovie` to the rest of the system?**
  _36 weakly-connected nodes found - possible documentation gaps or missing edges._