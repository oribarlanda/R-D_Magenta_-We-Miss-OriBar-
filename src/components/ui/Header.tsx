"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function Header() {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-brand-bg/95 backdrop-blur border-b border-brand-border">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <Image
              src="/logo.png"
              alt="Magenta Medical"
              width={120}
              height={40}
              priority
              className="h-8 w-auto object-contain"
            />
            <span className="font-bold text-brand-text text-sm">
              יום בריכה בחצב - אבי"ב הוואי ובידור
            </span>
          </Link>

          <div className="flex items-center gap-1">
            <Link
              href="/"
              className="px-3 py-1.5 rounded-lg text-brand-muted hover:text-brand-text hover:bg-brand-surface text-sm transition-colors"
            >
              בית
            </Link>

            <button
              onClick={() => setShowHelp(true)}
              className="px-3 py-1.5 rounded-lg text-brand-muted hover:text-brand-text hover:bg-brand-surface text-sm transition-colors"
            >
              הוראות
            </button>
          </div>
        </div>
      </header>

      {showHelp && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setShowHelp(false)}
        >
          <div
            className="bg-brand-surface rounded-2xl p-6 max-w-sm w-full border border-brand-border animate-bounce-in"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-brand-text mb-4">
              הוראות
            </h2>

            <ul className="space-y-3 text-brand-muted text-sm">
              <li>🔗 מה הקשר – מצאו 5 קבוצות של 4 מילים.</li>
              <li>🧠 הגיונית – פתרו חידות היגיון.</li>
              <li>⛓ השרשרת – חברו בין מושגים.</li>
              <li>🎵 איזה שיר – זהו את השיר המתורגם.</li>
              <li>🕵️ מי אני – גלו מי מסתתר בתמונה.</li>
            </ul>

            <p className="mt-4 text-xs text-brand-muted">
              פתרו כמה שיותר משחקים וצברו נקודות.
            </p>

            <button
              onClick={() => setShowHelp(false)}
              className="mt-5 w-full py-2.5 bg-brand-accent hover:bg-brand-accentHover text-white rounded-xl font-medium transition-colors"
            >
              הבנתי
            </button>
          </div>
        </div>
      )}
    </>
  );
}
