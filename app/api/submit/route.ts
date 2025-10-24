
import { NextRequest, NextResponse } from 'next/server';
import { put, list } from '@vercel/blob';
// --- BEGIN family-friendly profanity filter (supports variants with *, spaces, punctuation) ---
const profanityPattern = new RegExp(
  String.raw`(?:fuck|f[\W_]*u[\W_]*c[\W_]*k|f\*+ck|f\W*ck|fck|f\W*u\W*c\W*k|shit|s[\W_]*h[\W_]*i[\W_]*t|s\*+it|bitch|b[\W_]*i[\W_]*t[\W_]*c[\W_]*h|b\*+tch|bastard|asshole|a[\W_]*s[\W_]*s[\W_]*h[\W_]*o[\W_]*l[\W_]*e|dick|cock|pussy|slut|whore|cunt|bollocks|wanker|bugger|crap|bloody|arse|fag|twat|retard|retarded|nigger|nigga|bhench?o+d|bhe?nc[h\W_]*o[\W_]*d|bh[e3]n\W*c\W*h\W*o\W*d|b\*+nch\*+d|madarcho+d|mada+r\W*c[h\W_]*o[\W_]*d|m\*+d\*+ch\*+d|cho+ti?ya|chut[iy]a|ch?o+ti?ya|chu+ti+ya|ch\*+tiya|cho+ot|chut|ch\*+t|lund|la?vd[aao]|lavda|l\*+nda?|randi|rand[iy]|r\*+ndi|harami|haraam[iy]|h\*+rami|gandu|ga+ndu|g\*+ndu|kutti|kutte|kuttey|k\*+ttey|bhosdi?ke?|bhosri?ke|bh[o0]sd[iy]ke|bh\*+sd\*+ke|gaand|g[a\*]+nd|saale|s[a\*]+le|s[a\*]+la|bakchod|bakch[o0]d|bakch\*+d|kamina|kamine|kamin[eai]|ullu|ullu[ ]?ka|ullu\W*ka|lavde|lawde)`,
  'i'
);
function isProfane(input: string): boolean {
  const text = (input || '').toLowerCase();
  return profanityPattern.test(text);
}
// --- END profanity filter ---

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

    // Load existing entries.json from blob (if present)
    let entries:any[] = [];
    try {
      const listed = await list({ prefix: 'doodles/entries.json' });
      if (listed.blobs && listed.blobs.length > 0) {
        const url = listed.blobs[0].url;
        const resp = await fetch(url);
        if (resp.ok) {
          entries = await resp.json();
        }
      }
    } catch {}

    // Prepend and trim
    entries.unshift(entry);
    entries = entries.slice(0, 500);

    // Save back to blob
    await put('doodles/entries.json', JSON.stringify(entries), { access: 'public', contentType: 'application/json' });

    return NextResponse.json({ ok: true, entry });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
  }
}
