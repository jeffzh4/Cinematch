# Graph Report - .  (2026-09-01)

## Corpus Check
- 22 files · ~21,746 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 142 nodes · 174 edges · 14 communities (13 shown, 1 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 12 edges (avg confidence: 0.83)
- Token cost: 91,435 input · 0 output

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
- [[_COMMUNITY_Favicon Icon|Favicon Icon]]

## God Nodes (most connected - your core abstractions)
1. `kvPipeline()` - 12 edges
2. `README.md — Project Overview` - 10 edges
3. `Results Page` - 10 edges
4. `CineMatch Question Form Screenshot` - 7 edges
5. `Loading Page` - 7 edges
6. `CineMatch Landing Page Screenshot` - 5 edges
7. `rateLimit()` - 4 edges
8. `handler()` - 4 edges
9. `index.html — Landing Page` - 4 edges
10. `TypeScript on the API layer only` - 4 edges

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
- **CineMatch Core Recommendation Flow** — form_html, loading_html, results_html, api_recommend_ts [EXTRACTED 0.90]
- **Brutalist Header + Bottom-Bar Pattern (shared across pages)** — index_html, form_html, about_html, contact_html, error_html, 404_html, analytics_html, results_html, share_html [INFERRED 0.85]
- **Vercel KV Backed Features (analytics + share)** — analytics_html, share_html, api_analytics_ts, api_share_ts, concept_vercel_kv [INFERRED 0.90]

## Communities (14 total, 1 thin omitted)

### Community 0 - "KV-Backed API Endpoints"
Cohesion: 0.14
Nodes (17): AnalyticsEntry, handler(), isRetryableStatus(), kvPipeline(), KVResult, sleep(), handler(), config (+9 more)

### Community 1 - "Docs, Design Rationale, Share Page"
Cohesion: 0.13
Nodes (20): api/analytics.ts (referenced endpoint), api/poster.ts (referenced endpoint), api/recommend.ts (referenced endpoint), api/share.ts (referenced endpoint), CASE_STUDY.md — Design Case Study, LLM-generated recommendations over a rules engine, Prompt Caching Strategy, Serverless over a traditional backend (+12 more)

### Community 2 - "Static Pages + Landing/Form Screenshots"
Cohesion: 0.12
Nodes (18): about.html — About Page, cm_genres (localStorage key), cm_mood (localStorage key), contact.html — Contact Page, Accent Purple #a78bff Design Token, Fraunces Serif Display Font, form.html — Six-Question Intake Form, index.html — Landing Page (+10 more)

### Community 3 - "Client localStorage + Page Flow"
Cohesion: 0.20
Nodes (13): 404 Page, Analytics Page, cm_favorites localStorage key, cm_refine localStorage flag, cm_results localStorage key, Error Page, Favorites Page, Film Recommendation JSON Schema (+5 more)

### Community 4 - "Package Dependencies"
Cohesion: 0.15
Nodes (12): dependencies, react, @vercel/og, zod, devDependencies, esbuild, @types/node, @types/react (+4 more)

### Community 5 - "Poster + Security Helpers"
Cohesion: 0.31
Nodes (8): handler(), TMDBMovie, TMDBSearchResponse, applySecurityHeaders(), boundedString(), buckets, clientKey(), rateLimit()

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
Cohesion: 0.50
Nodes (4): FilmSchema, handler(), RecommendationResult, RecommendationResultSchema

### Community 11 - "Results Page Screenshot"
Cohesion: 0.50
Nodes (5): Certified Copy Film Card, The Double Life of Véronique Film Card, Editorial Headline Ending in a little longer, User Mood Quote Block, Results Page Explanations Screenshot

## Knowledge Gaps
- **56 isolated node(s):** `buckets`, `TMDBMovie`, `TMDBSearchResponse`, `TMDB API`, `Film Frame Icon` (+51 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Results Page` connect `Client localStorage + Page Flow` to `KV-Backed API Endpoints`, `Poster + Security Helpers`?**
  _High betweenness centrality (0.070) - this node is a cross-community bridge._
- **Why does `Loading Page` connect `Client localStorage + Page Flow` to `KV-Backed API Endpoints`, `Recommend Handler + Zod Schema`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `CineMatch Question Form Screenshot` (e.g. with `Fraunces Serif Display Font` and `form.html — Six-Question Intake Form`) actually correct?**
  _`CineMatch Question Form Screenshot` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `buckets`, `TMDBMovie`, `TMDBSearchResponse` to the rest of the system?**
  _62 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `KV-Backed API Endpoints` be split into smaller, more focused modules?**
  _Cohesion score 0.13768115942028986 - nodes in this community are weakly interconnected._
- **Should `Docs, Design Rationale, Share Page` be split into smaller, more focused modules?**
  _Cohesion score 0.13157894736842105 - nodes in this community are weakly interconnected._
- **Should `Static Pages + Landing/Form Screenshots` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._