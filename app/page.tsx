"use client";

import { useState } from "react";
import DrawingCanvas from "@/components/DrawingCanvas";
import Toast from "@/components/Toast";

export default function Page() {
  const [clearCanvas, setClearCanvas] = useState<(() => void) | null>(null);
  const [toastOpen, setToastOpen] = useState(false);
  const [language, setLanguage] = useState("Hindi");
  const [word, setWord] = useState("");
  const [meaning, setMeaning] = useState("");

  async function handleAddToWall() {
    clearCanvas?.();
    setWord("");
    setMeaning("");
    setToastOpen(true);
  }

  return (
    <main className="min-h-screen bg-[#fffdf8] flex flex-col items-center justify-center px-6 py-12 text-center font-sans">
      {/* Title */}
      <h1
        className="font-[DesiDictionaryDoodles-Regular] text-4xl mb-6 text-[#2d1b10]"
        style={{ letterSpacing: "1px" }}
      >
        DESI DOODLE DICTIONARY
      </h1>

      {/* Description text */}
      <div className="max-w-lg text-[#5b4636] text-base leading-relaxed mb-6 space-y-1">
        <p>✏️ Add a word you learnt or love in your mother tongue — silly, sweet or desi!</p>
        <p>💬 Every word teaches someone something new.</p>
        <p>🌸 Whatever your word is, doodle it and drop it on the wall.</p>
        <p>💛 One word from you, one word learnt by someone else.</p>
        <p>🚫 No galis & rude words allowed please!!</p>
      </div>

      {/* Doodle box wrapper */}
      <div className="flex flex-col items-center justify-center mb-6">
        <div className="bg-[#fffaf0] border border-yellow-300 rounded-3xl shadow-md p-4">
          <DrawingCanvas onClear={(fn) => setClearCanvas(() => fn)} />
        </div>
      </div>

      {/* Input fields */}
      <div className="flex flex-wrap justify-center items-center gap-3 text-sm text-[#2d1b10] mb-5">
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
          className="border border-yellow-400 rounded-full px-3 py-1 w-32 text-center outline-none hover:bg-yellow-50"
        />

        <input
          type="text"
          placeholder="Meaning"
          value={meaning}
          onChange={(e) => setMeaning(e.target.value)}
          className="border border-yellow-400 rounded-full px-3 py-1 w-32 text-center outline-none hover:bg-yellow-50"
        />
      </div>

      {/* Button */}
      <button
        onClick={handleAddToWall}
        className="px-6 py-2 rounded-full bg-yellow-400 hover:bg-yellow-500 text-[#2d1b10] font-medium text-sm shadow transition-transform hover:scale-105"
      >
        💛 Add to Wall
      </button>

      <p className="text-xs mt-6 text-[#9c8b7a] italic">
        ✨ Doodle etched in the wall!
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
