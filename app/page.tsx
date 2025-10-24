"use client";

import { useRef, useState } from "react";
import DrawingCanvas from "@/components/DrawingCanvas";
import Toast from "@/components/Toast";

export default function Page() {
  const clearCanvasRef = useRef<() => void | null>(null);
  const [toastOpen, setToastOpen] = useState(false);
  const [language, setLanguage] = useState("Hindi");
  const [word, setWord] = useState("");
  const [meaning, setMeaning] = useState("");

  async function handleAddToWall() {
    // TODO: your real upload here
    // after success:
    clearCanvasRef.current?.();
    setWord("");
    setMeaning("");
    setToastOpen(true);
  }

  return (
    <main className="min-h-screen bg-[#fffdf8] flex flex-col items-center justify-center px-6 py-12 text-center">
      {/* Header */}
      <h1
        className="font-[DesiDictionaryDoodles-Regular] text-3xl sm:text-4xl mb-3 tracking-wide"
        style={{ textTransform: "uppercase", letterSpacing: "1px" }}
      >
        DESI DOODLE DICTIONARY
      </h1>

      {/* Intro copy */}
      <div className="max-w-md text-[#5b4636] text-[15px] leading-relaxed space-y-1 mb-6">
        <p>🪶 Add a word you learnt or love in your mother tongue — silly, sweet or desi!</p>
        <p>💬 Every word teaches someone something new.</p>
        <p>🌸 Whatever your word is, doodle it and drop it on the wall.</p>
        <p>💛 One word from you, one word learnt by someone else.</p>
        <p>🚫 No galis & rude words allowed please!!</p>
      </div>

      {/* Doodle box (smaller & centered) */}
      <div className="bg-[#fffaf0] border border-yellow-300 rounded-2xl shadow-md p-3">
        <DrawingCanvas onClear={(fn) => (clearCanvasRef.current = fn)} />
      </div>

      {/* Inputs */}
      <div className="flex flex-wrap justify-center items-center gap-3 mt-5 mb-3 text-sm text-[#2d1b10]">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="border border-yellow-400 rounded-full px-3 py-1 bg-white outline-none hover:bg-yellow-50"
        >
          <option>Hindi</option>
          <option>Gujarati</option>
          <option>Marathi</option>
          <option>Punjabi</option>
          <option>Tamil</option>
          <option>Telugu</option>
          <option>Malayalam</option>
          <option>Bengali</option>
          <option>Urdu</option>
          <option>Sinhala</option>
          <option>Nepali</option>
        </select>

        <input
          type="text"
          placeholder="Word (optional)"
          value={word}
          onChange={(e) => setWord(e.target.value)}
          className="border border-yellow-400 rounded-full px-3 py-1 w-28 text-center outline-none hover:bg-yellow-50"
        />

        <input
          type="text"
          placeholder="Meaning"
          value={meaning}
          onChange={(e) => setMeaning(e.target.value)}
          className="border border-yellow-400 rounded-full px-3 py-1 w-32 text-center outline-none hover:bg-yellow-50"
        />
      </div>

      {/* Single action (no 'Use this doodle' button) */}
      <button
        onClick={handleAddToWall}
        className="mt-2 px-6 py-2 rounded-full bg-yellow-400 hover:bg-yellow-500 text-[#2d1b10] font-medium text-sm shadow transition-transform hover:scale-105"
      >
        💛 Add to Wall
      </button>

      <p className="text-xs mt-6 text-[#9c8b7a] italic">
        Every word teaches someone something new.
      </p>

      {/* Toast */}
      <Toast
        show={toastOpen}
        message="Doodle etched in the wall!"
        onHide={() => setToastOpen(false)}
      />
    </main>
  );
}
