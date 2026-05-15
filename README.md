# CineMatch

A personalized movie recommendation web app. Three questions → six tailored film picks with spoiler-free explanations, powered by Claude.

**Live demo:** _(add Vercel URL once deployed)_

---

## How it works

1. User answers three questions on the form: mood, genre, occasion
2. Inputs are sent to a serverless function that calls Claude's API
3. Claude returns 6 films + a literary headline as structured JSON
4. Results page renders the films and fetches poster art from TMDB
5. Errors at any step fall through to a dedicated error page

## Pages

| File | Purpose |
|---|---|
| `index.html` | Landing |
| `form.html` | Three-question input form |
| `loading.html` | Calls the recommendation API |
| `results.html` | Renders Claude's response + TMDB posters |
| `error.html` | Fallback when API calls fail |
| `about.html`, `contact.html` | Static info pages |

## Serverless functions (Vercel)

| Endpoint | Purpose |
|---|---|
| `POST /api/recommend` | Proxies Anthropic API — accepts `{ mood, genres, occasion }`, returns Claude's parsed JSON |
| `GET /api/poster?title=X&year=Y` | Proxies TMDB — returns poster URL for a film |

Both functions read API keys from environment variables. **Keys never appear in client code.**

---

## Local development

Two options:

### Option A — Simple (direct API calls from browser)

1. Copy your Anthropic + TMDB keys into `config.local.js`:
   ```js
   window.CINEMATCH_CONFIG = {
     ANTHROPIC_API_KEY: 'sk-ant-...',
     ANTHROPIC_MODEL:   'claude-sonnet-4-6',
     TMDB_API_KEY:      '...'
   };
   ```
   (`config.local.js` is gitignored.)

2. Serve the directory:
   ```
   python3 -m http.server 7821
   ```

3. Open <http://localhost:7821>

### Option B — With serverless functions (matches production)

1. Install Vercel CLI: `npm i -g vercel`
2. Create `.env.local`:
   ```
   ANTHROPIC_API_KEY=sk-ant-...
   TMDB_API_KEY=...
   ```
3. Run `vercel dev`
4. Open the URL it prints

---

## Deploying to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com), sign in, **Add New → Project**, import the repo
3. In **Project Settings → Environment Variables**, add:
   - `ANTHROPIC_API_KEY` — your Anthropic API key
   - `TMDB_API_KEY` — your TMDB API key
   - `ANTHROPIC_MODEL` _(optional)_ — defaults to `claude-sonnet-4-6`
4. Click **Deploy**

The static HTML files and `api/` serverless functions are detected automatically — no build step required.

---

## Tech

- Plain HTML/CSS/JS — no framework, no build step
- Claude (`claude-sonnet-4-6`) for recommendations
- TMDB for poster art
- Vercel for hosting + serverless functions

Built by Jeffrey Zhang, 2026.
