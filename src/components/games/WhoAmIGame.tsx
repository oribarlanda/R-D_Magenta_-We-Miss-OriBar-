"use client";
import { useState, useRef, useEffect } from "react";
import type { WhoAmIData } from "@/types";
import { saveScore, calcScore } from "@/lib/storage";
import GameResult from "@/components/ui/GameResult";

const TOTAL_STEPS = 7;
// כמות "בלוקים" לאורך הצד - ככל שהמספר קטן יותר, הפיקסלים גדולים ומטושטשים יותר
// 0 = תמונה חדה וברורה לגמרי
const PIXEL_BLOCKS = [8, 11, 15, 20, 28, 40, 0];
// רזולוציית העבודה הפנימית של הקנבס (ריבוע)
const CANVAS_SIZE = 600;

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

  const hintsUsed = step - 1;
  const blocks = finished ? 0 : (PIXEL_BLOCKS[step - 1] ?? 0);

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

  // מציירים מחדש בכל שינוי שלב (או כשהתמונה נטענה)
  useEffect(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !imgLoaded) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;

    // חיתוך ריבועי מהמרכז (כמו object-cover)
    const srcSize = Math.min(img.naturalWidth, img.naturalHeight);
    const sx = (img.naturalWidth - srcSize) / 2;
    const sy = (img.naturalHeight - srcSize) / 2;

    if (blocks <= 0) {
      ctx.imageSmoothingEnabled = true;
      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      ctx.drawImage(img, sx, sy, srcSize, srcSize, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
      return;
    }

    // שלב 1: ציור התמונה בגודל זעיר לפי מספר הבלוקים
    const off = document.createElement("canvas");
    off.width = blocks;
    off.height = blocks;
    const offCtx = off.getContext("2d");
    if (!offCtx) return;
    offCtx.drawImage(img, sx, sy, srcSize, srcSize, 0, 0, blocks, blocks);

    // שלב 2: הגדלה בחזרה בלי החלקה - זה מה שיוצר את הריבועים החדים
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.drawImage(off, 0, 0, blocks, blocks, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
  }, [blocks, imgLoaded]);

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
            className="w-full h-full transition-opacity duration-300"
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
