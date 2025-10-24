import { NextResponse } from 'next/server';
import { list } from '@vercel/blob';

export async function GET() {
  const { blobs } = await list({ prefix: 'entries/' });
  blobs.sort((a, b) => (b.uploadedAt || 0) - (a.uploadedAt || 0));

  const toFetch = blobs.slice(0, 300);
  const entries = (await Promise.all(
    toFetch.map(async (b) => {
      try {
        const res = await fetch(b.url, { cache: 'no-store' });
        return await res.json();
      } catch {
        return null;
      }
    })
  )).filter(Boolean);

  return NextResponse.json({ entries });
}
