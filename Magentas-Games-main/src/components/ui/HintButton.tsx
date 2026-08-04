"use client";

interface Props {
  hints: string[];
  hintsUsed: number;
  onHint: () => void;
  disabled?: boolean;
}

export default function HintButton({ hints, hintsUsed, onHint, disabled }: Props) {
  const remaining = hints.length - hintsUsed;
  return (
    <div className="space-y-2">
      {hints.slice(0, hintsUsed).map((hint, i) => (
        <div key={i} className="flex gap-2 items-start bg-brand-surface border border-yellow-500/30 rounded-xl p-3 text-sm animate-slide-up">
          <span className="text-yellow-400 mt-0.5">💡</span>
          <span className="text-brand-text">{hint}</span>
        </div>
      ))}
      {remaining > 0 && !disabled && (
        <button onClick={onHint} className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-yellow-400 text-sm hover:bg-yellow-500/20 transition-colors">
          💡 רמז ({remaining} נותרו)
        </button>
      )}
    </div>
  );
}
