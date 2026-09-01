// Vercel Edge Function: generates a per-share PNG image with the real
// headline and top film titles for a share link, using @vercel/og (Satori).
// Reached from api/share-og.ts as the og:image URL. Never reached by a
// regular browser — only referenced inside crawler-served HTML.
//
// Edge runtime, not Node: @vercel/og's ImageResponse requires it. _kv.ts
// only uses fetch (no Node-only APIs), so it works unchanged here too.
//
// Plain React.createElement calls, no JSX: this is a .ts file (not .tsx)
// so Vercel's file-based routing reliably detects it as an API route —
// api/share-image.tsx was silently never registered by Vercel's build
// (clean 404, not a runtime error), most likely because .tsx isn't in its
// auto-detected api/ function extension list. Rather than guess at that
// further, this sidesteps the whole question: no JSX means no JSX
// transform to depend on either.

export const config = { runtime: 'edge' };

import { createElement, type ReactElement } from 'react';
import { ImageResponse } from '@vercel/og';
import { kvPipeline } from './_kv';

function stripTags(s: string): string {
  return s.replace(/<[^>]*>/g, '');
}

interface Film {
  title?: string;
}

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const id  = (url.searchParams.get('id') || '').trim();

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

  return new ImageResponse(
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
}
