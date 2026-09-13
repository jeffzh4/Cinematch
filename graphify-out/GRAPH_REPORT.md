# Graph Report - CineMatch  (2026-09-13)

## Corpus Check
- 21 files · ~22,231 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 174 nodes · 221 edges · 28 communities (13 shown, 15 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 10 edges (avg confidence: 0.83)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `87f1a814`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_KV-Backed API Endpoints|KV-Backed API Endpoints]]
- [[_COMMUNITY_Docs, Design Rationale, Share Page|Docs, Design Rationale, Share Page]]
- [[_COMMUNITY_Static Pages + LandingForm Screenshots|Static Pages + Landing/Form Screenshots]]
- [[_COMMUNITY_Client localStorage + Page Flow|Client localStorage + Page Flow]]
- [[_COMMUNITY_Package Dependencies|Package Dependencies]]
- [[_COMMUNITY_Poster + Security Helpers|Poster + Security Helpers]]
- [[_COMMUNITY_Quality Gate + Contrast Math|Quality Gate + Contrast Math]]
- [[_COMMUNITY_share-image Test Suite|share-image Test Suite]]
- [[_COMMUNITY_Vercel Config|Vercel Config]]
- [[_COMMUNITY_share-og Test Suite|share-og Test Suite]]
- [[_COMMUNITY_Recommend Handler + Zod Schema|Recommend Handler + Zod Schema]]
- [[_COMMUNITY_Results Page Screenshot|Results Page Screenshot]]
- [[_COMMUNITY_Security Test Suite|Security Test Suite]]
- [[_COMMUNITY_Favicon Icon|Favicon Icon]]
- [[_COMMUNITY_apiposter.ts (referenced endpoint)|api/poster.ts (referenced endpoint)]]
- [[_COMMUNITY_apirecommend.ts (referenced endpoint)|api/recommend.ts (referenced endpoint)]]
- [[_COMMUNITY_CASE_STUDY.md — Design Case Study|CASE_STUDY.md — Design Case Study]]
- [[_COMMUNITY_Prompt Caching Strategy|Prompt Caching Strategy]]
- [[_COMMUNITY_V2 Define the data model before the features|V2: Define the data model before the features]]
- [[_COMMUNITY_V2 Add schema validation at the LLM boundary|V2: Add schema validation at the LLM boundary]]
- [[_COMMUNITY_V2 Move share-link previews server-side|V2: Move share-link previews server-side]]
- [[_COMMUNITY_CLAUDE.md — Project Instructions|CLAUDE.md — Project Instructions]]
- [[_COMMUNITY_Anthropic API (claude-sonnet-4-6)|Anthropic API (claude-sonnet-4-6)]]
- [[_COMMUNITY_localStorage-based client data flow|localStorage-based client data flow]]
- [[_COMMUNITY_TMDB API|TMDB API]]
- [[_COMMUNITY_Vercel KV (Redis)|Vercel KV (Redis)]]
- [[_COMMUNITY_README.md — Project Overview|README.md — Project Overview]]

## God Nodes (most connected - your core abstractions)
1. `rateLimit()` - 13 edges
2. `kvPipeline()` - 12 edges
3. `applySecurityHeaders()` - 12 edges
4. `boundedString()` - 12 edges
5. `Results Page` - 10 edges
6. `CineMatch — CLAUDE.md` - 8 edges
7. `CineMatch` - 8 edges
8. `handler()` - 7 edges
9. `CineMatch Question Form Screenshot` - 7 edges
10. `Loading Page` - 7 edges

## Surprising Connections (you probably didn't know these)
- `CineMatch Question Form Screenshot` --semantically_similar_to--> `form.html — Six-Question Intake Form`  [INFERRED] [semantically similar]
  portfolio-screenshots/cinematch-questions.png → form.html
- `about.html — About Page` --semantically_similar_to--> `contact.html — Contact Page`  [INFERRED] [semantically similar]
  about.html → contact.html
- `CineMatch Landing Page Screenshot` --conceptually_related_to--> `index.html — Landing Page`  [INFERRED]
  portfolio-screenshots/cinematch-landing.png → index.html
- `404 Page` --semantically_similar_to--> `Error Page`  [INFERRED] [semantically similar]
  404.html → error.html
- `Favorites Page` --semantically_similar_to--> `404 Page`  [INFERRED] [semantically similar]
  favorites.html → 404.html

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Form-to-Results Data Flow** — loading, cm_results, results, error [EXTRACTED 0.90]
- **Noindexed Utility Pages** — analytics, loading, results, favorites [EXTRACTED 0.90]
- **Favorites Save/Load Flow** — results, cm_favorites, favorites [INFERRED 0.85]

## Communities (28 total, 15 thin omitted)

### Community 0 - "KV-Backed API Endpoints"
Cohesion: 0.17
Nodes (14): isRetryableStatus(), kvPipeline(), KVResult, sleep(), config, Film, handler(), stripTags() (+6 more)

### Community 2 - "Static Pages + Landing/Form Screenshots"
Cohesion: 0.11
Nodes (20): about.html — About Page, api/share.ts (referenced endpoint), cm_genres (localStorage key), cm_mood (localStorage key), contact.html — Contact Page, Accent Purple #a78bff Design Token, Fraunces Serif Display Font, form.html — Six-Question Intake Form (+12 more)

### Community 3 - "Client localStorage + Page Flow"
Cohesion: 0.20
Nodes (13): 404 Page, Analytics Page, cm_favorites localStorage key, cm_refine localStorage flag, cm_results localStorage key, Error Page, Favorites Page, Film Recommendation JSON Schema (+5 more)

### Community 4 - "Package Dependencies"
Cohesion: 0.15
Nodes (12): dependencies, react, @vercel/og, zod, devDependencies, esbuild, @types/node, @types/react (+4 more)

### Community 5 - "Poster + Security Helpers"
Cohesion: 0.23
Nodes (16): AnalyticsEntry, handler(), handler(), TMDBMovie, TMDBSearchResponse, FilmSchema, handler(), RecommendationResult (+8 more)

### Community 6 - "Quality Gate + Contrast Math"
Cohesion: 0.33
Nodes (6): combined, failures, pages, TEXT_TOKENS, contrastRatio(), relativeLuminance()

### Community 7 - "share-image Test Suite"
Cohesion: 0.29
Nodes (4): ESBUILD_BIN, ORIGINAL_ENV, REPO_ROOT, VALID_ID

### Community 8 - "Vercel Config"
Cohesion: 0.29
Nodes (6): cleanUrls, headers, redirects, rewrites, $schema, trailingSlash

### Community 9 - "share-og Test Suite"
Cohesion: 0.33
Nodes (4): ESBUILD_BIN, ORIGINAL_ENV, REPO_ROOT, VALID_ID

### Community 10 - "Recommend Handler + Zod Schema"
Cohesion: 0.10
Nodes (19): CineMatch — Case Study, Key Decisions, LLM-generated recommendations over a rules engine, Problem, Prompt caching, Serverless over a traditional backend, TypeScript on the API layer only, Vercel KV for analytics and share links (+11 more)

### Community 11 - "Results Page Screenshot"
Cohesion: 0.50
Nodes (5): Certified Copy Film Card, The Double Life of Véronique Film Card, Editorial Headline Ending in a little longer, User Mood Quote Block, Results Page Explanations Screenshot

### Community 12 - "Security Test Suite"
Cohesion: 0.17
Nodes (11): API architecture, Architecture, CineMatch — CLAUDE.md, Claude Prompt Strategy, Current State — Fully Shipped, Data flow, Design System, Environment variables required (+3 more)

## Knowledge Gaps
- **89 isolated node(s):** `KVResult`, `buckets`, `AnalyticsEntry`, `TMDBMovie`, `TMDBSearchResponse` (+84 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **15 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Results Page` connect `Client localStorage + Page Flow` to `Poster + Security Helpers`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **Why does `kvPipeline()` connect `KV-Backed API Endpoints` to `Poster + Security Helpers`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **Why does `Loading Page` connect `Client localStorage + Page Flow` to `Poster + Security Helpers`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **What connects `KVResult`, `buckets`, `AnalyticsEntry` to the rest of the system?**
  _93 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Static Pages + Landing/Form Screenshots` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._
- **Should `Recommend Handler + Zod Schema` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._