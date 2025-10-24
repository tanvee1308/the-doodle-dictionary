"use client";

import { useEffect } from "react";

export default function Toast({
  show,
  message,
  onHide,
  duration = 1800,
}: {
  show: boolean;
  message: string;
  onHide: () => void;
  duration?: number;
}) {
  useEffect(() => {
    if (!show) return;
    const id = setTimeout(onHide, duration);
    return () => clearTimeout(id);
  }, [show, duration, onHide]);

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className={`pointer-events-none fixed left-1/2 bottom-6 -translate-x-1/2 transition-all duration-300 
        ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
    >
      <div className="px-4 py-2 rounded-full shadow-md bg-yellow-400 text-[#2d1b10] text-sm font-medium">
        ✨ {message}
      </div>
    </div>
  );
}
