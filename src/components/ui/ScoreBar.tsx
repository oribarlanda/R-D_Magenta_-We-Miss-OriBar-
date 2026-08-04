"use client";
import { useEffect, useState } from "react";
import { getState, getTotalScore } from "@/lib/storage";

export default function ScoreBar() {
  const [total, setTotal] = useState(0);
  useEffect(() => {
    const update = () => setTotal(getTotalScore(getState()));
    update();
    window.addEventListener("score-updated", update);
    return () => window.removeEventListener("score-updated", update);
  }, []);
  if (total === 0) return null;
  return (
    <div className="bg-brand-surface border-b border-brand-border">
      <div className="max-w-2xl mx-auto px-4 py-2 flex items-center justify-between text-sm">
        <span className="text-brand-muted">ניקוד כולל</span>
        <span className="font-bold text-brand-accent">{total} נקודות</span>
      </div>
    </div>
  );
}
