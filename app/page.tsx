'use client';

import React, { useEffect, useState } from 'react';
import DrawingCanvas from '../components/DrawingCanvas';

type Entry = {
  id: string;
  imgUrl: string;
  word: string;
  meaning: string;
  language: string;
  createdAt: number;
};

const LANGS = [
  'Hindi', 'Urdu', 'Marathi', 'Gujarati', 'Punjabi', 'Bengali',
  'Tamil', 'Telugu', 'Malayalam', 'Kannada', 'Sindhi', 'Konkani',
  'Odia', 'Sinhala', 'Nepali'
];

export default function Page() {
  const [img, setImg] = useState<string | null>(null);
  const [word, setWord] = useState('');
  const [meaning, setMeaning] = useState('');
  const [language, setLanguage] = useState(LANGS[0]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load existing entries from API (Blob-backed entries.json)
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/list', { cache: 'no-store' });
        const data = await res.json();
        setEntries(Array.isArray(data?.entries) ? data.entries : []);
      } catch {
        setEntries([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSubmit = async () => {
    setError(null);

    if (!img) {
      setError('Please draw a doodle first ✏️');
      return;
    }
    if (!meaning.trim()) {
      setError('Please add a short meaning/description 💬');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word: word.trim(),
          meaning: meaning.trim(),
          language,
          dataUrl: img
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || 'Could not submit. Please try again.');
      } else if (data?.entry) {
        setEntries(prev => [data.entry, ...prev].slice(0, 500));
        setWord('');
        setMeaning('');
        setImg(null);
      }
    } catch (e: any) {
      setError(e?.message || 'Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const share = async (e: Entry) => {
    try {
      await navigator.clipboard.writeText(e.imgUrl);
      alert('Image URL copied! You can share it anywhere.');
    } catch {
      window.open(e.imgUrl, '_blank');
    }
  };

  return (
    <div className="container">
      {/* Top header */}
      <div className="header">
        <div className="headings">
          <h1 className="h1">THE DOODLE WALL</h1>
          <div className="subh">(by The Desi Dictionary)</div>
        </div>
      </div>

      {/* Intro */}
      <div className="intro">
        <p>✏️ Add a word you’ve learnt or love from your mother tongue — sweet, silly or desi!</p>
        <p>💬 Every word teaches someone something new.</p>
        <p>💛 One word from you, one word learned by someone else.</p>
        <p>🚫 No galis & rude words allowed please!!</p>
      </div>

      {/* Canvas */}
      <DrawingCanvas onExport={(dataUrl: string) => setImg(dataUrl)} />
      {img && (
        <div style={{ textAlign: 'center', marginTop: 8 }}>
          <small className="note">Preview captured. Fill in details and add to wall.</small>
        </div>
      )}

      {/* Inputs */}
      <div className="inputRow">
        <select className="select" value={language} onChange={(e) => setLanguage(e.target.value)}>
          {LANGS.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
        <input
          className="input"
          value={word}
          onChange={(e) => setWord(e.target.value)}
          placeholder="Word (optional)"
          maxLength={50}
        />
        <input
          className="input"
          value={meaning}
          onChange={(e) => setMeaning(e.target.value)}
          placeholder="Meaning / what it means (required)"
          maxLength={180}
        />
      </div>

      <div style={{ textAlign: 'center' }}>
        <button className="addBtn" onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'ADDING…' : '💛 ADD TO WALL'}
        </button>
        {error && (
          <div className="note" style={{ color: '#b00020', marginTop: 8 }}>
            {error}
          </div>
        )}
      </div>

      {/* Divider + Gallery header */}
      <hr className="divider" />
      <h2 className="title" style={{ textAlign: 'center' }}>The Wall of Words</h2>
      <div className="stat" style={{ textAlign: 'center', fontSize: 14, opacity: 0.8, marginTop: 4 }}>
        {entries.length} doodles and counting
      </div>

      {/* Grid */}
      {loading ? (
        <p className="note" style={{ textAlign: 'center', marginTop: 12 }}>Loading…</p>
      ) : entries.length === 0 ? (
        <p className="note" style={{ textAlign: 'center', marginTop: 12 }}>No doodles yet — be the first!</p>
      ) : (
        <div className="grid" style={{ marginTop: 12 }}>
          {entries.map((e) => (
            <button
              key={e.id}
              className="card"
              onClick={() => share(e)}
              title="Share my Doodle Dictionary submission"
              aria-label="Share my Doodle Dictionary submission"
              style={{ textAlign: 'left', padding: 0, cursor: 'pointer' }}
            >
              <span className="cardTopCorner" aria-hidden />
              <span className="cardBottomCorner" aria-hidden />
              <div className="badge">{e.language}</div>
              <img
                src={e.imgUrl}
                alt={e.word || 'Doodle'}
                style={{ width: '100%', display: 'block', aspectRatio: '4 / 3', objectFit: 'cover' }}
              />
              <div className="footerStrip">
                {e.word && <div style={{ fontWeight: 800, marginBottom: 2 }}>{e.word}</div>}
                <div style={{ fontSize: 14, lineHeight: 1.35 }}>{e.meaning}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
