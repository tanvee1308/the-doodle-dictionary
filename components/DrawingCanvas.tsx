
'use client';
import { useRef, useEffect } from "react";

export default function DrawingCanvas({ onClear }: { onClear?: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctxRef.current = ctx;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#000";
    }
  }, []);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // 👇 allow the parent page to trigger clearing
  useEffect(() => {
    if (onClear) onClear(clearCanvas);
  }, [onClear]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={200}
      className="border rounded-lg bg-white"
    />
  );
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
