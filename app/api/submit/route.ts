
import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { kv } from '@vercel/kv';

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

    const base64 = dataUrl.split(',')[1];
    const bytes = Buffer.from(base64, 'base64');

    const id = `doodle_${Date.now()}`;
    const blob = await put(`doodles/${id}.png`, bytes, { access: 'public', contentType: 'image/png' });

    const entry = {
      id,
      imgUrl: blob.url,
      word: String(word||'').slice(0, 50),
      meaning: String(meaning).slice(0, 180),
      language: String(language).slice(0, 40),
      createdAt: Date.now(),
    };

    await kv.lpush('doodles:entries', JSON.stringify(entry));
    await kv.ltrim('doodles:entries', 0, 499);

    return NextResponse.json({ ok: true, entry });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
  }
}
