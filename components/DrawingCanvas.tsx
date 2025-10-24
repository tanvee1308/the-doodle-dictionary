"use client";

import React, { useEffect, useRef } from "react";

interface DrawingCanvasProps {
  onClear?: (fn: () => void) => void;
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ onClear }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const drawing = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#000";
    ctxRef.current = ctx;

    const clearCanvas = () => ctx.clearRect(0, 0, canvas.width, canvas.height);
    onClear?.(clearCanvas);
  }, [onClear]);

  const pos = (e: MouseEvent | TouchEvent) => {
    const c = canvasRef.current!;
    const r = c.getBoundingClientRect();
    const x = e instanceof TouchEvent ? e.touches[0].clientX - r.left : (e as MouseEvent).clientX - r.left;
    const y = e instanceof TouchEvent ? e.touches[0].clientY - r.top  : (e as MouseEvent).clientY - r.top;
    return { x, y };
  };

  const start = (e: MouseEvent | TouchEvent) => { drawing.current = true; draw(e); };
  const stop  = () => { drawing.current = false; ctxRef.current?.beginPath(); };

  const draw = (e: MouseEvent | TouchEvent) => {
    if (!drawing.current) return;
    const ctx = ctxRef.current; if (!ctx) return;
    const { x, y } = pos(e);
    ctx.lineTo(x, y); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x, y);
  };

  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    c.addEventListener("mousedown", start);
    c.addEventListener("mouseup",   stop);
    c.addEventListener("mousemove", draw);
    c.addEventListener("touchstart", start);
    c.addEventListener("touchend",   stop);
    c.addEventListener("touchmove",  draw);
    return () => {
      c.removeEventListener("mousedown", start);
      c.removeEventListener("mouseup",   stop);
      c.removeEventListener("mousemove", draw);
      c.removeEventListener("touchstart", start);
      c.removeEventListener("touchend",   stop);
      c.removeEventListener("touchmove",  draw);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={260}
      height={160}
      className="border border-yellow-400 rounded-xl bg-white shadow-sm cursor-crosshair"
    />
  );
};

export default DrawingCanvas;
