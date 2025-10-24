
import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
export async function GET() {
  const raw = await kv.lrange('doodles:entries', 0, 299);
  const entries = raw.map((s: string) => JSON.parse(s));
  return NextResponse.json({ entries });
}
