"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import type { ChainData } from "@/types";
import { saveScore, calcScore } from "@/lib/storage";
import GameResult from "@/components/ui/GameResult";

interface ChainLink {
  answer: string;
  hint: string;
  explanation?: string;
}

interface ChainDataExtended extends Omit<ChainData, "links"> {
  links: ChainLink[];
  distractors?: string[];
  endExplanation?: string;
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

const CIRCLE_SIZE = 64;
const MAX_HINTS = 2;

type Side = "left" | "right";
interface PoolSlot {
  word: string;
  side: Side;
  pos: number;
}

function buildPoolSlots(words: string[]): PoolSlot[] {
  const shuffled = shuffle(words);
  return shuffled.map((word, i) => ({
    word,
    side: i % 2 === 0 ? "left" : "right",
    pos: Math.floor(i / 2),
  }));
}

export default function ChainGame({ data }: { data: ChainDataExtended }) {
  const answers = data.links.map(l => l.answer);
  const allWords = [...answers, ...(data.distractors ?? [])];
  const total = answers.length;

  const [poolSlots, setPoolSlots] = useState<PoolSlot[]>(() => buildPoolSlots(allWords));
  const [slots, setSlots] = useState<(string | null)[]>(Array(total).fill(null));
  const [locked, setLocked] = useState<boolean[]>(Array(total).fill(false));
  const [hintsUsed, setHintsUsed] = useState(0);
  const [finished, setFinished] = useState(false);
  const [won, setWon] = useState(false);
  const [dragState, setDragState] = useState<{ word: string; x: number; y: number } | null>(null);

  const dragging = useRef<{ word: string; from: "pool" | "slot"; slotIdx?: number } | null>(null);
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);

  const norm = (s: string) => s.trim().toLowerCase();

  const leftPool = poolSlots.filter(s => s.side === "left").sort((a, b) => a.pos - b.pos);
  const rightPool = poolSlots.filter(s => s.side === "right").sort((a, b) => a.pos - b.pos);
  const maxPoolRows = Math.max(leftPool.length, rightPool.length);

  const addToPool = useCallback((word: string, existingSlots: PoolSlot[]) => {
    const usedPositions = { left: new Set<number>(), right: new Set<number>() };
    existingSlots.forEach(s => usedPositions[s.side].add(s.pos));
    for (let pos = 0; pos < 10; pos++) {
      for (const side of ["left", "right"] as Side[]) {
        if (!usedPositions[side].has(pos)) return { word, side, pos };
      }
    }
    return { word, side: "left" as Side, pos: existingSlots.length };
  }, []);

  const checkWin = useCallback((newLocked: boolean[]) => {
    if (newLocked.every(Boolean)) {
      const score = calcScore(100, hintsUsed, data.links.length);
      saveScore({ gameId: "chain", score, solved: true, hintsUsed, completedAt: Date.now() });
      window.dispatchEvent(new Event("score-updated"));
      setWon(true);
      setFinished(true);
    }
  }, [hintsUsed, data.links.length]);

  const placeWord = useCallback((
    word: string, fromPool: boolean, fromSlotIdx: number | undefined, toSlotIdx: number
  ) => {
    if (locked[toSlotIdx]) return;
    setSlots(prevSlots => {
      const prevInSlot = prevSlots[toSlotIdx];
      const newSlots = [...prevSlots];
      newSlots[toSlotIdx] = word;
      if (fromPool) {
        setPoolSlots(prev => {
          const next = prev.filter(s => s.word !== word);
          if (prevInSlot !== null) return [...next, addToPool(prevInSlot, next)];
          return next;
        });
      } else if (fromSlotIdx !== undefined) {
        newSlots[fromSlotIdx] = prevInSlot;
      }
      return newSlots;
    });
  }, [locked, addToPool]);

  const returnWordToPool = useCallback((slotIdx: number) => {
    setSlots(prevSlots => {
      if (locked[slotIdx] || prevSlots[slotIdx] === null) return prevSlots;
      const word = prevSlots[slotIdx]!;
      const newSlots = [...prevSlots]; newSlots[slotIdx] = null;
      setPoolSlots(prev => [...prev, addToPool(word, prev)]);
      return newSlots;
    });
  }, [locked, addToPool]);

  const handleCheck = useCallback(() => {
    setSlots(prevSlots => {
      const newLocked = [...locked];
      const newSlots = [...prevSlots];
      const returnToPool: string[] = [];
      prevSlots.forEach((word, i) => {
        if (locked[i]) return;
        if (word !== null && norm(word) === norm(answers[i])) { newLocked[i] = true; }
        else if (word !== null) { returnToPool.push(word); newSlots[i] = null; }
      });
      setLocked(newLocked);
      setPoolSlots(prev => {
        let next = [...prev];
        returnToPool.forEach(word => { next = [...next, addToPool(word, next)]; });
        return next;
      });
      checkWin(newLocked);
      return newSlots;
    });
  }, [locked, answers, checkWin, addToPool]);

  const handleHint = () => {
    if (hintsUsed >= MAX_HINTS) return;
    const idx = answers.findIndex((ans, i) => !locked[i] && slots[i] !== ans);
    if (idx === -1) return;
    const correctWord = answers[idx];
    const prevInSlot = slots[idx];
    const newSlots = [...slots]; newSlots[idx] = correctWord;
    const newLocked = [...locked]; newLocked[idx] = true;
    setPoolSlots(prev => {
      let next = prev.filter(s => s.word !== correctWord);
      if (prevInSlot !== null && prevInSlot !== correctWord) next = [...next, addToPool(prevInSlot, next)];
      return next;
    });
    setSlots(newSlots); setLocked(newLocked);
    setHintsUsed(h => h + 1); setDragState(null);
    checkWin(newLocked);
  };

  const handleClear = () => {
    setSlots(prevSlots => {
      const toReturn = prevSlots.filter((s, i) => !locked[i] && s !== null) as string[];
      setPoolSlots(prev => {
        let next = [...prev];
        toReturn.forEach(word => { next = [...next, addToPool(word, next)]; });
        return next;
      });
      return prevSlots.map((s, i) => locked[i] ? s : null);
    });
    setDragState(null);
  };

  const onMouseDown = (e: React.MouseEvent, word: string, from: "pool" | "slot", slotIdx?: number) => {
    if (finished) return;
    e.preventDefault();
    dragging.current = { word, from, slotIdx };
    setDragState({ word, x: e.clientX, y: e.clientY });
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      setDragState(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : null);
    };
    const onMouseUp = (e: MouseEvent) => {
      if (!dragging.current) return;
      const { word, from, slotIdx: fromSlot } = dragging.current;
      dragging.current = null; setDragState(null);
      for (let i = 0; i < slotRefs.current.length; i++) {
        const el = slotRefs.current[i]; if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
          if (from === "pool") placeWord(word, true, undefined, i);
          else if (fromSlot !== undefined && fromSlot !== i) placeWord(word, false, fromSlot, i);
          return;
        }
      }
      if (from === "slot" && fromSlot !== undefined) returnWordToPool(fromSlot);
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => { window.removeEventListener("mousemove", onMouseMove); window.removeEventListener("mouseup", onMouseUp); };
  }, [placeWord, returnWordToPool]);

  const onTouchStart = (e: React.TouchEvent, word: string, from: "pool" | "slot", slotIdx?: number) => {
    if (finished) return;
    const touch = e.touches[0];
    dragging.current = { word, from, slotIdx };
    setDragState({ word, x: touch.clientX, y: touch.clientY });
  };

  useEffect(() => {
    const onTouchMove = (e: TouchEvent) => {
      if (!dragging.current) return;
      e.preventDefault();
      const touch = e.touches[0];
      setDragState(prev => prev ? { ...prev, x: touch.clientX, y: touch.clientY } : null);
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (!dragging.current) return;
      const touch = e.changedTouches[0];
      const { word, from, slotIdx: fromSlot } = dragging.current;
      dragging.current = null; setDragState(null);
      for (let i = 0; i < slotRefs.current.length; i++) {
        const el = slotRefs.current[i]; if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (touch.clientX >= rect.left && touch.clientX <= rect.right && touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
          if (from === "pool") placeWord(word, true, undefined, i);
          else if (fromSlot !== undefined && fromSlot !== i) placeWord(word, false, fromSlot, i);
          return;
        }
      }
      if (from === "slot" && fromSlot !== undefined) returnWordToPool(fromSlot);
    };
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);
    return () => { window.removeEventListener("touchmove", onTouchMove); window.removeEventListener("touchend", onTouchEnd); };
  }, [placeWord, returnWordToPool]);

  const allFilled = slots.every((s, i) => locked[i] || s !== null);
  const score = calcScore(100, hintsUsed, data.links.length);
  const shareText = `⛓️ פתרתי את "השרשרת"!\n${data.start} → ... → ${data.end}\nניקוד: ${score}`;
  const circleBase = `rounded-full border-2 flex items-center justify-center text-sm font-bold text-center leading-tight select-none transition-all`;

  return (
    <div className="space-y-5">

      {/* Ghost */}
      {dragState && (
        <div style={{
          position: "fixed",
          left: dragState.x - CIRCLE_SIZE / 2, top: dragState.y - CIRCLE_SIZE / 2,
          width: CIRCLE_SIZE, height: CIRCLE_SIZE,
          pointerEvents: "none", zIndex: 9999,
        }} className="rounded-full border-2 border-brand-accent bg-brand-accent text-white flex items-center justify-center text-sm font-bold opacity-90 shadow-lg">
          {dragState.word}
        </div>
      )}

      {!finished ? (
        /* ── מצב משחק ── */
        <div className="flex items-start justify-center" style={{ gap: CIRCLE_SIZE }}>
          {/* שמאל */}
          <div className="relative" style={{ width: CIRCLE_SIZE, minHeight: (maxPoolRows * (CIRCLE_SIZE + 12)) + 80 }}>
            {leftPool.map(({ word, pos }) => (
              <div key={word}
                style={{ position: "absolute", top: 80 + pos * (CIRCLE_SIZE + 12), right: 0, width: CIRCLE_SIZE, height: CIRCLE_SIZE, opacity: dragState?.word === word ? 0.3 : 1 }}
                onMouseDown={e => onMouseDown(e, word, "pool")}
                onTouchStart={e => onTouchStart(e, word, "pool")}
                className={`${circleBase} cursor-grab active:cursor-grabbing bg-yellow-100 border-yellow-400 text-yellow-900`}>
                {word}
              </div>
            ))}
          </div>

          {/* שרשרת */}
          <div className="flex flex-col items-center shrink-0">
            <div style={{ width: CIRCLE_SIZE, height: CIRCLE_SIZE }} className="rounded-full bg-gray-800 flex items-center justify-center text-white text-sm font-bold">{data.start}</div>
            {data.links.map((_, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-px h-3 border-l-2 border-dashed border-brand-border" />
                <div ref={el => { slotRefs.current[i] = el; }}
                  style={{ width: CIRCLE_SIZE, height: CIRCLE_SIZE }}
                  onMouseDown={slots[i] && !locked[i] ? e => onMouseDown(e, slots[i]!, "slot", i) : undefined}
                  onTouchStart={slots[i] && !locked[i] ? e => onTouchStart(e, slots[i]!, "slot", i) : undefined}
                  className={`${circleBase} ${
                    locked[i] ? "bg-green-400 border-green-400 text-white cursor-default"
                    : slots[i] ? dragState?.word === slots[i]
                      ? "border-brand-accent border-dashed bg-brand-surface opacity-40 cursor-grab"
                      : "bg-brand-accent border-brand-accent text-white cursor-grab active:cursor-grabbing"
                    : dragState ? "border-brand-accent border-dashed bg-brand-accent/10 cursor-default"
                    : "border-dashed border-brand-muted bg-brand-surface cursor-default"
                  }`}>
                  {(dragState?.word === slots[i] && !locked[i]) ? "" : (slots[i] ?? "")}
                </div>
              </div>
            ))}
            <div className="w-px h-3 border-l-2 border-dashed border-brand-border" />
            <div style={{ width: CIRCLE_SIZE, height: CIRCLE_SIZE }} className="rounded-full bg-gray-800 flex items-center justify-center text-white text-sm font-bold">{data.end}</div>
          </div>

          {/* ימין */}
          <div className="relative" style={{ width: CIRCLE_SIZE, minHeight: (maxPoolRows * (CIRCLE_SIZE + 12)) + 80 }}>
            {rightPool.map(({ word, pos }) => (
              <div key={word}
                style={{ position: "absolute", top: 80 + pos * (CIRCLE_SIZE + 12), left: 0, width: CIRCLE_SIZE, height: CIRCLE_SIZE, opacity: dragState?.word === word ? 0.3 : 1 }}
                onMouseDown={e => onMouseDown(e, word, "pool")}
                onTouchStart={e => onTouchStart(e, word, "pool")}
                className={`${circleBase} cursor-grab active:cursor-grabbing bg-yellow-100 border-yellow-400 text-yellow-900`}>
                {word}
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* ── מצב סיום: שרשרת עם הסברים ── */
        <div className="flex justify-center animate-slide-up">
          <div className="relative flex flex-col items-center" style={{ width: "100%", maxWidth: 360 }}>

            {/* התחלה */}
            <div style={{ width: CIRCLE_SIZE, height: CIRCLE_SIZE }}
              className="rounded-full bg-gray-800 flex items-center justify-center text-white text-sm font-bold z-10">
              {data.start}
            </div>

            {/* חוליות + ההסברים שלהן */}
            {data.links.map((link, i) => {
              const isLeft = i % 2 === 0;
              return (
                <div key={i} className="flex flex-col items-center w-full">
                  <div className="relative flex items-center justify-center w-full" style={{ height: 56 }}>
                    <div className="absolute left-1/2 top-0 bottom-0 w-px border-l-2 border-dashed border-green-300" style={{ transform: "translateX(-50%)" }} />
                    {link.explanation && (
                      <div
                        className={`absolute text-xs text-brand-muted bg-brand-surface border border-brand-border rounded-2xl px-3 py-2 leading-snug ${isLeft ? "right-[52%] text-right" : "left-[52%] text-left"}`}
                        style={{ maxWidth: "42%" }} dir="rtl"
                      >
                        {link.explanation}
                      </div>
                    )}
                  </div>
                  <div style={{ width: CIRCLE_SIZE, height: CIRCLE_SIZE }}
                    className="rounded-full bg-green-400 flex items-center justify-center text-white text-sm font-bold z-10">
                    {link.answer}
                  </div>
                </div>
              );
            })}

            {/* קו + הסבר לסוף */}
            <div className="relative flex items-center justify-center w-full" style={{ height: 56 }}>
              <div className="absolute left-1/2 top-0 bottom-0 w-px border-l-2 border-dashed border-green-300" style={{ transform: "translateX(-50%)" }} />
              {data.endExplanation && (
                <div
                  className={`absolute text-xs text-brand-muted bg-brand-surface border border-brand-border rounded-2xl px-3 py-2 leading-snug ${data.links.length % 2 === 0 ? "right-[52%] text-right" : "left-[52%] text-left"}`}
                  style={{ maxWidth: "42%" }} dir="rtl"
                >
                  {data.endExplanation}
                </div>
              )}
            </div>

            {/* סוף */}
            <div style={{ width: CIRCLE_SIZE, height: CIRCLE_SIZE }}
              className="rounded-full bg-gray-800 flex items-center justify-center text-white text-sm font-bold z-10">
              {data.end}
            </div>
          </div>
        </div>
      )}

      {/* כפתורים */}
      {!finished && (
        <div className="flex gap-3 justify-center flex-wrap">
          <button onClick={handleHint} disabled={hintsUsed >= MAX_HINTS || locked.every(Boolean)}
            className="flex items-center gap-2 px-4 py-2.5 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-yellow-400 text-sm hover:bg-yellow-500/20 transition-colors disabled:opacity-30">
            💡 רמז ({MAX_HINTS - hintsUsed}/{MAX_HINTS})
          </button>
          <button onClick={handleClear}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-surface border border-brand-border rounded-xl text-brand-muted text-sm hover:text-brand-text transition-colors">
            ↺ ניקוי לוח
          </button>
          <button onClick={handleCheck} disabled={!allFilled}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-accent hover:bg-brand-accentHover disabled:opacity-40 text-white rounded-xl text-sm font-medium transition-colors">
            ✓ אישור
          </button>
        </div>
      )}

      {finished && (
        <div className="mt-4">
          <GameResult solved={won} score={score} shareText={shareText} />
        </div>
      )}
    </div>
  );
}
