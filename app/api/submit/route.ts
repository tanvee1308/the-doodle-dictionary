export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

const BAD = ['bhenchod','madarchod','choot','lund','bc','mc','randi','harami','gandu','kutte','kutti'];

export async function POST(req: NextRequest) {
  try {
    const { word, meaning, language, dataUrl } = await req.json();

    if (!meaning || !language || !dataUrl?.startsWith('data:image/png')) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }
    const lower = (String(word||'') + ' ' + meaning).toLowerCase();
    if (BAD.some(b => lower.includes(b))) {
      return NextResponse.json({ error: 'Family-friendly only (no galis)' }, { status: 400 });
    }

    // Save PNG to Blob
    const base64 = dataUrl.split(',')[1];
    const bytes = Buffer.from(base64, 'base64');
    const id = `doodle_${Date.now()}`;

    const img = await put(`doodles/${id}.png`, bytes, {
      access: 'public',
      contentType: 'image/png',
    });

    const entry = {
      id,
      imgUrl: img.url,
      word: String(word||'').slice(0, 50),
      meaning: String(meaning).slice(0, 180),
      language: String(language).slice(0, 40),
      createdAt: Date.now(),
    };

    // Save entry JSON to Blob
    await put(`entries/${id}.json`, Buffer.from(JSON.stringify(entry)), {
      access: 'public',
      contentType: 'application/json',
    });

    return NextResponse.json({ ok: true, entry });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
  }
}
