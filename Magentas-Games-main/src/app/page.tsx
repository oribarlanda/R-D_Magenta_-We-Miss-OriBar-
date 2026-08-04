"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";
import { GAMES } from "@/lib/games";
import { getState, getTotalScore, allSolved, resetState } from "@/lib/storage";
import type { AppState, GameId } from "@/types";

function formatTime(ms: number) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, "0")}`;
}

export default function HomePage() {
  const [state, setState] = useState<AppState | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    const update = () => setState(getState());
    update();
    window.addEventListener("score-updated", update);
    return () => window.removeEventListener("score-updated", update);
  }, []);

  useEffect(() => {
    if (!state?.startedAt) return;
    if (allSolved(state)) { setElapsed(Date.now() - state.startedAt); return; }
    const t = setInterval(() => setElapsed(Date.now() - (state.startedAt ?? Date.now())), 1000);
    return () => clearInterval(t);
  }, [state]);

  const total = state ? getTotalScore(state) : 0;
  const done = state ? allSolved(state) : false;
  const solvedCount = state ? Object.values(state.scores).filter(s => s?.solved).length : 0;

  const handleReset = () => {
    resetState();
    setState(getState());
    setConfirmReset(false);
    window.dispatchEvent(new Event("score-updated"));
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2 py-4">
       <div className="flex justify-center mb-3">
  <Image
    src="/logo.png"
    alt="Magenta Medical"
    width={260}
    height={90}
    priority
    className="h-20 w-auto object-contain"
  />
</div>

<h1 className="text-2xl font-bold text-brand-text">
  יום בריכה בחצב - אבי"ב הוואי ובידור
</h1>
      </div>

      {state?.startedAt && (
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-4 space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-brand-muted">התקדמות</span>
            <span className="text-brand-text font-medium">{solvedCount}/5 משחקים</span>
          </div>
          <div className="h-2 bg-brand-border rounded-full overflow-hidden">
            <div className="h-full bg-brand-accent rounded-full transition-all duration-500" style={{ width: `${(solvedCount / 5) * 100}%` }} />
          </div>
          <div className="flex justify-between text-xs text-brand-muted">
            <span>⏱ {formatTime(elapsed)}</span>
            <span>🏆 {total} נקודות</span>
          </div>
        </div>
      )}

      {done && state && (
        <div className="bg-brand-accent/10 border border-brand-accent/30 rounded-2xl p-5 text-center space-y-2 animate-bounce-in">
          <div className="text-4xl">🏆</div>
          <h2 className="text-xl font-bold text-brand-text">כל הכבוד! סיימתם!</h2>
          <p className="text-brand-muted text-sm">ניקוד סופי: <span className="text-brand-accent font-bold text-lg">{total}</span> נקודות</p>
          <p className="text-brand-muted text-sm">זמן כולל: <span className="text-brand-text font-medium">{formatTime(elapsed)}</span></p>
        </div>
      )}

      <div className="space-y-3">
        {GAMES.map(game => {
          const score = state?.scores[game.id as GameId];
          const isSolved = score?.solved;
          return (
            <Link key={game.id} href={game.path} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${isSolved ? "bg-green-500/5 border-green-500/30" : "bg-brand-surface border-brand-border hover:border-brand-accent"}`}>
              <div className="text-3xl shrink-0">{game.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h2 className="font-bold text-brand-text">{game.title}</h2>
                  {isSolved && <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">✓ הושלם</span>}
                </div>
                <p className="text-brand-muted text-sm leading-snug">{game.description}</p>
                {isSolved && score && <p className="text-brand-accent text-xs mt-1 font-medium">{score.score} נקודות</p>}
              </div>
              <div className="text-brand-muted shrink-0 text-lg">{isSolved ? "✅" : "›"}</div>
            </Link>
          );
        })}
      </div>

      {state?.startedAt && (
        <div className="text-center pt-2">
          {!confirmReset ? (
            <button onClick={() => setConfirmReset(true)} className="text-brand-muted text-xs hover:text-brand-text transition-colors">איפוס משחק</button>
          ) : (
            <div className="bg-brand-surface border border-brand-border rounded-xl p-4 space-y-3">
              <p className="text-brand-text text-sm">בטוחים? כל ההתקדמות תימחק.</p>
              <div className="flex gap-2 justify-center">
                <button onClick={handleReset} className="px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition-colors">כן, אפסו</button>
                <button onClick={() => setConfirmReset(false)} className="px-4 py-2 bg-brand-border rounded-lg text-sm text-brand-muted hover:text-brand-text transition-colors">ביטול</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
