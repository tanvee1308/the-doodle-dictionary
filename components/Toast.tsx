"use client";

import { useEffect } from "react";

type Props = {
  show: boolean;
  message: string;
  onHide: () => void;
  duration?: number; // ms
};

export default function Toast({ show, message, onHide, duration = 1800 }: Props) {
  useEffect(() => {
    if (!show) return;
    const t = setTimeout(onHide, duration);
    return () => clearTimeout(t);
  }, [show, duration, onHide]);

  return (
    <div
      aria-live="polite"
      className={`fixed left-1/2 bottom-6 -translate-x-1/2 transition-all ${
        show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"
      }`}
    >
      <div className="px-4 py-2 rounded-full bg-yellow-400 text-[#2d1b10] shadow">
        {message}
      </div>
    </div>
  );
}
