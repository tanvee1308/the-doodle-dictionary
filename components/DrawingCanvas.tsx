"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  /** gives the parent a function it can call to clear the canvas */
  onClear?: (fn: () => void) => void;
};

const CANVAS_W = 260; // display pixels (CSS)
const CANVAS_H = 160;

export default function DrawingCanvas({ onClear }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const [color, setColor] = useState<string>("#202020");
  const [size, setSize] = useState<number>(4);

  // simple undo stack
  const historyRef = useRef<ImageData[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const dpr = Math.max(1, window.devicePixelRatio || 1);

    // set the internal bitmap larger for crisp lines
    canvas.width = CANVAS_W * dpr;
    canvas.height = CANVAS_H * dpr;
    canvas.style.width = `${CANVAS_W}px`;
    canvas.style.height = `${CANVAS_H}px`;

    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctxRef.current = ctx;

    // hand clear() to parent
    onClear?.(clearCanvas);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function getPos(e: PointerEvent) {
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    return { x, y };
  }

  function pointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    const ctx = ctxRef.current!;
    // save snapshot for undo
    historyRef.current.push(
      ctx.getImageData(0, 0, CANVAS_W, CANVAS_H)
    );
    if (historyRef.current.length > 30) historyRef.current.shift();

    drawingRef.current = true;
    lastPointRef.current = getPos(e.nativeEvent);
  }

  function pointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return;
    const ctx = ctxRef.current!;
    const p = getPos(e.nativeEvent);
    const last = lastPointRef.current || p;

    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();

    lastPointRef.current = p;
  }

  function pointerUp() {
    drawingRef.current = false;
    lastPointRef.current = null;
  }

  function clearCanvas() {
    const ctx = ctxRef.current!;
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  }

  function undo() {
    const ctx = ctxRef.current!;
    const img = historyRef.current.pop();
    if (img) ctx.putImageData(img, 0, 0);
  }

  const swatches = ["#202020", "#c0392b", "#e67e22", "#f1c40f", "#27ae60", "#2980b9", "#8e44ad", "#000000"];

  return (
    <div className="flex flex-col items-center">
      <div className="rounded-2xl overflow-hidden border border-yellow-300 bg-white">
        <canvas
          ref={canvasRef}
          onPointerDown={pointerDown}
          onPointerMove={pointerMove}
          onPointerUp={pointerUp}
          onPointerLeave={pointerUp}
          className="touch-none"
        />
      </div>

      {/* controls */}
      <div className="mt-3 flex items-center gap-3 flex-wrap justify-center">
        {/* colors */}
        <div className="flex items-center gap-2">
          {swatches.map((c) => (
            <button
              key={c}
              aria-label={`color ${c}`}
              onClick={() => setColor(c)}
              className="w-5 h-5 rounded-full border border-black/10"
              style={{ backgroundColor: c, outline: color === c ? "2px solid #f6c72f" : "none" }}
            />
          ))}
        </div>

        {/* sizes */}
        <div className="flex items-center gap-1">
          {[2, 4, 6, 10].map((s) => (
            <button
              key={s}
              onClick={() => setSize(s)}
              className={`px-2 py-0.5 text-xs rounded-full border ${
                size === s ? "bg-yellow-300 border-yellow-400" : "bg-white border-yellow-300"
              }`}
            >
              {s}px
            </button>
          ))}
        </div>

        <button
          onClick={undo}
          className="px-2 py-0.5 text-xs rounded-full border bg-white border-yellow-300 hover:bg-yellow-50"
        >
          Undo
        </button>
        <button
          onClick={clearCanvas}
          className="px-2 py-0.5 text-xs rounded-full border bg-white border-yellow-300 hover:bg-yellow-50"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
