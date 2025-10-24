
export async function makeShareImage(opts: { doodleUrl: string; language: string; meaning: string; word?: string }){
  const { doodleUrl, language, meaning, word='' } = opts;
  const size = 1080; // square 1:1
  const canvas = document.createElement('canvas');
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Load fonts (DesiDoodles for headers, system for body)
  // We assume the font file is available at /fonts/DesiDictionaryDoodles-Regular.otf
  try {
    // @ts-ignore
    const dd = new FontFace('DesiDoodles', 'url(/fonts/DesiDictionaryDoodles-Regular.otf)');
    await dd.load();
    (document as any).fonts?.add(dd);
  } catch {}

  // Background
  ctx.fillStyle = '#fffaf3';
  ctx.fillRect(0,0,size,size);

  // Frame
  ctx.strokeStyle = '#f2a007';
  ctx.lineWidth = 16;
  ctx.strokeRect(24,24,size-48,size-48);

  // Title
  ctx.fillStyle = '#4c2c2c';
  ctx.textAlign = 'center';
  ctx.font = '48px DesiDoodles, Avenir, sans-serif';
  ctx.fillText('MY DOODLE DICTIONARY SUBMISSION', size/2, 90);

  // Load doodle image
  const img = await new Promise<HTMLImageElement>((resolve,reject)=>{
    const im = new Image();
    im.crossOrigin='anonymous';
    im.onload=()=>resolve(im);
    im.onerror=reject;
    im.src = doodleUrl;
  });

  // Draw doodle centered
  const boxW = size - 200;
  const boxH = 520;
  const x = (size - boxW) / 2;
  const y = 140;
  // draw a soft frame behind
  ctx.strokeStyle = '#4c2c2c33';
  ctx.lineWidth = 4;
  ctx.strokeRect(x, y, boxW, boxH);
  // fit image
  const ratio = Math.min(boxW / img.width, boxH / img.height);
  const iw = img.width * ratio;
  const ih = img.height * ratio;
  const ix = x + (boxW - iw) / 2;
  const iy = y + (boxH - ih) / 2;
  ctx.drawImage(img, ix, iy, iw, ih);

  // Text: language (top of caption), word (bold), meaning (body)
  ctx.textAlign = 'center';
  ctx.fillStyle = '#4c2c2c';
  ctx.font = '32px Avenir, system-ui, sans-serif';
  ctx.fillText(language.toUpperCase(), size/2, y + boxH + 60);

  if (word) {
    ctx.font = '46px DesiDoodles, Avenir, sans-serif';
    ctx.fillText(word.toUpperCase(), size/2, y + boxH + 120);
  }

  // Wrap meaning
  const meaningText = meaning;
  ctx.font = '28px Avenir, system-ui, sans-serif';
  const maxWidth = size - 160;
  const lines: string[] = [];
  const words = meaningText.split(' ');
  let line = '';
  for (const w of words){
    const test = line ? line + ' ' + w : w;
    if (ctx.measureText(test).width < maxWidth) line = test;
    else { lines.push(line); line = w; }
  }
  if (line) lines.push(line);
  let lineY = y + boxH + 168;
  for (const L of lines.slice(0,4)){
    ctx.fillText(L, size/2, lineY);
    lineY += 36;
  }

  // Watermark logo (text only)
  ctx.font = '28px DesiDoodles, Avenir, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillStyle = '#4c2c2c';
  ctx.fillText('the desi dictionary', size - 28, size - 28);

  const blob: Blob = await new Promise(res=>canvas.toBlob(b=>res(b!), 'image/png'));
  return { blob, fileName: 'doodle-dictionary-share.png' };
}
