// Vercel Edge Function: generates a per-share PNG image with the real
// headline and top film titles for a share link, using @vercel/og (Satori).
// Reached from api/share-og.ts as the og:image URL. Never reached by a
// regular browser — only referenced inside crawler-served HTML.
//
// Edge runtime, not Node: @vercel/og's ImageResponse requires it. _kv.ts
// only uses fetch (no Node-only APIs), so it works unchanged here too.

export const config = { runtime: 'edge' };

import React from 'react';
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

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          background: '#0c0c0c',
          padding: '80px',
        }}
      >
        <div style={{ display: 'flex', fontSize: 24, letterSpacing: 6, color: '#a78bff' }}>
          CINEMATCH
        </div>
        <div style={{ display: 'flex', fontSize: 56, color: '#f5f5f0', marginTop: 32, lineHeight: 1.15, maxWidth: 980 }}>
          {headline}
        </div>
        {filmLine ? (
          <div style={{ display: 'flex', fontSize: 26, color: '#a8a8a3', marginTop: 44 }}>
            {filmLine}
          </div>
        ) : null}
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
