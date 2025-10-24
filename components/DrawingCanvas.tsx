// components/DrawingCanvas.tsx
'use client';

import { useEffect, useRef, useState } from 'react';

type Props = { onExport: (dataUrl: string) => void };

const COLORS = ['#111', '#f44336', '#ff9800', '#ffc107', '#4caf50', '#2196f3', '#9c27b0', '#795548'] as const;
const SIZES = [3, 6, 10, 16] as const;

export default function DrawingCanvas({ onExport }: Props) {
  const cRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  const [drawing, setDrawing] = useState(false);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [color, setColor] = useState<typeof COLORS[number]>('#111');
  const [size, setSize] = useState<typeof SIZES[number]>(6);

  // Setup context & DPR scaling; paint initial background
  useEffect(() => {
    const c = cRef.current;
    if (!c) return;

    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const rect = c.getBoundingClientRect();
    // Logical pixels for crisp strokes
    c.width = Math.max(1, Math.floor(rect.width * dpr));
    c.height = Math.max(1, Math.floor(rect.height * dpr));

    const ctx = c.getContext('2d');
    if (!ctx) return;
    ctxRef.current = ctx;

    // scale drawing so coordinates match CSS pixels
    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = color;
    ctx.lineWidth = size;

    // white-cream background
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#fffaf3';
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.restore();
  }, []);

  // Update brush when color/size change
  useEffect(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
  }, [color, size]);

  function getPos(e: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent) {
    const c = cRef.current!;
    const rect = c.getBoundingClientRect();

    // React wraps native events; grab native touch if present
    const isTouch = 'touches' in e || 'changedTouches' in (e as any);
    if (isTouch) {
      const te = (e as TouchEvent) || ((e as unknown as React.TouchEvent).nativeEvent as TouchEvent);
      const t = te.touches[0] || te.changedTouches[0];
      return { x: t.clientX - rect.left, y: t.clientY - rect.top };
    }
    const me = (e as MouseEvent) || ((e as unknown as React.MouseEvent).nativeEvent as MouseEvent);
    return { x: me.clientX - rect.left, y: me.clientY - rect.top };
  }

  function start(e: any) {
    e.preventDefault?.();
    const ctx = ctxRef.current!;
    const c = cRef.current!;
    const { x, y } = getPos(e);

    // push current image to history for undo (cap 40)
    try {
      setHistory(h => [ctx.getImageData(0, 0, c.width, c.height), ...h].slice(0, 40));
    } catch {
      // ignore cross-origin canvas errors (shouldn't happen here)
    }

    ctx.beginPath();
    ctx.moveTo(x, y);
    setDrawing(true);
  }

  function move(e: any) {
    if (!drawing) return;
    e.preventDefault?.();
    const ctx = ctxRef.current!;
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function end() {
    setDrawing(false);
  }

  function reset() {
    const c = cRef.current!;
    const ctx = ctxRef.current!;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#fffaf3';
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.restore();
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
  }

  function undo() {
    const ctx = ctxRef.current!, c = cRef.current!;
    setHistory(h => {
      if (!h.length) return h;
      const [last, ...rest] = h;
      ctx.putImageData(last, 0, 0);
      return rest;
    });
  }

  function exportPNG() {
    onExport(cRef.current!.toDataURL('image/png'));
  }

  return (
