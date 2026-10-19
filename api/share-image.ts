// Node function generating per-share PNG previews for api/share-og.ts.
// Use the Node renderer: its dependencies are unsupported in Edge bundles.

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createElement, type ReactElement } from 'react';
import { kvPipeline } from './_kv';

function stripTags(s: string): string {
  return s.replace(/<[^>]*>/g, '');
}

interface Film {
  title?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).end();
    return;
  }
  // Preserve ESM loading when Vercel compiles this CommonJS project.
  const { ImageResponse } = await import('@vercel/og');
  const id = typeof req.query.id === 'string' ? req.query.id.trim() : '';

  let headline = 'Six films, picked for you';
  let filmLine = '';

  if (/^[a-f0-9]{32}$/i.test(id)) {
    try {
      const results = await kvPipeline([['GET', `cm:share:${id}`]]);
      const raw = results[0]?.result;
      if (typeof raw === 'string') {
        const data  = JSON.parse(raw) as { headline?: string; films?: Film[] };
        if (data.headline) headline = stripTags(data.headline);
        const films = Array.isArray(data.films) ? data.films : [];
        filmLine = films.slice(0, 3).map((f) => f.title).filter(Boolean).join('  ·  ');
      }
    } catch {
      // Image generation must never fail a crawler request — fall back
      // to the generic headline/no-filmLine defaults set above.
    }
  }

  const children: ReactElement[] = [
    createElement(
      'div',
      { key: 'brand', style: { display: 'flex', fontSize: 24, letterSpacing: 6, color: '#a78bff' } },
      'CINEMATCH',
    ),
    createElement(
      'div',
      { key: 'headline', style: { display: 'flex', fontSize: 56, color: '#f5f5f0', marginTop: 32, lineHeight: 1.15, maxWidth: 980 } },
      headline,
    ),
  ];

  if (filmLine) {
    children.push(
      createElement(
        'div',
        { key: 'films', style: { display: 'flex', fontSize: 26, color: '#a8a8a3', marginTop: 44 } },
        filmLine,
      ),
    );
  }

  const image = new ImageResponse(
    createElement(
      'div',
      {
        style: {
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          background: '#0c0c0c',
          padding: '80px',
        },
      },
      children,
    ),
    { width: 1200, height: 630 },
  );
  const png = Buffer.from(await image.arrayBuffer());
  res.setHeader('Content-Type', 'image/png');
  res.status(200).end(png);
}
