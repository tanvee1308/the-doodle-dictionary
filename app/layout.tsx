export const metadata = {
  title: 'The Doodle Wall — The Desi Dictionary',
  description: 'Add a word you’ve learnt or love from your mother tongue — sweet, silly or desi!',
};

import './globals.css';
import React from 'react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
