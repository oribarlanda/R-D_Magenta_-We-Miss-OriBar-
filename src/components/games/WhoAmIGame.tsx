"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import type { WhoAmIData } from "@/types";
import { saveScore, calcScore } from "@/lib/storage";
import GameResult from "@/components/ui/GameResult";

const TOTAL_STEPS = 7;
const CANVAS_SIZE = 600;
// כמות "בלוקים" לאורך הצד - ככל שהמספר קטן יותר, הפיקסלים גדולים ומטושטשים יותר
// CANVAS_SIZE = תמונה חדה וברורה לגמרי
const PIXEL_BLOCKS = [8, 11, 15, 20, 28, 40, CANVAS_SIZE];
const TRANSITION_MS = 550; // משך אנימציית המעבר בין שלבים

interface WhoAmIDataWithImage extends WhoAmIData {
  image?: string;
}

export default function WhoAmIGame({ data }: { data: WhoAmIDataWithImage }) {
  const [step, setStep] = useState(1);
  const [input, setInput] = useState("");
  const [finished, setFinished] = useState(false);
  const [won, setWon] = useState(false);
  const [wrong, setWrong] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const currentBlocksRef = useRef<number>(PIXEL_BLOCKS[0]);
  const animFrameRef = useRef<number | null>(null);

  const hintsUsed = step - 1;
  const targetBlocks = finished ? CANVAS_SIZE : (PIXEL_BLOCKS[step - 1] ?? CANVAS_SIZE);

  const norm = (s: string) => s.trim().toLowerCase().replace(/['"״]/g, "");

  // טוענים את התמונה פעם אחת
  useEffect(() => {
    if (!data.image) return;
    const img = new window.Image();
    img.onload = () => {
      imgRef.current = img;
      setImgLoaded(true);
    };
    img.src = data.image;
  }, [data.image]);

  // מצייר על הקנבס רמת פיקסלציה נתונה
  const drawAtBlocks = useCallback((blocksVal: number) => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;

    const srcSize = Math.min(img.naturalWidth, img.naturalHeight);
    const sx = (img.naturalWidth - srcSize) / 2;
    const sy = (img.naturalHeight - srcSize) / 2;

    const b = Math.round(blocksVal);

    if (b >= CANVAS_SIZE) {
      ctx.imageSmoothingEnabled = true;
      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      ctx.drawImage(img, sx, sy, srcSize, srcSize, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
      return;
    }

    const off = document.createElement("canvas");
    off.width = Math.max(1, b);
    off.height = Math.max(1, b);
    const offCtx = off.getContext("2d");
    if (!offCtx) return;
    offCtx.drawImage(img, sx, sy, srcSize, srcSize, 0, 0, off.width, off.height);

    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.drawImage(off, 0, 0, off.width, off.height, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
  }, []);

  // אנימציה חלקה בין רמת הפיקסלציה הקודמת לחדשה
  useEffect(() => {
    if (!imgLoaded) return;

    const startBlocks = currentBlocksRef.current;
    const endBlocks = targetBlocks;

    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    if (startBlocks === endBlocks) {
      drawAtBlocks(endBlocks);
      return;
    }

    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / TRANSITION_MS, 1);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      const value = startBlocks + (endBlocks - startBlocks) * eased;

      currentBlocksRef.current = value;
      drawAtBlocks(value);

      if (t < 1) {
        animFrameRef.current = requestAnimationFrame(tick);
      } else {
        currentBlocksRef.current = endBlocks;
      }
    };

    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [targetBlocks, imgLoaded, drawAtBlocks]);

  const check = () => {
    if (!input.trim()) return;
    if (data.acceptedAnswers.some(a => norm(a) === norm(input))) {
      const score = calcScore(100, hintsUsed, TOTAL_STEPS - 1);
      saveScore({ gameId: "who-am-i", score, solved: true, hintsUsed, completedAt: Date.now() });
      window.dispatchEvent(new Event("score-updated"));
      setWon(true);
      setFinished(true);
    } else {
      setWrong(true);
      setTimeout(() => setWrong(false), 600);
      if (step < TOTAL_STEPS) {
        setStep(s => s + 1);
      } else {
        saveScore({ gameId: "who-am-i", score: 0, solved: false, hintsUsed, completedAt: Date.now() });
        setFinished(true);
      }
    }
    setInput("");
  };

  const score = calcScore(100, hintsUsed, TOTAL_STEPS - 1);
  const shareText = `🕵️ פתרתי את "מי אני"!\nניחשתי בשלב ${step} מתוך ${TOTAL_STEPS}\nניקוד: ${score}`;

  return (
    <div className="space-y-4">
      <p className="text-brand-muted text-sm text-center">גלו מי בתמונה בכמה שפחות צעדים - שימו לב! כל צעד נוסף מוריד ניקוד</p>

      {/* תמונה */}
      <div
        className="relative w-full overflow-hidden rounded-2xl border border-brand-border bg-brand-surface"
        style={{ aspectRatio: "1 / 1" }}
      >
        {data.image ? (
          <canvas
            ref={canvasRef}
            className="w-full h-full"
            style={{ imageRendering: "pixelated" }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-brand-muted text-sm p-8 text-center">
            העלו תמונה ל-public/whoami.jpg
          </div>
        )}

        {/* כפתור "לתמונה ברורה יותר" */}
        {!finished && step < TOTAL_STEPS && (
          <button
            onClick={() => setStep(s => s + 1)}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-black font-medium rounded-full text-sm shadow-lg transition-colors whitespace-nowrap"
          >
            לתמונה ברורה יותר ‹
          </button>
        )}
      </div>

      {/* מונה שלבים */}
      <div className="flex items-center justify-center gap-2">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => {
          const stepNum = TOTAL_STEPS - i;
          const isActive = stepNum === step;
          const isPast = stepNum < step;
          return (
            <div
              key={stepNum}
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
                ${isActive
                  ? "bg-yellow-400 text-black scale-110"
                  : isPast
                  ? "bg-brand-border text-brand-muted"
                  : "bg-brand-surface border border-brand-border text-brand-muted"}`}
            >
              {stepNum}
            </div>
          );
        })}
      </div>

      {/* שדה ניחוש */}
      {!finished && (
        <div className={`flex gap-2 ${wrong ? "animate-shake" : ""}`}>
          <button
            onClick={check}
            disabled={!input.trim()}
            className="px-5 py-3 bg-brand-accent hover:bg-brand-accentHover disabled:opacity-40 text-white rounded-xl font-medium transition-colors shrink-0"
          >
            ניחוש
          </button>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && check()}
            placeholder="מי בתמונה?"
            className="flex-1 bg-brand-surface border border-brand-border rounded-xl px-4 py-3 text-brand-text placeholder-brand-muted outline-none focus:border-brand-accent transition-colors text-right"
            dir="rtl"
            autoComplete="off"
          />
        </div>
      )}

      {/* תוצאה */}
      {finished && (
        <div className="space-y-3">
          <div className="bg-brand-surface border border-brand-border rounded-xl px-4 py-3 text-sm">
            <span className="text-brand-muted">התשובה: </span>
            <span className="text-brand-text font-bold">{data.answer}</span>
          </div>
          <GameResult solved={won} score={score} shareText={shareText} />
        </div>
      )}
    </div>
  );
}
