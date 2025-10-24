import { NextResponse } from 'next/server';
import { list } from '@vercel/blob';

function getUploadedAt(x: any): number {
  const v = x?.uploadedAt;
  if (typeof v === 'number') return v;
  if (typeof v === 'string') {
    const t = Date.parse(v);
    return Number.isNaN(t) ? 0 : t;
  }
  return 0;
}

export async function GET() {
  const { blobs } = await list({ prefix: 'entries/' });

  // newest first, with strict typing
  blobs.sort((a, b) => getUploadedAt(b) - getUploadedAt(a));

  const toFetch = blobs.slice(0, 300);

  const entries = (
    await Promise.all(
      toFetch.map(async (b) => {
        try {
          const res = await fetch(b.url, { cache: 'no-store' });
          return await res.json();
        } catch {
          return null;
        }
      })
    )
  ).filter(Boolean);

  return NextResponse.json({ entries });
}
