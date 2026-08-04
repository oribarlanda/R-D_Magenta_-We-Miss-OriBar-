"use client";
import { useState, useCallback } from "react";
import type { ConnectionsData, ConnectionGroup } from "@/types";
import { saveScore, calcScore } from "@/lib/storage";
import GameResult from "@/components/ui/GameResult";

// צבעים לפי 5 רמות קושי – טקסט שחור בכולם
const COLORS: Record<string, string> = {
  "very easy": "bg-green-200  border-green-300  text-black",
  "easy":      "bg-yellow-100 border-yellow-300 text-black",
  "medium":    "bg-orange-100 border-orange-300 text-black",
  "hard":      "bg-purple-200 border-purple-300 text-black",
  "expert":    "bg-red-200    border-red-300    text-black",
};
const LABELS: Record<string, string> = {
  "very easy": "קל מאוד",
  "easy":      "קל",
  "medium":    "בינוני",
  "hard":      "קשה",
  "expert":    "קשה מאוד",
};
const EMOJIS: Record<string, string> = {
  "very easy": "🟩🟩🟩🟩",
  "easy":      "🟨🟨🟨🟨",
  "medium":    "🟧🟧🟧🟧",
  "hard":      "🟪🟪🟪🟪",
  "expert":    "🟥🟥🟥🟥",
};

function shuffle<T>(a: T[]): T[] { return [...a].sort(() => Math.random() - 0.5); }

// כמה מילים מהבחירה נמצאות בקבוצה נתונה
function countMatches(group: ConnectionGroup, selected: string[]): number {
  return group.words.filter(w => selected.includes(w)).length;
}

export default function ConnectionsGame({ data }: { data: ConnectionsData }) {
  const [words, setWords] = useState<string[]>(() => shuffle(data.groups.flatMap(g => g.words)));
  const [selected, setSelected] = useState<string[]>([]);
  const [solved, setSolved] = useState<ConnectionGroup[]>([]);
  const [attempts, setAttempts] = useState(data.attempts);
  const [shake, setShake] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [activeHint, setActiveHint] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const [won, setWon] = useState(false);
  const [shareRows, setShareRows] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  const solvedWords = solved.flatMap(g => g.words);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const toggle = (w: string) => {
    if (solvedWords.includes(w)) return;
    setSelected(prev => prev.includes(w) ? prev.filter(x => x !== w) : prev.length < 4 ? [...prev, w] : prev);
  };

  const check = useCallback(() => {
    if (selected.length !== 4) return;
    const match = data.groups.find(g => !solved.includes(g) && g.words.every(w => selected.includes(w)));
    if (match) {
      const newSolved = [...solved, match];
      setSolved(newSolved);
      setShareRows(r => [...r, EMOJIS[match.difficulty] ?? "⬛⬛⬛⬛"]);
      setSelected([]);
      setActiveHint(null);
      if (newSolved.length === data.groups.length) {
        const score = calcScore(100, hintsUsed, data.groups.length);
        saveScore({ gameId: "connections", score, solved: true, hintsUsed, completedAt: Date.now() });
        window.dispatchEvent(new Event("score-updated"));
        setWon(true);
        setFinished(true);
      }
    } else {
      // בדוק אם יש קבוצה עם 3 התאמות מתוך הבחירה
      const threeMatch = data.groups.find(g => !solved.includes(g) && countMatches(g, selected) === 3);
      if (threeMatch) {
        showToast("כמעט! שלוש מתוך הארבע נכונים 🔥");
      }
      setShake(true);
      setTimeout(() => setShake(false), 600);
      const next = attempts - 1;
      setAttempts(next);
      if (next <= 0) {
        saveScore({ gameId: "connections", score: 0, solved: false, hintsUsed, completedAt: Date.now() });
        setFinished(true);
      }
    }
  }, [selected, solved, data, attempts, hintsUsed]);

const showHint = () => {
    const unsolvedGroups = data.groups.filter(g => !solved.includes(g));
    if (unsolvedGroups.length === 0) return;
    const random = unsolvedGroups[Math.floor(Math.random() * unsolvedGroups.length)];
    setActiveHint(random.hint);
    setHintsUsed(h => h + 1);
  };

  const score = calcScore(100, hintsUsed, data.groups.length);
  const shareText = `🎉 פתרתי את "מה הקשר"!\n\n${shareRows.join("\n")}\n\nניקוד: ${score}`;

  return (
    <div className="space-y-4 relative">

      {/* Toast notification */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-brand-accent text-white px-5 py-3 rounded-2xl shadow-lg font-medium text-sm animate-bounce-in">
          {toast}
        </div>
      )}

      {/* קבוצות שנפתרו */}
      {solved.map(g => (
        <div key={g.title} className={`rounded-xl border p-3 text-center animate-bounce-in ${COLORS[g.difficulty] ?? "bg-gray-200 border-gray-300 text-black"}`}>
          <div className="text-xs font-medium mb-1 opacity-60">{LABELS[g.difficulty] ?? g.difficulty}</div>
          <div className="font-bold">{g.title}</div>
          <div className="text-sm mt-1 opacity-70">{g.words.join(" · ")}</div>
        </div>
      ))}

      {!finished && (
        <>
          <div className={`grid grid-cols-4 gap-2 ${shake ? "animate-shake" : ""}`}>
            {words.filter(w => !solvedWords.includes(w)).map(w => (
              <button key={w} onClick={() => toggle(w)}
                className={`py-3 px-1 rounded-xl text-sm font-medium border transition-all select-none
                  ${selected.includes(w)
                    ? "bg-brand-accent border-brand-accent text-white scale-95"
                    : "bg-brand-surface border-brand-border text-brand-text hover:border-brand-accent"}`}>
                {w}
              </button>
            ))}
          </div>

          {activeHint && (
            <div className="flex gap-2 items-start bg-brand-surface border border-yellow-500/30 rounded-xl p-3 text-sm animate-slide-up">
              <span className="text-yellow-400">💡</span>
              <span className="text-brand-text">{activeHint}</span>
            </div>
          )}

          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-brand-muted text-sm">ניסיונות: {attempts}/{data.attempts}</span>
            <div className="flex gap-2">
              <button onClick={() => setWords(shuffle(words))} className="px-3 py-2 bg-brand-surface border border-brand-border rounded-xl text-sm text-brand-muted hover:text-brand-text transition-colors">ערבוב</button>
              <button onClick={() => setSelected([])} disabled={!selected.length} className="px-3 py-2 bg-brand-surface border border-brand-border rounded-xl text-sm text-brand-muted hover:text-brand-text transition-colors disabled:opacity-40">ניקוי</button>
              {data.groups.some(g => !solved.includes(g)) && (
                <button onClick={showHint} className="px-3 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-sm text-yellow-400 hover:bg-yellow-500/20 transition-colors">💡 רמז</button>
              )}
              <button onClick={check} disabled={selected.length !== 4} className="px-4 py-2 bg-brand-accent hover:bg-brand-accentHover disabled:opacity-40 text-white rounded-xl text-sm font-medium transition-colors">בדיקה</button>
            </div>
          </div>
        </>
      )}

      {finished && <GameResult solved={won} score={score} shareText={shareText} />}
    </div>
  );
}
