
'use client';
import { useEffect, useRef, useState } from 'react';
import DrawingCanvas from "@/components/DrawingCanvas";
import { makeShareImage } from '../lib/makeShareImage';

type Entry = { id:string; imgUrl:string; word:string; meaning:string; language:string; createdAt:number };

const LANGS = ['Hindi','Urdu','Marathi','Gujarati','Punjabi','Bengali','Tamil','Telugu','Malayalam','Kannada','Sindhi','Konkani','Odia','Sinhala','Nepali'];

export default function Page(){
  const [img,setImg]=useState<string|null>(null);
  const [word,setWord]=useState('');
  const [meaning,setMeaning]=useState('');
  const [language,setLanguage]=useState('Hindi');
  const [entries,setEntries]=useState<Entry[]>([]);
  const [submitting,setSubmitting]=useState(false);
  const [error,setError]=useState<string|null>(null);
  const [loading,setLoading]=useState(true);

  async function load(){
    try{
      const r=await fetch('/api/list',{cache:'no-store'});
      const d=await r.json();
      setEntries(d.entries||[]);
    }finally{ setLoading(false); }
  }
  useEffect(()=>{ load(); },[]);

  async function handleSubmit(){
    if(!img){ setError('Please draw your word first.'); return; }
    if(!meaning.trim()){ setError('Please add a meaning.'); return; }
    setError(null); setSubmitting(true);
    try{
      const res = await fetch('/api/submit',{
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ word, meaning, language, dataUrl: img })
      });
      const out = await res.json();
      if(!res.ok) throw new Error(out.error||'Failed to save');
      setWord(''); setMeaning(''); setLanguage('Hindi'); setImg(null);
      await load();
    }catch(e:any){
      setError(e.message||'Error');
    }finally{ setSubmitting(false); }
  }

  async function share(entry: Entry){
    try{
      const { blob, fileName } = await makeShareImage({
        doodleUrl: entry.imgUrl,
        language: entry.language,
        meaning: entry.meaning,
        word: entry.word,
      });
      if (navigator.share && navigator.canShare?.({ files: [new File([blob], fileName)] })) {
        await navigator.share({
          title: 'MY DOODLE DICTIONARY SUBMISSION',
          text: `${entry.word?entry.word+' — ':''}${entry.meaning} (${entry.language})`,
          files: [new File([blob], fileName, { type: 'image/png' })],
        });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = fileName;
        document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
        alert('Saved image. You can share it from your gallery 📲');
      }
    }catch{}
  }

  return (
    <div className="container">
      <div className="header">
        <h1 className="h1">THE DOODLE DICTIONARY</h1>
        <div className="note">Add a word you love — silly, sweet, or just so desi. 🚫 No galis.</div>
      </div>

      {/* Draw box */}
      <DrawingCanvas onExport={(d)=>setImg(d)} />

      {/* Inputs */}
      <div className="inputRow">
        <select className="select" value={language} onChange={(e)=>setLanguage(e.target.value)}>
          {LANGS.map(l=> <option key={l} value={l}>{l}</option>)}
        </select>
        <input className="input" value={word} onChange={e=>setWord(e.target.value)} placeholder="Word (optional)" />
        <input className="input" value={meaning} onChange={e=>setMeaning(e.target.value)} placeholder="Meaning" />
      </div>
      {error && <p style={{color:'#b00020', textAlign:'center'}}>{error}</p>}
      <div style={{textAlign:'center'}}>
        <button className="addBtn" onClick={handleSubmit} disabled={submitting}>{submitting?'ADDING…':'💛 ADD TO WALL'}</button>
        <div className="note">Every word teaches someone something new.</div>
      </div>

      {/* Wall */}
      <h2 className="title" style={{marginTop:'2rem', textAlign:'center'}}>WALL</h2>

      {loading ? <p className="note" style={{textAlign:'center'}}>Loading…</p> : (
        <div className="grid">
          {entries.map((e)=>(
            <button key={e.id} className="card" onClick={()=>share(e)} title="Share my Doodle Dictionary submission" aria-label="Share my Doodle Dictionary submission" style={{textAlign:'left', padding:0, cursor:'pointer'}}>
              <span className="cardTopCorner" aria-hidden />
              <span className="cardBottomCorner" aria-hidden />
              {/* language badge */}
              <div className="badge">{e.language}</div>
              {/* doodle */}
              <img src={e.imgUrl} alt={e.word||'Doodle'} style={{width:'100%', display:'block', aspectRatio:'4 / 3', objectFit:'cover'}}/>
              {/* meaning strip */}
              <div className="footerStrip">
                {e.word && <div style={{fontWeight:800, marginBottom:2}}>{e.word}</div>}
                <div style={{fontSize:14, lineHeight:1.35}}>{e.meaning}</div>
              </div>
            </button>
          ))}
        </div>
      )}

    </div>
  );
}
