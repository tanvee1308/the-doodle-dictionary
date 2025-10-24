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
    if (onClear) onClear(clearCanvas);
  }, [onClear]);

  const getPosition = (e: MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const x =
      e instanceof TouchEvent ? e.touches[0].clientX - rect.left : (e as MouseEvent).clientX - rect.left;
    const y =
      e instanceof TouchEvent ? e.touches[0].clientY - rect.top : (e as MouseEvent).clientY - rect.top;
    return { x, y };
  };

  const startDrawing = (e: MouseEvent | TouchEvent) => {
    drawing.current = true;
    draw(e);
  };

  const stopDrawing = () => {
    drawing.current = false;
    ctxRef.current?.beginPath();
  };

  const draw = (e: MouseEvent | TouchEvent) => {
    if (!drawing.current) return;
    const ctx = ctxRef.current;
    if (!ctx) return;

    const { x, y } = getPosition(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mouseup", stopDrawing);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("touchstart", startDrawing);
    canvas.addEventListener("touchend", stopDrawing);
    canvas.addEventListener("touchmove", draw);

    return () => {
      canvas.removeEventListener("mousedown", startDrawing);
      canvas.removeEventListener("mouseup", stopDrawing);
      canvas.removeEventListener("mousemove", draw);
      canvas.removeEventListener("touchstart", startDrawing);
      canvas.removeEventListener("touchend", stopDrawing);
      canvas.removeEventListener("touchmove", draw);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={250}
      height={150}
      className="border border-yellow-400 rounded-xl bg-white shadow-sm cursor-crosshair"
    />
  );
};

export default DrawingCanvas;
