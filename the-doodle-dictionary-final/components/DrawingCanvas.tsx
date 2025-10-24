
'use client';
import { useEffect, useRef, useState } from 'react';

type Props = { onExport: (dataUrl: string) => void };

const COLORS = ['#4c2c2c','#f2a007','#1e88e5','#2a7f62','#e91e63','#000000','#ffffff'];
const SIZES = [2,4,6,10,16];

export default function DrawingCanvas({ onExport }: Props) {
  const cRef = useRef<HTMLCanvasElement|null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D|null>(null);
  const [drawing,setDrawing]=useState(false);
  const [color,setColor]=useState(COLORS[0]);
  const [size,setSize]=useState(6);
  const [history,setHistory]=useState<ImageData[]>([]);

  useEffect(()=>{
    const c=cRef.current!;
    c.width=560; c.height=360;
    const ctx=c.getContext('2d')!;
    ctxRef.current=ctx;
    reset();
  },[]);

  useEffect(()=>{
    if(!ctxRef.current) return;
    const ctx=ctxRef.current;
    ctx.lineWidth=size;
    ctx.strokeStyle=color;
    ctx.lineCap='round'; ctx.lineJoin='round';
  },[size,color]);

  const getPos=(e:any)=>{
    const rect=cRef.current!.getBoundingClientRect();
    const X=e.touches?e.touches[0].clientX:e.clientX;
    const Y=e.touches?e.touches[0].clientY:e.clientY;
    return {x:X-rect.left,y:Y-rect.top};
  };

  function start(e:any){
    setDrawing(true);
    const {x,y}=getPos(e);
    const ctx=ctxRef.current!;
    ctx.beginPath(); ctx.moveTo(x,y);
    try{ setHistory(h=>[ctx.getImageData(0,0,cRef.current!.width,cRef.current!.height),...h].slice(0,40)); }catch{}
  }
  function move(e:any){ if(!drawing)return; const {x,y}=getPos(e); const ctx=ctxRef.current!; ctx.lineTo(x,y); ctx.stroke(); }
  function end(){ setDrawing(false); }

  function reset(){
    const c=cRef.current!; const ctx=ctxRef.current!;
    ctx.fillStyle='#fffaf3'; ctx.fillRect(0,0,c.width,c.height);
    ctx.strokeStyle=color; ctx.lineWidth=size;
  }
  function undo(){
    const ctx=ctxRef.current!, c=cRef.current!;
    setHistory(h=>{ if(!h.length) return h; const [last,...rest]=h; ctx.putImageData(last,0,0); return rest; });
  }
  function exportPNG(){ onExport(cRef.current!.toDataURL('image/png')); }

  return (
    <div>
      <canvas
        className="canvasFrame"
        ref={cRef}
        onMouseDown={start} onMouseMove={move} onMouseUp={end} onMouseLeave={end}
        onTouchStart={start} onTouchMove={move} onTouchEnd={end}
        style={{display:'block'}}
      />
      <div className="toolbar">
        <div style={{display:'flex',gap:6}}>
          {COLORS.map(c=>(
            <button key={c} className="swatch" onClick={()=>setColor(c)} style={{background:c, outline: c===color?'2px solid #3336':'none'}} aria-label={'color '+c}/>
          ))}
        </div>
        <div style={{display:'flex',gap:6}}>
          {SIZES.map(s=>(
            <button key={s} onClick={()=>setSize(s)} style={{border:'1px solid #e6d5c4',borderRadius:10,background:'#fff',padding:'.25rem .6rem'}}>{s}px</button>
          ))}
        </div>
        <button onClick={undo} style={{border:'1px solid #e6d5c4',borderRadius:10,background:'#fff',padding:'.4rem .7rem'}}>Undo</button>
        <button onClick={reset} style={{border:'1px solid #e6d5c4',borderRadius:10,background:'#fff',padding:'.4rem .7rem'}}>Clear</button>
        <button onClick={exportPNG} style={{border:'none',borderRadius:12,background:'#f2a007',color:'#4c2c2c',padding:'.5rem .8rem',fontWeight:800}}>Use this doodle</button>
      </div>
    </div>
  );
}
