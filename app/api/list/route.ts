import { NextResponse } from 'next/server';
import { list } from '@vercel/blob';

export async function GET() {
  try {
    const listed = await list({ prefix: 'doodles/entries.json' });
    if (listed.blobs && listed.blobs.length > 0) {
      const url = listed.blobs[0].url;
      const resp = await fetch(url, { cache: 'no-store' });
      if (resp.ok) {
        const entries = await resp.json();
        return NextResponse.json({ entries });
      }
    }
    return NextResponse.json({ entries: [] });
  } catch {
    return NextResponse.json({ entries: [] });
  }
}
