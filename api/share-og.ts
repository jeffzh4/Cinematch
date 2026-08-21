// Vercel serverless function: serves crawler-friendly HTML with real og:title/
// og:description/og:image for a shared result set. Only reached via the
// User-Agent-conditioned rewrite in vercel.json — regular browsers never hit
// this route and always get the interactive share.html unchanged.
//
// GET ?id=xxx → minimal HTML document with accurate per-share meta tags,
// then a client-side redirect to the real share.html for the rare crawler
// that also renders the body.

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { applySecurityHeaders, boundedString, rateLimit } from './_security';
import { kvPipeline } from './_kv';

interface Film {
  title?: string;
  year?: number;
  director?: string;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function stripTags(s: string): string {
  return s.replace(/<[^>]*>/g, '');
}

const FALLBACK_IMAGE = 'https://cinematch-navy.vercel.app/portfolio-screenshots/cinematch-results-explanations.png';

function renderHtml(opts: { title: string; description: string; image: string; redirectUrl: string }): string {
  const title       = escapeHtml(opts.title);
  const description = escapeHtml(opts.description);
  const image       = escapeHtml(opts.image);
  const redirectUrl = escapeHtml(opts.redirectUrl);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${title}</title>
<meta name="description" content="${description}">
<meta property="og:site_name" content="CineMatch">
<meta property="og:type" content="website">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:image" content="${image}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}">
<meta name="twitter:image" content="${image}">
<meta name="robots" content="noindex, nofollow">
<meta http-equiv="refresh" content="0; url=${redirectUrl}">
</head>
<body>
<p><a href="${redirectUrl}">${title}</a></p>
</body>
</html>`;
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  applySecurityHeaders(res);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  if (!rateLimit(req, res, 60, 60_000)) return;

  const id = boundedString(req.query.id, 32);
  const redirectUrl = id ? `/share.html?id=${encodeURIComponent(id)}` : '/share.html';

  if (!/^[a-f0-9]{32}$/i.test(id)) {
    res.status(200).send(renderHtml({
      title:       'CineMatch — Shared picks',
      description: 'Six film picks curated by CineMatch — powered by Claude.',
      image:       FALLBACK_IMAGE,
      redirectUrl,
    }));
    return;
  }

  try {
    const results = await kvPipeline([['GET', `cm:share:${id}`]]);
    const raw     = results[0].result as string | null;

    if (!raw) {
      res.status(200).send(renderHtml({
        title:       "CineMatch — Couldn't find these picks",
        description: 'This share link has expired or was never created.',
        image:       FALLBACK_IMAGE,
        redirectUrl,
      }));
      return;
    }

    const data      = JSON.parse(raw) as { headline?: string; films?: Film[] };
    const headline  = data.headline ? stripTags(data.headline) : 'Six films, picked for you';
    const films     = Array.isArray(data.films) ? data.films : [];
    const firstFilm = films[0];

    const description = firstFilm?.title
      ? `Featuring ${firstFilm.title}${firstFilm.year ? ` (${firstFilm.year})` : ''} and ${Math.max(films.length - 1, 0)} more — curated by CineMatch.`
      : 'Six film picks curated by CineMatch — powered by Claude.';

    res.status(200).send(renderHtml({
      title:       `CineMatch — ${headline}`,
      description,
      image:       FALLBACK_IMAGE,
      redirectUrl,
    }));
  } catch {
    res.status(200).send(renderHtml({
      title:       'CineMatch — Shared picks',
      description: 'Six film picks curated by CineMatch — powered by Claude.',
      image:       FALLBACK_IMAGE,
      redirectUrl,
    }));
  }
}
