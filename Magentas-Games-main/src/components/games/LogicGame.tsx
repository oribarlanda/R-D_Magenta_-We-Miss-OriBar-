"use client";
import { useState, useEffect, useCallback } from "react";
import type { LogicData, GameId } from "@/types";
import { saveScore, calcScore } from "@/lib/storage";
import GameResult from "@/components/ui/GameResult";

const MAX_ATTEMPTS = 3;

function buildWords(answer: string): { char: string; globalIdx: number }[][] {
  const words: { char: string; globalIdx: number }[][] = [];
  let currentWord: { char: string; globalIdx: number }[] = [];
  for (let i = 0; i < answer.length; i++) {
    if (answer[i] === " ") {
      if (currentWord.length > 0) { words.push(currentWord); currentWord = []; }
    } else {
      currentWord.push({ char: answer[i], globalIdx: i });
    }
  }
  if (currentWord.length > 0) words.push(currentWord);
  return words;
}

export default function LogicGame({ data, gameId }: { data: LogicData; gameId: GameId }) {
  const answer = data.answers[0].trim();
  const answerChars = answer.split("");
  const totalLen = answerChars.length;
  const words = buildWords(answer);

  const letterIndices = answerChars
    .map((c, i) => (c !== " " ? i : -1))
    .filter(i => i !== -1);

  const [typed, setTyped] = useState<string[]>(Array(totalLen).fill(""));
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [locked, setLocked] = useState<Set<number>>(new Set());
  const [activeIdx, setActiveIdx] = useState<number | null>(letterIndices[0] ?? null);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [attempts, setAttempts] = useState(MAX_ATTEMPTS);
  const [shake, setShake] = useState(false);
  const [finished, setFinished] = useState(false);
  const [won, setWon] = useState(false);

  const maxHints = 2;

  const nextFreeIdx = useCallback((from: number, direction: 1 | -1 = 1): number | null => {
    let i = from + direction;
    while (i >= 0 && i < totalLen) {
      if (answerChars[i] !== " " && !locked.has(i) && !revealed.has(i)) return i;
      i += direction;
    }
    return null;
  }, [answerChars, locked, revealed, totalLen]);

  useEffect(() => {
    const first = letterIndices.find(i => !locked.has(i) && !revealed.has(i));
    setActiveIdx(first ?? null);
  }, [locked, revealed]); // eslint-disable-line

  const handleCheck = useCallback(() => {
    const guess = answerChars.map((correct, i) => {
      if (correct === " ") return " ";
      if (locked.has(i) || revealed.has(i)) return correct;
      return typed[i] || "";
    });

    if (guess.some((c, i) => answerChars[i] !== " " && !c)) return;

    const guessWord = guess.join("");
    const norm = (s: string) => s.trim().toLowerCase().replace(/[!?.״]/g, "");
    const isCorrect = data.answers.some(a => norm(a) === norm(guessWord));

    if (isCorrect) {
      setLocked(new Set(letterIndices));
      const score = calcScore(100, hintsUsed, maxHints);
      saveScore({ gameId, score, solved: true, hintsUsed, completedAt: Date.now() });
      window.dispatchEvent(new Event("score-updated"));
      setWon(true);
      setFinished(true);
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 600);

      const newLocked = new Set(locked);
      const newTyped = [...typed];
      letterIndices.forEach(i => {
        if (locked.has(i) || revealed.has(i)) return;
        if (typed[i] === answerChars[i]) {
          newLocked.add(i);
        } else {
          newTyped[i] = "";
        }
      });
      setLocked(newLocked);
      setTyped(newTyped);

      const next = attempts - 1;
      setAttempts(next);
      if (next <= 0) {
        saveScore({ gameId, score: 0, solved: false, hintsUsed, completedAt: Date.now() });
        setFinished(true);
      }
    }
  }, [typed, locked, revealed, answerChars, letterIndices, attempts, hintsUsed, data.answers, gameId]); // eslint-disable-line

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (finished) return;
    const key = e.key;

    if (key === "Enter") { handleCheck(); return; }

    if (key === "Backspace") {
      if (activeIdx === null) return;
      if (typed[activeIdx] && !locked.has(activeIdx) && !revealed.has(activeIdx)) {
        const next = [...typed]; next[activeIdx] = ""; setTyped(next);
      } else {
        const prev = nextFreeIdx(activeIdx, -1);
        if (prev !== null) {
          const next = [...typed]; next[prev] = ""; setTyped(next); setActiveIdx(prev);
        }
      }
      return;
    }

    if (key.length === 1) {
      if (activeIdx === null) return;
      const next = [...typed]; next[activeIdx] = key; setTyped(next);
      const nxt = nextFreeIdx(activeIdx, 1);
      if (nxt !== null) setActiveIdx(nxt);
    }
  }, [finished, activeIdx, typed, locked, revealed, handleCheck, nextFreeIdx]);

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  const handleCellClick = (i: number) => {
    if (locked.has(i) || revealed.has(i) || finished) return;
    setActiveIdx(i);
  };

  const handleHint = () => {
    if (hintsUsed >= maxHints) return;
    const target = (activeIdx !== null && !locked.has(activeIdx) && !revealed.has(activeIdx))
      ? activeIdx
      : letterIndices.find(i => !locked.has(i) && !revealed.has(i)) ?? null;
    if (target === null) return;
    const newRevealed = new Set(revealed); newRevealed.add(target);
    const newTyped = [...typed]; newTyped[target] = "";
    setRevealed(newRevealed); setTyped(newTyped);
    setHintsUsed(h => h + 1);
  };

  const handleClearAll = () => {
    const next = [...typed];
    letterIndices.forEach(i => { if (!locked.has(i) && !revealed.has(i)) next[i] = ""; });
    setTyped(next);
    const first = letterIndices.find(i => !locked.has(i) && !revealed.has(i));
    setActiveIdx(first ?? null);
  };

  const getCellState = (i: number) => {
    if (locked.has(i)) return "locked";
    if (revealed.has(i)) return "revealed";
    if (activeIdx === i) return "active";
    return "empty";
  };

  const allFilled = letterIndices.every(i => locked.has(i) || revealed.has(i) || typed[i]);

  const score = calcScore(100, hintsUsed, maxHints);
  const shareText = `🧠 פתרתי את "הגיונית"!\nניקוד: ${score}`;

  return (
    <div className="space-y-6">
      {/* שאלה */}
      <div className="bg-brand-surface border border-brand-border rounded-2xl p-5">
        <p className="text-brand-text text-lg leading-relaxed font-medium text-right">{data.question}</p>
      </div>

      {/* אותיות – כל מילה בשורה משלה */}
      <div className={`space-y-2 ${shake ? "animate-shake" : ""}`}>
        {words.map((word, wi) => (
          <div key={wi} className="flex justify-center gap-2" dir="rtl">
            {word.map(({ char, globalIdx }) => {
              const state = getCellState(globalIdx);
              const displayLetter =
                state === "locked" ? char :
                state === "revealed" ? char :
                typed[globalIdx] || "";
              return (
                <button
                  key={globalIdx}
                  onClick={() => handleCellClick(globalIdx)}
                  disabled={finished}
                  className={`
                    w-12 h-14 rounded-xl border-2 text-xl font-bold transition-all flex items-center justify-center
                    ${state === "locked"
                      ? "bg-green-500 border-green-500 text-white"
                      : state === "revealed"
                      ? "bg-green-200 border-green-400 text-green-800"
                      : state === "active"
                      ? "bg-brand-surface border-brand-accent text-brand-text shadow-sm shadow-brand-accent/30"
                      : "bg-brand-surface border-brand-border text-brand-text hover:border-brand-muted"}
                  `}
                >
                  {displayLetter}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* מקלדת */}
      {!finished && <VirtualKeyboard onKey={(k) => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: k, bubbles: true }));
      }} />}

      {/* כפתורים */}
      {!finished && (
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <button onClick={handleHint} disabled={hintsUsed >= maxHints}
            className="flex flex-col items-center gap-1 px-3 py-2 bg-brand-surface border border-brand-border rounded-xl text-brand-muted hover:text-brand-text hover:border-brand-accent transition-colors disabled:opacity-30 text-xs">
            <span className="text-lg">💡</span>
            <span>תנו לי רמז</span>
            <span>({maxHints - hintsUsed}/{maxHints})</span>
          </button>
          <div className="flex gap-2">
            <button onClick={handleClearAll}
              className="flex flex-col items-center gap-1 px-3 py-2 bg-brand-surface border border-brand-border rounded-xl text-brand-muted hover:text-brand-text transition-colors text-xs">
              <span className="text-lg">↺</span>
              <span>לנקות הכל</span>
            </button>
            <button onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "Backspace", bubbles: true }))}
              className="flex flex-col items-center gap-1 px-3 py-2 bg-brand-surface border border-brand-border rounded-xl text-brand-muted hover:text-brand-text transition-colors text-xs">
              <span className="text-lg">✕</span>
              <span>מחיקה</span>
            </button>
            <button onClick={handleCheck} disabled={!allFilled}
              className="flex flex-col items-center gap-1 px-4 py-2 bg-brand-accent hover:bg-brand-accentHover disabled:opacity-40 text-white rounded-xl transition-colors text-xs font-medium">
              <span className="text-lg">✓</span>
              <span>אישור</span>
            </button>
          </div>
        </div>
      )}

      {/* ניסיונות */}
      {!finished && (
        <div className="flex items-center justify-center gap-2">
          <span className="text-brand-muted text-sm">ניסיונות</span>
          <div className="flex gap-1.5">
            {Array.from({ length: MAX_ATTEMPTS }).map((_, i) => (
              <div key={i} className={`w-3 h-3 rounded-full ${i < attempts ? "bg-brand-accent" : "bg-brand-border"}`} />
            ))}
          </div>
        </div>
      )}

      {/* תוצאה */}
      {finished && (
        <GameResult solved={won} score={score} shareText={shareText} explanation={data.explanation} />
      )}
    </div>
  );
}

function VirtualKeyboard({ onKey }: { onKey: (k: string) => void }) {
  const rows = [
    ["פ", "ו", "ט", "א", "ר", "ק", "⌫"],
    ["ל", "ח", "י", "ע", "כ", "ג", "ד", "ש"],
    ["ת", "צ", "מ", "נ", "ה", "ב", "ס", "ז", "↵"],
  ];
  return (
    <div className="space-y-1.5 mt-2" dir="rtl">
      {rows.map((row, ri) => (
        <div key={ri} className="flex justify-center gap-1">
          {row.map((k) => (
            <button key={k}
              onPointerDown={(e) => {
                e.preventDefault();
                if (k === "⌫") onKey("Backspace");
                else if (k === "↵") onKey("Enter");
                else onKey(k);
              }}
              className={`h-11 rounded-lg border border-brand-border bg-brand-surface text-brand-text font-medium active:bg-brand-accent active:text-white active:border-brand-accent transition-colors select-none ${k === "⌫" || k === "↵" ? "px-3 text-sm" : "w-9 text-base"}`}>
              {k}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
