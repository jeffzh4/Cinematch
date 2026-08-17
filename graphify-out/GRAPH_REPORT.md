# Graph Report - .  (2026-08-16)

## Corpus Check
- 26 files · ~17,472 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 90 nodes · 135 edges · 14 communities (13 shown, 1 thin omitted)
- Extraction: 90% EXTRACTED · 10% INFERRED · 0% AMBIGUOUS · INFERRED: 14 edges (avg confidence: 0.86)
- Token cost: 267,609 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Serverless Feature Endpoints|Serverless Feature Endpoints]]
- [[_COMMUNITY_Docs and Design Rationale|Docs and Design Rationale]]
- [[_COMMUNITY_Question Form UI|Question Form UI]]
- [[_COMMUNITY_Landing and Static Pages|Landing and Static Pages]]
- [[_COMMUNITY_Vercel Config|Vercel Config]]
- [[_COMMUNITY_Analytics KV Handler|Analytics KV Handler]]
- [[_COMMUNITY_Poster Lookup Handler|Poster Lookup Handler]]
- [[_COMMUNITY_Recommend Handler|Recommend Handler]]
- [[_COMMUNITY_Share Link Handler|Share Link Handler]]
- [[_COMMUNITY_Package Tooling|Package Tooling]]
- [[_COMMUNITY_Results Page Screenshot|Results Page Screenshot]]
- [[_COMMUNITY_Site Quality Gate Script|Site Quality Gate Script]]
- [[_COMMUNITY_Rate Limiting Security|Rate Limiting Security]]
- [[_COMMUNITY_Favicon Icon|Favicon Icon]]

## God Nodes (most connected - your core abstractions)
1. `rateLimit()` - 10 edges
2. `README.md — Project Overview` - 10 edges
3. `applySecurityHeaders()` - 9 edges
4. `boundedString()` - 9 edges
5. `form.html — Six-Question Intake Form` - 7 edges
6. `results.html — Results Page` - 7 edges
7. `CineMatch Question Form Screenshot` - 7 edges
8. `handler()` - 6 edges
9. `index.html — Landing Page` - 6 edges
10. `loading.html — Recommendation Loading Page` - 6 edges

## Surprising Connections (you probably didn't know these)
- `CineMatch Question Form Screenshot` --semantically_similar_to--> `form.html — Six-Question Intake Form`  [INFERRED] [semantically similar]
  portfolio-screenshots/cinematch-questions.png → form.html
- `404.html — Not Found Page` --semantically_similar_to--> `error.html — Error Fallback Page`  [INFERRED] [semantically similar]
  404.html → error.html
- `about.html — About Page` --semantically_similar_to--> `contact.html — Contact Page`  [INFERRED] [semantically similar]
  about.html → contact.html
- `CineMatch Landing Page Screenshot` --conceptually_related_to--> `index.html — Landing Page`  [INFERRED]
  portfolio-screenshots/cinematch-landing.png → index.html
- `share.html — Shared Results Page` --semantically_similar_to--> `results.html — Results Page`  [INFERRED] [semantically similar]
  share.html → results.html

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **CineMatch Core Recommendation Flow** — form_html, loading_html, results_html, api_recommend_ts [EXTRACTED 0.90]
- **Brutalist Header + Bottom-Bar Pattern (shared across pages)** — index_html, form_html, about_html, contact_html, error_html, 404_html, analytics_html, results_html, share_html [INFERRED 0.85]
- **Vercel KV Backed Features (analytics + share)** — analytics_html, share_html, api_analytics_ts, api_share_ts, concept_vercel_kv [INFERRED 0.90]

## Communities (14 total, 1 thin omitted)

### Community 0 - "Serverless Feature Endpoints"
Cohesion: 0.19
Nodes (18): 404.html — Not Found Page, analytics.html — Usage Dashboard, api/analytics.ts (referenced endpoint), api/poster.ts (referenced endpoint), api/recommend.ts (referenced endpoint), api/share.ts (referenced endpoint), Serverless over a traditional backend, TypeScript on the API layer only (+10 more)

### Community 1 - "Docs and Design Rationale"
Cohesion: 0.25
Nodes (9): CASE_STUDY.md — Design Case Study, LLM-generated recommendations over a rules engine, Prompt Caching Strategy, V2: Define the data model before the features, CLAUDE.md — Project Instructions, Anthropic API (claude-sonnet-4-6), localStorage-based client data flow, TMDB API (+1 more)

### Community 2 - "Question Form UI"
Cohesion: 0.22
Nodes (9): cm_genres (localStorage key), cm_mood (localStorage key), Accent Purple #a78bff Design Token, Fraunces Serif Display Font, Brutalist Header (CINEMATCH / About / Contact), Question 02: What kind of film? (genre chips), Question 01: What are you feeling?, CineMatch Question Form Screenshot (+1 more)

### Community 3 - "Landing and Static Pages"
Cohesion: 0.29
Nodes (8): about.html — About Page, contact.html — Contact Page, index.html — Landing Page, Begin CTA Button, Brutalist Header Nav (About/Contact), Footer Credit "A Passion Project - J. Zhang - 2026", "Find Your Film." Hero Headline, CineMatch Landing Page Screenshot

### Community 4 - "Vercel Config"
Cohesion: 0.33
Nodes (5): cleanUrls, headers, redirects, $schema, trailingSlash

### Community 5 - "Analytics KV Handler"
Cohesion: 0.50
Nodes (4): AnalyticsEntry, handler(), kvPipeline(), KVResult

### Community 6 - "Poster Lookup Handler"
Cohesion: 0.50
Nodes (4): handler(), TMDBMovie, TMDBSearchResponse, boundedString()

### Community 7 - "Recommend Handler"
Cohesion: 0.50
Nodes (4): Film, handler(), RecommendationResult, boundedStringArray()

### Community 8 - "Share Link Handler"
Cohesion: 0.60
Nodes (4): applySecurityHeaders(), handler(), kvPipeline(), KVResult

### Community 9 - "Package Tooling"
Cohesion: 0.40
Nodes (4): devDependencies, @vercel/node, scripts, check

### Community 10 - "Results Page Screenshot"
Cohesion: 0.50
Nodes (5): Certified Copy Film Card, The Double Life of Véronique Film Card, Editorial Headline Ending in a little longer, User Mood Quote Block, Results Page Explanations Screenshot

### Community 11 - "Site Quality Gate Script"
Cohesion: 0.40
Nodes (4): combined, failures, pages, publicPages

### Community 12 - "Rate Limiting Security"
Cohesion: 0.67
Nodes (3): buckets, clientKey(), rateLimit()

## Knowledge Gaps
- **33 isolated node(s):** `buckets`, `AnalyticsEntry`, `KVResult`, `TMDBMovie`, `TMDBSearchResponse` (+28 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `form.html — Six-Question Intake Form` connect `Serverless Feature Endpoints` to `Question Form UI`, `Landing and Static Pages`?**
  _High betweenness centrality (0.100) - this node is a cross-community bridge._
- **Why does `README.md — Project Overview` connect `Docs and Design Rationale` to `Serverless Feature Endpoints`?**
  _High betweenness centrality (0.089) - this node is a cross-community bridge._
- **Why does `CineMatch Question Form Screenshot` connect `Question Form UI` to `Serverless Feature Endpoints`?**
  _High betweenness centrality (0.078) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `form.html — Six-Question Intake Form` (e.g. with `loading.html — Recommendation Loading Page` and `CineMatch Question Form Screenshot`) actually correct?**
  _`form.html — Six-Question Intake Form` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `buckets`, `AnalyticsEntry`, `KVResult` to the rest of the system?**
  _39 weakly-connected nodes found - possible documentation gaps or missing edges._